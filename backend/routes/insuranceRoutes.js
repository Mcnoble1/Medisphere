import express from 'express';
import {
  createClaim,
  getPatientClaims,
  getMyClaims,
  updateClaimStatus,
  getClaimStats,
  getClaimById
} from '../controllers/insuranceController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /insurance/claims:
 *   post:
 *     summary: Create a new insurance claim
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - recordId
 *               - insurerId
 *               - amountClaimed
 *               - claimType
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: Patient user ID
 *               recordId:
 *                 type: string
 *                 description: Associated medical record ID
 *               insurerId:
 *                 type: string
 *                 description: Insurance company user ID
 *               amountClaimed:
 *                 type: number
 *                 description: Claimed amount
 *                 example: 50000
 *               claimType:
 *                 type: string
 *                 enum: [medical, dental, vision, prescription, hospital, emergency]
 *                 description: Type of insurance claim
 *               description:
 *                 type: string
 *                 description: Description of the claim
 *               supportingDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs or IPFS CIDs of supporting documents
 *     responses:
 *       201:
 *         description: Claim created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 claim:
 *                   $ref: '#/components/schemas/Claim'
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
// Create new insurance claim
router.post('/claims', authenticate, createClaim);

/**
 * @swagger
 * /insurance/claims/patient/{patientId}:
 *   get:
 *     summary: Get claims for a specific patient
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, PAID]
 *         description: Filter by claim status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of claims to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
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
 *                 success:
 *                   type: boolean
 *                 claims:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Claim'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
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
// Get claims for a specific patient
router.get('/claims/patient/:patientId', authenticate, getPatientClaims);

/**
 * @swagger
 * /insurance/claims/my:
 *   get:
 *     summary: Get my insurance claims (for authenticated patient)
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, PAID]
 *         description: Filter by claim status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of claims to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
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
 *                 success:
 *                   type: boolean
 *                 claims:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Claim'
 *                 total:
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
// Get my claims (for patients)
router.get('/claims/my', authenticate, getMyClaims);

/**
 * @swagger
 * /insurance/claims/{claimId}:
 *   get:
 *     summary: Get claim by ID
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: claimId
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
 *                 success:
 *                   type: boolean
 *                 claim:
 *                   $ref: '#/components/schemas/Claim'
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
// Get claim by ID
router.get('/claims/:claimId', authenticate, getClaimById);

/**
 * @swagger
 * /insurance/claims/{claimId}/status:
 *   put:
 *     summary: Update claim status (for insurers/reviewers)
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: claimId
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED, PAID]
 *                 description: New claim status
 *               amountApproved:
 *                 type: number
 *                 description: Approved amount (required if status is APPROVED)
 *               decisionReason:
 *                 type: string
 *                 description: Reason for approval/rejection
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Claim status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 claim:
 *                   $ref: '#/components/schemas/Claim'
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
 *       403:
 *         description: Forbidden - Insufficient privileges
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
// Update claim status (for reviewers)
router.put('/claims/:claimId/status', authenticate, updateClaimStatus);

/**
 * @swagger
 * /insurance/claims/stats:
 *   get:
 *     summary: Get claim statistics
 *     tags: [Insurance Claims]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter stats by patient ID
 *       - in: query
 *         name: insurerId
 *         schema:
 *           type: string
 *         description: Filter stats by insurer ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics period
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics period
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalClaims:
 *                       type: integer
 *                     pendingClaims:
 *                       type: integer
 *                     approvedClaims:
 *                       type: integer
 *                     rejectedClaims:
 *                       type: integer
 *                     paidClaims:
 *                       type: integer
 *                     totalAmountClaimed:
 *                       type: number
 *                     totalAmountApproved:
 *                       type: number
 *                     averageProcessingTime:
 *                       type: number
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
// Get claim statistics
router.get('/claims/stats', authenticate, getClaimStats);

export default router;
