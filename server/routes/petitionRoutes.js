const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/petitionController');
const { protect, optionalAuth } = require('../middleware/auth');
const { signLimiter } = require('../middleware/rateLimiter');

// Public stats route
router.get('/stats', getPlatformStats);

// User-specific petition queries (must be defined BEFORE /:id to avoid param collision)
router.get('/user/my-petitions', protect, getMyPetitions);
router.get('/user/my-signatures', protect, getMySignedPetitions);

// General petition CRUD & listing
router.route('/')
  .get(getPetitions)
  .post(protect, createPetition);

router.route('/:id')
  .get(optionalAuth, getPetitionById)
  .put(protect, updatePetition)
  .delete(protect, deletePetition);

// Petition actions
router.post('/:id/sign', protect, signLimiter, signPetition);
router.post('/:id/updates', protect, addPetitionUpdate);
router.patch('/:id/status', protect, updatePetitionStatus);

module.exports = router;
