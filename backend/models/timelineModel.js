// backend/models/timelineModel.js
import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: { type: String, required: true }, // e.g., 'lab_result', 'prescription'
    actor: {
      // who created the event (lab DID / clinic DID / gov DID)
      id: String,
      name: String,
      role: String,
    },
    title: String,
    description: String,
    meta: {
      // structured metadata, e.g. { cid, hcsMessageId, labResultId }
      type: mongoose.Schema.Types.Mixed,
    },
    seenByPatient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TimelineEvent = mongoose.model('TimelineEvent', timelineSchema);
export default TimelineEvent;
