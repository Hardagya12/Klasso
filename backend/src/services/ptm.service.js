'use strict';

const { prisma } = require('../db/prisma');
const { generatePTMTalkingPoints, generatePTMSummary } = require('../services/ai.service');

/**
 * Service specifically for fetching student data and combining it with AI logic for PTMs.
 */
class PTMService {
  /**
   * Fetches the context a teacher needs to discuss a student during PTM
   * and subsequently hits Claude to get AI talking points.
   */
  static async populateSlotWithTalkingPoints(slotId, studentId) {
    // 1. Gather raw context from DB
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 14 // Last 14 records
        },
        marks: {
          include: { examSubject: true }
        },
        moodCheckIns: {
          orderBy: { date: 'desc' },
          take: 7
        },
        questCompletions: {
          include: { quest: true },
          orderBy: { completedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    // Process attendance
    const presentCount = student.attendanceRecords.filter(r => r.status === 'PRESENT').length;
    const totalRecords = student.attendanceRecords.length || 1;
    const avgAttendance = ((presentCount / totalRecords) * 100).toFixed(1);

    // Process Marks (recent exams)
    const recentGrades = student.marks.map(m => ({
      subject: m.examSubject?.subjectId || 'Subject',
      score: m.score,
      max: m.maxMarks,
      grade: m.grade
    })).slice(0, 5);

    // Process Mood
    const recentMoods = student.moodCheckIns.map(m => m.mood);

    // Process Quests
    const recentQuests = student.questCompletions.map(qc => qc.quest?.title);

    // Final Payload
    const contextData = {
      name: `${student.firstName} ${student.lastName}`,
      recentAttendancePercentage: avgAttendance,
      recentGrades,
      recentQuestsCompleted: recentQuests,
      recentMoodCheckIns: recentMoods,
    };

    // 2. Call AI
    const talkingPoints = await generatePTMTalkingPoints(contextData);

    // 3. Update Slot
    const updatedSlot = await prisma.pTMSlot.update({
      where: { id: slotId },
      data: { talkingPoints }
    });

    return updatedSlot;
  }

  /**
   * Takes raw teacher notes from the PTM, passes to Claude.
   */
  static async generatePostMeetingSummary(slotId, teacherNotes) {
    const slot = await prisma.pTMSlot.findUnique({
      where: { id: slotId },
      include: { student: true }
    });

    if (!slot) {
      throw new Error(`Slot ${slotId} not found`);
    }

    const studentName = `${slot.student.firstName} ${slot.student.lastName}`;

    // Generate AI Summary
    const summary = await generatePTMSummary({ 
      studentName, 
      teacherNotes,
      teacherName: 'Your Teacher',
      talkingPoints: slot.talkingPoints || []
    });

    // Save to slot
    const updatedSlot = await prisma.pTMSlot.update({
      where: { id: slotId },
      data: {
        summary: summary,
        summarysentAt: new Date(),
        status: 'COMPLETED'
      }
    });

    return updatedSlot;
  }
}

module.exports = PTMService;
