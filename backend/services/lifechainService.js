import TimelineEvent from '../models/timelineModel.js';
import { User } from '../models/userModel.js';
// import { sendNotification } from '../utils/notify.js';

/**
 * Append a lab result event to a patient's LifeChain timeline and notify patient/providers.
 *
 * @param {Object} params
 *  - patientId: ObjectId
 *  - lab: { id, did, name }
 *  - testType: string
 *  - cid: ipfs cid
 *  - hcsMessageId: string
 *  - labResultId: string
 */
export const appendLabResultEvent = async ({
  patientId,
  lab,
  testType,
  cid,
  hcsMessageId,
  labResultId,
  notes,
}) => {
  // Build timeline entry
  const title = `Lab result: ${testType}`;
  const description = `A new ${testType} result was recorded by ${lab.name}.`;

  const event = await TimelineEvent.create({
    patient: patientId,
    eventType: 'lab_result',
    actor: { id: lab.id, name: lab.name, role: 'lab' },
    title,
    description,
    meta: {
      cid,
      hcsMessageId,
      labResultId,
      testType,
      notes,
    },
  });

  try {
    // fetch patient contact info
    const patient = await User.findById(patientId).lean();
    if (patient) {
      const message = {
        title,
        body: `${lab.name} uploaded a ${testType} result. View in your Health Timeline.`,
      };

      // Personalize/send notifications (SMS / Email / push)
      // await sendNotification({
      //   toPhone: patient.phone,
      //   toEmail: patient.email,
      //   message,
      //   metadata: { timelineEventId: event._id, patientId },
      // });
    }
  } catch (err) {
    console.error('appendLabResultEvent notify error:', err);
    // do not fail the main flow if notification fails
  }

  return event;
};
