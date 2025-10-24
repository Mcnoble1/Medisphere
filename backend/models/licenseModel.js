// backend/models/licenseModel.js
import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
  licenseNumber: { type: String, required: true, unique: true },
  issuedTo: { type: String, required: true }, // could be DID or user id
  issuedToType: { type: String, enum: ['practitioner', 'facility', 'lab', 'pharmacy'], required: true },
  issuedBy: { type: String, required: true }, // gov DID / admin id
  issueDate: { type: Date, default: () => new Date() },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
  complianceRequirements: { type: [String], default: [] },
  ipfsCid: { type: String }, // optional: certificate stored on IPFS
  hcsMessageId: { type: String }, // HCS tx anchor for issuance
}, { timestamps: true });

const License = mongoose.model('License', licenseSchema);
export default License;
