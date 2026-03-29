const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// ── Verify JWT and attach user to request ──────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header (Bearer token)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback: check cookie
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. Please login to continue.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Fetch user (exclude sensitive fields)
    const user = await User.findById(decoded.userId).select(
      '-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires'
    );

    if (!user) {
      throw new ApiError(401, 'User no longer exists. Please login again.');
    }

    if (user.isBanned) {
      throw new ApiError(403, `Your account has been suspended. Reason: ${user.banReason || 'Community guideline violation'}`);
    }

    if (!user.isActive || user.deletedAt) {
      throw new ApiError(401, 'Your account is inactive. Please contact support.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token. Please login again.');
    }
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired. Please refresh your session.');
    }
    throw new ApiError(401, 'Authentication failed.');
  }
});

// ── Optional auth: attach user if token present, don't fail if not ─────────
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId).select(
      '-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires'
    );
    if (user && !user.isBanned && user.isActive && !user.deletedAt) {
      req.user = user;
    }
  } catch {
    // Silently ignore errors for optional auth
  }
  next();
});

// ── Role-based access control ──────────────────────────────────────────────
const requireRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Required role: ${roles.join(' or ')}.`
      );
    }
    next();
  });

// ── Require email verification ─────────────────────────────────────────────
const requireEmailVerified = asyncHandler(async (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email address to access this feature.');
  }
  next();
});

// ── Require completed onboarding ───────────────────────────────────────────
const requireOnboarding = asyncHandler(async (req, res, next) => {
  if (!req.user?.onboardingCompleted) {
    throw new ApiError(403, 'Please complete your profile setup to continue.');
  }
  next();
});

// ── Admin only shorthand ───────────────────────────────────────────────────
const adminOnly = requireRole('admin');

module.exports = {
  protect,
  optionalAuth,
  requireRole,
  requireEmailVerified,
  requireOnboarding,
  adminOnly,
};
