'use strict';

/**
 * questService.js
 *
 * Core logic for Study Quests.
 * Called automatically from attendance/grade/submission/ai controllers.
 * Uses Prisma for all DB operations.
 */

const { prisma } = require('../db/prisma');
const classXpService = require('./classXpService');
const { createNotification, createNotificationsForMany } = require('./notificationHelper');

// ─── Trigger → QuestType mapping ─────────────────────────────────────────────
const TRIGGER_TYPES = {
  attendance: ['ATTENDANCE_STREAK', 'ZERO_ABSENCES_WEEK'],
  grade: ['GRADE_TARGET'],
  submission: ['ASSIGNMENT_SUBMISSIONS'],
  aichat: ['AI_BUDDY_SESSIONS'],
};

// ─── Evaluate a single quest target for a student ────────────────────────────
async function evaluateQuestTarget(quest, studentId) {
  const { type, target, startDate, endDate } = quest;

  try {
    switch (type) {
      case 'ATTENDANCE_STREAK': {
        const streak = await prisma.attendanceStreak.findUnique({
          where: { studentId },
        });
        return (streak?.currentStreak ?? 0) >= (target.value ?? 0);
      }

      case 'ZERO_ABSENCES_WEEK': {
        const weekStart = new Date();
        weekStart.setHours(0, 0, 0, 0);
        const day = weekStart.getDay() || 7;
        weekStart.setDate(weekStart.getDate() - (day - 1));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 4); // Mon–Fri

        const absentCount = await prisma.attendanceRecord.count({
          where: {
            studentId,
            status: 'absent',
            session: {
              date: { gte: weekStart, lte: weekEnd },
            },
          },
        });
        return absentCount === 0;
      }

      case 'AI_BUDDY_SESSIONS': {
        // Count unique ai chat days in the current week
        // We track this via a raw prisma query on ai_chat_sessions if available
        // Graceful fallback if table doesn't exist
        try {
          const weekStart = new Date();
          const day = weekStart.getDay() || 7;
          weekStart.setDate(weekStart.getDate() - (day - 1));
          weekStart.setHours(0, 0, 0, 0);

          const count = await prisma.$queryRaw`
            SELECT COUNT(*) AS cnt
            FROM ai_chat_sessions
            WHERE student_id = ${studentId}::uuid
              AND created_at >= ${weekStart}
          `;
          return parseInt(count[0]?.cnt ?? 0) >= (target.value ?? 0);
        } catch {
          return false; // table doesn't exist yet
        }
      }

      case 'ASSIGNMENT_SUBMISSIONS': {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const count = await prisma.assignmentSubmission.count({
          where: {
            studentId,
            submittedAt: { gte: monthStart },
          },
        });
        return count >= (target.value ?? 0);
      }

      case 'GRADE_TARGET': {
        if (!target.subjectId) return false;
        // Find latest mark for this subject above threshold
        const mark = await prisma.mark.findFirst({
          where: {
            studentId,
            examSubject: { subjectId: target.subjectId },
          },
          include: { examSubject: true },
          orderBy: { enteredAt: 'desc' },
        });
        if (!mark) return false;
        const pct = (parseFloat(mark.score) / parseFloat(mark.examSubject.maxMarks)) * 100;
        return pct >= (target.value ?? 0);
      }

      case 'CUSTOM':
        return false; // always false — teacher marks manually

      default:
        return false;
    }
  } catch (err) {
    console.error(`[questService] evaluateQuestTarget error for ${type}:`, err.message);
    return false;
  }
}

// ─── Get current value for progress display ───────────────────────────────────
async function getCurrentValue(quest, studentId) {
  const { type, target } = quest;

  try {
    switch (type) {
      case 'ATTENDANCE_STREAK': {
        const streak = await prisma.attendanceStreak.findUnique({ where: { studentId } });
        return streak?.currentStreak ?? 0;
      }
      case 'ZERO_ABSENCES_WEEK': {
        const weekStart = new Date();
        weekStart.setHours(0, 0, 0, 0);
        const day = weekStart.getDay() || 7;
        weekStart.setDate(weekStart.getDate() - (day - 1));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 4);
        const absentCount = await prisma.attendanceRecord.count({
          where: { studentId, status: 'absent', session: { date: { gte: weekStart, lte: weekEnd } } },
        });
        // present days this week (5 - absences)
        return Math.max(0, (target.value ?? 5) - absentCount);
      }
      case 'AI_BUDDY_SESSIONS': {
        try {
          const weekStart = new Date();
          const day = weekStart.getDay() || 7;
          weekStart.setDate(weekStart.getDate() - (day - 1));
          weekStart.setHours(0, 0, 0, 0);
          const count = await prisma.$queryRaw`
            SELECT COUNT(*) AS cnt FROM ai_chat_sessions
            WHERE student_id = ${studentId}::uuid AND created_at >= ${weekStart}
          `;
          return parseInt(count[0]?.cnt ?? 0);
        } catch { return 0; }
      }
      case 'ASSIGNMENT_SUBMISSIONS': {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return await prisma.assignmentSubmission.count({
          where: { studentId, submittedAt: { gte: monthStart } },
        });
      }
      case 'GRADE_TARGET': {
        if (!target.subjectId) return 0;
        const mark = await prisma.mark.findFirst({
          where: { studentId, examSubject: { subjectId: target.subjectId } },
          include: { examSubject: true },
          orderBy: { enteredAt: 'desc' },
        });
        if (!mark) return 0;
        return Math.round((parseFloat(mark.score) / parseFloat(mark.examSubject.maxMarks)) * 100);
      }
      case 'CUSTOM':
        return 0;
      default:
        return 0;
    }
  } catch {
    return 0;
  }
}

// ─── Main: check and complete quests ─────────────────────────────────────────
/**
 * checkQuestCompletions(studentId, triggerType)
 * Called fire-and-forget from attendance/grade/submission/ai controllers.
 */
async function checkQuestCompletions(studentId, triggerType) {
  try {
    const relevantTypes = TRIGGER_TYPES[triggerType] || [];
    if (!relevantTypes.length) return;

    // Fetch student's class
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true, userId: true },
    });
    if (!student?.classId) return;

    const now = new Date();

    // Find active quests targeting this student (class-wide OR individual)
    const quests = await prisma.quest.findMany({
      where: {
        classId: student.classId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        type: { in: relevantTypes },
        OR: [
          { studentId: null },         // class-wide
          { studentId: studentId },    // individual
        ],
      },
    });

    for (const quest of quests) {
      // Skip if already completed
      const existing = await prisma.questCompletion.findUnique({
        where: { questId_studentId: { questId: quest.id, studentId } },
      });
      if (existing) continue;

      // Evaluate target
      const met = await evaluateQuestTarget(quest, studentId);
      if (!met) continue;

      // Create completion
      await prisma.questCompletion.create({
        data: { questId: quest.id, studentId, xpAwarded: quest.xpReward },
      });

      // Award XP to class
      classXpService.awardXP(
        quest.classId,
        'TEACHER_BONUS',
        studentId,
        quest.xpReward,
        `Quest Complete: ${quest.title}`
      ).catch(e => console.error('[questService] XP award error:', e.message));

      // Notify student
      createNotification(
        student.userId,
        `Quest Complete: ${quest.title}!`,
        `You completed a quest and earned +${quest.xpReward} XP for your class. 🎉`,
        'success', 'quest', quest.id
      ).catch(() => {});

      // Notify parents
      const parents = await prisma.studentParent.findMany({
        where: { studentId },
        select: { parentId: true },
      });
      const studentUser = await prisma.user.findUnique({
        where: { id: student.userId }, select: { name: true },
      });
      if (parents.length) {
        createNotificationsForMany(
          parents.map(p => p.parentId),
          `${studentUser?.name ?? 'Your child'} completed a quest!`,
          `${quest.title} — earned +${quest.xpReward} XP`,
          'success', 'quest', quest.id
        ).catch(() => {});
      }

      // Award custom badge if quest has one
      if (quest.badgeName) {
        try {
          // Find or create a SPECIAL badge record for this quest badge
          let badge = await prisma.badge.findFirst({
            where: { name: quest.badgeName, type: 'SPECIAL' },
          });
          if (!badge) {
            badge = await prisma.badge.create({
              data: {
                name: quest.badgeName,
                description: `Quest reward: ${quest.title}`,
                type: 'SPECIAL',
                threshold: 0,
                iconName: 'quest_badge',
                color: quest.badgeColor || '#3ECFB2',
                rarity: 'RARE',
              },
            });
          }
          // Award to student (upsert — safe if already owned)
          await prisma.studentBadge.upsert({
            where: { studentId_badgeId: { studentId, badgeId: badge.id } },
            create: { studentId, badgeId: badge.id },
            update: {},
          });
        } catch (e) {
          console.error('[questService] badge award error:', e.message);
        }
      }
    }
  } catch (err) {
    console.error('[questService] checkQuestCompletions error:', err.message);
    // Fire-and-forget — never throws
  }
}

// ─── Get quest progress for a student ────────────────────────────────────────
async function getQuestProgress(studentId, questId) {
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) return null;

  const completion = await prisma.questCompletion.findUnique({
    where: { questId_studentId: { questId, studentId } },
  });

  const isComplete = !!completion;
  const targetValue = quest.target?.value ?? 0;
  const currentValue = isComplete ? targetValue : await getCurrentValue(quest, studentId);
  const progressPercent = targetValue > 0
    ? Math.min(100, Math.round((currentValue / targetValue) * 100))
    : (isComplete ? 100 : 0);

  return {
    quest,
    currentValue,
    targetValue,
    progressPercent,
    isComplete,
    completedAt: completion?.completedAt ?? null,
    xpAwarded: completion?.xpAwarded ?? null,
  };
}

module.exports = { checkQuestCompletions, getQuestProgress, evaluateQuestTarget };
