import express from 'express';
import {
  createRequest,
  approveRequest,
  rejectRequest,
  listIncoming,
  revokeRequest,
  getLogs
} from '../controllers/dataRequestController.js';
import { authMiddleware } from '../middlewares/auth.js'; // ensure you have auth middleware

const router = express.Router();

/**
 * @swagger
 * /data-requests:
 *   post:
 *     summary: Create a new data access request
 *     tags: [Data Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requesterId:
 *                 type: string
 *                 description: DID of the data requester
 *               dataOwnerId:
 *                 type: string
 *                 description: DID of the data owner (patient)
 *               dataType:
 *                 type: string
 *                 enum: [medical_records, lab_results, prescriptions, timeline, all]
 *                 description: Type of data being requested
 *               purpose:
 *                 type: string
 *                 description: Purpose of the data request
 *               requestScope:
 *                 type: object
 *                 properties:
 *                   dateRange:
 *                     type: object
 *                     properties:
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                   specificRecords:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Specific record IDs if applicable
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Specific data categories
 *                 description: Scope of data being requested
 *               urgency:
 *                 type: string
 *                 enum: [low, normal, high, emergency]
 *                 description: Urgency level of the request
 *               accessDuration:
 *                 type: integer
 *                 description: Requested access duration in days
 *               justification:
 *                 type: string
 *                 description: Justification for the data request
 *             required:
 *               - requesterId
 *               - dataOwnerId
 *               - dataType
 *               - purpose
 *               - requestScope
 *               - justification
 *     responses:
 *       201:
 *         description: Data request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requestId:
 *                   type: string
 *                   description: Unique request identifier
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, rejected, revoked]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                 blockHash:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
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
// All routes protected (auth middleware supplies req.user)
router.post('/', authMiddleware, createRequest);
/**
 * @swagger
 * /data-requests/incoming:
 *   get:
 *     summary: List incoming data requests for the authenticated user
 *     tags: [Data Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, revoked]
 *         description: Filter by request status
 *       - in: query
 *         name: dataType
 *         schema:
 *           type: string
 *           enum: [medical_records, lab_results, prescriptions, timeline, all]
 *         description: Filter by data type
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [low, normal, high, emergency]
 *         description: Filter by urgency level
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of requests to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of requests to skip
 *     responses:
 *       200:
 *         description: Incoming data requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       requestId:
 *                         type: string
 *                       requesterId:
 *                         type: string
 *                       requesterName:
 *                         type: string
 *                       dataType:
 *                         type: string
 *                       purpose:
 *                         type: string
 *                       urgency:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                       accessDuration:
 *                         type: integer
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       401:
 *         description: Unauthorized
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
router.get('/incoming', authMiddleware, listIncoming);
/**
 * @swagger
 * /data-requests/{id}/approve:
 *   post:
 *     summary: Approve a data access request
 *     tags: [Data Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data request ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessDuration:
 *                 type: integer
 *                 description: Approved access duration in days (may be different from requested)
 *               conditions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Any conditions or restrictions on data access
 *               notes:
 *                 type: string
 *                 description: Additional notes about the approval
 *     responses:
 *       200:
 *         description: Data request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requestId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [approved]
 *                 approvedBy:
 *                   type: string
 *                 approvalDate:
 *                   type: string
 *                   format: date-time
 *                 accessToken:
 *                   type: string
 *                   description: Token for accessing the approved data
 *                 accessExpiresAt:
 *                   type: string
 *                   format: date-time
 *                 conditions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 blockHash:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Request cannot be approved in current state
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
router.post('/:id/approve', authMiddleware, approveRequest);
/**
 * @swagger
 * /data-requests/{id}/reject:
 *   post:
 *     summary: Reject a data access request
 *     tags: [Data Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *               notes:
 *                 type: string
 *                 description: Additional notes about the rejection
 *             required:
 *               - reason
 *     responses:
 *       200:
 *         description: Data request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requestId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [rejected]
 *                 rejectedBy:
 *                   type: string
 *                 rejectionDate:
 *                   type: string
 *                   format: date-time
 *                 reason:
 *                   type: string
 *                 blockHash:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Request cannot be rejected in current state
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
router.post('/:id/reject', authMiddleware, rejectRequest);
/**
 * @swagger
 * /data-requests/{id}/revoke:
 *   post:
 *     summary: Revoke a previously approved data access request
 *     tags: [Data Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for revocation
 *               notes:
 *                 type: string
 *                 description: Additional notes about the revocation
 *             required:
 *               - reason
 *     responses:
 *       200:
 *         description: Data request revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 requestId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [revoked]
 *                 revokedBy:
 *                   type: string
 *                 revocationDate:
 *                   type: string
 *                   format: date-time
 *                 reason:
 *                   type: string
 *                 blockHash:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Request cannot be revoked in current state
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
router.post('/:id/revoke', authMiddleware, revokeRequest);
/**
 * @swagger
 * /data-requests/logs:
 *   get:
 *     summary: Get audit logs for data access requests
 *     tags: [Data Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: requestId
 *         schema:
 *           type: string
 *         description: Filter logs by specific request ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [created, approved, rejected, revoked, accessed]
 *         description: Filter logs by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs until this date
 *       - in: query
 *         name: actorId
 *         schema:
 *           type: string
 *         description: Filter logs by actor DID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of log entries to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of log entries to skip
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       logId:
 *                         type: string
 *                       requestId:
 *                         type: string
 *                       action:
 *                         type: string
 *                         enum: [created, approved, rejected, revoked, accessed]
 *                       actorId:
 *                         type: string
 *                       actorRole:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       details:
 *                         type: object
 *                         description: Action-specific details
 *                       ipAddress:
 *                         type: string
 *                       userAgent:
 *                         type: string
 *                       blockHash:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       401:
 *         description: Unauthorized
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
router.get('/logs', authMiddleware, getLogs);

export default router;
