import PaymentAccount from '../models/paymentModel.js';
import { User } from '../models/userModel.js';
import { hcsLog } from '../utils/hcsLogger.js';
import createError from 'http-errors';
import {
  getOrCreatePaymentAccount,
  associateUserWithToken,
  transferTokensToUser,
  transferTokensBetweenUsers,
  getUserTokenBalances,
} from '../utils/carexpayService.js';

// @desc    Get or create payment account for user
// @route   GET /api/payments/account
// @access  Private
export const getPaymentAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let account = await PaymentAccount.findOne({ user: userId })
      .populate('user', 'firstName lastName email role hederaAccountId');

    if (!account) {
      // Get user to fetch their Hedera Account ID
      const user = await User.findById(userId);

      // Create new payment account
      account = await PaymentAccount.create({
        user: userId,
        healthTokens: 100, // Welcome bonus
        loyaltyPoints: 50,
        hederaAccountId: user?.hederaAccountId || null,
      });

      await account.populate('user', 'firstName lastName email role hederaAccountId');

      // Log account creation
      await hcsLog(req.hederaClient, 'PAYMENT_ACCOUNT_CREATED', account._id.toString(), {
        userId,
        initialTokens: 100,
      });
    } else {
      // Sync hederaAccountId from user if not already set
      if (!account.hederaAccountId && account.user.hederaAccountId) {
        account.hederaAccountId = account.user.hederaAccountId;
        await account.save();
      }
    }

    res.json({ account });

  } catch (err) {
    next(err);
  }
};

// @desc    Add transaction to account
// @route   POST /api/payments/transactions
// @access  Private
export const addTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      type,
      amount,
      description,
      relatedService,
      relatedRecord,
      relatedModel
    } = req.body;

    // Get user's payment account
    let account = await PaymentAccount.findOne({ user: userId });
    if (!account) {
      account = await PaymentAccount.create({
        user: userId,
        healthTokens: 0,
        loyaltyPoints: 0,
      });
    }

    // Create transaction
    const transaction = {
      type,
      amount: Math.abs(amount),
      description,
      relatedService,
      relatedRecord,
      relatedModel,
      hederaTransactionId: `htx_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    };

    // Update balances based on transaction type
    if (['earned', 'reward', 'grant'].includes(type)) {
      account.healthTokens += transaction.amount;
      account.totalEarned += transaction.amount;
    } else if (['spent', 'transferred'].includes(type)) {
      if (account.healthTokens < transaction.amount) {
        throw createError(400, 'Insufficient token balance');
      }
      account.healthTokens -= transaction.amount;
      account.totalSpent += transaction.amount;
    }

    // Add transaction to history
    account.transactions.push(transaction);

    await account.save();

    // Log transaction
    await hcsLog(req.hederaClient, 'TOKEN_TRANSACTION', transaction.hederaTransactionId, {
      userId,
      type,
      amount: transaction.amount,
      newBalance: account.healthTokens,
    });

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction,
      newBalance: account.healthTokens
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get transaction history
// @route   GET /api/payments/transactions
// @access  Private
export const getTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, limit = 50, offset = 0 } = req.query;

    const account = await PaymentAccount.findOne({ user: userId });
    if (!account) {
      return res.json({ transactions: [], pagination: { total: 0, limit, offset, hasMore: false } });
    }

    let transactions = account.transactions;

    // Filter by type if specified
    if (type && type !== 'all') {
      transactions = transactions.filter(tx => tx.type === type);
    }

    // Sort by newest first
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const total = transactions.length;
    const paginatedTransactions = transactions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      transactions: paginatedTransactions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Add payment method
// @route   POST /api/payments/methods
// @access  Private
export const addPaymentMethod = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, provider, identifier, isDefault } = req.body;

    let account = await PaymentAccount.findOne({ user: userId });
    if (!account) {
      account = await PaymentAccount.create({
        user: userId,
        healthTokens: 0,
        loyaltyPoints: 0,
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      account.paymentMethods.forEach(method => {
        method.isDefault = false;
      });
    }

    // Add new payment method
    const paymentMethod = {
      type,
      provider,
      identifier,
      isDefault: isDefault || account.paymentMethods.length === 0, // First method is default
      verificationStatus: 'pending'
    };

    account.paymentMethods.push(paymentMethod);
    await account.save();

    res.status(201).json({
      message: 'Payment method added successfully',
      paymentMethod
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Private
export const getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const account = await PaymentAccount.findOne({ user: userId });
    if (!account) {
      return res.json({ paymentMethods: [] });
    }

    res.json({
      paymentMethods: account.paymentMethods
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Transfer tokens between users
// @route   POST /api/payments/transfer
// @access  Private
export const transferTokens = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { recipientId, amount, description } = req.body;

    if (senderId === recipientId) {
      throw createError(400, 'Cannot transfer tokens to yourself');
    }

    if (amount <= 0) {
      throw createError(400, 'Transfer amount must be positive');
    }

    // Get sender account
    const senderAccount = await PaymentAccount.findOne({ user: senderId });
    if (!senderAccount || senderAccount.healthTokens < amount) {
      throw createError(400, 'Insufficient token balance');
    }

    // Get or create recipient account
    let recipientAccount = await PaymentAccount.findOne({ user: recipientId });
    if (!recipientAccount) {
      recipientAccount = await PaymentAccount.create({
        user: recipientId,
        healthTokens: 0,
        loyaltyPoints: 0,
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      throw createError(404, 'Recipient not found');
    }

    // Create transfer ID
    const transferId = `TXF_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

    // Sender transaction
    const senderTransaction = {
      type: 'transferred',
      amount,
      description: `Transfer to ${recipient.firstName} ${recipient.lastName}: ${description}`,
      hederaTransactionId: `${transferId}_OUT`
    };

    // Recipient transaction
    const recipientTransaction = {
      type: 'earned',
      amount,
      description: `Transfer from ${req.user.firstName} ${req.user.lastName}: ${description}`,
      hederaTransactionId: `${transferId}_IN`
    };

    // Update balances
    senderAccount.healthTokens -= amount;
    senderAccount.totalSpent += amount;
    senderAccount.transactions.push(senderTransaction);

    recipientAccount.healthTokens += amount;
    recipientAccount.totalEarned += amount;
    recipientAccount.transactions.push(recipientTransaction);

    await senderAccount.save();
    await recipientAccount.save();

    // Log transfer
    await hcsLog(req.hederaClient, 'TOKEN_TRANSFER', transferId, {
      senderId,
      recipientId,
      amount,
      description,
    });

    res.json({
      message: 'Transfer completed successfully',
      transferId,
      newBalance: senderAccount.healthTokens
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get account analytics
// @route   GET /api/payments/analytics
// @access  Private
export const getAccountAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const account = await PaymentAccount.findOne({ user: userId });
    if (!account) {
      return res.json({
        totalEarned: 0,
        totalSpent: 0,
        currentBalance: 0,
        transactionsByType: [],
        recentActivity: []
      });
    }

    // Analyze transactions by type
    const transactionsByType = account.transactions.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + tx.amount;
      return acc;
    }, {});

    // Get recent activity (last 10 transactions)
    const recentActivity = account.transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      totalEarned: account.totalEarned,
      totalSpent: account.totalSpent,
      currentBalance: account.healthTokens,
      loyaltyPoints: account.loyaltyPoints,
      transactionsByType,
      recentActivity
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Associate HTS token with user account
// @route   POST /api/payments/tokens/associate
// @access  Private
export const associateToken = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tokenId, tokenSymbol, tokenName, decimals } = req.body;

    if (!tokenId || !tokenSymbol || !tokenName) {
      throw createError(400, 'Token ID, symbol, and name are required');
    }

    const result = await associateUserWithToken(userId, tokenId, tokenSymbol, tokenName, decimals);

    if (!result.success) {
      throw createError(500, result.error || 'Failed to associate token');
    }

    res.json({
      message: result.alreadyAssociated ? 'Token already associated' : 'Token associated successfully',
      ...result
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Send HTS tokens to another user
// @route   POST /api/payments/tokens/send
// @access  Private
export const sendHTSTokens = async (req, res, next) => {
  try {
    const fromUserId = req.user.id;
    const { toUserId, toAccountId, tokenId, amount, description } = req.body;

    if (!tokenId || !amount || amount <= 0) {
      throw createError(400, 'Valid token ID and amount are required');
    }

    let recipientUserId = toUserId;

    // If toAccountId is provided, find user by Hedera account ID
    if (toAccountId && !recipientUserId) {
      const recipient = await User.findOne({ hederaAccountId: toAccountId });
      if (!recipient) {
        throw createError(404, 'Recipient not found');
      }
      recipientUserId = recipient._id.toString();
    }

    if (!recipientUserId) {
      throw createError(400, 'Recipient user ID or account ID is required');
    }

    if (fromUserId === recipientUserId) {
      throw createError(400, 'Cannot send tokens to yourself');
    }

    const result = await transferTokensBetweenUsers({
      fromUserId,
      toUserId: recipientUserId,
      tokenId,
      amount,
      description: description || 'Token transfer',
    });

    if (!result.success) {
      throw createError(500, result.error || 'Failed to send tokens');
    }

    // Log transfer
    await hcsLog(req.hederaClient, 'HTS_TOKEN_TRANSFER', result.transactionId, {
      fromUserId,
      toUserId: recipientUserId,
      tokenId,
      amount,
    });

    res.json({
      message: 'Tokens sent successfully',
      ...result
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get all token balances (Health tokens + HTS tokens)
// @route   GET /api/payments/tokens/balances
// @access  Private
export const getTokenBalances = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { syncWithNetwork } = req.query;

    const account = await getOrCreatePaymentAccount(userId);

    // Optionally sync with Hedera network
    if (syncWithNetwork === 'true') {
      const networkBalances = await getUserTokenBalances(userId);
      if (networkBalances.success) {
        // Refresh account data after sync
        await account.reload();
      }
    }

    // Build response with all token types
    const balances = [
      {
        type: 'health_token',
        symbol: 'CARE',
        name: 'Care Health Tokens',
        balance: account.healthTokens,
        decimals: 0,
        icon: '💊',
      },
      ...account.htsTokenBalances.map(token => ({
        type: 'hts_token',
        tokenId: token.tokenId,
        symbol: token.tokenSymbol,
        name: token.tokenName,
        balance: token.balance,
        decimals: token.decimals,
        associated: token.associated,
        icon: '🎁',
      }))
    ];

    res.json({
      balances,
      hederaAccountId: account.hederaAccountId,
      totalEarned: account.totalEarned,
      totalSpent: account.totalSpent,
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get available campaign tokens
// @route   GET /api/payments/tokens/campaign-rewards
// @access  Private
export const getCampaignRewardTokens = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const Campaign = (await import('../models/campaignModel.js')).default;

    // Get campaigns where user is a participant
    const campaigns = await Campaign.find({
      'participants.userId': userId,
    }).select('title rewardConfig participants');

    const rewardTokens = [];

    for (const campaign of campaigns) {
      if (campaign.rewardConfig?.rewardType === 'hts-token' && campaign.rewardConfig.tokenId) {
        const participant = campaign.participants.find(p =>
          p.userId.toString() === userId
        );

        if (participant && participant.reward) {
          rewardTokens.push({
            campaignId: campaign._id,
            campaignTitle: campaign.title,
            tokenId: campaign.rewardConfig.tokenId,
            tokenSymbol: campaign.rewardConfig.tokenSymbol,
            tokenName: campaign.rewardConfig.tokenName,
            rewardAmount: participant.reward.amount,
            distributed: participant.reward.distributed,
            distributedAt: participant.reward.distributedAt,
            hederaTransactionId: participant.reward.hederaTransactionId,
          });
        }
      }
    }

    res.json({
      campaignRewards: rewardTokens,
      totalRewards: rewardTokens.length,
    });

  } catch (err) {
    next(err);
  }
};