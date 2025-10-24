// backend/controllers/meditraceController.js
import Batch from '../models/batchModel.js';
import { uploadJsonToIPFS } from '../utils/ipfsClient.js';
import { createBatchToken, submitHcsLog, associateTokenToAccount, transferToken, getTokenInfoFromMirror, getHcsMessagesForTopic } from '../utils/hederaMeditrace.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

/**
 * POST /api/meditrace/batch
 * body: { productName, batchNumber, quantity, manufacturingDate, expiryDate, manufacturingFacility, metadata (optional object), manufacturerDid }
 */
export const createBatch = async (req, res) => {
  try {
    const {
      productName,
      batchNumber,
      quantity = 1,
      manufacturingDate,
      expiryDate,
      manufacturingFacility,
      metadata = {},
      manufacturerDid,
    } = req.body;

    if (!productName || !batchNumber || !manufacturerDid) {
      return res.status(400).json({ message: 'Missing required fields: productName, batchNumber, manufacturerDid' });
    }

    // Check uniqueness
    const existing = await Batch.findOne({ batchNumber });
    if (existing) {
      return res.status(409).json({ message: 'Batch number already exists' });
    }

    // Prepare metadata payload for IPFS
    const payload = {
      id: uuidv4(),
      productName,
      batchNumber,
      quantity,
      manufacturingDate,
      expiryDate,
      manufacturingFacility,
      manufacturerDid,
      metadata,
      createdAt: new Date().toISOString(),
    };

    // Upload to IPFS
    const ipfsResult = await uploadJsonToIPFS(payload);
    const cid = ipfsResult.cid; // Extract just the CID string

    // Mint HTS token for the batch (symbol derived)
    const safeSymbol = productName.replace(/\s+/g, '').toUpperCase().slice(0, 8);
    const tokenId = await createBatchToken({ name: `${productName} - ${batchNumber}`, symbol: `${safeSymbol}_${batchNumber.slice(0,6)}`, initialSupply: Number(quantity) });

    // HCS log
    const hcsPayload = {
      event: 'BATCH_CREATED',
      productName,
      batchNumber,
      tokenId,
      ipfsCid: cid,
      quantity,
      manufacturerDid,
      timestamp: new Date().toISOString(),
    };
    const hcsMessageId = await submitHcsLog(hcsPayload);

    // Generate QR code for the batch
    const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${batchNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl);

    // Save to DB
    const batch = await Batch.create({
      productName,
      batchNumber,
      quantity,
      manufacturingDate,
      expiryDate,
      manufacturingFacility,
      ipfsCid: cid,
      tokenId,
      currentHolder: manufacturerDid,
      hcsMessageId,
      trackingNumber: batchNumber, // Using batchNumber as tracking number
      qrCode: qrCodeDataUrl,
      history: [
        {
          actorDid: manufacturerDid,
          action: 'MANUFACTURED',
          location: manufacturingFacility,
          timestamp: new Date(),
          hcsMessageId,
          notes: 'Batch created and token minted',
        },
      ],
    });

    return res.status(201).json({
      message: 'Batch created successfully. QR code generated for product tracking.',
      batch: {
        id: batch._id,
        productName: batch.productName,
        batchNumber: batch.batchNumber,
        trackingNumber: batch.trackingNumber,
        tokenId: batch.tokenId,
        ipfsCid: batch.ipfsCid,
        hcsMessageId: batch.hcsMessageId,
        quantity: batch.quantity,
        qrCode: qrCodeDataUrl,
        trackingUrl,
      },
    });
  } catch (err) {
    console.error('createBatch error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


/**
 * POST /api/meditrace/event
 * body: { batchNumber, action, actorDid, location, notes, toAccountId (optional), toAccountPrivateKey (optional) }
 * actions: 'TRANSFERRED', 'RECEIVED', 'REDEEMED', etc.
 */
export const addEvent = async (req, res) => {
  try {
    const { batchNumber, action, actorDid, location = '', notes = '', toAccountId, toAccountPrivateKey } = req.body;
    if (!batchNumber || !action || !actorDid) return res.status(400).json({ message: 'Missing required fields' });

    const batch = await Batch.findOne({ batchNumber });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    // Optionally perform token transfer if action implies ownership change and toAccountId provided
    let transferResult = null;
    if (toAccountId && batch.tokenId && (action === 'TRANSFERRED' || action === 'RECEIVED')) {
      // Option 1: associate the receiver (if needed) - warning: should be done by receiver in prod
      try {
        await associateTokenToAccount({ tokenId: batch.tokenId, accountId: toAccountId, accountPrivateKey: toAccountPrivateKey });
      } catch (err) {
        // ignore association errors in case already associated
        console.warn('associate error (non-blocking):', err.message || err.toString());
      }

      // Attempt transfer: from current holder (treasury/operator) to toAccountId
      // NOTE: This assumes operator (treasury) holds tokens.
      transferResult = await transferToken({
        tokenId: batch.tokenId,
        fromAccountId: process.env.HEDERA_ACCOUNT_ID,
        toAccountId,
        amount: 1, // or define logic for quantity
      });

      // Update currentHolder after transfer
      batch.currentHolder = toAccountId;
    }

    // Log event to HCS
    const hcsPayload = {
      event: action,
      batchNumber,
      tokenId: batch.tokenId,
      actorDid,
      location,
      notes,
      toAccountId: toAccountId || null,
      timestamp: new Date().toISOString(),
    };
    const hcsMessageId = await submitHcsLog(hcsPayload);

    // Append to history in DB
    batch.history.push({
      actorDid,
      action,
      location,
      timestamp: new Date(),
      notes,
      hcsMessageId,
    });

    await batch.save();

    return res.status(200).json({
      message: 'Event recorded',
      transferResult,
      hcsMessageId,
    });
  } catch (err) {
    console.error('addEvent error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/meditrace/batch/:batchNumber
 */
export const getBatchByNumber = async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const batch = await Batch.findOne({ batchNumber });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    return res.status(200).json({ batch });
  } catch (err) {
    console.error('getBatchByNumber error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/meditrace/verify/:tokenId
 * - Query Mirror Node for token info
 * - Return last HCS events for the batch (by tokenId matched in HCS messages)
 */
export const verifyToken = async (req, res) => {
  try {
    const { tokenId } = req.params;
    if (!tokenId) return res.status(400).json({ message: 'Missing tokenId' });

    // Fetch token info from mirror node
    const tokenInfo = await getTokenInfoFromMirror(tokenId);

    // Optionally fetch HCS messages and filter by tokenId in messages
    const messages = await getHcsMessagesForTopic({ topicId: process.env.HEDERA_TOPIC_ID, limit: 50 });
    const relevant = (messages?.messages || []).filter(m => {
      try {
        const parsed = JSON.parse(Buffer.from(m.message, 'base64').toString('utf8'));
        return parsed.tokenId === tokenId || parsed.batchNumber && parsed.tokenId && parsed.tokenId === tokenId;
      } catch (e) {
        return false;
      }
    });

    return res.status(200).json({
      tokenInfo,
      hcsEvents: relevant.map(r => {
        const parsed = JSON.parse(Buffer.from(r.message, 'base64').toString('utf8'));
        return {
          consensusTimestamp: r.consensus_timestamp,
          transactionId: r.transaction_id,
          parsed,
        };
      })
    });
  } catch (err) {
    console.error('verifyToken error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * POST /api/meditrace/report
 * body: { batchNumber, reporterDid, issueType, description, location, evidence }
 * Report counterfeit or quality issues to government health service
 */
export const reportIssue = async (req, res) => {
  try {
    const { batchNumber, reporterDid, issueType, description, location, evidence } = req.body;

    if (!batchNumber || !reporterDid || !issueType || !description || !location) {
      return res.status(400).json({ message: 'Missing required fields: batchNumber, reporterDid, issueType, description, location' });
    }

    const batch = await Batch.findOne({ batchNumber });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Create report payload for HCS
    const reportPayload = {
      event: 'ISSUE_REPORTED',
      reportId: uuidv4(),
      batchNumber,
      tokenId: batch.tokenId,
      reporterDid,
      issueType, // e.g., 'counterfeit', 'temperature', 'damaged', 'expired'
      description,
      location,
      evidence: evidence || [],
      timestamp: new Date().toISOString(),
    };

    // Log to HCS
    const hcsMessageId = await submitHcsLog(reportPayload);

    // Add to batch history
    batch.history.push({
      actorDid: reporterDid,
      action: 'ISSUE_REPORTED',
      location,
      timestamp: new Date(),
      notes: `${issueType}: ${description}`,
      hcsMessageId,
    });

    // Mark batch as flagged if counterfeit
    if (issueType === 'counterfeit') {
      batch.isFlagged = true;
      batch.flagReason = description;
    }

    await batch.save();

    return res.status(201).json({
      message: 'Issue reported successfully. Government health service has been notified.',
      report: {
        reportId: reportPayload.reportId,
        batchNumber,
        issueType,
        hcsMessageId,
        reportedAt: reportPayload.timestamp,
      },
    });
  } catch (err) {
    console.error('reportIssue error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/meditrace/batches
 * Get all batches (with optional filters for pharma companies to see their products)
 */
export const getAllBatches = async (req, res) => {
  try {
    const { manufacturerDid, limit = 50, offset = 0 } = req.query;

    const query = {};
    if (manufacturerDid) {
      query.currentHolder = manufacturerDid;
    }

    const batches = await Batch.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Batch.countDocuments(query);

    return res.status(200).json({
      batches,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + batches.length < total,
      },
    });
  } catch (err) {
    console.error('getAllBatches error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};