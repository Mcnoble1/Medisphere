/* =============================
   backend/identity/vc.js — issue, revoke, verify using VC topic
   ============================= */
import { v4 as uuid } from 'uuid';
import { submitToVCTopic, getVcEventsForId } from './vcTopicRegistry.js';

export async function issueVc({ issuerDid, subjectDid, type = 'HealthCredential', claim }) {
  const id = `urn:uuid:${uuid()}`;
  const issuanceDate = new Date().toISOString();
  const credential = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    id,
    type: ['VerifiableCredential', type],
    issuer: issuerDid,
    issuanceDate,
    credentialSubject: { id: subjectDid, ...claim },
  };

  // NOTE: @hashgraph/did-sdk-js provides the VC registry (topic). For simplicity
  // we store VC off-chain (IPFS or DB) and publish a registry entry to the VC topic
  // with minimal data & CID. You can add LD signatures if desired.

  const registryEvent = { event: 'ISSUED', vcId: id, type, issuer: issuerDid, subject: subjectDid };
  const receipt = await submitToVCTopic(registryEvent);
  return { credential, registryTxId: receipt.transactionId?.toString?.() };
}

export async function revokeVc(vcId, reason = 'revoked_by_issuer') {
  const registryEvent = { event: 'REVOKED', vcId, reason };
  const receipt = await submitToVCTopic(registryEvent);
  return { registryTxId: receipt.transactionId?.toString?.() };
}

export async function isVcRevoked(vcId) {
  const events = await getVcEventsForId(vcId);
  // If last event for vcId is REVOKED, treat as revoked
  const last = events[events.length - 1];
  return last?.event === 'REVOKED';
}
