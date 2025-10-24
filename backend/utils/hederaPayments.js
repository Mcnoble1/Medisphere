import {
  Client,
  TransferTransaction,
  Hbar,
  TokenId,
  PrivateKey,
  AccountId,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Transfer HTS token from operator to recipient.
 * This is simplified and assumes token is fungible and operator is treasury/has allowance.
 */
export const transferHTSToken = async ({ tokenId, fromAccountId, fromPrivateKey, toAccountId, amount }) => {
  try {
    const operatorId = process.env.HEDERA_ACCOUNT_ID || fromAccountId;
    const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY || fromPrivateKey);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    // HTS transfers are made via TransferTransaction, using token units as integer amounts.
    // tokenId should be in "0.0.x" format, amount is integer token amount (depends on token decimals).
    const tx = await new TransferTransaction()
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(fromAccountId), -amount)
      .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(toAccountId), amount)
      .execute(client);

    const receipt = await tx.getReceipt(client);
    const status = receipt.status.toString();
    const txId = tx.transactionId.toString();

    // Logable result
    return { success: status === 'SUCCESS', status, txId };
  } catch (err) {
    console.error('transferHTSToken error', err);
    return { success: false, error: err.message };
  }
};
