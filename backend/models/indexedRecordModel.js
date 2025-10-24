import mongoose from 'mongoose';

/**
 * IndexedRecord - Searchable metadata index for health records
 * Stores decrypted metadata from Hedera/IPFS while keeping sensitive data encrypted
 */
const indexedRecordSchema = new mongoose.Schema(
  {
    // On-chain references
    hcsMessageId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    hcsTopicId: {
      type: String,
      required: true,
      index: true
    },
    hcsTimestamp: {
      type: Date,
      required: true,
      index: true
    },
    hcsSequenceNumber: {
      type: Number,
      index: true
    },

    // IPFS references
    ipfsCid: {
      type: String,
      index: true
    },
    ipfsUrl: String,

    // Record metadata (decrypted)
    recordType: {
      type: String,
      enum: ['lab-result', 'prescription', 'diagnosis', 'vaccination', 'surgery', 'other'],
      required: true,
      index: true
    },

    // Patient information (Hedera account ID)
    patientAccountId: {
      type: String,
      required: false,
      index: true
    },
    patientDid: String,
    patientMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    // Provider information
    providerAccountId: {
      type: String,
      index: true
    },
    providerDid: String,
    providerName: String,
    providerType: {
      type: String,
      enum: ['doctor', 'lab', 'hospital', 'pharmacy', 'clinic', 'other'],
      index: true
    },

    // Record details
    title: String,
    recordDate: {
      type: Date,
      index: true
    },
    facility: String,

    // Searchable metadata by type
    metadata: {
      // Lab results
      testType: String,
      labName: String,

      // Prescriptions
      medicationNames: [String],
      prescribingDoctor: String,

      // Vaccinations
      vaccineName: String,
      batchNumber: String,
      manufacturer: String,

      // Surgery
      procedureName: String,
      surgeonName: String,

      // General
      tags: [String],
      category: String
    },

    // Verification & provenance
    recordHash: {
      type: String,
      index: true
    },
    verified: {
      type: Boolean,
      default: false,
      index: true
    },
    verificationMethod: String,

    // Access control
    sharedWith: [{
      accountId: String,
      did: String,
      name: String,
      sharedAt: Date,
      expiresAt: Date
    }],
    accessLog: [{
      accessor: String,
      accessedAt: Date,
      action: String
    }],

    // NFT/Token references (if applicable)
    nftTokenId: String,
    nftSerial: Number,
    tokenId: String,

    // Status
    status: {
      type: String,
      enum: ['active', 'revoked', 'amended', 'archived'],
      default: 'active',
      index: true
    },

    // Original MongoDB record reference
    originalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthRecord'
    },

    // Indexer metadata
    indexedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastUpdated: Date,
    indexerVersion: {
      type: String,
      default: '1.0.0'
    }
  },
  {
    timestamps: true,
    collection: 'indexed_records'
  }
);

// Compound indexes for common queries
indexedRecordSchema.index({ patientAccountId: 1, recordDate: -1 });
indexedRecordSchema.index({ patientAccountId: 1, recordType: 1 });
indexedRecordSchema.index({ providerAccountId: 1, recordType: 1 });
indexedRecordSchema.index({ recordType: 1, recordDate: -1 });
indexedRecordSchema.index({ hcsTopicId: 1, hcsTimestamp: -1 });

// Text search index
indexedRecordSchema.index({
  title: 'text',
  facility: 'text',
  'metadata.testType': 'text',
  'metadata.medicationNames': 'text',
  'metadata.vaccineName': 'text'
});

const IndexedRecord = mongoose.model('IndexedRecord', indexedRecordSchema);
export default IndexedRecord;
