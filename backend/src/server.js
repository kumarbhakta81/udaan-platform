const http = require('http');
const { config, validateEnv } = require('./config/env');
const logger = require('./utils/logger');

// ── Validate environment variables before starting ─────────────────────────
try {
  validateEnv();
} catch (err) {
  logger.error(`Environment validation failed: ${err.message}`);
  process.exit(1);
}

// ── Import after env validation ────────────────────────────────────────────
const app = require('./app');
const { connectDB } = require('./config/database');

// ── Create HTTP Server ─────────────────────────────────────────────────────
const server = http.createServer(app);

// ── Socket.io Setup (initialized here, used across the app) ───────────────
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: [config.frontendUrl, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make io accessible throughout the app
app.set('io', io);

// Basic Socket.io connection handling
io.on('connection', (socket) => {
  logger.debug(`Socket connected: ${socket.id}`);

  // Join user to their personal room for targeted notifications
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      logger.debug(`User ${userId} joined their personal room`);
    }
  });

  socket.on('disconnect', (reason) => {
    logger.debug(`Socket disconnected: ${socket.id} - Reason: ${reason}`);
  });
});

// ── Start Server ───────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP server
    server.listen(config.port, () => {
      logger.info('═══════════════════════════════════════════');
      logger.info(`  🚀 Udaan Backend Server Started`);
      logger.info(`  Environment : ${config.env}`);
      logger.info(`  Port        : ${config.port}`);
      logger.info(`  API Base    : /api/${config.apiVersion}`);
      logger.info(`  Health      : http://localhost:${config.port}/health`);
      logger.info('═══════════════════════════════════════════');
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// ── Graceful Shutdown ──────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    const { disconnectDB } = require('./config/database');
    await disconnectDB();

    logger.info('Graceful shutdown complete.');
    process.exit(0);
  });

  // Force shutdown after 10s if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Unhandled Rejection / Exception Handlers ───────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

module.exports = { server, io };
