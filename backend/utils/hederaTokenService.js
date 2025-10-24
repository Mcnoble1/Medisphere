import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  TokenId,
  AccountId,
  PrivateKey,
  Hbar,
  TokenAssociateTransaction,
} from '@hashgraph/sdk';
import { getPlatformHederaClient } from './hederaOperator.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create a new fungible HTS token for a campaign
 * @param {Object} params - Token creation parameters
 * @param {string} params.name - Token name
 * @param {string} params.symbol - Token symbol
 * @param {number} params.initialSupply - Initial token supply
 * @param {number} params.decimals - Number of decimals (default: 2)
 * @param {string} params.treasuryAccountId - Treasury account ID (platform account)
 * @returns {Promise<Object>} Token creation result with tokenId
 */
export const createCampaignToken = async ({
  name,
  symbol,
  initialSupply,
  decimals = 2,
  treasuryAccountId = process.env.OPERATOR_ID,
}) => {
  try {
    const client = getPlatformHederaClient();
    const operatorKeyString = process.env.OPERATOR_KEY;

    // Parse the private key - handle both hex and DER formats
    let treasuryKey;
    try {
      treasuryKey = PrivateKey.fromStringDer(operatorKeyString);
    } catch (derError) {
      try {
        treasuryKey = PrivateKey.fromString(operatorKeyString);
      } catch (stringError) {
        throw new Error(`Failed to parse OPERATOR_KEY: ${derError.message}`);
      }
    }

    // Create the token
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(decimals)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(treasuryAccountId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(treasuryKey)
      .setAdminKey(treasuryKey)
      .freezeWith(client);

    const tokenCreateSign = await tokenCreateTx.sign(treasuryKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId.toString();

    console.log(`Created campaign token: ${tokenId} (${symbol})`);

    return {
      success: true,
      tokenId,
      tokenSymbol: symbol,
      tokenName: name,
      initialSupply,
      transactionId: tokenCreateSubmit.transactionId.toString(),
    };
  } catch (error) {
    console.error('Error creating campaign token:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Associate a token with a user's account
 * @param {string} tokenId - Token ID to associate
 * @param {string} accountId - User's Hedera account ID
 * @param {string} privateKey - User's private key
 * @returns {Promise<Object>} Association result
 */
export const associateTokenWithAccount = async (tokenId, accountId, privateKey) => {
  try {
    const client = Client.forTestnet();
    const userKey = PrivateKey.fromString(privateKey);
    client.setOperator(accountId, userKey);

    const associateTx = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([TokenId.fromString(tokenId)])
      .freezeWith(client);

    const associateSign = await associateTx.sign(userKey);
    const associateSubmit = await associateSign.execute(client);
    const associateReceipt = await associateSubmit.getReceipt(client);

    console.log(`Associated token ${tokenId} with account ${accountId}`);

    return {
      success: true,
      status: associateReceipt.status.toString(),
      transactionId: associateSubmit.transactionId.toString(),
    };
  } catch (error) {
    console.error('Error associating token:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Transfer HTS tokens from treasury to participant
 * @param {Object} params - Transfer parameters
 * @param {string} params.tokenId - Token ID
 * @param {string} params.fromAccountId - Sender account ID (treasury)
 * @param {string} params.fromPrivateKey - Sender private key
 * @param {string} params.toAccountId - Recipient account ID
 * @param {number} params.amount - Amount to transfer
 * @returns {Promise<Object>} Transfer result
 */
export const transferCampaignTokens = async ({
  tokenId,
  fromAccountId = process.env.OPERATOR_ID,
  fromPrivateKey = process.env.OPERATOR_KEY,
  toAccountId,
  amount,
}) => {
  try {
    const client = Client.forTestnet();

    // Parse the private key - handle both hex and DER formats
    let fromKey;
    try {
      fromKey = PrivateKey.fromStringDer(fromPrivateKey);
    } catch (derError) {
      try {
        fromKey = PrivateKey.fromString(fromPrivateKey);
      } catch (stringError) {
        throw new Error(`Failed to parse private key: ${derError.message}`);
      }
    }

    client.setOperator(fromAccountId, fromKey);

    const transferTx = await new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(fromAccountId), -amount)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(toAccountId), amount)
      .freezeWith(client);

    const transferSign = await transferTx.sign(fromKey);
    const transferSubmit = await transferSign.execute(client);
    const transferReceipt = await transferSubmit.getReceipt(client);

    console.log(`Transferred ${amount} tokens (${tokenId}) to ${toAccountId}`);

    return {
      success: true,
      status: transferReceipt.status.toString(),
      transactionId: transferSubmit.transactionId.toString(),
      amount,
      recipient: toAccountId,
    };
  } catch (error) {
    console.error('Error transferring campaign tokens:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Transfer HBAR rewards to participant
 * @param {Object} params - Transfer parameters
 * @param {string} params.toAccountId - Recipient account ID
 * @param {number} params.amount - Amount in HBAR
 * @param {string} params.memo - Transaction memo
 * @returns {Promise<Object>} Transfer result
 */
export const transferHbarReward = async ({ toAccountId, amount, memo = 'Campaign reward' }) => {
  try {
    const client = getPlatformHederaClient();

    const transferTx = await new TransferTransaction()
      .addHbarTransfer(process.env.OPERATOR_ID, new Hbar(-amount))
      .addHbarTransfer(toAccountId, new Hbar(amount))
      .setTransactionMemo(memo)
      .execute(client);

    const transferReceipt = await transferTx.getReceipt(client);

    console.log(`Transferred ${amount} HBAR to ${toAccountId}`);

    return {
      success: true,
      status: transferReceipt.status.toString(),
      transactionId: transferTx.transactionId.toString(),
      amount,
      recipient: toAccountId,
    };
  } catch (error) {
    console.error('Error transferring HBAR reward:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Mint additional tokens to the treasury (for ongoing campaigns)
 * @param {string} tokenId - Token ID
 * @param {number} amount - Amount to mint
 * @returns {Promise<Object>} Mint result
 */
export const mintCampaignTokens = async (tokenId, amount) => {
  try {
    const client = getPlatformHederaClient();
    const operatorKeyString = process.env.OPERATOR_KEY;

    // Parse the private key - handle both hex and DER formats
    let supplyKey;
    try {
      supplyKey = PrivateKey.fromStringDer(operatorKeyString);
    } catch (derError) {
      try {
        supplyKey = PrivateKey.fromString(operatorKeyString);
      } catch (stringError) {
        throw new Error(`Failed to parse OPERATOR_KEY: ${derError.message}`);
      }
    }

    const mintTx = await new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .setAmount(amount)
      .freezeWith(client);

    const mintSign = await mintTx.sign(supplyKey);
    const mintSubmit = await mintSign.execute(client);
    const mintReceipt = await mintSubmit.getReceipt(client);

    console.log(`Minted ${amount} tokens for ${tokenId}`);

    return {
      success: true,
      status: mintReceipt.status.toString(),
      transactionId: mintSubmit.transactionId.toString(),
      amount,
    };
  } catch (error) {
    console.error('Error minting campaign tokens:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Batch distribute rewards to multiple participants
 * @param {Object} params - Batch transfer parameters
 * @param {string} params.campaignId - Campaign ID
 * @param {Array} params.participants - Array of {accountId, amount}
 * @param {string} params.rewardType - 'hbar' or 'hts-token'
 * @param {string} params.tokenId - Token ID (for HTS tokens)
 * @returns {Promise<Object>} Batch transfer result
 */
export const batchDistributeRewards = async ({ campaignId, participants, rewardType, tokenId }) => {
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const participant of participants) {
    try {
      let result;

      if (rewardType === 'hbar') {
        result = await transferHbarReward({
          toAccountId: participant.accountId,
          amount: participant.amount,
          memo: `Campaign ${campaignId} reward`,
        });
      } else if (rewardType === 'hts-token') {
        result = await transferCampaignTokens({
          tokenId,
          toAccountId: participant.accountId,
          amount: participant.amount,
        });
      }

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      results.push({
        participantId: participant.userId,
        accountId: participant.accountId,
        ...result,
      });
    } catch (error) {
      failCount++;
      results.push({
        participantId: participant.userId,
        accountId: participant.accountId,
        success: false,
        error: error.message,
      });
    }
  }

  return {
    success: failCount === 0,
    totalParticipants: participants.length,
    successCount,
    failCount,
    results,
  };
};
