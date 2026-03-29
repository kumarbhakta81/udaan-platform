const rateLimit = require('express-rate-limit');
const { config } = require('../config/env');

/**
 * General API rate limiter
 * Applies to all /api routes
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * Strict rate limiter for authentication routes
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    timestamp: new Date().toISOString(),
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Strict rate limiter for password reset
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 1 hour.',
    timestamp: new Date().toISOString(),
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = { apiLimiter, authLimiter, passwordResetLimiter };
