import DataRequest from '../models/dataRequestModel.js';
import { User } from '../models/userModel.js';
import { submitHCS, mintAccessToken, burnAccessToken } from '../utils/hederaDataBridge.js';

/**
 * Create a new data access request
 * POST /api/data-requests
 * body: { ownerId, dataType, description, purpose, validUntil }
 */
export const createRequest = async (req, res) => {
  try {
    const requesterId = req.user._id; // assume auth middleware sets req.user
    const { ownerId, dataType, description, purpose, validUntil } = req.body;

    const owner = await User.findById(ownerId);
    if (!owner) return res.status(404).json({ error: 'Owner not found' });

    const newReq = await DataRequest.create({
      requester: requesterId,
      owner: ownerId,
      dataType,
      description,
      purpose,
      validUntil
    });

    // Log create event to HCS
    const hcsPayload = {
      action: 'DATA_REQUEST_CREATED',
      requestId: newReq._id,
      requester: requesterId,
      owner: ownerId,
      dataType,
      purpose,
      createdAt: new Date().toISOString()
    };
    const hcsTx = await submitHCS(hcsPayload);
    newReq.hcsCreateTx = hcsTx;
    await newReq.save();

    res.status(201).json({ message: 'Request created', request: newReq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Approve a pending request
 * POST /api/data-requests/:id/approve
 */
export const approveRequest = async (req, res) => {
  try {
    const approverId = req.user._id;
    const { id } = req.params;

    const reqDoc = await DataRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ error: 'Request not found' });
    if (reqDoc.status !== 'pending') return res.status(400).json({ error: 'Request not pending' });

    // Ensure approver is the owner
    if (reqDoc.owner.toString() !== approverId.toString()) {
      return res.status(403).json({ error: 'Only owner can approve' });
    }

    // Mint access token (HTS) — metadata contains minimal info or encrypted pointer
    const tokenMetadata = JSON.stringify({
      requestId: reqDoc._id.toString(),
      requester: reqDoc.requester.toString(),
      owner: reqDoc.owner.toString(),
      expiry: reqDoc.validUntil ? reqDoc.validUntil.toISOString() : null
    });

    // NOTE: tokenId should be configured ahead (or you can create per organization)
    const tokenId = process.env.HEDERA_ACCESS_TOKEN_ID; // pre-created token type id
    const { tokenId: tId, serial } = await mintAccessToken({
      tokenId,
      metadata: tokenMetadata,
      recipientAccountId: null // would be the requester's Hedera account in full flow
    });

    reqDoc.status = 'approved';
    reqDoc.hcsApproveTx = await submitHCS({
      action: 'DATA_REQUEST_APPROVED',
      requestId: reqDoc._id,
      approver: approverId,
      token: tId,
      serial,
      timestamp: new Date().toISOString()
    });
    reqDoc.accessTokenId = tId;
    reqDoc.accessTokenSerial = serial;
    await reqDoc.save();

    res.json({ message: 'Request approved', request: reqDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


/**
 * Reject a pending request
 * POST /api/data-requests/:id/reject
 */
export const rejectRequest = async (req, res) => {
  try {
    const approverId = req.user._id;
    const { id } = req.params;

    const reqDoc = await DataRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ error: 'Request not found' });
    if (reqDoc.owner.toString() !== approverId.toString()) {
      return res.status(403).json({ error: 'Only owner can reject' });
    }
    reqDoc.status = 'rejected';
    reqDoc.hcsApproveTx = await submitHCS({
      action: 'DATA_REQUEST_REJECTED',
      requestId: reqDoc._id,
      approver: approverId,
      timestamp: new Date().toISOString()
    });
    await reqDoc.save();

    res.json({ message: 'Request rejected', request: reqDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Revoke an approved access (burn token)
 * POST /api/data-requests/:id/revoke
 */
export const revokeRequest = async (req, res) => {
  try {
    const actorId = req.user._id;
    const { id } = req.params;

    const reqDoc = await DataRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ error: 'Request not found' });
    if (reqDoc.owner.toString() !== actorId.toString()) {
      return res.status(403).json({ error: 'Only owner can revoke' });
    }
    if (!reqDoc.accessTokenId || !reqDoc.accessTokenSerial) return res.status(400).json({ error: 'No token to revoke' });

    await burnAccessToken({ tokenId: reqDoc.accessTokenId, serial: reqDoc.accessTokenSerial });

    reqDoc.status = 'revoked';
    reqDoc.hcsApproveTx = await submitHCS({
      action: 'DATA_REQUEST_REVOKED',
      requestId: reqDoc._id,
      actor: actorId,
      timestamp: new Date().toISOString()
    });
    await reqDoc.save();

    res.json({ message: 'Access revoked', request: reqDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * List incoming requests for owner
 * GET /api/data-requests/incoming
 */
export const listIncoming = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const requests = await DataRequest.find({ owner: ownerId }).populate('requester', 'name email');
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Audit logs - returns HCS tx ids stored on requests
 * GET /api/data-requests/logs
 */
export const getLogs = async (req, res) => {
  try {
    const ownerId = req.user._id;
    // Return the requests with associated HCS tx ids
    const logs = await DataRequest.find({ owner: ownerId }).select('status hcsCreateTx hcsApproveTx createdAt updatedAt');
    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
