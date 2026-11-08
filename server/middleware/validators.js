const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile phone number is required')
    .matches(/^[0-9+\s\-()]{7,20}$/)
    .withMessage('Please provide a valid mobile phone number')
];

/**
 * Validation rules for protest creation
 */
const validateProtest = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Protest title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),
  body('concernedAuthority')
    .trim()
    .notEmpty()
    .withMessage('Concerned authority is required')
    .isLength({ max: 150 })
    .withMessage('Concerned authority cannot exceed 150 characters')
];

module.exports = {
  validateRegister,
  validateProtest
};

