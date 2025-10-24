import { User } from '../models/userModel.js';
import { hcsLog } from '../utils/hcsLogger.js';
import createError from 'http-errors';

// @desc    Get current user details
// @route   GET /api/user/profile
// @access  Private
export const getUserDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw createError(404, 'User not found');
    }

    // Log profile access
    await hcsLog(req.hederaClient, 'USER_PROFILE_ACCESSED', userId, {
      email: user.email,
      role: user.role
    });

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        role: user.role,
        roleData: user.roleData,
        hederaAccountId: user.hederaAccountId,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update user details
// @route   PUT /api/user/profile
// @access  Private
export const updateUserDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Validate allowed updates
    const allowedUpdates = [
      'firstName',
      'lastName',
      'phoneNumber',
      'country',
      'roleData'
    ];

    const updateFields = {};

    // Only include allowed fields in the update
    for (const field of allowedUpdates) {
      if (updates[field] !== undefined) {
        updateFields[field] = updates[field];
      }
    }

    // Validate that some updates are provided
    if (Object.keys(updateFields).length === 0) {
      throw createError(400, 'No valid fields to update');
    }

    // Handle roleData updates specifically
    if (updates.roleData && req.user.role) {
      const currentUser = await User.findById(userId);
      if (!currentUser) {
        throw createError(404, 'User not found');
      }

      // Merge existing roleData with new data for the user's role
      const existingRoleData = currentUser.roleData || {};
      const userRole = req.user.role;

      updateFields.roleData = {
        ...existingRoleData,
        [userRole]: {
          ...existingRoleData[userRole],
          ...updates.roleData[userRole]
        }
      };
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    if (!updatedUser) {
      throw createError(404, 'User not found');
    }

    // Log profile update
    await hcsLog(req.hederaClient, 'USER_PROFILE_UPDATED', userId, {
      email: updatedUser.email,
      role: updatedUser.role,
      updatedFields: Object.keys(updateFields)
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        country: updatedUser.country,
        role: updatedUser.role,
        roleData: updatedUser.roleData,
        hederaAccountId: updatedUser.hederaAccountId,
        lastLoginAt: updatedUser.lastLoginAt,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update user password
// @route   PUT /api/user/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw createError(400, 'Current password and new password are required');
    }

    if (newPassword.length < 8) {
      throw createError(400, 'New password must be at least 8 characters long');
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw createError(404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw createError(400, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Log password change
    await hcsLog(req.hederaClient, 'USER_PASSWORD_CHANGED', userId, {
      email: user.email
    });

    res.json({
      message: 'Password updated successfully'
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get user profile by role-specific data
// @route   GET /api/user/profile/role-data
// @access  Private
export const getUserRoleData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw createError(404, 'User not found');
    }

    const userRole = user.role;
    const roleData = user.roleData?.[userRole] || {};

    res.json({
      role: userRole,
      roleData: roleData,
      verificationStatus: roleData.verificationStatus || 'pending'
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update user role-specific data
// @route   PUT /api/user/profile/role-data
// @access  Private
export const updateUserRoleData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, 'User not found');
    }

    const userRole = user.role;

    // Get existing roleData - convert Mongoose document to plain object
    const existingRoleData = user.roleData ? user.roleData.toObject() : {};

    // Update only the data for the user's role
    const updatedRoleData = {
      ...existingRoleData,
      [userRole]: {
        ...existingRoleData[userRole],
        ...updates
      }
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { roleData: updatedRoleData } },
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    // Log role data update
    await hcsLog(req.hederaClient, 'USER_ROLE_DATA_UPDATED', userId, {
      email: updatedUser.email,
      role: userRole,
      updatedFields: Object.keys(updates)
    });

    res.json({
      message: 'Role-specific data updated successfully',
      role: userRole,
      roleData: updatedUser.roleData[userRole],
      verificationStatus: updatedUser.roleData[userRole]?.verificationStatus || 'pending'
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get list of insurers
// @route   GET /api/user/insurers
// @access  Private
export const getInsurers = async (req, res, next) => {
  try {
    // Query for users with INSURER role
    const insurers = await User.find({ role: 'INSURER' })
      .select('_id firstName lastName email hederaAccountId roleData')
      .limit(50);

    res.json({
      insurers: insurers.map(insurer => ({
        _id: insurer._id,
        name: insurer.roleData?.INSURER?.companyName || `${insurer.firstName} ${insurer.lastName}`,
        email: insurer.email,
        hederaAccountId: insurer.hederaAccountId,
        companyName: insurer.roleData?.INSURER?.companyName,
        insuranceType: insurer.roleData?.INSURER?.insuranceType
      }))
    });

  } catch (err) {
    next(err);
  }
};