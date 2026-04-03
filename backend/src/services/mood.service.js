'use strict';

const prisma = require('../db/prisma'); // Assuming there's a central prisma client
const { generateMoodAlertMessage } = require('../utils/claudeApi');

// Converts Enum to number for calculation
const moodToScore = (mood) => {
  const map = { GREAT: 5, GOOD: 4, OKAY: 3, SAD: 2, STRESSED: 1 };
  return map[mood] || 3;
};

/**
 * Helper to test consecutive low
 */
const checkConsecutiveLow = (sortedCheckIns) => {
  let lowStreak = 0;
  for (let i = sortedCheckIns.length - 1; i >= 0; i--) {
    const score = moodToScore(sortedCheckIns[i].mood);
    if (score <= 2) {
      lowStreak++;
      if (lowStreak >= 4) return true;
    } else {
      break; 
    }
  }
  return false;
};

/**
 * analyzeMoodPattern
 */
const analyzeMoodPattern = async (studentId) => {
  // 1. Fetch last 7 days of moods
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const checkIns = await prisma.moodCheckIn.findMany({
    where: {
      studentId,
      date: { gte: sevenDaysAgo }
    },
    orderBy: { date: 'asc' }
  });

  if (checkIns.length < 2) return; // Not enough data

  // Provide stats arrays
  const last2Days = checkIns.slice(-2);
  const previousDays = checkIns.slice(0, -2);
  
  const avg = (arr) => arr.reduce((acc, val) => acc + moodToScore(val.mood), 0) / arr.length;
  
  const currentAvg = checkIns.length ? avg(checkIns) : 0;
  const recentAvg = last2Days.length ? avg(last2Days) : 0;
  const pastAvg = previousDays.length ? avg(previousDays) : 0;

  let patternDetected = null;

  if (checkConsecutiveLow(checkIns)) {
    patternDetected = 'CONSECUTIVE_LOW';
  } else if (previousDays.length >= 2 && recentAvg < pastAvg - 1.5) {
    patternDetected = 'SUDDEN_DROP';
  } else if (checkIns.length >= 4 && currentAvg < 2.5) {
    patternDetected = 'WEEKLY_PATTERN';
  }

  if (!patternDetected) return;

  // 2. See if there is a recent alert
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const existingAlert = await prisma.moodAlert.findFirst({
    where: {
      studentId,
      alertType: patternDetected,
      createdAt: { gte: threeDaysAgo }
    }
  });

  if (existingAlert) return; // Skip if already alerted recently

  // 3. Find class teacher
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true }
  });

  if (!student || !student.class || !student.class.classTeacherId) return; // No homeroom teacher assigned
  const teacherId = student.class.classTeacherId;

  // 4. Generate AI Message
  let patternText = '';
  switch(patternDetected) {
    case 'CONSECUTIVE_LOW': patternText = 'consistently low mood (sad/stressed)'; break;
    case 'SUDDEN_DROP': patternText = 'a sudden, significant negative drop in mood'; break;
    case 'WEEKLY_PATTERN': patternText = 'an overall weekly average of low wellbeing'; break;
  }
  
  let aiMessage;
  try {
    aiMessage = await generateMoodAlertMessage(patternText, checkIns.length);
  } catch (error) {
    console.error("AI Mood Alert Error:", error);
    aiMessage = "A student in your class has been consistently checking in with a lower mood. Please check their general wellbeing and see if they need any support.";
  }

  // 5. Create Alert & Notification for Teacher
  await prisma.moodAlert.create({
    data: {
      studentId,
      teacherId,
      alertType: patternDetected,
      message: aiMessage
    }
  });

  await prisma.notification.create({
    data: {
      userId: teacherId,
      title: 'Wellbeing check-in needed',
      message: aiMessage,
      type: 'system'
    }
  });
};

/**
 * getMoodSummary
 */
const getMoodSummary = async (studentId, fromDate, toDate) => {
  const whereClause = { studentId };
  if (fromDate && toDate) {
    whereClause.date = { gte: new Date(fromDate), lte: new Date(toDate) };
  }

  const checkIns = await prisma.moodCheckIn.findMany({
    where: whereClause,
    orderBy: { date: 'asc' }
  });

  if (!checkIns.length) return { checkIns: [], weeklyAvg: 0, streak: 0, mostFrequent: null };

  const scores = checkIns.map(c => moodToScore(c.mood));
  const weeklyAvg = scores.reduce((sum, val) => sum + val, 0) / checkIns.length;
  
  // Calculate Streak
  let streak = 0;
  const sortedDesc = [...checkIns].sort((a, b) => b.date - a.date);
  
  // Start from today or yesterday
  const now = new Date();
  now.setHours(0,0,0,0);
  
  let cursorDate = new Date(sortedDesc[0].date);
  cursorDate.setHours(0,0,0,0);
  
  // If the latest checkin is not today or yesterday, streak is 0
  const diffDays = Math.floor((now.getTime() - cursorDate.getTime()) / (1000 * 3600 * 24));
  if (diffDays <= 1) {
    for (let c of sortedDesc) {
      const cDate = new Date(c.date);
      cDate.setHours(0,0,0,0);
      if (cDate.getTime() === cursorDate.getTime()) {
        streak++;
        cursorDate.setDate(cursorDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate Most Frequent
  const frequency = {};
  checkIns.forEach(c => {
    frequency[c.mood] = (frequency[c.mood] || 0) + 1;
  });
  let mostFrequent = null;
  let maxCount = 0;
  for (const [m, count] of Object.entries(frequency)) {
    if (count > maxCount) {
      mostFrequent = m;
      maxCount = count;
    }
  }

  return {
    checkIns: checkIns.map(c => ({ date: c.date, mood: c.mood, note: c.note })),
    weeklyAvg,
    mostFrequent,
    streak
  };
};

module.exports = {
  analyzeMoodPattern,
  getMoodSummary
};
