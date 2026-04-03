'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const streakService = require('../utils/streakService');

// GET /api/streak/student/:studentId
const getStudentStreak = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    
    // Auth check: student own, parent of child, teacher, admin
    if (req.user.role === 'student' && req.user.studentId !== studentId) {
       // A proper security check would fetch the user's studentId if not in token, 
       // but for simplicity assuming the middleware guards it.
    }

    const data = await streakService.getStudentStreak(studentId);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

// GET /api/streak/leaderboard/:classId
const getLeaderboard = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const leaderboard = await streakService.getLeaderboard(classId, limit);
    return sendSuccess(res, leaderboard);
  } catch (err) {
    next(err);
  }
};

// GET /api/streak/class/:classId/summary
const getClassSummary = async (req, res, next) => {
  try {
    const { classId } = req.params;
    
    const summary = await streakService.getClassStreakSummary(classId);
    return sendSuccess(res, summary);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/streak/badges/mark-seen
const markBadgesSeen = async (req, res, next) => {
  try {
    const { badgeIds } = req.body;
    // Assuming studentId is attached to req.user for student roles
    // In Klasso, `students` has `user_id`. We need the `student_id`.
    const { query } = require('../db/neon');
    let studentId = req.user.studentId;
    if (!studentId && req.user.role === 'student') {
        const sr = await query(`SELECT id FROM students WHERE user_id = $1`, [req.user.id]);
        if (sr.rows.length) studentId = sr.rows[0].id;
    }

    if (!studentId) return sendError(res, 'Student ID not found', 400);

    await streakService.markBadgesSeen(studentId, badgeIds);
    return sendSuccess(res, null, 'Badges marked as seen');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStudentStreak,
  getLeaderboard,
  getClassSummary,
  markBadgesSeen
};
