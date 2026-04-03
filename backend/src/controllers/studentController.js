'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ── GET /api/students  ─────────────────────────────────────────────────────────
const getAllStudents = async (req, res, next) => {
  try {
    const { class_id, gender } = req.query;
    const { page, limit, offset } = req.pagination;
    const school_id = req.user.school_id;

    const conditions = ['st.school_id = $1'];
    const params = [school_id];
    let idx = 2;

    if (class_id) { conditions.push(`st.class_id = $${idx++}`); params.push(class_id); }
    if (gender)   { conditions.push(`st.gender = $${idx++}`);   params.push(gender); }

    const where = conditions.join(' AND ');

    const countResult = await query(`SELECT COUNT(*) FROM students st WHERE ${where}`, params);

    const dataResult  = await query(
      `SELECT st.id, st.roll_no, st.admission_no, st.dob, st.gender, st.blood_group, st.address,
              u.name, u.email, u.phone, u.avatar_url, u.is_active,
              c.name AS class_name, c.section
       FROM students st
       JOIN users u ON u.id = st.user_id
       LEFT JOIN classes c ON c.id = st.class_id
       WHERE ${where}
       ORDER BY c.name, c.section, st.roll_no
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return sendPaginated(res, dataResult.rows, parseInt(countResult.rows[0].count), req.pagination);
  } catch (err) { next(err); }
};

// ── GET /api/students/:id  ────────────────────────────────────────────────────
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT st.*, u.name, u.email, u.phone, u.avatar_url,
              c.name AS class_name, c.section
       FROM students st
       JOIN users u ON u.id = st.user_id
       LEFT JOIN classes c ON c.id = st.class_id
       WHERE st.id = $1`,
      [id]
    );
    if (!result.rows.length) return sendError(res, 'Student not found', 404);

    const student = result.rows[0];

    // Parents
    const parents = await query(
      `SELECT sp.relation, sp.is_primary, u.id, u.name, u.email, u.phone
       FROM student_parents sp
       JOIN users u ON u.id = sp.parent_id
       WHERE sp.student_id = $1`,
      [id]
    );
    student.parents = parents.rows;

    return sendSuccess(res, student);
  } catch (err) { next(err); }
};

// ── POST /api/students  ───────────────────────────────────────────────────────
const createStudent = async (req, res, next) => {
  try {
    const {
      user_id, class_id, roll_no,
      admission_no = null, dob = null, gender = null,
      blood_group = null, address = null,
    } = req.body;
    const school_id = req.user.school_id;

    const result = await query(
      `INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender, blood_group, address)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [user_id, school_id, class_id, roll_no, admission_no, dob, gender, blood_group, address]
    );

    return sendSuccess(res, result.rows[0], 'Student created successfully', 201);
  } catch (err) { next(err); }
};

// ── PUT /api/students/:id  ────────────────────────────────────────────────────
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['class_id','roll_no','admission_no','dob','gender','blood_group','address'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f} = $${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);
    params.push(id);
    const result = await query(
      `UPDATE students SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params
    );
    if (!result.rows.length) return sendError(res, 'Student not found', 404);
    return sendSuccess(res, result.rows[0], 'Student updated');
  } catch (err) { next(err); }
};

// ── DELETE /api/students/:id  ─────────────────────────────────────────────────
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const res2 = await query('DELETE FROM students WHERE id=$1 RETURNING id', [id]);
    if (!res2.rows.length) return sendError(res, 'Student not found', 404);
    return sendSuccess(res, res2.rows[0], 'Student deleted');
  } catch (err) { next(err); }
};

// ── POST /api/students/:id/parents  ──────────────────────────────────────────
const linkParent = async (req, res, next) => {
  try {
    const { id: student_id } = req.params;
    const { parent_id, relation = 'parent', is_primary = false } = req.body;
    const result = await query(
      `INSERT INTO student_parents (student_id, parent_id, relation, is_primary)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (student_id, parent_id) DO UPDATE
         SET relation=EXCLUDED.relation, is_primary=EXCLUDED.is_primary
       RETURNING *`,
      [student_id, parent_id, relation, is_primary]
    );
    return sendSuccess(res, result.rows[0], 'Parent linked', 201);
  } catch (err) { next(err); }
};

// ── DELETE /api/students/:id/parents/:parentId  ───────────────────────────────
const unlinkParent = async (req, res, next) => {
  try {
    const { id: student_id, parentId: parent_id } = req.params;
    const result = await query(
      'DELETE FROM student_parents WHERE student_id=$1 AND parent_id=$2 RETURNING *',
      [student_id, parent_id]
    );
    if (!result.rows.length) return sendError(res, 'Link not found', 404);
    return sendSuccess(res, null, 'Parent unlinked');
  } catch (err) { next(err); }
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, linkParent, unlinkParent };
