'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');

const { testConnection } = require('./src/db/neon');
const errorHandler = require('./src/middleware/errorHandler');
const { setupSocketIO } = require('./src/socket');

// ── Routes ─────────────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const classRoutes = require('./src/routes/classes');
const subjectRoutes = require('./src/routes/subjects');
const studentRoutes = require('./src/routes/students');
const attendanceRoutes = require('./src/routes/attendance');
const examRoutes = require('./src/routes/exams');
const marksRoutes = require('./src/routes/marks');
const assignmentRoutes = require('./src/routes/assignments');
const timetableRoutes = require('./src/routes/timetable');
const announcementRoutes = require('./src/routes/announcements');
const messageRoutes = require('./src/routes/messages');
const notificationRoutes = require('./src/routes/notifications');
const xpRoutes = require('./src/routes/classXp');
const feeRoutes = require('./src/routes/fees');
const reportRoutes = require('./src/routes/reports');
const lessonPlanRoutes = require('./src/routes/lessonPlans');
const analyticsRoutes = require('./src/routes/analytics');
const studyMaterialRoutes = require('./src/routes/studyMaterials');
const documentRoutes = require('./src/routes/documents');
const eventRoutes = require('./src/routes/events');
const aiRoutes = require('./src/routes/ai');
const questRoutes = require('./src/routes/quests');
const duelRoutes = require('./src/routes/duels');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Global Middleware ──────────────────────────────────────────────────────────
app.use(helmet());
const corsOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes('*')) return callback(null, true);
    if (corsOrigins.some((o) => o === origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const server = http.createServer(app);
setupSocketIO(server, corsOrigins);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

const streakRoutes = require('./src/routes/streak');
const moodRoutes = require('./src/routes/mood');
const timeCapsuleRoutes = require('./src/routes/timecapsule');

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/duels', duelRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/timecapsule', timeCapsuleRoutes);

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────────
const start = async () => {
  await testConnection();
  server.listen(PORT, () => {
    console.log(`🚀  Klasso API running on http://localhost:${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV}`);
    console.log(`⚡  Socket.IO real-time enabled`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
