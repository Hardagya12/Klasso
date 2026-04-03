'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

// ── GET /api/timetable  ───────────────────────────────────────────────────────
// Query: ?class_id= or teacher sees their own schedule
const getTimetable = async (req, res, next) => {
  try {
    const { class_id } = req.query;

    let q;
    let params;

    if (req.user.role === 'teacher' && !class_id) {
      // Return all slots where this teacher teaches
      q = `
        SELECT ts.*, c.name AS class_name, c.section,
               s.name AS subject_name, s.code AS subject_code,
               u.name AS teacher_name
        FROM timetable_slots ts
        JOIN class_subjects cs ON cs.id = ts.class_subject_id
        JOIN classes c ON c.id = cs.class_id
        JOIN subjects s ON s.id = cs.subject_id
        LEFT JOIN users u ON u.id = cs.teacher_id
        WHERE cs.teacher_id = $1
        ORDER BY ts.day_of_week, ts.period_number
      `;
      params = [req.user.id];
    } else {
      if (!class_id) return sendError(res, 'class_id query param required', 400);
      q = `
        SELECT ts.*, s.name AS subject_name, s.code AS subject_code,
               u.name AS teacher_name, u.email AS teacher_email
        FROM timetable_slots ts
        JOIN class_subjects cs ON cs.id = ts.class_subject_id
        JOIN subjects s ON s.id = cs.subject_id
        LEFT JOIN users u ON u.id = cs.teacher_id
        WHERE ts.class_id = $1
        ORDER BY ts.day_of_week, ts.period_number
      `;
      params = [class_id];
    }

    const result = await query(q, params);

    // Group by day_of_week
    const grouped = result.rows.reduce((acc, row) => {
      const day = row.day_of_week;
      if (!acc[day]) acc[day] = [];
      acc[day].push(row);
      return acc;
    }, {});

    return sendSuccess(res, { raw: result.rows, by_day: grouped });
  } catch (err) { next(err); }
};

// ── POST /api/timetable  ──────────────────────────────────────────────────────
const createSlot = async (req, res, next) => {
  try {
    const { class_id, class_subject_id, day_of_week, period_number, start_time, end_time, room = null } = req.body;

    const result = await query(
      `INSERT INTO timetable_slots (class_id, class_subject_id, day_of_week, period_number, start_time, end_time, room)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [class_id, class_subject_id, day_of_week, period_number, start_time, end_time, room]
    );

    return sendSuccess(res, result.rows[0], 'Timetable slot created', 201);
  } catch (err) { next(err); }
};

// ── PUT /api/timetable/:id  ───────────────────────────────────────────────────
const updateSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['class_subject_id','day_of_week','period_number','start_time','end_time','room'];
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

// ── DELETE /api/timetable/:id  ────────────────────────────────────────────────
const deleteSlot = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM timetable_slots WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Slot not found', 404);
    return sendSuccess(res, null, 'Slot deleted');
  } catch (err) { next(err); }
};

// ── POST /api/timetable/substitution  ────────────────────────────────────────
const createSubstitution = async (req, res, next) => {
  try {
    const { timetable_slot_id, date, substitute_teacher_id, reason } = req.body;

    // Get original teacher from slot
    const slotRes = await query(
      `SELECT cs.teacher_id FROM timetable_slots ts
       JOIN class_subjects cs ON cs.id=ts.class_subject_id WHERE ts.id=$1`, [timetable_slot_id]
    );
    const original_teacher_id = slotRes.rows[0]?.teacher_id || null;

    const result = await query(
      `INSERT INTO substitutions (timetable_slot_id, date, original_teacher_id, substitute_teacher_id, reason, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [timetable_slot_id, date, original_teacher_id, substitute_teacher_id, reason || null, req.user.id]
    );

    return sendSuccess(res, result.rows[0], 'Substitution created', 201);
  } catch (err) { next(err); }
};

// ── GET /api/timetable/substitutions  ────────────────────────────────────────
const getSubstitutions = async (req, res, next) => {
  try {
    const { date, class_id } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (date)     { conditions.push(`sub.date=$${idx++}`);     params.push(date); }
    if (class_id) { conditions.push(`ts.class_id=$${idx++}`);  params.push(class_id); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT sub.*, ts.day_of_week, ts.period_number, ts.start_time, ts.end_time,
              orig.name AS original_teacher_name, sub2.name AS substitute_teacher_name,
              c.name AS class_name, c.section, s.name AS subject_name
       FROM substitutions sub
       JOIN timetable_slots ts ON ts.id=sub.timetable_slot_id
       JOIN class_subjects cs ON cs.id=ts.class_subject_id
       JOIN classes c ON c.id=ts.class_id
       JOIN subjects s ON s.id=cs.subject_id
       LEFT JOIN users orig ON orig.id=sub.original_teacher_id
       LEFT JOIN users sub2 ON sub2.id=sub.substitute_teacher_id
       ${where}
       ORDER BY sub.date, ts.period_number`,
      params
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

module.exports = { getTimetable, createSlot, updateSlot, deleteSlot, createSubstitution, getSubstitutions };
