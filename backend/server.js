'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const { testConnection } = require('./src/db/neon');
const errorHandler       = require('./src/middleware/errorHandler');

// ── Routes ─────────────────────────────────────────────────────────────────────
const authRoutes     = require('./src/routes/auth');
const userRoutes     = require('./src/routes/users');
const classRoutes    = require('./src/routes/classes');
const subjectRoutes  = require('./src/routes/subjects');
const studentRoutes  = require('./src/routes/students');
const attendanceRoutes = require('./src/routes/attendance');
const examRoutes     = require('./src/routes/exams');
const assignmentRoutes = require('./src/routes/assignments');
const timetableRoutes  = require('./src/routes/timetable');
const announcementRoutes = require('./src/routes/announcements');
const messageRoutes  = require('./src/routes/messages');
const notificationRoutes = require('./src/routes/notifications');
const feeRoutes      = require('./src/routes/fees');
const reportRoutes   = require('./src/routes/reports');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Global Middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/classes',       classRoutes);
app.use('/api/subjects',      subjectRoutes);
app.use('/api/students',      studentRoutes);
app.use('/api/attendance',    attendanceRoutes);
app.use('/api/exams',         examRoutes);
app.use('/api/assignments',   assignmentRoutes);
app.use('/api/timetable',     timetableRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fees',          feeRoutes);
app.use('/api/reports',       reportRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────────
const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀  Klasso API running on http://localhost:${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
