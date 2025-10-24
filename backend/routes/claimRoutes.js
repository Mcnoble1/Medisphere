import express from 'express';
import {
  fileClaim,
  listClaims,
  getClaim,
  approveClaim,
  rejectClaim,
  getClaimAudit,
  validateClaimRecord,
  auditAggregate
} from '../controllers/claimController.js';
import { authMiddleware } from '../middlewares/auth.js'; // assume exists

const router = express.Router();

/**
 * @swagger
 * /claims:
 *   post:
 *     summary: File a new insurance claim
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: Patient's DID
 *               providerId:
 *                 type: string
 *                 description: Healthcare provider's DID
 *               insurerId:
 *                 type: string
 *                 description: Insurance company's DID
 *               serviceType:
 *                 type: string
 *                 description: Type of medical service
 *               serviceDate:
 *                 type: string
 *                 format: date
 *                 description: Date when service was provided
 *               amount:
 *                 type: number
 *                 description: Claimed amount
 *               diagnosis:
 *                 type: string
 *                 description: Medical diagnosis
 *               treatment:
 *                 type: string
 *                 description: Treatment provided
 *               supportingDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IPFS hashes of supporting documents
 *             required:
 *               - patientId
 *               - providerId
 *               - insurerId
 *               - serviceType
 *               - serviceDate
 *               - amount
 *               - diagnosis
 *               - treatment
 *     responses:
 *       201:
 *         description: Claim filed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 claimId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, under_review, approved, rejected]
 *                 blockHash:
 *                   type: string
 *                 submissionDate:
 *                   type: string
 *                   format: date-time
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
router.post('/', authMiddleware, fileClaim);
/**
 * @swagger
 * /claims:
 *   get:
 *     summary: List insurance claims
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient's DID
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *         description: Filter by provider's DID
 *       - in: query
 *         name: insurerId
 *         schema:
 *           type: string
 *         description: Filter by insurer's DID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, under_review, approved, rejected]
 *         description: Filter by claim status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of claims to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of claims to skip
 *     responses:
 *       200:
 *         description: Claims retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 claims:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       claimId:
 *                         type: string
 *                       patientId:
 *                         type: string
 *                       providerId:
 *                         type: string
 *                       insurerId:
 *                         type: string
 *                       serviceType:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       submissionDate:
 *                         type: string
 *                         format: date-time
 *                       lastUpdated:
 *                         type: string
 *                         format: date-time
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
router.get('/', authMiddleware, listClaims);
/**
 * @swagger
 * /claims/{id}:
 *   get:
 *     summary: Get detailed information about a specific claim
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Claim ID
 *     responses:
 *       200:
 *         description: Claim details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 claimId:
 *                   type: string
 *                 patientId:
 *                   type: string
 *                 providerId:
 *                   type: string
 *                 insurerId:
 *                   type: string
 *                 serviceType:
 *                   type: string
 *                 serviceDate:
 *                   type: string
 *                   format: date
 *                 amount:
 *                   type: number
 *                 diagnosis:
 *                   type: string
 *                 treatment:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, under_review, approved, rejected]
 *                 supportingDocuments:
 *                   type: array
 *                   items:
 *                     type: string
 *                 submissionDate:
 *                   type: string
 *                   format: date-time
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *                 blockHash:
 *                   type: string
 *                 auditTrail:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       action:
 *                         type: string
 *                       actorId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       blockHash:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Claim not found
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
router.get('/:id', authMiddleware, getClaim);
/**
 * @swagger
 * /claims/{id}/approve:
 *   post:
 *     summary: Approve an insurance claim
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Claim ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approvedAmount:
 *                 type: number
 *                 description: Approved claim amount (may be different from requested)
 *               approvalReason:
 *                 type: string
 *                 description: Reason for approval
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *             required:
 *               - approvedAmount
 *               - approvalReason
 *     responses:
 *       200:
 *         description: Claim approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 claimId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [approved]
 *                 approvedAmount:
 *                   type: number
 *                 approvedBy:
 *                   type: string
 *                 approvalDate:
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
 *       404:
 *         description: Claim not found
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
router.post('/:id/approve', authMiddleware, approveClaim);
/**
 * @swagger
 * /claims/{id}/reject:
 *   post:
 *     summary: Reject an insurance claim
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Claim ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 description: Reason for rejection
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *             required:
 *               - rejectionReason
 *     responses:
 *       200:
 *         description: Claim rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 claimId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [rejected]
 *                 rejectionReason:
 *                   type: string
 *                 rejectedBy:
 *                   type: string
 *                 rejectionDate:
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
 *       404:
 *         description: Claim not found
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
router.post('/:id/reject', authMiddleware, rejectClaim);
/**
 * @swagger
 * /claims/{id}/audit:
 *   get:
 *     summary: Get audit trail for a specific claim
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Claim ID
 *     responses:
 *       200:
 *         description: Audit trail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 claimId:
 *                   type: string
 *                 auditTrail:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       auditId:
 *                         type: string
 *                       action:
 *                         type: string
 *                         enum: [created, submitted, reviewed, approved, rejected, updated]
 *                       actorId:
 *                         type: string
 *                       actorRole:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       previousData:
 *                         type: object
 *                       newData:
 *                         type: object
 *                       blockHash:
 *                         type: string
 *                       ipfsHash:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Claim not found
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
router.get('/:id/audit', authMiddleware, getClaimAudit);
/**
 * @swagger
 * /claims/{id}/validate:
 *   get:
 *     summary: Validate claim record against blockchain
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Claim ID
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 claimId:
 *                   type: string
 *                 isValid:
 *                   type: boolean
 *                   description: Whether the claim record is valid
 *                 blockchainHash:
 *                   type: string
 *                   description: Hash stored on blockchain
 *                 currentHash:
 *                   type: string
 *                   description: Current computed hash
 *                 validationTimestamp:
 *                   type: string
 *                   format: date-time
 *                 integrityCheck:
 *                   type: object
 *                   properties:
 *                     passed:
 *                       type: boolean
 *                     details:
 *                       type: array
 *                       items:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Claim not found
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
router.get('/:id/validate', authMiddleware, validateClaimRecord);
/**
 * @swagger
 * /claims/{id}/audit-aggregate:
 *   get:
 *     summary: Get aggregated audit information for a claim
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Claim ID
 *     responses:
 *       200:
 *         description: Aggregated audit information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 claimId:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalActions:
 *                       type: integer
 *                     uniqueActors:
 *                       type: integer
 *                     firstAction:
 *                       type: string
 *                       format: date-time
 *                     lastAction:
 *                       type: string
 *                       format: date-time
 *                     processingTime:
 *                       type: integer
 *                       description: Time in hours from submission to final status
 *                 actionBreakdown:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                     reviewed:
 *                       type: integer
 *                     approved:
 *                       type: integer
 *                     rejected:
 *                       type: integer
 *                     updated:
 *                       type: integer
 *                 actorActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       actorId:
 *                         type: string
 *                       actorRole:
 *                         type: string
 *                       actionCount:
 *                         type: integer
 *                       lastActivity:
 *                         type: string
 *                         format: date-time
 *                 blockchainMetrics:
 *                   type: object
 *                   properties:
 *                     totalTransactions:
 *                       type: integer
 *                     gasUsed:
 *                       type: string
 *                     averageConfirmationTime:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Claim not found
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
router.get('/:id/audit-aggregate', authMiddleware, auditAggregate);
export default router;
