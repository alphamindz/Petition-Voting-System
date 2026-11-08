const { Protest, User, Vote, AdminActivity } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

/**
 * =========================================================================
 * PROMPT 8: ADMIN APIS (ROLE=ADMIN)
 * =========================================================================
 */

/**
 * @desc    List protests filtered by status (or all)
 * @route   GET /api/admin/protests
 * @access  Private (Admin only)
 */
const getAdminProtests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [protests, total] = await Promise.all([
      Protest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate('user', 'name email mobile isEmailVerified isAadhaarVerified'),
      Protest.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: protests.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      protests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update protest status with strict transition rules & audit logging
 * @route   PATCH /api/admin/protests/:id/status
 * @access  Private (Admin only)
 *
 * Enforced Transitions:
 * - pending   -> approved | rejected
 * - approved  -> published
 * - published -> closed
 */
const updateProtestStatus = async (req, res, next) => {
  try {
    const { status: targetStatus, notes = '' } = req.body;

    if (!targetStatus) {
      return next(new ApiError('Target status is required', 400));
    }

    const protest = await Protest.findById(req.params.id);
    if (!protest) {
      return next(new ApiError('Protest not found', 404));
    }

    const currentStatus = protest.status;

    // Transition validation table
    const validTransitions = {
      pending: ['approved', 'rejected'],
      approved: ['published'],
      published: ['closed'],
      rejected: [], // terminal
      closed: []   // terminal
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      return next(
        new ApiError(
          `Invalid state transition: Cannot change status from "${currentStatus}" to "${targetStatus}". Allowed next states: [${allowed.join(', ') || 'None (Terminal)'}]`,
          400
        )
      );
    }

    // Apply state change
    protest.status = targetStatus;
    await protest.save();

    // Log action in AdminActivity collection
    await AdminActivity.create({
      admin: req.user._id,
      protest: protest._id,
      action: targetStatus,
      notes: notes.trim()
    });

    res.status(200).json({
      success: true,
      message: `Protest status successfully updated from "${currentStatus}" to "${targetStatus}".`,
      protest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    List registered users with search & pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { mobile: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .select('-passwordHash'),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Block or unblock a user (toggle isActive)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return next(new ApiError('isActive must be a boolean (true or false)', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return next(new ApiError('You cannot deactivate your own administrative account.', 400));
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been ${isActive ? 'activated' : 'deactivated/blocked'}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform administrative statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalVotes,
      statusCounts,
      top5Protests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true, isEmailVerified: true, isAadhaarVerified: true }),
      Vote.countDocuments(),
      Protest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Protest.find({ status: 'published' })
        .sort({ voteCount: -1 })
        .limit(5)
        .populate('user', 'name')
    ]);

    // Format status breakdown
    const protestsByStatus = {
      pending: 0,
      approved: 0,
      published: 0,
      rejected: 0,
      closed: 0
    };
    statusCounts.forEach((s) => {
      if (protestsByStatus.hasOwnProperty(s._id)) {
        protestsByStatus[s._id] = s.count;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        fullyVerifiedUsers: activeUsers,
        totalVotes,
        protestsByStatus,
        top5Protests
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get audit activity log
 * @route   GET /api/admin/activity
 * @access  Private (Admin only)
 */
const getAdminActivity = async (req, res, next) => {
  try {
    const { page = 1, limit = 25 } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, parseInt(limit, 10));
    const skip = (pageNumber - 1) * limitNumber;

    const [activities, total] = await Promise.all([
      AdminActivity.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate('admin', 'name email')
        .populate('protest', 'title status concernedAuthority'),
      AdminActivity.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      activities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminProtests,
  updateProtestStatus,
  getAdminUsers,
  toggleUserStatus,
  getAdminStats,
  getAdminActivity
};

