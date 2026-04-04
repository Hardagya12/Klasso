'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { generateProgressReport } = require('../services/ai.service');
const { createNotification } = require('../utils/notificationHelper');

// GET /api/documents/student/:id
const getStudentDocuments = async (req, res, next) => {
  try {
    const { id: student_id } = req.params;
    if (req.user.role === 'parent') {
      const check = await query('SELECT 1 FROM student_parents WHERE student_id=$1 AND parent_id=$2', [student_id, req.user.id]);
      if (!check.rows.length) return sendError(res, 'Access denied', 403);
    }
    const result = await query(
      `SELECT d.*, u.name AS issued_by_name FROM documents d
       LEFT JOIN users u ON u.id=d.issued_by
       WHERE d.student_id=$1 ORDER BY d.generated_at DESC`,
      [student_id]
    );
    return sendSuccess(res, result.rows);
  } catch (err) { next(err); }
};

// POST /api/documents/generate
const generateDocument = async (req, res, next) => {
  try {
    const { student_id, type } = req.body;
    // type: 'bonafide' | 'transfer_certificate' | 'character_certificate'

    const stuRes = await query(
      `SELECT u.name, u.email, st.roll_no, st.admission_no, st.dob, st.gender,
              c.name AS class_name, c.section, sc.name AS school_name, sc.address AS school_address,
              sc.phone AS school_phone
       FROM students st
       JOIN users u ON u.id=st.user_id
       LEFT JOIN classes c ON c.id=st.class_id
       LEFT JOIN schools sc ON sc.id=st.school_id
       WHERE st.id=$1`, [student_id]
    );
    if (!stuRes.rows.length) return sendError(res, 'Student not found', 404);
    const s = stuRes.rows[0];

    const today = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
    const academic_year = (() => {
      const now = new Date();
      const yr = now.getFullYear();
      return now.getMonth() >= 3 ? `${yr}-${yr+1}` : `${yr-1}-${yr}`;
    })();

    let prompt_type;
    if (type === 'bonafide')            prompt_type = `Bonafide Certificate (confirms student is enrolled)`;
    else if (type === 'transfer_certificate') prompt_type = `Transfer Certificate (student leaving the school)`;
    else if (type === 'character_certificate') prompt_type = `Character Certificate (attests good conduct)`;
    else return sendError(res, 'Invalid document type. Use: bonafide, transfer_certificate, character_certificate', 400);

    // Build document content with school letterhead via Claude
    const systemPrompt = `You are a school administrator generating official school documents. Format the document professionally with letterhead, reference number, and proper closing.`;
    const userPrompt = `Generate a ${prompt_type} for:

School: ${s.school_name}
School Address: ${s.school_address}
School Phone: ${s.school_phone}

Student Name: ${s.name}
Admission No: ${s.admission_no}
Roll No: ${s.roll_no}
Class: ${s.class_name} - ${s.section}
Academic Year: ${academic_year}
Date of Birth: ${s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : 'Not available'}
Gender: ${s.gender || 'Not specified'}
Date: ${today}

Format it as a proper official document with reference number, body, and signature block. Do not include placeholders — use the actual data provided.`;

    let content;
    try {
      const { generate } = require('../services/ai.service');
      content = await generate(`${systemPrompt}\n\n${userPrompt}`, 800);
    } catch (aiErr) {
      // Fallback: plain text document
      content = `${s.school_name}\n${s.school_address}\n\n${prompt_type.toUpperCase()}\n\nDate: ${today}\n\nThis is to certify that ${s.name} (Admission No: ${s.admission_no}) is/was a bonafide student of Class ${s.class_name}-${s.section} during the academic year ${academic_year}.\n\nPrincipal\n${s.school_name}`;
    }

    const result = await query(
      `INSERT INTO documents (student_id, type, content, generated_by)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [student_id, type, content, req.user.id]
    );

    return sendSuccess(res, result.rows[0], 'Document generated', 201);
  } catch (err) { next(err); }
};

// GET /api/documents/:id
const getDocumentById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT d.*, u.name AS generated_by_name, issuer.name AS issued_by_name
       FROM documents d
       LEFT JOIN users u ON u.id=d.generated_by
       LEFT JOIN users issuer ON issuer.id=d.issued_by
       WHERE d.id=$1`, [req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Document not found', 404);
    return sendSuccess(res, result.rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/documents/:id/issue
const issueDocument = async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE documents SET issued=TRUE, issued_by=$1, issued_at=NOW() WHERE id=$2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!result.rows.length) return sendError(res, 'Document not found', 404);
    return sendSuccess(res, result.rows[0], 'Document issued');
  } catch (err) { next(err); }
};

module.exports = { getStudentDocuments, generateDocument, getDocumentById, issueDocument };
