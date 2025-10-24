import mongoose from 'mongoose';

/**
 * IndexerState - Tracks indexer progress and state
 */
const indexerStateSchema = new mongoose.Schema(
  {
    topicId: {
      type: String,
      required: true,
      unique: true
    },
    lastProcessedSequence: {
      type: Number,
      default: 0
    },
    lastProcessedTimestamp: Date,
    lastProcessedMessageId: String,
    status: {
      type: String,
      enum: ['active', 'paused', 'error', 'syncing'],
      default: 'active'
    },
    totalMessagesProcessed: {
      type: Number,
      default: 0
    },
    lastError: String,
    lastErrorAt: Date,
    syncStartedAt: Date,
    syncCompletedAt: Date
  },
  {
    timestamps: true,
    collection: 'indexer_state'
  }
);

const IndexerState = mongoose.model('IndexerState', indexerStateSchema);
export default IndexerState;
