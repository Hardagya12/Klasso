const bcrypt = require('bcrypt');
const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
    try {
        const { role, school_id } = req.query;
        const { limit, offset } = req.pagination;

        let conditions = [];
        let params = [];
        let paramCount = 1;

        if (role) {
            conditions.push(`role = $${paramCount++}`);
            params.push(role);
        }
        if (school_id) {
            conditions.push(`school_id = $${paramCount++}`);
            params.push(school_id);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
        const total = countResult.rows[0].count;

        const sql = `
            SELECT id, email, role, school_id, name, avatar_url, phone, is_active, last_login, created_at, updated_at
            FROM users
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramCount++} OFFSET $${paramCount}
        `;
        const dataParams = [...params, limit, offset];
        const result = await query(sql, dataParams);

        return sendPaginated(res, result.rows, total, req.pagination);
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const result = await query(`
            SELECT id, email, role, school_id, name, avatar_url, phone, is_active, last_login, created_at, updated_at
            FROM users WHERE id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        const user = result.rows[0];

        if (user.role === 'teacher') {
            const classesResult = await query(`
                SELECT cs.id as class_subject_id, c.id as class_id, c.name as class_name, c.section, s.id as subject_id, s.name as subject_name, cs.periods_per_week 
                FROM class_subjects cs
                JOIN classes c ON cs.class_id = c.id
                JOIN subjects s ON cs.subject_id = s.id
                WHERE cs.teacher_id = $1
            `, [userId]);
            user.classes = classesResult.rows;
        } else if (user.role === 'parent') {
            const childrenResult = await query(`
                SELECT u.id, u.name, u.email, sp.relation
                FROM student_parents sp
                JOIN users u ON sp.student_id = u.id
                WHERE sp.parent_id = $1
            `, [userId]);
            user.children = childrenResult.rows;
        }

        return sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, school_id, class_subjects } = req.body;

        const checkEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkEmail.rows.length > 0) {
            return sendError(res, 'Email already exists', 409);
        }

        const password_hash = await bcrypt.hash(password, 12);
        
        await query('BEGIN');

        const sql = `
            INSERT INTO users (name, email, password_hash, role, school_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, role, school_id, name, avatar_url, phone, is_active, created_at, updated_at
        `;
        const result = await query(sql, [name, email, password_hash, role, school_id]);
        const newUser = result.rows[0];

        if (role === 'teacher' && class_subjects && Array.isArray(class_subjects)) {
            for (const cs of class_subjects) {
                await query(`
                    INSERT INTO class_subjects (class_id, subject_id, teacher_id, periods_per_week)
                    VALUES ($1, $2, $3, $4)
                `, [cs.class_id, cs.subject_id, newUser.id, cs.periods_per_week || 0]);
            }
        }

        await query('COMMIT');

        return sendSuccess(res, newUser, 'User created successfully', 201);
    } catch (error) {
        await query('ROLLBACK');
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const body = req.body;

        // Ensure we don't update password through this route
        delete body.password;
        delete body.password_hash;

        const keys = Object.keys(body);
        if (keys.length === 0) {
            return sendError(res, 'No fields to update', 400);
        }

        let updates = [];
        let params = [];
        let paramCount = 1;

        for (const key of keys) {
            updates.push(`${key} = $${paramCount++}`);
            params.push(body[key]);
        }

        updates.push(`updated_at = NOW()`);
        params.push(userId);

        const sql = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, email, role, school_id, name, avatar_url, phone, is_active, created_at, updated_at
        `;

        const result = await query(sql, params);
        if (result.rows.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        return sendSuccess(res, result.rows[0], 'User updated successfully');
    } catch (error) {
        next(error);
    }
};

const deactivateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const result = await query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id', [userId]);

        if (result.rows.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        return sendSuccess(res, null, 'User deactivated successfully');
    } catch (error) {
        next(error);
    }
};

const getTeachers = async (req, res, next) => {
    try {
        // Assume school_id comes from admin checking it
        const school_id = req.query.school_id;
        
        let conditions = ["role = 'teacher'"];
        let params = [];
        if (school_id) {
            conditions.push("school_id = $1");
            params.push(school_id);
        }

        const teachersQuery = `
            SELECT id, name, email, phone, avatar_url, is_active
            FROM users
            WHERE ${conditions.join(' AND ')}
            ORDER BY name ASC
        `;
        const teachersResult = await query(teachersQuery, params);
        const teachers = teachersResult.rows;

        if (teachers.length === 0) {
            return sendSuccess(res, []);
        }

        const teacherIds = teachers.map(t => t.id);

        const placeholders = teacherIds.map((_, i) => `$${i + 1}`).join(',');
        const classesResult = await query(`
            SELECT cs.teacher_id, cs.id as class_subject_id, c.id as class_id, c.name as class_name, c.section, s.id as subject_id, s.name as subject_name, cs.periods_per_week
            FROM class_subjects cs
            JOIN classes c ON cs.class_id = c.id
            JOIN subjects s ON cs.subject_id = s.id
            WHERE cs.teacher_id IN (${placeholders})
        `, teacherIds);

        const classSubjectsByTeacher = {};
        for (const row of classesResult.rows) {
            if (!classSubjectsByTeacher[row.teacher_id]) {
                classSubjectsByTeacher[row.teacher_id] = [];
            }
            classSubjectsByTeacher[row.teacher_id].push({
                class_subject_id: row.class_subject_id,
                class_id: row.class_id,
                class_name: row.class_name,
                section: row.section,
                subject_id: row.subject_id,
                subject_name: row.subject_name,
                periods_per_week: row.periods_per_week
            });
        }

        for (const teacher of teachers) {
            teacher.class_subjects = classSubjectsByTeacher[teacher.id] || [];
        }

        return sendSuccess(res, teachers);
    } catch (error) {
        next(error);
    }
};

const getTeacherWorkload = async (req, res, next) => {
    try {
        const school_id = req.query.school_id;
        
        let conditions = ["u.role = 'teacher'"];
        let params = [];
        let paramCount = 1;

        if (school_id) {
            conditions.push(`u.school_id = $${paramCount++}`);
            params.push(school_id);
        }

        // We count timetable_slots for each teacher using class_subjects
        const sql = `
            SELECT u.id, u.name, COUNT(ts.id) AS total_periods
            FROM users u
            LEFT JOIN class_subjects cs ON u.id = cs.teacher_id
            LEFT JOIN timetable_slots ts ON cs.id = ts.class_subject_id
            WHERE ${conditions.join(' AND ')}
            GROUP BY u.id, u.name
            ORDER BY total_periods DESC
        `;

        const result = await query(sql, params);
        
        // Convert string counts to numbers
        const mapped = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            total_periods: parseInt(r.total_periods, 10)
        }));

        return sendSuccess(res, mapped);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deactivateUser,
    getTeachers,
    getTeacherWorkload
};
