import express from 'express';
import { createBatch, addEvent, getBatchByNumber, verifyToken, reportIssue, getAllBatches } from '../controllers/meditraceController.js';
const router = express.Router();

/**
 * @swagger
 * /meditrace/batch:
 *   post:
 *     summary: Create a new pharmaceutical batch for tracking
 *     tags: [MediTrace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               manufacturerId:
 *                 type: string
 *                 description: Manufacturer's DID
 *               drugName:
 *                 type: string
 *                 description: Name of the pharmaceutical drug
 *               batchNumber:
 *                 type: string
 *                 description: Unique batch identifier
 *               quantity:
 *                 type: integer
 *                 description: Number of units in the batch
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Batch expiration date
 *               manufacturingDate:
 *                 type: string
 *                 format: date
 *                 description: Date when batch was manufactured
 *               metadata:
 *                 type: object
 *                 description: Additional batch information
 *             required:
 *               - manufacturerId
 *               - drugName
 *               - batchNumber
 *               - quantity
 *               - expiryDate
 *               - manufacturingDate
 *     responses:
 *       201:
 *         description: Batch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batchId:
 *                   type: string
 *                   description: Unique batch ID
 *                 batchNumber:
 *                   type: string
 *                   description: Batch number
 *                 tokenId:
 *                   type: string
 *                   description: NFT token ID for batch tracking
 *                 blockHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *       400:
 *         description: Bad request
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
router.post('/batch', createBatch);
/**
 * @swagger
 * /meditrace/event:
 *   post:
 *     summary: Add a tracking event to a pharmaceutical batch
 *     tags: [MediTrace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batchNumber:
 *                 type: string
 *                 description: Batch number to add event to
 *               eventType:
 *                 type: string
 *                 enum: [manufactured, shipped, received, dispensed, recalled]
 *                 description: Type of tracking event
 *               actorId:
 *                 type: string
 *                 description: DID of the actor performing the event
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *                 description: Location where event occurred
 *               quantity:
 *                 type: integer
 *                 description: Quantity involved in the event
 *               metadata:
 *                 type: object
 *                 description: Additional event-specific data
 *             required:
 *               - batchNumber
 *               - eventType
 *               - actorId
 *               - location
 *     responses:
 *       201:
 *         description: Event added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventId:
 *                   type: string
 *                   description: Unique event ID
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: When the event was recorded
 *                 blockHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Batch not found
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
router.post('/event', addEvent);
/**
 * @swagger
 * /meditrace/batch/{batchNumber}:
 *   get:
 *     summary: Get detailed information about a pharmaceutical batch
 *     tags: [MediTrace]
 *     parameters:
 *       - in: path
 *         name: batchNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Batch number to retrieve
 *     responses:
 *       200:
 *         description: Batch information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 batchId:
 *                   type: string
 *                 batchNumber:
 *                   type: string
 *                 manufacturerId:
 *                   type: string
 *                 drugName:
 *                   type: string
 *                 quantity:
 *                   type: integer
 *                 remainingQuantity:
 *                   type: integer
 *                 expiryDate:
 *                   type: string
 *                   format: date
 *                 manufacturingDate:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *                   enum: [active, recalled, expired]
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventId:
 *                         type: string
 *                       eventType:
 *                         type: string
 *                       actorId:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       location:
 *                         type: object
 *                       quantity:
 *                         type: integer
 *                       blockHash:
 *                         type: string
 *                 tokenId:
 *                   type: string
 *                 metadata:
 *                   type: object
 *       404:
 *         description: Batch not found
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
router.get('/batch/:batchNumber', getBatchByNumber);
/**
 * @swagger
 * /meditrace/verify/{tokenId}:
 *   get:
 *     summary: Verify the authenticity of a pharmaceutical batch using NFT token
 *     tags: [MediTrace]
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: NFT token ID to verify
 *     responses:
 *       200:
 *         description: Token verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokenId:
 *                   type: string
 *                   description: The verified token ID
 *                 isValid:
 *                   type: boolean
 *                   description: Whether the token is valid and authentic
 *                 batchNumber:
 *                   type: string
 *                   description: Associated batch number
 *                 manufacturerId:
 *                   type: string
 *                   description: Manufacturer's DID
 *                 drugName:
 *                   type: string
 *                   description: Name of the pharmaceutical
 *                 status:
 *                   type: string
 *                   enum: [active, recalled, expired]
 *                   description: Current batch status
 *                 mintedAt:
 *                   type: string
 *                   format: date-time
 *                   description: When the token was created
 *                 blockHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *       404:
 *         description: Token not found
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
router.get('/verify/:tokenId', verifyToken);

/**
 * @swagger
 * /meditrace/report:
 *   post:
 *     summary: Report counterfeit or quality issues
 *     tags: [MediTrace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               batchNumber:
 *                 type: string
 *                 description: Batch number to report issue for
 *               reporterDid:
 *                 type: string
 *                 description: Reporter's DID
 *               issueType:
 *                 type: string
 *                 enum: [counterfeit, temperature, damaged, expired, other]
 *                 description: Type of issue
 *               description:
 *                 type: string
 *                 description: Detailed description of the issue
 *               location:
 *                 type: string
 *                 description: Location where issue was found
 *               evidence:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs or CIDs of evidence
 *             required:
 *               - batchNumber
 *               - reporterDid
 *               - issueType
 *               - description
 *               - location
 *     responses:
 *       201:
 *         description: Issue reported successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Batch not found
 */
router.post('/report', reportIssue);

/**
 * @swagger
 * /meditrace/batches:
 *   get:
 *     summary: Get all batches with optional filtering
 *     tags: [MediTrace]
 *     parameters:
 *       - in: query
 *         name: manufacturerDid
 *         schema:
 *           type: string
 *         description: Filter by manufacturer DID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of batches retrieved successfully
 */
router.get('/batches', getAllBatches);

export default router;
