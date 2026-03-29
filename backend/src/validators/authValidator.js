const { body, param } = require('express-validator');

// ── Register Validator ─────────────────────────────────────────────────────
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

// ── Login Validator ────────────────────────────────────────────────────────
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Forgot Password Validator ──────────────────────────────────────────────
const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
];

// ── Reset Password Validator ───────────────────────────────────────────────
const validateResetPassword = [
  param('token')
    .notEmpty().withMessage('Reset token is required'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

// ── Change Password Validator ──────────────────────────────────────────────
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

// ── Select Role Validator ──────────────────────────────────────────────────
const validateSelectRole = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['seeker', 'expert']).withMessage('Role must be seeker or expert'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateSelectRole,
};
