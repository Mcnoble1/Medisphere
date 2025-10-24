import MedicalRecord from '../models/recordModel.js';
import { User } from '../models/userModel.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { uploadJsonToIPFS, getFromIPFS } from '../utils/ipfsClient.js';
import { submitToHCS } from '../utils/hedera.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const SHARE_JWT_SECRET = process.env.SHARE_JWT_SECRET || 'share-secret-please-change';
const SHARE_TOKEN_TTL = process.env.SHARE_TOKEN_TTL || '1h'; // short-lived share tokens

// Helper: load user's public key PEM from keys folder by uuid
const getUserPublicKeyPem = (uuid) => {
  const pubPath = path.resolve('keys', `${uuid}.pub.pem`);
  if (!fs.existsSync(pubPath)) return null;
  return fs.readFileSync(pubPath, 'utf8');
};

// POST /api/lifechain/records
export const createRecord = async (req, res) => {
  try {
    // req.user expected to be populated by auth middleware
    const clinicId = req.user._id;
    const { patientId, title, data } = req.body;

    const clinic = await User.findById(clinicId);
    if (!clinic || clinic.role !== 'clinic') return res.status(403).json({ message: 'Only clinics can create records' });

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') return res.status(400).json({ message: 'Invalid patient' });

    // Encrypt payload. For better security, use hybrid encryption: generate symmetric key, encrypt payload,
    // then encrypt symmetric key with patient's public key (omitted for brevity). For demo, we use AES based on ENCRYPTION_SECRET.
    const plaintext = JSON.stringify({
      meta: { createdBy: clinic.did, createdAt: new Date().toISOString(), title },
      payload: data,
    });

    const encryptedBlob = encrypt(plaintext);

    // Upload encrypted blob to IPFS
    const cid = await uploadJsonToIPFS(encryptedBlob);

    // Create HCS anchor payload (store non-PII metadata + CID)
    const hcsPayload = {
      patientDID: patient.did,
      clinicDID: clinic.did,
      title,
      cid,
      timestamp: new Date().toISOString(),
    };

    const hcsMessageId = await submitToHCS(hcsPayload);

    // Persist in DB
    const record = await MedicalRecord.create({
      patient: patient._id,
      clinic: clinic._id,
      title,
      encryptedData: cid, // store pointer (CID). keep encrypted blob off-chain.
      hcsMessageId,
    });

    return res.status(201).json({
      message: 'Record created. Encrypted data stored off-chain (CID saved) and anchored to HCS.',
      recordId: record._id,
      cid,
      hcsMessageId,
    });
  } catch (err) {
    console.error('createRecord error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/lifechain/records/:id  -> returns decrypted data if requester is authorized
export const getRecordById = async (req, res) => {
  try {
    const requester = req.user; // ensure auth and consent checks are done by middleware or here
    const { id } = req.params;

    const record = await MedicalRecord.findById(id).populate('patient clinic', 'did uuid name role');
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Authorization: allow patient themselves or clinic who created it or someone with valid share token
    const isCreatorClinic = requester && requester._id.toString() === record.clinic._id.toString();
    const isPatient = requester && requester._id.toString() === record.patient._id.toString();

    // If no direct access, check for share token in query param ?share=token
    let shared = false;
    if (!isCreatorClinic && !isPatient) {
      const token = req.query.share;
      if (!token) return res.status(403).json({ message: 'Access denied' });
      try {
        const payload = jwt.verify(token, SHARE_JWT_SECRET);
        if (payload.recordId !== id) return res.status(403).json({ message: 'Invalid share token' });
        shared = true;
      } catch (e) {
        return res.status(403).json({ message: 'Invalid or expired share token' });
      }
    }

    // Fetch encrypted blob from IPFS by CID
    const cid = record.encryptedData;
    const encryptedBlob = await getFromIPFS(cid);

    // Decrypt (server-side). In production, decryption should be client-side using user's private key.
    const decrypted = decrypt(encryptedBlob);

    return res.status(200).json({
      record: {
        id: record._id,
        title: record.title,
        patient: { id: record.patient._id, name: record.patient.name, did: record.patient.did },
        clinic: { id: record.clinic._id, name: record.clinic.name, did: record.clinic.did },
        hcsMessageId: record.hcsMessageId,
        createdAt: record.createdAt,
        data: JSON.parse(decrypted),
        shared,
      },
    });
  } catch (err) {
    console.error('getRecordById error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/lifechain/patient/:patientId
export const listPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const requester = req.user;

    // patient can list their records, clinics can list if they have association
    if (requester.role === 'patient' && requester._id.toString() !== patientId) return res.status(403).json({ message: 'Access denied' });

    const records = await MedicalRecord.find({ patient: patientId }).select('-encryptedData').sort({ createdAt: -1 });

    return res.status(200).json({ records });
  } catch (err) {
    console.error('listPatientRecords error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/lifechain/share  -> generate short-lived share token for a record
export const generateShareToken = async (req, res) => {
  try {
    const { recordId, expiresIn } = req.body;
    const requester = req.user;

    const record = await MedicalRecord.findById(recordId).populate('patient clinic', 'did uuid name role');
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Only patient or clinic can generate share token
    const isOwner = (requester._id.toString() === record.patient._id.toString()) || (requester._id.toString() === record.clinic._id.toString());
    if (!isOwner) return res.status(403).json({ message: 'Not authorized to share' });

    const ttl = expiresIn || SHARE_TOKEN_TTL;
    const token = jwt.sign({ recordId: record._id.toString(), issuer: requester._id.toString() }, SHARE_JWT_SECRET, { expiresIn: ttl });

    // Return a shareable URL (frontend can convert to QR)
    const shareUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/share/record?token=${token}`;

    return res.status(200).json({ token, shareUrl, expiresIn: ttl });
  } catch (err) {
    console.error('generateShareToken error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};





