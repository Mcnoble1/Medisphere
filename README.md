# 🏥 MediSphere

> **A Blockchain-Powered Healthcare Data Management Platform**

MediSphere is a comprehensive healthcare platform leveraging Hedera Hashgraph technology to provide secure, transparent, and interoperable health data management. Built with privacy-first principles and blockchain verification at its core.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hedera](https://img.shields.io/badge/Powered%20by-Hedera-blue)](https://hedera.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Services](#core-services)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Blockchain Integration](#blockchain-integration)
- [Security & Privacy](#security--privacy)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

MediSphere revolutionizes healthcare data management by combining modern web technologies with enterprise-grade blockchain infrastructure. The platform enables patients, doctors, hospitals, labs, insurance companies, NGOs, government agencies, and pharmaceutical companies to securely exchange health data while maintaining complete transparency and auditability.

### Key Features

✨ **Blockchain-Verified Records** - Every health record is anchored to Hedera Consensus Service (HCS)
🔒 **Privacy-First Design** - IPFS + encryption for sensitive data
💎 **Token-Based Payments** - Hedera Token Service (HTS) integration
🔄 **Interoperable Data Exchange** - Role-based access control across all actors
📊 **AI-Powered Insights** - Health analytics and predictive recommendations
🌐 **Decentralized Storage** - IPFS with Pinata for permanent record storage
⚡ **Real-Time Indexing** - Hedera Mirror Node integration for efficient queries
🎫 **NFT Vaccination Certificates** - Tamper-proof immunization records

---

## 🚀 Core Services

MediSphere consists of 11 integrated services, each solving specific healthcare data management challenges:

### 1. 🔗 LifeChain™ - Health Records Management

**Purpose**: Secure, blockchain-verified electronic health records (EHR) system

**Features**:
- Create and manage health records (lab results, prescriptions, imaging, diagnoses)
- IPFS storage for permanent, decentralized record keeping
- Hedera HCS logging for tamper-proof audit trails
- Cloudinary integration for document uploads
- NFT minting for vaccination certificates
- HashScan integration for public verification

**Tech Stack**: MongoDB, IPFS (Pinata), Hedera HCS, Cloudinary, NFTs

**Key Files**:
- Backend: [recordController.js](backend/controllers/recordController.js), [recordModel.js](backend/models/recordModel.js)
- Frontend: [lifechain.tsx](frontend/components/services/lifechain.tsx)
- Docs: [LIFECHAIN_ENHANCEMENTS.md](LIFECHAIN_ENHANCEMENTS.md), [NFT.md](backend/NFT.md)

---

### 2. 🔐 PersonaVault™ - Decentralized Identity

**Purpose**: Self-sovereign identity management with Hedera DID

**Features**:
- Create and manage Hedera Decentralized Identifiers (DIDs)
- Issue and verify Verifiable Credentials (VCs)
- Tamper-proof identity verification
- Support for medical licenses and certifications
- Privacy-preserving credential sharing

**Tech Stack**: Hedera DID SDK, JSON-LD, Verifiable Credentials

**Key Files**:
- Backend: [personaController.js](backend/controllers/personaController.js)
- Frontend: [persona-vault.tsx](frontend/components/services/persona-vault.tsx)

---

### 3. 💰 CareXpay™ - Token-Based Payments

**Purpose**: Multi-token payment system for healthcare transactions

**Features**:
- Native health tokens (CARE) for platform transactions
- Support for custom HTS tokens
- Send/receive tokens between users
- Campaign reward token distribution
- Insurance claim automatic rewards (10% of approved amount)
- Token association and balance tracking
- Real-time synchronization with Hedera network

**Tech Stack**: Hedera Token Service (HTS), HBAR transfers

**Key Files**:
- Backend: [paymentController.js](backend/controllers/paymentController.js), [carexpayService.js](backend/utils/carexpayService.js)
- Frontend: [carexpay.tsx](frontend/components/services/carexpay.tsx)
- Docs: [CAREXPAY_COMPLETE_GUIDE.md](CAREXPAY_COMPLETE_GUIDE.md)

---

### 4. 🌉 DataBridge™ - Consent-Based Data Exchange

**Purpose**: Secure health data sharing between all ecosystem actors

**Features**:
- Request-based data access with approval workflow
- Proactive data sharing with access tokens
- Support for 8 actor types (Patient, Doctor, Hospital, Lab, Insurance, Government, NGO, Pharma)
- JWT-based access control with expiration
- IP restrictions and access count limits
- Complete audit trail on Hedera HCS
- Role-based UI adaptation

**Tech Stack**: JWT tokens, Hedera HCS, MongoDB

**Key Files**:
- Backend: [databridgeController.js](backend/controllers/databridgeController.js), [dataRequestModel.js](backend/models/dataRequestModel.js)
- Frontend: [databridge.tsx](frontend/components/services/databridge.tsx)
- Docs: [DATABRIDGE_COMPLETE.md](DATABRIDGE_COMPLETE.md)

**API Endpoints**: 12 RESTful endpoints for data request and sharing operations

---

### 5. 🤖 HealthIQ™ - AI Health Assistant

**Purpose**: Intelligent health insights and conversational AI

**Features**:
- AI-powered health assistant with medical knowledge
- Analyze health records for personalized insights
- Upload vital signs and lifestyle data
- Generate health recommendations
- Conversation history management
- Confidence scoring for AI responses
- Privacy-preserving analytics

**Tech Stack**: Custom AI engine (OpenAI/Anthropic integration ready)

**Key Files**:
- Backend: [healthiqController.js](backend/controllers/healthiqController.js), [healthiqModel.js](backend/models/healthiqModel.js)
- Frontend: [healthiq.tsx](frontend/components/services/healthiq.tsx), [healthiq-chat.tsx](frontend/components/services/healthiq-chat.tsx)
- Docs: [HEALTHIQ_SETUP_GUIDE.md](HEALTHIQ_SETUP_GUIDE.md)

**Chat Capabilities**: Blood pressure analysis, diabetes management, sleep tracking, nutrition advice, mental health support

---

### 6. 🏥 ClaimSphere™ - Insurance Claims Management

**Purpose**: Blockchain-verified insurance claim processing

**Features**:
- File insurance claims linked to health records
- Medical record validation via HCS
- Approve/reject workflow for insurers
- Automatic HTS token payouts
- Fraud prevention through blockchain verification
- Complete audit trail for compliance
- Multi-status claim tracking

**Tech Stack**: Hedera HCS, HTS for payouts

**Key Files**:
- Backend: [claimController.js](backend/controllers/claimController.js), [insuranceClaimModel.js](backend/models/insuranceClaimModel.js)
- Frontend: [claimsphere.tsx](frontend/components/services/claimsphere.tsx)
- Docs: [CLAIMSPHERE_QUICK_START.md](CLAIMSPHERE_QUICK_START.md)

**Claim Statuses**: PENDING → APPROVED → PAID / REJECTED

---

### 7. 🌍 ImpactGrid™ - Health Campaigns

**Purpose**: Community health campaigns with token-based incentives

**Features**:
- Create and manage health campaigns (vaccination, awareness, research)
- HTS token creation for campaign rewards
- Participant verification and contribution tracking
- Batch reward distribution to verified participants
- Campaign analytics and impact reporting
- Support for HBAR and custom token rewards
- Geographic impact tracking

**Tech Stack**: Hedera Token Service (HTS), Hedera HCS

**Key Files**:
- Backend: [impactgridController.js](backend/controllers/impactgridController.js), [campaignModel.js](backend/models/campaignModel.js)
- Frontend: [impactgrid.tsx](frontend/components/services/impactgrid.tsx)
- Docs: [IMPACTGRID_IMPLEMENTATION_SUMMARY.md](IMPACTGRID_IMPLEMENTATION_SUMMARY.md)

**Campaign Types**: Vaccination drives, health awareness, disease prevention, research participation

---

### 8. 🏛️ GovHealth™ - Government Compliance & Licensing

**Purpose**: Healthcare licensing, compliance tracking, and regulatory audits

**Features**:
- Issue and manage healthcare licenses (practitioners, facilities, labs, pharmacies)
- License revocation and status management
- Compliance audits with severity tracking
- IPFS storage for license certificates and audit reports
- HCS logging for all regulatory events
- Public health statistics aggregation
- License expiry tracking and alerts
- Compliance scoring dashboard

**Tech Stack**: MongoDB, IPFS, Hedera HCS

**Key Files**:
- Backend: [govHealthController.js](backend/controllers/govHealthController.js), [licenseModel.js](backend/models/licenseModel.js), [auditModel.js](backend/models/auditModel.js)
- Frontend: [govhealth.tsx](frontend/components/services/govhealth.tsx)
- Routes: [govHealthRoutes.js](backend/routes/govHealthRoutes.js)

**License Types**: Practitioner, Facility, Lab, Pharmacy
**Audit Severities**: Low, Medium, High
**HCS Events**: LICENSE_ISSUED, LICENSE_REVOKED, LICENSE_STATUS_UPDATED, AUDIT_COMPLETED

---

### 9. 💊 MediTrace™ - Pharmaceutical Supply Chain

**Purpose**: Drug authenticity verification and supply chain tracking

**Features**:
- Track pharmaceutical products from manufacturer to patient
- QR code generation and scanning
- Batch tracking and expiry management
- Anti-counterfeiting verification
- Blockchain-verified supply chain events
- Recall management

**Tech Stack**: QR codes, Hedera HCS

**Key Files**:
- Backend: [meditraceController.js](backend/controllers/meditraceController.js), [batchModel.js](backend/models/batchModel.js)
- Frontend: [meditrace.tsx](frontend/components/services/meditrace.tsx)

---

### 10. 📅 MedFlow™ - Appointment Management

**Purpose**: Healthcare appointment scheduling and management

**Features**:
- Book appointments with doctors and facilities
- Availability calendar management
- Appointment status tracking
- Automated reminders
- Blockchain-logged appointment records
- Integration with health records

**Tech Stack**: MongoDB, Hedera HCS

**Key Files**:
- Backend: [medflowController.js](backend/controllers/medflowController.js), [appointmentModel.js](backend/models/appointmentModel.js)
- Frontend: [medflow.tsx](frontend/components/services/medflow.tsx)

---

### 11. 🔍 BlockExplorer™ - Public Data Explorer

**Purpose**: Public blockchain data explorer and verification portal

**Features**:
- Search health records by hash, patient ID, or provider ID
- Verify record authenticity on Hedera blockchain
- Platform-wide statistics dashboard
- 30-day activity timeline
- Record type distribution analytics
- Top providers leaderboard
- Privacy-preserving (no PHI indexed)

**Tech Stack**: Hedera Mirror Node API, MongoDB indexer

**Key Files**:
- Backend: [explorerController.js](backend/controllers/explorerController.js), [mirrorNodeService.js](backend/services/mirrorNodeService.js)
- Frontend: [explorer/page.tsx](frontend/app/explorer/page.tsx)
- Docs: [INDEXER_SUMMARY.md](INDEXER_SUMMARY.md)

**Indexer**: Real-time processing of HCS messages for efficient queries

---

## 🛠️ Technology Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 6.0+ with Mongoose ODM
- **Blockchain**: Hedera Hashgraph (SDK v2.72.0)
- **Storage**: IPFS (Pinata), Cloudinary
- **Authentication**: JWT, bcryptjs
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **Security**: Helmet, CORS

### Frontend

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1+
- **UI Components**: Radix UI (shadcn/ui)
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Charts**: Recharts
- **QR Codes**: qrcode, html5-qrcode

### Blockchain & Web3

- **Network**: Hedera Hashgraph (Testnet/Mainnet)
- **Services Used**:
  - Hedera Consensus Service (HCS) - Immutable audit logs
  - Hedera Token Service (HTS) - Fungible tokens & NFTs
  - Hedera DID SDK - Decentralized identifiers
  - Hedera Mirror Node - Event indexing and queries
- **Storage**: IPFS via Pinata Web3 SDK
- **Verification**: HashScan blockchain explorer integration

### DevOps & Tools

- **Package Manager**: npm
- **Development**: nodemon
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint
- **Cloud Storage**: Cloudinary
- **Email**: Nodemailer, Resend
- **SMS**: Twilio

---

## 🚦 Quick Start

### Prerequisites

- Node.js 18.x or higher
- MongoDB 6.0 or higher
- Hedera testnet account ([Get one free](https://portal.hedera.com))
- Pinata account for IPFS ([Sign up](https://pinata.cloud))
- Cloudinary account ([Sign up](https://cloudinary.com))

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/medisphere.git
cd medisphere
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables** (backend/.env):

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/medisphere

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Hedera Configuration
HEDERA_NETWORK=testnet
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=your-hedera-private-key
MEDISPHERE_HCS_AUDIT_TOPIC_ID=0.0.YOUR_TOPIC_ID

# IPFS (Pinata)
PINATA_JWT=your-pinata-jwt-token
PINATA_GATEWAY=your-gateway.mypinata.cloud

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# NFT Collections
VACCINATION_NFT_COLLECTION_ID=0.0.YOUR_NFT_TOKEN_ID

# Port
PORT=4000
```

#### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Indexer (Optional but recommended):**
```bash
cd backend
npm run indexer
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

#### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Docs**: http://localhost:4000/api/docs
- **Explorer**: http://localhost:3000/explorer

---

## 📁 Project Structure

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
├── docs/                         # Documentation
│   ├── DATABRIDGE_COMPLETE.md
│   ├── CAREXPAY_COMPLETE_GUIDE.md
│   ├── HEALTHIQ_SETUP_GUIDE.md
│   ├── IMPACTGRID_IMPLEMENTATION_SUMMARY.md
│   ├── CLAIMSPHERE_QUICK_START.md
│   ├── LIFECHAIN_ENHANCEMENTS.md
│   ├── INDEXER_SUMMARY.md
│   └── NFT.md
│
└── README.md                     # This file
```

---

## 📡 API Documentation

MediSphere provides comprehensive RESTful APIs for all services. Full interactive documentation is available via Swagger UI.

### Access API Documentation

Once the backend is running:

```
http://localhost:4000/api/docs
```

### Core API Endpoints

#### Authentication
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # User login
GET    /api/auth/profile         # Get user profile
PUT    /api/auth/profile         # Update profile
```

#### LifeChain (Health Records)
```
POST   /api/records              # Create health record
GET    /api/records              # Get user's records
GET    /api/records/:id          # Get specific record
POST   /api/records/upload       # Upload documents
DELETE /api/records/:id          # Delete record
```

#### DataBridge (Data Exchange)
```
POST   /api/databridge/requests              # Create data request
GET    /api/databridge/requests/incoming     # Incoming requests
GET    /api/databridge/requests/outgoing     # Outgoing requests
POST   /api/databridge/requests/:id/approve  # Approve request
POST   /api/databridge/requests/:id/reject   # Reject request
POST   /api/databridge/shares                # Create data share
GET    /api/databridge/logs                  # Audit logs
```

#### CareXpay (Payments)
```
GET    /api/payments/account             # Get payment account
POST   /api/payments/tokens/send         # Send tokens
GET    /api/payments/tokens/balances     # Get token balances
POST   /api/payments/tokens/associate    # Associate HTS token
GET    /api/payments/transactions        # Transaction history
```

#### HealthIQ (AI Assistant)
```
POST   /api/healthiq/chat                # Send message to AI
GET    /api/healthiq/conversations       # Get conversations
POST   /api/healthiq/health-data         # Upload health data
POST   /api/healthiq/generate-insights   # Generate insights
GET    /api/healthiq/insights            # Get insights
```

#### ClaimSphere (Insurance)
```
POST   /api/claims                       # File insurance claim
GET    /api/claims                       # Get claims
GET    /api/claims/:id                   # Get claim details
POST   /api/claims/:id/approve           # Approve claim
POST   /api/claims/:id/reject            # Reject claim
GET    /api/claims/:id/validate          # Validate medical record
```

#### ImpactGrid (Campaigns)
```
POST   /api/impact/campaigns             # Create campaign
GET    /api/impact/campaigns             # Get campaigns
GET    /api/impact/campaigns/available   # Available campaigns
POST   /api/impact/campaigns/:id/join    # Join campaign
POST   /api/impact/campaigns/:id/create-token  # Create HTS token
POST   /api/impact/campaigns/:id/distribute-rewards  # Distribute rewards
GET    /api/impact/analytics             # Campaign analytics
```

#### GovHealth (Licensing & Compliance)
```
POST   /api/gov/licenses                 # Issue license
GET    /api/gov/licenses                 # List licenses
GET    /api/gov/licenses/:id             # Get license details
PUT    /api/gov/licenses/:id/status      # Update license status
POST   /api/gov/licenses/:id/revoke      # Revoke license
POST   /api/gov/audits                   # Create audit
GET    /api/gov/audits                   # List audits
GET    /api/gov/audits/:id               # Get audit details
GET    /api/gov/stats                    # Compliance statistics
GET    /api/gov/public-health            # Public health data
```

#### BlockExplorer (Data Explorer)
```
GET    /api/explorer/stats               # Platform statistics
GET    /api/explorer/verify/:hash        # Verify record hash
GET    /api/explorer/records/patient/:id # Patient records
GET    /api/explorer/records/provider/:id # Provider records
GET    /api/explorer/search              # Advanced search
```

### Authentication

Most API endpoints require JWT authentication. Include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:4000/api/records
```

---

## ⛓️ Blockchain Integration

MediSphere leverages multiple Hedera Hashgraph services for enterprise-grade blockchain functionality.

### Hedera Consensus Service (HCS)

**Purpose**: Immutable audit trail for all platform operations

**What's Logged**:
- Health record creation/updates
- Data sharing requests and approvals
- Insurance claim submissions and approvals
- Campaign participation and reward distribution
- Token transfers
- Identity verifications

**HCS Message Format**:
```json
{
  "action": "HEALTH_RECORD_CREATED",
  "actor": "record_mongodb_id",
  "metadata": {
    "patientId": "patient_hedera_id",
    "type": "lab-result",
    "ipfsCid": "QmXxx...",
    "timestamp": "2025-01-20T10:30:00.000Z"
  }
}
```

**Transaction ID Format**: `0.0.123456@1234567890.123456789`

**Verification**: All transactions verifiable on [HashScan](https://hashscan.io/testnet)

### Hedera Token Service (HTS)

**Purpose**: Fungible and non-fungible token operations

**Use Cases**:
1. **CARE Tokens** - Platform native currency
2. **Campaign Rewards** - Custom HTS tokens for health campaigns
3. **Insurance Payouts** - Automated claim rewards
4. **NFT Certificates** - Vaccination and achievement badges

**Token Operations**:
- Create custom fungible tokens
- Mint/burn tokens
- Transfer between accounts
- Associate tokens with accounts
- Token metadata management

### Hedera DID (Decentralized Identifiers)

**Purpose**: Self-sovereign identity management

**Features**:
- Create and resolve DIDs
- Issue verifiable credentials
- Cryptographic verification
- Privacy-preserving identity claims

**DID Format**: `did:hedera:testnet:ACCOUNT_ID`

### Hedera Mirror Node

**Purpose**: Historical transaction queries and event indexing

**Integration**:
- Real-time HCS message polling
- Transaction history queries
- Account balance tracking
- Token transfer monitoring

**Indexer**: Custom indexer service processes Mirror Node data for efficient local queries

---

## 🔒 Security & Privacy

### Security Features

✅ **Encryption**
- All sensitive data encrypted at rest and in transit
- TLS/HTTPS for API communication
- Bcrypt for password hashing
- Private keys encrypted in database

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (RBAC)
- Session management
- Token expiration and refresh

✅ **Data Protection**
- IPFS for decentralized storage
- Cloudinary secure URLs
- Input validation and sanitization
- SQL injection prevention
- XSS protection (Helmet middleware)

✅ **Blockchain Security**
- Immutable audit trails via HCS
- Tamper-proof record verification
- Cryptographic signatures
- Consensus-based validation

### Privacy Compliance

🔐 **HIPAA-Ready Architecture**
- Minimal data indexing (no PHI in public index)
- Consent-based data sharing
- Audit logs for all access
- Data retention policies
- Patient data ownership

🔐 **Privacy-Preserving Design**
- Pseudonymous Hedera IDs (no personal identifiers on-chain)
- Encrypted IPFS payloads
- Role-based data access
- Selective disclosure of credentials
- Right to erasure (off-chain data deletion)

### Best Practices

1. **Never commit `.env` files** - Keep credentials secure
2. **Use testnet for development** - Avoid mainnet costs
3. **Rotate JWT secrets regularly** - Enhance security
4. **Monitor HCS logs** - Detect anomalies
5. **Implement rate limiting** - Prevent abuse
6. **Regular security audits** - Stay updated

---

## 🧪 Testing

### Manual Testing

#### Backend API Testing (Postman/cURL)

```bash
# Register a user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "role": "PATIENT"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'

# Create a health record (replace TOKEN)
curl -X POST http://localhost:4000/api/records \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "lab-result",
    "title": "Blood Test Results",
    "doctor": "Dr. Smith",
    "facility": "General Hospital",
    "date": "2025-01-20"
  }'
```

#### Frontend Testing

1. Register as different user roles (Patient, Doctor, Hospital, etc.)
2. Test each service:
   - **LifeChain**: Create records, upload documents
   - **DataBridge**: Request data, approve/reject
   - **CareXpay**: Send/receive tokens
   - **HealthIQ**: Chat with AI, upload health data
   - **ClaimSphere**: File claims, approve as insurer
   - **ImpactGrid**: Create campaigns, distribute rewards
3. Verify blockchain transactions on HashScan

### Automated Testing

```bash
cd backend
npm test
```

### Testing Scripts

```bash
# Check Hedera account balance
npm run check-balance

# Test NFT creation
npm run test-nft

# Update statistics manually
npm run stats
```

---

## 📚 Additional Documentation

Detailed documentation for each service:

- **DataBridge**: [DATABRIDGE_COMPLETE.md](DATABRIDGE_COMPLETE.md) - 600+ lines, complete guide
- **CareXpay**: [CAREXPAY_COMPLETE_GUIDE.md](CAREXPAY_COMPLETE_GUIDE.md) - Token payment system
- **HealthIQ**: [HEALTHIQ_SETUP_GUIDE.md](HEALTHIQ_SETUP_GUIDE.md) - AI assistant setup
- **ImpactGrid**: [IMPACTGRID_IMPLEMENTATION_SUMMARY.md](IMPACTGRID_IMPLEMENTATION_SUMMARY.md) - Campaign system
- **ClaimSphere**: [CLAIMSPHERE_QUICK_START.md](CLAIMSPHERE_QUICK_START.md) - Claims processing
- **LifeChain**: [LIFECHAIN_ENHANCEMENTS.md](LIFECHAIN_ENHANCEMENTS.md) - Health records
- **NFTs**: [backend/NFT.md](backend/NFT.md) - NFT operations guide
- **Indexer**: [INDEXER_SUMMARY.md](INDEXER_SUMMARY.md) - Blockchain indexer

---

## 🚀 Deployment

### Production Deployment Checklist

- [ ] Set up production MongoDB cluster (MongoDB Atlas recommended)
- [ ] Configure Hedera mainnet credentials
- [ ] Set up production Pinata gateway
- [ ] Configure Cloudinary production environment
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up environment variables in production
- [ ] Configure CORS for production domains
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Enable rate limiting
- [ ] Configure backup and disaster recovery
- [ ] Set up CI/CD pipeline
- [ ] Perform security audit
- [ ] Load testing
- [ ] Documentation review

### Deployment Options

#### Option 1: Traditional Hosting (VPS/Cloud)

**Backend:**
```bash
# Install dependencies
npm install --production

# Use PM2 for process management
npm install -g pm2
pm2 start bin/www --name medisphere-api
pm2 start scripts/startIndexer.js --name medisphere-indexer
pm2 save
pm2 startup
```

**Frontend:**
```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2
pm2 start npm --name medisphere-frontend -- start
```

#### Option 2: Docker

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["node", "bin/www"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000/api

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

#### Option 3: Vercel (Frontend) + Heroku/Railway (Backend)

**Frontend** (Deploy to Vercel):
```bash
npm install -g vercel
vercel --prod
```

**Backend** (Deploy to Railway):
```bash
# Add railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

---

## 🤝 Contributing

We welcome contributions to MediSphere! Here's how you can help:

### Ways to Contribute

1. **Report Bugs** - Open an issue with detailed reproduction steps
2. **Feature Requests** - Suggest new features or improvements
3. **Code Contributions** - Submit pull requests
4. **Documentation** - Improve or translate documentation
5. **Testing** - Test new features and report issues

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/medisphere.git
   cd medisphere
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm test
   ```

5. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new feature"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- **Backend**: JavaScript ES6+, use async/await, error handling
- **Frontend**: TypeScript, functional components, hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Comments**: JSDoc for functions, inline for complex logic

---

## 🌐 Community & Support

### Resources

- **Documentation**: See docs/ folder
- **API Docs**: http://localhost:4000/api/docs
- **Hedera Docs**: https://docs.hedera.com
- **HashScan Explorer**: https://hashscan.io/testnet

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Discussions**: Ask questions and share ideas

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 MediSphere Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Hedera Hashgraph** - Enterprise-grade blockchain infrastructure
- **IPFS/Pinata** - Decentralized storage solution
- **MongoDB** - Flexible document database
- **Next.js & React** - Modern web framework
- **Radix UI** - Accessible component library
- **Cloudinary** - Media management platform

---

## 🎯 Roadmap

### Phase 1 (Current) - Core Platform ✅
- [x] LifeChain health records
- [x] DataBridge data exchange
- [x] CareXpay payment system
- [x] HealthIQ AI assistant
- [x] ClaimSphere insurance claims
- [x] ImpactGrid campaigns
- [x] GovHealth licensing & compliance
- [x] BlockExplorer indexer

### Phase 2 (Q2 2025) - Advanced Features
- [ ] Mobile applications (iOS/Android)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboards
- [ ] Multi-language support
- [ ] Telemedicine integration
- [ ] Wearable device integration
- [ ] FHIR standard compliance

### Phase 3 (Q3 2025) - Ecosystem Expansion
- [ ] Pharmacy management system
- [ ] Laboratory management system
- [ ] Hospital management system
- [ ] Research data marketplace
- [ ] DAO governance for platform decisions
- [ ] Cross-chain bridges
- [ ] AI-powered clinical decision support

### Phase 4 (Q4 2025) - Scale & Compliance
- [ ] HIPAA compliance certification
- [ ] GDPR full compliance
- [ ] Multi-region deployment
- [ ] Enterprise licensing
- [ ] White-label solutions
- [ ] API monetization

---

## 📊 Platform Statistics

### Codebase Overview

- **Backend**: ~15,000 lines of JavaScript
- **Frontend**: ~10,000 lines of TypeScript/React
- **Documentation**: ~5,000 lines
- **Total Controllers**: 18
- **Total Models**: 20
- **Total API Endpoints**: 110+
- **Services**: 11 core services
- **Blockchain Integrations**: 4 Hedera services

### Technology Breakdown

- **Languages**: JavaScript (60%), TypeScript (35%), JSON (5%)
- **Frameworks**: Express.js, Next.js
- **Database**: MongoDB with 20+ collections
- **Blockchain**: 100% Hedera Hashgraph
- **Storage**: IPFS + Cloudinary
- **Authentication**: JWT-based

---

## 🔗 Quick Links

- [API Documentation](http://localhost:4000/api/docs)
- [Block Explorer](http://localhost:3000/explorer)
- [Hedera Portal](https://portal.hedera.com)
- [HashScan Testnet](https://hashscan.io/testnet)
- [Pinata IPFS](https://pinata.cloud)
- [Cloudinary](https://cloudinary.com)

---

## ⚡ Quick Commands

```bash
# Backend
cd backend
npm install              # Install dependencies
npm start                # Start API server
npm run indexer          # Start blockchain indexer
npm run check-balance    # Check Hedera balance
npm run test-nft         # Test NFT creation
npm run stats            # Update statistics

# Frontend
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
mongosh medisphere       # Connect to MongoDB
```

---

<div align="center">

## 🌟 Built with ❤️ for Healthcare Innovation

**Powered by Hedera Hashgraph | Secured by Blockchain | Designed for Privacy**

[⬆ Back to Top](#-medisphere)

</div>
