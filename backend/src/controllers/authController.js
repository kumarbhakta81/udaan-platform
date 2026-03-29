const { validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// ── Helper: extract validation errors ─────────────────────────────────────
const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    throw new ApiError(422, messages[0], errors.array());
  }
};

// ── Helper: build user response ────────────────────────────────────────────
const buildUserResponse = (user, tokens) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
  },
  ...tokens,
});

// ══════════════════════════════════════════════════════════════════════════
// REGISTER
// POST /api/v1/auth/register
// ══════════════════════════════════════════════════════════════════════════
const register = asyncHandler(async (req, res) => {
  handleValidation(req);

  const { name, email, password } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    oauthProvider: 'local',
  });

  // Create empty profile
  await Profile.create({ user: user._id });

  // Generate email verification token
  const verificationToken = tokenService.generateSecureToken();
  user.emailVerificationToken = tokenService.hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await user.save({ validateBeforeSave: false });

  // Send verification email (async, non-blocking)
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
  emailService.sendVerificationEmail(user, verificationUrl).catch(err =>
    logger.warn(`Verification email failed for ${user.email}: ${err.message}`)
  );

  // Send welcome notification
  await Notification.createNotification({
    recipient: user._id,
    type: 'welcome',
    title: 'Welcome to Udaan! 🎉',
    message: 'Your account has been created. Complete your profile to get started.',
    actionUrl: '/dashboard',
  });

  // Generate tokens
  const tokens = tokenService.generateTokenPair(user._id, user.role);
  tokenService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  logger.info(`New user registered: ${user.email}`);

  return res
    .status(201)
    .json(
      new ApiResponse(201, buildUserResponse(user, tokens), 'Account created successfully!')
    );
});

// ══════════════════════════════════════════════════════════════════════════
// LOGIN
// POST /api/v1/auth/login
// ══════════════════════════════════════════════════════════════════════════
const login = asyncHandler(async (req, res) => {
  handleValidation(req);

  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Check if OAuth user trying to login with password
  if (user.oauthProvider !== 'local' && !user.password) {
    throw new ApiError(401, `This account uses ${user.oauthProvider} login. Please sign in with ${user.oauthProvider}.`);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Check if banned/inactive
  if (user.isBanned) {
    throw new ApiError(403, `Account suspended: ${user.banReason || 'Community guideline violation'}`);
  }
  if (!user.isActive || user.deletedAt) {
    throw new ApiError(401, 'Account is inactive. Please contact support.');
  }

  // Update last seen & login count
  user.lastSeen = new Date();
  user.loginCount = (user.loginCount || 0) + 1;
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const tokens = tokenService.generateTokenPair(user._id, user.role);
  tokenService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  logger.info(`User logged in: ${user.email}`);

  return res
    .status(200)
    .json(
      new ApiResponse(200, buildUserResponse(user, tokens), 'Login successful!')
    );
});

// ══════════════════════════════════════════════════════════════════════════
// LOGOUT
// POST /api/v1/auth/logout
// ══════════════════════════════════════════════════════════════════════════
const logout = asyncHandler(async (req, res) => {
  tokenService.clearAuthCookies(res);

  // Update last seen
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { lastSeen: new Date() });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully.'));
});

// ══════════════════════════════════════════════════════════════════════════
// GET CURRENT USER
// GET /api/v1/auth/me
// ══════════════════════════════════════════════════════════════════════════
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('profile');

  return res
    .status(200)
    .json(new ApiResponse(200, user.toPublicJSON(), 'User fetched successfully.'));
});

// ══════════════════════════════════════════════════════════════════════════
// REFRESH TOKEN
// POST /api/v1/auth/refresh
// ══════════════════════════════════════════════════════════════════════════
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    throw new ApiError(401, 'Refresh token not provided.');
  }

  try {
    const decoded = tokenService.verifyRefreshToken(token);

    const user = await User.findById(decoded.userId);
    if (!user || user.isBanned || !user.isActive) {
      throw new ApiError(401, 'Invalid session. Please login again.');
    }

    const tokens = tokenService.generateTokenPair(user._id, user.role);
    tokenService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return res
      .status(200)
      .json(new ApiResponse(200, tokens, 'Token refreshed successfully.'));
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired refresh token. Please login again.');
  }
});

// ══════════════════════════════════════════════════════════════════════════
// SELECT ROLE (during onboarding)
// POST /api/v1/auth/select-role
// ══════════════════════════════════════════════════════════════════════════
const selectRole = asyncHandler(async (req, res) => {
  handleValidation(req);

  const { role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { role },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { role: user.role }, 'Role updated successfully.'));
});

// ══════════════════════════════════════════════════════════════════════════
// VERIFY EMAIL
// GET /api/v1/auth/verify-email/:token
// ══════════════════════════════════════════════════════════════════════════
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = tokenService.hashToken(req.params.token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw new ApiError(400, 'Verification link is invalid or has expired.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  await Notification.createNotification({
    recipient: user._id,
    type: 'email_verified',
    title: 'Email Verified ✅',
    message: 'Your email address has been successfully verified.',
  });

  logger.info(`Email verified for: ${user.email}`);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Email verified successfully!'));
});

// ══════════════════════════════════════════════════════════════════════════
// RESEND VERIFICATION EMAIL
// POST /api/v1/auth/resend-verification
// ══════════════════════════════════════════════════════════════════════════
const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+emailVerificationExpires');

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified.');
  }

  // Rate limit: don't send if token sent less than 5 minutes ago
  if (user.emailVerificationExpires) {
    const timeLeft = user.emailVerificationExpires.getTime() - Date.now();
    const threshold = 24 * 60 * 60 * 1000 - 5 * 60 * 1000; // 23h 55m
    if (timeLeft > threshold) {
      throw new ApiError(429, 'Verification email was just sent. Please wait a few minutes.');
    }
  }

  const verificationToken = tokenService.generateSecureToken();
  user.emailVerificationToken = tokenService.hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
  await emailService.sendVerificationEmail(user, verificationUrl);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Verification email sent! Please check your inbox.'));
});

// ══════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// POST /api/v1/auth/forgot-password
// ══════════════════════════════════════════════════════════════════════════
const forgotPassword = asyncHandler(async (req, res) => {
  handleValidation(req);

  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(200).json(
      new ApiResponse(200, null, 'If an account with that email exists, we\'ve sent a password reset link.')
    );
  }

  const resetToken = tokenService.generateSecureToken();
  user.passwordResetToken = tokenService.hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
  await emailService.sendPasswordResetEmail(user, resetUrl);

  logger.info(`Password reset requested for: ${user.email}`);

  return res.status(200).json(
    new ApiResponse(200, null, 'If an account with that email exists, we\'ve sent a password reset link.')
  );
});

// ══════════════════════════════════════════════════════════════════════════
// RESET PASSWORD
// POST /api/v1/auth/reset-password/:token
// ══════════════════════════════════════════════════════════════════════════
const resetPassword = asyncHandler(async (req, res) => {
  handleValidation(req);

  const hashedToken = tokenService.hashToken(req.params.token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new ApiError(400, 'Password reset link is invalid or has expired.');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Invalidate all existing sessions by clearing cookies
  tokenService.clearAuthCookies(res);

  logger.info(`Password reset successfully for: ${user.email}`);

  return res.status(200).json(
    new ApiResponse(200, null, 'Password reset successfully! Please login with your new password.')
  );
});

// ══════════════════════════════════════════════════════════════════════════
// CHANGE PASSWORD (authenticated)
// PUT /api/v1/auth/change-password
// ══════════════════════════════════════════════════════════════════════════
const changePassword = asyncHandler(async (req, res) => {
  handleValidation(req);

  const user = await User.findById(req.user._id).select('+password');

  const isCurrentPasswordValid = await user.comparePassword(req.body.currentPassword);
  if (!isCurrentPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  user.password = req.body.newPassword;
  await user.save();

  tokenService.clearAuthCookies(res);

  return res.status(200).json(
    new ApiResponse(200, null, 'Password changed successfully! Please login again.')
  );
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  selectRole,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
};
