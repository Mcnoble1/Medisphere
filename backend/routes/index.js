import express from 'express';

var router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome route for Medisphere API
 *     tags: [General]
 *     description: Returns a welcome message and basic API information for the Medisphere healthcare platform
 *     responses:
 *       200:
 *         description: Welcome message with API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to the Medisphere API"
 *                 description:
 *                   type: string
 *                   example: "Blockchain-powered healthcare data management platform"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     documentation:
 *                       type: string
 *                       example: "/api-docs"
 *                     health:
 *                       type: string
 *                       example: "/health"
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Digital Identity", "Medical Records", "Insurance Claims", "Drug Traceability"]
 *                 status:
 *                   type: string
 *                   example: "operational"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00Z"
 */
router.get('/', function (req, res, next) {
  res.send('Welcome to the Medisphere API');
});

export default router;