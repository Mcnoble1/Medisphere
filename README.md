# MediSphere - Hedera-Powered Healthcare Data Management Platform

- **Track**: DLT for Operations
- [Hashgraph Certificate](https://drive.google.com/file/d/1KW4IWeE4MEwC77DHKmd1zZ4FbXTOibOv/view?usp=sharing)
- [Pitch Deck](https://drive.google.com/file/d/1iAnJCHV5qGHSnGc8NcvXj70Fc7Sims_E/view?usp=sharing)
- [Demo Video](https://www.youtu.be/sutUauyCy3s)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache-yellow.svg)](https://opensource.org/licenses/Apache-2.0)
[![Hedera](https://img.shields.io/badge/Powered%20by-Hedera-blue)](https://hedera.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Hedera Integration Summary](#hedera-integration-summary)
- [Deployment and Setup Instructions](#deployment--setup-instructions)
- [Architectural Diagram](#architecture-diagram)
- [Deployed Hedera IDs](#deployed-hedera-ids)
- [Project Structure](#project-structure)

---

## Core Features & Services

MediSphere consists of **11 integrated services** solving specific healthcare challenges:

1. **LifeChain** - Health Records Management (HCS + IPFS + NFTs)
2. **PersonaVault** - Decentralized Identity (Hedera DID + Verifiable Credentials)
3. **CareXpay** - Token-Based Payments (HTS fungible tokens + HBAR)
4. **DataBridge** - Consent-Based Data Exchange (8 actor types, JWT access control)
5. **HealthIQ** - AI Health Assistant (Personalized insights, conversational AI)
6. **ClaimSphere** - Insurance Claims (HCS verification + automatic HTS payouts)
7. **ImpactGrid** - Health Campaigns (Custom HTS tokens, batch rewards)
8. **GovHealth** - Compliance & Licensing (IPFS certificates, HCS regulatory logs)
9. **MediTrace** - Pharmaceutical Supply Chain (QR codes, anti-counterfeiting)
10. **MedFlow** - Appointment Management (Scheduling with HCS logs)
11. **BlockExplorer** - Public Data Verification (Mirror Node indexer, statistics)

---

## Hedera Integration Summary

MediSphere integrates **four core Hedera services** to deliver secure, transparent, and affordable health data management across Africa. The platform emphasizes cost-efficiency and scalability for resource-limited healthcare systems.

---

### 1. Hedera Consensus Service (HCS) – Immutable Audit Trails

**Why HCS:**  
HCS offers **predictable micro-fees ($0.0001/message)** for immutable logging, ensuring compliance and auditability at a fraction of cloud costs ($0.10–$0.30/GB). This enables even small clinics to maintain secure, verifiable audit trails.

**Transaction Types Executed**:

- `TopicMessageSubmitTransaction` - Submit audit log entries to HCS topics
- `TopicCreateTransaction` - Initialize platform-wide audit topic during deployment
- `TopicInfoQuery` - Retrieve topic metadata and verify topic configuration

**Economics:**  
A hospital logging 1,000 events/month pays **$0.10**, versus $50–$200 using centralized systems — a **500–2000× cost reduction**. With 10,000+ TPS, scalability is guaranteed.

**Use Cases:**

- Health record updates
- Consent trails
- Insurance claim tracking
- Campaign participation logs
- Regulatory compliance and licensing

---

### 2. Hedera Token Service (HTS) – Incentive & Payment Layer

**Why HTS:**  
With **$1 token creation** and **$0.001 transfer fees**, HTS enables micro-payments for campaigns, insurance payouts, and patient rewards. ABFT finality ensures instant settlement — essential for time-critical healthcare operations.

**Transaction Types Executed**:

- `TokenCreateTransaction` - Create fungible tokens for health campaigns (e.g., vaccination rewards)
- `TokenMintTransaction` - Mint NFTs for vaccination certificates and achievement badges
- `TokenAssociateTransaction` - Associate users with platform tokens before first transfer
- `TransferTransaction` - Distribute campaign rewards, insurance payouts, and peer-to-peer payments
- `TokenBurnTransaction` - Burn redeemed reward tokens to maintain economic balance
- `TokenInfoQuery` - Query token metadata, supply, and treasury account

**Economics:**  
Rewarding 100,000 users costs **$101 total** vs $2,000–$3,000 via traditional processors — **95%+ savings** and real-time settlement.

**Use Cases:**

- CARE token (native currency)
- Campaign rewards
- Automated insurance payouts
- NFT vaccination certificates
- Tokenized analytics access
- Peer-to-peer payments

---

### 3. Hedera Mirror Node API – Real-Time Transparency

**Why Mirror Node:**  
Provides **free REST API access** to verified blockchain data for our BlockExplorer, enabling public record verification without on-chain query fees. Data updates within 2–3 seconds of consensus.

**Endpoints:**  
`/topics/{topicId}/messages`, `/transactions/{transactionId}`, `/accounts/{accountId}/tokens`, `/tokens/{tokenId}`, `/accounts/{accountId}`

**Economics:**  
Zero-cost indexing vs $50–$500/month for other APIs. Supports 10,000+ messages/day, making transparency scalable and sustainable.

**Use Cases:**

- Real-time HCS message polling and indexing
- Public record verification via hash lookup
- Platform-wide statistics dashboard (30-day activity, record distribution)
- Top providers leaderboard (incentivizes quality care)
- Privacy-preserving indexing (no PHI stored, only metadata)
- HashScan integration for blockchain verification links

---

### 4. Hedera DID SDK – Self-Sovereign Identity

**Why Hedera DID:**  
Provides **free, decentralized identity management**, solving Africa’s credential fraud problem. DID setup costs **~$0.50** versus $10,000+ for PKI systems, using W3C Verifiable Credentials for global interoperability.

**Transactions:**  
`TopicMessageSubmitTransaction`, `TopicCreateTransaction`, DID document publishing & resolution

**Economics:**  
10,000 practitioners = **$500/year**, vs $50k–$100k using legacy systems — a **99% reduction**.

**Use Cases:**

- Doctor license credential issuance
- Facility accreditation certificates
- Lab certification credentials
- Pharmacy licensing
- Patient identity verification (GDPR/HIPAA compliant)
- Cryptographic proof of qualification without exposing sensitive data

---

## Deployment & Setup Instructions

### Prerequisites

Ensure you have the following installed and configured:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org))
- **MongoDB** v6.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Hedera Testnet Account** with HBAR balance ([Create Free Account](https://portal.hedera.com))
- **Pinata Account** for IPFS storage ([Sign Up](https://pinata.cloud))
- **Cloudinary Account** for media uploads ([Sign Up](https://cloudinary.com))

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/medisphere.git
cd medisphere
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure Environment Variables** (Edit `backend/.env`):

**Initialize Hedera Resources** (First-time setup):

```bash
# Create HCS audit topic (note down the topic ID)
node scripts/createHCSTopic.js

# Create NFT collection for vaccination certificates (note down the token ID)
node scripts/createNFTCollection.js

# Update .env with the generated IDs
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
```

### Step 4: Start Development Servers

Open **3 terminal windows**:

**Terminal 1 - MongoDB** (if not running as service):

```bash
mongod --dbpath /path/to/your/data/directory
```

**Terminal 2 - Backend API Server**:

```bash
cd backend
npm start
```

Expected output:

```
✅ MongoDB connected
✅ Hedera client initialized (Account: 0.0.YOUR_ACCOUNT_ID)
✅ Server running on http://localhost:4000
✅ API Documentation: http://localhost:4000/api/docs
```

**Terminal 3 - Backend Indexer** (Optional but recommended):

```bash
cd backend
npm run indexer
```

**Terminal 4 - Frontend Development Server**:

```bash
cd frontend
npm run dev
```

### Step 5: Verify Installation

1. **Access Frontend**: Open browser to `http://localhost:3000`
2. **Access API Docs**: Navigate to `http://localhost:4000/api/docs`
3. **Backend API**: Express.js REST API on `http://localhost:4000/api`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MEDISPHERE ARCHITECTURE                        │
│                        (11 Integrated Services)                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Next.js/React)                           │
│                                                                          │
│  Row 1: Core Health Services                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  LifeChain   │  │ PersonaVault │  │  DataBridge  │  │   HealthIQ   │  │
│  │   (Records)  │  │   (DID/VC)   │  │ (Data Share) │  │  (AI Chat)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                          │
│  Row 2: Payment & Incentive Layer                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   CareXpay   │  │ ClaimSphere  │  │  ImpactGrid  │  │   MedFlow    │  │
│  │  (Payments)  │  │  (Insurance) │  │ (Campaigns)  │  │(Appointments)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                                          │
│  Row 3: Compliance & Verification                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                    │
│  │   GovHealth  │  │   MediTrace  │  │BlockExplorer │                    │
│  │ (Compliance) │  │ (Pharma QR)  │  │  (Verifier)  │                    │
│  └──────────────┘  └──────────────┘  └──────────────┘                    │
│                                                                          │
│                            [HTTP/HTTPS API]                              │
│                                  ↓                                       │
└──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js/Node.js)                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                        API Layer (REST)                             │ │
│  │  /auth  /records  /persona  /databridge  /healthiq  /payments       │ │
│  │  /claims  /impact  /gov  /meditrace  /medflow  /explorer            │ │
│  └────────────────────────────┬────────────────────────────────────────┘ │
│                                ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                     Business Logic Controllers                      │ │
│  │  AuthController │ RecordController │ DatabridgeController │ etc...  │ │
│  └────┬──────────────────┬────────────────────┬─────────────────────┬──┘ │
│       │                  │                    │                     │    │
│       ↓                  ↓                    ↓                     ↓    │
│  ┌─────────┐      ┌──────────┐        ┌──────────┐         ┌──────────┐  │
│  │ MongoDB │      │   IPFS   │        │Cloudinary│         │  Hedera  │  │
│  │ (User   │      │ (Pinata) │        │ (Media)  │         │  Client  │  │
│  │  Data)  │      │(Records) │        │(Uploads) │         │          │  │
│  └─────────┘      └──────────┘        └──────────┘         └────┬─────┘  │
│                                                                   │      │
└───────────────────────────────────────────────────────────────────┼──────┘
                                                                    │
                                                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                       HEDERA HASHGRAPH NETWORK                           │
│                              (Testnet)                                   │
│                                                                          │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  │
│  │  Consensus Service │  │   Token Service    │  │   Mirror Node API  │  │
│  │      (HCS)         │  │      (HTS)         │  │                    │  │
│  │                    │  │                    │  │                    │  │
│  │ ┌────────────────┐ │  │ ┌────────────────┐ │  │ ┌────────────────┐ │  │
│  │ │ Audit Log      │ │  │ │ CARE Token     │ │  │ │ Topic Messages │ │  │
│  │ │ Topic          │ │  │ │ (Fungible)     │ │  │ │ Indexing       │ │  │
│  │ │ 0.0.XXXXXX     │ │  │ │                │ │  │ │                │ │  │
│  │ └────────────────┘ │  │ └────────────────┘ │  │ └────────────────┘ │  │
│  │                    │  │                    │  │                    │  │
│  │ ┌────────────────┐ │  │ ┌────────────────┐ │  │ ┌────────────────┐ │  │
│  │ │ DID Identity   │ │  │ │ Vaccination    │ │  │ │ Transaction    │ │  │
│  │ │ Topics         │ │  │ │ NFTs           │ │  │ │ History Query  │ │  │
│  │ │                │ │  │ │ 0.0.YYYYYY     │ │  │ │                │ │  │
│  │ └────────────────┘ │  │ └────────────────┘ │  │ └────────────────┘ │  │
│  │                    │  │                    │  │                    │  │
│  │ ┌────────────────┐ │  │ ┌────────────────┐ │  │ ┌────────────────┐ │  │
│  │ │ Data Sharing   │ │  │ │ Campaign       │ │  │ │ Account        │ │  │
│  │ │ Consent Logs   │ │  │ │ Reward Tokens  │ │  │ │ Token Balances │ │  │
│  │ │                │ │  │ │ (Custom HTS)   │ │  │ │                │ │  │
│  │ └────────────────┘ │  │ └────────────────┘ │  │ └────────────────┘ │  │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘  │
│                                                                          │
│                         ↓ Data Flow ↓                                    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    MediSphere Indexer Service                      │  │
│  │  (Polls Mirror Node → Stores Metadata in MongoDB → Powers Explorer)│  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                   ↓
                        [Public Verification]
                                   ↓
                    https://hashscan.io/testnet
                  (Users verify records on hedera network)


DATA FLOW LEGEND:
─────────────────
1. User submits action via Frontend (e.g., create health record)
2. Frontend sends HTTP request to Backend API
3. Backend stores data in MongoDB + uploads to IPFS/Cloudinary
4. Backend submits audit log to Hedera (HCS) via TopicMessageSubmitTransaction
5. Hedera network reaches consensus and stores immutable log
6. Backend returns transaction ID to Frontend
7. Indexer polls Mirror Node for new HCS messages
8. Indexer stores searchable metadata in MongoDB
9. Users verify records on HashScan using transaction ID
10. BlockExplorer queries indexed data for public statistics
```

---

## Deployed Hedera IDs

All Hedera resources are deployed on **Hedera Testnet** for development and demonstration.

### Platform Operator Account

- **Account ID**: `0.0.3742504`
- **Type**: Main operator account for all platform transactions
- **Purpose**: Signs all HCS messages, HTS token operations, and DID transactions
- **HashScan**: [View Account](https://hashscan.io/testnet/account/0.0.3742504)

### Hedera Consensus Service (HCS)

# MediSphere HCS Audit Topic ID (created and verified working)

- **Main Audit Topic ID**: `0.0.6898300`
- **Purpose**: Logs all platform-wide audit events (records, claims, data sharing, campaigns)
- **Submit Key**: Controlled by operator account
- **Message Format**: JSON (action, actor, metadata, timestamp)
- **HashScan**: [View Topic](https://hashscan.io/testnet/topic/0.0.6898300)

# Hedera Token Service (HTS)

**. Vaccination NFT Collection**

- **Token ID**: `0.0.7090788`
- **Symbol**: MED-VAX
  **Type**: Non-Fungible Token (NFT)
- **Max Supply**: Unlimited
- **Supply Key**: Controlled by operator (allows minting)
- **Purpose**: Tamper-proof vaccination certificates
- **Metadata**: IPFS CID containing vaccination details
- **HashScan**: [View NFT Collection](https://hashscan.io/testnet/token/0.0.7090788)

**3. Campaign Reward Tokens** (Created dynamically per campaign)

- Example Token ID: `0.0.7093910` (Malaria Awareness Campaign)
- Symbol: MPT
- Type: Fungible Token
- Purpose: Campaign-specific rewards distributed to participants
- **Note**: Each ImpactGrid campaign can create a unique HTS token

---

### Judge Credentials (Hedera Africa Hackathon)

**For hackathon judges to test the platform**, the login credentials for users are provided in [dorahacks documentation](https://dorahacks.io/buidl/32872/) as we used account abstraction for users.

---

## Project Structure

```
medisphere/
├── backend/
│   ├── bin/                      # Server startup scripts
│   ├── controllers/              # API route controllers
│   │   ├── authController.js
│   │   ├── recordController.js
│   │   ├── databridgeController.js
│   │   ├── healthiqController.js
│   │   ├── impactgridController.js
│   │   ├── claimController.js
│   │   ├── paymentController.js
│   │   └── explorerController.js
│   ├── models/                   # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── recordModel.js
│   │   ├── dataRequestModel.js
│   │   ├── campaignModel.js
│   │   ├── insuranceClaimModel.js
│   │   ├── paymentModel.js
│   │   └── indexedRecordModel.js
│   ├── routes/                   # Express routes
│   │   ├── authRoutes.js
│   │   ├── recordRoutes.js
│   │   ├── databridgeRoutes.js
│   │   ├── healthiqRoutes.js
│   │   └── explorerRoutes.js
│   ├── services/                 # Business logic
│   │   ├── mirrorNodeService.js
│   │   ├── indexerEngine.js
│   │   └── statsAggregator.js
│   ├── utils/                    # Utility functions
│   │   ├── hcsLogger.js          # Hedera HCS logging
│   │   ├── ipfsClient.js         # IPFS integration
│   │   ├── nft.js                # NFT operations
│   │   ├── hederaTokenService.js # HTS operations
│   │   ├── cloudinaryConfig.js   # File uploads
│   │   ├── carexpayService.js    # Payment utilities
│   │   └── accessTokenUtil.js    # Token management
│   ├── scripts/                  # Utility scripts
│   │   ├── startIndexer.js
│   │   ├── checkHederaBalance.js
│   │   └── testNFTCreation.js
│   ├── app.js                    # Express app setup
│   ├── package.json
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── app/                      # Next.js app directory
│   │   ├── dashboard/            # User dashboards
│   │   │   ├── patient/
│   │   │   ├── doctor/
│   │   │   ├── hospital/
│   │   │   └── insurer/
│   │   ├── explorer/             # Block explorer
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing page
│   ├── components/
│   │   ├── services/             # Service components
│   │   │   ├── lifechain.tsx
│   │   │   ├── databridge.tsx
│   │   │   ├── healthiq.tsx
│   │   │   ├── carexpay.tsx
│   │   │   ├── claimsphere.tsx
│   │   │   ├── impactgrid.tsx
│   │   │   ├── meditrace.tsx
│   │   │   └── medflow.tsx
│   │   └── ui/                   # Reusable UI components
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   └── utils.ts
│   ├── public/                   # Static assets
│   ├── styles/
│   ├── package.json
│   └── .env.local                # Frontend environment
│
└── README.md                     # This file
```
