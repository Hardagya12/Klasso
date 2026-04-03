'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const moodService = require('../services/mood.service');
const prisma = require('../db/prisma');

/**
 * POST /api/mood/checkin
 * Body: { mood, note? }
 */
const postCheckIn = async (req, res, next) => {
  try {
    const { mood, note } = req.body;
    if (!mood) return sendError(res, 'Mood is required', 400);

    const studentIdResult = await prisma.student.findUnique({
      where: { userId: req.user.id },
      select: { id: true, classId: true }
    });

    if (!studentIdResult) return sendError(res, 'Student profile not found', 404);
    const studentId = studentIdResult.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert today's checkin
    await prisma.moodCheckIn.upsert({
      where: {
        studentId_date: {
          studentId: studentId,
          date: today
        }
      },
      update: {
        mood,
        note
      },
      create: {
        studentId,
        mood,
        note,
        date: today
      }
    });

    // Run AI analysis
    await moodService.analyzeMoodPattern(studentId).catch(e => {
        console.error("Mood Pattern check failed but checkin succeeded", e);
    });

    // Get updated streak to return back
    const summary = await moodService.getMoodSummary(studentId);

    return sendSuccess(res, { 
      checkedIn: true, 
      streak: summary.streak, 
      message: 'Logged! Take care today ✦' 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/mood/my-summary
 * Query: ?from=&to=
 */
const getMySummary = async (req, res, next) => {
  try {
    const studentIdResult = await prisma.student.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    });

    if (!studentIdResult) return sendError(res, 'Student profile not found', 404);

    const { from, to } = req.query;
    const summary = await moodService.getMoodSummary(studentIdResult.id, from, to);

    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/mood/alerts
 * Only teacher
 */
const getTeacherAlerts = async (req, res, next) => {
  try {
    const alerts = await prisma.moodAlert.findMany({
      where: { teacherId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // Formatting it without student name as per constraints
    const cleanAlerts = alerts.map(a => ({
      id: a.id,
      message: a.message,
      isRead: a.isRead,
      createdAt: a.createdAt,
      studentNameFallback: "A student in your class" // explicitly obfuscated
    }));

    // Aggregate overall mood stats for all kids in this teacher's homeroom
    // Find groups of classes taught 
    const homeroomClasses = await prisma.class.findMany({
      where: { classTeacherId: req.user.id },
      select: { id: true }
    });

    let todayAgg = { GREAT: 0, GOOD: 0, OKAY: 0, SAD: 0, STRESSED: 0, total: 0 };
    if (homeroomClasses.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const checkIns = await prisma.moodCheckIn.findMany({
        where: {
          date: today,
          student: {
            classId: { in: homeroomClasses.map(c => c.id) }
          }
        }
      });

      checkIns.forEach(c => {
         todayAgg[c.mood]++;
         todayAgg.total++;
      });
    }

    return sendSuccess(res, {
      alerts: cleanAlerts,
      classAggregate: todayAgg
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/mood/alerts/:id/read
 */
const markAlertRead = async (req, res, next) => {
  try {
    const alertId = req.params.id;
    const alert = await prisma.moodAlert.updateMany({
      where: { 
        id: alertId,
        teacherId: req.user.id
      },
      data: { isRead: true }
    });

    if (alert.count === 0) return sendError(res, 'Alert not found or unauthorized', 404);
    
    return sendSuccess(res, { marked: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postCheckIn,
  getMySummary,
  getTeacherAlerts,
  markAlertRead
};
