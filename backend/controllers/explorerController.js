import IndexedRecord from '../models/indexedRecordModel.js';
import PlatformStats from '../models/platformStatsModel.js';
import IndexerState from '../models/indexerStateModel.js';
import IndexerEngine from '../services/indexerEngine.js';

/**
 * ExplorerController - Public API for querying indexed health records
 */

/**
 * Get records by patient Hedera account ID
 */
export const getRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { type, fromDate, toDate, limit = 50, skip = 0 } = req.query;

    const query = { patientAccountId: patientId };

    if (type) {
      query.recordType = type;
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const records = await IndexedRecord.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await IndexedRecord.countDocuments(query);

    res.json(records);
  } catch (error) {
    console.error('Error fetching records by patient:', error);
    res.status(500).json({
      error: 'Failed to fetch records',
      details: error.message
    });
  }
};

/**
 * Get records by provider Hedera account ID
 */
export const getRecordsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { type, fromDate, toDate, limit = 50, skip = 0 } = req.query;

    const query = { providerAccountId: providerId };

    if (type) {
      query.recordType = type;
    }

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const records = await IndexedRecord.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await IndexedRecord.countDocuments(query);

    res.json(records);
  } catch (error) {
    console.error('Error fetching records by provider:', error);
    res.status(500).json({
      error: 'Failed to fetch records',
      details: error.message
    });
  }
};

/**
 * Get records by type
 */
export const getRecordsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { fromDate, toDate, verified, limit = 50, skip = 0 } = req.query;

    const query = { recordType: type, status: 'active' };

    if (fromDate || toDate) {
      query.recordDate = {};
      if (fromDate) query.recordDate.$gte = new Date(fromDate);
      if (toDate) query.recordDate.$lte = new Date(toDate);
    }

    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    const records = await IndexedRecord.find(query)
      .select('-accessLog -patientAccountId') // Privacy protection
      .sort({ recordDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await IndexedRecord.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + records.length)
      }
    });
  } catch (error) {
    console.error('Error fetching records by type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch records'
    });
  }
};

/**
 * Verify record authenticity by hash
 */
export const verifyRecordHash = async (req, res) => {
  try {
    const { hash } = req.params;

    // Try to find by recordHash first, then by hcsMessageId
    let record = await IndexedRecord.findOne({ recordHash: hash })
      .select('recordHash ipfsCid hcsMessageId hcsTimestamp verified recordType title')
      .lean();

    // If not found, try searching by hcsMessageId (supports both formats: "timestamp" or "accountId@timestamp")
    if (!record) {
      record = await IndexedRecord.findOne({ hcsMessageId: hash })
        .select('recordHash ipfsCid hcsMessageId hcsTimestamp verified recordType title')
        .lean();
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    // TODO: Actual verification against IPFS content
    const verificationResult = {
      found: true,
      hash: record.recordHash,
      ipfsCid: record.ipfsCid,
      hcsMessageId: record.hcsMessageId,
      timestamp: record.hcsTimestamp,
      verified: record.verified,
      recordType: record.recordType,
      title: record.title
    };

    res.json({
      success: true,
      data: verificationResult
    });
  } catch (error) {
    console.error('Error verifying record:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
};

/**
 * Search records with text query
 */
export const searchRecords = async (req, res) => {
  try {
    const { q, type, limit = 50, skip = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required'
      });
    }

    const query = {
      $text: { $search: q },
      status: 'active'
    };

    if (type) {
      query.recordType = type;
    }

    const records = await IndexedRecord.find(query)
      .select('-accessLog -patientAccountId')
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await IndexedRecord.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + records.length)
      }
    });
  } catch (error) {
    console.error('Error searching records:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const stats = await PlatformStats.find({
      date: { $gte: cutoffDate }
    })
      .sort({ date: -1 })
      .lean();

    // Get latest stats for summary
    const latest = stats[0] || {};

    // Calculate total records from recordsByType
    const recordsByType = latest.recordsByType || {
      'lab-result': 0,
      'prescription': 0,
      'diagnosis': 0,
      'vaccination': 0,
      'surgery': 0,
      'other': 0
    };

    const totalRecords = latest.totalRecords || 0;

    // Format record types for frontend
    const recordTypesArray = Object.entries(recordsByType).map(([type, count]) => ({
      type,
      count: count || 0,
      percentage: totalRecords > 0 ? ((count || 0) / totalRecords) * 100 : 0
    }));

    // Get top providers by aggregating records
    const topProviders = await IndexedRecord.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$providerAccountId',
          providerName: { $first: '$providerName' },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { recordCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          providerId: '$_id',
          providerName: 1,
          recordCount: 1
        }
      }
    ]);

    // Get recent activity from indexed records
    const recentRecords = await IndexedRecord.find({ status: 'active' })
      .select('recordType hcsTimestamp')
      .sort({ hcsTimestamp: -1 })
      .limit(20)
      .lean();

    // Group recent activity by timestamp ranges
    const activityMap = new Map();
    recentRecords.forEach(record => {
      const timestamp = new Date(record.hcsTimestamp);
      timestamp.setHours(0, 0, 0, 0); // Group by day
      const key = timestamp.toISOString();

      if (!activityMap.has(key)) {
        activityMap.set(key, {
          timestamp: timestamp.toISOString(),
          recordCount: 0,
          type: record.recordType
        });
      }
      activityMap.get(key).recordCount++;
    });

    const recentActivity = Array.from(activityMap.values()).slice(0, 10);

    // Prepare timeline data from historical stats
    const timelineData = stats.map(stat => ({
      date: stat.date,
      count: stat.newRecordsToday || 0
    })).reverse(); // Show oldest to newest

    // Prepare response in the format the frontend expects
    const response = {
      overview: {
        totalRecords: totalRecords,
        totalPatients: latest.totalPatients || 0,
        totalProviders: latest.totalProviders || 0,
        totalTransactions: latest.hcsMessagesTotal || 0
      },
      recordTypes: recordTypesArray,
      timelineData: timelineData,
      topProviders: topProviders,
      recentActivity: recentActivity,
      additionalStats: {
        verifiedRecords: latest.verifiedRecords || 0,
        verificationRate: latest.verificationRate || 0,
        totalNFTsMinted: latest.totalNFTsMinted || 0,
        ipfsFilesTotal: latest.ipfsFilesTotal || 0,
        totalShares: latest.totalShares || 0,
        activeConsents: latest.activeConsents || 0,
        activeUsers: latest.activeUsers || 0,
        averageIndexingTime: latest.averageIndexingTime || 0
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
};

/**
 * Get indexer status
 */
export const getIndexerStatus = async (req, res) => {
  try {
    const indexer = new IndexerEngine();
    const status = await indexer.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching indexer status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch indexer status'
    });
  }
};

/**
 * Get record by HCS message ID
 */
export const getRecordByHcsMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const record = await IndexedRecord.findOne({ hcsMessageId: messageId })
      .select('-accessLog')
      .lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching record by HCS message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch record'
    });
  }
};

/**
 * Get aggregated record counts by type
 */
export const getRecordCounts = async (req, res) => {
  try {
    const counts = await IndexedRecord.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$recordType',
          count: { $sum: 1 },
          verified: {
            $sum: { $cond: ['$verified', 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = await IndexedRecord.countDocuments({ status: 'active' });

    res.json({
      success: true,
      data: {
        total,
        byType: counts.map(c => ({
          type: c._id,
          count: c.count,
          verified: c.verified,
          verificationRate: c.count > 0 ? (c.verified / c.count * 100).toFixed(2) : 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching record counts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch record counts'
    });
  }
};

/**
 * Get recent activity timeline
 */
export const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentRecords = await IndexedRecord.find({ status: 'active' })
      .select('recordType title facility hcsTimestamp providerName')
      .sort({ hcsTimestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: recentRecords
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
};
