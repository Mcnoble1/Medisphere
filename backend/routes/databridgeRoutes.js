import express from 'express';
import {
  createDataRequest,
  listIncomingRequests,
  listOutgoingRequests,
  approveDataRequest,
  rejectDataRequest,
  revokeDataRequest,
  createDataShare,
  listOutgoingShares,
  listIncomingShares,
  revokeDataShare,
  accessSharedData,
  getAuditLogs
} from '../controllers/databridgeController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ==================== DATA REQUESTS ====================

/**
 * @swagger
 * /databridge/requests:
 *   post:
 *     summary: Create a new data access request
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ownerId
 *               - dataRequested
 *               - purpose
 *             properties:
 *               ownerId:
 *                 type: string
 *                 description: ID of the data owner
 *               dataRequested:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Lab Results, Vaccination Records, Medical History, Diagnosis Records, Treatment History, Prescription History, Allergy Information, Surgical Records, Imaging Results, Vital Signs, Insurance Claims, Payment Records, Timeline Events, All Records]
 *               purpose:
 *                 type: string
 *               description:
 *                 type: string
 *               justification:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *               accessDuration:
 *                 type: number
 *                 description: Duration in days (alternative to validUntil)
 *     responses:
 *       201:
 *         description: Data request created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Owner not found
 *       500:
 *         description: Server error
 */
router.post('/requests', createDataRequest);

/**
 * @swagger
 * /databridge/requests/incoming:
 *   get:
 *     summary: List incoming data requests (requests to access my data)
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, revoked, expired]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: dataType
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of incoming requests
 *       500:
 *         description: Server error
 */
router.get('/requests/incoming', listIncomingRequests);

/**
 * @swagger
 * /databridge/requests/outgoing:
 *   get:
 *     summary: List outgoing data requests (requests I made)
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, revoked, expired]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of outgoing requests
 *       500:
 *         description: Server error
 */
router.get('/requests/outgoing', listOutgoingRequests);

/**
 * @swagger
 * /databridge/requests/{id}/approve:
 *   post:
 *     summary: Approve a data access request
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessDuration:
 *                 type: number
 *                 description: Access duration in days
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request approved successfully
 *       400:
 *         description: Invalid request state
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.post('/requests/:id/approve', approveDataRequest);

/**
 * @swagger
 * /databridge/requests/{id}/reject:
 *   post:
 *     summary: Reject a data access request
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request rejected successfully
 *       400:
 *         description: Invalid request state
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.post('/requests/:id/reject', rejectDataRequest);

/**
 * @swagger
 * /databridge/requests/{id}/revoke:
 *   post:
 *     summary: Revoke an approved data access request
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request revoked successfully
 *       400:
 *         description: Invalid request state
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.post('/requests/:id/revoke', revokeDataRequest);

// ==================== DATA SHARES ====================

/**
 * @swagger
 * /databridge/shares:
 *   post:
 *     summary: Create a new data share (proactive sharing)
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - dataToShare
 *               - purpose
 *             properties:
 *               recipientId:
 *                 type: string
 *               dataToShare:
 *                 type: array
 *                 items:
 *                   type: string
 *               purpose:
 *                 type: string
 *               description:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               accessDuration:
 *                 type: number
 *                 description: Duration in days (alternative to expiryDate)
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: string
 *               accessRestrictions:
 *                 type: object
 *                 properties:
 *                   maxAccessCount:
 *                     type: number
 *                   allowedIpAddresses:
 *                     type: array
 *                     items:
 *                       type: string
 *                   allowedTimeWindow:
 *                     type: object
 *                     properties:
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *     responses:
 *       201:
 *         description: Data share created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Recipient not found
 *       500:
 *         description: Server error
 */
router.post('/shares', createDataShare);

/**
 * @swagger
 * /databridge/shares/outgoing:
 *   get:
 *     summary: List outgoing data shares (data I shared)
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, revoked]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of outgoing shares
 *       500:
 *         description: Server error
 */
router.get('/shares/outgoing', listOutgoingShares);

/**
 * @swagger
 * /databridge/shares/incoming:
 *   get:
 *     summary: List incoming data shares (data shared with me)
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, revoked]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of incoming shares
 *       500:
 *         description: Server error
 */
router.get('/shares/incoming', listIncomingShares);

/**
 * @swagger
 * /databridge/shares/{id}/revoke:
 *   post:
 *     summary: Revoke a data share
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Share revoked successfully
 *       400:
 *         description: Share already revoked
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Share not found
 *       500:
 *         description: Server error
 */
router.post('/shares/:id/revoke', revokeDataShare);

/**
 * @swagger
 * /databridge/shares/{id}/access:
 *   get:
 *     summary: Access shared data (for recipients)
 *     tags: [DataBridge]
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
 *         description: Data accessed successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Share not found
 *       500:
 *         description: Server error
 */
router.get('/shares/:id/access', accessSharedData);

// ==================== AUDIT & LOGS ====================

/**
 * @swagger
 * /databridge/logs:
 *   get:
 *     summary: Get audit logs for data requests and shares
 *     tags: [DataBridge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, requests, shares]
 *           default: all
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/logs', getAuditLogs);

export default router;
