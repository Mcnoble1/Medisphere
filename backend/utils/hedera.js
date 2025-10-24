import {
  Client,
  TopicMessageSubmitTransaction,
  PrivateKey,
} from '@hashgraph/sdk';
import { getHederaClientForUser, getPlatformHederaClient } from './hederaOperator.js';
import dotenv from 'dotenv';
dotenv.config();

const topicId = process.env.HEDERA_TOPIC_ID;

// Submit message to HCS topic using user's operator or platform account
export const submitToHCS = async (messageObj, userId = null) => {
  try {
    const message = JSON.stringify(messageObj);

    // Get appropriate client (user account preferred, but fallback to platform)
    const { client, operatorId, isUserAccount } = userId
      ? await getHederaClientForUser(userId, true)
      : { client: getPlatformHederaClient(), operatorId: process.env.OPERATOR_ID, isUserAccount: false };

    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(client);

    const receipt = await submitTx.getReceipt(client);
    const messageId = submitTx.transactionId.toString();

    console.log(`HCS Message Submitted: ${messageId} (Operator: ${operatorId}, User Account: ${isUserAccount})`);
    return {
      messageId,
      operatorId,
      isUserAccount
    };
  } catch (error) {
    console.error('Failed to submit to HCS:', error);
    // If user account failed, try with platform account
    if (userId) {
      console.log('Retrying with platform account...');
      try {
        const client = getPlatformHederaClient();
        const message = JSON.stringify(messageObj);

        const submitTx = await new TopicMessageSubmitTransaction()
          .setTopicId(topicId)
          .setMessage(message)
          .execute(client);

        const receipt = await submitTx.getReceipt(client);
        const messageId = submitTx.transactionId.toString();

        console.log(`HCS Message Submitted with platform account: ${messageId}`);
        return {
          messageId,
          operatorId: process.env.OPERATOR_ID,
          isUserAccount: false
        };
      } catch (fallbackError) {
        console.error('Platform account fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
};
