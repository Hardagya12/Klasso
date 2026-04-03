'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { createNotificationsForMany } = require('../utils/notificationHelper');

// ── GET /api/announcements  ───────────────────────────────────────────────────
const getAllAnnouncements = async (req, res, next) => {
  try {
    const { page, limit, offset } = req.pagination;
    const school_id = req.user.school_id;
    const role = req.user.role;

    // Students/parents see announcements targeted at them or 'all'
    let audienceFilter = '';
    if (role === 'student') audienceFilter = `AND (a.audience = 'all' OR a.audience = 'students')`;
    else if (role === 'parent') audienceFilter = `AND (a.audience = 'all' OR a.audience = 'parents')`;
    else if (role === 'teacher') audienceFilter = `AND (a.audience = 'all' OR a.audience = 'teachers')`;

    const countRes = await query(
      `SELECT COUNT(*) FROM announcements a WHERE a.school_id=$1 ${audienceFilter}`, [school_id]
    );

    const dataRes = await query(
      `SELECT a.*, u.name AS created_by_name, c.name AS class_name, c.section
       FROM announcements a
       LEFT JOIN users u ON u.id=a.created_by
       LEFT JOIN classes c ON c.id=a.class_id
       WHERE a.school_id=$1 ${audienceFilter}
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [school_id, limit, offset]
    );

    return sendPaginated(res, dataRes.rows, parseInt(countRes.rows[0].count), req.pagination);
  } catch (err) { next(err); }
};

// ── POST /api/announcements  ──────────────────────────────────────────────────
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, audience = 'all', class_id = null, attachment_url = null } = req.body;
    const school_id = req.user.school_id;

    const result = await query(
      `INSERT INTO announcements (school_id, title, body, audience, class_id, attachment_url, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [school_id, title, body, audience, class_id, attachment_url, req.user.id]
    );
    const ann = result.rows[0];

    // Notify target users
    let targetQuery;
    if (audience === 'all') {
      targetQuery = `SELECT id FROM users WHERE school_id=$1`;
    } else if (audience === 'teachers') {
      targetQuery = `SELECT id FROM users WHERE school_id=$1 AND role='teacher'`;
    } else if (audience === 'parents') {
      targetQuery = `SELECT id FROM users WHERE school_id=$1 AND role='parent'`;
    } else if (audience === 'students') {
      targetQuery = `SELECT id FROM users WHERE school_id=$1 AND role='student'`;
    } else if (audience === 'class' && class_id) {
      targetQuery = `SELECT u.id FROM students st JOIN users u ON u.id=st.user_id WHERE st.class_id='${class_id}'`;
    }

    if (targetQuery) {
      const targetRes = await query(targetQuery.replace('$1', `'${school_id}'`), []);
      const userIds = targetRes.rows.map(r => r.id);
      if (userIds.length) {
        await createNotificationsForMany(userIds, 'New Announcement', title, 'info', 'announcement', ann.id);
      }
    }

    return sendSuccess(res, ann, 'Announcement created', 201);
  } catch (err) { next(err); }
};

// ── PUT /api/announcements/:id  ───────────────────────────────────────────────
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['title','body','audience','class_id','attachment_url'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);
    params.push(id);
    const result = await query(
      `UPDATE announcements SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`, params
    );
    if (!result.rows.length) return sendError(res, 'Announcement not found', 404);
    return sendSuccess(res, result.rows[0], 'Announcement updated');
  } catch (err) { next(err); }
};

// ── DELETE /api/announcements/:id  ────────────────────────────────────────────
const deleteAnnouncement = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM announcements WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return sendError(res, 'Announcement not found', 404);
    return sendSuccess(res, null, 'Announcement deleted');
  } catch (err) { next(err); }
};

module.exports = { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
