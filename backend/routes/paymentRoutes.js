import express from 'express';
import {
  getPaymentAccount,
  addTransaction,
  getTransactionHistory,
  addPaymentMethod,
  getPaymentMethods,
  transferTokens,
  getAccountAnalytics,
  associateToken,
  sendHTSTokens,
  getTokenBalances,
  getCampaignRewardTokens,
} from '../controllers/paymentController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * /payments/account:
 *   get:
 *     summary: Get or create user payment account
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment account retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 account:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     accountId:
 *                       type: string
 *                     hederaAccountId:
 *                       type: string
 *                     balance:
 *                       type: number
 *                     currency:
 *                       type: string
 *                       example: HBAR
 *                     createdAt:
 *                       type: string
 *                       format: date-time
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
// Get or create payment account
router.get('/account', authenticate, getPaymentAccount);

/**
 * @swagger
 * /payments/transactions:
 *   post:
 *     summary: Add a new payment transaction
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - currency
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [payment, refund, transfer, deposit, withdrawal]
 *               amount:
 *                 type: number
 *                 example: 100.50
 *               currency:
 *                 type: string
 *                 example: HBAR
 *               recipientId:
 *                 type: string
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transaction:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                     type:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     hederaTransactionId:
 *                       type: string
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
// Add transaction
router.post('/transactions', authenticate, addTransaction);

/**
 * @swagger
 * /payments/transactions:
 *   get:
 *     summary: Get user transaction history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [payment, refund, transfer, deposit, withdrawal]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
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
// Get transaction history
router.get('/transactions', authenticate, getTransactionHistory);

/**
 * @swagger
 * /payments/methods:
 *   post:
 *     summary: Add a new payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [credit_card, debit_card, bank_account, crypto_wallet, hedera_account]
 *               details:
 *                 type: object
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Payment method added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 paymentMethod:
 *                   type: object
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
// Add payment method
router.post('/methods', authenticate, addPaymentMethod);

/**
 * @swagger
 * /payments/methods:
 *   get:
 *     summary: Get user payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [credit_card, debit_card, bank_account, crypto_wallet, hedera_account]
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 paymentMethods:
 *                   type: array
 *                   items:
 *                     type: object
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
// Get payment methods
router.get('/methods', authenticate, getPaymentMethods);

/**
 * @swagger
 * /payments/transfer:
 *   post:
 *     summary: Transfer tokens between users
 *     tags: [Payments]
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
 *               - amount
 *               - currency
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: Recipient user ID or Hedera account ID
 *               amount:
 *                 type: number
 *                 example: 50.00
 *               currency:
 *                 type: string
 *                 example: HBAR
 *               memo:
 *                 type: string
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transfer:
 *                   type: object
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
// Transfer tokens between users
router.post('/transfer', authenticate, transferTokens);

/**
 * @swagger
 * /payments/analytics:
 *   get:
 *     summary: Get account analytics and spending insights
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
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
// Get account analytics
router.get('/analytics', authenticate, getAccountAnalytics);

/**
 * @swagger
 * /payments/tokens/associate:
 *   post:
 *     summary: Associate HTS token with user account
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: Hedera Token Service token ID
 *                 example: "0.0.12345"
 *     responses:
 *       200:
 *         description: Token associated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 tokenId:
 *                   type: string
 *                 hederaTransactionId:
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
// HTS Token operations
router.post('/tokens/associate', authenticate, associateToken);

/**
 * @swagger
 * /payments/tokens/send:
 *   post:
 *     summary: Send HTS tokens to another account
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *               - recipientAccountId
 *               - amount
 *             properties:
 *               tokenId:
 *                 type: string
 *                 example: "0.0.12345"
 *               recipientAccountId:
 *                 type: string
 *                 example: "0.0.67890"
 *               amount:
 *                 type: number
 *                 example: 100
 *               memo:
 *                 type: string
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Tokens sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transfer:
 *                   type: object
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
router.post('/tokens/send', authenticate, sendHTSTokens);

/**
 * @swagger
 * /payments/tokens/balances:
 *   get:
 *     summary: Get HTS token balances for user account
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tokenId
 *         schema:
 *           type: string
 *         description: Filter by specific token ID
 *     responses:
 *       200:
 *         description: Token balances retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 balances:
 *                   type: array
 *                   items:
 *                     type: object
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
router.get('/tokens/balances', authenticate, getTokenBalances);

/**
 * @swagger
 * /payments/tokens/campaign-rewards:
 *   get:
 *     summary: Get campaign reward tokens for user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, claimed, expired]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Campaign reward tokens retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rewards:
 *                   type: array
 *                   items:
 *                     type: object
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
router.get('/tokens/campaign-rewards', authenticate, getCampaignRewardTokens);

export default router;