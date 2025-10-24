import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const MIRROR_NODE = process.env.MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';

/**
 * fetchHcsMessagesByTopic
 * returns last N messages for a topic (mirror node)
 */
export const fetchHcsMessagesByTopic = async (topicId, limit = 25) => {
  try {
    const url = `${MIRROR_NODE}/api/v1/topics/${topicId}/messages?limit=${limit}`;
    const resp = await axios.get(url);
    return resp.data; // contains array of messages with timestamp, message (base64)
  } catch (err) {
    console.error('Mirror node HCS fetch error', err.message || err);
    throw err;
  }
};

/**
 * fetchTopicMessageBySeq
 * or fetch other public data as needed...
 */
