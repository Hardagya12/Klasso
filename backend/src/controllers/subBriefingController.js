'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { generateSubBriefing } = require('../services/subbriefing.service');

// ─── GET /api/substitution/:substitutionId/briefing ──────────────────────────
const getBriefing = async (req, res, next) => {
  try {
    const { substitutionId } = req.params;

    // Fetch briefing and verify the requester is the substitute teacher
    const result = await query(
      `SELECT sb.*, sub.substitute_teacher_id
       FROM sub_briefings sb
       JOIN substitutions sub ON sub.id = sb.substitution_id
       WHERE sb.substitution_id = $1`,
      [substitutionId]
    );

    if (!result.rows.length) {
      return sendError(res, 'Briefing not found or not yet generated', 404);
    }

    const row = result.rows[0];

    // Only the assigned substitute teacher may read the briefing
    if (
      req.user.role === 'teacher' &&
      row.substitute_teacher_id !== req.user.id
    ) {
      return sendError(res, 'Access denied — you are not the assigned substitute', 403);
    }

    // Mark as viewed on first read
    if (!row.is_viewed) {
      await query(
        `UPDATE sub_briefings SET is_viewed = true, viewed_at = NOW()
         WHERE substitution_id = $1`,
        [substitutionId]
      );
    }

    return sendSuccess(res, {
      briefing: {
        content: row.content,
        aiSummary: row.ai_summary,
        isViewed: true,
        viewedAt: row.viewed_at || new Date().toISOString(),
        generatedAt: row.generated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/substitution/my-briefings ──────────────────────────────────────
const getMyBriefings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const upcomingOnly = req.query.upcoming === 'true';

    let dateFilter = '';
    const params = [userId];
    if (upcomingOnly) {
      dateFilter = 'AND sub.date >= CURRENT_DATE';
    }

    const result = await query(
      `SELECT
         sub.id            AS substitution_id,
         sub.date,
         sub.reason,
         ts.period_number,
         ts.start_time,
         ts.end_time,
         ts.room,
         c.name            AS class_name,
         c.section,
         s.name            AS subject_name,
         sb.id             AS briefing_id,
         sb.ai_summary,
         sb.is_viewed,
         sb.generated_at,
         sb.content
       FROM substitutions sub
       LEFT JOIN timetable_slots ts  ON ts.id = sub.timetable_slot_id
       LEFT JOIN class_subjects cs   ON cs.id = ts.class_subject_id
       LEFT JOIN classes c           ON c.id  = ts.class_id
       LEFT JOIN subjects s          ON s.id  = cs.subject_id
       LEFT JOIN sub_briefings sb    ON sb.substitution_id = sub.id
       WHERE sub.substitute_teacher_id = $1
         ${dateFilter}
       ORDER BY sub.date ASC, ts.period_number ASC`,
      params
    );

    return sendSuccess(res, result.rows);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/substitution/:substitutionId/briefing/regenerate ──────────────
const regenerateBriefing = async (req, res, next) => {
  try {
    const { substitutionId } = req.params;

    // Check substitution exists and belongs to this school
    const check = await query(
      `SELECT sub.id, ts.class_id, sub.substitute_teacher_id
       FROM substitutions sub
       LEFT JOIN timetable_slots ts ON ts.id = sub.timetable_slot_id
       WHERE sub.id = $1`,
      [substitutionId]
    );
    if (!check.rows.length) return sendError(res, 'Substitution not found', 404);

    // Fire async — don't await, respond immediately
    generateSubBriefing(substitutionId).catch((err) =>
      console.error('[SubBriefing] Regeneration error:', err.message)
    );

    return sendSuccess(res, { queued: true }, 'Briefing regeneration started');
  } catch (err) {
    next(err);
  }
};

module.exports = { getBriefing, getMyBriefings, regenerateBriefing };
