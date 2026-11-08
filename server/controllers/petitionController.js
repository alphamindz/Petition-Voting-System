const Petition = require('../models/Petition');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const {
  sendSignatureConfirmationEmail,
  sendGoalReachedEmail
} = require('../utils/emailService');

/**
 * @desc    Get all petitions with filters, search, sorting and pagination
 * @route   GET /api/petitions
 * @access  Public
 */
const getPetitions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 9,
      search,
      category,
      status,
      sort = 'popular'
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter query
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Determine sort ordering
    let sortCriteria = {};
    if (sort === 'popular') {
      sortCriteria = { currentSignatures: -1, createdAt: -1 };
    } else if (sort === 'newest') {
      sortCriteria = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortCriteria = { createdAt: 1 };
    } else if (sort === 'target') {
      sortCriteria = { targetSignatures: 1 };
    } else {
      sortCriteria = { createdAt: -1 };
    }

    const [petitions, total] = await Promise.all([
      Petition.find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNumber)
        .populate('creator', 'name avatar')
        .select('-signatures.user'), // exclude signer user IDs in list view for performance
      Petition.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      success: true,
      count: petitions.length,
      total,
      page: pageNumber,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
      petitions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single petition by ID
 * @route   GET /api/petitions/:id
 * @access  Public (with optional auth to check if user has signed)
 */
const getPetitionById = async (req, res, next) => {
  try {
    const petition = await Petition.findById(req.params.id)
      .populate('creator', 'name email avatar bio createdAt');

    if (!petition) {
      return next(new ApiError('Petition not found', 404));
    }

    // Check if current authenticated user has already signed
    let hasSigned = false;
    let userSignature = null;

    if (req.user) {
      const userIdStr = req.user._id.toString();
      const existing = petition.signatures.find(
        (sig) => sig.user && sig.user.toString() === userIdStr
      );
      if (existing) {
        hasSigned = true;
        userSignature = existing;
      }
    }

    // Return the petition with recent comments/signatures sorted newest first
    const petitionObj = petition.toObject();
    if (petitionObj.signatures) {
      petitionObj.signatures.sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt));
    }

    res.status(200).json({
      success: true,
      petition: petitionObj,
      hasSigned,
      userSignature
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new petition
 * @route   POST /api/petitions
 * @access  Private
 */
const createPetition = async (req, res, next) => {
  try {
    const { title, description, category, targetSignatures, imageUrl } = req.body;

    if (!title || !description) {
      return next(new ApiError('Please provide both title and description', 400));
    }

    // Creator automatically signs their own petition as signature #1
    const initialSignatures = [
      {
        user: req.user._id,
        name: req.user.name,
        comment: 'Campaign creator and 1st supporter.',
        signedAt: new Date()
      }
    ];

    const petition = await Petition.create({
      title,
      description,
      category: category || 'Community',
      targetSignatures: Number(targetSignatures) || 100,
      currentSignatures: 1,
      imageUrl: imageUrl || '',
      creator: req.user._id,
      signatures: initialSignatures
    });

    const populatedPetition = await Petition.findById(petition._id).populate(
      'creator',
      'name avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Petition created successfully',
      petition: populatedPetition
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a petition
 * @route   PUT /api/petitions/:id
 * @access  Private (Creator or Admin only)
 */
const updatePetition = async (req, res, next) => {
  try {
    let petition = await Petition.findById(req.params.id);

    if (!petition) {
      return next(new ApiError('Petition not found', 404));
    }

    // Check ownership or admin status
    const isOwner = petition.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new ApiError('Not authorized to update this petition', 403));
    }

    const { title, description, category, targetSignatures, imageUrl, status } = req.body;

    if (title) petition.title = title;
    if (description) petition.description = description;
    if (category) petition.category = category;
    if (targetSignatures) petition.targetSignatures = Number(targetSignatures);
    if (imageUrl !== undefined) petition.imageUrl = imageUrl;
    if (status) petition.status = status;

    await petition.save();

    res.status(200).json({
      success: true,
      message: 'Petition updated successfully',
      petition
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a petition
 * @route   DELETE /api/petitions/:id
 * @access  Private (Creator or Admin only)
 */
const deletePetition = async (req, res, next) => {
  try {
    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return next(new ApiError('Petition not found', 404));
    }

    const isOwner = petition.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new ApiError('Not authorized to delete this petition', 403));
    }

    await Petition.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Petition deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Sign a petition
 * @route   POST /api/petitions/:id/sign
 * @access  Private
 */
const signPetition = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const petition = await Petition.findById(req.params.id).populate('creator', 'name email');

    if (!petition) {
      return next(new ApiError('Petition not found', 404));
    }

    if (petition.status === 'closed') {
      return next(new ApiError('This petition is closed and no longer accepting signatures', 400));
    }

    // Check if user already signed
    const userIdStr = req.user._id.toString();
    const alreadySigned = petition.signatures.some(
      (sig) => sig.user && sig.user.toString() === userIdStr
    );

    if (alreadySigned) {
      return next(new ApiError('You have already signed this petition', 400));
    }

    // Add signature
    const newSignature = {
      user: req.user._id,
      name: req.user.name,
      comment: comment ? comment.trim() : '',
      signedAt: new Date()
    };

    petition.signatures.push(newSignature);
    petition.currentSignatures = petition.signatures.length;

    // Check if goal reached with this signature
    let goalReached = false;
    if (
      petition.currentSignatures >= petition.targetSignatures &&
      petition.status === 'active'
    ) {
      petition.status = 'successful';
      goalReached = true;
    }

    await petition.save();

    // Trigger emails asynchronously
    sendSignatureConfirmationEmail(req.user, petition).catch(() => {});
    if (goalReached && petition.creator) {
      sendGoalReachedEmail(petition.creator, petition).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Thank you for signing this petition!',
      currentSignatures: petition.currentSignatures,
      targetSignatures: petition.targetSignatures,
      status: petition.status,
      signature: newSignature
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add update / announcement to a petition
 * @route   POST /api/petitions/:id/updates
 * @access  Private (Creator or Admin only)
 */
const addPetitionUpdate = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return next(new ApiError('Please provide both update title and content', 400));
    }

    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return next(new ApiError('Petition not found', 404));
    }

    const isOwner = petition.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new ApiError('Not authorized to post updates for this petition', 403));
    }

    petition.updates.unshift({
      title,
      content,
      createdAt: new Date()
    });

    await petition.save();

    res.status(201).json({
      success: true,
      message: 'Petition update posted successfully',
      updates: petition.updates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change petition status
 * @route   PATCH /api/petitions/:id/status
 * @access  Private (Creator or Admin only)
 */
const updatePetitionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['active', 'closed', 'successful'].includes(status)) {
      return next(new ApiError('Invalid status value', 400));
    }

    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return next(new ApiError('Petition not found', 404));
    }

    const isOwner = petition.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new ApiError('Not authorized to change this petition status', 403));
    }

    petition.status = status;
    await petition.save();

    res.status(200).json({
      success: true,
      message: `Petition status changed to ${status}`,
      petition
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get petitions created by the logged in user
 * @route   GET /api/petitions/user/my-petitions
 * @access  Private
 */
const getMyPetitions = async (req, res, next) => {
  try {
    const petitions = await Petition.find({ creator: req.user._id })
      .sort({ createdAt: -1 })
      .select('-signatures');

    res.status(200).json({
      success: true,
      count: petitions.length,
      petitions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get petitions signed by the logged in user
 * @route   GET /api/petitions/user/my-signatures
 * @access  Private
 */
const getMySignedPetitions = async (req, res, next) => {
  try {
    const petitions = await Petition.find({
      'signatures.user': req.user._id
    })
      .sort({ updatedAt: -1 })
      .populate('creator', 'name avatar')
      .select('-signatures');

    res.status(200).json({
      success: true,
      count: petitions.length,
      petitions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform-wide statistics
 * @route   GET /api/petitions/stats
 * @access  Public
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalPetitions,
      activePetitions,
      successfulPetitions,
      totalUsers,
      signatureAggregate
    ] = await Promise.all([
      Petition.countDocuments(),
      Petition.countDocuments({ status: 'active' }),
      Petition.countDocuments({ status: 'successful' }),
      User.countDocuments(),
      Petition.aggregate([
        {
          $group: {
            _id: null,
            totalSignatures: { $sum: '$currentSignatures' }
          }
        }
      ])
    ]);

    const totalSignatures =
      signatureAggregate.length > 0 ? signatureAggregate[0].totalSignatures : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalPetitions,
        activePetitions,
        successfulPetitions,
        totalUsers,
        totalSignatures
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPetitions,
  getPetitionById,
  createPetition,
  updatePetition,
  deletePetition,
  signPetition,
  addPetitionUpdate,
  updatePetitionStatus,
  getMyPetitions,
  getMySignedPetitions,
  getPlatformStats
};
