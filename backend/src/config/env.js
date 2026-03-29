const dotenv = require('dotenv');
const path = require('path');

// Load env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];

// Validate required env vars
const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',

  db: {
    uri: process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_URI_TEST
      : process.env.MONGODB_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7,
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },

  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackUrl: process.env.LINKEDIN_CALLBACK_URL,
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@udaan.community',
    fromName: process.env.EMAIL_FROM_NAME || 'Udaan Platform',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_UPLOAD, 10) || 10485760, // 10MB
    path: process.env.UPLOAD_PATH || './uploads',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
};

module.exports = { config, validateEnv };
