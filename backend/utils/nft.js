import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenId,
  PrivateKey,
  CustomRoyaltyFee,
  CustomFixedFee,
  Hbar,
  AccountBalanceQuery,
  TransferTransaction as HbarTransferTransaction
} from '@hashgraph/sdk';
import { getHederaClientForUser, getPlatformHederaClient } from './hederaOperator.js';
import { User } from '../models/userModel.js';

/**
 * Create an NFT collection for vaccination records
 * Uses platform account directly to avoid insufficient balance issues
 */
export const createVaccinationNFTCollection = async (userId, vaccinationName) => {
  // Always use platform account for NFT collection creation (requires HBAR)
  console.log('[NFT] Creating NFT collection with platform account...');
  const client = getPlatformHederaClient();
  const treasuryId = process.env.OPERATOR_ID;

  try {
    // Create NFT collection without signing (client already has the key)
    const nftCreate = await new TokenCreateTransaction()
      .setTokenName(`MediSphere ${vaccinationName} Certificate`)
      .setTokenSymbol(`MED-VAX`)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(client.operatorPublicKey)
      .setMaxTransactionFee(new Hbar(30))
      .execute(client);

    const nftCreateRx = await nftCreate.getReceipt(client);
    const tokenId = nftCreateRx.tokenId;

    console.log(`[NFT] Created vaccination NFT collection: ${tokenId.toString()}`);

    return {
      tokenId: tokenId.toString(),
      treasuryId,
      operatorId: treasuryId,
      isUserAccount: false
    };
  } catch (error) {
    console.error('[NFT] Failed to create NFT collection:', error);
    throw error;
  }
};

/**
 * Mint a vaccination NFT for a patient
 * Uses platform account directly to avoid insufficient balance issues
 */
export const mintVaccinationNFT = async (userId, tokenId, ipfsCid, metadata = {}) => {
  // Always use platform account for NFT minting (requires HBAR)
  console.log('[NFT] Minting vaccination NFT with platform account...');
  const client = getPlatformHederaClient();
  const operatorId = process.env.OPERATOR_ID;

  try {
    // Hedera NFT metadata limit is 100 bytes
    // Store only IPFS CID - all full data is already on IPFS
    // Format: just the CID string (typically 46-59 bytes)
    const nftMetadata = Buffer.from(ipfsCid);

    // Validate metadata size
    if (nftMetadata.length > 100) {
      throw new Error(`NFT metadata too long: ${nftMetadata.length} bytes (max 100). CID: ${ipfsCid}`);
    }

    console.log(`[NFT] Metadata size: ${nftMetadata.length} bytes (IPFS CID only)`);

    // Mint the NFT without explicit signing (client already has the key)
    const mintTx = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata([nftMetadata])
      .setMaxTransactionFee(new Hbar(20))
      .execute(client);

    const mintRx = await mintTx.getReceipt(client);
    const serial = mintRx.serials[0].toNumber();
    const nftId = `${tokenId}/${serial}`;

    console.log(`[NFT] Minted vaccination NFT: ${nftId} with IPFS CID: ${ipfsCid}`);

    return {
      nftId,
      tokenId: tokenId.toString(),
      serial,
      transactionId: mintTx.transactionId.toString(),
      operatorId,
      isUserAccount: false,
      metadata: ipfsCid, // Return the CID for reference
      ipfsCid // Explicitly include the CID
    };
  } catch (error) {
    console.error('[NFT] Failed to mint NFT:', error);
    throw error;
  }
};

/**
 * Get or create a global vaccination NFT collection
 * Uses a singleton pattern to reuse the same collection
 */
let VACCINATION_COLLECTION_ID = null;

export const getVaccinationNFTCollection = async (userId) => {
  // Check if we have a cached collection ID from environment
  if (process.env.VACCINATION_NFT_COLLECTION_ID && process.env.VACCINATION_NFT_COLLECTION_ID !== '0.0.YOUR_TOKEN_ID') {
    VACCINATION_COLLECTION_ID = process.env.VACCINATION_NFT_COLLECTION_ID;
    console.log(`[NFT] Using existing vaccination collection: ${VACCINATION_COLLECTION_ID}`);
    return VACCINATION_COLLECTION_ID;
  }

  // If no cached ID, create new collection
  if (!VACCINATION_COLLECTION_ID) {
    const result = await createVaccinationNFTCollection(userId, 'Vaccination');
    VACCINATION_COLLECTION_ID = result.tokenId;
    console.log(`[NFT] Created new vaccination collection: ${VACCINATION_COLLECTION_ID}`);
    console.log(`[NFT] Add this to your .env file: VACCINATION_NFT_COLLECTION_ID=${VACCINATION_COLLECTION_ID}`);
  }

  return VACCINATION_COLLECTION_ID;
};

/**
 * Fund a Hedera account with HBAR from platform account
 * Used to ensure patient accounts have enough HBAR for NFT association
 */
export const fundAccount = async (recipientAccountId, amount = 10) => {
  const client = getPlatformHederaClient();
  const operatorId = process.env.OPERATOR_ID;

  try {
    console.log(`[Funding] Funding account ${recipientAccountId} with ${amount} HBAR...`);

    // Create transfer transaction
    const transferTx = await new HbarTransferTransaction()
      .addHbarTransfer(operatorId, new Hbar(-amount)) // Deduct from platform
      .addHbarTransfer(recipientAccountId, new Hbar(amount)) // Add to recipient
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);

    const receipt = await transferTx.getReceipt(client);

    console.log(`[Funding] Successfully funded ${recipientAccountId} with ${amount} HBAR`);
    console.log(`[Funding] Transaction ID: ${transferTx.transactionId.toString()}`);

    return {
      success: true,
      transactionId: transferTx.transactionId.toString(),
      amount,
      recipientAccountId
    };
  } catch (error) {
    console.error(`[Funding] Failed to fund account ${recipientAccountId}:`, error);
    throw error;
  }
};

/**
 * Check if an account has sufficient HBAR balance
 */
export const checkAccountBalance = async (accountId) => {
  const client = getPlatformHederaClient();

  try {
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);

    const hbarBalance = balance.hbars.toBigNumber().toNumber();
    console.log(`[Balance] Account ${accountId} has ${hbarBalance} HBAR`);

    return {
      hbar: hbarBalance,
      hasSufficientBalance: hbarBalance >= 5 // Minimum 5 HBAR for NFT operations
    };
  } catch (error) {
    console.error(`[Balance] Failed to check balance for ${accountId}:`, error);
    return {
      hbar: 0,
      hasSufficientBalance: false
    };
  }
};

/**
 * Transfer NFT from treasury (platform) to patient account
 * Includes automatic token association and account funding if needed
 */
export const transferNFTToPatient = async (userId, tokenId, serial) => {
  const client = getPlatformHederaClient();
  const treasuryId = process.env.OPERATOR_ID;

  try {
    // Get patient's Hedera account
    const user = await User.findById(userId).select('+hederaPrivateKey');

    if (!user || !user.hederaAccountId) {
      throw new Error('Patient does not have a Hedera account');
    }

    const patientAccountId = user.hederaAccountId;
    console.log(`[NFT Transfer] Transferring NFT ${tokenId}/${serial} to patient ${patientAccountId}...`);

    // Step 1: Check patient's balance and fund if needed
    const balanceCheck = await checkAccountBalance(patientAccountId);
    if (!balanceCheck.hasSufficientBalance) {
      console.log(`[NFT Transfer] Patient account has low balance (${balanceCheck.hbar} HBAR), funding with 10 HBAR...`);
      await fundAccount(patientAccountId, 10);
    }

    // Step 2: Associate token with patient account (if not already associated)
    try {
      // Parse patient's private key
      let patientKey;
      try {
        patientKey = PrivateKey.fromStringDer(user.hederaPrivateKey);
      } catch (e) {
        patientKey = PrivateKey.fromString(user.hederaPrivateKey);
      }

      console.log(`[NFT Transfer] Associating token ${tokenId} with patient account...`);

      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(patientAccountId)
        .setTokenIds([tokenId])
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

      // Sign with patient's key
      const signedAssociateTx = await associateTx.sign(patientKey);

      const associateResponse = await signedAssociateTx.execute(client);
      await associateResponse.getReceipt(client);

      console.log(`[NFT Transfer] Token association successful`);
    } catch (associateError) {
      // If already associated, this will fail - that's okay
      if (associateError.status && associateError.status._code === 173) { // TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT
        console.log(`[NFT Transfer] Token already associated with patient account`);
      } else {
        console.log(`[NFT Transfer] Token association failed (may already be associated):`, associateError.message);
      }
    }

    // Step 3: Transfer the NFT from treasury to patient
    console.log(`[NFT Transfer] Transferring NFT ownership...`);

    const transferTx = await new TransferTransaction()
      .addNftTransfer(tokenId, serial, treasuryId, patientAccountId)
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);

    const transferReceipt = await transferTx.getReceipt(client);

    console.log(`[NFT Transfer] Successfully transferred NFT ${tokenId}/${serial} to ${patientAccountId}`);
    console.log(`[NFT Transfer] Transfer transaction ID: ${transferTx.transactionId.toString()}`);

    return {
      success: true,
      nftId: `${tokenId}/${serial}`,
      tokenId: tokenId.toString(),
      serial,
      recipientAccountId: patientAccountId,
      transferTransactionId: transferTx.transactionId.toString(),
      funded: !balanceCheck.hasSufficientBalance
    };
  } catch (error) {
    console.error(`[NFT Transfer] Failed to transfer NFT to patient:`, error);
    throw error;
  }
};
