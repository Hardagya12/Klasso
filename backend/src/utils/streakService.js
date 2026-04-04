'use strict';

const { query } = require('../db/neon');
const { createNotification } = require('./notificationHelper');

// Helper to calculate days difference
const diffDays = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setUTCHours(0,0,0,0);
  d2.setUTCHours(0,0,0,0);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

const streakService = {

  /**
   * Updates student's streak based on new attendance status.
   * Call this AFTER saving the attendance record.
   */
  async updateStreak(studentId, date, status) {
    const recordDate = new Date(date);
    
    // Get current streak
    const streakRes = await query(`SELECT * FROM attendance_streaks WHERE student_id = $1`, [studentId]);
    if (streakRes.rows.length === 0) return null;
    
    let { id, current_streak, longest_streak, last_present_date, total_present_days } = streakRes.rows[0];

    const isPresent = status === 'present' || status === 'late';
    let changed = false;

    if (isPresent) {
      if (!last_present_date) {
        // First ever present
        current_streak = 1;
        longest_streak = 1;
        total_present_days = 1;
        last_present_date = recordDate;
        changed = true;
      } else {
        const daysSinceLast = diffDays(last_present_date, recordDate);
        if (daysSinceLast > 0) { // Future date or next day
          // For a real app, grace period logic skips weekends.
          // Simplification: if diffDays >= 2, streak might be broken unless it's a weekend.
          // We'll trust the sequence. If they're present now, we check the gap.
          // A gap > 3 days (e.g. absent > 2 days) breaks it. Weekend is 2 days gap (Friday->Monday = 3 days diff)
          if (daysSinceLast > 3) {
            current_streak = 1; // broken!
          } else {
            current_streak += 1;
          }
          
          if (current_streak > longest_streak) {
            longest_streak = current_streak;
          }
          total_present_days += 1;
          last_present_date = recordDate;
          changed = true;
        }
      }
    } else {
      // Absent: do we reset immediately? Spec: "reset only if 2+ consecutive absences"
      // Simplification: the streak breaks if the next time they are present, 
      // the gap is > 3 days. We don't necessarily set streak=0 immediately, 
      // but to reflect real-time "lost streak":
      const daysSinceLast = last_present_date ? diffDays(last_present_date, recordDate) : 0;
      if (daysSinceLast >= 2) {
         if (current_streak > 0) {
            current_streak = 0;
            changed = true;
         }
      }
    }

    if (changed) {
      await query(`
        UPDATE attendance_streaks
        SET current_streak = $1, longest_streak = $2, last_present_date = $3, total_present_days = $4, updated_at = NOW()
        WHERE id = $5
      `, [current_streak, longest_streak, last_present_date, total_present_days, id]);
      
      const newStreak = { student_id: studentId, current_streak, longest_streak, total_present_days, last_present_date };
      await this.checkAndAwardBadges(studentId, newStreak);
      return newStreak;
    }

    return streakRes.rows[0];
  },

  /**
   * Checks thresholds and awards badged
   */
  async checkAndAwardBadges(studentId, streak) {
    // Fetch all available badges
    const badgesRes = await query(`SELECT * FROM badges`);
    const allBadges = badgesRes.rows;

    // Fetch student's existing badges
    const earnedRes = await query(`SELECT badge_id FROM student_badges WHERE student_id = $1`, [studentId]);
    const earnedBadgeIds = new Set(earnedRes.rows.map(r => r.badge_id));

    // Get the user_id for notification
    const userRes = await query(`SELECT user_id FROM students WHERE id = $1`, [studentId]);
    if (userRes.rows.length === 0) return;
    const userId = userRes.rows[0].user_id;

    for (const badge of allBadges) {
      if (earnedBadgeIds.has(badge.id)) continue;

      let awarded = false;
      
      if (badge.type === 'STREAK' && streak.current_streak >= badge.threshold) {
        awarded = true;
      } else if (badge.name === 'First Step' && streak.total_present_days >= 1) {
        awarded = true;
      }
      
      // "Comeback Kid" and "Perfect Month" logic would go here if we do complex querying.
      
      if (awarded) {
        await query(`
          INSERT INTO student_badges (student_id, badge_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [studentId, badge.id]);

        // Send Achievement Notification
        await createNotification(
          userId,
          `Badge Unlocked: ${badge.name}!`,
          `You earned the ${badge.name} badge! Keep up the great work.`,
          'success',
          'achievement',
          badge.id
        );

        // Optional: notify parents
        const parentRes = await query(`SELECT user_id FROM student_parents WHERE student_id = $1`, [studentId]);
        for (const p of parentRes.rows) {
          await createNotification(
            p.user_id,
            `Badge Unlocked: ${badge.name}!`,
            `Your child earned the ${badge.name} badge!`,
            'success',
            'achievement',
            badge.id
          );
        }
      }
    }
  },

  async getStudentStreak(studentId) {
    const streakRes = await query(`SELECT * FROM attendance_streaks WHERE student_id = $1`, [studentId]);
    const streak = streakRes.rows.length > 0 ? streakRes.rows[0] : { current_streak: 0, longest_streak: 0, total_present_days: 0 };
    
    // Get badges
    const badgesRes = await query(`
      SELECT b.*, sb.earned_at, sb.is_new
      FROM student_badges sb
      JOIN badges b ON b.id = sb.badge_id
      WHERE sb.student_id = $1
      ORDER BY sb.earned_at DESC
    `, [studentId]);
    
    // Determine next streak badge
    const earnedIds = new Set(badgesRes.rows.map(b => b.id));
    const nextBadgeRes = await query(`
      SELECT * FROM badges 
      WHERE type = 'STREAK' 
      ORDER BY threshold ASC
    `);
    const nextBadge = nextBadgeRes.rows.find(b => !earnedIds.has(b.id));
    const daysRemaining = nextBadge ? Math.max(0, nextBadge.threshold - streak.current_streak) : 0;

    // Get unearned locked badges to fill out the UI
    const lockedBadges = nextBadgeRes.rows.filter(b => !earnedIds.has(b.id));

    return {
      streak: {
        currentStreak: streak.current_streak,
        longestStreak: streak.longest_streak,
        totalPresentDays: streak.total_present_days,
        lastPresentDate: streak.last_present_date
      },
      badges: badgesRes.rows,
      lockedBadges: lockedBadges,
      nextBadge: nextBadge ? { badge: nextBadge, daysRemaining } : null
    };
  },

  async getLeaderboard(classId, limit = 10) {
    const res = await query(`
      SELECT st.id as student_id, u.name, u.avatar_url, ast.current_streak, ast.longest_streak
      FROM attendance_streaks ast
      JOIN students st ON st.id = ast.student_id
      JOIN users u ON u.id = st.user_id
      WHERE st.class_id = $1 AND ast.current_streak > 0
      ORDER BY ast.current_streak DESC, ast.longest_streak DESC, u.name ASC
      LIMIT $2
    `, [classId, limit]);
    
    return res.rows;
  },

  async getClassStreakSummary(classId) {
    const leaderboard = await this.getLeaderboard(classId, 3);
    
    const statsRes = await query(`
      SELECT 
        AVG(ast.current_streak) as avg_streak,
        MAX(ast.current_streak) as max_streak,
        SUM(CASE WHEN ast.current_streak > 0 THEN 1 ELSE 0 END) as active_streaks
      FROM attendance_streaks ast
      JOIN students st ON st.id = ast.student_id
      WHERE st.class_id = $1
    `, [classId]);

    const recentBadgesRes = await query(`
      SELECT b.name as badge_name, b.color, u.name as student_name, sb.earned_at
      FROM student_badges sb
      JOIN badges b ON b.id = sb.badge_id
      JOIN students st ON st.id = sb.student_id
      JOIN users u ON u.id = st.user_id
      WHERE st.class_id = $1
      ORDER BY sb.earned_at DESC
      LIMIT 10
    `, [classId]);

    return {
      classStreak: {
        avgStreak: Math.round(Number(statsRes.rows[0]?.avg_streak) || 0),
        maxStreak: Number(statsRes.rows[0]?.max_streak) || 0,
        activeStreaks: Number(statsRes.rows[0]?.active_streaks) || 0
      },
      topStudents: leaderboard,
      recentBadges: recentBadgesRes.rows
    };
  },

  async markBadgesSeen(studentId, badgeIds) {
    if (!badgeIds || badgeIds.length === 0) return;
    
    // Secure it by ensuring badge belongs to student
    const placeholders = badgeIds.map((_, i) => `$${i + 2}`).join(',');
    await query(`
      UPDATE student_badges
      SET is_new = false
      WHERE student_id = $1 AND badge_id IN (${placeholders})
    `, [studentId, ...badgeIds]);
  }
};

module.exports = streakService;
