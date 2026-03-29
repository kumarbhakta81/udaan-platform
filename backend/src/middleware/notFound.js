const ApiError = require('../utils/ApiError');

/**
 * 404 Not Found Middleware
 * Catches all requests to undefined routes
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
