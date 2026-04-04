'use strict';

const https = require('https');

const BASE_URL  = 'https://api.anthropic.com';
const MODEL     = 'claude-sonnet-4-20250514';
const VERSION   = '2023-06-01';

// ─────────────────────────────────────────────────────────────────────────────
// Internal: low-level POST to Anthropic messages API (Rewritten for Gemini API)
// ─────────────────────────────────────────────────────────────────────────────
const callClaude = (systemPrompt, userPrompt, maxTokens = 1000) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return reject(new Error('GEMINI_API_KEY is not set'));

    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'Gemini API error'));
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Gemini response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// callClaudeChat — multi-turn messages (Anthropic roles: user | assistant, wrapped for Gemini)
// ─────────────────────────────────────────────────────────────────────────────
const callClaudeChat = (systemPrompt, claudeMessages, maxTokens = 1200) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return reject(new Error('GEMINI_API_KEY is not set'));

    const contents = claudeMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: contents
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'Gemini API error'));
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Gemini response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

/**
 * Klasso Buddy — tutoring chat for students (and parents/teachers asking study questions).
 * @param {{role:string, content:string}[]} messages
 * @param {{name?: string, role?: string}} context
 */
const chatStudentBuddy = async (messages, context = {}) => {
  const { name = 'Student', role: userRole = 'student' } = context;
  const systemPrompt = `You are Klasso Buddy, a friendly study assistant for schools in India (CBSE/ICSE and state boards).
- Explain clearly and briefly; use examples when helpful.
- Do not write full solutions for what is clearly graded homework—give hints and guide thinking instead.
- Keep most answers under ~350 words unless the user asks for depth.
- The user's display name is ${name}. Account role: ${userRole}.`;

  const claudeMsgs = (messages || [])
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.trim(),
    }))
    .slice(-24);

  if (!claudeMsgs.length) {
    throw new Error('At least one message with content is required');
  }

  if (claudeMsgs[0].role !== 'user') {
    claudeMsgs.unshift({ role: 'user', content: 'Hi' });
  }

  return callClaudeChat(systemPrompt, claudeMsgs, 1500);
};

// ─────────────────────────────────────────────────────────────────────────────
// generateStudentReport
// ─────────────────────────────────────────────────────────────────────────────
const generateStudentReport = async (studentData) => {
  const {
    name, class_name, section, attendance_percentage,
    marks = [], overall_percentage, overall_grade,
  } = studentData;

  const marksText = marks
    .map(m => `  - ${m.subject}: ${m.score}/${m.max_marks} (Grade: ${m.grade})`)
    .join('\n');

  const systemPrompt = `You are an experienced school teacher writing professional end-of-term progress reports for parents. Write in warm, specific, professional English that is culturally appropriate for Indian parents. Always use real numbers from the data provided. Keep the report concise but meaningful. ABSOLUTELY NO MARKDOWN. Do not use asterisks, bolding, italics, or hash tags.`;

  const userPrompt = `Write a progress report for the following student:

Name: ${name}
Class: ${class_name} - ${section}
Attendance: ${attendance_percentage}%
Overall Performance: ${overall_percentage}% (Grade: ${overall_grade})

Subject-wise Marks:
${marksText}

Structure:
Paragraph 1: Academic Highlights. Mention specific subjects, actual scores, and academic strengths smoothly in the text.
Paragraph 2: Attendance & Dedication. Comment on the specific attendance percentage, punctuality, and discipline smoothly.
Paragraph 3: Growth Areas & Closing. Identify areas needing improvement, then close with an encouraging message.

Rules:
1. Write EXACTLY THREE separate paragraphs.
2. DO NOT include any labels like "Paragraph 1:", "Academic Highlights:", "Strengths:", etc.
3. DO NOT use any Markdown formatting at all (no '**', no '*', no '##'). Output pure plain text ONLY.`;

  return callClaude(systemPrompt, userPrompt, 1000);
};

// ─────────────────────────────────────────────────────────────────────────────
// generateLessonPlan
// ─────────────────────────────────────────────────────────────────────────────
const generateLessonPlan = async (lessonData) => {
  const {
    subject_name, class_name, topic,
    duration_minutes = 45, learning_objectives = '', board = 'CBSE',
  } = lessonData;

  const systemPrompt = `You are an expert ${board} curriculum educator creating detailed lesson plans for school teachers in India. Produce structured, practical lesson plans that a teacher can use directly in class.`;

  const userPrompt = `Create a complete lesson plan for the following:

Subject: ${subject_name}
Class: ${class_name}
Topic: ${topic}
Duration: ${duration_minutes} minutes
Board: ${board}
Learning Objectives: ${learning_objectives || 'Not specified'}

Include the following sections (use these exact headings):
## Objective
## Materials Needed
## Introduction (first 5 minutes — hook/prior knowledge)
## Main Teaching (detailed breakdown with timing)
## Student Activities / Exercises
## Assessment Questions (3-5 questions to check understanding)
## Homework Suggestion

Keep it practical and specific to the topic. Use simple, clear language.`;

  return callClaude(systemPrompt, userPrompt, 1200);
};

// ─────────────────────────────────────────────────────────────────────────────
// generateAIFeedback
// ─────────────────────────────────────────────────────────────────────────────
const generateAIFeedback = async (submissionData) => {
  const { student_name, assignment_title, subject, submission_content, max_marks } = submissionData;

  const systemPrompt = `You are a supportive and constructive school teacher providing feedback on student assignments. Be encouraging, specific, and helpful.`;

  const userPrompt = `Review this student assignment and provide structured feedback:

Student: ${student_name}
Assignment: ${assignment_title}
Subject: ${subject}
Maximum Marks: ${max_marks}

Submission:
${submission_content}

Provide feedback in this exact format:
**Strengths:** (2-3 specific things the student did well)
**Areas for Improvement:** (2-3 specific, actionable suggestions)
**Suggested Score:** (X/${max_marks} — justify briefly)
**Motivational Comment:** (1-2 encouraging sentences)`;

  return callClaude(systemPrompt, userPrompt, 600);
};

// ─────────────────────────────────────────────────────────────────────────────
// generateMoodAlertMessage
// ─────────────────────────────────────────────────────────────────────────────
const generateMoodAlertMessage = async (pattern, days) => {
  const systemPrompt = `You are an empathetic school counselor AI.
Write a single gentle, non-alarmist 2-sentence private note to a teacher.
Do not mention the student by name. Focus on observation, not diagnosis.
Tone: caring colleague to colleague.`;

  const userPrompt = `A student has shown ${pattern} in their mood check-ins over ${days} days.
Please provide the 2-sentence note.`;

  return callClaude(systemPrompt, userPrompt, 200);
};

// ─────────────────────────────────────────────────────────────────────────────
// generateTimeCapsuleNarrative
// ─────────────────────────────────────────────────────────────────────────────
const generateTimeCapsuleNarrative = async (aggregatedData) => {
  const systemPrompt = `You are a warm, celebratory school AI generating an end-of-year summary for a student.
Be specific, warm, and celebratory. Use the actual numbers.
Output MUST be valid JSON, containing exactly these keys:
{
  "headline": "5-7 word punchy headline about their year (e.g., 'The Year Mihir Found His Rhythm')",
  "highlight": "2 sentence biggest achievement of the year based on the data",
  "growthStory": "2 sentence story about their most notable improvement",
  "funFact": "1 fun/quirky stat fact (e.g., 'You spent 4.2 hours chatting with AI Study Buddy')",
  "teacherNote": "1 warm sentence a teacher would say about them",
  "emoji": "single most fitting emoji for their year"
}`;

  const userPrompt = `Student Data:\n${JSON.stringify(aggregatedData)}\nGenerate the JSON.`;

  try {
    const raw = await callClaude(systemPrompt, userPrompt, 500);
    // Parse json
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("AI Time Capsule Gen Error - returning defaults", error);
    return {
      headline: "An Incredible Year of Growth!",
      highlight: "You've worked super hard and consistently pushed yourself to learn more.",
      growthStory: "You turned challenges into stepping stones and never gave up.",
      funFact: "You logged into Klasso more times than we could count!",
      teacherNote: "I am incredibly proud of everything you accomplished.",
      emoji: "🌟"
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// generateSubBriefingSummary
// ─────────────────────────────────────────────────────────────────────────────
const generateSubBriefingSummary = async (classData) => {
  const systemPrompt = `You are generating a substitute teacher briefing for a teacher covering a class they don't know.
Write a friendly, practical 3-paragraph briefing (under 120 words total).
Paragraph 1: Quick class overview and vibe (1-2 sentences, warm tone).
Paragraph 2: Key things to know — who's engaged, who might need attention (no diagnoses, just observations).
Paragraph 3: What the class has been working on and any notes for today.
Tone: one colleague briefing another. Do NOT invent data — use only what is provided.`;

  const userPrompt = `Class data:\n${JSON.stringify(classData)}\n\nWrite the 3-paragraph briefing now.`;

  try {
    return await callClaude(systemPrompt, userPrompt, 400);
  } catch (err) {
    console.error('SubBriefing AI error:', err.message);
    const { classInfo } = classData;
    return `${classInfo.name} ${classInfo.section} is a class of ${classInfo.studentCount} students studying ${classInfo.subject}. Class attendance is around ${classData.avgAttendance}%. They are currently working on ${classData.subjectProgress?.recentTopic || 'recent curriculum topics'}. Good luck today — you've got this!`;
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// generatePTMTalkingPoints
// ─────────────────────────────────────────────────────────────────────────────
const generatePTMTalkingPoints = async (studentData) => {
  const systemPrompt = `You are an AI assistant helping a teacher prepare for a 10-minute Parent-Teacher Meeting.
Review the student data provided and generate 4-6 specific talking points (bullet points).
Include a mix of achievements and constructive areas for improvement.
Ensure output is pure JSON matching this exact shape: 
[
  { "type": "positive" | "concern" | "neutral", "point": "The actual talking point text (1-2 sentences)" }
]`;

  const userPrompt = `Student Data:\n${JSON.stringify(studentData)}\n\nGenerate the JSON array of talking points.`;

  try {
    const raw = await callClaude(systemPrompt, userPrompt, 600);
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('PTM Talking Points AI error:', err.message);
    return [
      { type: 'neutral', point: 'Discuss overall academic progress this term.' },
      { type: 'neutral', point: 'Review attendance and participation.' }
    ];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// generatePTMPostSummary
// ─────────────────────────────────────────────────────────────────────────────
const generatePTMPostSummary = async (studentName, notes) => {
  const systemPrompt = `You are a warm, professional teacher writing a quick post-meeting summary to send to parents after a parent-teacher meeting.
Write exactly 3 friendly sentences summarizing the meeting notes provided. Do not use generic placeholders.`;

  const userPrompt = `Student: ${studentName}\nTeacher's Raw Meeting Notes:\n${notes}\n\nGenerate the 3-sentence summary message.`;

  try {
    return await callClaude(systemPrompt, userPrompt, 300);
  } catch (err) {
    console.error('PTM Summary AI error:', err.message);
    return `It was wonderful speaking with you about ${studentName}'s progress today! We discussed strategies to support their continued growth. Please reach out if you have any more questions.`;
  }
};

module.exports = {
  generateStudentReport,
  generateLessonPlan,
  generateAIFeedback,
  chatStudentBuddy,
  generateMoodAlertMessage,
  generateTimeCapsuleNarrative,
  generateSubBriefingSummary,
  generatePTMTalkingPoints,
  generatePTMPostSummary,
};
