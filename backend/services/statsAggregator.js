import PlatformStats from '../models/platformStatsModel.js';
import IndexedRecord from '../models/indexedRecordModel.js';
import { User } from '../models/userModel.js';
import IndexerState from '../models/indexerStateModel.js';

/**
 * StatsAggregator - Generates and updates platform statistics
 */
class StatsAggregator {
  constructor() {
    this.isRunning = false;
    this.updateInterval = null;
  }

  /**
   * Calculate and save statistics for today
   */
  async calculateDailyStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      console.log(`📊 Calculating stats for ${today.toISOString()}`);

      // Get total records
      const totalRecords = await IndexedRecord.countDocuments({ status: 'active' });

      // Get records by type
      const recordsByTypeData = await IndexedRecord.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$recordType',
            count: { $sum: 1 }
          }
        }
      ]);

      const recordsByType = {
        'lab-result': 0,
        'prescription': 0,
        'diagnosis': 0,
        'vaccination': 0,
        'surgery': 0,
        'other': 0
      };

      recordsByTypeData.forEach(item => {
        if (recordsByType.hasOwnProperty(item._id)) {
          recordsByType[item._id] = item.count;
        }
      });

      // Get new records today
      const newRecordsToday = await IndexedRecord.countDocuments({
        status: 'active',
        indexedAt: { $gte: today, $lt: tomorrow }
      });

      // Get user counts
      const totalPatients = await User.countDocuments({ role: 'patient' });
      const totalProviders = await User.countDocuments({
        role: { $in: ['doctor', 'lab', 'hospital', 'pharmacy'] }
      });

      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = await User.countDocuments({
        lastLogin: { $gte: thirtyDaysAgo }
      });

      // Get HCS message counts
      const indexerStates = await IndexerState.find();
      const hcsMessagesTotal = indexerStates.reduce(
        (sum, state) => sum + (state.totalMessagesProcessed || 0),
        0
      );

      const hcsMessagesToday = await this.getHcsMessagesToday(indexerStates);

      // Get IPFS file count
      const ipfsFilesTotal = await IndexedRecord.countDocuments({
        ipfsCid: { $exists: true, $ne: null },
        status: 'active'
      });

      // Get verification statistics
      const verifiedRecords = await IndexedRecord.countDocuments({
        verified: true,
        status: 'active'
      });

      const verificationRate = totalRecords > 0
        ? (verifiedRecords / totalRecords * 100).toFixed(2)
        : 0;

      // Get sharing statistics
      const totalShares = await IndexedRecord.aggregate([
        { $match: { status: 'active' } },
        { $unwind: { path: '$sharedWith', preserveNullAndEmptyArrays: false } },
        { $count: 'total' }
      ]);

      const activeConsents = await IndexedRecord.aggregate([
        { $match: { status: 'active' } },
        { $unwind: { path: '$sharedWith', preserveNullAndEmptyArrays: false } },
        {
          $match: {
            $or: [
              { 'sharedWith.expiresAt': { $exists: false } },
              { 'sharedWith.expiresAt': { $gte: new Date() } }
            ]
          }
        },
        { $count: 'total' }
      ]);

      // Get NFT count
      const totalNFTsMinted = await IndexedRecord.countDocuments({
        nftTokenId: { $exists: true, $ne: null },
        status: 'active'
      });

      // Calculate average indexing time
      const avgIndexingTime = await this.calculateAverageIndexingTime();

      // Create or update stats document
      const stats = {
        date: today,
        totalRecords,
        recordsByType,
        newRecordsToday,
        totalPatients,
        totalProviders,
        activeUsers,
        hcsMessagesTotal,
        hcsMessagesToday,
        ipfsFilesTotal,
        verifiedRecords,
        verificationRate: parseFloat(verificationRate),
        totalShares: totalShares.length > 0 ? totalShares[0].total : 0,
        activeConsents: activeConsents.length > 0 ? activeConsents[0].total : 0,
        totalNFTsMinted,
        averageIndexingTime: avgIndexingTime,
        lastIndexedAt: new Date()
      };

      await PlatformStats.findOneAndUpdate(
        { date: today },
        stats,
        { upsert: true, new: true }
      );

      console.log('✅ Daily stats calculated and saved');
      return stats;

    } catch (error) {
      console.error('Error calculating daily stats:', error);
      throw error;
    }
  }

  /**
   * Get HCS messages processed today
   */
  async getHcsMessagesToday(indexerStates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let count = 0;
    for (const state of indexerStates) {
      if (state.lastProcessedTimestamp && state.lastProcessedTimestamp >= today) {
        // Estimate based on recent activity
        // This is an approximation - actual count would require querying mirror node
        count += 10; // Placeholder
      }
    }

    return count;
  }

  /**
   * Calculate average time from HCS message to indexing
   */
  async calculateAverageIndexingTime() {
    try {
      const recentRecords = await IndexedRecord.find({
        indexedAt: { $exists: true },
        hcsTimestamp: { $exists: true }
      })
        .sort({ indexedAt: -1 })
        .limit(100)
        .lean();

      if (recentRecords.length === 0) return 0;

      const times = recentRecords.map(record => {
        return record.indexedAt - record.hcsTimestamp;
      });

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      return Math.round(avgTime / 1000); // Convert to seconds

    } catch (error) {
      console.error('Error calculating average indexing time:', error);
      return 0;
    }
  }

  /**
   * Generate historical stats for past days
   */
  async generateHistoricalStats(days = 30) {
    console.log(`📊 Generating historical stats for ${days} days...`);

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Check if stats already exist for this date
      const existing = await PlatformStats.findOne({ date });
      if (existing) {
        console.log(`Stats for ${date.toISOString()} already exist, skipping`);
        continue;
      }

      // Calculate stats as of that date
      await this.calculateStatsForDate(date);
    }

    console.log('✅ Historical stats generated');
  }

  /**
   * Calculate stats for a specific date
   */
  async calculateStatsForDate(targetDate) {
    try {
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Get records created up to this date
      const totalRecords = await IndexedRecord.countDocuments({
        status: 'active',
        indexedAt: { $lt: nextDay }
      });

      // Get records by type
      const recordsByTypeData = await IndexedRecord.aggregate([
        {
          $match: {
            status: 'active',
            indexedAt: { $lt: nextDay }
          }
        },
        {
          $group: {
            _id: '$recordType',
            count: { $sum: 1 }
          }
        }
      ]);

      const recordsByType = {
        'lab-result': 0,
        'prescription': 0,
        'diagnosis': 0,
        'vaccination': 0,
        'surgery': 0,
        'other': 0
      };

      recordsByTypeData.forEach(item => {
        if (recordsByType.hasOwnProperty(item._id)) {
          recordsByType[item._id] = item.count;
        }
      });

      // New records on this specific day
      const newRecordsToday = await IndexedRecord.countDocuments({
        status: 'active',
        indexedAt: { $gte: targetDate, $lt: nextDay }
      });

      // Simplified stats for historical data
      const stats = {
        date: targetDate,
        totalRecords,
        recordsByType,
        newRecordsToday,
        totalPatients: 0,
        totalProviders: 0,
        activeUsers: 0,
        hcsMessagesTotal: 0,
        hcsMessagesToday: 0,
        ipfsFilesTotal: 0,
        verifiedRecords: 0,
        verificationRate: 0,
        totalShares: 0,
        activeConsents: 0,
        totalNFTsMinted: 0,
        lastIndexedAt: new Date()
      };

      await PlatformStats.create(stats);
      console.log(`✅ Stats calculated for ${targetDate.toISOString()}`);

    } catch (error) {
      console.error(`Error calculating stats for ${targetDate.toISOString()}:`, error);
    }
  }

  /**
   * Start automatic daily stats updates
   */
  startAutoUpdate(intervalHours = 1) {
    if (this.isRunning) {
      console.warn('Stats aggregator is already running');
      return;
    }

    console.log(`🚀 Starting stats aggregator (updates every ${intervalHours} hour(s))`);
    this.isRunning = true;

    // Calculate stats immediately
    this.calculateDailyStats().catch(err =>
      console.error('Error in initial stats calculation:', err)
    );

    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      this.calculateDailyStats().catch(err =>
        console.error('Error in periodic stats calculation:', err)
      );
    }, intervalHours * 60 * 60 * 1000);
  }

  /**
   * Stop automatic updates
   */
  stopAutoUpdate() {
    if (!this.isRunning) {
      console.warn('Stats aggregator is not running');
      return;
    }

    console.log('🛑 Stopping stats aggregator');
    this.isRunning = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Get stats summary
   */
  async getSummary() {
    const latest = await PlatformStats.findOne().sort({ date: -1 }).lean();

    if (!latest) {
      return {
        message: 'No statistics available yet'
      };
    }

    return {
      lastUpdated: latest.lastIndexedAt,
      totalRecords: latest.totalRecords,
      recordsByType: latest.recordsByType,
      totalUsers: latest.totalPatients + latest.totalProviders,
      verificationRate: latest.verificationRate,
      isRunning: this.isRunning
    };
  }
}

export default StatsAggregator;
