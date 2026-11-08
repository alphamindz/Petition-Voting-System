const { validationResult } = require('express-validator');
const { Protest, Vote, Notification, User } = require('../models');
const { sendAdminProtestNotification } = require('../utils/sendEmail');
const { ApiError } = require('../middleware/errorHandler');

/**
 * =========================================================================
 * PROMPT 6: PROTEST / PETITION APIS
 * =========================================================================
 */

/**
 * @desc    Create a new civic protest (status: "pending", notifies admin)
 * @route   POST /api/protests
 * @access  Private (Verified user only)
 */
const createProtest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => e.msg).join('. ');
      return next(new ApiError(messages, 400));
    }

    const { title, description, concernedAuthority, supportingInfo } = req.body;

    // 1. Create protest with pending status
    const protest = await Protest.create({
      user: req.user._id,
      title: title.trim(),
      description: description.trim(),
      concernedAuthority: concernedAuthority.trim(),
      supportingInfo: supportingInfo || '',
      status: 'pending',
      voteCount: 0
    });

    // 2. Dispatch email notification to ADMIN_EMAIL via Nodemailer
    const emailResult = await sendAdminProtestNotification(protest, req.user);

    // 3. Save Notification record
    await Notification.create({
      recipient: process.env.ADMIN_EMAIL || 'admin@petitionsystem.org',
      protest: protest._id,
      status: emailResult.success ? 'sent' : 'failed',
      message: `New protest "${protest.title}" submitted by ${req.user.name}`
    });

    res.status(201).json({
      success: true,
      message: 'Protest created successfully. It is now awaiting administrative review.',
      protest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public list of ONLY "published" protests (search, filter, sort, pagination)
 * @route   GET /api/protests
 * @access  Public
 */
const getPublishedProtests = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      q,
      authority,
      sort = 'latest'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    // Filter strictly to ONLY "published" protests
    const query = { status: 'published' };

    // Search filter (keyword in title or description)
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filter by concerned authority
    if (authority && authority.trim()) {
      query.concernedAuthority = new RegExp(authority.trim(), 'i');
    }

    // Sorting
    let sortCriteria = { createdAt: -1 };
    if (sort === 'most-voted') {
      sortCriteria = { voteCount: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortCriteria = { createdAt: 1 };
    }

    const [protests, total] = await Promise.all([
      Protest.find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNumber)
        .populate('user', 'name avatar isAadhaarVerified'),
      Protest.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      success: true,
      count: protests.length,
      total,
      page: pageNumber,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
      protests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single protest details (with voteCount and whether user has voted)
 * @route   GET /api/protests/:id
 * @access  Public (Optional auth for hasVoted status)
 */
const getProtestById = async (req, res, next) => {
  try {
    const protest = await Protest.findById(req.params.id)
      .populate('user', 'name email avatar isAadhaarVerified createdAt');

    if (!protest) {
      return next(new ApiError('Protest not found', 404));
    }

    // Check if the current user has voted
    let hasVoted = false;
    let userVote = null;

    if (req.user) {
      userVote = await Vote.findOne({
        user: req.user._id,
        protest: protest._id
      });
      hasVoted = !!userVote;
    }

    res.status(200).json({
      success: true,
      protest,
      voteCount: protest.voteCount,
      hasVoted,
      votedAt: userVote?.createdAt || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's own protests (all statuses)
 * @route   GET /api/protests/mine
 * @access  Private (Verified user)
 */
const getMyProtests = async (req, res, next) => {
  try {
    const protests = await Protest.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: protests.length,
      protests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================================
 * PROMPT 7: VOTING SYSTEM
 * =========================================================================
 */

/**
 * @desc    Cast vote on a published protest (prevents self-voting & duplicate votes)
 * @route   POST /api/protests/:id/vote
 * @access  Private (Verified user only)
 */
const castVote = async (req, res, next) => {
  try {
    const protest = await Protest.findById(req.params.id);

    if (!protest) {
      return next(new ApiError('Protest not found', 404));
    }

    // Allowed ONLY on published protests
    if (protest.status !== 'published') {
      return next(
        new ApiError(`Voting is not allowed. This protest is currently in "${protest.status}" status.`, 400)
      );
    }

    // Users CANNOT vote on their own protest
    if (protest.user.toString() === req.user._id.toString()) {
      return next(new ApiError('You cannot vote on your own protest submission.', 400));
    }

    // Prevent duplicate votes via Mongoose insert & handle E11000
    try {
      await Vote.create({
        user: req.user._id,
        protest: protest._id,
        voteType: 'support'
      });
    } catch (err) {
      if (err.code === 11000) {
        return next(new ApiError('You have already cast your vote on this protest.', 409));
      }
      throw err;
    }

    // Atomically increment voteCount using $inc
    const updatedProtest = await Protest.findByIdAndUpdate(
      protest._id,
      { $inc: { voteCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Your vote of support has been officially recorded!',
      voteCount: updatedProtest.voteCount,
      hasVoted: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw a previously cast vote
 * @route   DELETE /api/protests/:id/vote
 * @access  Private (Verified user)
 */
const withdrawVote = async (req, res, next) => {
  try {
    const vote = await Vote.findOneAndDelete({
      user: req.user._id,
      protest: req.params.id
    });

    if (!vote) {
      return next(new ApiError('No vote found for this protest by your account.', 404));
    }

    // Atomically decrement voteCount (prevent going below 0)
    const updatedProtest = await Protest.findByIdAndUpdate(
      req.params.id,
      { $inc: { voteCount: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Vote withdrawn successfully',
      voteCount: Math.max(0, updatedProtest.voteCount),
      hasVoted: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get voting history for logged in user (with protest details)
 * @route   GET /api/users/me/votes
 * @access  Private
 */
const getMyVotes = async (req, res, next) => {
  try {
    const votes = await Vote.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'protest',
        populate: { path: 'user', select: 'name' }
      });

    res.status(200).json({
      success: true,
      count: votes.length,
      votes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProtest,
  getPublishedProtests,
  getProtestById,
  getMyProtests,
  castVote,
  withdrawVote,
  getMyVotes
};

