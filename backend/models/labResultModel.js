// backend/models/labResultModel.js
import mongoose from 'mongoose';

const labResultSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testType: { type: String, required: true }, // e.g., "PCR", "Full Blood Count"
    encryptedCid: { type: String }, // IPFS CID or S3 object key for encrypted payload
    encryptedBlobHash: { type: String }, // SHA256 of encrypted payload for quick verification
    hcsMessageId: { type: String }, // HCS tx id for anchor
    vc: {
      // minimal VC metadata stored for quick lookup; full VC can be delivered to patient
      id: String,
      type: [String],
      issuedAt: Date,
    },
    metadata: {
      dateCollected: Date,
      dateReported: Date,
      notes: String,
    },
  },
  { timestamps: true }
);

const LabResult = mongoose.model('LabResult', labResultSchema);
export default LabResult;
