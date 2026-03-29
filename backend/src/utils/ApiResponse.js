/**
 * Standardized API Response class
 * Ensures consistent response format across all endpoints
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response payload
   * @param {string} message - Response message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  // ── Static factory methods ─────────────────────────────────────────────────

  static success(data = null, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  static created(data = null, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }

  // ── Instance send method ───────────────────────────────────────────────────

  /**
   * Send the response using Express res object
   * @param {object} res - Express response object
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
    });
  }
}

module.exports = ApiResponse;
