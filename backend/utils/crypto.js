import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const algorithm = 'aes-256-cbc';
const ivLength = 16;

// Ensure the secret is exactly 32 bytes for AES-256
const getEncryptionKey = () => {
  const secret = process.env.ENCRYPTION_SECRET || 'ThisIsA32ByteLongSecretKey!';

  // If secret is not exactly 32 bytes, hash it to get exactly 32 bytes
  if (secret.length !== 32) {
    return crypto.createHash('sha256').update(secret).digest();
  }

  return Buffer.from(secret);
};

const encryptionKey = getEncryptionKey();

/** Encryption (already present) */
export const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (text) => {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

/** Signing helpers (new)
 *  Expects clinic private key file to exist at keys/<uuid>.priv.pem
 */
export const signPayload = (privateKeyPemPath, payload) => {
  const privPem = fs.readFileSync(privateKeyPemPath, 'utf8');
  const sign = crypto.createSign('SHA256');
  sign.update(typeof payload === 'string' ? payload : JSON.stringify(payload));
  sign.end();
  const signature = sign.sign(privPem, 'base64');
  return signature;
};

export const verifySignature = (publicKeyPemPath, payload, signature) => {
  const pubPem = fs.readFileSync(publicKeyPemPath, 'utf8');
  const verify = crypto.createVerify('SHA256');
  verify.update(typeof payload === 'string' ? payload : JSON.stringify(payload));
  verify.end();
  return verify.verify(pubPem, signature, 'base64');
};
