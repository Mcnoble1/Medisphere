import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MIRROR_NODE_URL = process.env.HEDERA_MIRROR_NODE || 'https://testnet.mirrornode.hedera.com';

/**
 * MirrorNodeService - Fetches data from Hedera Mirror Node REST API
 */
class MirrorNodeService {
  constructor(baseURL = MIRROR_NODE_URL) {
    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Get messages from a specific HCS topic
   * @param {string} topicId - HCS topic ID (e.g., "0.0.6898300")
   * @param {object} options - Query options
   * @returns {Promise<object>} Messages response
   */
  async getTopicMessages(topicId, options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.sequenceNumber) {
        params.append('sequencenumber', `gt:${options.sequenceNumber}`);
      }
      if (options.timestamp) {
        params.append('timestamp', `gt:${options.timestamp}`);
      }
      if (options.limit) {
        params.append('limit', options.limit);
      } else {
        params.append('limit', 100); // Default limit
      }
      if (options.order) {
        params.append('order', options.order);
      } else {
        params.append('order', 'asc');
      }

      const url = `/api/v1/topics/${topicId}/messages?${params.toString()}`;
      const response = await this.axios.get(url);

      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for topic ${topicId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get a specific message by consensus timestamp
   * @param {string} topicId - HCS topic ID
   * @param {string} timestamp - Consensus timestamp
   * @returns {Promise<object>} Message details
   */
  async getTopicMessage(topicId, timestamp) {
    try {
      const url = `/api/v1/topics/${topicId}/messages/${timestamp}`;
      const response = await this.axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching message ${timestamp} for topic ${topicId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all messages since a specific sequence number (paginated)
   * @param {string} topicId - HCS topic ID
   * @param {number} lastSequence - Last processed sequence number
   * @param {function} callback - Callback function to process each batch
   */
  async streamTopicMessages(topicId, lastSequence = 0, callback) {
    let hasMore = true;
    let currentSequence = lastSequence;
    let totalProcessed = 0;

    while (hasMore) {
      try {
        const response = await this.getTopicMessages(topicId, {
          sequenceNumber: currentSequence,
          limit: 100,
          order: 'asc'
        });

        const messages = response.messages || [];

        if (messages.length === 0) {
          hasMore = false;
          break;
        }

        // Process batch
        await callback(messages);
        totalProcessed += messages.length;

        // Update sequence for next batch
        const lastMessage = messages[messages.length - 1];
        currentSequence = lastMessage.sequence_number;

        // Check if there are more messages
        hasMore = response.links && response.links.next;

        // Small delay to avoid rate limiting
        await this.delay(100);

      } catch (error) {
        console.error('Error streaming topic messages:', error.message);
        throw error;
      }
    }

    return totalProcessed;
  }

  /**
   * Get transaction details by transaction ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<object>} Transaction details
   */
  async getTransaction(transactionId) {
    try {
      const url = `/api/v1/transactions/${transactionId}`;
      const response = await this.axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${transactionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get account information
   * @param {string} accountId - Hedera account ID
   * @returns {Promise<object>} Account details
   */
  async getAccount(accountId) {
    try {
      const url = `/api/v1/accounts/${accountId}`;
      const response = await this.axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching account ${accountId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get token information
   * @param {string} tokenId - Token ID
   * @returns {Promise<object>} Token details
   */
  async getToken(tokenId) {
    try {
      const url = `/api/v1/tokens/${tokenId}`;
      const response = await this.axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching token ${tokenId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get NFT information
   * @param {string} tokenId - Token ID
   * @param {number} serialNumber - NFT serial number
   * @returns {Promise<object>} NFT details
   */
  async getNFT(tokenId, serialNumber) {
    try {
      const url = `/api/v1/tokens/${tokenId}/nfts/${serialNumber}`;
      const response = await this.axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching NFT ${tokenId}/${serialNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Decode base64 message content
   * @param {string} base64Message - Base64 encoded message
   * @returns {object} Decoded message object
   */
  decodeMessage(base64Message) {
    try {
      const buffer = Buffer.from(base64Message, 'base64');
      const messageString = buffer.toString('utf8');
      return JSON.parse(messageString);
    } catch (error) {
      console.error('Error decoding message:', error.message);
      return null;
    }
  }

  /**
   * Parse consensus timestamp to Date
   * @param {string} timestamp - Consensus timestamp (seconds.nanoseconds)
   * @returns {Date} JavaScript Date object
   */
  parseTimestamp(timestamp) {
    const [seconds] = timestamp.split('.');
    return new Date(parseInt(seconds) * 1000);
  }

  /**
   * Utility delay function
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Subscribe to new messages (polling implementation)
   * @param {string} topicId - HCS topic ID
   * @param {number} startSequence - Starting sequence number
   * @param {function} onMessage - Callback for each new message
   * @param {number} pollInterval - Polling interval in milliseconds
   * @returns {function} Stop function
   */
  subscribe(topicId, startSequence, onMessage, pollInterval = 5000) {
    let currentSequence = startSequence;
    let isRunning = true;

    const poll = async () => {
      while (isRunning) {
        try {
          const response = await this.getTopicMessages(topicId, {
            sequenceNumber: currentSequence,
            limit: 50,
            order: 'asc'
          });

          const messages = response.messages || [];

          for (const message of messages) {
            await onMessage(message);
            currentSequence = message.sequence_number;
          }

          // Wait before next poll
          await this.delay(pollInterval);

        } catch (error) {
          console.error('Error in subscription poll:', error.message);
          await this.delay(pollInterval * 2); // Back off on error
        }
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isRunning = false;
    };
  }
}

export default MirrorNodeService;
