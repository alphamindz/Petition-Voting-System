const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in 15 minutes.'
  }
});

/**
 * Sensitive auth endpoints rate limiter (login / register)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

/**
 * OTP endpoints rate limiter (registration, verify, resend, aadhaar)
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification code requests. Please wait 10 minutes before retrying.'
  }
});

/**
 * Vote & Signature action rate limiter
 */
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many voting/signature actions from this network, please wait a moment.'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  otpLimiter,
  voteLimiter,
  signLimiter: voteLimiter // alias for backward compatibility
};
