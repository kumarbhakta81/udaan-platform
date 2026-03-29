/**
 * Custom API Error class for structured error responses
 * Extends native Error class for proper stack trace capture
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Array of field-level errors
   * @param {string} stack - Custom stack trace (optional)
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.isOperational = true; // Distinguishes operational vs programming errors

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Static factory methods for common HTTP errors ──────────────────────────

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized. Please login to continue.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource already exists.') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Unprocessable Entity', errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
