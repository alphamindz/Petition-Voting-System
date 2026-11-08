const express = require('express');
const router = express.Router();

const {
  createProtest,
  getPublishedProtests,
  getProtestById,
  getMyProtests,
  castVote,
  withdrawVote
} = require('../controllers/protestController');

const { protect, optionalAuth, requireVerified } = require('../middleware/auth');
const { validateProtest } = require('../middleware/validators');
const { voteLimiter } = require('../middleware/rateLimiter');

// Public route: list ONLY published protests
router.get('/', getPublishedProtests);

// Logged-in user: get their own submitted protests
router.get('/mine', protect, requireVerified, getMyProtests);

// Create protest (requires verified user)
router.post('/', protect, requireVerified, validateProtest, createProtest);

// Single protest details
router.get('/:id', optionalAuth, getProtestById);

// Voting endpoints (requires verified user)
router.post('/:id/vote', protect, requireVerified, voteLimiter, castVote);
router.delete('/:id/vote', protect, requireVerified, voteLimiter, withdrawVote);

module.exports = router;

