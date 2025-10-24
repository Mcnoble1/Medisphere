import {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  PrivateKey,
  TopicMessageSubmitTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountId,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const operatorId = process.env.OPERATOR_ID;
const operatorKeyString = process.env.OPERATOR_KEY;
const operatorKey = PrivateKey.fromString(operatorKeyString);
const topicId = process.env.HEDERA_TOPIC_ID;
const mirrorNode = process.env.HEDERA_NETWORK === 'mainnet'
  ? 'https://mainnet-public.mirrornode.hedera.com'
  : 'https://testnet.mirrornode.hedera.com';

// Hedera client (testnet by default — change to mainnet if needed)
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

/**
 * createBatchToken - creates an HTS token to represent a batch.
 * - name: product name
 * - symbol: short code
 * - initialSupply: integer (quantity)
 * - decimals: 0 for indivisible batch units
 *
 * returns tokenId (string).
 */
export const createBatchToken = async ({ name, symbol, initialSupply = 1 }) => {
  try {
    // Create the token (fungible, fixed supply)
    const tx = await new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(0) // indivisible units
      .setInitialSupply(initialSupply)
      .setMaxSupply(initialSupply) // Required for Finite supply type
      .setTreasuryAccountId(operatorId) // treasury holds initial supply
      .setSupplyType(TokenSupplyType.Finite)
      // optionally set adminKey, freezeKey etc.
      .freezeWith(client);

    const signTx = await tx.sign(operatorKey);
    const submitTx = await signTx.execute(client);
    const receipt = await submitTx.getReceipt(client);
    const tokenId = receipt.tokenId.toString();
    console.log('✅ Created token:', tokenId);
    return tokenId;
  } catch (err) {
    console.error('Error creating batch token', err);
    throw err;
  }
};

/**
 * submitHcsLog - write an event object to a configured HCS topic and return transaction id
 */
export const submitHcsLog = async (messageObj) => {
  try {
    if (!topicId) {
      console.warn('⚠️ HEDERA_TOPIC_ID not configured, skipping HCS log');
      return 'NO_TOPIC_ID';
    }

    const message = JSON.stringify(messageObj);

    const submitTx = await new TopicMessageSubmitTransaction({
      topicId: topicId,
      message,
    }).execute(client);

    // transactionId string is useful as message id
    const txId = submitTx.transactionId.toString();
    console.log('✅ HCS message submitted:', txId);
    return txId;
  } catch (err) {
    console.error('Error submitting to HCS', err);
    throw err;
  }
};

/* --- new: token associate (server-side helper) --- */
/**
 * associateTokenToAccount(operator signs the associate transaction on behalf of the account).
 * Note: In production the account holder should sign the associate transaction from their wallet.
 * This helper assumes operator has approval to associate (for demo/pilot).
 */
export const associateTokenToAccount = async ({ tokenId, accountId, accountPrivateKey }) => {
  try {
    // If you have the account's private key (e.g., manufacturer managed account), sign association
    // Otherwise this should be done client-side by the account holder wallet.
    const tx = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenId])
      .freezeWith(client);

    // If accountPrivateKey is provided server will sign on its behalf (dev use only)
    const signTx = accountPrivateKey ? await tx.sign(PrivateKey.fromString(accountPrivateKey)) : await tx.sign(operatorKey);
    const submit = await signTx.execute(client);
    const receipt = await submit.getReceipt(client);
    return receipt.status.toString();
  } catch (err) {
    throw err;
  }
};

/* --- new: token transfer --- */
export const transferToken = async ({ tokenId, fromAccountId, toAccountId, amount }) => {
  try {
    // Build transfer transaction (requires operator to sign; actual signing rules depend on treasury/keys)
    const transferTx = new TransferTransaction()
      .addTokenTransfer(tokenId, fromAccountId, -amount)
      .addTokenTransfer(tokenId, toAccountId, amount)
      .freezeWith(client);

    // Sign with operator (treasury) key. If fromAccountId is not operator, proper signatures required.
    const signed = await transferTx.sign(operatorKey);
    const response = await signed.execute(client);
    const receipt = await response.getReceipt(client);
    return receipt.status.toString();
  } catch (err) {
    throw err;
  }
};

/* --- Mirror Node helpers for verification --- */
export const getTokenInfoFromMirror = async (tokenId) => {
  try {
    const url = `${mirrorNode}/api/v1/tokens/${tokenId}`;
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    throw err;
  }
};

export const getHcsMessagesForTopic = async (opts = {}) => {
  // opts: { topicId, limit }
  const tid = opts.topicId || topicId;
  const limit = opts.limit || 25;
  const url = `${mirrorNode}/api/v1/topics/${tid}/messages?limit=${limit}`;
  const { data } = await axios.get(url);
  return data;
};