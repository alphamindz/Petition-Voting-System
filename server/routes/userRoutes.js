const express = require('express');
const router = express.Router();

const { getMe, updateMe } = require('../controllers/authController');
const { getMyVotes } = require('../controllers/protestController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/me/votes', getMyVotes);

module.exports = router;

