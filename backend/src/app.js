const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const { config } = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { apiLimiter } = require('./middleware/rateLimiter');

// ── Initialize Express App ─────────────────────────────────────────────────
const app = express();

// ── Trust Proxy (for rate limiting behind reverse proxy) ───────────────────
app.set('trust proxy', 1);

// ── Security Middleware ────────────────────────────────────────────────────

// HTTP security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: config.env === 'production' ? undefined : false,
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      config.frontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── Request Parsing Middleware ─────────────────────────────────────────────

// Parse JSON request bodies (limit 10mb)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// ── Data Sanitization ──────────────────────────────────────────────────────

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: [
    'skills', 'expertise', 'languages', 'tags', 'category',
    'status', 'sort', 'fields',
  ],
}));

// ── Performance Middleware ─────────────────────────────────────────────────

// Gzip compression for responses
app.use(compression());

// ── HTTP Request Logging ───────────────────────────────────────────────────
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// ── Static Files ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rate Limiting ──────────────────────────────────────────────────────────
app.use(`/api/${config.apiVersion}`, apiLimiter);

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'Udaan Backend API',
    version: config.apiVersion,
    environment: config.env,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use(`/api/${config.apiVersion}/auth`, require('./routes/authRoutes'));
app.use(`/api/${config.apiVersion}/users`, require('./routes/userRoutes'));
app.use(`/api/${config.apiVersion}/experts`, require('./routes/expertRoutes'));
app.use(`/api/${config.apiVersion}/mentorship`, require('./routes/mentorshipRoutes'));
app.use(`/api/${config.apiVersion}/forum`, require('./routes/forumRoutes'));
app.use(`/api/${config.apiVersion}/resources`, require('./routes/resourceRoutes'));
app.use(`/api/${config.apiVersion}/notifications`, require('./routes/notificationRoutes'));
app.use(`/api/${config.apiVersion}/messages`, require('./routes/messageRoutes'));
app.use(`/api/${config.apiVersion}/admin`, require('./routes/adminRoutes'));

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler ───────────────────────────────────────────────────
// Must be last middleware with 4 arguments
app.use(errorHandler);

module.exports = app;
