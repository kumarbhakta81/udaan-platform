const { config } = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return ApiError.badRequest(message);
};

/**
 * Handle Mongoose duplicate key error
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists. Please use a different value.`;
  return ApiError.conflict(message);
};

/**
 * Handle Mongoose validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return ApiError.unprocessable('Validation failed', errors);
};

/**
 * Handle JWT invalid signature error
 */
const handleJWTError = () =>
  ApiError.unauthorized('Invalid token. Please log in again.');

/**
 * Handle JWT expired error
 */
const handleJWTExpiredError = () =>
  ApiError.unauthorized('Your session has expired. Please log in again.');

/**
 * Send error response in development mode (with full details)
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    errors: err.errors || [],
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send error response in production mode (sanitized)
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      timestamp: new Date().toISOString(),
    });
  } else {
    // Programming or unknown error: don't leak details
    logger.error('UNHANDLED ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      errors: [],
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Global Express Error Handler Middleware
 * Must be registered LAST in the middleware chain with 4 parameters
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log all errors
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'unauthenticated',
    stack: config.env === 'development' ? err.stack : undefined,
  });

  if (config.env === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.isOperational = err.isOperational;

    // Transform known Mongoose/JWT errors into operational errors
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
