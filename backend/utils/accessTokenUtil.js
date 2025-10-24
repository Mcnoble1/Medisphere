import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Generate a secure access token for data sharing
 * @param {Object} payload - Token payload containing request/share information
 * @param {Date} expiresAt - Expiration date for the token
 * @returns {string} - JWT access token
 */
export function generateAccessToken(payload, expiresAt) {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  const expiresIn = Math.floor((expiresAt - Date.now()) / 1000); // seconds until expiration

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn > 0 ? expiresIn : 3600 // Default to 1 hour if invalid
  });
}

/**
 * Verify and decode an access token
 * @param {string} token - Access token to verify
 * @returns {Object} - Decoded token payload
 */
export function verifyAccessToken(token) {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error(`Invalid or expired access token: ${error.message}`);
  }
}

/**
 * Generate a unique token identifier
 * @returns {string} - Unique token ID
 */
export function generateTokenId() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create access token metadata for Hedera
 * @param {Object} params - Parameters for token metadata
 * @returns {string} - JSON string of token metadata
 */
export function createTokenMetadata({
  requestId,
  shareId,
  requester,
  owner,
  dataTypes,
  purpose,
  expiresAt
}) {
  return JSON.stringify({
    requestId: requestId?.toString(),
    shareId: shareId?.toString(),
    requester: requester?.toString(),
    owner: owner?.toString(),
    dataTypes,
    purpose,
    expiresAt: expiresAt?.toISOString(),
    createdAt: new Date().toISOString()
  });
}

/**
 * Check if a token has expired
 * @param {Date} expiryDate - Token expiry date
 * @returns {boolean} - True if expired
 */
export function isTokenExpired(expiryDate) {
  return expiryDate && new Date() > new Date(expiryDate);
}

/**
 * Calculate token expiration date
 * @param {number} durationInDays - Duration in days
 * @returns {Date} - Expiration date
 */
export function calculateExpiryDate(durationInDays) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durationInDays);
  return expiry;
}

/**
 * Validate token access
 * @param {Object} share - DataShare document
 * @param {string} ipAddress - Requester IP address
 * @returns {Object} - Validation result
 */
export function validateTokenAccess(share, ipAddress) {
  // Check if share exists and is active
  if (!share) {
    return { valid: false, reason: 'Share not found' };
  }

  if (share.status !== 'active') {
    return { valid: false, reason: `Share is ${share.status}` };
  }

  // Check expiration
  if (isTokenExpired(share.expiryDate)) {
    return { valid: false, reason: 'Token has expired' };
  }

  // Check access count limit if set
  if (share.accessRestrictions?.maxAccessCount) {
    if (share.accessCount >= share.accessRestrictions.maxAccessCount) {
      return { valid: false, reason: 'Maximum access count exceeded' };
    }
  }

  // Check IP restrictions if set
  if (share.accessRestrictions?.allowedIpAddresses?.length > 0) {
    if (!share.accessRestrictions.allowedIpAddresses.includes(ipAddress)) {
      return { valid: false, reason: 'IP address not authorized' };
    }
  }

  // Check time window restrictions if set
  if (share.accessRestrictions?.allowedTimeWindow) {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const { startTime, endTime } = share.accessRestrictions.allowedTimeWindow;

    if (startTime && endTime) {
      if (currentTime < startTime || currentTime > endTime) {
        return { valid: false, reason: 'Access outside allowed time window' };
      }
    }
  }

  return { valid: true };
}
