import mongoose from 'mongoose';

const claimItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  procedure: { type: String },
  amount: { type: Number, required: true },
  covered: { type: Boolean, default: false },
  coveredAmount: { type: Number, default: 0 },
  reason: { type: String }
}, { _id: false });

const insuranceClaimSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  claimNumber: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  treatmentDate: {
    type: Date,
    required: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected', 'paid'],
    default: 'pending',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  approvedAmount: {
    type: Number,
    default: 0,
  },
  items: [claimItemSchema],
  diagnosis: {
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
  reviewNotes: {
    type: String,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  hcsMessageId: {
    type: String, // Hedera audit trail
  },
  blockchainHash: {
    type: String,
  },
  // Related health records
  relatedRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord',
  }],
  // Insurance details
  insuranceProvider: {
    type: String,
    required: true,
  },
  policyNumber: {
    type: String,
    required: true,
  },
  groupNumber: {
    type: String,
  },
}, { timestamps: true });

// Indexes
insuranceClaimSchema.index({ patient: 1, status: 1 });
// insuranceClaimSchema.index({ claimNumber: 1 });
insuranceClaimSchema.index({ submissionDate: -1 });

const InsuranceClaim = mongoose.model('InsuranceClaim', insuranceClaimSchema);
export default InsuranceClaim;