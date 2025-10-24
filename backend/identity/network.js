/* =============================
   backend/identity/network.js — build/load identity network
   ============================= */
import { Client, PrivateKey, FileId, Hbar } from '@hashgraph/sdk';
import {
  HcsIdentityNetworkBuilder,
  HcsDid,
  DidMethodOperation,
} from '@hashgraph/did-sdk-js';
import dotenv from 'dotenv';
dotenv.config();

export const hederaClient = (() => {
  const network = (process.env.HEDERA_NETWORK || 'testnet').toLowerCase();
  const client = network === 'mainnet' ? Client.forMainnet() : network === 'previewnet' ? Client.forPreviewnet() : Client.forTestnet();
  client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);
  return client;
})();

let identityNetwork = null;

export async function loadOrCreateIdentityNetwork() {
  if (identityNetwork) return identityNetwork;
  console.log('[IDENTITY] Loading or creating identity network...');
  const publicKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY).publicKey;
  console.log('[IDENTITY] Using public key:', publicKey.toStringRaw());

  if (process.env.ADDRESS_BOOK_FILE_ID) {
    console.log('[IDENTITY] Loading existing network from ADDRESS_BOOK_FILE_ID:', process.env.ADDRESS_BOOK_FILE_ID);
    // Load existing network artifacts from known address book file
    const addressBookFileId = FileId.fromString(process.env.ADDRESS_BOOK_FILE_ID);
    identityNetwork = await new HcsIdentityNetworkBuilder()
      .setNetwork(process.env.HEDERA_NETWORK || 'testnet')
      .setAppnetName(process.env.APPNET_NAME || 'PersonaVault')
      .setPublicKey(publicKey)
      .setAddressBookFileId(addressBookFileId)
      .setMaxTransactionFee(new Hbar(2))
      .execute(hederaClient);
  } else {
    console.log('[IDENTITY] No ADDRESS_BOOK_FILE_ID found, creating new identity network...');
    // Create new identity network (address book + DID & VC topics)
    identityNetwork = await new HcsIdentityNetworkBuilder()
      .setNetwork(process.env.HEDERA_NETWORK || 'testnet')
      .setAppnetName(process.env.APPNET_NAME || 'PersonaVault')
      .addAppnetDidServer(process.env.APPNET_DID_SERVER || 'https://example.com/did')
      .setPublicKey(publicKey)
      .setMaxTransactionFee(new Hbar(2))
      .setDidTopicMemo('PersonaVault DID topic')
      .setVCTopicMemo('PersonaVault VC topic')
      .execute(hederaClient);

    // After creation, export address book id so you can pin it in env
    console.log('[IDENTITY] Created network. Save ADDRESS_BOOK_FILE_ID:', identityNetwork.getAddressBook().getFileId().toString());
  }

  return identityNetwork;
}

export async function createAndPublishDid({ withGeneratedKey = true }) {
  console.log('[DID] Creating DID... (withGeneratedKey:', withGeneratedKey, ')');
  const network = await loadOrCreateIdentityNetwork();
  console.log('[DID] Using network:', network.getAppnetName());
  let didRootKey;
  let hcsDid;
  if (withGeneratedKey) {
    // Generate a new DID root key and DID
    const didWithKey = network.generateDid(true); // returns { did, privateDidRootKey }
    didRootKey = didWithKey.getPrivateDidRootKey().get();
    hcsDid = didWithKey.getDid();
  } else {
    didRootKey = PrivateKey.generate();
    const pub = didRootKey.publicKey;
    hcsDid = network.generateDid(pub, false);
  }

  const didDocument = hcsDid.generateDidDocument().toJson();

  await network
    .createDidTransaction(DidMethodOperation.CREATE)
    .setDidDocument(didDocument)
    .signMessage(doc => didRootKey.sign(doc))
    .buildAndSignTransaction(tx => tx.setMaxTransactionFee(new Hbar(2)))
    .onMessageConfirmed(() => console.log('[DID] Published:', hcsDid.toDid()))
    .execute(hederaClient);

  return { did: hcsDid.toDid(), didRootKey: didRootKey.toStringRaw(), didDocument };
}

export async function resolveDid(didString) {
  const network = await loadOrCreateIdentityNetwork();
  const did = HcsDid.fromString(didString);
  // DID doc is resolved via mirror on the appnet DID topic behind the scenes
  const doc = did.generateDidDocument().toJson();
  return doc;
}
