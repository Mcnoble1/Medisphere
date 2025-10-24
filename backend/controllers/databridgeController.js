import DataRequest from '../models/dataRequestModel.js';
import DataShare from '../models/dataShareModel.js';
import { User } from '../models/userModel.js';
import { logDataBridgeAction, mintAccessToken, burnAccessToken } from '../utils/hederaDataBridge.js';
import { generateAccessToken, generateTokenId, createTokenMetadata, validateTokenAccess, calculateExpiryDate } from '../utils/accessTokenUtil.js';

// ==================== DATA REQUEST CONTROLLERS ====================

/**
 * Create a new data access request
 * POST /api/databridge/requests
 */
export const createDataRequest = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const requester = req.user;

    const {
      ownerId,
      dataRequested,
      purpose,
      description,
      justification,
      priority = 'medium',
      validUntil,
      accessDuration // in days
    } = req.body;

    // Validation
    if (!ownerId || !dataRequested || dataRequested.length === 0 || !purpose) {
      return res.status(400).json({ error: 'Missing required fields: ownerId, dataRequested, purpose' });
    }

    // Find owner
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ error: 'Data owner not found' });
    }

    // Calculate expiry date
    const expiryDate = validUntil
      ? new Date(validUntil)
      : calculateExpiryDate(accessDuration || 30);

    // Determine requester type from role
    const requesterType = mapRoleToActorType(requester.role);
    const ownerType = mapRoleToActorType(owner.role);

    // Create request
    const newRequest = await DataRequest.create({
      requester: requesterId,
      requesterName: `${requester.firstName} ${requester.lastName}`,
      requesterType,
      owner: ownerId,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      ownerType,
      dataRequested,
      purpose,
      description,
      justification,
      priority,
      validUntil: expiryDate,
      patientConsent: ownerType === 'patient' ? false : true, // Requires patient consent if owner is patient
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    // Log to HCS
    const hcsTxId = await logDataBridgeAction(
      'DATA_REQUEST_CREATED',
      `${requester.firstName} ${requester.lastName}`,
      {
        requestId: newRequest._id.toString(),
        requester: requesterId.toString(),
        requesterType,
        owner: ownerId.toString(),
        ownerType,
        dataTypes: dataRequested,
        purpose,
        priority
      }
    );

    newRequest.hcsCreateTx = hcsTxId;
    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Data request created successfully',
      request: newRequest
    });
  } catch (err) {
    console.error('[DataBridge] Create request error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List incoming data requests for the authenticated user
 * GET /api/databridge/requests/incoming
 */
export const listIncomingRequests = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { status, priority, dataType, limit = 50, offset = 0 } = req.query;

    const query = { owner: ownerId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (dataType) query.dataRequested = dataType;

    const requests = await DataRequest.find(query)
      .populate('requester', 'firstName lastName email role')
      .sort({ createdAt: -1, priority: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await DataRequest.countDocuments(query);

    res.json({
      success: true,
      requests,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('[DataBridge] List incoming requests error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List outgoing data requests made by the authenticated user
 * GET /api/databridge/requests/outgoing
 */
export const listOutgoingRequests = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { status, limit = 50, offset = 0 } = req.query;

    const query = { requester: requesterId };
    if (status) query.status = status;

    const requests = await DataRequest.find(query)
      .populate('owner', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await DataRequest.countDocuments(query);

    res.json({
      success: true,
      requests,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('[DataBridge] List outgoing requests error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Approve a data access request
 * POST /api/databridge/requests/:id/approve
 */
export const approveDataRequest = async (req, res) => {
  try {
    const approverId = req.user._id;
    const approver = req.user;
    const { id } = req.params;
    const { accessDuration, conditions, notes } = req.body;

    const request = await DataRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    // Ensure approver is the owner
    if (request.owner.toString() !== approverId.toString()) {
      return res.status(403).json({ error: 'Only the data owner can approve this request' });
    }

    // Generate access token
    const tokenId = generateTokenId();
    const expiresAt = accessDuration
      ? calculateExpiryDate(accessDuration)
      : request.validUntil;

    const accessToken = generateAccessToken({
      requestId: request._id.toString(),
      requester: request.requester.toString(),
      owner: request.owner.toString(),
      dataTypes: request.dataRequested,
      purpose: request.purpose
    }, expiresAt);

    // Mint Hedera token (optional - can be enabled when HTS is configured)
    let hederaToken = null;
    const hederaTokenId = process.env.HEDERA_ACCESS_TOKEN_ID;

    if (hederaTokenId) {
      try {
        const metadata = createTokenMetadata({
          requestId: request._id,
          requester: request.requester,
          owner: request.owner,
          dataTypes: request.dataRequested,
          purpose: request.purpose,
          expiresAt
        });

        hederaToken = await mintAccessToken({
          tokenId: hederaTokenId,
          metadata,
          recipientAccountId: null
        });
      } catch (error) {
        console.warn('[DataBridge] HTS token minting failed:', error.message);
        // Continue without HTS token
      }
    }

    // Update request
    request.status = 'approved';
    request.approvedAt = new Date();
    request.approver = approverId;
    request.approvalNotes = notes;
    request.conditions = conditions || [];
    request.expiresAt = expiresAt;
    request.accessToken = accessToken;

    if (hederaToken) {
      request.accessTokenId = hederaToken.tokenId;
      request.accessTokenSerial = hederaToken.serial;
    }

    // Log to HCS
    const hcsTxId = await logDataBridgeAction(
      'DATA_REQUEST_APPROVED',
      `${approver.firstName} ${approver.lastName}`,
      {
        requestId: request._id.toString(),
        requester: request.requester.toString(),
        approver: approverId.toString(),
        dataTypes: request.dataRequested,
        expiresAt: expiresAt.toISOString(),
        tokenSerial: hederaToken?.serial
      }
    );

    request.hcsApproveTx = hcsTxId;
    await request.save();

    res.json({
      success: true,
      message: 'Request approved successfully',
      request,
      accessToken
    });
  } catch (err) {
    console.error('[DataBridge] Approve request error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Reject a data access request
 * POST /api/databridge/requests/:id/reject
 */
export const rejectDataRequest = async (req, res) => {
  try {
    const approverId = req.user._id;
    const approver = req.user;
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const request = await DataRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    if (request.owner.toString() !== approverId.toString()) {
      return res.status(403).json({ error: 'Only the data owner can reject this request' });
    }

    request.status = 'rejected';
    request.rejectedAt = new Date();
    request.approver = approverId;
    request.rejectionReason = reason;
    request.approvalNotes = notes;

    // Log to HCS
    const hcsTxId = await logDataBridgeAction(
      'DATA_REQUEST_REJECTED',
      `${approver.firstName} ${approver.lastName}`,
      {
        requestId: request._id.toString(),
        requester: request.requester.toString(),
        approver: approverId.toString(),
        reason
      }
    );

    request.hcsRejectTx = hcsTxId;
    await request.save();

    res.json({
      success: true,
      message: 'Request rejected',
      request
    });
  } catch (err) {
    console.error('[DataBridge] Reject request error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Revoke an approved data access request
 * POST /api/databridge/requests/:id/revoke
 */
export const revokeDataRequest = async (req, res) => {
  try {
    const actorId = req.user._id;
    const actor = req.user;
    const { id } = req.params;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Revocation reason is required' });
    }

    const request = await DataRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Both owner and requester can revoke
    const isOwner = request.owner.toString() === actorId.toString();
    const isRequester = request.requester.toString() === actorId.toString();

    if (!isOwner && !isRequester) {
      return res.status(403).json({ error: 'Only the data owner or requester can revoke this request' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved requests can be revoked' });
    }

    // Burn Hedera token if it exists
    if (request.accessTokenId && request.accessTokenSerial) {
      try {
        await burnAccessToken({
          tokenId: request.accessTokenId,
          serial: request.accessTokenSerial
        });
      } catch (error) {
        console.warn('[DataBridge] Token burning failed:', error.message);
        // Continue with revocation even if burning fails
      }
    }

    request.status = 'revoked';
    request.revokedAt = new Date();
    request.revocationReason = reason;
    request.approvalNotes = notes;

    // Log to HCS
    const hcsTxId = await logDataBridgeAction(
      'DATA_REQUEST_REVOKED',
      `${actor.firstName} ${actor.lastName}`,
      {
        requestId: request._id.toString(),
        revokedBy: actorId.toString(),
        reason
      }
    );

    request.hcsRevokeTx = hcsTxId;
    await request.save();

    res.json({
      success: true,
      message: 'Access revoked successfully',
      request
    });
  } catch (err) {
    console.error('[DataBridge] Revoke request error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== DATA SHARE CONTROLLERS ====================

/**
 * Create a new data share (proactive sharing)
 * POST /api/databridge/shares
 */
export const createDataShare = async (req, res) => {
  try {
    const sharerId = req.user._id;
    const sharer = req.user;

    const {
      recipientId,
      dataToShare,
      purpose,
      description,
      expiryDate,
      accessDuration, // in days
      conditions,
      accessRestrictions
    } = req.body;

    // Validation
    if (!recipientId || !dataToShare || dataToShare.length === 0 || !purpose) {
      return res.status(400).json({ error: 'Missing required fields: recipientId, dataToShare, purpose' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Calculate expiry
    const expiry = expiryDate
      ? new Date(expiryDate)
      : calculateExpiryDate(accessDuration || 30);

    // Generate access token
    const tokenId = generateTokenId();
    const accessToken = generateAccessToken({
      shareId: tokenId,
      sharer: sharerId.toString(),
      recipient: recipientId.toString(),
      dataTypes: dataToShare,
      purpose
    }, expiry);

    // Map role to actor type
    const sharerType = mapRoleToActorType(sharer.role);
    const recipientType = mapRoleToActorType(recipient.role);

    // Create share
    const newShare = await DataShare.create({
      sharer: sharerId,
      sharerName: `${sharer.firstName} ${sharer.lastName}`,
      sharerType,
      recipient: recipientId,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      recipientType,
      dataShared: dataToShare,
      purpose,
      description,
      expiryDate: expiry,
      accessToken,
      conditions: conditions || [],
      accessRestrictions: accessRestrictions || {},
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    // Log to HCS
    const hcsTxId = await logDataBridgeAction(
      'DATA_SHARE_CREATED',
      `${sharer.firstName} ${sharer.lastName}`,
      {
        shareId: newShare._id.toString(),
        sharer: sharerId.toString(),
        sharerType,
        recipient: recipientId.toString(),
        recipientType,
        dataTypes: dataToShare,
        purpose,
        expiresAt: expiry.toISOString()
      }
    );

    newShare.hcsCreateTx = hcsTxId;
    await newShare.save();

    res.status(201).json({
      success: true,
      message: 'Data share created successfully',
      share: newShare,
      accessToken
    });
  } catch (err) {
    console.error('[DataBridge] Create share error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List outgoing data shares
 * GET /api/databridge/shares/outgoing
 */
export const listOutgoingShares = async (req, res) => {
  try {
    const sharerId = req.user._id;
    const { status, limit = 50, offset = 0 } = req.query;

    const query = { sharer: sharerId };
    if (status) query.status = status;

    const shares = await DataShare.find(query)
      .populate('recipient', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await DataShare.countDocuments(query);

    res.json({
      success: true,
      shares,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('[DataBridge] List outgoing shares error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List incoming data shares (shared with me)
 * GET /api/databridge/shares/incoming
 */
export const listIncomingShares = async (req, res) => {
  try {
    const recipientId = req.user._id;
    const { status, limit = 50, offset = 0 } = req.query;

    const query = { recipient: recipientId };
    if (status) query.status = status;

    const shares = await DataShare.find(query)
      .populate('sharer', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await DataShare.countDocuments(query);

    res.json({
      success: true,
      shares,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('[DataBridge] List incoming shares error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Revoke a data share
 * POST /api/databridge/shares/:id/revoke
 */
export const revokeDataShare = async (req, res) => {
  try {
    const actorId = req.user._id;
    const actor = req.user;
    const { id } = req.params;
    const { reason } = req.body;

    const share = await DataShare.findById(id);
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    if (share.sharer.toString() !== actorId.toString()) {
      return res.status(403).json({ error: 'Only the sharer can revoke this share' });
    }

    if (share.status === 'revoked') {
      return res.status(400).json({ error: 'Share is already revoked' });
    }

    share.status = 'revoked';
    share.revokedAt = new Date();
    share.revocationReason = reason;

    // Log to HCS
    const hcsTxId = await logDataBridgeAction(
      'DATA_SHARE_REVOKED',
      `${actor.firstName} ${actor.lastName}`,
      {
        shareId: share._id.toString(),
        revokedBy: actorId.toString(),
        reason
      }
    );

    share.hcsRevokeTx = hcsTxId;
    await share.save();

    res.json({
      success: true,
      message: 'Share revoked successfully',
      share
    });
  } catch (err) {
    console.error('[DataBridge] Revoke share error:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Access shared data (for recipients)
 * GET /api/databridge/shares/:id/access
 */
export const accessSharedData = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const share = await DataShare.findById(id)
      .populate('sharer', 'firstName lastName email role');

    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Verify recipient
    if (share.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to access this share' });
    }

    // Validate access
    const validation = validateTokenAccess(share, req.ip || req.connection.remoteAddress);
    if (!validation.valid) {
      return res.status(403).json({ error: validation.reason });
    }

    // Log access
    share.logAccess(
      req.ip || req.connection.remoteAddress,
      req.get('user-agent'),
      'DATA_ACCESSED'
    );

    // Log to HCS
    await logDataBridgeAction(
      'DATA_ACCESSED',
      `${req.user.firstName} ${req.user.lastName}`,
      {
        shareId: share._id.toString(),
        recipient: userId.toString(),
        accessCount: share.accessCount
      }
    );

    await share.save();

    res.json({
      success: true,
      message: 'Data accessed successfully',
      share: {
        id: share._id,
        dataShared: share.dataShared,
        purpose: share.purpose,
        sharer: share.sharer,
        accessCount: share.accessCount,
        expiryDate: share.expiryDate
      }
    });
  } catch (err) {
    console.error('[DataBridge] Access data error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== AUDIT & LOGS ====================

/**
 * Get audit logs for data requests and shares
 * GET /api/databridge/logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'all', limit = 50, offset = 0 } = req.query;

    let logs = [];

    if (type === 'all' || type === 'requests') {
      const requests = await DataRequest.find({
        $or: [{ owner: userId }, { requester: userId }]
      })
        .select('status dataRequested purpose priority createdAt updatedAt hcsCreateTx hcsApproveTx hcsRejectTx hcsRevokeTx requesterName ownerName')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      logs.push(...requests.map(r => ({
        type: 'request',
        id: r._id,
        action: `Request ${r.status}`,
        actor: r.requesterName,
        target: r.ownerName,
        dataTypes: r.dataRequested,
        purpose: r.purpose,
        timestamp: r.updatedAt,
        blockchainHashes: {
          create: r.hcsCreateTx,
          approve: r.hcsApproveTx,
          reject: r.hcsRejectTx,
          revoke: r.hcsRevokeTx
        }
      })));
    }

    if (type === 'all' || type === 'shares') {
      const shares = await DataShare.find({
        $or: [{ sharer: userId }, { recipient: userId }]
      })
        .select('status dataShared purpose accessCount createdAt updatedAt hcsCreateTx hcsRevokeTx sharerName recipientName')
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      logs.push(...shares.map(s => ({
        type: 'share',
        id: s._id,
        action: `Share ${s.status}`,
        actor: s.sharerName,
        target: s.recipientName,
        dataTypes: s.dataShared,
        purpose: s.purpose,
        accessCount: s.accessCount,
        timestamp: s.updatedAt,
        blockchainHashes: {
          create: s.hcsCreateTx,
          revoke: s.hcsRevokeTx
        }
      })));
    }

    // Sort by timestamp
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      logs: logs.slice(0, parseInt(limit)),
      total: logs.length
    });
  } catch (err) {
    console.error('[DataBridge] Get logs error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Map user role to actor type
 */
function mapRoleToActorType(role) {
  const roleMap = {
    'PATIENT': 'patient',
    'DOCTOR': 'doctor',
    'NGO': 'ngo',
    'GOVERNMENT': 'government',
    'PHARMA': 'pharma'
  };

  return roleMap[role] || role.toLowerCase();
}
