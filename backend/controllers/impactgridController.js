import mongoose from 'mongoose';
import Campaign from '../models/campaignModel.js';
import { User } from '../models/userModel.js';
import { hcsLog } from '../utils/hcsLogger.js';
import createError from 'http-errors';

// @desc    Get all campaigns for user's organization
// @route   GET /api/impact/campaigns
// @access  Private
export const getCampaigns = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, category, limit = 10, offset = 0 } = req.query;

    let query = { creator: userId };

    if (status) query.status = status;
    if (category) query.category = category;

    const campaigns = await Campaign.find(query)
      .populate('creator', 'firstName lastName email organization')
      .populate('participants.userId', 'firstName lastName email role hederaAccountId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Campaign.countDocuments(query);

    // Log access
    await hcsLog(req.hederaClient, 'CAMPAIGNS_ACCESSED', userId, {
      totalCampaigns: total,
      filters: { status, category }
    });

    res.json({
      data: campaigns,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get campaign by ID
// @route   GET /api/impact/campaigns/:id
// @access  Private
export const getCampaignById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const campaign = await Campaign.findById(id)
      .populate('creator', 'firstName lastName email organization')
      .populate('participants.userId', 'firstName lastName email role hederaAccountId')
      .populate('documents.uploadedBy', 'firstName lastName')
      .populate('reports.generatedBy', 'firstName lastName');

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    // Check access permissions (creator or collaborator)
    if (campaign.creator._id.toString() !== userId && !campaign.collaborators.some(c => c.contact === req.user.email)) {
      throw createError(403, 'Access denied to this campaign');
    }

    // Log campaign access
    await hcsLog(req.hederaClient, 'CAMPAIGN_VIEWED', campaign._id.toString(), {
      viewedBy: userId,
      campaignTitle: campaign.title
    });

    res.json({ campaign });

  } catch (err) {
    next(err);
  }
};

// @desc    Create new campaign
// @route   POST /api/impact/campaigns
// @access  Private (NGO only)
export const createCampaign = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user is NGO
    if (req.user.role !== 'NGO') {
      throw createError(403, 'Only NGO users can create campaigns');
    }

    const {
      title,
      description,
      location,
      category,
      targetBeneficiaries,
      budget,
      startDate,
      endDate,
      milestones,
      grantInfo,
      collaborators
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      throw createError(400, 'Start date must be before end date');
    }

    // Get user's organization
    const user = await User.findById(userId);

    const campaign = await Campaign.create({
      title,
      description,
      creator: userId,
      organization: user.organization || 'Unknown Organization',
      location,
      category,
      targetBeneficiaries,
      budget: {
        total: budget.total,
        currency: budget.currency || 'USD'
      },
      startDate,
      endDate,
      milestones: milestones || [],
      grantInfo,
      collaborators: collaborators || []
    });

    await campaign.populate('creator', 'firstName lastName email organization');

    // Log campaign creation
    const hcsResult = await hcsLog(req.hederaClient, 'CAMPAIGN_CREATED', campaign._id.toString(), {
      title: campaign.title,
      category: campaign.category,
      targetBeneficiaries: campaign.targetBeneficiaries,
      budget: campaign.budget.total,
      creator: userId
    });

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign,
      hcsTransactionId: hcsResult.transactionId,
      hcsTopicId: hcsResult.topicId
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update campaign
// @route   PUT /api/impact/campaigns/:id
// @access  Private
export const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    // Check ownership
    if (campaign.creator.toString() !== userId) {
      throw createError(403, 'Only campaign creator can update it');
    }

    // Don't allow updates to completed campaigns
    if (campaign.status === 'completed') {
      throw createError(400, 'Cannot update completed campaigns');
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('creator', 'firstName lastName email organization');

    // Log campaign update
    await hcsLog(req.hederaClient, 'CAMPAIGN_UPDATED', campaign._id.toString(), {
      updatedBy: userId,
      changes: Object.keys(req.body)
    });

    res.json({
      message: 'Campaign updated successfully',
      campaign: updatedCampaign
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update campaign status
// @route   PUT /api/impact/campaigns/:id/status
// @access  Private
export const updateCampaignStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['draft', 'active', 'paused', 'completed', 'cancelled'].includes(status)) {
      throw createError(400, 'Invalid status');
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    if (campaign.creator.toString() !== userId) {
      throw createError(403, 'Only campaign creator can update status');
    }

    campaign.status = status;
    await campaign.save();

    // Log status change
    await hcsLog(req.hederaClient, 'CAMPAIGN_STATUS_CHANGED', campaign._id.toString(), {
      newStatus: status,
      changedBy: userId,
      campaignTitle: campaign.title
    });

    res.json({
      message: 'Campaign status updated successfully',
      campaign
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Add milestone to campaign
// @route   POST /api/impact/campaigns/:id/milestones
// @access  Private
export const addMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, targetDate } = req.body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    if (campaign.creator.toString() !== userId) {
      throw createError(403, 'Only campaign creator can add milestones');
    }

    campaign.milestones.push({
      title,
      description,
      targetDate
    });

    await campaign.save();

    // Log milestone addition
    await hcsLog(req.hederaClient, 'MILESTONE_ADDED', campaign._id.toString(), {
      milestoneTitle: title,
      addedBy: userId
    });

    res.json({
      message: 'Milestone added successfully',
      campaign
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Mark milestone as completed
// @route   PUT /api/impact/campaigns/:id/milestones/:milestoneId/complete
// @access  Private
export const completeMilestone = async (req, res, next) => {
  try {
    const { id, milestoneId } = req.params;
    const userId = req.user.id;
    const { impact } = req.body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    if (campaign.creator.toString() !== userId) {
      throw createError(403, 'Only campaign creator can complete milestones');
    }

    const milestone = campaign.milestones.id(milestoneId);
    if (!milestone) {
      throw createError(404, 'Milestone not found');
    }

    milestone.completed = true;
    milestone.completedAt = new Date();
    if (impact) {
      milestone.impact = impact;

      // Update campaign impact totals
      if (impact.beneficiariesReached) {
        campaign.impact.totalBeneficiariesReached += impact.beneficiariesReached;
        campaign.currentBeneficiaries += impact.beneficiariesReached;
      }
      if (impact.tokensDistributed) {
        campaign.impact.totalTokensDistributed += impact.tokensDistributed;
      }
    }

    await campaign.save();

    // Log milestone completion
    await hcsLog(req.hederaClient, 'MILESTONE_COMPLETED', campaign._id.toString(), {
      milestoneTitle: milestone.title,
      completedBy: userId,
      impact
    });

    res.json({
      message: 'Milestone marked as completed',
      campaign
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Generate impact report
// @route   POST /api/impact/campaigns/:id/reports
// @access  Private
export const generateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, period, content, metrics } = req.body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    if (campaign.creator.toString() !== userId) {
      throw createError(403, 'Only campaign creator can generate reports');
    }

    campaign.reports.push({
      title,
      period,
      content,
      metrics,
      generatedBy: userId
    });

    await campaign.save();

    // Log report generation
    await hcsLog(req.hederaClient, 'IMPACT_REPORT_GENERATED', campaign._id.toString(), {
      reportTitle: title,
      period,
      generatedBy: userId
    });

    res.json({
      message: 'Impact report generated successfully',
      campaign
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get campaign analytics
// @route   GET /api/impact/analytics
// @access  Private
export const getCampaignAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalCampaigns = await Campaign.countDocuments({ creator: userId });
    const activeCampaigns = await Campaign.countDocuments({ creator: userId, status: 'active' });
    const completedCampaigns = await Campaign.countDocuments({ creator: userId, status: 'completed' });

    // Get aggregate statistics
    const aggregateStats = await Campaign.aggregate([
      { $match: { creator: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalBeneficiaries: { $sum: '$impact.totalBeneficiariesReached' },
          totalTokensDistributed: { $sum: '$rewardConfig.rewardsDistributed' },
          totalBudget: { $sum: '$budget.total' },
          totalSpent: { $sum: '$budget.spent' },
          avgImpactScore: { $avg: '$impact.impactScore' },
          totalParticipants: { $sum: { $size: '$participants' } }
        }
      }
    ]);

    const stats = aggregateStats[0] || {
      totalBeneficiaries: 0,
      totalTokensDistributed: 0,
      totalBudget: 0,
      totalSpent: 0,
      avgImpactScore: 0,
      totalParticipants: 0
    };

    // Get campaigns by category
    const campaignsByCategory = await Campaign.aggregate([
      { $match: { creator: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Log analytics access
    await hcsLog(req.hederaClient, 'ANALYTICS_ACCESSED', userId, {
      totalCampaigns,
      activeCampaigns
    });

    res.json({
      overview: {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        ...stats
      },
      campaignsByCategory
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get all available campaigns for participation (public view)
// @route   GET /api/impact/campaigns/available
// @access  Private
export const getAvailableCampaigns = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, location, limit = 20, offset = 0 } = req.query;

    let query = {
      status: 'active',
      endDate: { $gte: new Date() } // Only ongoing campaigns
    };

    if (category) query.category = category;
    if (location) {
      query.$or = [
        { 'location.country': location },
        { 'location.state': location },
        { 'location.city': location }
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate('creator', 'firstName lastName email organization')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // Add participation status for current user
    const campaignsWithStatus = campaigns.map(campaign => {
      const isParticipant = campaign.participants.some(
        p => p.userId.toString() === userId
      );
      return {
        ...campaign.toObject(),
        userParticipating: isParticipant,
        participantCount: campaign.participants.length
      };
    });

    const total = await Campaign.countDocuments(query);

    res.json({
      data: campaignsWithStatus,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Join a campaign as participant
// @route   POST /api/impact/campaigns/:id/join
// @access  Private (Patient, Doctor)
export const joinCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { contributionDescription } = req.body;

    // Only patients and doctors can participate
    if (!['PATIENT', 'DOCTOR'].includes(req.user.role)) {
      throw createError(403, 'Only patients and doctors can participate in campaigns');
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    if (campaign.status !== 'active') {
      throw createError(400, 'Campaign is not active');
    }

    if (new Date() > new Date(campaign.endDate)) {
      throw createError(400, 'Campaign has ended');
    }

    // Check if already participating
    const alreadyParticipating = campaign.participants.some(
      p => p.userId.toString() === userId
    );

    if (alreadyParticipating) {
      throw createError(400, 'You are already participating in this campaign');
    }

    // Add participant
    campaign.participants.push({
      userId,
      contribution: {
        description: contributionDescription || 'Joined campaign'
      }
    });

    await campaign.save();
    await campaign.populate('participants.userId', 'firstName lastName email role hederaAccountId');

    // Log participation
    await hcsLog(req.hederaClient, 'CAMPAIGN_JOINED', campaign._id.toString(), {
      participantId: userId,
      participantRole: req.user.role,
      campaignTitle: campaign.title
    });

    res.status(201).json({
      message: 'Successfully joined campaign',
      campaign
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Verify participant contribution
// @route   PUT /api/impact/campaigns/:id/participants/:participantId/verify
// @access  Private (Campaign creator only)
export const verifyParticipantContribution = async (req, res, next) => {
  try {
    const { id, participantId } = req.params;
    const userId = req.user.id;
    const { verificationStatus, notes } = req.body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    if (campaign.creator.toString() !== userId) {
      throw createError(403, 'Only campaign creator can verify participants');
    }

    const participant = campaign.participants.id(participantId);
    if (!participant) {
      throw createError(404, 'Participant not found');
    }

    participant.contribution.verificationStatus = verificationStatus;
    participant.contribution.verifiedAt = new Date();
    participant.contribution.verifiedBy = userId;
    if (notes) {
      participant.contribution.notes = notes;
    }

    await campaign.save();

    // Log verification
    await hcsLog(req.hederaClient, 'PARTICIPANT_VERIFIED', campaign._id.toString(), {
      participantId: participant.userId,
      verificationStatus,
      verifiedBy: userId
    });

    res.json({
      message: 'Participant contribution verified',
      campaign
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Distribute rewards to campaign participants
// @route   POST /api/impact/campaigns/:id/distribute-rewards
// @access  Private (Campaign creator only)
export const distributeRewards = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const campaign = await Campaign.findById(id)
      .populate('participants.userId', 'firstName lastName email hederaAccountId');

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    if (campaign.creator.toString() !== userId) {
      throw createError(403, 'Only campaign creator can distribute rewards');
    }

    if (campaign.rewardConfig.rewardType === 'none') {
      throw createError(400, 'This campaign has no rewards configured');
    }

    // Get verified participants who haven't received rewards
    const eligibleParticipants = campaign.participants.filter(
      p => p.contribution.verificationStatus === 'verified' && !p.reward.distributed
    );

    if (eligibleParticipants.length === 0) {
      throw createError(400, 'No eligible participants for reward distribution');
    }

    // Import token service
    const {
      batchDistributeRewards,
      transferHbarReward,
      transferCampaignTokens
    } = await import('../utils/hederaTokenService.js');

    const participantsToReward = eligibleParticipants.map(p => ({
      userId: p.userId._id,
      accountId: p.userId.hederaAccountId,
      amount: campaign.rewardConfig.rewardPerParticipant
    }));

    // Distribute rewards
    const result = await batchDistributeRewards({
      campaignId: campaign._id.toString(),
      participants: participantsToReward,
      rewardType: campaign.rewardConfig.rewardType,
      tokenId: campaign.rewardConfig.tokenId
    });

    // Update participant records with distribution info
    for (const participantResult of result.results) {
      if (participantResult.success) {
        const participant = campaign.participants.find(
          p => p.userId._id.toString() === participantResult.participantId.toString()
        );

        if (participant) {
          participant.reward.amount = campaign.rewardConfig.rewardPerParticipant;
          participant.reward.tokenType = campaign.rewardConfig.rewardType;
          participant.reward.tokenId = campaign.rewardConfig.tokenId;
          participant.reward.distributed = true;
          participant.reward.distributedAt = new Date();
          participant.reward.hederaTransactionId = participantResult.transactionId;

          campaign.rewardConfig.rewardsDistributed += campaign.rewardConfig.rewardPerParticipant;
          campaign.impact.totalTokensDistributed += campaign.rewardConfig.rewardPerParticipant;
        }
      }
    }

    await campaign.save();

    // Log reward distribution
    await hcsLog(req.hederaClient, 'REWARDS_DISTRIBUTED', campaign._id.toString(), {
      totalParticipants: result.totalParticipants,
      successCount: result.successCount,
      failCount: result.failCount,
      totalAmount: result.successCount * campaign.rewardConfig.rewardPerParticipant
    });

    res.json({
      message: 'Rewards distributed successfully',
      distribution: {
        totalParticipants: result.totalParticipants,
        successCount: result.successCount,
        failCount: result.failCount,
        totalDistributed: result.successCount * campaign.rewardConfig.rewardPerParticipant
      },
      results: result.results
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Create campaign token (HTS)
// @route   POST /api/impact/campaigns/:id/create-token
// @access  Private (Campaign creator only)
export const createCampaignToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { tokenName, tokenSymbol, initialSupply, rewardPerParticipant } = req.body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw createError(404, 'Campaign not found');
    }

    if (campaign.creator.toString() !== userId) {
      throw createError(403, 'Only campaign creator can create campaign tokens');
    }

    if (campaign.rewardConfig.tokenId) {
      throw createError(400, 'Campaign already has a token created');
    }

    // Import token service
    const { createCampaignToken: createToken } = await import('../utils/hederaTokenService.js');

    // Create the token
    const tokenResult = await createToken({
      name: tokenName,
      symbol: tokenSymbol,
      initialSupply: initialSupply || 10000,
      decimals: 2
    });

    if (!tokenResult.success) {
      throw createError(500, `Failed to create token: ${tokenResult.error}`);
    }

    // Update campaign with token info
    campaign.rewardConfig.rewardType = 'hts-token';
    campaign.rewardConfig.tokenId = tokenResult.tokenId;
    campaign.rewardConfig.tokenSymbol = tokenResult.tokenSymbol;
    campaign.rewardConfig.tokenName = tokenResult.tokenName;
    campaign.rewardConfig.totalRewardPool = tokenResult.initialSupply;
    campaign.rewardConfig.rewardPerParticipant = rewardPerParticipant || 100;

    await campaign.save();

    // Log token creation
    const hcsResult = await hcsLog(req.hederaClient, 'CAMPAIGN_TOKEN_CREATED', campaign._id.toString(), {
      tokenId: tokenResult.tokenId,
      tokenSymbol: tokenResult.tokenSymbol,
      initialSupply: tokenResult.initialSupply,
      hederaTransactionId: tokenResult.transactionId
    });

    res.status(201).json({
      message: 'Campaign token created successfully',
      token: {
        tokenId: tokenResult.tokenId,
        tokenSymbol: tokenResult.tokenSymbol,
        tokenName: tokenResult.tokenName,
        initialSupply: tokenResult.initialSupply,
        transactionId: tokenResult.transactionId
      },
      campaign,
      hcsTransactionId: hcsResult.transactionId,
      hcsTopicId: hcsResult.topicId
    });

  } catch (err) {
    next(err);
  }
};