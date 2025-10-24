// (full updated controller with LD VC, IPFS stub, audit, notifications)
import { User } from '../models/userModel.js';
// import { createLDVerifiableCredential } from '../utils/vc-ld.js';
import { submitToHCS } from '../utils/hedera.js';
import Audit from '../models/auditModel.js';
import { sendEmail, sendSMS } from '../utils/notify.js';
import dotenv from 'dotenv';
dotenv.config();

// Simple IPFS storage stub. Replace with web3.storage or ipfs-http-client integration.
import fs from 'fs';
import path from 'path';
const IPFS_MOCK_DIR = path.resolve('data/ipfs');

if (!fs.existsSync(IPFS_MOCK_DIR)) fs.mkdirSync(IPFS_MOCK_DIR, { recursive: true });

export const storeEncryptedBlob = async (plaintext) => {
  const id = `mock-${Date.now()}.json`;
  const p = path.join(IPFS_MOCK_DIR, id);
  fs.writeFileSync(p, plaintext);
  return `mock://${id}`;
};

export const resolveDID = async (req, res) => {
  try {
    const { did } = req.params;
    const user = await User.findOne({ did }).select('-__v -createdAt -updatedAt');
    if (!user) return res.status(404).json({ error: 'DID not found' });

    const didDoc = { '@context': 'https://w3id.org/did/v1', id: user.did, verificationMethod: [{ id: `${user.did}#keys-1`, type: 'RsaVerificationKey2018', controller: user.did, publicKeyPem: null }] };
    try {
      const keyPath = path.resolve(`keys/${user.uuid}.pub.pem`);
      if (fs.existsSync(keyPath)) didDoc.verificationMethod[0].publicKeyPem = fs.readFileSync(keyPath, 'utf8');
    } catch (err) {}


    res.json(didDoc);
  } catch (err) {
    console.error('resolveDID error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const issueVC = async (req, res) => {
  try {
    const issuerDid = process.env.PLATFORM_ISSUER_DID || 'did:medisphere:issuer:platform';
    const { did } = req.params;
    const { type, claim, expiryDays, notifyEmail, notifyPhone } = req.body;
    const user = await User.findOne({ did });
    if (!user) return res.status(404).json({ error: 'DID not found' });
    const signedVC = await createLDVerifiableCredential(did, issuerDid, claim, { type, expiryDays });
    const ipfsCid = await storeEncryptedBlob(JSON.stringify(signedVC));
    const hcsPayload = { event: 'VC_ISSUED', issuer: issuerDid, subject: did, vcId: signedVC.id, vcType: type, ipfsCid: ipfsCid || null, issuanceDate: signedVC.issuanceDate };
    const hcsResult = await submitToHCS(hcsPayload, user._id.toString());
    user.vcs = user.vcs || [];
    user.vcs.push({ id: signedVC.id, type, issuanceDate: signedVC.issuanceDate, expirationDate: signedVC.expirationDate, ipfsCid, hcsMessageId: hcsResult.messageId });
    await user.save();
    await Audit.create({ actorDid: issuerDid, actorUser: req.user ? req.user._id : null, action: 'VC_ISSUED', targetDid: did, meta: { vcId: signedVC.id, ipfsCid, operatorId: hcsResult.operatorId, isUserAccount: hcsResult.isUserAccount }, hcsMessageId: hcsResult.messageId });
    if (notifyEmail) await sendEmail({ to: notifyEmail, subject: `Your ${type} credential`, html: `<p>Dear ${user.name},<br/>A credential (${type}) has been issued to your DID ${did}. <a href="${process.env.FRONTEND_BASE}/retrieve-vc?cid=${ipfsCid}">Retrieve it securely</a></p>` });
    if (notifyPhone) await sendSMS({ to: notifyPhone, body: `Credential ${type} issued. Retrieve: ${process.env.FRONTEND_BASE}/retrieve-vc?cid=${ipfsCid}` });
    res.status(201).json({ message: 'VC issued', vcId: signedVC.id, hcsMessageId: hcsResult.messageId, ipfsCid, operatorUsed: hcsResult.operatorId, userAccount: hcsResult.isUserAccount });
  } catch (err) {
    console.error('issueVC error', err);
    res.status(500).json({ error: err.message });
  }
};


export const listVCs = async (req, res) => {
  try {
    const { did } = req.params;
    const user = await User.findOne({ did }).select('did name vcs -_id');
    if (!user) return res.status(404).json({ error: 'DID not found' });
    res.json({ did: user.did, name: user.name, vcs: user.vcs || [] });
  } catch (err) {
    console.error('listVCs error', err);
    res.status(500).json({ error: 'Server error' });
  }
};