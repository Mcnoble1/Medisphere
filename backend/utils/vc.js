// backend/utils/vc.js
import { createSign } from 'crypto';
import { getSigningKeyPEM } from './kms.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * createVerifiableCredential(subjectDid, issuerDid, claimObject, options)
 * - Produces a simple W3C-style VC JSON object and signs it (JWT-less, JSON-LD style signature).
 * - For robust production use, adopt a VC library (did-jwt-vc, jsonld-signatures, etc.)
 */
export const createVerifiableCredential = async (subjectDid, issuerDid, claim, { type = 'HealthCredential', expiryDays = 365 } = {}) => {
  const issuanceDate = new Date().toISOString();
  const id = `urn:uuid:${uuidv4()}`;

  const credential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id,
    type: ['VerifiableCredential', type],
    issuer: issuerDid,
    issuanceDate,
    credentialSubject: {
      id: subjectDid,
      ...claim,
    },
  };

  // Add expiry if requested
  if (expiryDays) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);
    credential.expirationDate = expiry.toISOString();
  }

  // Sign the credential (simple detached signature over canonicalized JSON)
  const pem = await getSigningKeyPEM();
  const signer = createSign('RSA-SHA256');
  const payload = JSON.stringify(credential);
  signer.update(payload);
  signer.end();
  const signature = signer.sign(pem, 'base64');

  const verifiableCredential = {
    ...credential,
    proof: {
      type: 'RsaSignature2018',
      created: new Date().toISOString(),
      proofPurpose: 'assertionMethod',
      verificationMethod: `${issuerDid}#keys-1`,
      jws: signature,
    },
  };

  return { vc: verifiableCredential, signature };
};

/**
 * Create a medical record Verifiable Credential
 * @param {Object} params - { patientAccountId, doctorAccountId, recordType, recordData, ipfsCid }
 */
export const createMedicalRecordVC = async (params) => {
  const { patientAccountId, doctorAccountId, recordType, recordData, ipfsCid } = params;

  // Use Hedera account IDs as DIDs (simplified for now)
  const subjectDid = `did:hedera:testnet:${patientAccountId}`;
  const issuerDid = `did:hedera:testnet:${doctorAccountId}`;

  const claim = {
    recordType,
    ipfsCid,
    recordData,
    issuedAt: new Date().toISOString()
  };

  // Map record types to VC types
  const vcTypeMap = {
    'diagnosis': 'DiagnosisCredential',
    'lab-result': 'LabResultCredential',
    'prescription': 'PrescriptionCredential',
    'surgery': 'SurgicalRecordCredential',
    'other': 'MedicalRecordCredential'
  };

  const vcType = vcTypeMap[recordType] || 'MedicalRecordCredential';

  return createVerifiableCredential(subjectDid, issuerDid, claim, {
    type: vcType,
    expiryDays: 3650  // 10 years for medical records
  });
};


// backend/utils/vc.js
// import crypto from 'crypto';
// import fs from 'fs';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';

/**
 * Load private key PEM for a given lab uuid (keys/<uuid>.priv.pem)
 */
const loadLabPrivateKey = (labUuid) => {
  const keyPath = path.resolve('keys', `${labUuid}.priv.pem`);
  if (!fs.existsSync(keyPath)) throw new Error(`Lab private key not found: ${keyPath}`);
  return fs.readFileSync(keyPath, 'utf8');
};

/**
 * Create a simple VC object and sign it using RSA-SHA256
 * @param {Object} params { labDid, labUuid, patientDid, resultCid, testType, metadata }
 * @returns {Object} { vc, signature }
 */
export const issueLabVC = (params) => {
  const { labDid, labUuid, patientDid, resultCid, testType, metadata = {} } = params;
  const issuedAt = new Date().toISOString();
  const vc = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id: `urn:uuid:${uuidv4()}`,
    type: ['VerifiableCredential', 'LabResultCredential'],
    issuer: labDid,
    issuanceDate: issuedAt,
    credentialSubject: {
      id: patientDid,
      testType,
      resultCid,
      metadata,
    },
  };

  // Sign VC: create canonical string and sign with lab private key
  const privKeyPem = loadLabPrivateKey(labUuid);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(JSON.stringify(vc));
  signer.end();
  const signature = signer.sign(privKeyPem, 'base64');

  return { vc, signature };
};
