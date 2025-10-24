// backend/routes/labRoutes.js
import express from 'express';
import { createLabResult } from '../controllers/labController.js';
import { authMiddleware } from '../middlewares/auth.js'; // assumes you have auth middleware
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: '/tmp/uploads' }); // configure as needed

/**
 * @swagger
 * /labs/results:
 *   post:
 *     summary: Create a new lab result
 *     tags: [Lab Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *                 description: Patient's DID
 *               labId:
 *                 type: string
 *                 description: Laboratory's DID
 *               testType:
 *                 type: string
 *                 description: Type of laboratory test
 *               results:
 *                 type: object
 *                 description: Test results data
 *               normalRanges:
 *                 type: object
 *                 description: Normal value ranges for the tests
 *               testDate:
 *                 type: string
 *                 format: date
 *                 description: Date when the test was performed
 *               attachment:
 *                 type: string
 *                 format: binary
 *                 description: Optional file attachment (reports, images, etc.)
 *             required:
 *               - patientId
 *               - labId
 *               - testType
 *               - results
 *               - testDate
 *     responses:
 *       201:
 *         description: Lab result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultId:
 *                   type: string
 *                   description: Unique identifier for the lab result
 *                 blockHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *                 ipfsHash:
 *                   type: string
 *                   description: IPFS hash for stored data
 *                 attachmentHash:
 *                   type: string
 *                   description: IPFS hash for attachment if uploaded
 *       400:
 *         description: Bad request - Invalid input data
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
// POST /api/labs/results
// Use multipart/form-data if you want file attachment support
router.post('/results', authMiddleware, upload.single('attachment'), createLabResult);

export default router;
