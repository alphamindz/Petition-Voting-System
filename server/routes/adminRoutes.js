const express = require('express');
const router = express.Router();

const {
  getAdminProtests,
  updateProtestStatus,
  getAdminUsers,
  toggleUserStatus,
  getAdminStats,
  getAdminActivity
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

// All routes here strictly require: protect + authorize('admin')
router.use(protect, authorize('admin'));

// Protests review & status updates
router.get('/protests', getAdminProtests);
router.patch('/protests/:id/status', updateProtestStatus);

// Users management & block/unblock
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', toggleUserStatus);

// Administrative statistics & audit log
router.get('/stats', getAdminStats);
router.get('/activity', getAdminActivity);

module.exports = router;

