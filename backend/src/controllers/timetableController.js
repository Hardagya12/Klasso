'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { createNotification } = require('../utils/notificationHelper');
const { generateSubBriefing } = require('../services/subbriefing.service');

// ─── GET /api/timetable ───────────────────────────────────────────────────────
const getTimetable = async (req, res, next) => {
  try {
    const { class_id } = req.query;
    const school_id = req.user.school_id;

    const conditions = ['c.school_id = $1'];
    const params = [school_id];
    let idx = 2;

    if (req.user.role === 'student') {
      const stuRes = await query('SELECT class_id FROM students WHERE user_id=$1', [req.user.id]);
      if (stuRes.rows.length) {
        conditions.push(`ts.class_id = $${idx++}`);
        params.push(stuRes.rows[0].class_id);
      }
    } else if (class_id) {
      conditions.push(`ts.class_id = $${idx++}`);
      params.push(class_id);
    }

    const result = await query(
      `SELECT ts.*, c.name AS class_name, c.section,
              s.name AS subject_name, u.name AS teacher_name
       FROM timetable_slots ts
       JOIN classes c ON c.id = ts.class_id
       JOIN class_subjects cs ON cs.id = ts.class_subject_id
       JOIN subjects s ON s.id = cs.subject_id
       JOIN users u ON u.id = cs.teacher_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ts.day_of_week, ts.period_number`,
      params
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── POST /api/timetable ──────────────────────────────────────────────────────
const createSlot = async (req, res, next) => {
  try {
    const { class_id, class_subject_id, day_of_week, period_number, start_time, end_time, room = null } = req.body;
    const school_id = req.user.school_id;

    const result = await query(
      `INSERT INTO timetable_slots (class_id, class_subject_id, day_of_week, period_number, start_time, end_time, room)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [class_id, class_subject_id, day_of_week, period_number, start_time, end_time, room]
    );
    return sendSuccess(res, result.rows[0], 'Timetable slot created', 201);
  } catch (err) { next(err); }
};

// ─── PUT /api/timetable/:id ───────────────────────────────────────────────────
const updateSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['class_subject_id', 'day_of_week', 'period_number', 'start_time', 'end_time', 'room'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);
    params.push(id);
    const result = await query(
      `UPDATE timetable_slots SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`, params
    );
    if (!result.rows.length) return sendError(res, 'Slot not found', 404);
    return sendSuccess(res, result.rows[0], 'Slot updated');
  } catch (err) { next(err); }
};

// ─── DELETE /api/timetable/:id ───────────────────────────────────────────────
const deleteSlot = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM timetable_slots WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Slot not found', 404);
    return sendSuccess(res, result.rows[0], 'Slot deleted');
  } catch (err) { next(err); }
};

// ─── GET /api/timetable/conflicts ────────────────────────────────────────────
const getConflicts = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    // Find teacher double-booked in the same period on the same day
    const result = await query(
      `SELECT ts1.id AS slot1_id, ts2.id AS slot2_id,
              ts1.day_of_week, ts1.period_number,
              u.name AS teacher_name,
              c1.name AS class1, c2.name AS class2
       FROM timetable_slots ts1
       JOIN timetable_slots ts2
         ON ts1.id < ts2.id
         AND ts1.day_of_week = ts2.day_of_week
         AND ts1.period_number = ts2.period_number
       JOIN class_subjects cs1 ON cs1.id = ts1.class_subject_id
       JOIN class_subjects cs2 ON cs2.id = ts2.class_subject_id
       JOIN users u ON u.id = cs1.teacher_id AND cs1.teacher_id = cs2.teacher_id
       JOIN classes c1 ON c1.id = ts1.class_id
       JOIN classes c2 ON c2.id = ts2.class_id
       WHERE c1.school_id = $1`,
      [school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/timetable/teacher/:teacher_id ──────────────────────────────────
const getTeacherSchedule = async (req, res, next) => {
  try {
    const { teacher_id } = req.params;
    const result = await query(
      `SELECT ts.*, c.name AS class_name, c.section, s.name AS subject_name
       FROM timetable_slots ts
       JOIN class_subjects cs ON cs.id = ts.class_subject_id
       JOIN classes c ON c.id = ts.class_id
       JOIN subjects s ON s.id = cs.subject_id
       WHERE cs.teacher_id = $1
       ORDER BY ts.day_of_week, ts.period_number`,
      [teacher_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/timetable/workload ─────────────────────────────────────────────
const getTeacherWorkload = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const result = await query(
      `SELECT u.id AS teacher_id, u.name AS teacher_name,
              COUNT(ts.id)::int AS total_periods
       FROM users u
       JOIN class_subjects cs ON cs.teacher_id = u.id
       LEFT JOIN timetable_slots ts ON ts.class_subject_id = cs.id
       WHERE u.school_id = $1 AND u.role = 'teacher'
       GROUP BY u.id, u.name
       ORDER BY total_periods DESC`,
      [school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── POST /api/timetable/substitution ────────────────────────────────────────
const createSubstitution = async (req, res, next) => {
  try {
    const { timetable_slot_id, date, substitute_teacher_id, reason = null } = req.body;

    const result = await query(
      `INSERT INTO substitutions (timetable_slot_id, date, substitute_teacher_id, reason, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [timetable_slot_id, date, substitute_teacher_id, reason, req.user.id]
    );
    const sub = result.rows[0];

    // Notify the substitute teacher
    await createNotification(
      substitute_teacher_id,
      'Substitution Assigned',
      `You have been assigned as a substitute on ${date}.`,
      'info', 'substitution', sub.id
    );

    // Generate AI briefing asynchronously — do not block the response
    generateSubBriefing(sub.id).catch((err) =>
      console.error('[SubBriefing] Background generation error:', err.message)
    );

    return sendSuccess(res, sub, 'Substitution created', 201);
  } catch (err) { next(err); }
};

// ─── GET /api/timetable/substitution ─────────────────────────────────────────
const getSubstitutions = async (req, res, next) => {
  try {
    const { date } = req.query;
    const school_id = req.user.school_id;

    const conditions = ['c.school_id = $1'];
    const params = [school_id];
    let idx = 2;

    if (date) { conditions.push(`sub.date = $${idx++}`); params.push(date); }

    // If teacher, show own substitutions only
    if (req.user.role === 'teacher') {
      conditions.push(`sub.substitute_teacher_id = $${idx++}`);
      params.push(req.user.id);
    }

    const result = await query(
      `SELECT sub.*, ts.day_of_week, ts.period_number, ts.start_time, ts.end_time,
              c.name AS class_name, s.name AS subject_name,
              u.name AS substitute_name
       FROM substitutions sub
       JOIN timetable_slots ts ON ts.id = sub.timetable_slot_id
       JOIN class_subjects cs ON cs.id = ts.class_subject_id
       JOIN classes c ON c.id = ts.class_id
       JOIN subjects s ON s.id = cs.subject_id
       JOIN users u ON u.id = sub.substitute_teacher_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY sub.date, ts.period_number`,
      params
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

module.exports = {
  getTimetable, createSlot, updateSlot, deleteSlot,
  getConflicts, getTeacherSchedule, getTeacherWorkload,
  createSubstitution, getSubstitutions,
};
