// backend/models/batchModel.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  actorDid: { type: String },
  action: { type: String }, // e.g., 'MANUFACTURED', 'TRANSFERRED', 'RECEIVED', 'REDEEMED'
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
  hcsMessageId: { type: String },
});

const batchSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    batchNumber: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, default: 0 },
    manufacturingDate: { type: Date },
    expiryDate: { type: Date },
    manufacturingFacility: { type: String },
    ipfsCid: { type: String },       // metadata CID
    tokenId: { type: String },       // HTS token id (e.g., 0.0.XXXXX)
    currentHolder: { type: String }, // DID or wallet address
    hcsMessageId: { type: String },  // initial creation message id
    trackingNumber: { type: String }, // Tracking number (same as batchNumber for now)
    qrCode: { type: String },        // QR code data URL
    isFlagged: { type: Boolean, default: false }, // Flagged for counterfeit or issues
    flagReason: { type: String },    // Reason for flagging
    history: { type: [eventSchema], default: [] },
  },
  { timestamps: true }
);

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
