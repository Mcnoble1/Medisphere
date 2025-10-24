import {
  Client,
  TopicMessageSubmitTransaction,
  PrivateKey,
  TransactionId,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';
dotenv.config();

const operatorId = process.env.HEDERA_ACCOUNT_ID;
const operatorKey = process.env.HEDERA_PRIVATE_KEY ? PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY) : null;
const topicId = process.env.HEDERA_TOPIC_ID_GOV || process.env.HEDERA_TOPIC_ID;

if (!operatorId || !operatorKey || !topicId) {
  console.warn('Hedera env variables missing — HCS logging will fail if used.');
}

const client = Client.forTestnet();
if (operatorId && operatorKey) client.setOperator(operatorId, operatorKey);

/**
 * submitGovEvent
 * messageObj: an object with structured fields (type, actorDid, payload...)
 * returns: transactionId string
 */
export const submitGovEvent = async (messageObj) => {
  try {
    const msg = JSON.stringify(messageObj);
    const tx = await new TopicMessageSubmitTransaction({
      topicId,
      message: msg,
    }).execute(client);

    // tx contains transactionId which we can return for anchor reference
    const txId = tx.transactionId.toString();
    // Optionally get receipt (not strictly necessary here)
    await tx.getReceipt(client);

    return txId;
  } catch (err) {
    console.error('submitGovEvent error', err);
    throw err;
  }
};
