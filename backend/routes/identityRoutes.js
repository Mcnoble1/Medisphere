import { Router } from 'express';
import { createAndPublishDid, resolveDid } from '../identity/network.js';
const router = Router();

/**
 * @swagger
 * /api/identity/did:
 *   post:
 *     summary: Create and publish a new DID with generated key
 *     tags: [Identity (DID)]
 *     responses:
 *       201:
 *         description: DID created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 did:
 *                   type: string
 *                   example: "did:hedera:testnet:z6MkgC4ZbwjWbQwK..."
 *                 didDocument:
 *                   $ref: '#/components/schemas/DIDDocument'
 *                 privateKey:
 *                   type: string
 *                   description: "Base58-encoded private key"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/did', async (req, res) => {
  try {
    const out = await createAndPublishDid({ withGeneratedKey: true });
    res.status(201).json(out);
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack, requestBody: req.body });
  }
});

/**
 * @swagger
 * /api/identity/did/resolve:
 *   get:
 *     summary: Resolve a DID document
 *     tags: [Identity (DID)]
 *     parameters:
 *       - in: query
 *         name: did
 *         required: true
 *         schema:
 *           type: string
 *         description: The DID to resolve
 *         example: "did:hedera:testnet:z6MkgC4ZbwjWbQwK..."
 *     responses:
 *       200:
 *         description: DID document resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DIDDocument'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/did/resolve', async (req, res) => {
  try {
    const { did } = req.query;
    const doc = await resolveDid(did);
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;