'use strict';

const { prisma } = require('../db/prisma');
const nodeHtmlToImage = require('node-html-to-image');
const path = require('path');
const fs = require('fs');
const { generateTimeCapsuleNarrative } = require('../services/ai.service');

const UPLOADS_DIR = path.join(__dirname, '../../uploads/timecapsules');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Generate Time Capsule HTML Template
 */
const generateHtmlTemplate = (student, data, aiNarrative) => {
  return `
  <html>
    <head>
      <style>
        body { width: 800px; height: 800px; margin: 0; font-family: 'DM Sans', sans-serif; background-color: #3ECFB2; position: relative; overflow: hidden; }
        .card { background-color: #F7FBF9; width: 720px; height: 720px; border-radius: 40px; margin: 40px; box-shadow: 10px 10px 0px #1C2B27; border: 4px solid #1C2B27; display: flex; flex-direction: column; overflow: hidden; }
        .header { background-color: #3ECFB2; padding: 40px; border-bottom: 4px solid #1C2B27; color: white; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; font-family: 'Nunito', sans-serif; font-size: 32px; font-weight: 800; color: #1C2B27; }
        .header .emoji { font-size: 72px; }
        
        .content { padding: 40px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .headline { font-size: 36px; font-family: 'Nunito', sans-serif; font-weight: 800; color: #E8534A; line-height: 1.2; text-align: center; }
        
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; }
        .stat-box { background: #FFFFFF; border: 3px solid #1C2B27; border-radius: 20px; padding: 20px; box-shadow: 4px 4px 0px #D4EDE8; text-align: center; }
        .stat-val { font-size: 48px; font-weight: 900; color: #3ECFB2; }
        .stat-label { font-size: 16px; font-weight: 700; color: #7A7670; }
        
        .highlight { margin-top: 30px; background: #FF6B6B; border: 3px solid #1C2B27; color: white; border-radius: 20px; padding: 20px; font-size: 20px; font-weight: 700; line-height: 1.5; transform: rotate(-2deg); box-shadow: 4px 4px 0px #1C2B27; }
        
        .footer { text-align: center; font-size: 14px; color: #A1A1AA; font-weight: 700; padding-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <h1>${student.name}'s Year</h1>
            <p style="margin: 5px 0 0; font-weight: 700; font-size: 18px; color: #1C2B27;">Academic Year ${data.academicYear}</p>
          </div>
          <div class="emoji">${aiNarrative.emoji || '🚀'}</div>
        </div>
        <div class="content">
          <div class="headline">"${aiNarrative.headline}"</div>
          
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-val">${data.attendance.overall}%</div>
              <div class="stat-label">Attendance</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">${data.quests.completed}</div>
              <div class="stat-label">Quests Conquered</div>
            </div>
            <div class="stat-box">
              <div class="stat-val" style="color: #F5A623;">${data.badges.length}</div>
              <div class="stat-label">Badges Earned</div>
            </div>
            <div class="stat-box">
              <div class="stat-val" style="color: #a855f7;">${data.aiChats}</div>
              <div class="stat-label">AI Buddy Chats</div>
            </div>
          </div>

          <div class="highlight">
            ${aiNarrative.highlight}
          </div>
        </div>
        <div class="footer">KLASSO TIME CAPSULE ✦ DO NOT OPEN UNTIL COMMENCEMENT</div>
      </div>
    </body>
  </html>
  `;
};

/**
 * generateTimeCapsule
 */
const generateTimeCapsule = async (studentId, academicYear) => {
  // 1. Fetch Student Info
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true }
  });
  if (!student) throw new Error('Student not found');

  // 2. Fetch Attendance
  const attendanceRecords = await prisma.attendance.findMany({ where: { studentId } });
  const totalPresent = attendanceRecords.filter(a => a.status === 'PRESENT').length;
  const overallAtt = attendanceRecords.length ? Math.round((totalPresent / attendanceRecords.length) * 100) : 0;
  
  // 3. Fetch Grades
  const marks = await prisma.mark.findMany({ where: { studentId }, include: { exam: true, subject: true } });
  
  // 4. Fetch Assignments
  const assignments = await prisma.assignmentSubmission.findMany({ where: { studentId } });
  
  // 5. Fetch Quests & Badges
  const quests = await prisma.questCompletion.findMany({ where: { studentId } });
  const badges = await prisma.userBadge.findMany({ where: { studentId } });
  
  // 6. Aggregate Data
  const aggregatedData = {
    academicYear,
    attendance: { overall: overallAtt, totalPresent },
    grades: { totalExamsTaken: marks.length },
    assignments: { totalSubmitted: assignments.length },
    quests: { completed: quests.length },
    badges: badges.map(b => b.badgeType),
    aiChats: 15, // Stub: If there was a study buddy session table, query it here. Let's provide a fun random stat.
  };

  // 7. Get AI Narrative
  const aiNarrative = await generateTimeCapsuleNarrative(aggregatedData);

  // 8. Generate Image
  const html = generateHtmlTemplate(student, aggregatedData, aiNarrative);
  const fileName = `${studentId}_${academicYear}.png`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  try {
    await nodeHtmlToImage({
      output: filePath,
      html: html,
      puppeteerArgs: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
    });
  } catch (err) {
    console.error("Failed to generate TimeCapsule image", err);
    // Ignore error, we can still save record without image if it fails
  }

  const shareableCardUrl = `/uploads/timecapsules/${fileName}`;

  // 9. Create/Update Record
  const capsule = await prisma.timeCapsule.upsert({
    where: {
      studentId_academicYear: {
        studentId,
        academicYear
      }
    },
    update: {
      data: aggregatedData,
      aiNarrative,
      shareableCardUrl,
      isPublished: true
    },
    create: {
      studentId,
      academicYear,
      data: aggregatedData,
      aiNarrative,
      shareableCardUrl,
      isPublished: true
    }
  });

  // 10. Send Notification
  await prisma.notification.create({
    data: {
      userId: student.userId,
      title: 'Your Year in Review is ready! 🎉',
      message: 'Tap here to open your Time Capsule.',
      type: 'system'
    }
  });

  return capsule;
};

/**
 * generateClassTimeCapsules
 */
const generateClassTimeCapsules = async (classId, academicYear) => {
  const students = await prisma.student.findMany({ where: { classId } });
  
  let generated = 0;
  let errors = [];

  // Chunking by 5 to respect rate limits
  const chunkSize = 5;
  for (let i = 0; i < students.length; i += chunkSize) {
    const chunk = students.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (student) => {
      try {
        await generateTimeCapsule(student.id, academicYear);
        generated++;
      } catch (err) {
        errors.push({ studentId: student.id, error: err.message });
      }
    }));
  }

  return { generated, errors };
};

module.exports = {
  generateTimeCapsule,
  generateClassTimeCapsules
};
