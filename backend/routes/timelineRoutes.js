import express from 'express';
import { getTimeline } from '../controllers/timelineController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /timeline/{patientId}:
 *   get:
 *     summary: Get patient's medical timeline
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient's DID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for timeline filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for timeline filter
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [appointment, prescription, lab_result, medical_record, claim]
 *         description: Filter by specific event type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of events to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of events to skip
 *     responses:
 *       200:
 *         description: Patient timeline retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patientId:
 *                   type: string
 *                   description: Patient's DID
 *                 timeline:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Event ID
 *                       type:
 *                         type: string
 *                         enum: [appointment, prescription, lab_result, medical_record, claim]
 *                         description: Type of timeline event
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: When the event occurred
 *                       title:
 *                         type: string
 *                         description: Brief title of the event
 *                       description:
 *                         type: string
 *                         description: Detailed description of the event
 *                       providerId:
 *                         type: string
 *                         description: Healthcare provider's DID
 *                       metadata:
 *                         type: object
 *                         description: Additional event-specific data
 *                       blockHash:
 *                         type: string
 *                         description: Blockchain transaction hash
 *                 total:
 *                   type: integer
 *                   description: Total number of events
 *                 limit:
 *                   type: integer
 *                   description: Number of events returned
 *                 offset:
 *                   type: integer
 *                   description: Number of events skipped
 *       401:
 *         description: Unauthorized - User doesn't have access to this timeline
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Auth middleware ensures requesting user has rights to view timeline (patient OR authorized provider)
router.get('/:patientId', authMiddleware, getTimeline);

export default router;
