import mongoose from 'mongoose';

const tokenTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['earned', 'spent', 'transferred', 'reward', 'grant', 'claim_reward', 'campaign_reward'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Token details (for HTS tokens)
  tokenType: {
    type: String,
    enum: ['health_token', 'hts_token', 'hbar'],
    default: 'health_token',
  },
  tokenId: {
    type: String, // HTS Token ID (e.g., 0.0.12345)
  },
  tokenSymbol: {
    type: String,
  },
  tokenName: {
    type: String,
  },
  // Recipient/Sender information (for transfers)
  toAccountId: {
    type: String, // Hedera Account ID
  },
  fromAccountId: {
    type: String, // Hedera Account ID
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  relatedService: {
    type: String,
    enum: ['medflow', 'lifechain', 'claimsphere', 'impactgrid', 'campaign', 'other'],
  },
  relatedRecord: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['HealthRecord', 'Appointment', 'InsuranceClaim', 'Campaign'],
  },
  hederaTransactionId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
}, { timestamps: true, _id: false });

const paymentAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Token balances
  healthTokens: {
    type: Number,
    default: 0,
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  // HTS Token balances - track multiple tokens
  htsTokenBalances: [{
    tokenId: { type: String, required: true }, // HTS Token ID (0.0.xxxxx)
    tokenSymbol: { type: String, required: true },
    tokenName: { type: String, required: true },
    balance: { type: Number, default: 0 },
    decimals: { type: Number, default: 2 },
    associated: { type: Boolean, default: false }, // Token association status
    associatedAt: { type: Date },
  }],
  // Hedera account information
  hederaAccountId: {
    type: String,
  },
  hederaPublicKey: {
    type: String,
  },
  // Transaction history
  transactions: [tokenTransactionSchema],
  // Payment methods
  paymentMethods: [{
    type: {
      type: String,
      enum: ['mobile_money', 'bank_account', 'crypto_wallet'],
    },
    provider: String, // e.g., M-Pesa, GTBank
    identifier: String, // phone number, account number, wallet address
    isDefault: Boolean,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
  }],
  // Spending and earning analytics
  totalEarned: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  monthlyLimits: {
    spending: { type: Number, default: 10000 },
    earning: { type: Number, default: 50000 },
  },
}, { timestamps: true });

// Indexes
// paymentAccountSchema.index({ user: 1 });
paymentAccountSchema.index({ 'transactions.createdAt': -1 });

const PaymentAccount = mongoose.model('PaymentAccount', paymentAccountSchema);
export default PaymentAccount;