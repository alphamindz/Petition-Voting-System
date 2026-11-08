const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { User, Verification } = require('../models');
const generateToken = require('../utils/generateToken');
const { sendOtpEmail } = require('../utils/sendEmail');
const { lookupMockAadhaar, getTestIdentities } = require('../services/aadhaarService');
const { ApiError } = require('../middleware/errorHandler');

/**
 * =========================================================================
 * PROMPT 3: REGISTRATION + OTP + EMAIL
 * =========================================================================
 */

/**
 * @desc    Step 1: Initiate registration (creates user without password, sends 6-digit OTP)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // 1. Check express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map((e) => e.msg).join('. ');
      return next(new ApiError(messages, 400));
    }

    const { name, email, mobile } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const cleanMobile = String(mobile).trim();

    // 2. Check for duplicate email or mobile
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      if (existingEmail.isEmailVerified && existingEmail.isAadhaarVerified && existingEmail.passwordHash) {
        return next(new ApiError('An account with this email address already exists. Please sign in.', 409));
      }
      // If registration was abandoned halfway, allow user to resume
      var user = existingEmail;
      user.name = name;
      user.mobile = cleanMobile;
      await user.save();
    } else {
      const existingMobile = await User.findOne({ mobile: cleanMobile });
      if (existingMobile) {
        return next(new ApiError('An account with this mobile phone number already exists.', 409));
      }

      // 3. Create user WITHOUT password yet
      user = await User.create({
        name,
        email: normalizedEmail,
        mobile: cleanMobile,
        passwordHash: null,
        role: 'user',
        isEmailVerified: false,
        isAadhaarVerified: false,
        isActive: true
      });
    }

    // 4. Generate 6-digit numeric OTP
    const rawOtp = String(Math.floor(100000 + Math.random() * 900000));

    // 5. Hash OTP with bcrypt (never store raw OTP)
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    // 6. Save in Verification collection (10 minutes expiry)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate any older pending email verifications for this user
    await Verification.updateMany(
      { user: user._id, type: 'email', status: 'pending' },
      { status: 'failed' }
    );

    await Verification.create({
      user: user._id,
      type: 'email',
      status: 'pending',
      referenceId: `ref_email_${crypto.randomBytes(6).toString('hex')}`,
      otpHash,
      otpExpiresAt,
      attempts: 0
    });

    // 7. Dispatch via Nodemailer HTML template
    await sendOtpEmail(user.email, user.name, rawOtp, 'Email Verification');

    res.status(201).json({
      success: true,
      message: 'Registration initiated. A 6-digit verification code was sent to your email address.',
      userId: user._id,
      email: user.email,
      // In development mode, provide demoOtp for easy postman / automated testing
      ...(process.env.NODE_ENV === 'development' && { devDemoOtp: rawOtp })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Step 2: Verify email OTP (max 5 attempts, marks isEmailVerified)
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, userId, otp } = req.body;

    if (!otp) {
      return next(new ApiError('Please provide the 6-digit OTP code', 400));
    }

    // Find target user
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return next(new ApiError('User not found. Please initiate registration first.', 404));
    }

    // Find latest pending email verification
    const verification = await Verification.findOne({
      user: user._id,
      type: 'email',
      status: 'pending'
    }).select('+otpHash').sort({ createdAt: -1 });

    if (!verification) {
      return next(new ApiError('No pending OTP verification found. Please request a new code.', 400));
    }

    // Check maximum attempts limit (max 5 attempts)
    if (verification.attempts >= 5) {
      verification.status = 'failed';
      await verification.save();
      return next(new ApiError('Maximum verification attempts (5) exceeded. Please request a new OTP.', 429));
    }

    // Check expiry
    if (new Date() > new Date(verification.otpExpiresAt)) {
      verification.status = 'failed';
      await verification.save();
      return next(new ApiError('This OTP code has expired. Please request a new one.', 400));
    }

    // Verify OTP against hashed OTP
    const isMatch = await bcrypt.compare(String(otp).trim(), verification.otpHash);

    // Increment attempts
    verification.attempts += 1;

    if (!isMatch) {
      await verification.save();
      const remainingAttempts = 5 - verification.attempts;
      return next(
        new ApiError(
          `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`,
          400
        )
      );
    }

    // Mark verification successful
    verification.status = 'verified';
    verification.verifiedAt = new Date();
    await verification.save();

    // Update user isEmailVerified status
    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You may now proceed to identity verification.',
      userId: user._id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isAadhaarVerified: user.isAadhaarVerified
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP with 60-second cooldown
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOtp = async (req, res, next) => {
  try {
    const { email, userId } = req.body;

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return next(new ApiError('User account not found', 404));
    }

    // Find latest verification record to enforce 60-second cooldown
    const lastVerification = await Verification.findOne({
      user: user._id,
      type: 'email'
    }).sort({ createdAt: -1 });

    if (lastVerification) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(lastVerification.updatedAt).getTime()) / 1000);
      const COOLDOWN_SECONDS = 60;

      if (elapsedSeconds < COOLDOWN_SECONDS) {
        const remaining = COOLDOWN_SECONDS - elapsedSeconds;
        return next(
          new ApiError(`Please wait ${remaining} second(s) before requesting another verification code.`, 429)
        );
      }
    }

    // Generate fresh OTP
    const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    // Invalidate previous pending OTPs
    await Verification.updateMany(
      { user: user._id, type: 'email', status: 'pending' },
      { status: 'failed' }
    );

    await Verification.create({
      user: user._id,
      type: 'email',
      status: 'pending',
      referenceId: `ref_email_${crypto.randomBytes(6).toString('hex')}`,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0
    });

    await sendOtpEmail(user.email, user.name, rawOtp, 'Email Verification');

    res.status(200).json({
      success: true,
      message: 'A new 6-digit verification code was dispatched to your email.',
      ...(process.env.NODE_ENV === 'development' && { devDemoOtp: rawOtp })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================================
 * PROMPT 4: SIMULATED AADHAAR VERIFICATION
 * =========================================================================
 */

/**
 * @desc    Step 3A: Initiate simulated Aadhaar verification
 * @route   POST /api/auth/aadhaar/initiate
 * @access  Public (Requires email to be verified)
 */
const initiateAadhaar = async (req, res, next) => {
  try {
    const { email, userId, aadhaarNumber } = req.body;

    let user;
    if (req.user) {
      user = req.user;
    } else if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return next(new ApiError('User account not found', 404));
    }

    // BLOCK unless email is verified
    if (!user.isEmailVerified) {
      return next(
        new ApiError('Email verification is required before initiating Aadhaar verification.', 403)
      );
    }

    if (user.isAadhaarVerified) {
      return res.status(200).json({
        success: true,
        message: 'Aadhaar identity is already verified for this account.',
        isAadhaarVerified: true
      });
    }

    // Check against mock list (NEVER store or log the raw number)
    const match = lookupMockAadhaar(aadhaarNumber);
    if (!match) {
      return next(
        new ApiError(
          'Invalid sandbox Aadhaar number. Please use one of the 10 demo numbers (e.g. 999911112222).',
          400
        )
      );
    }

    // Generate random referenceId
    const referenceId = `ekyc_ref_${crypto.randomBytes(8).toString('hex')}`;

    // Fixed demo OTP in development / simulation
    const demoOtp = '123456';
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(demoOtp, salt);

    // Invalidate existing pending aadhaar verifications for this user
    await Verification.updateMany(
      { user: user._id, type: 'aadhaar', status: 'pending' },
      { status: 'failed' }
    );

    // Store ONLY the referenceId, status, and hashed OTP (NEVER the Aadhaar number)
    await Verification.create({
      user: user._id,
      type: 'aadhaar',
      status: 'pending',
      referenceId,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0
    });

    res.status(200).json({
      success: true,
      message: `Simulated OTP dispatched to mobile linked with Aadhaar (${match.maskedDisplay}).`,
      referenceId,
      maskedAadhaar: match.maskedDisplay,
      citizenName: match.name,
      demoOtp: '123456',
      instructions: 'Enter demo OTP "123456" to complete mock verification.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Step 3B: Verify simulated Aadhaar OTP
 * @route   POST /api/auth/aadhaar/verify
 * @access  Public
 */
const verifyAadhaar = async (req, res, next) => {
  try {
    const { referenceId, otp } = req.body;

    if (!referenceId || !otp) {
      return next(new ApiError('Please provide both referenceId and OTP code', 400));
    }

    const verification = await Verification.findOne({
      referenceId,
      type: 'aadhaar',
      status: 'pending'
    }).select('+otpHash');

    if (!verification) {
      return next(new ApiError('Invalid or expired Aadhaar verification session.', 404));
    }

    if (verification.attempts >= 5) {
      verification.status = 'failed';
      await verification.save();
      return next(new ApiError('Maximum verification attempts exceeded. Please initiate again.', 429));
    }

    if (new Date() > new Date(verification.otpExpiresAt)) {
      verification.status = 'failed';
      await verification.save();
      return next(new ApiError('Aadhaar verification session expired. Please initiate again.', 400));
    }

    const isMatch = await bcrypt.compare(String(otp).trim(), verification.otpHash);
    verification.attempts += 1;

    if (!isMatch) {
      await verification.save();
      return next(new ApiError('Invalid Aadhaar OTP code. (Hint: use demo code 123456)', 400));
    }

    // On success: mark verified and store ONLY referenceId & status
    verification.status = 'verified';
    verification.verifiedAt = new Date();
    await verification.save();

    // Update user
    const user = await User.findById(verification.user);
    if (user) {
      user.isAadhaarVerified = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Aadhaar identity verified successfully! You may now set your password.',
      isAadhaarVerified: true,
      referenceId: verification.referenceId,
      userId: user?._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Helper to retrieve the list of 10 mock Aadhaar test numbers
 * @route   GET /api/auth/aadhaar/test-identities
 * @access  Public
 */
const getAadhaarTestIdentities = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mock test identities for simulated sandbox Aadhaar verification.',
    identities: getTestIdentities()
  });
};

/**
 * =========================================================================
 * PROMPT 5: PASSWORD, LOGIN, JWT, RBAC
 * =========================================================================
 */

/**
 * @desc    Step 4: Set strong password (allowed only if email AND Aadhaar verified)
 * @route   POST /api/auth/set-password
 * @access  Public
 */
const setPassword = async (req, res, next) => {
  try {
    const { email, userId, password, confirmPassword } = req.body;

    if (!password) {
      return next(new ApiError('Please provide a password', 400));
    }

    if (confirmPassword && password !== confirmPassword) {
      return next(new ApiError('Passwords do not match', 400));
    }

    // Enforce strong password rules
    // Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_])[A-Za-z\d@$!%*?&#^~_]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return next(
        new ApiError(
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#^~_).',
          400
        )
      );
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return next(new ApiError('User account not found', 404));
    }

    // Check verification constraints
    if (!user.isEmailVerified) {
      return next(new ApiError('Email verification must be completed first.', 403));
    }

    if (!user.isAadhaarVerified) {
      return next(new ApiError('Aadhaar identity verification must be completed first.', 403));
    }

    // Hash with bcrypt (12 rounds)
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();

    // Automatically generate token upon activating account
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password established successfully. Your citizen account is fully verified!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isAadhaarVerified: user.isAadhaarVerified,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError('Please provide both email and password', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

    if (!user || !user.passwordHash) {
      return next(new ApiError('Invalid email or password credentials.', 401));
    }

    // Block login if user is not fully verified
    if (!user.isEmailVerified || !user.isAadhaarVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account registration is incomplete. Please complete email and Aadhaar verification.',
        requiresVerification: true,
        userId: user._id,
        isEmailVerified: user.isEmailVerified,
        isAadhaarVerified: user.isAadhaarVerified
      });
    }

    // Block login if isActive is false
    if (!user.isActive) {
      return next(new ApiError('Your account has been deactivated. Please contact an administrator.', 403));
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError('Invalid email or password credentials.', 401));
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isAadhaarVerified: user.isAadhaarVerified,
        isActive: user.isActive,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private (JWT protected)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile (no role, status, or verification tampering)
 * @route   PUT /api/users/me
 * @access  Private (JWT protected)
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ApiError('User not found', 404));
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isAadhaarVerified: user.isAadhaarVerified,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  initiateAadhaar,
  verifyAadhaar,
  getAadhaarTestIdentities,
  setPassword,
  login,
  getMe,
  updateMe
};
