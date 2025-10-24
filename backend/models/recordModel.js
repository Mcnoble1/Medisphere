import mongoose from 'mongoose';

const healthRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['lab-result', 'prescription', 'diagnosis', 'vaccination', 'surgery', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    doctor: {
      type: String,
      required: true,
    },
    facility: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    consentRecipients: [String], // List of authorized recipients
    isShared: {
      type: Boolean,
      default: false,
    },
    hcsHash: {
      type: String, // Hedera HCS transaction ID
      index: true
    },
    hcsTopicId: {
      type: String, // The HCS topic ID where this was logged
    },
    ipfsCid: {
      type: String, // IPFS Content Identifier for decentralized storage
      index: true
    },
    ipfsUrl: {
      type: String, // Gateway URL to access IPFS content
    },
    // Legacy field - kept for backward compatibility
    blockchainHash: {
      type: String,
    },
    // Specific data for different record types
    labData: {
      testType: String,
      results: mongoose.Schema.Types.Mixed,
      referenceRanges: mongoose.Schema.Types.Mixed,
      abnormalFlags: [String]
    },
    prescriptionData: {
      medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String
      }],
      pharmacyInstructions: String
    },
    vaccinationData: {
      vaccine: String,
      batchNumber: String,
      manufacturer: String,
      site: String,
      reactions: [String]
    },
    surgeryData: {
      procedure: String,
      surgeon: String,
      anesthesia: String,
      complications: [String]
    },
    // NFT fields (for vaccination records)
    nftData: {
      tokenId: String,  // Hedera Token ID
      serial: Number,   // NFT serial number
      nftId: String,    // Combined tokenId/serial
      transactionId: String  // Mint transaction ID
    },
    // Verifiable Credential fields (for other record types)
    vcData: {
      credentialId: String,  // VC ID
      vcJson: mongoose.Schema.Types.Mixed,  // The full VC object
      signature: String,  // VC signature
      issuerDid: String,  // Issuer DID
      subjectDid: String  // Subject DID
    },
    // Audit fields
    canEdit: {
      type: Boolean,
      default: false,
    },
    addedByRole: {
      type: String,
      enum: ['doctor', 'nurse', 'technician', 'patient', 'other'],
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'disputed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Indexes for performance
healthRecordSchema.index({ patient: 1, createdAt: -1 });
healthRecordSchema.index({ type: 1 });
healthRecordSchema.index({ blockchainHash: 1 });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
export default HealthRecord;