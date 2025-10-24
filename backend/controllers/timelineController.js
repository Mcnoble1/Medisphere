// backend/controllers/timelineController.js
import TimelineEvent from '../models/timelineModel.js';

/**
 * GET /api/timeline/:patientId?limit=20&page=1
 */
export const getTimeline = async (req, res) => {
  try {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const events = await TimelineEvent.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ events });
  } catch (err) {
    console.error('getTimeline error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
