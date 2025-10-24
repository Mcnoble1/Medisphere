// backend/models/appointmentModel.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  reason: { type: String },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'requested'
  },
  hcsMessageId: { type: String }, // HCS anchor for appointment creation/accept
  metadata: { type: Object }, // freeform for extra data
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
