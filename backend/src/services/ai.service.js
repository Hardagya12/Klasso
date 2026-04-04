'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

let _genAI = null;
function getGenAI() {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }
  return _genAI;
}
function getModelName() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

// Helper — single text generation call
// Use this for every AI feature below
async function generate(prompt, maxTokens = 500) {
  try {
    const model = getGenAI().getGenerativeModel({
      model: getModelName(),
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error?.message || error);
    return ''; // return empty string — callers handle fallback
  }
}

// Helper — JSON generation (parse safely)
async function generateJSON(prompt, fallback, maxTokens = 600) {
  const fullPrompt = `${prompt}

IMPORTANT: Return ONLY valid JSON. No markdown, no backticks, no explanation.
Just the raw JSON object or array.`;

  const raw = await generate(fullPrompt, maxTokens);

  // Strip markdown code fences if Gemini adds them anyway
  const cleaned = raw
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error('JSON parse failed, raw output:', cleaned);
    return fallback;
  }
}

// ─────────────────────────────────────────────
// FEATURE: Generate progress report narrative
// ─────────────────────────────────────────────
async function generateProgressReport(params) {
  const prompt = `
You are a school teacher writing a term progress report for a student.

Student: ${params.studentName}
Class: ${params.className}
Term: ${params.term}
Attendance: ${params.attendance?.overall || 0}% overall
Subject attendance: ${JSON.stringify(params.attendance?.bySubject || {})}
Grades: ${(params.grades || []).map(g => `${g.subject}: ${g.percentage}% (${g.trend})`).join(', ')}
Tone: ${params.tone}
Language: ${params.language}
Include: ${Object.entries(params.options || {}).filter(([,v]) => v).map(([k]) => k).join(', ')}

Write a ${params.language} progress report paragraph of 150-200 words.
Be specific — mention actual subjects and scores.
Highlight improvements and areas of concern.
Do NOT use generic filler phrases.
Make it feel personal and written by a caring teacher.
Return ONLY the report paragraph text, nothing else.
`;
  const result = await generate(prompt, 400);
  return result || `${params.studentName} has been making steady progress this term. Further details will be shared at the parent-teacher meeting.`;
}

// ─────────────────────────────────────────────
// FEATURE: Generate AI feedback for a grade
// ─────────────────────────────────────────────
async function generateStudentFeedback(params) {
  const trend = params.historicalAvg
    ? params.percentage > params.historicalAvg ? 'improved' : 'declined'
    : 'consistent';

  const prompt = `
Write a 2-3 sentence personalized feedback comment for a student's assessment.

Student: ${params.studentName}
Subject: ${params.subject}
Assessment: ${params.assessmentName}
Score: ${params.score}/${params.maxScore} (${params.percentage}%)
Performance trend: ${trend}
Tone: ${params.tone}

Rules:
- Be specific about the score
- Mention the subject by name
- If encouraging: celebrate effort + point to growth
- If constructive: acknowledge effort + suggest specific improvement
- If formal: professional and factual
- Maximum 3 sentences
- Return ONLY the feedback text
`;
  const result = await generate(prompt, 200);
  return result || `Good effort on ${params.subject}. Keep working on this topic to improve further.`;
}

// ─────────────────────────────────────────────
// FEATURE: Parse voice attendance command
// ─────────────────────────────────────────────
async function parseVoiceAttendance(text, students) {
  const fallback = {
    present: students.map(s => s.id),
    absent: [],
    late: [],
    unrecognized: [],
  };

  const studentList = students
    .map(s => `{"id":"${s.id}","name":"${s.firstName} ${s.lastName}"}`)
    .join(', ');

  const prompt = `
Given this list of students: [${studentList}]
And this voice attendance command: "${text}"

Parse the command and return a JSON object with these exact keys:
{
  "present": ["student_id_1", "student_id_2"],
  "absent": ["student_id_3"],
  "late": ["student_id_4"],
  "unrecognized": ["any names that didn't match"]
}

Rules:
- If command says "everyone present except X and Y" → all IDs in present EXCEPT matched ones go in absent
- Match names case-insensitively and partially (e.g. "Rahul" matches "Rahul Sharma")
- Students not mentioned go in "present" by default unless the command implies otherwise
- Return ONLY the JSON object
`;
  return generateJSON(prompt, fallback, 400);
}

// ─────────────────────────────────────────────
// FEATURE: Generate AI insights for a student
// ─────────────────────────────────────────────
async function generateAIInsights(params) {
  const prompt = `
Generate exactly 3 brief bullet-point insights about a student for their teacher.

Student data:
- Name: ${params.studentName}
- Attendance: ${params.attendancePercent}%
- Grade average: ${params.gradeAverage}%
- Grade trend: ${params.gradeTrend}
- Assignment submission rate: ${params.submissionRate}%
- Risk flags: ${(params.riskFlags || []).join(', ') || 'none'}
- Recent achievements: ${(params.recentBadges || []).join(', ') || 'none'}

Return a JSON array of exactly 3 strings. Each string is one insight (max 15 words).
Example: ["Attendance improved 8% this month", "Struggling in Science — scored below 50%", "Perfect homework streak this week"]
Return ONLY the JSON array.
`;
  const fallback = [
    `${params.studentName} is making progress this term`,
    `Attendance is at ${params.attendancePercent}%`,
    `Assignment completion rate is ${params.submissionRate}%`,
  ];
  return generateJSON(prompt, fallback, 300);
}

// ─────────────────────────────────────────────
// FEATURE: AI Study Buddy chat (multi-turn)
// ─────────────────────────────────────────────
async function answerStudyQuestion(chatHistory, newMessage, subject) {
  try {
    const model = getGenAI().getGenerativeModel({
      model: getModelName(),
      generationConfig: { maxOutputTokens: 800, temperature: 0.8 },
      systemInstruction: `You are a friendly, encouraging AI study buddy for a school student.
Explain concepts simply and clearly. Use examples and analogies.
Be patient and supportive. Never make the student feel stupid.
${subject ? `The student is asking about: ${subject}` : ''}
Keep responses concise — max 150 words unless the question requires more.
Use simple language appropriate for a school student.`,
    });

    const history = chatHistory.map(msg => ({
      role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (error) {
    console.error('Gemini chat error:', error?.message);
    return "Sorry, I'm having trouble connecting right now. Please try again in a moment!";
  }
}

// ─────────────────────────────────────────────
// FEATURE: Generate sub teacher briefing
// ─────────────────────────────────────────────
async function generateSubBriefing(classData) {
  const prompt = `
Generate a substitute teacher briefing for a class they don't know.

Class: ${classData.className}
Subject today: ${classData.subject}
Students: ${classData.studentCount}
Average attendance: ${classData.avgAttendance}%
Currently studying: ${classData.recentTopic}
Class achievement level: ${classData.classXPLevel || 'not set'}
Strong students to call on: ${(classData.topStudents || []).join(', ') || 'none identified'}
Students who may need extra support: ${classData.needsAttentionCount} students
Homework due today: ${(classData.todayAssignments || []).join(', ') || 'none'}

Write a friendly 3-paragraph briefing (under 120 words total):
Paragraph 1: Quick class overview and vibe
Paragraph 2: Key students to be aware of (no sensitive details)
Paragraph 3: What to cover today and any notes
Tone: one colleague briefing another. Warm and practical.
Return ONLY the briefing text.
`;
  const result = await generate(prompt, 300);
  return result || `Welcome to ${classData.className}! They are a class of ${classData.studentCount} students currently studying ${classData.recentTopic} in ${classData.subject}. Please check the timetable for today's plan.`;
}

// ─────────────────────────────────────────────
// FEATURE: Generate PTM talking points
// ─────────────────────────────────────────────
async function generatePTMTalkingPoints(studentData) {
  const prompt = `
Generate structured talking points for a parent-teacher meeting.

Student: ${studentData.studentName}
Grades: ${(studentData.grades || []).map(g => `${g.subject}: ${g.percentage}% (${g.trend})`).join(', ')}
Attendance: ${studentData.attendance}%
Assignment submission rate: ${studentData.submissionRate}%
Recent achievements: ${(studentData.recentAchievements || []).join(', ') || 'none'}
Concerns: ${(studentData.riskFlags || []).join(', ') || 'none'}

Return a JSON array of 4-5 talking points. Each object:
{
  "topic": "short topic name (3-5 words)",
  "detail": "specific detail mentioning actual numbers (1-2 sentences)",
  "action": "optional action item for parent or student",
  "sentiment": "positive | neutral | concern"
}

Mix positives and concerns. Be specific with numbers.
Return ONLY the JSON array.
`;
  const fallback = [
    { topic: 'Overall Progress', detail: `${studentData.studentName} is making steady progress this term.`, sentiment: 'neutral' }
  ];
  return generateJSON(prompt, fallback, 500);
}

// ─────────────────────────────────────────────
// FEATURE: Generate post-PTM summary
// ─────────────────────────────────────────────
async function generatePTMSummary(params) {
  const prompt = `
A parent-teacher meeting just ended. Write a friendly summary to send to the parent.

Teacher: ${params.teacherName}
Student: ${params.studentName}
Topics discussed: ${JSON.stringify(params.talkingPoints)}
Teacher's notes from the meeting: "${params.teacherNotes}"

Write exactly 3 sentences:
1. What was discussed / key highlights
2. What was agreed on or any action items
3. What to expect next / forward-looking note

Tone: warm, collaborative, forward-looking.
Return ONLY the 3-sentence summary.
`;
  const result = await generate(prompt, 200);
  return result || `Thank you for attending the parent-teacher meeting for ${params.studentName}. We discussed their progress and agreed on next steps. We look forward to seeing continued improvement next term.`;
}

// ─────────────────────────────────────────────
// FEATURE: Mood alert message for teacher
// ─────────────────────────────────────────────
async function generateMoodAlertMessage(params) {
  const prompt = `
Write a single gentle, non-alarmist 2-sentence private note to a school teacher.
A student has shown ${params.pattern} in their wellbeing check-ins over ${params.daysCount} days.

Rules:
- Do NOT name the student
- Do NOT use clinical or alarming language
- Tone: caring colleague to colleague
- Suggest a gentle check-in, nothing more
- Return ONLY the 2-sentence message
`;
  const result = await generate(prompt, 100);
  return result || `One of your students may benefit from a gentle check-in today. Sometimes a brief conversation can make a big difference.`;
}

// ─────────────────────────────────────────────
// FEATURE: Time Capsule AI narrative
// ─────────────────────────────────────────────
async function generateTimeCapsuleNarrative(studentData) {
  const improvement = studentData.endGradeAvg - studentData.startGradeAvg;
  const trend = improvement > 0 ? `improved by ${improvement.toFixed(1)}%` : `stayed consistent at ${studentData.endGradeAvg}%`;

  const prompt = `
Generate a warm, celebratory end-of-year summary for a school student.

Student: ${studentData.name}
Attendance: ${studentData.attendancePercent}% overall, best streak: ${studentData.bestStreak} days
Grades: ${trend}, best subject: ${studentData.bestSubject}, most improved: ${studentData.mostImproved}
Achievements: ${studentData.badgesEarned} badges earned, ${studentData.questsCompleted} quests completed
Study: ${studentData.aiChatSessions} AI study sessions, ${studentData.duelParticipations} knowledge duels

Return a JSON object with exactly these fields:
{
  "headline": "5-7 word punchy headline about their year",
  "highlight": "2 sentences about their biggest achievement",
  "growthStory": "2 sentences about their most notable improvement or journey",
  "funFact": "1 fun quirky stat fact (e.g. You spent X hours chatting with AI Study Buddy)",
  "teacherNote": "1 warm sentence a teacher would say about them",
  "emoji": "single most fitting emoji as a string"
}

Be specific with actual numbers. Be celebratory and warm.
Return ONLY the JSON object.
`;
  const fallback = {
    headline: `${studentData.name}'s Amazing School Year`,
    highlight: `${studentData.name} showed up and gave their best this year.`,
    growthStory: `From start to finish, growth was visible in every subject.`,
    funFact: `You earned ${studentData.badgesEarned} badges this year — impressive!`,
    teacherNote: `${studentData.name} is a pleasure to have in class.`,
    emoji: '🌟',
  };
  return generateJSON(prompt, fallback, 400);
}

// ─────────────────────────────────────────────
// FEATURE: Knowledge Duel — teaching suggestion
// ─────────────────────────────────────────────
async function generateDuelTeachingSuggestion(params) {
  const prompt = `
Students struggled with this quiz question:
Question: "${params.question}"
Correct answer: "${params.correctAnswer}"
${params.wrongAnswerPercent}% of students chose instead: "${params.mostChosenWrongAnswer}"

In exactly 2 sentences, tell the teacher:
1. Why students likely made this mistake (the common misconception)
2. What concept to revisit in the next class

Tone: collegial, practical. Return ONLY the 2 sentences.
`;
  const result = await generate(prompt, 150);
  return result || `Students may have confused this concept with a related one. Consider spending 5 minutes revisiting the core definition in your next class.`;
}

// Include generateLessonPlan to not break current codebase
async function generateLessonPlan(params) {
  const prompt = `
Create a lesson plan.
Subject: ${params.subject_name}
Topic: ${params.topic}
Class/Grade: ${params.class_name}
Duration: ${params.duration_minutes} mins
Objectives: ${params.learning_objectives}
Board: ${params.board}
`;
  const result = await generate(prompt, 600);
  return result || "Lesson plan generation unavailable.";
}

module.exports = {
  generateProgressReport,
  generateStudentFeedback,
  parseVoiceAttendance,
  generateAIInsights,
  answerStudyQuestion,
  generateSubBriefing,
  generatePTMTalkingPoints,
  generatePTMSummary,
  generateMoodAlertMessage,
  generateTimeCapsuleNarrative,
  generateDuelTeachingSuggestion,
  generateLessonPlan, // Carried over
  generate // Exporting the core text generator
};
