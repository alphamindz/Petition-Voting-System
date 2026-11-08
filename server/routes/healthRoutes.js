const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Check server health and database connection status
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateIndex = mongoose.connection.readyState;

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStatus[stateIndex] || 'unknown',
      connected: stateIndex === 1
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
