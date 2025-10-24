import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  sendChatMessage,
  getConversations,
  getConversation,
  deleteConversation,
  uploadHealthData,
  getHealthProfile,
  generateHealthInsights,
  getHealthInsights,
  markInsightViewed
} from '../controllers/healthiqController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: HealthIQ
 *   description: AI-powered health assistant and insights
 */

/**
 * @swagger
 * /api/healthiq/chat:
 *   post:
 *     summary: Send a message to the AI health assistant
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message to send to the AI assistant
 *               conversationId:
 *                 type: string
 *                 description: Optional ID of existing conversation
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/chat', sendChatMessage);

/**
 * @swagger
 * /api/healthiq/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations', getConversations);

/**
 * @swagger
 * /api/healthiq/conversations/{id}:
 *   get:
 *     summary: Get a specific conversation
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations/:id', getConversation);

/**
 * @swagger
 * /api/healthiq/conversations/{id}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/conversations/:id', deleteConversation);

/**
 * @swagger
 * /api/healthiq/health-data:
 *   post:
 *     summary: Upload health data
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bloodPressure:
 *                 type: string
 *                 example: "120/80"
 *               heartRate:
 *                 type: number
 *                 example: 72
 *               weight:
 *                 type: number
 *                 example: 70
 *               height:
 *                 type: number
 *                 example: 175
 *               sleepHours:
 *                 type: number
 *                 example: 7.5
 *               exerciseMinutes:
 *                 type: number
 *                 example: 30
 *               symptoms:
 *                 type: string
 *               temperature:
 *                 type: number
 *               oxygenSaturation:
 *                 type: number
 *     responses:
 *       200:
 *         description: Health data uploaded successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post('/health-data', uploadHealthData);

/**
 * @swagger
 * /api/healthiq/health-profile:
 *   get:
 *     summary: Get user health profile
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/health-profile', getHealthProfile);

/**
 * @swagger
 * /api/healthiq/generate-insights:
 *   post:
 *     summary: Generate AI health insights
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insights generated successfully
 *       400:
 *         description: No health data available
 *       401:
 *         description: Unauthorized
 */
router.post('/generate-insights', generateHealthInsights);

/**
 * @swagger
 * /api/healthiq/insights:
 *   get:
 *     summary: Get health insights
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: insightType
 *         schema:
 *           type: string
 *           enum: [cardiovascular, diabetes, mental-health, nutrition, fitness, sleep, general, preventive]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Insights retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/insights', getHealthInsights);

/**
 * @swagger
 * /api/healthiq/insights/{id}/view:
 *   put:
 *     summary: Mark insight as viewed
 *     tags: [HealthIQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Insight marked as viewed
 *       404:
 *         description: Insight not found
 *       401:
 *         description: Unauthorized
 */
router.put('/insights/:id/view', markInsightViewed);

export default router;
