// Script to test NFT collection creation and minting
import { createVaccinationNFTCollection, mintVaccinationNFT, getVaccinationNFTCollection } from '../utils/nft.js';
import dotenv from 'dotenv';
dotenv.config();

async function testNFTCreation() {
  try {
    console.log('Testing NFT Collection Creation and Minting...\n');

    const testUserId = 'test-user-123';

    // Step 1: Get or create collection
    console.log('Step 1: Getting vaccination NFT collection...');
    const tokenId = await getVaccinationNFTCollection(testUserId);
    console.log(`✓ Using collection: ${tokenId}\n`);

    // Step 2: Test minting an NFT
    console.log('Step 2: Minting test vaccination NFT...');
    const testIpfsCid = 'bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku'; // Example CID (46 chars)
    const testMetadata = {
      vaccine: 'COVID-19 Test Vaccine',
      patient: 'Test Patient',
      recordId: 'test-record-123'
    };

    const mintResult = await mintVaccinationNFT(
      testUserId,
      tokenId,
      testIpfsCid,
      testMetadata
    );

    console.log('\n✓ NFT Minted successfully!');
    console.log('\nNFT Details:');
    console.log(`  NFT ID: ${mintResult.nftId}`);
    console.log(`  Token ID: ${mintResult.tokenId}`);
    console.log(`  Serial: ${mintResult.serial}`);
    console.log(`  Transaction ID: ${mintResult.transactionId}`);
    console.log(`  IPFS CID: ${mintResult.ipfsCid}`);
    console.log(`  Operator: ${mintResult.operatorId}`);

    console.log('\n📝 Collection already configured in .env:');
    console.log(`VACCINATION_NFT_COLLECTION_ID=${tokenId}`);

    console.log('\n🔍 View on HashScan:');
    console.log(`  Collection: https://hashscan.io/testnet/token/${tokenId}`);
    console.log(`  NFT: https://hashscan.io/testnet/token/${mintResult.nftId.replace('/', '/')}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testNFTCreation();
