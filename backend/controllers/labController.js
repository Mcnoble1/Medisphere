// backend/controllers/labController.js
import { User } from '../models/userModel.js';
import LabResult from '../models/labResultModel.js';
import { encrypt } from '../utils/crypto.js';
import { uploadJsonToIPFS } from '../utils/ipfsClient.js';
import { submitToHCS } from '../utils/hedera.js';
import { issueLabVC } from '../utils/vc.js';
import { appendLabResultEvent } from '../services/lifechainService.js';
import crypto from 'crypto';

/**
 * POST /api/labs/results
 * Body: { patientId, testType, data: {...}, notes }
 * Optional file upload via multipart/form-data (handled by multer)
 *
 * Assumes req.user is populated (middleware auth) and is a lab-type user.
 */
export const createLabResult = async (req, res) => {
  try {
    const labId = req.user._id;
    const { patientId, testType, data, notes, dateCollected } = req.body;

    // 1. verify lab role
    const lab = await User.findById(labId);
    if (!lab || lab.role !== 'clinic' && lab.role !== 'lab') {
      return res.status(403).json({ message: 'Only labs or clinics can submit lab results' });
    }

    // 2. verify patient
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ message: 'Invalid patient ID' });
    }

    // 3. assemble payload and encrypt
    const payload = {
      patientDid: patient.did,
      labDid: lab.did,
      testType,
      data,
      notes,
      dateCollected: dateCollected || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const plaintext = JSON.stringify(payload);
    const encrypted = encrypt(plaintext); // returns iv:hex:encrypted:hex format

    // 4. (optional) upload encrypted blob to IPFS
    // We'll upload the encrypted string as content
    const cid = await uploadJsonToIPFS(encrypted);

    // 5. compute hash of encrypted payload (SHA256)
    const hash = crypto.createHash('sha256').update(encrypted).digest('hex');

    // 6. submit anchor to HCS (metadata only)
    const hcsPayload = {
      type: 'LabResultAnchor',
      patientDID: patient.did,
      labDID: lab.did,
      testType,
      cid,
      hash,
      timestamp: new Date().toISOString(),
    };
    const hcsMessageId = await submitToHCS(hcsPayload);

    // 7. issue simple VC (signed attestation)
    // lab.uuid must be available on user (we saved id earlier as uuid)
    const labUuid = lab.uuid; // ensure your user model stores uuid from generateDID
    const { vc, signature } = issueLabVC({
      labDid: lab.did,
      labUuid,
      patientDid: patient.did,
      resultCid: cid,
      testType,
      metadata: { notes },
    });

    // 8. persist LabResult in DB
    const newResult = await LabResult.create({
      patient: patient._id,
      lab: lab._id,
      testType,
      encryptedCid: cid,
      encryptedBlobHash: hash,
      hcsMessageId,
      vc: {
        id: vc.id,
        type: vc.type,
        issuedAt: vc.issuanceDate,
      },
      metadata: {
        dateCollected: payload.dateCollected,
        dateReported: new Date().toISOString(),
        notes,
      },
    });

    // 9. push timeline to LifeChain (non-blocking recommended)
    try {
      // lab.name should exist in user model; lab.uuid is lab.id string
      await appendLabResultEvent({
        patientId: patient._id,
        lab: { id: lab._id.toString(), did: lab.did, name: lab.name || 'Lab' },
        testType,
        cid,
        hcsMessageId,
        labResultId: newResult._id.toString(),
        notes,
      });
    } catch (err) {
      console.error('Failed to append LifeChain timeline event:', err);
      // we continue — the lab result is already stored & anchored
    }

    // 10. respond with minimal info and VC + signature (patient/clinic can store full VC)
    res.status(201).json({
      message: 'Lab result recorded, anchored on Hedera, and VC issued.',
      labResultId: newResult._id,
      hcsMessageId,
      cid,
      vc,
      signature,
    });
  } catch (err) {
    console.error('createLabResult error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
