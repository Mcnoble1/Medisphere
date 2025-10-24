import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Get Hedera client configured with user's account as operator, or fallback to platform account
 * @param {string} userId - The user ID
 * @param {boolean} preferUserAccount - Whether to prefer user account over platform account
 * @returns {Promise<{client: Client, operatorId: string, isUserAccount: boolean}>}
 */
export async function getHederaClientForUser(userId, preferUserAccount = true) {
  try {
    let operatorId = process.env.OPERATOR_ID;
    let operatorKeyString = process.env.OPERATOR_KEY;
    let isUserAccount = false;

    if (preferUserAccount && userId) {
      // Try to get user's Hedera account
      const user = await User.findById(userId).select('+hederaPrivateKey');

      if (user && user.hederaAccountId && user.hederaPrivateKey) {
        operatorId = user.hederaAccountId;
        operatorKeyString = user.hederaPrivateKey;
        isUserAccount = true;
        console.log(`Using user account ${operatorId} as operator for user ${userId}`);
      } else {
        console.log(`User account not available for ${userId}, using platform account ${operatorId}`);
      }
    }

    // Parse the private key - handle both hex and DER formats
    let operatorKey;
    try {
      operatorKey = PrivateKey.fromStringDer(operatorKeyString);
    } catch (derError) {
      try {
        operatorKey = PrivateKey.fromString(operatorKeyString);
      } catch (stringError) {
        throw new Error(`Failed to parse private key: ${derError.message}`);
      }
    }

    // Create client
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    return {
      client,
      operatorId,
      isUserAccount
    };

  } catch (error) {
    console.error('Error setting up Hedera client:', error);

    // Fallback to platform account
    console.log('Falling back to platform account...');
    const client = getPlatformHederaClient();

    return {
      client,
      operatorId: process.env.OPERATOR_ID,
      isUserAccount: false
    };
  }
}

/**
 * Get platform Hedera client (always uses platform account)
 * @returns {Client}
 */
export function getPlatformHederaClient() {
  try {
    const client = Client.forTestnet();
    const operatorId = process.env.OPERATOR_ID;
    const operatorKeyString = process.env.OPERATOR_KEY;

    if (!operatorId || !operatorKeyString) {
      throw new Error('OPERATOR_ID or OPERATOR_KEY not set in environment variables');
    }

    // Parse the private key - handle both hex and DER formats
    let operatorKey;
    try {
      operatorKey = PrivateKey.fromStringDer(operatorKeyString);
    } catch (derError) {
      try {
        operatorKey = PrivateKey.fromString(operatorKeyString);
      } catch (stringError) {
        throw new Error(`Failed to parse OPERATOR_KEY: ${derError.message}`);
      }
    }

    client.setOperator(operatorId, operatorKey);
    console.log(`[Hedera] Platform client initialized with account ${operatorId}`);
    return client;
  } catch (error) {
    console.error('[Hedera] Failed to initialize platform client:', error);
    throw error;
  }
}