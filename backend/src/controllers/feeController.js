'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { createNotification } = require('../utils/notificationHelper');

// ─── GET /api/fees/types ─────────────────────────────────────────────────────
const getFeeTypes = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const result = await query(
      'SELECT * FROM fee_types WHERE school_id=$1 ORDER BY name',
      [school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── POST /api/fees/types ─────────────────────────────────────────────────────
const createFeeType = async (req, res, next) => {
  try {
    const { name, amount, due_date = null, academic_year_id = null } = req.body;
    const school_id = req.user.school_id;
    const result = await query(
      `INSERT INTO fee_types (school_id, name, amount, due_date, academic_year_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [school_id, name, amount, due_date, academic_year_id]
    );
    return sendSuccess(res, result.rows[0], 'Fee type created', 201);
  } catch (err) { next(err); }
};

// ─── GET /api/fees/student/:id ───────────────────────────────────────────────
const getStudentFeeStatus = async (req, res, next) => {
  try {
    const { id: student_id } = req.params;
    const school_id = req.user.school_id;

    if (req.user.role === 'student') {
      const own = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
      if (!own.rows.length || own.rows[0].id !== student_id) {
        return sendError(res, 'Forbidden', 403);
      }
    } else if (req.user.role === 'parent') {
      const link = await query(
        'SELECT 1 FROM student_parents WHERE student_id=$1 AND parent_id=$2',
        [student_id, req.user.id]
      );
      if (!link.rows.length) return sendError(res, 'Forbidden', 403);
    }

    const result = await query(
      `SELECT ft.id AS fee_type_id, ft.name, ft.amount,
              fp.id AS payment_id, fp.amount_paid, fp.payment_date, fp.payment_method, fp.status
       FROM fee_types ft
       LEFT JOIN fee_payments fp ON fp.fee_type_id = ft.id AND fp.student_id = $1
       WHERE ft.school_id = $2
       ORDER BY ft.name`,
      [student_id, school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/fees/pending ────────────────────────────────────────────────────
const getPendingFees = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const result = await query(
      `SELECT st.id AS student_id, u.name AS student_name, c.name AS class_name,
              ft.id AS fee_type_id, ft.name AS fee_name, ft.amount,
              COALESCE(fp.amount_paid, 0) AS amount_paid,
              ft.amount - COALESCE(fp.amount_paid, 0) AS balance
       FROM students st
       JOIN users u ON u.id = st.user_id
       JOIN classes c ON c.id = st.class_id
       CROSS JOIN fee_types ft
       LEFT JOIN fee_payments fp ON fp.student_id = st.id AND fp.fee_type_id = ft.id AND fp.status = 'paid'
       WHERE ft.school_id = $1
         AND (fp.id IS NULL OR fp.amount_paid < ft.amount)
       ORDER BY u.name, ft.name`,
      [school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ─── POST /api/fees/payment ──────────────────────────────────────────────────
const recordPayment = async (req, res, next) => {
  try {
    const { student_id, fee_type_id, amount_paid, payment_method = 'cash', transaction_id = null } = req.body;

    const result = await query(
      `INSERT INTO fee_payments (student_id, fee_type_id, amount_paid, payment_method, transaction_id, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [student_id, fee_type_id, amount_paid, payment_method, transaction_id, req.user.id]
    );
    const payment = result.rows[0];

    // Notify the student/parent
    const stuRes = await query('SELECT user_id FROM students WHERE id=$1', [student_id]);
    if (stuRes.rows.length && stuRes.rows[0].user_id) {
      await createNotification(
        stuRes.rows[0].user_id,
        'Fee Payment Recorded',
        `Payment of ₹${amount_paid} received.`,
        'success', 'fee', payment.id
      );
    }

    return sendSuccess(res, payment, 'Payment recorded', 201);
  } catch (err) { next(err); }
};

// ─── GET /api/fees/payment/:id ───────────────────────────────────────────────
const getPaymentById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT fp.*, ft.name AS fee_name, u.name AS student_name, ru.name AS recorded_by_name
       FROM fee_payments fp
       JOIN fee_types ft ON ft.id = fp.fee_type_id
       JOIN students st ON st.id = fp.student_id
       JOIN users u ON u.id = st.user_id
       LEFT JOIN users ru ON ru.id = fp.recorded_by
       WHERE fp.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Payment not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// ─── GET /api/fees/summary ────────────────────────────────────────────────────
const getFeeSummary = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    const result = await query(
      `SELECT ft.name AS fee_type,
              COUNT(DISTINCT fp.student_id)::int AS paid_count,
              SUM(fp.amount_paid) AS total_collected
       FROM fee_payments fp
       JOIN fee_types ft ON ft.id = fp.fee_type_id
       WHERE ft.school_id = $1
       GROUP BY ft.name
       ORDER BY ft.name`,
      [school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

module.exports = { getFeeTypes, createFeeType, getStudentFeeStatus, getPendingFees, recordPayment, getPaymentById, getFeeSummary };
