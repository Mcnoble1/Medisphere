import express from 'express';
import {
  getRecordsByPatient,
  getRecordsByProvider,
  getRecordsByType,
  verifyRecordHash,
  searchRecords,
  getPlatformStats,
  getIndexerStatus,
  getRecordByHcsMessage,
  getRecordCounts,
  getRecentActivity
} from '../controllers/explorerController.js';

const router = express.Router();

/**
 * @swagger
 * /api/explorer/records/patient/{patientId}:
 *   get:
 *     summary: Get records by patient Hedera account ID
 *     tags: [Explorer]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient Hedera account ID (e.g., 0.0.12345)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by record type
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get('/records/patient/:patientId', getRecordsByPatient);

/**
 * @swagger
 * /api/explorer/records/provider/{providerId}:
 *   get:
 *     summary: Get records by provider Hedera account ID
 *     tags: [Explorer]
 */
router.get('/records/provider/:providerId', getRecordsByProvider);

/**
 * @swagger
 * /api/explorer/records/type/{type}:
 *   get:
 *     summary: Get records by type
 *     tags: [Explorer]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [lab-result, prescription, diagnosis, vaccination, surgery, other]
 */
router.get('/records/type/:type', getRecordsByType);

/**
 * @swagger
 * /api/explorer/records/search:
 *   get:
 *     summary: Search records with text query
 *     tags: [Explorer]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 */
router.get('/records/search', searchRecords);

/**
 * @swagger
 * /api/explorer/record/hash/{hash}:
 *   get:
 *     summary: Get record by hash
 *     tags: [Explorer]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/record/hash/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const IndexedRecord = (await import('../models/indexedRecordModel.js')).default;
    const record = await IndexedRecord.findOne({ recordHash: hash });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error fetching record by hash:', error);
    res.status(500).json({ error: 'Failed to fetch record' });
  }
});

/**
 * @swagger
 * /api/explorer/verify/{hash}:
 *   get:
 *     summary: Verify record authenticity by hash
 *     tags: [Explorer]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/verify/:hash', verifyRecordHash);

/**
 * @swagger
 * /api/explorer/messages/{messageId}:
 *   get:
 *     summary: Get record by HCS message ID
 *     tags: [Explorer]
 */
router.get('/messages/:messageId', getRecordByHcsMessage);

/**
 * @swagger
 * /api/explorer/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Explorer]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 */
router.get('/stats', getPlatformStats);

/**
 * @swagger
 * /api/explorer/stats/counts:
 *   get:
 *     summary: Get record counts by type
 *     tags: [Explorer]
 */
router.get('/stats/counts', getRecordCounts);

/**
 * @swagger
 * /api/explorer/activity/recent:
 *   get:
 *     summary: Get recent activity timeline
 *     tags: [Explorer]
 */
router.get('/activity/recent', getRecentActivity);

/**
 * @swagger
 * /api/explorer/indexer/status:
 *   get:
 *     summary: Get indexer status (admin)
 *     tags: [Explorer]
 */
router.get('/indexer/status', getIndexerStatus);

export default router;
