import { Router } from 'express';
import { issueVc, revokeVc, isVcRevoked } from '../identity/vc.js';
const router = Router();

/**
 * @swagger
 * /vc/issue:
 *   post:
 *     summary: Issue a new Verifiable Credential
 *     tags: [Digital Identity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               issuerDid:
 *                 type: string
 *                 description: DID of the credential issuer
 *               subjectDid:
 *                 type: string
 *                 description: DID of the credential subject
 *               type:
 *                 type: string
 *                 description: Type of the credential
 *               claim:
 *                 type: object
 *                 description: The credential claim data
 *             required:
 *               - issuerDid
 *               - subjectDid
 *               - type
 *               - claim
 *     responses:
 *       201:
 *         description: Verifiable credential issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vc:
 *                   type: object
 *                   description: The issued verifiable credential
 *                 vcId:
 *                   type: string
 *                   description: The credential ID
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/issue', async (req, res) => {
  try {
    const { issuerDid, subjectDid, type, claim } = req.body;
    const out = await issueVc({ issuerDid, subjectDid, type, claim });
    res.status(201).json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @swagger
 * /vc/revoke:
 *   post:
 *     summary: Revoke a Verifiable Credential
 *     tags: [Digital Identity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vcId:
 *                 type: string
 *                 description: ID of the credential to revoke
 *               reason:
 *                 type: string
 *                 description: Reason for revocation
 *             required:
 *               - vcId
 *               - reason
 *     responses:
 *       200:
 *         description: Credential revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/revoke', async (req, res) => {
  try {
    const { vcId, reason } = req.body;
    const out = await revokeVc(vcId, reason);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @swagger
 * /vc/status/{vcId}:
 *   get:
 *     summary: Check the revocation status of a Verifiable Credential
 *     tags: [Digital Identity]
 *     parameters:
 *       - in: path
 *         name: vcId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the credential to check
 *     responses:
 *       200:
 *         description: Credential status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vcId:
 *                   type: string
 *                   description: The credential ID
 *                 revoked:
 *                   type: boolean
 *                   description: Whether the credential is revoked
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/status/:vcId', async (req, res) => {
  try {
    const revoked = await isVcRevoked(req.params.vcId);
    res.json({ vcId: req.params.vcId, revoked });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;