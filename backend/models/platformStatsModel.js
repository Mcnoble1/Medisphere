import mongoose from 'mongoose';

/**
 * PlatformStats - Aggregated statistics for public explorer
 */
const platformStatsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true
    },
    // Record statistics
    totalRecords: {
      type: Number,
      default: 0
    },
    recordsByType: {
      'lab-result': { type: Number, default: 0 },
      'prescription': { type: Number, default: 0 },
      'diagnosis': { type: Number, default: 0 },
      'vaccination': { type: Number, default: 0 },
      'surgery': { type: Number, default: 0 },
      'other': { type: Number, default: 0 }
    },
    newRecordsToday: {
      type: Number,
      default: 0
    },

    // User statistics
    totalPatients: {
      type: Number,
      default: 0
    },
    totalProviders: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },

    // Blockchain statistics
    hcsMessagesTotal: {
      type: Number,
      default: 0
    },
    hcsMessagesToday: {
      type: Number,
      default: 0
    },
    ipfsFilesTotal: {
      type: Number,
      default: 0
    },

    // Verification statistics
    verifiedRecords: {
      type: Number,
      default: 0
    },
    verificationRate: {
      type: Number,
      default: 0
    },

    // Access statistics
    totalShares: {
      type: Number,
      default: 0
    },
    activeConsents: {
      type: Number,
      default: 0
    },

    // NFT statistics
    totalNFTsMinted: {
      type: Number,
      default: 0
    },

    // Performance metrics
    averageIndexingTime: Number,
    lastIndexedAt: Date
  },
  {
    timestamps: true,
    collection: 'platform_stats'
  }
);

const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema);
export default PlatformStats;
