import express from 'express';
import { resolveDID, issueVC, listVCs } from '../controllers/personaController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /persona/resolve/{did}:
 *   get:
 *     summary: Resolve a DID (Decentralized Identifier) to its document
 *     tags: [Digital Persona]
 *     parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *         description: The DID to resolve
 *         example: "did:medisphere:abc123"
 *     responses:
 *       200:
 *         description: DID document resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 '@context':
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: JSON-LD context
 *                 id:
 *                   type: string
 *                   description: The DID identifier
 *                 controller:
 *                   type: string
 *                   description: DID controller
 *                 verificationMethod:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       controller:
 *                         type: string
 *                       publicKeyMultibase:
 *                         type: string
 *                   description: Verification methods for the DID
 *                 authentication:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Authentication methods
 *                 service:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       serviceEndpoint:
 *                         type: string
 *                   description: Service endpoints
 *                 created:
 *                   type: string
 *                   format: date-time
 *                 updated:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid DID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: DID not found
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
// Resolve DID document (public)
router.get('/resolve/:did', resolveDID);

/**
 * @swagger
 * /persona/{did}/vcs:
 *   get:
 *     summary: List Verifiable Credentials metadata for a DID
 *     tags: [Digital Persona]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *         description: The DID to list credentials for
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by credential type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, revoked, expired]
 *         description: Filter by credential status
 *       - in: query
 *         name: issuer
 *         schema:
 *           type: string
 *         description: Filter by issuer DID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of credentials to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of credentials to skip
 *     responses:
 *       200:
 *         description: Credential metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 did:
 *                   type: string
 *                   description: The DID being queried
 *                 credentials:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vcId:
 *                         type: string
 *                         description: Credential ID
 *                       type:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Credential types
 *                       issuer:
 *                         type: string
 *                         description: Issuer DID
 *                       issuanceDate:
 *                         type: string
 *                         format: date-time
 *                       expirationDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [active, revoked, expired]
 *                       credentialSubject:
 *                         type: object
 *                         description: Credential subject metadata (without sensitive data)
 *                       proof:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           created:
 *                             type: string
 *                             format: date-time
 *                           verificationMethod:
 *                             type: string
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Access denied
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
 *         description: DID not found
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
// List VC metadata for DID (protected - subject or admin)
router.get('/:did/vcs', listVCs);

/**
 * @swagger
 * /persona/{did}/issue-vc:
 *   post:
 *     summary: Issue a Verifiable Credential to a DID
 *     tags: [Digital Persona]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *         description: The subject DID to issue the credential to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Types of the credential
 *                 example: ["VerifiableCredential", "MedicalLicense"]
 *               credentialSubject:
 *                 type: object
 *                 description: The credential subject claims
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Subject DID
 *                 additionalProperties: true
 *               issuer:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Issuer DID
 *                   name:
 *                     type: string
 *                     description: Issuer name
 *                 required:
 *                   - id
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 description: When the credential expires
 *               context:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: JSON-LD contexts
 *               evidence:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Evidence supporting the credential
 *             required:
 *               - type
 *               - credentialSubject
 *               - issuer
 *     responses:
 *       201:
 *         description: Verifiable Credential issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vc:
 *                   type: object
 *                   properties:
 *                     '@context':
 *                       type: array
 *                       items:
 *                         type: string
 *                     id:
 *                       type: string
 *                     type:
 *                       type: array
 *                       items:
 *                         type: string
 *                     issuer:
 *                       type: object
 *                     issuanceDate:
 *                       type: string
 *                       format: date-time
 *                     expirationDate:
 *                       type: string
 *                       format: date-time
 *                     credentialSubject:
 *                       type: object
 *                     proof:
 *                       type: object
 *                 vcId:
 *                   type: string
 *                   description: Unique credential identifier
 *                 blockHash:
 *                   type: string
 *                   description: Blockchain transaction hash
 *                 issuedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - Invalid credential data
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
 *         description: Forbidden - Admin privileges required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: DID not found
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
// Issue VC (admin only)
router.post('/:did/issue-vc', authenticate, authorizeRoles('GOVERNMENT'), issueVC);

export default router;
