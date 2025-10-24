// Script to check Hedera account balance
import { Client, AccountBalanceQuery, PrivateKey } from '@hashgraph/sdk';
import dotenv from 'dotenv';
dotenv.config();

async function checkBalance() {
  try {
    console.log('Checking Hedera account balance...\n');

    const operatorId = process.env.OPERATOR_ID;
    const operatorKeyString = process.env.OPERATOR_KEY;

    if (!operatorId || !operatorKeyString) {
      throw new Error('OPERATOR_ID or OPERATOR_KEY not set in .env file');
    }

    console.log(`Account ID: ${operatorId}`);

    // Parse the private key
    let operatorKey;
    try {
      operatorKey = PrivateKey.fromStringDer(operatorKeyString);
      console.log('Private key format: DER-encoded');
    } catch (derError) {
      try {
        operatorKey = PrivateKey.fromString(operatorKeyString);
        console.log('Private key format: Standard hex');
      } catch (stringError) {
        throw new Error(`Failed to parse OPERATOR_KEY. Please check your .env file.\nDER Error: ${derError.message}\nString Error: ${stringError.message}`);
      }
    }

    // Create client
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    // Query balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    console.log(`\nAccount Balance:`);
    console.log(`  HBAR: ${balance.hbars.toString()}`);
    console.log(`  Tokens: ${balance.tokens.size} different token types`);

    // Check if balance is sufficient for NFT operations
    const hbarBalance = balance.hbars.toBigNumber().toNumber();
    console.log(`\nBalance Status:`);
    if (hbarBalance < 5) {
      console.log('  ⚠️  WARNING: Balance is very low!');
      console.log('  ℹ️  NFT collection creation typically requires ~5-10 HBAR');
      console.log('  ℹ️  Get free testnet HBAR at: https://portal.hedera.com/');
    } else if (hbarBalance < 20) {
      console.log('  ⚠️  Balance is low but sufficient for a few operations');
      console.log('  ℹ️  Consider getting more testnet HBAR at: https://portal.hedera.com/');
    } else {
      console.log('  ✓ Balance is sufficient for NFT operations');
    }

    client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

checkBalance();
