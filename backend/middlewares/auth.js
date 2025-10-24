import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

export function authenticate(req, _res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return next(createError(401, 'Missing token'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch (err) {
    next(createError(401, 'Invalid or expired token'));
  }
}

export function authorizeRoles(...allowed) {
  return (req, _res, next) => {
    if (!req.user) return next(createError(401, 'Authentication required'));
    if (!allowed.includes(req.user.role)) {
      return next(createError(403, 'Forbidden - insufficient permissions for this role'));
    }
    next();
  };
}

// Middleware to check if user has the exact role required
export function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user) return next(createError(401, 'Authentication required'));
    if (req.user.role !== role) {
      return next(createError(403, `Access denied. This resource is only accessible to ${role} users.`));
    }
    next();
  };
}

export async function issueJwt(user) {
  const payload = { id: user._id.toString(), role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return token;
}

export const authMiddleware = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check for both 'id' and 'userId' for backwards compatibility
    const userId = decoded.id || decoded.userId;
    if (!decoded || !userId) return res.status(401).json({ message: 'Invalid token' });
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    console.error('auth middleware error', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

