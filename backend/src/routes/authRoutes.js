const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateSelectRole,
} = require('../validators/authValidator');

// ── Public routes ──────────────────────────────────────────────────────────
// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegister, authController.register);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, authController.login);

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh', authController.refreshToken);

// @route   GET /api/v1/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', authController.verifyEmail);

// @route   POST /api/v1/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

// @route   POST /api/v1/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', validateResetPassword, authController.resetPassword);

// ── Protected routes ───────────────────────────────────────────────────────
// @route   GET /api/v1/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   POST /api/v1/auth/logout
// @desc    Logout current user
// @access  Private
router.post('/logout', protect, authController.logout);

// @route   POST /api/v1/auth/select-role
// @desc    Select user role during onboarding
// @access  Private
router.post('/select-role', protect, validateSelectRole, authController.selectRole);

// @route   POST /api/v1/auth/resend-verification
// @desc    Resend email verification link
// @access  Private
router.post('/resend-verification', protect, authController.resendVerification);

// @route   PUT /api/v1/auth/change-password
// @desc    Change password (requires current password)
// @access  Private
router.put('/change-password', protect, validateChangePassword, authController.changePassword);

module.exports = router;
