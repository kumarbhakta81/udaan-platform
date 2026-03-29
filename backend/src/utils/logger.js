const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}]: ${stack || message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'udaan-backend' },
  transports: [
    // File transport - error level only
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport - all logs
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      ),
    })
  );
}

// Create a stream object for Morgan HTTP logger integration
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
