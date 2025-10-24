import { PinataSDK } from "pinata-web3";

// Initialize Pinata client
let pinataClient = null;

function getPinataClient() {
  if (!pinataClient) {
    const jwt = process.env.PINATA_JWT;
    const gateway = process.env.PINATA_GATEWAY;
    if (!jwt) {
      console.warn('[IPFS] Pinata JWT not configured, IPFS functionality disabled');
      return null;
    }

    pinataClient = new PinataSDK({
      pinataJwt: jwt,
      pinataGateway: gateway
    });
  }

  return pinataClient;
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param {Object} data - JSON object to upload
 * @param {string} name - Name for the pinned file
 * @returns {Promise<{cid: string, url: string}>} IPFS CID and gateway URL
 */
export async function uploadJsonToIPFS(data, name) {
  const client = getPinataClient();

  if (!client) {
    console.warn('[IPFS] Client not available, skipping IPFS upload');
    return { cid: null, url: null };
  }

  try {
    const result = await client.upload.json(data, {
      metadata: {
        name: name || `medisphere-record-${Date.now()}`
      }
    });

    const gateway = process.env.PINATA_GATEWAY || 'gateway.pinata.cloud';
    const url = `https://${gateway}/ipfs/${result.IpfsHash}`;

    console.log(`[IPFS] Uploaded to IPFS: ${result.IpfsHash}`);

    return {
      cid: result.IpfsHash,
      url
    };
  } catch (error) {
    console.error('[IPFS] Upload failed:', error.message);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

/**
 * Upload file buffer to IPFS via Pinata
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {string} filename - Original filename
 * @returns {Promise<{cid: string, url: string}>} IPFS CID and gateway URL
 */
export async function uploadFileToIPFS(fileBuffer, filename) {
  const client = getPinataClient();

  if (!client) {
    console.warn('[IPFS] Client not available, skipping IPFS upload');
    return { cid: null, url: null };
  }

  try {
    // Convert buffer to File object
    const file = new File([fileBuffer], filename, {
      type: 'application/octet-stream'
    });

    const result = await client.upload.file(file);

    const gateway = process.env.PINATA_GATEWAY || 'gateway.pinata.cloud';
    const url = `https://${gateway}/ipfs/${result.IpfsHash}`;

    console.log(`[IPFS] Uploaded file to IPFS: ${result.IpfsHash}`);

    return {
      cid: result.IpfsHash,
      url
    };
  } catch (error) {
    console.error('[IPFS] File upload failed:', error.message);
    throw new Error(`IPFS file upload failed: ${error.message}`);
  }
}

/**
 * Retrieve data from IPFS using CID
 * @param {string} cid - IPFS Content Identifier
 * @returns {Promise<Object>} Retrieved data
 */
export async function getFromIPFS(cid) {
  const client = getPinataClient();

  if (!client) {
    throw new Error('IPFS client not available');
  }

  try {
    const gateway = process.env.PINATA_GATEWAY || 'gateway.pinata.cloud';
    const url = `https://${gateway}/ipfs/${cid}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[IPFS] Retrieval failed:', error.message);
    throw new Error(`IPFS retrieval failed: ${error.message}`);
  }
}

export { getPinataClient };
