import createError from 'http-errors';
import { User } from '../models/userModel.js';
import { issueJwt } from '../middlewares/auth.js';
import { hcsLog } from '../utils/hcsLogger.js';
import { createHederaAccount } from '../utils/hederaAccount.js';
// import { generateDID } from '../utils/generateDID.js'; // Removed - DID not used currently

export function makeAuthController({ client }) {
  return {
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterDto'
     *     responses:
     *       201:
     *         description: Created
     *       400:
     *         description: Validation or business error
     */
    register: async (req, res, next) => {
      try {
        // Basic payload validation is done by route-level middleware (Joi)
        const existing = await User.findOne({ email: req.body.email });
        if (existing) throw createError(400, 'Email already in use');

        // Map frontend fields to roleData structure
        let roleData = req.body.roleData || {};
        const role = req.body.role;

        // Handle frontend field mappings
        if (req.body.organization || req.body.licenseNumber || req.body.specialty) {
          if (!roleData[role]) roleData[role] = {};

          if (role === 'DOCTOR') {
            if (req.body.organization) roleData[role].organization = req.body.organization;
            if (req.body.licenseNumber) roleData[role].licenseNumber = req.body.licenseNumber;
            if (req.body.specialty) roleData[role].specialty = req.body.specialty;
          } else if (role === 'NGO' || role === 'GOVERNMENT' || role === 'PHARMA') {
            if (req.body.organization) roleData[role].organization = req.body.organization;
            if (req.body.licenseNumber) roleData[role].licenseNumber = req.body.licenseNumber;
          }
        }

        // Create Hedera account for the user
        let hederaAccount = null;
        try {
          hederaAccount = await createHederaAccount();
          console.log(`Created Hedera account ${hederaAccount.accountId} for user ${req.body.email}`);
        } catch (hederaError) {
          console.error('Failed to create Hedera account:', hederaError);
          // Continue with registration but log the error
        }

        const user = await User.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          country: req.body.country,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role,
          roleData: roleData,
          hederaAccountId: hederaAccount?.accountId,
          hederaPrivateKey: hederaAccount?.privateKey
        });

        await user.save();

        // Audit log to HCS using user's account
        await hcsLog(user._id.toString(), 'USER_REGISTERED', user._id.toString(), {
          email: user.email,
          role: user.role,
          hederaAccountId: user.hederaAccountId
        });

        const token = await issueJwt(user);
        res.status(201).json({
          message: 'Registration successful',
          token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            hederaAccountId: user.hederaAccountId
          }
        });
      } catch (err) { next(err); }
    },

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Login with email & password
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginDto'
     *     responses:
     *       200:
     *         description: OK
     *       401:
     *         description: Invalid credentials
     */
    login: async (req, res, next) => {
      try {
        const user = await User.findOne({ email: req.body.email }).select('+password');
        if (!user) throw createError(401, 'Invalid credentials');
        const ok = await user.comparePassword(req.body.password);
        if (!ok) throw createError(401, 'Invalid credentials');

        user.lastLoginAt = new Date();
        await user.save();

        await hcsLog(user._id.toString(), 'USER_LOGGED_IN', user._id.toString(), { email: user.email });

        const token = await issueJwt(user);
        res.json({ token, user: { id: user._id, email: user.email, role: user.role, hederaAccountId: user.hederaAccountId } });
      } catch (err) { next(err); }
    },

    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Get current user profile
     *     security:
     *       - bearerAuth: []
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: OK
     */
    me: async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);
        if (!user) throw createError(404, 'User not found');
        res.json({ id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, hederaAccountId: user.hederaAccountId });
      } catch (err) { next(err); }
    },

    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: Logout current user
     *     security:
     *       - bearerAuth: []
     *     tags: [Auth]
     *     responses:
     *       200:
     *         description: Logout successful
     */
    logout: async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);
        if (!user) throw createError(404, 'User not found');

        await hcsLog(user._id.toString(), 'USER_LOGGED_OUT', user._id.toString(), { email: user.email });

        res.json({ message: 'Logout successful' });
      } catch (err) { next(err); }
    }
  };
}