'use strict';

const { query } = require('../db/neon');
const ptmService = require('../services/ptm.service');
const { sendSuccess, sendError } = require('../utils/response');

const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

exports.createEvent = catchAsync(async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented in raw SQL yet' });
});

exports.createSlot = catchAsync(async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented in raw SQL yet' });
});

exports.getSlotTalkingPoints = catchAsync(async (req, res) => {
  const { slotId } = req.params;
  const result = await query(`SELECT talking_points FROM ptm_slots WHERE id=$1`, [slotId]);
  if (!result.rows.length) return sendError(res, 'Slot not found', 404);
  res.status(200).json({ success: true, talkingPoints: result.rows[0].talking_points });
});

exports.completeSlot = catchAsync(async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented in raw SQL yet' });
});

exports.getTeacherDayDashboard = catchAsync(async (req, res, next) => {
  const { teacherId } = req.params;
  const result = await query(`
    SELECT 
      s.id, s.scheduled_at AS "scheduledAt", s.duration, s.status, s.summary,
      e.id AS "ptmEventId", e.title AS "ptmEventTitle",
      u_parent.name AS "parentName",
      u_student.name AS "studentName"
    FROM ptm_slots s
    JOIN ptm_events e ON e.id = s.ptm_event_id
    JOIN users u_parent ON u_parent.id = s.parent_id
    JOIN students st ON st.id = s.student_id
    JOIN users u_student ON u_student.id = st.user_id
    WHERE s.teacher_id = $1
    ORDER BY s.scheduled_at ASC
  `, [teacherId]);

  const formattedSlots = result.rows.map(r => ({
    id: r.id,
    ptmEventId: r.ptmEventId,
    scheduledAt: r.scheduledAt,
    duration: r.duration,
    status: r.status,
    summary: r.summary,
    ptmEvent: { id: r.ptmEventId, title: r.ptmEventTitle },
    parent: { name: r.parentName },
    student: { firstName: r.studentName.split(' ')[0], lastName: r.studentName.split(' ').slice(1).join(' ') }
  }));

  sendSuccess(res, formattedSlots);
});

exports.getParentDashboard = catchAsync(async (req, res, next) => {
  const { parentId } = req.params;
  const result = await query(`
    SELECT 
      s.id, s.scheduled_at AS "scheduledAt", s.duration, s.status, s.summary,
      e.id AS "ptmEventId", e.title AS "ptmEventTitle",
      u_teacher.name AS "teacherName",
      u_student.name AS "studentName"
    FROM ptm_slots s
    JOIN ptm_events e ON e.id = s.ptm_event_id
    JOIN users u_teacher ON u_teacher.id = s.teacher_id
    JOIN students st ON st.id = s.student_id
    JOIN users u_student ON u_student.id = st.user_id
    WHERE s.parent_id = $1
    ORDER BY s.scheduled_at ASC
  `, [parentId]);

  const formattedSlots = result.rows.map(r => ({
    id: r.id,
    ptmEventId: r.ptmEventId,
    scheduledAt: r.scheduledAt,
    duration: r.duration,
    status: r.status,
    summary: r.summary,
    ptmEvent: { id: r.ptmEventId, title: r.ptmEventTitle },
    teacher: { name: r.teacherName },
    student: { firstName: r.studentName.split(' ')[0], lastName: r.studentName.split(' ').slice(1).join(' ') }
  }));

  sendSuccess(res, formattedSlots);
});
