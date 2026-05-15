/**
 * Express Application Configuration
 *
 * Configures middleware (CORS, body-parser, static files)
 * and mounts all API route modules.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { requestLogger } = require('../middleware/requestLogger');
const { errorHandler } = require('../middleware/errorHandler');

// Route imports
const authRoutes = require('../routes/authRoutes');
const userRoutes = require('../routes/userRoutes');
const chatRoutes = require('../routes/chatRoutes');
const messageRoutes = require('../routes/messageRoutes');
const callRoutes = require('../routes/callRoutes');
const notificationRoutes = require('../routes/notificationRoutes');

const app = express();

// ─── Global Middleware ────────────────────────────────

// 1. Request Logging
app.use(requestLogger);

// 2. CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Static Files
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use(`/${uploadDir}`, express.static(path.join(__dirname, `../../${uploadDir}`)));

// ─── API Routes ───────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/notifications', notificationRoutes);

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// ─── Error Handling ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
