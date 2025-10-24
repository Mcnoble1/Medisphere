// Simple KMS abstraction. Replace internals with HashiCorp Vault / AWS KMS / Azure KeyVault integration.

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const LOCAL_KEY_PATH = path.resolve(process.env.LOCAL_KMS_KEY_PATH || 'keys/server.signing.key.pem');

/**
 * getSigningKey()
 * - For MVP we read a PEM from disk (generated once).
 * - Replace with secure KMS calls in prod.
 */
export const getSigningKeyPEM = async () => {
  if (process.env.USE_REAL_KMS === 'true') {
    // TODO: integrate with real KMS provider (Vault/AWS KMS)
    throw new Error('Real KMS integration not implemented. Set USE_REAL_KMS=false for local dev.');
  }

  if (!fs.existsSync(LOCAL_KEY_PATH)) {
    throw new Error(`Local signing key not found at ${LOCAL_KEY_PATH}. Generate and place a PEM key.`);
  }

  return fs.readFileSync(LOCAL_KEY_PATH, 'utf8');
};
