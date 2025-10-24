import Claim from '../models/claimModel.js';
import { User } from '../models/userModel.js';
import MedicalRecord from '../models/recordModel.js';
import { submitToHCS } from '../utils/hedera.js';
import { transferHTSToken } from '../utils/hederaPayments.js'; // payout helper (below)
import { validateRecordAuthenticity, fetchHcsMessagesByTransaction, decodeMirrorMessage } from '../utils/mirrorIpfs.js';
/**
 * File a claim (patient)
 * POST /api/claims
 */
export const fileClaim = async (req, res) => {
  try {
    const claimantId = req.user._id;
    const { recordId, insurerId, amountRequested, currency, description, attachments } = req.body;

    // Basic validations
    const record = await MedicalRecord.findById(recordId);
    if (!record) return res.status(404).json({ error: 'Medical record not found' });
    if (record.patient.toString() !== claimantId.toString()) {
      return res.status(403).json({ error: 'You can only file claims for your own records' });
    }

    const insurer = await User.findById(insurerId);
    if (!insurer || insurer.role !== 'insurer') {
      return res.status(400).json({ error: 'Invalid insurer' });
    }

    const claim = await Claim.create({
      claimant: claimantId,
      insurer: insurerId,
      record: recordId,
      amountRequested,
      currency: currency || 'NGN',
      description,
      attachments: attachments || [],
    });

    // Log claim event to HCS
    const hcsEvent = {
      eventType: 'CLAIM_CREATED',
      claimId: claim._id.toString(),
      claimantDID: req.user.did || null,
      recordHcsMessageId: record.hcsMessageId || null,
      insurerDID: insurer.did || null,
      amountRequested,
      currency: currency || 'NGN',
      timestamp: new Date().toISOString(),
    };
    const hcsMessageId = await submitToHCS(hcsEvent);

    claim.hcsEvents.push({
      eventType: 'CLAIM_CREATED',
      hcsMessageId,
      timestamp: new Date(),
    });
    await claim.save();

    return res.status(201).json({ message: 'Claim filed', claimId: claim._id, hcsMessageId });
  } catch (err) {
    console.error('fileClaim error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * List claims - role aware
 * GET /api/claims
 */
export const listClaims = async (req, res) => {
  try {
    const user = req.user;
    let filter = {};
    if (user.role === 'patient') filter = { claimant: user._id };
    else if (user.role === 'insurer') filter = { insurer: user._id };
    // admin / gov / system admin can pass query params or see all

    const claims = await Claim.find(filter)
      .populate('claimant', 'name email did')
      .populate('insurer', 'name email did')
      .populate('record', 'title hcsMessageId')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json({ claims });
  } catch (err) {
    console.error('listClaims error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get claim details
 * GET /api/claims/:id
 */
export const getClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimant', 'name email did')
      .populate('insurer', 'name email did')
      .populate('record');

    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    // Access control: patient/insurer/admin allowed
    const user = req.user;
    if (user.role === 'patient' && claim.claimant._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (user.role === 'insurer' && claim.insurer._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    return res.json({ claim });
  } catch (err) {
    console.error('getClaim error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Approve claim & payout (insurer)
 * POST /api/claims/:id/approve
 */
export const approveClaim = async (req, res) => {
  
  try {
    const claimId = req.params.id;
    const insurerUser = req.user;
    if (insurerUser.role !== 'insurer') return res.status(403).json({ error: 'Only insurers can approve claims' });

    const { amountApproved = null, payoutMethod = 'HTS_TOKEN', payoutDetails = {} } = req.body;
    const claim = await Claim.findById(claimId).populate('claimant').populate('insurer').populate('record');
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (claim.insurer._id.toString() !== insurerUser._id.toString()) {
      return res.status(403).json({ error: 'You are not assigned to this claim' });
    }

    const validation = await validateRecordAuthenticity({ record: claim.record });
    if (!validation.success) {
      return res.status(400).json({ error: 'Record validation failed', validation });
    }
    
    if (claim.status !== 'PENDING') return res.status(400).json({ error: 'Claim already processed' });

    // Approve: set fields
    claim.status = 'APPROVED';
    claim.amountApproved = amountApproved || claim.amountRequested;

    // Log approval to HCS
    const approvalEvent = {
      eventType: 'CLAIM_APPROVED',
      claimId: claim._id.toString(),
      insurerDID: insurerUser.did || null,
      claimantDID: claim.claimant.did || null,
      amountApproved: claim.amountApproved,
      currency: claim.currency,
      timestamp: new Date().toISOString(),
    };
    const approvalHcsMessageId = await submitToHCS(approvalEvent);
    claim.hcsEvents.push({ eventType: 'CLAIM_APPROVED', hcsMessageId: approvalHcsMessageId, timestamp: new Date() });

    await claim.save();

    // Trigger payout (simplified): transfer HTS token (CareX token) to claimant wallet
    let payoutResult = null;
    if (payoutMethod === 'HTS_TOKEN') {
      // payoutDetails expected: { tokenId, toAccountId }
      payoutResult = await transferHTSToken({
        tokenId: payoutDetails.tokenId,      // HTS token id for CareX
        fromAccountId: process.env.HEDERA_OPERATOR_ID,
        fromPrivateKey: process.env.HEDERA_OPERATOR_KEY,
        toAccountId: payoutDetails.toAccountId,
        amount: claim.amountApproved,
      });
    } else {
      // For other payout methods (bank, manual), integrate external APIs and write payout event.
      payoutResult = { message: 'Payout pending external processing', details: payoutDetails };
    }

    // Log payout event to HCS
    const payoutEvent = {
      eventType: 'CLAIM_PAYOUT_INITIATED',
      claimId: claim._id.toString(),
      payoutMethod,
      payoutResult,
      timestamp: new Date().toISOString(),
    };
    const payoutHcsId = await submitToHCS(payoutEvent);
    claim.hcsEvents.push({ eventType: 'CLAIM_PAYOUT_INITIATED', hcsMessageId: payoutHcsId, timestamp: new Date() });

    // If payout succeeded and is onchain, mark PAID
    if (payoutResult && payoutResult.success) {
      claim.status = 'PAID';
      claim.hcsEvents.push({ eventType: 'CLAIM_PAID', hcsMessageId: payoutResult.hcsMessageId || null, timestamp: new Date() });
      await claim.save();
    } else {
      await claim.save(); // still save approved & payout initiation event
    }

    return res.json({ message: 'Claim approved', claimId: claim._id, payoutResult });
  } catch (err) {
    console.error('approveClaim error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Reject Claim (insurer)
 * POST /api/claims/:id/reject
 */
export const rejectClaim = async (req, res) => {
  try {
    const insurerUser = req.user;
    if (insurerUser.role !== 'insurer') return res.status(403).json({ error: 'Only insurers can reject claims' });

    const claim = await Claim.findById(req.params.id).populate('insurer').populate('claimant');
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (claim.insurer._id.toString() !== insurerUser._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (claim.status !== 'PENDING') return res.status(400).json({ error: 'Claim already processed' });

    const { reason } = req.body;
    claim.status = 'REJECTED';
    claim.decisionReason = reason || 'No reason provided';

    // Log rejection to HCS
    const rejectionEvent = {
      eventType: 'CLAIM_REJECTED',
      claimId: claim._id.toString(),
      insurerDID: insurerUser.did || null,
      claimantDID: claim.claimant.did || null,
      reason: claim.decisionReason,
      timestamp: new Date().toISOString(),
    };
    const rejectionHcsMessageId = await submitToHCS(rejectionEvent);
    claim.hcsEvents.push({ eventType: 'CLAIM_REJECTED', hcsMessageId: rejectionHcsMessageId, timestamp: new Date() });

    await claim.save();
    return res.json({ message: 'Claim rejected', claimId: claim._id, rejectionHcsMessageId });
  } catch (err) {
    console.error('rejectClaim error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Fetch HCS events for claim (quick)
 * GET /api/claims/:id/audit
 */
export const getClaimAudit = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    // minimal access control: claimant, insurer, admin
    const user = req.user;
    if (user.role === 'patient' && claim.claimant.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (user.role === 'insurer' && claim.insurer.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    return res.json({ hcsEvents: claim.hcsEvents });
  } catch (err) {
    console.error('getClaimAudit error', err);
    return res.status(500).json({ error: err.message });
  }
};


/**
 * Validate the medical record referenced by a claim.
 * GET /api/claims/:id/validate
 */
export const validateClaimRecord = async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await Claim.findById(claimId).populate('record').populate('claimant').populate('insurer');
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    // Access control: claimant, insurer, admin
    const user = req.user;
    if (user.role === 'patient' && claim.claimant._id.toString() !== user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    if (user.role === 'insurer' && claim.insurer._id.toString() !== user._id.toString()) return res.status(403).json({ error: 'Not authorized' });

    const validation = await validateRecordAuthenticity({ record: claim.record });
    return res.json({ claimId, validation });
  } catch (err) {
    console.error('validateClaimRecord error', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Aggregate audit events for a claim for dashboarding.
 * This will read claim.hcsEvents (we stored HCS message ids during operations),
 * optionally call Mirror Node to decode each event message, and return a timeline.
 * GET /api/claims/:id/audit-aggregate
 */
export const auditAggregate = async (req, res) => {
  try {
    const claimId = req.params.id;
    const claim = await Claim.findById(claimId);
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    // Access control: patient, insurer, admin or public depending on policy
    const user = req.user;
    if (user.role === 'patient' && claim.claimant.toString() !== user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    if (user.role === 'insurer' && claim.insurer.toString() !== user._id.toString()) return res.status(403).json({ error: 'Not authorized' });

    const timeline = [];
    for (const evt of claim.hcsEvents || []) {
      // evt.hcsMessageId is the transactionId we stored earlier
      try {
        const msgs = await fetchHcsMessagesByTransaction(process.env.HEDERA_TOPIC_ID, evt.hcsMessageId);
        const msgDecoded = msgs && msgs.length ? decodeMirrorMessage(msgs[0]) : null;
        timeline.push({
          eventType: evt.eventType,
          recordedAt: evt.timestamp,
          hcsMessageId: evt.hcsMessageId,
          mirrorDecoded: msgDecoded,
        });
      } catch (err) {
        timeline.push({
          eventType: evt.eventType,
          recordedAt: evt.timestamp,
          hcsMessageId: evt.hcsMessageId,
          mirrorDecoded: null,
          error: err.message,
        });
      }
    }

    return res.json({ claimId, timeline });
  } catch (err) {
    console.error('auditAggregate error', err);
    return res.status(500).json({ error: err.message });
  }
};