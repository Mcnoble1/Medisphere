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
  AccountBalanceQuery,
} from '@hashgraph/sdk';
import { getPlatformHederaClient } from './hederaOperator.js';
import PaymentAccount from '../models/paymentModel.js';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create or get user's payment account with Hedera integration
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Payment account
 */
export const getOrCreatePaymentAccount = async (userId) => {
  try {
    let account = await PaymentAccount.findOne({ user: userId })
      .populate('user', 'firstName lastName email role hederaAccountId');

    if (!account) {
      const user = await User.findById(userId);

      // Create new payment account
      account = await PaymentAccount.create({
        user: userId,
        healthTokens: 100, // Welcome bonus
        loyaltyPoints: 50,
        hederaAccountId: user.hederaAccountId || null,
        htsTokenBalances: [],
      });

      await account.populate('user', 'firstName lastName email role hederaAccountId');
    }

    return account;
  } catch (error) {
    console.error('Error getting/creating payment account:', error);
    throw error;
  }
};

/**
 * Associate an HTS token with user's account
 * @param {string} userId - User ID
 * @param {string} tokenId - HTS Token ID
 * @param {string} tokenSymbol - Token symbol
 * @param {string} tokenName - Token name
 * @param {number} decimals - Token decimals
 * @returns {Promise<Object>} Association result
 */
export const associateUserWithToken = async (userId, tokenId, tokenSymbol, tokenName, decimals = 2) => {
  try {
    const user = await User.findById(userId).select('+hederaPrivateKey');
    if (!user.hederaAccountId || !user.hederaPrivateKey) {
      throw new Error('User does not have a Hedera account');
    }

    const account = await getOrCreatePaymentAccount(userId);

    // Check if already associated
    const existingToken = account.htsTokenBalances.find(t => t.tokenId === tokenId);
    if (existingToken && existingToken.associated) {
      return {
        success: true,
        message: 'Token already associated',
        tokenId,
        alreadyAssociated: true,
      };
    }

    // Associate token with user's account
    const client = Client.forTestnet();
    const userKey = PrivateKey.fromString(user.hederaPrivateKey);
    client.setOperator(user.hederaAccountId, userKey);

    const associateTx = await new TokenAssociateTransaction()
      .setAccountId(user.hederaAccountId)
      .setTokenIds([TokenId.fromString(tokenId)])
      .freezeWith(client);

    const associateSign = await associateTx.sign(userKey);
    const associateSubmit = await associateSign.execute(client);
    const associateReceipt = await associateSubmit.getReceipt(client);

    // Update payment account with token info
    if (existingToken) {
      existingToken.associated = true;
      existingToken.associatedAt = new Date();
      existingToken.tokenSymbol = tokenSymbol;
      existingToken.tokenName = tokenName;
      existingToken.decimals = decimals;
    } else {
      account.htsTokenBalances.push({
        tokenId,
        tokenSymbol,
        tokenName,
        balance: 0,
        decimals,
        associated: true,
        associatedAt: new Date(),
      });
    }

    await account.save();

    console.log(`Associated token ${tokenId} with user ${userId}`);

    return {
      success: true,
      status: associateReceipt.status.toString(),
      transactionId: associateSubmit.transactionId.toString(),
      tokenId,
      tokenSymbol,
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
 * Transfer HTS tokens from platform to user
 * @param {Object} params - Transfer parameters
 * @param {string} params.userId - User ID
 * @param {string} params.tokenId - HTS Token ID
 * @param {string} params.tokenSymbol - Token symbol
 * @param {string} params.tokenName - Token name
 * @param {number} params.amount - Amount to transfer
 * @param {string} params.description - Transaction description
 * @param {string} params.type - Transaction type
 * @returns {Promise<Object>} Transfer result
 */
export const transferTokensToUser = async ({
  userId,
  tokenId,
  tokenSymbol,
  tokenName,
  amount,
  description,
  type = 'reward',
  relatedService = null,
  relatedRecord = null,
  relatedModel = null,
}) => {
  try {
    const user = await User.findById(userId);
    if (!user.hederaAccountId) {
      throw new Error('User does not have a Hedera account');
    }

    // Ensure user is associated with token
    const associationResult = await associateUserWithToken(userId, tokenId, tokenSymbol, tokenName);
    if (!associationResult.success && !associationResult.alreadyAssociated) {
      throw new Error(`Failed to associate token: ${associationResult.error}`);
    }

    // Transfer tokens from platform to user
    const client = Client.forTestnet();
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    client.setOperator(process.env.OPERATOR_ID, operatorKey);

    const transferTx = await new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(process.env.OPERATOR_ID), -amount)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(user.hederaAccountId), amount)
      .freezeWith(client);

    const transferSign = await transferTx.sign(operatorKey);
    const transferSubmit = await transferSign.execute(client);
    const transferReceipt = await transferSubmit.getReceipt(client);

    // Update payment account
    const account = await getOrCreatePaymentAccount(userId);
    const tokenBalance = account.htsTokenBalances.find(t => t.tokenId === tokenId);
    if (tokenBalance) {
      tokenBalance.balance += amount;
    }

    // Add transaction record
    account.transactions.push({
      type,
      amount,
      description,
      tokenType: 'hts_token',
      tokenId,
      tokenSymbol,
      tokenName,
      fromAccountId: process.env.OPERATOR_ID,
      toAccountId: user.hederaAccountId,
      toUserId: userId,
      relatedService,
      relatedRecord,
      relatedModel,
      hederaTransactionId: transferSubmit.transactionId.toString(),
      status: 'completed',
    });

    account.totalEarned += amount;
    await account.save();

    console.log(`Transferred ${amount} ${tokenSymbol} to user ${userId}`);

    return {
      success: true,
      status: transferReceipt.status.toString(),
      transactionId: transferSubmit.transactionId.toString(),
      amount,
      tokenId,
      tokenSymbol,
      recipient: user.hederaAccountId,
    };
  } catch (error) {
    console.error('Error transferring tokens to user:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Transfer HTS tokens between users
 * @param {Object} params - Transfer parameters
 * @param {string} params.fromUserId - Sender user ID
 * @param {string} params.toUserId - Recipient user ID
 * @param {string} params.tokenId - HTS Token ID
 * @param {number} params.amount - Amount to transfer
 * @param {string} params.description - Transaction description
 * @returns {Promise<Object>} Transfer result
 */
export const transferTokensBetweenUsers = async ({
  fromUserId,
  toUserId,
  tokenId,
  amount,
  description = 'Token transfer',
}) => {
  try {
    const fromUser = await User.findById(fromUserId).select('+hederaPrivateKey');
    const toUser = await User.findById(toUserId);

    if (!fromUser.hederaAccountId || !fromUser.hederaPrivateKey) {
      throw new Error('Sender does not have a Hedera account');
    }
    if (!toUser.hederaAccountId) {
      throw new Error('Recipient does not have a Hedera account');
    }

    // Get sender's payment account
    const fromAccount = await getOrCreatePaymentAccount(fromUserId);
    const tokenBalance = fromAccount.htsTokenBalances.find(t => t.tokenId === tokenId);

    if (!tokenBalance || tokenBalance.balance < amount) {
      throw new Error('Insufficient token balance');
    }

    // Ensure recipient is associated with token
    const toAccount = await getOrCreatePaymentAccount(toUserId);
    const toTokenBalance = toAccount.htsTokenBalances.find(t => t.tokenId === tokenId);

    if (!toTokenBalance || !toTokenBalance.associated) {
      await associateUserWithToken(toUserId, tokenId, tokenBalance.tokenSymbol, tokenBalance.tokenName, tokenBalance.decimals);
    }

    // Transfer tokens
    const client = Client.forTestnet();
    const fromKey = PrivateKey.fromString(fromUser.hederaPrivateKey);
    client.setOperator(fromUser.hederaAccountId, fromKey);

    const transferTx = await new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(fromUser.hederaAccountId), -amount)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(toUser.hederaAccountId), amount)
      .freezeWith(client);

    const transferSign = await transferTx.sign(fromKey);
    const transferSubmit = await transferSign.execute(client);
    const transferReceipt = await transferSubmit.getReceipt(client);

    const txId = transferSubmit.transactionId.toString();

    // Update sender's account
    tokenBalance.balance -= amount;
    fromAccount.transactions.push({
      type: 'transferred',
      amount,
      description: `Transfer to ${toUser.firstName} ${toUser.lastName}: ${description}`,
      tokenType: 'hts_token',
      tokenId,
      tokenSymbol: tokenBalance.tokenSymbol,
      tokenName: tokenBalance.tokenName,
      fromAccountId: fromUser.hederaAccountId,
      toAccountId: toUser.hederaAccountId,
      fromUserId,
      toUserId,
      hederaTransactionId: txId,
      status: 'completed',
    });
    fromAccount.totalSpent += amount;
    await fromAccount.save();

    // Update recipient's account
    const recipientTokenBalance = toAccount.htsTokenBalances.find(t => t.tokenId === tokenId);
    if (recipientTokenBalance) {
      recipientTokenBalance.balance += amount;
    }
    toAccount.transactions.push({
      type: 'earned',
      amount,
      description: `Transfer from ${fromUser.firstName} ${fromUser.lastName}: ${description}`,
      tokenType: 'hts_token',
      tokenId,
      tokenSymbol: tokenBalance.tokenSymbol,
      tokenName: tokenBalance.tokenName,
      fromAccountId: fromUser.hederaAccountId,
      toAccountId: toUser.hederaAccountId,
      fromUserId,
      toUserId,
      hederaTransactionId: txId,
      status: 'completed',
    });
    toAccount.totalEarned += amount;
    await toAccount.save();

    console.log(`Transferred ${amount} tokens from ${fromUserId} to ${toUserId}`);

    return {
      success: true,
      status: transferReceipt.status.toString(),
      transactionId: txId,
      amount,
      tokenId,
      tokenSymbol: tokenBalance.tokenSymbol,
    };
  } catch (error) {
    console.error('Error transferring tokens between users:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user's token balances from Hedera network
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Token balances
 */
export const getUserTokenBalances = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user.hederaAccountId) {
      return {
        success: false,
        error: 'User does not have a Hedera account',
      };
    }

    const client = getPlatformHederaClient();
    const query = new AccountBalanceQuery()
      .setAccountId(user.hederaAccountId);

    const accountBalance = await query.execute(client);

    // Get HTS token balances
    const htsBalances = [];
    if (accountBalance.tokens) {
      accountBalance.tokens.forEach((balance, tokenId) => {
        htsBalances.push({
          tokenId: tokenId.toString(),
          balance: balance.toNumber(),
        });
      });
    }

    // Sync with database
    const account = await getOrCreatePaymentAccount(userId);
    for (const htsBalance of htsBalances) {
      const tokenInDb = account.htsTokenBalances.find(t => t.tokenId === htsBalance.tokenId);
      if (tokenInDb) {
        tokenInDb.balance = htsBalance.balance;
      }
    }
    await account.save();

    return {
      success: true,
      hbarBalance: accountBalance.hbars.toString(),
      htsBalances,
      healthTokens: account.healthTokens,
    };
  } catch (error) {
    console.error('Error getting user token balances:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Award insurance claim tokens
 * @param {string} userId - User ID
 * @param {number} amount - Amount to award
 * @param {string} claimId - Insurance claim ID
 * @returns {Promise<Object>} Award result
 */
export const awardClaimTokens = async (userId, amount, claimId) => {
  try {
    const account = await getOrCreatePaymentAccount(userId);

    // Add health tokens for insurance claim
    account.healthTokens += amount;
    account.totalEarned += amount;

    account.transactions.push({
      type: 'claim_reward',
      amount,
      description: `Insurance claim reward for claim #${claimId}`,
      tokenType: 'health_token',
      relatedService: 'claimsphere',
      relatedRecord: claimId,
      relatedModel: 'InsuranceClaim',
      hederaTransactionId: `claim_${claimId}_${Date.now()}`,
      status: 'completed',
    });

    await account.save();

    console.log(`Awarded ${amount} health tokens for insurance claim ${claimId}`);

    return {
      success: true,
      amount,
      newBalance: account.healthTokens,
    };
  } catch (error) {
    console.error('Error awarding claim tokens:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  getOrCreatePaymentAccount,
  associateUserWithToken,
  transferTokensToUser,
  transferTokensBetweenUsers,
  getUserTokenBalances,
  awardClaimTokens,
};
