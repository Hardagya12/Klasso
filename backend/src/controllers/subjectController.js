const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

const getAllSubjects = async (req, res, next) => {
    try {
        const school_id = req.user.school_id;

        const sql = `
            SELECT s.id, s.name, s.code,
                   (SELECT COUNT(*) FROM class_subjects cs WHERE cs.subject_id = s.id) AS classes_count
            FROM subjects s
            WHERE s.school_id = $1
            ORDER BY s.name ASC
        `;
        const result = await query(sql, [school_id]);

        return sendSuccess(res, result.rows);
    } catch (error) {
        next(error);
    }
};

const createSubject = async (req, res, next) => {
    try {
        const { name, code } = req.body;
        const school_id = req.user.school_id;

        const checkSql = `SELECT id FROM subjects WHERE school_id = $1 AND name = $2`;
        const checkResult = await query(checkSql, [school_id, name]);
        if (checkResult.rows.length > 0) {
            return sendError(res, 'Subject with this name already exists in the school', 409);
        }

        const sql = `
            INSERT INTO subjects (school_id, name, code)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await query(sql, [school_id, name, code]);

        return sendSuccess(res, result.rows[0], 'Subject created successfully', 201);
    } catch (error) {
        next(error);
    }
};

const updateSubject = async (req, res, next) => {
    try {
        const subjectId = req.params.id;
        const { name, code } = req.body;

        let updates = [];
        let params = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            params.push(name);
        }
        if (code !== undefined) {
            updates.push(`code = $${paramCount++}`);
            params.push(code);
        }

        if (updates.length === 0) {
            return sendError(res, 'No fields to update', 400);
        }

        updates.push('updated_at = NOW()');
        params.push(subjectId);

        const sql = `
            UPDATE subjects
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(sql, params);

        if (result.rows.length === 0) {
            return sendError(res, 'Subject not found', 404);
        }

        return sendSuccess(res, result.rows[0], 'Subject updated successfully');
    } catch (error) {
        next(error);
    }
};

const deleteSubject = async (req, res, next) => {
    try {
        const subjectId = req.params.id;

        const result = await query('DELETE FROM subjects WHERE id = $1 RETURNING id', [subjectId]);

        if (result.rows.length === 0) {
            return sendError(res, 'Subject not found', 404);
        }

        return sendSuccess(res, null, 'Subject deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSubjects,
    createSubject,
    updateSubject,
    deleteSubject
};
