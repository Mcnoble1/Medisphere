import mongoose from 'mongoose';

// GovHealth Audit Schema - for regulatory audits
const auditSchema = new mongoose.Schema({
  auditId: { type: String, required: true, unique: true },
  targetLicense: { type: mongoose.Schema.Types.ObjectId, ref: 'License', required: false },
  targetEntity: { type: String, required: true }, // DID or entity identifier
  performedBy: { type: String, required: true }, // gov user id or DID
  auditDate: { type: Date, default: () => new Date() },
  summary: { type: String },
  findings: { type: [String], default: [] },
  severity: { type: String, enum: ['low','medium','high'], default: 'low' },
  ipfsReportCid: { type: String }, // signed PDF or JSON pinned to IPFS
  hcsMessageId: { type: String }, // HCS anchor for audit entry
}, { timestamps: true });

const Audit = mongoose.model('Audit', auditSchema);
export default Audit;
