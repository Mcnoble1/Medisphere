import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // patient
  insurer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // insurer account
  record: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord', required: true }, // reference to LifeChain record
  amountRequested: { type: Number, required: true },
  currency: { type: String, default: 'NGN' },
  description: { type: String },
  attachments: [{ type: String }], // off-chain URLs / IPFS CIDs (encrypted)
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'], default: 'PENDING' },
  amountApproved: { type: Number, default: 0 },
  decisionReason: { type: String, default: null },
  hcsEvents: [
    {
      eventType: String,
      hcsMessageId: String,
      timestamp: Date,
    },
  ],
}, { timestamps: true });

const Claim = mongoose.model('Claim', claimSchema);
export default Claim;
