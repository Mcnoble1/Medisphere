import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  Hbar
} from '@hashgraph/sdk';
import { getHederaClientForUser, getPlatformHederaClient } from './hederaOperator.js';

let topicIdCache = null;

export async function ensureAuditTopic(client, configuredTopicId, memo = 'MediSphere HCS Audit Log') {
  // Use MediSphere-specific topic ID from environment
  const medisphereTopicId = process.env.MEDISPHERE_HCS_AUDIT_TOPIC_ID;

  if (medisphereTopicId && medisphereTopicId !== '0.0.YOUR_TOPIC_ID') {
    topicIdCache = medisphereTopicId;
    console.log('\n[HCS] Using MediSphere audit TopicId:', topicIdCache);
    return medisphereTopicId;
  }

  if (configuredTopicId && configuredTopicId !== '0.0.YOUR_TOPIC_ID') {
    topicIdCache = configuredTopicId;
    return configuredTopicId;
  }
  const createTx = await new TopicCreateTransaction()
    .setTopicMemo(memo)
    .setAdminKey(client.operatorPublicKey)
    .setSubmitKey(client.operatorPublicKey)
    .setMaxTransactionFee(new Hbar(2))
    .execute(client);
  const receipt = await createTx.getReceipt(client);
  topicIdCache = receipt.topicId.toString();
  console.log('\n[HCS] Created audit TopicId:', topicIdCache);
  return topicIdCache;
}

export async function hcsLog(clientOrUserId, action, actor, metadata = {}) {
  if (!topicIdCache) throw new Error('HCS topic not initialized');

  let client = clientOrUserId;
  let operatorInfo = { operatorId: 'unknown', isUserAccount: false };

  // If clientOrUserId is a string (user ID), get user-specific client
  if (typeof clientOrUserId === 'string') {
    const result = await getHederaClientForUser(clientOrUserId, true);
    client = result.client;
    operatorInfo = { operatorId: result.operatorId, isUserAccount: result.isUserAccount };
  }

  const payload = JSON.stringify({
    action,
    actor,
    metadata: { ...metadata, ...operatorInfo },
    ts: new Date().toISOString()
  });

  try {
    const txResponse = await new TopicMessageSubmitTransaction()
      .setTopicId(topicIdCache)
      .setMessage(payload)
      .execute(client);

    // Get the transaction receipt to retrieve the transaction hash
    const receipt = await txResponse.getReceipt(client);
    const transactionId = txResponse.transactionId.toString();

    console.log(`[HCS] Logged action: ${action}, TxID: ${transactionId}`);

    return {
      transactionId,
      topicId: topicIdCache,
      status: receipt.status.toString()
    };
  } catch (error) {
    // If user account fails, fallback to platform account
    if (operatorInfo.isUserAccount) {
      console.log('User account HCS log failed, using platform account...');
      const platformClient = getPlatformHederaClient();
      const fallbackPayload = JSON.stringify({
        action,
        actor,
        metadata: { ...metadata, operatorId: process.env.OPERATOR_ID, isUserAccount: false, fallbackUsed: true },
        ts: new Date().toISOString()
      });

      const txResponse = await new TopicMessageSubmitTransaction()
        .setTopicId(topicIdCache)
        .setMessage(fallbackPayload)
        .execute(platformClient);

      const receipt = await txResponse.getReceipt(platformClient);
      const transactionId = txResponse.transactionId.toString();

      return {
        transactionId,
        topicId: topicIdCache,
        status: receipt.status.toString()
      };
    } else {
      throw error;
    }
  }
}

export function getAuditTopicId() { return topicIdCache; }
