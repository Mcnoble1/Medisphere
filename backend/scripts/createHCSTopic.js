import { Client, TopicCreateTransaction, Hbar } from '@hashgraph/sdk';
import dotenv from 'dotenv';
dotenv.config();

async function createMedisphereAuditTopic() {
  try {
    // Create client using platform operator account
    const client = Client.forTestnet();
    client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

    console.log('Creating MediSphere HCS Audit Topic...');
    console.log('Operator ID:', process.env.OPERATOR_ID);

    // Create the topic
    const topicCreateTx = await new TopicCreateTransaction()
      .setTopicMemo('MediSphere Platform - Audit & Compliance Log')
      .setAdminKey(client.operatorPublicKey)
      .setSubmitKey(client.operatorPublicKey)
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);

    // Get the receipt
    const receipt = await topicCreateTx.getReceipt(client);
    const topicId = receipt.topicId.toString();

    console.log('\n✅ Successfully created MediSphere HCS Audit Topic!');
    console.log('📝 Topic ID:', topicId);
    console.log('🔗 Transaction ID:', topicCreateTx.transactionId.toString());
    console.log('\n🚀 Add this to your .env file:');
    console.log(`MEDISPHERE_HCS_AUDIT_TOPIC_ID=${topicId}`);
    console.log(`HEDERA_TOPIC_ID=${topicId}`);

    // Test by submitting a message
    console.log('\n🧪 Testing topic by submitting initial message...');
    const { TopicMessageSubmitTransaction } = await import('@hashgraph/sdk');

    const testMessage = JSON.stringify({
      action: 'TOPIC_CREATED',
      platform: 'MediSphere',
      timestamp: new Date().toISOString(),
      message: 'MediSphere HCS Audit Topic successfully created and initialized'
    });

    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(testMessage)
      .execute(client);

    const submitReceipt = await submitTx.getReceipt(client);
    console.log('✅ Test message submitted successfully!');
    console.log('📝 Message Transaction ID:', submitTx.transactionId.toString());

    console.log('\n🎉 MediSphere HCS Topic is ready for use!');
    console.log(`🔍 View on HashScan: https://hashscan.io/testnet/topic/${topicId}`);

  } catch (error) {
    console.error('❌ Error creating HCS topic:', error);
    process.exit(1);
  }
}

// Run the script
createMedisphereAuditTopic();