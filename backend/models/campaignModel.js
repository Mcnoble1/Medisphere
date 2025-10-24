import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  location: {
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String }
  },
  category: {
    type: String,
    enum: ['malaria-prevention', 'maternal-health', 'child-nutrition', 'vaccination', 'emergency-relief', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  targetBeneficiaries: {
    type: Number,
    required: true,
    min: 1
  },
  currentBeneficiaries: {
    type: Number,
    default: 0
  },
  budget: {
    total: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  milestones: [{
    title: { type: String, required: true },
    description: String,
    targetDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    impact: {
      beneficiariesReached: Number,
      tokensDistributed: Number,
      notes: String
    }
  }],
  impact: {
    totalBeneficiariesReached: { type: Number, default: 0 },
    totalTokensDistributed: { type: Number, default: 0 },
    healthOutcomes: [{
      metric: String,
      baseline: Number,
      current: Number,
      improvement: Number,
      unit: String
    }],
    impactScore: { type: Number, default: 0, min: 0, max: 100 }
  },
  // Reward configuration
  rewardConfig: {
    rewardType: {
      type: String,
      enum: ['hbar', 'hts-token', 'none'],
      default: 'hbar'
    },
    // For HBAR rewards
    hbarAmount: { type: Number, default: 0 },
    // For HTS token rewards
    tokenId: { type: String }, // Hedera Token ID (0.0.xxxxx)
    tokenSymbol: { type: String },
    tokenName: { type: String },
    tokenAmount: { type: Number, default: 0 },
    // Reward distribution settings
    rewardPerParticipant: { type: Number, default: 0 },
    totalRewardPool: { type: Number, default: 0 },
    rewardsDistributed: { type: Number, default: 0 }
  },
  // Participant tracking
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: { type: Date, default: Date.now },
    contribution: {
      description: String,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    reward: {
      amount: { type: Number, default: 0 },
      tokenType: String, // 'hbar' or 'hts-token'
      tokenId: String, // For HTS tokens
      distributed: { type: Boolean, default: false },
      distributedAt: Date,
      hederaTransactionId: String
    }
  }],
  grantInfo: {
    grantProvider: String,
    grantAmount: Number,
    grantId: String,
    reportingDeadlines: [Date]
  },
  collaborators: [{
    organization: String,
    contact: String,
    role: String,
    contribution: String
  }],
  documents: [{
    name: String,
    type: { type: String, enum: ['proposal', 'report', 'budget', 'impact-assessment', 'other'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  reports: [{
    title: String,
    period: {
      from: Date,
      to: Date
    },
    content: String,
    metrics: mongoose.Schema.Types.Mixed,
    generatedAt: { type: Date, default: Date.now },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  blockchainHashes: [{
    txType: String,
    hash: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for performance
campaignSchema.index({ creator: 1, status: 1 });
campaignSchema.index({ location: 1, category: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

// Virtual for progress percentage
campaignSchema.virtual('progress').get(function() {
  if (!this.targetBeneficiaries) return 0;
  return Math.round((this.currentBeneficiaries / this.targetBeneficiaries) * 100);
});

// Virtual for budget utilization
campaignSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget.total) return 0;
  return Math.round((this.budget.spent / this.budget.total) * 100);
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

export default mongoose.model('Campaign', campaignSchema);