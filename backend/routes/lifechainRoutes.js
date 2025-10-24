// backend/routes/lifechainRoutes.js
import express from 'express';
import { createRecord, getRecordById, listPatientRecords, generateShareToken } from '../controllers/lifechainController.js';
import { authMiddleware } from '../middlewares/auth.js'; 

const router = express.Router();

/**
 * @swaggers
 * /lifechain/records:
 *   post:
 *     summary: Create a new medical record
 *     tags: [LifeChain]
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
 *               clinicId:
 *                 type: string
 *                 description: Clinic's DID
 *               type:
 *                 type: string
 *                 description: Type of medical record
 *               data:
 *                 type: object
 *                 description: Medical record data
 *               encryption:
 *                 type: object
 *                 description: Encryption parameters
 *             required:
 *               - patientId
 *               - clinicId
 *               - type
 *               - data
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recordId:
 *                   type: string
 *                 blockHash:
 *                   type: string
 *                 ipfsHash:
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
// Clinic creates a record
router.post('/records', authMiddleware, createRecord);

/**
 * @swagger
 * /lifechain/records/{id}:
 *   get:
 *     summary: Get a single medical record by ID
 *     tags: [LifeChain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *       - in: query
 *         name: share
 *         schema:
 *           type: string
 *         description: Optional share token for authorized access
 *     responses:
 *       200:
 *         description: Medical record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recordId:
 *                   type: string
 *                 patientId:
 *                   type: string
 *                 clinicId:
 *                   type: string
 *                 type:
 *                   type: string
 *                 data:
 *                   type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 blockHash:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Record not found
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
// Get a single record (decrypted if authorized)
// supports optional ?share=token query param for shared access
router.get('/records/:id', authMiddleware, getRecordById);

/**
 * @swagger
 * /lifechain/patient/{patientId}/records:
 *   get:
 *     summary: List all medical records for a patient
 *     tags: [LifeChain]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: Patient records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 records:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       recordId:
 *                         type: string
 *                       type:
 *                         type: string
 *                       clinicId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
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
// List records for a patient
router.get('/patient/:patientId/records', authMiddleware, listPatientRecords);

/**
 * @swagger
 * /lifechain/share:
 *   post:
 *     summary: Generate a share token for medical record access
 *     tags: [LifeChain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recordId:
 *                 type: string
 *                 description: ID of the record to share
 *               recipientId:
 *                 type: string
 *                 description: DID of the recipient
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of permissions to grant
 *               expiresIn:
 *                 type: integer
 *                 description: Expiration time in seconds
 *             required:
 *               - recordId
 *               - recipientId
 *               - permissions
 *     responses:
 *       201:
 *         description: Share token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shareToken:
 *                   type: string
 *                   description: The generated share token
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Token expiration time
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Granted permissions
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
// Generate share token
router.post('/share', authMiddleware, generateShareToken);

export default router;
