'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const timecapsuleService = require('../services/timecapsule.service');
const { prisma } = require('../db/prisma');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/timecapsule/generate/:studentId
 */
const generateForStudent = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const academicYear = req.body.academicYear || '2024-25';
    
    const capsule = await timecapsuleService.generateTimeCapsule(studentId, academicYear);
    return sendSuccess(res, capsule);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/timecapsule/generate/class/:classId
 */
const generateForClass = async (req, res, next) => {
  try {
    const classId = req.params.classId;
    const academicYear = req.body.academicYear || '2024-25';

    res.json({ success: true, message: "Generation started in background" });
    
    // Background execution since it takes time
    timecapsuleService.generateClassTimeCapsules(classId, academicYear).then(res => {
        console.log(`Finished class generation: ${res.generated} success`);
    }).catch(e => console.error("Class Gen Error", e));

  } catch (error) {
    next(error);
  }
};

const { query } = require('../db/neon');

/**
 * GET /api/timecapsule/student/:studentId
 */
const getStudentCapsule = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const academicYear = req.query.academicYear || '2024-25';

    // Auth check: parent/student can only check their own unless teacher/admin
    if (['student', 'parent'].includes(req.user.role)) {
       const userStudentCheck = await query('SELECT * FROM students WHERE id=$1', [studentId]);
       if (!userStudentCheck.rows.length) return sendError(res, 'Student not found', 404);
       
       if (userStudentCheck.rows[0].user_id !== req.user.id && req.user.role === 'student') {
         return sendError(res, 'Unauthorized', 403);
       }
    }

    const { rows } = await query(
      'SELECT id, student_id, academic_year, data, ai_narrative, shareable_card_url, is_published, created_at, updated_at FROM time_capsules WHERE student_id=$1 AND academic_year=$2',
      [studentId, academicYear]
    );

    if (!rows.length) return sendError(res, 'Time Capsule not found', 404);
    
    // Map to camelCase for frontend
    const capsule = {
      id: rows[0].id,
      studentId: rows[0].student_id,
      academicYear: rows[0].academic_year,
      data: rows[0].data,
      aiNarrative: rows[0].ai_narrative,
      shareableCardUrl: rows[0].shareable_card_url,
      isPublished: true
    };
    
    return sendSuccess(res, capsule);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/timecapsule/:id/card
 */
const getCardImage = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT shareable_card_url FROM time_capsules WHERE id=$1', [req.params.id]);
    const capsule = rows[0];
    if (!capsule || !capsule.shareable_card_url) return res.status(404).send('Not found');

    // /uploads/timecapsules/xxx.png
    const fileName = path.basename(capsule.shareable_card_url);
    const filePath = path.join(__dirname, '../../uploads/timecapsules', fileName);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'image/png');
      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    }
    return res.status(404).send('Not found');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateForStudent,
  generateForClass,
  getStudentCapsule,
  getCardImage
};
