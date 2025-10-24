import dotenv from 'dotenv';
import mongoose from 'mongoose';
import IndexerEngine from '../services/indexerEngine.js';
import StatsAggregator from '../services/statsAggregator.js';

dotenv.config();

/**
 * Start the Medisphere Indexer
 * This script initializes and runs the indexer in the background
 */

async function startIndexer() {
  try {
    console.log('🚀 Starting Medisphere Indexer...\n');

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'medisphere'
    });
    console.log('✅ MongoDB connected\n');

    // Initialize indexer
    const indexer = new IndexerEngine();

    // Initialize state
    console.log('🔧 Initializing indexer state...');
    await indexer.initializeState();
    console.log('✅ Indexer state initialized\n');

    // Sync historical data
    console.log('🔄 Syncing historical data...');
    console.log('This may take a while depending on the number of messages...\n');
    await indexer.syncAll();
    console.log('✅ Historical sync completed\n');

    // Start real-time indexing
    console.log('🎯 Starting real-time indexing...');
    await indexer.startRealtime();
    console.log('✅ Real-time indexer started\n');

    // Initialize stats aggregator
    const statsAggregator = new StatsAggregator();

    // Generate historical stats
    console.log('📊 Generating platform statistics...');
    await statsAggregator.calculateDailyStats();
    console.log('✅ Statistics generated\n');

    // Start auto-update (every hour)
    statsAggregator.startAutoUpdate(1);
    console.log('✅ Stats auto-update started (1 hour interval)\n');

    // Display status
    const status = await indexer.getStatus();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 INDEXER STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Running: ${status.isRunning ? '✅ Yes' : '❌ No'}`);
    console.log(`Total Indexed Records: ${status.totalIndexedRecords}`);
    console.log(`Active Subscriptions: ${status.subscriptions}`);
    console.log('\nTopics:');
    status.topics.forEach(topic => {
      console.log(`  • ${topic.topicId}`);
      console.log(`    Status: ${topic.status}`);
      console.log(`    Last Sequence: ${topic.lastProcessedSequence}`);
      console.log(`    Total Processed: ${topic.totalMessagesProcessed}`);
      if (topic.lastError) {
        console.log(`    ⚠️  Last Error: ${topic.lastError}`);
      }
      console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Indexer is running successfully!');
    console.log('💡 Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down indexer...');
      indexer.stop();
      statsAggregator.stopAutoUpdate();
      await mongoose.connection.close();
      console.log('✅ Indexer stopped gracefully');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error starting indexer:', error);
    process.exit(1);
  }
}

// Run the indexer
startIndexer();
