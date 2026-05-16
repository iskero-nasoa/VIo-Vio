/**
 * VioApp Messenger — Entry Point
 *
 * Boots the Express HTTP server, connects to MongoDB,
 * initialises the Socket.IO WebSocket layer, and
 * handles graceful process shutdown.
 */

require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/config/app');
const connectDB = require('./src/config/database');
const { initSocket, getIo, emitToUser, emitToChat } = require('./src/websocket/socketManager');
const { validateEnv, ensureUploadDirs } = require('./src/utils/startup');

// ─── Startup Phase ───────────────────────────────────

// 1. Validate environment
validateEnv();

// 2. Prepare directory structure
ensureUploadDirs();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// 3. Initialise WebSocket server
initSocket(server);

// ─── Request Context ─────────────────────────────────

/**
 * Attach socket helpers to every request.
 * Controllers can use:
 *   req.io.emitToChat(chatId, event, data)
 *   req.io.emitToUser(userId, event, data)
 */
app.use((req, _res, next) => {
  req.io = {
    instance: getIo(),
    emitToUser,
    emitToChat,
  };
  next();
});

// ─── Server Bootstrap ────────────────────────────────

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start HTTP & WS Server
    server.listen(PORT, () => {
      console.log('──────────────────────────────────────────────────');
      console.log(`✅ VioApp server running on port: ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('──────────────────────────────────────────────────');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// ─── Graceful Shutdown ───────────────────────────────

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 [${signal}] Received. Starting graceful shutdown...`);

  // 1. Close HTTP server (stop accepting new connections)
  server.close(() => {
    console.log('📡 HTTP server closed.');

    // 2. Close Database connection
    mongoose.connection.close(false, () => {
      console.log('📦 MongoDB connection closed.');
      console.log('👋 Goodbye!');
      process.exit(0);
    });
  });

  // Force close after 10s if not shut down cleanly
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ [UnhandledRejection]: ${err.message}`);
  // In production, we might want to shut down gracefully here too
  // gracefulShutdown('unhandledRejection');
});

const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
const fileRoutes = require('./src/routes/fileRoutes');
const groupRoutes = require('./src/routes/groupRoutes');
const express = require('express');
app.use('/api/files', fileRoutes);
app.use('/api/groups', groupRoutes);
app.use('/uploads', express.static('uploads'));