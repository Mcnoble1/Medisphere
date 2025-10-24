import { Client, AccountCreateTransaction, PrivateKey, Hbar } from '@hashgraph/sdk';
import dotenv from 'dotenv';
dotenv.config();

export async function createHederaAccount() {
  try {
    // Create a client for testnet
    const client = Client.forTestnet();

    // Set operator (main platform account that will fund new accounts)
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = process.env.OPERATOR_KEY;

    if (!operatorId || !operatorKey) {
      throw new Error('OPERATOR_ID and OPERATOR_KEY must be set in environment variables');
    }

    client.setOperator(operatorId, operatorKey);

    // Generate new key pair for the account
    const privateKey = PrivateKey.generateED25519();
    const publicKey = privateKey.publicKey;

    // Create new account transaction with 10 HBAR initial balance
    // This ensures users have sufficient balance for NFT operations (association + transfers)
    // Additional HBAR can be funded on-demand when needed for specific operations
    const transaction = new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(10)) // Fund with 10 HBAR for NFT operations
      .setAccountMemo("MediSphere User Account");

    // Submit the transaction
    const txResponse = await transaction.execute(client);

    // Get the receipt
    const receipt = await txResponse.getReceipt(client);

    // Get the account ID
    const accountId = receipt.accountId;

    console.log(`New Hedera account created: ${accountId.toString()}`);
    console.log(`Account funded with 10 HBAR for NFT and token operations`);

    return {
      accountId: accountId.toString(),
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString(),
      initialBalance: 10 // HBAR
    };

  } catch (error) {
    console.error('Failed to create Hedera account:', error);
    throw error;
  }
}