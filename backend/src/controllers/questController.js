'use strict';

const { prisma } = require('../db/prisma');
const { sendSuccess, sendError } = require('../utils/response');
const { createNotificationsForMany } = require('../utils/notificationHelper');
const questService = require('../utils/questService');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quests
// Auth: TEACHER
// ─────────────────────────────────────────────────────────────────────────────
const createQuest = async (req, res, next) => {
  try {
    const {
      classId,
      studentId = null,
      title,
      description,
      type,
      target,
      xpReward = 50,
      badgeName = null,
      badgeColor = null,
      startDate,
      endDate,
    } = req.body;

    if (!classId || !title || !description || !type || !target || !startDate || !endDate) {
      return sendError(res, 'classId, title, description, type, target, startDate and endDate are required', 400);
    }

    // Validate type
    const validTypes = ['ATTENDANCE_STREAK', 'AI_BUDDY_SESSIONS', 'ASSIGNMENT_SUBMISSIONS', 'GRADE_TARGET', 'ZERO_ABSENCES_WEEK', 'CUSTOM'];
    if (!validTypes.includes(type)) {
      return sendError(res, `Invalid quest type. Must be one of: ${validTypes.join(', ')}`, 400);
    }

    // Resolve teacher's student record id using user id
    // teacherId in Quest model references User.id (not Student.id)
    const quest = await prisma.quest.create({
      data: {
        teacherId: req.user.id,
        classId,
        studentId: studentId || null,
        title,
        description,
        type,
        target,
        xpReward: parseInt(xpReward),
        badgeName,
        badgeColor,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
      include: {
        teacher: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, section: true } },
      },
    });

    // Notify targeted students
    let targetUserIds = [];
    if (studentId) {
      const stu = await prisma.student.findUnique({
        where: { id: studentId }, select: { userId: true },
      });
      if (stu) targetUserIds = [stu.userId];
    } else {
      // Whole class
      const students = await prisma.student.findMany({
        where: { classId }, select: { userId: true },
      });
      targetUserIds = students.map(s => s.userId).filter(Boolean);
    }

    if (targetUserIds.length) {
      createNotificationsForMany(
        targetUserIds,
        `New Quest: ${title}`,
        `${description} — Complete it to earn +${xpReward} XP for your class!`,
        'info', 'quest', quest.id
      ).catch(e => console.error('[createQuest notification]', e.message));
    }

    return sendSuccess(res, quest, 'Quest created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quests/student/:studentId
// Auth: STUDENT(own) | TEACHER | PARENT
// ─────────────────────────────────────────────────────────────────────────────
const getStudentQuests = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Access control
    if (req.user.role === 'student') {
      const stu = await prisma.student.findUnique({
        where: { id: studentId }, select: { userId: true },
      });
      if (!stu || stu.userId !== req.user.id) {
        return sendError(res, 'Access denied', 403);
      }
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });
    if (!student) return sendError(res, 'Student not found', 404);

    const now = new Date();

    // Fetch all quests for this student's class (class-wide or individual)
    const quests = await prisma.quest.findMany({
      where: {
        classId: student.classId,
        OR: [{ studentId: null }, { studentId: studentId }],
      },
      include: {
        completions: {
          where: { studentId },
        },
        teacher: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const active = [];
    const completed = [];
    const upcoming = [];

    for (const quest of quests) {
      const completion = quest.completions[0] ?? null;
      const isComplete = !!completion;

      const progress = await questService.getQuestProgress(studentId, quest.id);

      const questData = {
        quest: {
          id: quest.id,
          title: quest.title,
          description: quest.description,
          type: quest.type,
          target: quest.target,
          xpReward: quest.xpReward,
          badgeName: quest.badgeName,
          badgeColor: quest.badgeColor,
          startDate: quest.startDate,
          endDate: quest.endDate,
          isActive: quest.isActive,
          teacher: quest.teacher,
        },
        progress: {
          currentValue: progress?.currentValue ?? 0,
          targetValue: progress?.targetValue ?? 0,
          progressPercent: progress?.progressPercent ?? 0,
        },
        isComplete,
      };

      if (isComplete) {
        completed.push({
          ...questData,
          completedAt: completion.completedAt,
          xpAwarded: completion.xpAwarded,
        });
      } else if (new Date(quest.startDate) > now) {
        upcoming.push(questData);
      } else if (quest.isActive && new Date(quest.endDate) >= now) {
        active.push(questData);
      }
    }

    return sendSuccess(res, { active, completed, upcoming });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/quests/class/:classId
// Auth: TEACHER | ADMIN
// ─────────────────────────────────────────────────────────────────────────────
const getClassQuests = async (req, res, next) => {
  try {
    const { classId } = req.params;

    // Get total students in this class
    const totalStudents = await prisma.student.count({ where: { classId } });

    const quests = await prisma.quest.findMany({
      where: { classId },
      include: {
        completions: {
          include: {
            student: { include: { user: { select: { name: true } } } },
          },
        },
        teacher: { select: { id: true, name: true } },
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = quests.map(quest => {
      const targeted = quest.studentId ? 1 : totalStudents;
      const completedCount = quest.completions.length;
      const completionRate = targeted > 0
        ? Math.round((completedCount / targeted) * 100)
        : 0;

      return {
        quest: {
          id: quest.id,
          title: quest.title,
          description: quest.description,
          type: quest.type,
          target: quest.target,
          xpReward: quest.xpReward,
          badgeName: quest.badgeName,
          badgeColor: quest.badgeColor,
          startDate: quest.startDate,
          endDate: quest.endDate,
          isActive: quest.isActive,
          targetStudent: quest.student
            ? { id: quest.studentId, name: quest.student.user?.name }
            : null,
          teacher: quest.teacher,
        },
        stats: {
          totalTargeted: targeted,
          completed: completedCount,
          completionRate,
          completedStudents: quest.completions.map(c => ({
            studentId: c.studentId,
            name: c.student?.user?.name ?? 'Unknown',
            completedAt: c.completedAt,
            xpAwarded: c.xpAwarded,
          })),
        },
      };
    });

    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/quests/:id/complete/:studentId
// Auth: TEACHER — manually marks CUSTOM quest complete
// ─────────────────────────────────────────────────────────────────────────────
const manualComplete = async (req, res, next) => {
  try {
    const { id: questId, studentId } = req.params;
    const { note = null } = req.body;

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) return sendError(res, 'Quest not found', 404);

    // Only CUSTOM quests can be manually completed (or if teacher wants to override)
    if (quest.type !== 'CUSTOM' && req.user.role !== 'admin') {
      return sendError(res, 'Only CUSTOM type quests can be manually completed by a teacher', 400);
    }

    // Verify teacher owns the quest (or is admin)
    if (req.user.role !== 'admin' && quest.teacherId !== req.user.id) {
      return sendError(res, 'You can only complete your own quests', 403);
    }

    // Check if already completed
    const existing = await prisma.questCompletion.findUnique({
      where: { questId_studentId: { questId, studentId } },
    });
    if (existing) {
      return sendError(res, 'Student has already completed this quest', 409);
    }

    // Create completion
    const completion = await prisma.questCompletion.create({
      data: { questId, studentId, xpAwarded: quest.xpReward },
    });

    // Award XP
    classXpService_awardXP(quest.classId, quest.xpReward, studentId, quest.title);

    // Notify student
    const student = await prisma.student.findUnique({
      where: { id: studentId }, select: { userId: true },
    });
    if (student) {
      const { createNotification } = require('../utils/notificationHelper');
      createNotification(
        student.userId,
        `Quest Complete: ${quest.title}!`,
        `Your teacher marked your quest as complete. +${quest.xpReward} XP awarded! 🎉`,
        'success', 'quest', questId
      ).catch(() => {});
    }

    return sendSuccess(res, completion, 'Quest manually completed');
  } catch (err) {
    next(err);
  }
};

// Helper for manual complete XP award
async function classXpService_awardXP(classId, xpReward, triggeredBy, questTitle) {
  try {
    const classXpService = require('../utils/classXpService');
    await classXpService.awardXP(classId, 'TEACHER_BONUS', triggeredBy, xpReward, `Quest Complete: ${questTitle}`);
  } catch (e) {
    console.error('[manualComplete] XP award error:', e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/quests/:id
// Auth: TEACHER (own) | ADMIN
// ─────────────────────────────────────────────────────────────────────────────
const deleteQuest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quest = await prisma.quest.findUnique({ where: { id } });
    if (!quest) return sendError(res, 'Quest not found', 404);

    if (req.user.role !== 'admin' && quest.teacherId !== req.user.id) {
      return sendError(res, 'You can only delete your own quests', 403);
    }

    await prisma.quest.delete({ where: { id } });

    return sendSuccess(res, null, 'Quest deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quests/:id/nudge  — send encouragement to struggling students
// Auth: TEACHER
// ─────────────────────────────────────────────────────────────────────────────
const nudgeStudents = async (req, res, next) => {
  try {
    const { id: questId } = req.params;

    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) return sendError(res, 'Quest not found', 404);

    // Get students who haven't completed
    const completedStudentIds = (await prisma.questCompletion.findMany({
      where: { questId },
      select: { studentId: true },
    })).map(c => c.studentId);

    const students = await prisma.student.findMany({
      where: {
        classId: quest.classId,
        id: { notIn: completedStudentIds },
      },
      select: { userId: true },
    });

    const userIds = students.map(s => s.userId).filter(Boolean);
    if (!userIds.length) {
      return sendSuccess(res, { nudged: 0 }, 'All students have already completed this quest');
    }

    await createNotificationsForMany(
      userIds,
      `💪 Keep going! "${quest.title}"`,
      `You're making progress! Complete this quest to earn +${quest.xpReward} XP for your class.`,
      'info', 'quest', questId
    );

    return sendSuccess(res, { nudged: userIds.length }, `Encouragement sent to ${userIds.length} student(s)`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createQuest,
  getStudentQuests,
  getClassQuests,
  manualComplete,
  deleteQuest,
  nudgeStudents,
};
