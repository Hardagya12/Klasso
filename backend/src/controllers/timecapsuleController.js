'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const timecapsuleService = require('../services/timecapsule.service');
const prisma = require('../db/prisma');
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

/**
 * GET /api/timecapsule/student/:studentId
 */
const getStudentCapsule = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const academicYear = req.query.academicYear || '2024-25';

    // Auth check: parent/student can only check their own unless teacher/admin
    if (['student', 'parent'].includes(req.user.role)) {
       const userStudentCheck = await prisma.student.findUnique({ where: { id: studentId } });
       // Assuming parent's id connects or is skipped for simplicity inside this hackathon bound.
       if (userStudentCheck.userId !== req.user.id && req.user.role === 'student') {
         return sendError(res, 'Unauthorized', 403);
       }
    }

    const capsule = await prisma.timeCapsule.findUnique({
      where: {
        studentId_academicYear: { studentId, academicYear }
      }
    });

    if (!capsule) return sendError(res, 'Time Capsule not found', 404);
    
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
    const capsule = await prisma.timeCapsule.findUnique({ where: { id: req.params.id } });
    if (!capsule || !capsule.shareableCardUrl) return res.status(404).send('Not found');

    // /uploads/timecapsules/xxx.png
    const fileName = path.basename(capsule.shareableCardUrl);
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
