import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medisphere API',
      version: '1.0.0',
      description: 'A comprehensive healthcare API built on hedera network, supporting medical records management, pharmaceutical supply chain tracking, insurance claims processing, and decentralized identity management.',
      contact: {
        name: 'Medisphere API Support',
        email: 'support@medisphere.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.medisphere.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using Bearer scheme'
        }
      },
      schemas: {
        // User and Authentication Schemas
        User: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'country', 'role'],
          properties: {
            _id: { type: 'string', description: 'User ID' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            country: { type: 'string', example: 'Nigeria' },
            role: {
              type: 'string',
              enum: ['PATIENT', 'DOCTOR', 'NGO', 'GOVERNMENT', 'PHARMA'],
              example: 'PATIENT'
            },
            roleData: { type: 'object', description: 'Role-specific data' },
            hederaAccountId: { type: 'string', description: 'Hedera account ID' },
            lastLoginAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UserRegistration: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'country', 'role'],
          properties: {
            firstName: { type: 'string', minLength: 1, example: 'John' },
            lastName: { type: 'string', minLength: 1, example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', minLength: 8, example: 'SecurePassword123!' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            country: { type: 'string', example: 'Nigeria' },
            role: {
              type: 'string',
              enum: ['PATIENT', 'DOCTOR', 'NGO', 'GOVERNMENT', 'PHARMA'],
              example: 'PATIENT'
            },
            roleData: {
              type: 'object',
              description: 'Role-specific additional data',
              oneOf: [
                {
                  title: 'Patient Data',
                  properties: {
                    age: { type: 'number', example: 30 },
                    gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                    insuranceNumber: { type: 'string', example: 'INS123456789' }
                  }
                },
                {
                  title: 'Doctor Data',
                  properties: {
                    medicalPractice: { type: 'string', example: 'General Medicine' },
                    medicalLicenseNumber: { type: 'string', example: 'MD123456' },
                    specialty: { type: 'string', example: 'Cardiology' }
                  }
                }
              ]
            }
          }
        },
        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'SecurePassword123!' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT access token' },
            user: { $ref: '#/components/schemas/User' }
          }
        },

        // Medical Records
        MedicalRecord: {
          type: 'object',
          required: ['patient', 'clinic', 'title', 'encryptedData'],
          properties: {
            _id: { type: 'string', description: 'Record ID' },
            patient: { type: 'string', description: 'Patient user ID' },
            clinic: { type: 'string', description: 'Clinic user ID' },
            title: { type: 'string', example: 'Annual Physical Examination' },
            encryptedData: { type: 'string', description: 'Encrypted medical data' },
            hcsMessageId: { type: 'string', description: 'Hedera Consensus Service message ID' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MedicalRecordCreate: {
          type: 'object',
          required: ['patientId', 'title', 'data'],
          properties: {
            patientId: { type: 'string', description: 'Patient user ID' },
            title: { type: 'string', example: 'Annual Physical Examination' },
            data: { type: 'object', description: 'Medical record data to be encrypted' }
          }
        },

        // Appointments
        Appointment: {
          type: 'object',
          required: ['patient', 'clinic', 'scheduledAt'],
          properties: {
            _id: { type: 'string', description: 'Appointment ID' },
            patient: { type: 'string', description: 'Patient user ID' },
            clinic: { type: 'string', description: 'Clinic user ID' },
            scheduledAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00Z' },
            reason: { type: 'string', example: 'Routine checkup' },
            status: {
              type: 'string',
              enum: ['requested', 'accepted', 'declined', 'completed', 'cancelled'],
              default: 'requested'
            },
            hcsMessageId: { type: 'string', description: 'Hedera Consensus Service anchor' },
            metadata: { type: 'object', description: 'Additional appointment data' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // Prescriptions
        Prescription: {
          type: 'object',
          required: ['appointment', 'patient', 'clinic', 'title', 'encryptedPayload'],
          properties: {
            _id: { type: 'string', description: 'Prescription ID' },
            appointment: { type: 'string', description: 'Appointment ID' },
            patient: { type: 'string', description: 'Patient user ID' },
            clinic: { type: 'string', description: 'Clinic user ID' },
            title: { type: 'string', example: 'Antibiotic Treatment' },
            encryptedPayload: { type: 'string', description: 'Encrypted prescription data' },
            signature: { type: 'string', description: 'Doctor digital signature' },
            hcsMessageId: { type: 'string', description: 'Hedera Consensus Service anchor' },
            issuedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // Lab Results
        LabResult: {
          type: 'object',
          required: ['patient', 'lab', 'testType', 'encryptedCid'],
          properties: {
            _id: { type: 'string', description: 'Lab result ID' },
            patient: { type: 'string', description: 'Patient user ID' },
            lab: { type: 'string', description: 'Lab user ID' },
            testType: { type: 'string', example: 'PCR' },
            encryptedCid: { type: 'string', description: 'IPFS CID or encrypted storage key' },
            encryptedBlobHash: { type: 'string', description: 'SHA256 hash for verification' },
            hcsMessageId: { type: 'string', description: 'HCS transaction ID' },
            vc: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Verifiable Credential ID' },
                type: { type: 'array', items: { type: 'string' } },
                issuedAt: { type: 'string', format: 'date-time' }
              }
            },
            metadata: {
              type: 'object',
              properties: {
                dateCollected: { type: 'string', format: 'date-time' },
                dateReported: { type: 'string', format: 'date-time' },
                notes: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // Claims
        Claim: {
          type: 'object',
          required: ['claimant', 'insurer', 'record', 'amountRequested'],
          properties: {
            _id: { type: 'string', description: 'Claim ID' },
            claimant: { type: 'string', description: 'Patient user ID' },
            insurer: { type: 'string', description: 'Insurer user ID' },
            record: { type: 'string', description: 'Medical record ID' },
            amountRequested: { type: 'number', example: 50000, description: 'Amount in minor currency units' },
            currency: { type: 'string', default: 'NGN', example: 'NGN' },
            description: { type: 'string', example: 'Emergency surgery claim' },
            attachments: { type: 'array', items: { type: 'string' }, description: 'URLs or IPFS CIDs' },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
              default: 'PENDING'
            },
            amountApproved: { type: 'number', default: 0 },
            decisionReason: { type: 'string' },
            hcsEvents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  eventType: { type: 'string' },
                  hcsMessageId: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // Pharmaceutical Batches
        Batch: {
          type: 'object',
          required: ['productName', 'batchNumber'],
          properties: {
            _id: { type: 'string', description: 'Batch ID' },
            productName: { type: 'string', example: 'Paracetamol 500mg' },
            batchNumber: { type: 'string', example: 'PAR2024001' },
            quantity: { type: 'number', default: 0, example: 1000 },
            manufacturingDate: { type: 'string', format: 'date' },
            expiryDate: { type: 'string', format: 'date' },
            manufacturingFacility: { type: 'string', example: 'PharmaCorp Lagos' },
            ipfsCid: { type: 'string', description: 'IPFS metadata CID' },
            tokenId: { type: 'string', description: 'HTS token ID' },
            currentHolder: { type: 'string', description: 'Current holder DID or address' },
            hcsMessageId: { type: 'string', description: 'Creation HCS message ID' },
            history: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  actorDid: { type: 'string' },
                  action: { type: 'string', enum: ['MANUFACTURED', 'TRANSFERRED', 'RECEIVED', 'REDEEMED'] },
                  location: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  notes: { type: 'string' },
                  hcsMessageId: { type: 'string' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // Data Requests
        DataRequest: {
          type: 'object',
          required: ['requester', 'owner', 'dataType', 'purpose'],
          properties: {
            _id: { type: 'string', description: 'Data request ID' },
            requester: { type: 'string', description: 'Requester user ID' },
            owner: { type: 'string', description: 'Data owner user ID' },
            dataType: { type: 'string', example: 'lab_result' },
            description: { type: 'string', example: 'Blood test results for insurance claim' },
            purpose: { type: 'string', example: 'Insurance claim verification' },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'revoked', 'expired'],
              default: 'pending'
            },
            validUntil: { type: 'string', format: 'date-time' },
            hcsCreateTx: { type: 'string', description: 'HCS creation transaction ID' },
            hcsApproveTx: { type: 'string', description: 'HCS approval transaction ID' },
            accessTokenId: { type: 'string', description: 'HTS access token ID' },
            accessTokenSerial: { type: 'number', description: 'NFT serial number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // Licenses
        License: {
          type: 'object',
          required: ['licenseNumber', 'issuedTo', 'issuedToType', 'issuedBy', 'validFrom', 'validUntil'],
          properties: {
            _id: { type: 'string', description: 'License ID' },
            licenseNumber: { type: 'string', example: 'MED2024001' },
            issuedTo: { type: 'string', description: 'Licensee DID or user ID' },
            issuedToType: {
              type: 'string',
              enum: ['practitioner', 'facility', 'lab', 'pharmacy'],
              example: 'practitioner'
            },
            issuedBy: { type: 'string', description: 'Government issuer DID/ID' },
            issueDate: { type: 'string', format: 'date' },
            validFrom: { type: 'string', format: 'date' },
            validUntil: { type: 'string', format: 'date' },
            status: {
              type: 'string',
              enum: ['active', 'revoked', 'expired'],
              default: 'active'
            },
            complianceRequirements: { type: 'array', items: { type: 'string' } },
            ipfsCid: { type: 'string', description: 'Certificate IPFS CID' },
            hcsMessageId: { type: 'string', description: 'HCS transaction anchor' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // DID and VC Schemas
        DIDDocument: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'did:hedera:testnet:z6MkgC4...' },
            verificationMethod: { type: 'array', items: { type: 'object' } },
            service: { type: 'array', items: { type: 'object' } },
            authentication: { type: 'array', items: { type: 'string' } }
          }
        },
        VerifiableCredential: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique VC identifier' },
            type: { type: 'array', items: { type: 'string' } },
            issuer: { type: 'string', description: 'Issuer DID' },
            subject: { type: 'string', description: 'Subject DID' },
            issuedAt: { type: 'string', format: 'date-time' },
            claim: { type: 'object', description: 'VC claims data' }
          }
        },

        // Timeline Events
        TimelineEvent: {
          type: 'object',
          required: ['patient', 'eventType', 'actor'],
          properties: {
            _id: { type: 'string', description: 'Timeline event ID' },
            patient: { type: 'string', description: 'Patient user ID' },
            eventType: { type: 'string', example: 'lab_result' },
            actor: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' }
              }
            },
            title: { type: 'string', example: 'Lab Results Received' },
            description: { type: 'string' },
            meta: { type: 'object', description: 'Event metadata' },
            seenByPatient: { type: 'boolean', default: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },

        // Common Response Schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'number' },
            message: { type: 'string' },
            details: { type: 'object' }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' }
          }
        }
      }
    },
    tags: [
      {
        name: 'General',
        description: 'General API information and health check endpoints'
      },
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      },
      {
        name: 'Identity (DID)',
        description: 'Decentralized Identity management'
      },
      {
        name: 'Digital Identity',
        description: 'Verifiable Credentials issuance, verification, and revocation'
      },
      {
        name: 'Medical Records',
        description: 'Medical record management with encryption and sharing'
      },
      {
        name: 'Lab Results',
        description: 'Laboratory results management'
      },
      {
        name: 'Timeline',
        description: 'Patient medical timeline and history'
      },
      {
        name: 'Insurance Claims',
        description: 'Insurance claim processing and management'
      },
      {
        name: 'MediTrace',
        description: 'Pharmaceutical batch tracking with NFT verification'
      },
      {
        name: 'LifeChain',
        description: 'Decentralized medical record storage and sharing'
      },
      {
        name: 'MedFlow',
        description: 'Medical workflow management for appointments and prescriptions'
      },
      {
        name: 'Data Requests',
        description: 'Medical data access request management'
      },
      {
        name: 'DataBridge',
        description: 'Secure data sharing and access control platform'
      },
      {
        name: 'Government Health',
        description: 'Government health administration and licensing'
      },
      {
        name: 'Digital Persona',
        description: 'Digital identity and persona management'
      },
      {
        name: 'ImpactGrid',
        description: 'Healthcare impact campaigns and reward distribution'
      },
      {
        name: 'HealthIQ',
        description: 'AI-powered health assistant and insights'
      },
      {
        name: 'Explorer',
        description: 'Blockchain explorer for medical records and transactions'
      },
      {
        name: 'Payments',
        description: 'Payment processing and HTS token operations'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs };
export default swaggerUi;