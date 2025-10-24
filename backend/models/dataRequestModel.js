import mongoose from 'mongoose';

const dataRequestSchema = new mongoose.Schema({
  // Core identifiers
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: { type: String, required: true },
  requesterType: {
    type: String,
    required: true,
    enum: ['patient', 'doctor', 'hospital', 'lab', 'insurance', 'government', 'ngo', 'pharma']
  },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  ownerType: {
    type: String,
    required: true,
    enum: ['patient', 'doctor', 'hospital', 'lab', 'insurance', 'government', 'ngo', 'pharma']
  },

  // Data request details
  dataRequested: [{
    type: String,
    required: true,
    enum: [
      'Lab Results',
      'Vaccination Records',
      'Medical History',
      'Diagnosis Records',
      'Treatment History',
      'Prescription History',
      'Allergy Information',
      'Surgical Records',
      'Imaging Results',
      'Vital Signs',
      'Insurance Claims',
      'Payment Records',
      'Timeline Events',
      'All Records'
    ]
  }],

  purpose: { type: String, required: true },
  description: { type: String },
  justification: { type: String },

  // Request metadata
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'revoked', 'expired'],
    default: 'pending'
  },

  // Dates
  requestDate: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  revokedAt: { type: Date },
  expiresAt: { type: Date },

  // Consent
  patientConsent: { type: Boolean, default: false },
  consentDate: { type: Date },

  // Approval details
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalNotes: { type: String },
  rejectionReason: { type: String },
  revocationReason: { type: String },
  conditions: [{ type: String }],

  // Hedera blockchain tracking
  hcsCreateTx: { type: String },
  hcsApproveTx: { type: String },
  hcsRejectTx: { type: String },
  hcsRevokeTx: { type: String },

  // Access token management
  accessToken: { type: String },
  accessTokenId: { type: String },
  accessTokenSerial: { type: Number },
  accessCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date },

  // Additional metadata
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Indexes for efficient queries
dataRequestSchema.index({ owner: 1, status: 1 });
dataRequestSchema.index({ requester: 1, status: 1 });
dataRequestSchema.index({ validUntil: 1 });
dataRequestSchema.index({ status: 1, priority: 1 });

// Virtual for checking expiration
dataRequestSchema.virtual('isExpired').get(function() {
  return this.status === 'approved' && this.validUntil && new Date() > this.validUntil;
});

// Method to check if request is active
dataRequestSchema.methods.isActive = function() {
  return this.status === 'approved' && !this.isExpired;
};

const DataRequest = mongoose.model('DataRequest', dataRequestSchema);
export default DataRequest;
