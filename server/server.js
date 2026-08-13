const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/auth');
const noteRoutes = require('./src/routes/notes');
const taskRoutes = require('./src/routes/tasks');
const documentRoutes = require('./src/routes/documents');
const voiceRoutes = require('./src/routes/voice');
const fileRoutes = require('./src/routes/files');
const profileRoutes = require('./src/routes/profile');
const searchRoutes = require('./src/routes/search');
const adminRoutes = require('./src/routes/admin');

const app = express();

// Connect DB
connectDB();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Root route & Health check
app.get('/', (req, res) => {
  const clientDist = path.join(__dirname, '../client/dist');
  if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }
  res.json({
    success: true,
    message: '🚀 AI Workspace API Server is Live & Running!',
    healthCheck: '/api/health',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    endpoints: {
      auth: '/api/auth',
      notes: '/api/notes',
      tasks: '/api/tasks',
      documents: '/api/documents',
      files: '/api/files',
      voice: '/api/voice',
      search: '/api/search',
      admin: '/api/admin',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'WorkSpace API is running', timestamp: new Date() });
});

// Serve frontend static build if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 WorkSpace Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}\n`);
});

module.exports = app;
