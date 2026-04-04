const prisma = require('../db/prisma');

const XP_LEVELS = [
  { level: 1, title: 'Seedlings', min: 0, max: 499 },
  { level: 2, title: 'Sprouts', min: 500, max: 1199 },
  { level: 3, title: 'Explorers', min: 1200, max: 2499 },
  { level: 4, title: 'Champions', min: 2500, max: 4499 },
  { level: 5, title: 'Legends', min: 4500, max: 9999999 },
];

const XP_AMOUNTS = {
  FULL_ATTENDANCE_DAY: 30,
  HIGH_ATTENDANCE_DAY: 15,
  ALL_HOMEWORK_SUBMITTED: 50,
  HIGH_SUBMISSION_RATE: 25,
  CLASS_TEST_AVG_ABOVE_80: 100,
  CLASS_TEST_AVG_ABOVE_70: 50,
  ZERO_LATE_SUBMISSIONS: 20,
  LEVEL_UP_BONUS: 200,
  TEACHER_BONUS: 0, // Variable amount passed by teacher
  STREAK_MILESTONE: 75,
};

const classXpService = {
  getLevelsConfig() {
    return XP_LEVELS;
  },

  async awardXP(classId, type, triggeredBy = null, customAmount = null, customDescription = null) {
    try {
      let amount = customAmount ?? XP_AMOUNTS[type];
      if (!amount) amount = 10; // Fallback

      let description = customDescription || `Earned XP for ${type.replace(/_/g, ' ').toLowerCase()}`;

      // Find or create classXP
      const curDate = new Date();
      const day = curDate.getDay() || 7;
      if (day !== 1) curDate.setHours(-24 * (day - 1));
      const weekStartStr = curDate.toISOString().split('T')[0];

      let classXpRecord = await prisma.classXP.findUnique({
        where: { classId },
      });

      if (!classXpRecord) {
        classXpRecord = await prisma.classXP.create({
          data: {
            classId,
            totalXP: 0,
            currentLevel: 1,
            currentTitle: XP_LEVELS[0].title,
            xpToNextLevel: XP_LEVELS[0].max + 1,
            weeklyXP: 0,
            weekStartDate: new Date(weekStartStr)
          }
        });
      }

      // Reset weekly XP if it's a new week
      let weeklyXP = classXpRecord.weeklyXP;
      const recordWeekStart = new Date(classXpRecord.weekStartDate).toISOString().split('T')[0];
      if (recordWeekStart !== weekStartStr) {
        weeklyXP = 0;
      }

      const updatedTotal = classXpRecord.totalXP + amount;
      weeklyXP += amount;

      // Calculate level
      let newLevel = classXpRecord.currentLevel;
      let newTitle = classXpRecord.currentTitle;
      let newNextXp = classXpRecord.xpToNextLevel;
      let leveledUp = false;

      const levelDef = XP_LEVELS.find(l => updatedTotal >= l.min && updatedTotal <= l.max) || XP_LEVELS[XP_LEVELS.length - 1];

      if (levelDef.level > classXpRecord.currentLevel) {
        leveledUp = true;
        newLevel = levelDef.level;
        newTitle = levelDef.title;
        newNextXp = levelDef.max + 1;
      }

      // Perform updates
      const [updatedClassXp, xpEvent] = await prisma.$transaction([
        prisma.classXP.update({
          where: { classId },
          data: {
            totalXP: updatedTotal,
            currentLevel: newLevel,
            currentTitle: newTitle,
            xpToNextLevel: newNextXp,
            weeklyXP: weeklyXP,
            weekStartDate: new Date(weekStartStr)
          }
        }),
        prisma.xPEvent.create({
          data: {
            classXpId: classXpRecord.id,
            type: type,
            xpEarned: amount,
            description: description,
            triggeredBy: triggeredBy
          }
        })
      ]);

      // Handle Notifications and Recursive Level Up Bonus asynchronously outside transaction
      if (leveledUp) {
        // Run asynchronously so it doesn't block the response
        this.handleLevelUpBonus(classId, newLevel, newTitle, triggeredBy).catch(e => console.error("Level up handle err:", e));
      }

      return {
        classXP: updatedClassXp,
        event: xpEvent,
        leveledUp: leveledUp,
        newLevel: newLevel
      };
    } catch (err) {
      console.error('Error awarding XP:', err);
      return null;
    }
  },

  async handleLevelUpBonus(classId, newLevel, newTitle, triggeredBy) {
    try {
      // Award LEVEL_UP_BONUS
      const amt = XP_AMOUNTS.LEVEL_UP_BONUS;
      await this.awardXP(
        classId,
        'LEVEL_UP_BONUS',
        triggeredBy,
        amt,
        `Level Up Bonus! Reached Level ${newLevel}`
      );
      
      // Notify students (Mocking notification insert for now if we don't have Notification service ready)
      await prisma.notification.createMany({
         data: (await prisma.student.findMany({ where: { classId } })).map(s => ({
            userId: s.userId,
            title: `Class reached Level ${newLevel}!`,
            message: `Congratulations! Your class is now titled ${newTitle}.`,
            type: 'system',
            schoolId: s.schoolId
         }))
      });
    } catch (error) {
       console.error("Failed to process level up notification", error);
    }
  },

  async checkAndAwardDailyXP(classId, date, markerId) {
    try {
      const session = await prisma.attendanceSession.findFirst({
        where: { classId, date: new Date(date), sessionType: 'daily' },
        include: { records: true }
      });

      if (!session || !session.records || session.records.length === 0) return;

      const total = session.records.length;
      const present = session.records.filter(r => r.status === 'present').length;
      const pct = (present / total) * 100;

      if (pct === 100) {
        await this.awardXP(classId, 'FULL_ATTENDANCE_DAY', markerId, null, 'Full attendance! 100% present.');
      } else if (pct > 90) {
        await this.awardXP(classId, 'HIGH_ATTENDANCE_DAY', markerId, null, `High attendance! ${Math.round(pct)}% present.`);
      }
    } catch (err) {
      console.error('checkAndAwardDailyXP error:', err);
    }
  },

  async checkAndAwardTestXP(classId, examId, teacherId) {
     try {
        const marks = await prisma.mark.findMany({
           where: { examId },
           include: { student: true }
        });
        
        // Filter to only this class
        const classMarks = marks.filter(m => m.student.classId === classId);
        if (classMarks.length === 0) return;

        let totalScore = 0;
        let totalMax = 0;
        classMarks.forEach(m => {
           if (m.obtainedMarks && m.maxMarks) {
              totalScore += m.obtainedMarks;
              totalMax += m.maxMarks;
           }
        });

        const pct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
        if (pct > 80) {
           await this.awardXP(classId, 'CLASS_TEST_AVG_ABOVE_80', teacherId, null, `Amazing! Class test average >80%`);
        } else if (pct >= 70) {
           await this.awardXP(classId, 'CLASS_TEST_AVG_ABOVE_70', teacherId, null, `Great job! Class test average >70%`);
        }
     } catch(err) {
        console.error('checkAndAwardTestXP err:', err);
     }
  },

  async getClassXPDetails(classId) {
    try {
      const classXp = await prisma.classXP.findUnique({
        where: { classId },
        include: {
          class: true,
          events: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });
      if (!classXp) return null;

      const levelDef = XP_LEVELS.find(l => l.level === classXp.currentLevel);
      const minXpForLevel = levelDef ? levelDef.min : 0;
      const progressXP = classXp.totalXP - minXpForLevel;
      const requiredXP = classXp.xpToNextLevel - minXpForLevel;
      let progressPct = requiredXP > 0 ? (progressXP / requiredXP) * 100 : 100;
      if (progressPct > 100) progressPct = 100;

      return {
        ...classXp,
        progressPct: Math.round(progressPct)
      };
    } catch (err) {
      console.error('getClassXPDetails error:', err);
      return null;
    }
  }
};

module.exports = classXpService;
