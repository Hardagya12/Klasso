'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { createNotification } = require('../utils/notificationHelper');

// ── GET /api/fees/types  ──────────────────────────────────────────────────────
const getFeeTypes = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ft.*, ay.label AS academic_year_label
       FROM fee_types ft
       LEFT JOIN academic_years ay ON ay.id = ft.academic_year_id
       WHERE ft.school_id = $1
       ORDER BY ft.due_date`,
      [req.user.school_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// ── POST /api/fees/types  ─────────────────────────────────────────────────────
const createFeeType = async (req, res, next) => {
  try {
    const { name, amount, due_date = null, academic_year_id = null } = req.body;
    const result = await query(
      `INSERT INTO fee_types (school_id, name, amount, due_date, academic_year_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.school_id, name, amount, due_date, academic_year_id]
    );
    return sendSuccess(res, result.rows[0], 'Fee type created', 201);
  } catch (err) { next(err); }
};

// ── PUT /api/fees/types/:id  ──────────────────────────────────────────────────
const updateFeeType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['name','amount','due_date','academic_year_id'];
    const updates = []; const params = []; let idx = 1;
    for (const f of allowed) {
      if (req.body[f] !== undefined) { updates.push(`${f}=$${idx++}`); params.push(req.body[f]); }
    }
    if (!updates.length) return sendError(res, 'No fields to update', 400);
    params.push(id);
    const result = await query(
      `UPDATE fee_types SET ${updates.join(',')} WHERE id=$${idx} AND school_id=$${idx+1} RETURNING *`,
      [...params, req.user.school_id]
    );
    if (!result.rows.length) return sendError(res, 'Fee type not found', 404);
    return sendSuccess(res, result.rows[0], 'Fee type updated');
  } catch (err) { next(err); }
};

// ── DELETE /api/fees/types/:id  ───────────────────────────────────────────────
const deleteFeeType = async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM fee_types WHERE id=$1 AND school_id=$2 RETURNING id',
      [req.params.id, req.user.school_id]
    );
    if (!result.rows.length) return sendError(res, 'Fee type not found', 404);
    return sendSuccess(res, null, 'Fee type deleted');
  } catch (err) { next(err); }
};

// ── GET /api/fees/payments  ───────────────────────────────────────────────────
const getPayments = async (req, res, next) => {
  try {
    const { student_id, fee_type_id, status } = req.query;
    const { page, limit, offset } = req.pagination;

    const conditions = ['st.school_id=$1'];
    const params = [req.user.school_id];
    let idx = 2;

    if (student_id)  { conditions.push(`fp.student_id=$${idx++}`);  params.push(student_id); }
    if (fee_type_id) { conditions.push(`fp.fee_type_id=$${idx++}`); params.push(fee_type_id); }
    if (status)      { conditions.push(`fp.status=$${idx++}`);       params.push(status); }

    const where = conditions.join(' AND ');

    const countRes = await query(
      `SELECT COUNT(*) FROM fee_payments fp JOIN students st ON st.id=fp.student_id WHERE ${where}`, params
    );
    const dataRes  = await query(
      `SELECT fp.*, u.name AS student_name, ft.name AS fee_type_name
       FROM fee_payments fp
       JOIN students st ON st.id=fp.student_id
       JOIN users u ON u.id=st.user_id
       JOIN fee_types ft ON ft.id=fp.fee_type_id
       WHERE ${where}
       ORDER BY fp.payment_date DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return sendPaginated(res, dataRes.rows, parseInt(countRes.rows[0].count), req.pagination);
  } catch (err) { next(err); }
};

// ── POST /api/fees/payments  ──────────────────────────────────────────────────
const recordPayment = async (req, res, next) => {
  try {
    const { student_id, fee_type_id, amount_paid, payment_method = 'online', transaction_id = null, receipt_url = null } = req.body;

    const result = await query(
      `INSERT INTO fee_payments (student_id, fee_type_id, amount_paid, payment_method, transaction_id, receipt_url, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [student_id, fee_type_id, amount_paid, payment_method, transaction_id, receipt_url, req.user.id]
    );
    const payment = result.rows[0];

    // Notify student/parent
    const stuRes = await query('SELECT user_id FROM students WHERE id=$1', [student_id]);
    if (stuRes.rows.length) {
      await createNotification(
        stuRes.rows[0].user_id,
        'Fee Payment Recorded',
        `Payment of ₹${amount_paid} received successfully.`,
        'success', 'fee', payment.id
      );
    }

    return sendSuccess(res, payment, 'Payment recorded', 201);
  } catch (err) { next(err); }
};

// ── GET /api/fees/defaulters  ─────────────────────────────────────────────────
// Students who haven't paid a particular fee type
const getDefaulters = async (req, res, next) => {
  try {
    const { fee_type_id } = req.query;
    if (!fee_type_id) return sendError(res, 'fee_type_id is required', 400);

    const result = await query(
      `SELECT st.id AS student_id, u.name AS student_name, u.email,
              c.name AS class_name, c.section
       FROM students st
       JOIN users u ON u.id=st.user_id
       LEFT JOIN classes c ON c.id=st.class_id
       WHERE st.school_id=$1
         AND st.id NOT IN (
           SELECT student_id FROM fee_payments WHERE fee_type_id=$2 AND status='paid'
         )
       ORDER BY c.name, c.section, st.roll_no`,
      [req.user.school_id, fee_type_id]
    );

    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

module.exports = { getFeeTypes, createFeeType, updateFeeType, deleteFeeType, getPayments, recordPayment, getDefaulters };
