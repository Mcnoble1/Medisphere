import InsuranceClaim from '../models/insuranceClaimModel.js';
import { User } from '../models/userModel.js';
import { hcsLog } from '../utils/hcsLogger.js';
import createError from 'http-errors';
import { awardClaimTokens } from '../utils/carexpayService.js';

// @desc    Create a new insurance claim
// @route   POST /api/insurance/claims
// @access  Private (Patient/Doctor)
export const createClaim = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      patientId,
      providerId,
      title,
      treatmentDate,
      totalAmount,
      items,
      diagnosis,
      notes,
      attachments,
      insuranceProvider,
      policyNumber,
      groupNumber,
      relatedRecords
    } = req.body;

    // Generate unique claim number
    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Validate users exist
    const patient = await User.findById(patientId);
    const provider = await User.findById(providerId);

    if (!patient || patient.role !== 'PATIENT') {
      throw createError(400, 'Invalid patient ID');
    }

    if (!provider || !['DOCTOR', 'NGO'].includes(provider.role)) {
      throw createError(400, 'Invalid provider ID');
    }

    // Create claim
    const claim = await InsuranceClaim.create({
      patient: patientId,
      provider: providerId,
      claimNumber,
      title,
      treatmentDate,
      totalAmount,
      items: items || [],
      diagnosis,
      notes,
      attachments: attachments || [],
      insuranceProvider,
      policyNumber,
      groupNumber,
      relatedRecords: relatedRecords || []
    });

    // Log to Hedera
    await hcsLog(req.hederaClient, 'INSURANCE_CLAIM_CREATED', claim._id.toString(), {
      claimNumber,
      patientId,
      providerId,
      totalAmount,
    });

    // Populate references
    await claim.populate('patient', 'firstName lastName email');
    await claim.populate('provider', 'firstName lastName email role');

    res.status(201).json({
      message: 'Insurance claim created successfully',
      claim
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get claims for a patient
// @route   GET /api/insurance/claims/patient/:patientId
// @access  Private
export const getPatientClaims = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 20, offset = 0 } = req.query;

    // Build query
    const query = { patient: patientId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const claims = await InsuranceClaim.find(query)
      .populate('patient', 'firstName lastName email')
      .populate('provider', 'firstName lastName email role')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ submissionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await InsuranceClaim.countDocuments(query);

    res.json({
      claims,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get my claims (for patients)
// @route   GET /api/insurance/claims/my
// @access  Private (Patient only)
export const getMyClaims = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;

    if (req.user.role !== 'PATIENT') {
      throw createError(403, 'This endpoint is for patients only');
    }

    const query = { patient: patientId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const claims = await InsuranceClaim.find(query)
      .populate('provider', 'firstName lastName email role')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ submissionDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await InsuranceClaim.countDocuments(query);

    res.json({
      claims,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update claim status (for reviewers)
// @route   PUT /api/insurance/claims/:claimId/status
// @access  Private (Insurance/Government only)
export const updateClaimStatus = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { status, approvedAmount, reviewNotes } = req.body;
    const reviewerId = req.user.id;

    // Only insurance and government users can review claims
    if (!['GOVERNMENT', 'NGO'].includes(req.user.role)) {
      throw createError(403, 'Only authorized reviewers can update claim status');
    }

    const claim = await InsuranceClaim.findById(claimId);
    if (!claim) {
      throw createError(404, 'Claim not found');
    }

    // Update claim
    claim.status = status;
    claim.reviewedBy = reviewerId;
    claim.reviewedAt = new Date();
    claim.reviewNotes = reviewNotes;

    if (status === 'approved' && approvedAmount !== undefined) {
      claim.approvedAmount = approvedAmount;

      // Update individual items if provided
      if (req.body.items) {
        claim.items = req.body.items;
      }
    }

    await claim.save();

    // Award tokens to patient when claim is approved
    if (status === 'approved' && approvedAmount > 0) {
      // Calculate token reward (10% of approved amount as health tokens)
      const tokenReward = Math.floor(approvedAmount * 0.1);

      if (tokenReward > 0) {
        await awardClaimTokens(claim.patient.toString(), tokenReward, claim._id.toString());
      }
    }

    // Log status change
    await hcsLog(req.hederaClient, 'CLAIM_STATUS_UPDATED', claim._id.toString(), {
      claimNumber: claim.claimNumber,
      newStatus: status,
      reviewerId,
      approvedAmount,
    });

    await claim.populate('patient', 'firstName lastName email');
    await claim.populate('provider', 'firstName lastName email role');
    await claim.populate('reviewedBy', 'firstName lastName email');

    res.json({
      message: 'Claim status updated successfully',
      claim
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get claim statistics
// @route   GET /api/insurance/claims/stats
// @access  Private
export const getClaimStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let matchQuery = {};

    // Adjust query based on user role
    if (req.user.role === 'PATIENT') {
      matchQuery.patient = userId;
    } else if (req.user.role === 'DOCTOR') {
      matchQuery.provider = userId;
    }

    const stats = await InsuranceClaim.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          approvedAmount: { $sum: '$approvedAmount' }
        }
      }
    ]);

    const totalClaims = await InsuranceClaim.countDocuments(matchQuery);
    const totalValue = await InsuranceClaim.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, approved: { $sum: '$approvedAmount' } } }
    ]);

    res.json({
      totalClaims,
      totalValue: totalValue[0] || { total: 0, approved: 0 },
      byStatus: stats
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get claim by ID
// @route   GET /api/insurance/claims/:claimId
// @access  Private
export const getClaimById = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    const claim = await InsuranceClaim.findById(claimId)
      .populate('patient', 'firstName lastName email')
      .populate('provider', 'firstName lastName email role')
      .populate('reviewedBy', 'firstName lastName email')
      .populate('relatedRecords');

    if (!claim) {
      throw createError(404, 'Claim not found');
    }

    // Check if user has permission to view this claim
    const userId = req.user.id;
    const userRole = req.user.role;

    const hasPermission =
      claim.patient._id.toString() === userId || // Patient owns the claim
      claim.provider._id.toString() === userId || // Provider created the claim
      ['GOVERNMENT', 'NGO'].includes(userRole); // Reviewer role

    if (!hasPermission) {
      throw createError(403, 'You do not have permission to view this claim');
    }

    res.json({ claim });

  } catch (err) {
    next(err);
  }
};