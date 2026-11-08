const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('./errorHandler');

/**
 * Protect routes: requires valid JWT bearer token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError('Not authorized, no token provided', 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_jwt_secret_dev_only'
    );

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(new ApiError('User no longer exists', 401));
    }

    if (!user.isActive) {
      return next(new ApiError('Account has been suspended or deactivated', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError('Not authorized, token verification failed', 401));
  }
};

/**
 * Optional authentication: attaches user if token exists, but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_jwt_secret_dev_only'
    );
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Silently continue without authenticated user
  }
  next();
};

/**
 * Role-based authorization
 * @param  {...string} roles - e.g. 'admin', 'user'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Requires the user to have verified email, verified Aadhaar, and active status
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError('Authentication required', 401));
  }
  if (!req.user.isActive) {
    return next(new ApiError('Account has been deactivated. Please contact support.', 403));
  }
  if (!req.user.isEmailVerified) {
    return next(new ApiError('Email verification required before accessing this feature', 403));
  }
  if (!req.user.isAadhaarVerified) {
    return next(new ApiError('Aadhaar identity verification required before accessing this feature', 403));
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  requireVerified
};
