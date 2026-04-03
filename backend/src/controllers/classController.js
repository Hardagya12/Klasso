const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

const getAllClasses = async (req, res, next) => {
    try {
        const { school_id, role, id: userId } = req.user;

        let sql = `
            SELECT c.id, c.name, c.section, c.room_number,
                   ct.name AS class_teacher_name,
                   (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id = c.id) AS student_count
            FROM classes c
            LEFT JOIN users ct ON c.class_teacher_id = ct.id
            WHERE c.school_id = $1
        `;
        let params = [school_id];

        if (role === 'teacher') {
            // Teachers see only their assigned classes (as per instruction: via class_subjects)
            sql += ` AND c.id IN (SELECT class_id FROM class_subjects WHERE teacher_id = $2)`;
            params.push(userId);
        }

        sql += ` ORDER BY c.name, c.section`;

        const result = await query(sql, params);
        return sendSuccess(res, result.rows);
    } catch (error) {
        next(error);
    }
};

const getClassById = async (req, res, next) => {
    try {
        const classId = req.params.id;
        
        const classQuery = `
            SELECT c.*, ct.name as class_teacher_name, ct.email as class_teacher_email,
                   (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id = c.id) AS student_count
            FROM classes c
            LEFT JOIN users ct ON c.class_teacher_id = ct.id
            WHERE c.id = $1
        `;
        const classResult = await query(classQuery, [classId]);

        if (classResult.rows.length === 0) {
            return sendError(res, 'Class not found', 404);
        }

        const classData = classResult.rows[0];

        const subjectsQuery = `
            SELECT cs.id as class_subject_id, s.id as subject_id, s.name as subject_name, s.code, u.name as teacher_name, cs.periods_per_week
            FROM class_subjects cs
            JOIN subjects s ON cs.subject_id = s.id
            LEFT JOIN users u ON cs.teacher_id = u.id
            WHERE cs.class_id = $1
        `;
        const subjectsResult = await query(subjectsQuery, [classId]);

        classData.subjects = subjectsResult.rows;

        return sendSuccess(res, classData);
    } catch (error) {
        next(error);
    }
};

const createClass = async (req, res, next) => {
    try {
        const { name, section, class_teacher_id, room_number, academic_year_id } = req.body;
        const school_id = req.user.school_id;

        const sql = `
            INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await query(sql, [school_id, academic_year_id, name, section, class_teacher_id, room_number]);

        return sendSuccess(res, result.rows[0], 'Class created successfully', 201);
    } catch (error) {
        next(error);
    }
};

const updateClass = async (req, res, next) => {
    try {
        const classId = req.params.id;
        const body = req.body;
        
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
        
        updates.push('updated_at = NOW()');
        params.push(classId);

        const sql = `
            UPDATE classes
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;
        const result = await query(sql, params);

        if (result.rows.length === 0) {
            return sendError(res, 'Class not found', 404);
        }

        return sendSuccess(res, result.rows[0], 'Class updated successfully');
    } catch (error) {
        next(error);
    }
};

const deleteClass = async (req, res, next) => {
    try {
        const classId = req.params.id;

        const studentCountResult = await query('SELECT COUNT(*) FROM student_classes WHERE class_id = $1', [classId]);
        if (parseInt(studentCountResult.rows[0].count, 10) > 0) {
            return sendError(res, 'Cannot delete a class with enrolled students.', 400);
        }

        const result = await query('DELETE FROM classes WHERE id = $1 RETURNING id', [classId]);
        if (result.rows.length === 0) {
            return sendError(res, 'Class not found', 404);
        }

        return sendSuccess(res, null, 'Class deleted successfully');
    } catch (error) {
        next(error);
    }
};

const getClassStudents = async (req, res, next) => {
    try {
        const classId = req.params.id;

        const sql = `
            SELECT u.id as student_id, u.name, u.email, u.avatar_url, sc.roll_no, sc.academic_year_id
            FROM student_classes sc
            JOIN users u ON sc.student_id = u.id
            WHERE sc.class_id = $1
            ORDER BY sc.roll_no ASC
        `;
        const result = await query(sql, [classId]);

        return sendSuccess(res, result.rows);
    } catch (error) {
        next(error);
    }
};

const getClassSubjects = async (req, res, next) => {
    try {
        const classId = req.params.id;

        const sql = `
            SELECT cs.id as class_subject_id, s.id as subject_id, s.name as subject_name, s.code,
                   u.id as teacher_id, u.name as teacher_name, cs.periods_per_week
            FROM class_subjects cs
            JOIN subjects s ON cs.subject_id = s.id
            LEFT JOIN users u ON cs.teacher_id = u.id
            WHERE cs.class_id = $1
        `;
        const result = await query(sql, [classId]);

        return sendSuccess(res, result.rows);
    } catch (error) {
        next(error);
    }
};

const assignSubject = async (req, res, next) => {
    try {
        const classId = req.params.id;
        const { subject_id, teacher_id, periods_per_week } = req.body;

        const sql = `
            INSERT INTO class_subjects (class_id, subject_id, teacher_id, periods_per_week)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await query(sql, [classId, subject_id, teacher_id, periods_per_week || null]);

        return sendSuccess(res, result.rows[0], 'Subject assigned to class successfully', 201);
    } catch (error) {
        next(error);
    }
};

const removeSubject = async (req, res, next) => {
    try {
        const { classId, subjectId } = req.params;

        const result = await query(`
            DELETE FROM class_subjects 
            WHERE class_id = $1 AND subject_id = $2 
            RETURNING id
        `, [classId, subjectId]);

        if (result.rows.length === 0) {
            return sendError(res, 'Class subject association not found', 404);
        }

        return sendSuccess(res, null, 'Subject removed from class successfully');
    } catch (error) {
        next(error);
    }
};

const getClassTimetable = async (req, res, next) => {
    try {
        const classId = req.params.id;
        
        // This is a shortcut endpoint, we join timetable_slots via class_subjects
        const sql = `
            SELECT ts.id as slot_id, ts.day_of_week, ts.start_time, ts.end_time,
                   s.name as subject_name, u.name as teacher_name
            FROM timetable_slots ts
            JOIN class_subjects cs ON ts.class_subject_id = cs.id
            JOIN subjects s ON cs.subject_id = s.id
            LEFT JOIN users u ON cs.teacher_id = u.id
            WHERE cs.class_id = $1
            ORDER BY ts.day_of_week, ts.start_time
        `;
        
        const result = await query(sql, [classId]);
        return sendSuccess(res, result.rows);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
    getClassStudents,
    getClassSubjects,
    assignSubject,
    removeSubject,
    getClassTimetable
};
