const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtp,
  resendOtp,
  initiateAadhaar,
  verifyAadhaar,
  getAadhaarTestIdentities,
  setPassword,
  login
} = require('../controllers/authController');

const { validateRegister } = require('../middleware/validators');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// Step 1: Register (without password, triggers email OTP)
router.post('/register', authLimiter, validateRegister, register);

// Step 2: Verify Email OTP & Resend OTP
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);

// Step 3: Simulated Aadhaar Identity Verification
router.get('/aadhaar/test-identities', getAadhaarTestIdentities);
router.post('/aadhaar/initiate', otpLimiter, initiateAadhaar);
router.post('/aadhaar/verify', otpLimiter, verifyAadhaar);

// Step 4: Set Strong Password (allowed only if email & aadhaar verified)
router.post('/set-password', authLimiter, setPassword);

// Step 5: Login
router.post('/login', authLimiter, login);

module.exports = router;
