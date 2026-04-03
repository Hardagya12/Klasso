const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
    try {
        const { name, email, password, role, school_id } = req.body;

        const checkEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (checkEmail.rows.length > 0) {
            return sendError(res, 'Email already exists', 409);
        }

        const password_hash = await bcrypt.hash(password, 12);
        
        const sql = `
            INSERT INTO users (name, email, password_hash, role, school_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, role, school_id, name, avatar_url, phone, is_active, created_at, updated_at
        `;
        const result = await query(sql, [name, email, password_hash, role, school_id]);

        return sendSuccess(res, result.rows[0], 'User registered successfully', 201);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return sendError(res, 'Invalid credentials', 401);
        }

        const user = result.rows[0];
        if (!user.is_active) {
            return sendError(res, 'Account deactivated', 403);
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return sendError(res, 'Invalid credentials', 401);
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            school_id: user.school_id,
            name: user.name
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        delete user.password_hash;

        return sendSuccess(res, { token, user }, 'Login successful');
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const result = await query('SELECT id, email, role, school_id, name, avatar_url, phone, is_active, last_login, created_at, updated_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return sendError(res, 'User not found', 404);
        }
        return sendSuccess(res, result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatar_url } = req.body;
        
        let updates = [];
        let params = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            params.push(name);
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            params.push(phone);
        }
        if (avatar_url !== undefined) {
            updates.push(`avatar_url = $${paramCount++}`);
            params.push(avatar_url);
        }

        if (updates.length === 0) {
            return sendError(res, 'No valid fields to update', 400);
        }

        updates.push(`updated_at = NOW()`);
        params.push(req.user.id);

        const sql = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, email, role, school_id, name, avatar_url, phone, is_active, created_at, updated_at
        `;

        const result = await query(sql, params);
        return sendSuccess(res, result.rows[0], 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return sendError(res, 'User not found', 404);
        }

        const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!isValid) {
            return sendError(res, 'Incorrect current password', 400);
        }

        const password_hash = await bcrypt.hash(newPassword, 12);
        await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [password_hash, req.user.id]);

        return sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [req.user.id]);
        return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout
};
