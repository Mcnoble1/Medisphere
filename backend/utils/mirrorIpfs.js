import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const MIRROR_NODE = process.env.MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs';
const HEDERA_TOPIC_ID = process.env.HEDERA_TOPIC_ID; // fallback if topicId not stored per-record

const axiosInstance = axios.create({
  timeout: 15_000,
});

/**
 * Fetch HCS messages for a topic filtered by transactionId (mirror node).
 * Returns array of message objects (mirror node format).
 */
export const fetchHcsMessagesByTransaction = async (topicId, transactionId) => {
  try {
    const tplTopic = topicId || HEDERA_TOPIC_ID;
    if (!tplTopic) throw new Error('Topic ID not provided');

    // Mirror node supports transactionid query param on topic messages
    const url = `${MIRROR_NODE}/api/v1/topics/${tplTopic}/messages?transactionid=${encodeURIComponent(transactionId)}`;
    const resp = await axiosInstance.get(url);
    return resp.data.messages || [];
  } catch (err) {
    console.error('fetchHcsMessagesByTransaction error', err.message || err);
    throw err;
  }
};

/**
 * Decode base64 message content from mirror node message object.
 * Mirror node returns message in base64: message: "<base64>"
 * We expect the original message to be JSON-stringified.
 */
export const decodeMirrorMessage = (messageObj) => {
  if (!messageObj || !messageObj.message) return null;
  try {
    const buff = Buffer.from(messageObj.message, 'base64'); // message is base64
    const txt = buff.toString('utf8');
    try {
      return JSON.parse(txt);
    } catch (e) {
      // message may be plain text, return raw string
      return txt;
    }
  } catch (err) {
    console.error('decodeMirrorMessage error', err);
    return null;
  }
};

/**
 * Fetch IPFS content (returns Buffer)
 * ipfsCid example: Qm...
 */
export const fetchIpfsContent = async (ipfsCid) => {
  try {
    if (!ipfsCid) throw new Error('No IPFS CID provided');
    const url = ipfsCid.startsWith('ipfs://') ? ipfsCid.replace('ipfs://', `${IPFS_GATEWAY}/`) : `${IPFS_GATEWAY}/${ipfsCid}`;
    const resp = await axiosInstance.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(resp.data);
  } catch (err) {
    console.error('fetchIpfsContent error', err.message || err);
    throw err;
  }
};

/**
 * Compute sha256 hex of given Buffer or String
 */
export const sha256Hex = (input) => {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return crypto.createHash('sha256').update(buf).digest('hex');
};

/**
 * Validate a record's authenticity:
 * - load the record (caller provides it)
 * - read HCS message via mirror node using record.hcsMessageId (transactionId)
 * - decode message: expected to contain recordHash and ipfsCid (or equivalent)
 * - fetch IPFS payload, compute hash and compare to recordHash
 *
 * Returns an object:
 * { success: boolean, reason: string, hcsMessage, ipfsCid, expectedHash, actualHash }
 */
export const validateRecordAuthenticity = async ({ record, topicId = null }) => {
  try {
    if (!record) throw new Error('Record object is required');

    // record.hcsMessageId must be available (we stored transactionId earlier)
    const txId = record.hcsMessageId;
    if (!txId) {
      return { success: false, reason: 'No hcsMessageId on record', txId: null };
    }

    // fetch message(s) from mirror node for the transaction
    const messages = await fetchHcsMessagesByTransaction(topicId, txId);
    if (!messages || messages.length === 0) {
      return { success: false, reason: 'No HCS messages found for transaction', txId, messages: [] };
    }

    // pick first message (should normally be one)
    const msg = messages[0];
    const decoded = decodeMirrorMessage(msg);
    // Expect decoded JSON to include something like: { recordHash: "...", ipfsCid: "..." }
    const expectedHash = decoded?.recordHash || decoded?.record_hash || decoded?.hash || null;
    const ipfsCid = decoded?.ipfsCid || decoded?.ipfs_cid || decoded?.cid || null;

    if (!expectedHash || !ipfsCid) {
      return { success: false, reason: 'HCS message does not contain expected fields (recordHash/ipfsCid)', decoded, messageObj: msg };
    }

    // fetch IPFS content and compute its hash
    const blob = await fetchIpfsContent(ipfsCid);
    const actualHash = sha256Hex(blob);

    const success = actualHash === expectedHash;
    return {
      success,
      reason: success ? 'Record verified: IPFS content matches HCS hash' : 'Hash mismatch between HCS and IPFS content',
      hcsMessage: decoded,
      mirrorMessageObj: msg,
      ipfsCid,
      expectedHash,
      actualHash,
    };
  } catch (err) {
    console.error('validateRecordAuthenticity error', err.message || err);
    return { success: false, reason: err.message || 'Unknown error' };
  }
};
