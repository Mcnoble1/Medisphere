// backend/models/prescriptionModel.js
import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  encryptedPayload: { type: String, required: true }, // encrypted JSON payload
  signature: { type: String }, // clinic signature over payload
  hcsMessageId: { type: String }, // HCS anchor for issuance
  ipfsCid: { type: String }, // IPFS Content Identifier
  ipfsUrl: { type: String }, // IPFS gateway URL
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
