'use strict';

const router = require('express').Router();
const { authenticateJWT, authorizeRole } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  startSession,
  markAttendance,
  generateQRToken,
  scanQRToken,
  voiceAttendance,
  getAttendanceByClass,
  getLowAttendanceStudents,
  getAttendanceStats,
  updateAttendanceRecord,
  getLiveAttendance,
} = require('../controllers/attendanceController');
const { processVoiceAttendance } = require('../controllers/voiceAttendanceController');

// ── Public route (no auth) ────────────────────────────────────────────────────
// POST /api/attendance/qr/scan  — student scans QR code (no login needed)
router.post('/qr/scan', validateBody(['token']), scanQRToken);

// ── All routes below require authentication ───────────────────────────────────
router.use(authenticateJWT);

// POST /api/attendance/session/start
router.post(
  '/session/start',
  authorizeRole('teacher', 'admin'),
  validateBody(['class_id']),
  startSession
);

// POST /api/attendance/mark
router.post(
  '/mark',
  authorizeRole('teacher', 'admin'),
  validateBody(['records']),
  markAttendance
);

// POST /api/attendance/qr/generate
router.post(
  '/qr/generate',
  authorizeRole('teacher', 'admin'),
  validateBody(['class_id']),
  generateQRToken
);

// POST /api/attendance/voice
router.post(
  '/voice',
  authorizeRole('teacher', 'admin'),
  validateBody(['class_id', 'present_names']),
  voiceAttendance
);

// POST /api/attendance/voice-ai  — AI-powered voice command processing
router.post(
  '/voice-ai',
  authorizeRole('teacher', 'admin'),
  validateBody(['class_id', 'command']),
  processVoiceAttendance
);

// GET /api/attendance  — ?class_id=&date=
router.get('/', validateQuery(['class_id']), getAttendanceByClass);

// GET /api/attendance/low  — ?threshold=75&class_id=
router.get('/low', authorizeRole('teacher', 'admin'), getLowAttendanceStudents);

// GET /api/attendance/stats/:class_id
router.get('/stats/:class_id', getAttendanceStats);

// GET /api/attendance/live/:class_id
router.get('/live/:class_id', authorizeRole('teacher', 'admin'), getLiveAttendance);

// PUT /api/attendance/records/:id
router.put(
  '/records/:id',
  authorizeRole('teacher', 'admin'),
  validateBody(['status']),
  updateAttendanceRecord
);

module.exports = router;

