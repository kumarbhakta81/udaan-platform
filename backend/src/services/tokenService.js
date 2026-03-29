const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { config } = require('../config/env');

// ── Generate Access Token (short-lived) ────────────────────────────────────
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role, type: 'access' },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn || '15m' }
  );
};

// ── Generate Refresh Token (long-lived) ────────────────────────────────────
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    config.jwtRefreshSecret || config.jwtSecret + '_refresh',
    { expiresIn: config.jwtRefreshExpiresIn || '7d' }
  );
};

// ── Verify Access Token ────────────────────────────────────────────────────
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

// ── Verify Refresh Token ───────────────────────────────────────────────────
const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,
    config.jwtRefreshSecret || config.jwtSecret + '_refresh'
  );
};

// ── Generate a secure random token (for email verification, password reset) ─
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ── Hash a token for secure storage ───────────────────────────────────────
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ── Set auth cookies ───────────────────────────────────────────────────────
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = config.env === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh',
  });
};

// ── Clear auth cookies ─────────────────────────────────────────────────────
const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
};

// ── Generate token pair ────────────────────────────────────────────────────
const generateTokenPair = (userId, role) => ({
  accessToken: generateAccessToken(userId, role),
  refreshToken: generateRefreshToken(userId),
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateSecureToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  generateTokenPair,
};
