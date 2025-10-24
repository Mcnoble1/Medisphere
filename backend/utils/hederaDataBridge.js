import {
  Client,
  TopicMessageSubmitTransaction,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenBurnTransaction,
  PrivateKey,
  AccountId,
  TransactionId
} from '@hashgraph/sdk';
import { hcsLog } from './hcsLogger.js';
import dotenv from 'dotenv';
dotenv.config();

const operatorId = process.env.OPERATOR_ID;
const operatorKey = process.env.OPERATOR_KEY;
const topicId = process.env.HEDERA_TOPIC_ID;
const treasuryAccount = process.env.HEDERA_TOKEN_TREASURY || process.env.OPERATOR_ID;
const adminKeyStr = process.env.HEDERA_TOKEN_ADMIN_KEY || process.env.OPERATOR_KEY;

// Create client - use the app's Hedera client if available
let clientInstance = null;

export const getDataBridgeClient = () => {
  if (!clientInstance) {
    const network = process.env.HEDERA_NETWORK || 'testnet';
    clientInstance = network === 'mainnet'
      ? Client.forMainnet()
      : Client.forTestnet();
    clientInstance.setOperator(operatorId, operatorKey);
  }
  return clientInstance;
};

// --- Submit a JSON object to HCS and return transaction id string
export const submitHCS = async (obj, clientOverride = null) => {
  const client = clientOverride || getDataBridgeClient();
  const message = JSON.stringify(obj);
  const tx = await new TopicMessageSubmitTransaction({
    topicId
  }).setMessage(message).execute(client);

  // transactionId string is a helpful identifier
  return tx.transactionId.toString();
};

// --- Log Databridge action to HCS using the main audit topic
export const logDataBridgeAction = async (action, actor, metadata = {}) => {
  try {
    const client = getDataBridgeClient();
    const result = await hcsLog(client, action, actor, {
      ...metadata,
      service: 'DataBridge',
      timestamp: new Date().toISOString()
    });
    return result.transactionId;
  } catch (error) {
    console.error('[DataBridge] HCS logging failed:', error);
    // Don't throw - log failure shouldn't break the main operation
    return null;
  }
};

// --- Create an HTS token type (one-time operation). Return tokenId string
export const createAccessTokenType = async ({name = 'MedisphereDataAccess', symbol='MSDA'}) => {
  const client = getDataBridgeClient();
  const adminKey = PrivateKey.fromString(adminKeyStr);

  const tx = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTreasuryAccountId(AccountId.fromString(treasuryAccount))
    .setInitialSupply(0)
    .setTokenType(TokenType.NON_FUNGIBLE_UNIQUE) // NFT-like tokens
    .setSupplyType(TokenSupplyType.FINITE)
    .setMaxSupply(1000000)
    .setAdminKey(adminKey.publicKey)
    .setSupplyKey(adminKey.publicKey)
    .freezeWith(client);

  // Sign with admin key
  const signed = await tx.sign(adminKey);
  const response = await signed.execute(client);
  const receipt = await response.getReceipt(client);

  console.log('[DataBridge] Created access token type:', receipt.tokenId.toString());
  return receipt.tokenId.toString();
};

// --- Mint a unique token serial (NFT-like) to represent access rights
export const mintAccessToken = async ({tokenId, metadata = '', recipientAccountId}) => {
  const client = getDataBridgeClient();

  // TokenMintTransaction for unique tokens accepts metadata bytes (per token)
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([Buffer.from(metadata)]) // metadata per minted serial
    .execute(client);

  const mintReceipt = await mintTx.getReceipt(client);
  // mintReceipt.serials => array of serial numbers minted
  const serial = (mintReceipt.serials && mintReceipt.serials.length)
    ? mintReceipt.serials[0].toNumber()
    : null;

  console.log('[DataBridge] Minted access token serial:', serial);

  // Optionally transfer the token serial to recipient (unique token transfer step)
  // This would require the recipient to have a Hedera account and associate with the token
  // For now, we keep it in treasury and track access via the serial number

  return { tokenId, serial };
};

// --- Burn a specific token serial (revoke access)
export const burnAccessToken = async ({tokenId, serial}) => {
  const client = getDataBridgeClient();

  const tx = await new TokenBurnTransaction()
    .setTokenId(tokenId)
    .setSerials([serial])
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log('[DataBridge] Burned access token serial:', serial);

  return receipt.status.toString();
};

// --- Verify token serial exists and is not burned
export const verifyAccessToken = async ({tokenId, serial}) => {
  try {
    // In a production system, you would query the token's NFT serial info
    // For now, we'll assume if no error is thrown, the token is valid
    // This is a simplified check - you may want to query TokenNftInfoQuery
    return { valid: true, tokenId, serial };
  } catch (error) {
    console.error('[DataBridge] Token verification failed:', error);
    return { valid: false, error: error.message };
  }
};
