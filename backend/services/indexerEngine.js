import MirrorNodeService from './mirrorNodeService.js';
import IndexedRecord from '../models/indexedRecordModel.js';
import IndexerState from '../models/indexerStateModel.js';
import HealthRecord from '../models/recordModel.js';
import { User } from '../models/userModel.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * IndexerEngine - Processes Hedera messages and creates searchable index
 */
class IndexerEngine {
  constructor() {
    this.mirrorNode = new MirrorNodeService();
    this.topicIds = this.getTopicIds();
    this.isRunning = false;
    this.subscriptions = [];
  }

  /**
   * Get all configured topic IDs
   */
  getTopicIds() {
    return {
      main: process.env.HEDERA_TOPIC_ID || process.env.MEDISPHERE_HCS_AUDIT_TOPIC_ID,
      medicalRecords: process.env.NEXT_PUBLIC_MEDICAL_RECORDS_TOPIC_ID,
      consent: process.env.NEXT_PUBLIC_CONSENT_LOGS_TOPIC_ID,
      prescriptions: process.env.NEXT_PUBLIC_PRESCRIPTIONS_TOPIC_ID,
      vaccinations: process.env.NEXT_PUBLIC_VACCINATIONS_TOPIC_ID,
      ngoActivities: process.env.NEXT_PUBLIC_NGO_ACTIVITIES_TOPIC_ID
    };
  }

  /**
   * Initialize indexer state for all topics
   */
  async initializeState() {
    for (const [name, topicId] of Object.entries(this.topicIds)) {
      if (!topicId) continue;

      let state = await IndexerState.findOne({ topicId });
      if (!state) {
        state = await IndexerState.create({
          topicId,
          lastProcessedSequence: 0,
          status: 'active',
          totalMessagesProcessed: 0
        });
        console.log(`✅ Initialized indexer state for ${name} topic: ${topicId}`);
      }
    }
  }

  /**
   * Process a single HCS message and create indexed record
   */
  async processMessage(message, topicId) {
    try {
      // Decode message content
      const content = this.mirrorNode.decodeMessage(message.message);
      if (!content) {
        console.warn(`Could not decode message ${message.sequence_number}`);
        return null;
      }

      // Parse timestamp
      const hcsTimestamp = this.mirrorNode.parseTimestamp(message.consensus_timestamp);

      // Check if already indexed
      const existing = await IndexedRecord.findOne({
        hcsMessageId: message.consensus_timestamp
      });

      if (existing) {
        console.log(`Message ${message.sequence_number} already indexed`);
        return existing;
      }

      // Extract metadata based on event type
      const indexData = await this.extractMetadata(content, message, topicId, hcsTimestamp);

      if (!indexData) {
        console.warn(`Could not extract metadata from message ${message.sequence_number}`);
        return null;
      }

      // Create indexed record
      const indexed = await IndexedRecord.create({
        hcsMessageId: message.consensus_timestamp,
        hcsTopicId: topicId,
        hcsTimestamp,
        hcsSequenceNumber: message.sequence_number,
        ...indexData,
        indexedAt: new Date()
      });

      console.log(`✅ Indexed record ${indexed._id} from message ${message.sequence_number}`);
      return indexed;

    } catch (error) {
      console.error(`Error processing message ${message.sequence_number}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract searchable metadata from message content
   */
  async extractMetadata(content, message, topicId, timestamp) {
    try {
      // Determine event type and extract relevant data
      const eventType = content.eventType || content.type || content.action;

      let metadata = {
        recordType: this.mapEventToRecordType(eventType),
        hcsTimestamp: timestamp,
        ipfsCid: content.cid || content.ipfsCid,
        ipfsUrl: content.ipfsUrl,
        recordHash: content.hash || content.recordHash,
        title: content.title || content.name,
        recordDate: content.date ? new Date(content.date) : timestamp,
        facility: content.facility || content.hospital,
        verified: false
      };

      // Extract patient information
      if (content.patientId || content.patient) {
        const patientId = content.patientId || content.patient;
        metadata.patientAccountId = content.patientAccountId || content.patientHederaId;
        metadata.patientDid = content.patientDid;

        // Try to find patient in database
        if (patientId) {
          const patient = await User.findById(patientId);
          if (patient) {
            metadata.patientMongoId = patient._id;
            metadata.patientAccountId = patient.hederaAccountId || metadata.patientAccountId;
          }
        }
      }

      // Extract provider information
      if (content.providerId || content.doctor || content.lab || content.clinic) {
        const providerId = content.providerId || content.doctor || content.lab || content.clinic;
        metadata.providerName = content.providerName || content.doctorName || content.labName;
        metadata.providerAccountId = content.providerAccountId || content.providerHederaId;
        metadata.providerDid = content.providerDid || content.issuerDid;
        metadata.providerType = this.detectProviderType(content);
      }

      // Extract type-specific metadata
      metadata.metadata = this.extractTypeSpecificMetadata(content, eventType);

      // Handle original record reference
      if (content.recordId) {
        metadata.originalRecordId = content.recordId;
      }

      // Handle NFT data
      if (content.nftTokenId || content.tokenId) {
        metadata.nftTokenId = content.nftTokenId || content.tokenId;
        metadata.nftSerial = content.nftSerial || content.serial;
      }

      // Status
      metadata.status = content.status || 'active';

      // Verify hash if possible
      if (metadata.ipfsCid && metadata.recordHash) {
        metadata.verified = await this.verifyRecordHash(metadata.ipfsCid, metadata.recordHash);
      }

      return metadata;

    } catch (error) {
      console.error('Error extracting metadata:', error.message);
      return null;
    }
  }

  /**
   * Map event type to record type
   */
  mapEventToRecordType(eventType) {
    const mappings = {
      'lab_result': 'lab-result',
      'lab-result': 'lab-result',
      'prescription': 'prescription',
      'diagnosis': 'diagnosis',
      'vaccination': 'vaccination',
      'surgery': 'surgery',
      'medical_record': 'other',
      'record_created': 'other',
      'record_updated': 'other'
    };

    return mappings[eventType] || 'other';
  }

  /**
   * Detect provider type from content
   */
  detectProviderType(content) {
    if (content.lab || content.labName) return 'lab';
    if (content.pharmacy) return 'pharmacy';
    if (content.hospital) return 'hospital';
    if (content.clinic) return 'clinic';
    if (content.doctor || content.doctorName) return 'doctor';
    return 'other';
  }

  /**
   * Extract type-specific metadata
   */
  extractTypeSpecificMetadata(content, eventType) {
    const metadata = {
      tags: content.tags || []
    };

    // Lab results
    if (eventType === 'lab_result' || content.testType) {
      metadata.testType = content.testType;
      metadata.labName = content.labName || content.lab?.name;
    }

    // Prescriptions
    if (eventType === 'prescription' || content.medications) {
      metadata.medicationNames = this.extractMedicationNames(content.medications);
      metadata.prescribingDoctor = content.doctor || content.doctorName;
    }

    // Vaccinations
    if (eventType === 'vaccination' || content.vaccine) {
      metadata.vaccineName = content.vaccine || content.vaccineName;
      metadata.batchNumber = content.batchNumber;
      metadata.manufacturer = content.manufacturer;
    }

    // Surgery
    if (eventType === 'surgery' || content.procedure) {
      metadata.procedureName = content.procedure || content.procedureName;
      metadata.surgeonName = content.surgeon || content.surgeonName;
    }

    return metadata;
  }

  /**
   * Extract medication names from prescription data
   */
  extractMedicationNames(medications) {
    if (!medications) return [];
    if (Array.isArray(medications)) {
      return medications.map(med => med.name || med.medication || med).filter(Boolean);
    }
    return [];
  }

  /**
   * Verify record hash against IPFS content
   */
  async verifyRecordHash(cid, expectedHash) {
    try {
      // This is a placeholder - actual implementation would fetch from IPFS
      // and compute hash to compare
      return false; // Default to unverified until actual check is implemented
    } catch (error) {
      console.error('Error verifying hash:', error.message);
      return false;
    }
  }

  /**
   * Sync historical messages for a topic
   */
  async syncTopic(topicId, fromSequence = 0) {
    console.log(`🔄 Starting sync for topic ${topicId} from sequence ${fromSequence}`);

    const state = await IndexerState.findOne({ topicId });
    const startSequence = fromSequence || (state?.lastProcessedSequence || 0);

    let totalProcessed = 0;

    try {
      await IndexerState.updateOne(
        { topicId },
        { status: 'syncing', syncStartedAt: new Date() }
      );

      totalProcessed = await this.mirrorNode.streamTopicMessages(
        topicId,
        startSequence,
        async (messages) => {
          for (const message of messages) {
            try {
              await this.processMessage(message, topicId);

              // Update state after each message
              await IndexerState.updateOne(
                { topicId },
                {
                  $set: {
                    lastProcessedSequence: message.sequence_number,
                    lastProcessedTimestamp: this.mirrorNode.parseTimestamp(message.consensus_timestamp),
                    lastProcessedMessageId: message.consensus_timestamp
                  },
                  $inc: { totalMessagesProcessed: 1 }
                }
              );
            } catch (error) {
              console.error(`Error processing message ${message.sequence_number}:`, error.message);
              // Continue with next message
            }
          }
        }
      );

      await IndexerState.updateOne(
        { topicId },
        {
          status: 'active',
          syncCompletedAt: new Date()
        }
      );

      console.log(`✅ Sync completed for topic ${topicId}. Processed ${totalProcessed} messages`);
      return totalProcessed;

    } catch (error) {
      console.error(`Error syncing topic ${topicId}:`, error.message);
      await IndexerState.updateOne(
        { topicId },
        {
          status: 'error',
          lastError: error.message,
          lastErrorAt: new Date()
        }
      );
      throw error;
    }
  }

  /**
   * Sync all configured topics
   */
  async syncAll() {
    console.log('🔄 Starting sync for all topics...');

    for (const [name, topicId] of Object.entries(this.topicIds)) {
      if (!topicId) {
        console.warn(`Skipping ${name} topic (not configured)`);
        continue;
      }

      try {
        await this.syncTopic(topicId);
      } catch (error) {
        console.error(`Failed to sync ${name} topic:`, error.message);
        // Continue with other topics
      }
    }

    console.log('✅ All topics synced');
  }

  /**
   * Start real-time indexing (subscribes to new messages)
   */
  async startRealtime() {
    if (this.isRunning) {
      console.warn('Indexer is already running');
      return;
    }

    console.log('🚀 Starting real-time indexer...');
    this.isRunning = true;

    // Subscribe to each topic
    for (const [name, topicId] of Object.entries(this.topicIds)) {
      if (!topicId) continue;

      const state = await IndexerState.findOne({ topicId });
      const startSequence = state?.lastProcessedSequence || 0;

      const stopFn = this.mirrorNode.subscribe(
        topicId,
        startSequence,
        async (message) => {
          try {
            await this.processMessage(message, topicId);

            // Update state
            await IndexerState.updateOne(
              { topicId },
              {
                $set: {
                  lastProcessedSequence: message.sequence_number,
                  lastProcessedTimestamp: this.mirrorNode.parseTimestamp(message.consensus_timestamp),
                  lastProcessedMessageId: message.consensus_timestamp
                },
                $inc: { totalMessagesProcessed: 1 }
              }
            );
          } catch (error) {
            console.error(`Error in real-time processing for ${topicId}:`, error.message);
          }
        },
        5000 // Poll every 5 seconds
      );

      this.subscriptions.push({ name, topicId, stop: stopFn });
      console.log(`✅ Subscribed to ${name} topic: ${topicId}`);
    }
  }

  /**
   * Stop real-time indexing
   */
  stop() {
    console.log('🛑 Stopping indexer...');
    this.isRunning = false;

    for (const sub of this.subscriptions) {
      sub.stop();
      console.log(`✅ Unsubscribed from ${sub.name} topic`);
    }

    this.subscriptions = [];
  }

  /**
   * Get indexer status
   */
  async getStatus() {
    const states = await IndexerState.find();
    const totalRecords = await IndexedRecord.countDocuments();

    return {
      isRunning: this.isRunning,
      topics: states.map(s => ({
        topicId: s.topicId,
        status: s.status,
        lastProcessedSequence: s.lastProcessedSequence,
        lastProcessedTimestamp: s.lastProcessedTimestamp,
        totalMessagesProcessed: s.totalMessagesProcessed,
        lastError: s.lastError
      })),
      totalIndexedRecords: totalRecords,
      subscriptions: this.subscriptions.length
    };
  }
}

export default IndexerEngine;
