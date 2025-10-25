// Import dependencies
import createError from "http-errors";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDB from "./config/db.js";
import helmet from 'helmet';
import morgan from 'morgan';

import { makeHederaClient } from './utils/hederaClient.js';
import { ensureAuditTopic, getAuditTopicId } from './utils/hcsLogger.js';
import { makeAuthController } from './controllers/authController.js';
import { makeAuthRouter } from './routes/authRoutes.js';

// Import routes
import indexRouter from "./routes/index.js";
import userDetailsRoutes from "./routes/userDetailsRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import insuranceRoutes from "./routes/insuranceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import identityRoutes from './routes/identityRoutes.js';
import vcRoutes from './routes/vcRoutes.js';
import personaRoutes from './routes/personaRoutes.js';
import lifechainRoutes from './routes/lifechainRoutes.js';
import labRoutes from './routes/labRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import meditraceRoutes from './routes/meditraceRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import medflowRoutes from "./routes/medflowRoutes.js";
import dataRequestRoutes from './routes/dataRequestRoutes.js';
import databridgeRoutes from './routes/databridgeRoutes.js';
import govHealthRoutes from './routes/govHealthRoutes.js';
import impactgridRoutes from './routes/impactgridRoutes.js';
import healthiqRoutes from './routes/healthiqRoutes.js';
import explorerRoutes from './routes/explorerRoutes.js';

// Swagger imports
import swaggerUi, { specs } from './swagger.js';



// import authRouter from "./routes/auth.js";

// Import middleware
// import { authMiddleware } from "./middlewares/authMiddleware.js";

// Initialize environment and database
dotenv.config();
connectDB();

const api = process.env.API_URL;
var app = express();

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  express.static(path.join(dirname(fileURLToPath(import.meta.url)), "public")),
);


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://medisphere.up.railway.app",
    ],
    credentials: true,
  }),
);

// Middleware to add Hedera client to requests (will be initialized later)
app.use((req, res, next) => {
  req.hederaClient = req.app.get('hederaClient');
  next();
});

// Main routes
app.use(`${api}/`, indexRouter);

// Core service routes
app.use(`${api}/user`, userDetailsRoutes);
app.use(`${api}/records`, recordRoutes);
app.use(`${api}/insurance`, insuranceRoutes);
app.use(`${api}/payments`, paymentRoutes);

// Legacy/additional routes
app.use(`${api}/identity`, identityRoutes);
app.use(`${api}/vc`, vcRoutes);
app.use(`${api}/persona`, personaRoutes);
app.use(`${api}/lifechain`, lifechainRoutes);
app.use(`${api}/labs`, labRoutes);
app.use(`${api}/timeline`, timelineRoutes);
app.use(`${api}/meditrace`, meditraceRoutes);
app.use(`${api}/claims`, claimRoutes);
app.use(`${api}/medflow`, medflowRoutes);
app.use(`${api}/data-requests`, dataRequestRoutes);
app.use(`${api}/databridge`, databridgeRoutes);
app.use(`${api}/gov-health`, govHealthRoutes);
app.use(`${api}/impact`, impactgridRoutes);
app.use(`${api}/healthiq`, healthiqRoutes);
app.use(`${api}/explorer`, explorerRoutes);


// Health
app.get(`${api}/health`, (_req, res) => res.json({ ok: true }));

// Initialize async services
async function initializeServices() {
  try {
    // Mongo
    await connectDB(process.env.MONGO_URI);

    // Hedera client
    const client = makeHederaClient({
      network: process.env.HEDERA_NETWORK,
      operatorId: process.env.OPERATOR_ID,
      operatorKey: process.env.OPERATOR_KEY
    });
    console.log("Hedera Client:", client.operatorAccountId.toString());
    console.log(`Hedera client connected to ${process.env.HEDERA_NETWORK}`);

    // HCS Audit Topic
    await ensureAuditTopic(client, process.env.MEDISPHERE_HCS_AUDIT_TOPIC_ID);
    console.log('HCS Audit TopicId:', getAuditTopicId());

    // Store Hedera client in app for middleware access
    app.set('hederaClient', client);

    // Controllers & Routes
    const authController = makeAuthController({ client });
    app.use(`${api}/auth`, makeAuthRouter(authController));

    // Swagger Documentation
    app.use(`${api}/docs`, swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customSiteTitle: 'Medisphere API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2c5aa0 }
        .swagger-ui .info .description { font-size: 16px }
      `
    }));

    // Swagger JSON endpoint
    app.get('/api/docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });

    // 404 handler (must be after all routes)
    app.use((_req, _res, next) => next(createError(404, 'Not Found')));

    // Error handler
    // eslint-disable-next-line no-unused-vars
    app.use((err, _req, res, _next) => {
      const status = err.status || 500;
      const payload = { status, message: err.message || 'Server Error' };
      if (err.details) payload.details = err.details;
      res.status(status).json(payload);
    });

    console.log('Services initialized successfully');
  } catch (err) {
    console.error('Service initialization error:', err);
    process.exit(1);
  }
}

// Initialize services
initializeServices();

export default app;

