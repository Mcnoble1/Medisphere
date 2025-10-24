import mongoose from 'mongoose';

const dataShareSchema = new mongoose.Schema({
  // Core identifiers
  sharer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharerName: { type: String, required: true },
  sharerType: {
    type: String,
    required: true,
    enum: ['patient', 'doctor', 'hospital', 'lab', 'insurance', 'government', 'ngo', 'pharma']
  },

  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  recipientType: {
    type: String,
    required: true,
    enum: ['patient', 'doctor', 'hospital', 'lab', 'insurance', 'government', 'ngo', 'pharma']
  },

  // Data share details
  dataShared: [{
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

  // Status and dates
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },

  sharedDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  revokedAt: { type: Date },
  revocationReason: { type: String },

  // Access tracking
  accessCount: { type: Number, default: 0 },
  lastAccessedAt: { type: Date },
  accessLog: [{
    accessedAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
    action: { type: String }
  }],

  // Access token
  accessToken: { type: String, required: true, unique: true },
  accessTokenId: { type: String },
  accessTokenSerial: { type: Number },

  // Conditions and restrictions
  conditions: [{ type: String }],
  accessRestrictions: {
    maxAccessCount: { type: Number },
    allowedIpAddresses: [{ type: String }],
    allowedTimeWindow: {
      startTime: { type: String },
      endTime: { type: String }
    }
  },

  // Hedera blockchain tracking
  hcsCreateTx: { type: String },
  hcsAccessTx: [{ type: String }],
  hcsRevokeTx: { type: String },

  // Related request (if this share was created from a request)
  relatedRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'DataRequest' },

  // Additional metadata
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Indexes for efficient queries
dataShareSchema.index({ sharer: 1, status: 1 });
dataShareSchema.index({ recipient: 1, status: 1 });
dataShareSchema.index({ expiryDate: 1 });
dataShareSchema.index({ status: 1 });

// Virtual for checking expiration
dataShareSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Method to check if share is active
dataShareSchema.methods.isActive = function() {
  return this.status === 'active' && !this.isExpired;
};

// Method to log access
dataShareSchema.methods.logAccess = function(ipAddress, userAgent, action) {
  this.accessCount += 1;
  this.lastAccessedAt = new Date();
  this.accessLog.push({
    accessedAt: new Date(),
    ipAddress,
    userAgent,
    action
  });
};

const DataShare = mongoose.model('DataShare', dataShareSchema);
export default DataShare;
