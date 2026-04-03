'use strict';

const https = require('https');

const BASE_URL  = 'https://api.anthropic.com';
const MODEL     = 'claude-sonnet-4-20250514';
const VERSION   = '2023-06-01';

// ─────────────────────────────────────────────────────────────────────────────
// Internal: low-level POST to Anthropic messages API
// ─────────────────────────────────────────────────────────────────────────────
const callClaude = (systemPrompt, userPrompt, maxTokens = 1000) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model      : MODEL,
      max_tokens : maxTokens,
      system     : systemPrompt,
      messages   : [{ role: 'user', content: userPrompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path    : '/v1/messages',
      method  : 'POST',
      headers : {
        'Content-Type'    : 'application/json',
        'x-api-key'       : process.env.ANTHROPIC_API_KEY,
        'anthropic-version': VERSION,
        'Content-Length'  : Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'Anthropic API error'));
          const text = parsed.content?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Anthropic response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// callClaudeChat — multi-turn messages (Anthropic roles: user | assistant)
// ─────────────────────────────────────────────────────────────────────────────
const callClaudeChat = (systemPrompt, claudeMessages, maxTokens = 1200) => {
  return new Promise((resolve, reject) => {
    if (!process.env.ANTHROPIC_API_KEY) {
      return reject(new Error('ANTHROPIC_API_KEY is not set'));
    }
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': VERSION,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'Anthropic API error'));
          const text = parsed.content?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Anthropic response'));
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

  const systemPrompt = `You are an experienced school teacher writing professional end-of-term progress reports for parents. Write in warm, specific, professional English that is culturally appropriate for Indian parents. Always use real numbers from the data provided. Keep the report concise but meaningful — exactly 3 paragraphs.`;

  const userPrompt = `Write a progress report for the following student:

Name: ${name}
Class: ${class_name} - ${section}
Attendance: ${attendance_percentage}%
Overall Performance: ${overall_percentage}% (Grade: ${overall_grade})

Subject-wise Marks:
${marksText}

Structure:
Paragraph 1 (Academic Highlights): Mention specific subjects, actual scores, and academic strengths.
Paragraph 2 (Attendance & Dedication): Comment on the specific attendance percentage, punctuality, and discipline.
Paragraph 3 (Growth Areas & Closing): Identify areas needing improvement, then close with an encouraging and motivating message for the student and family.

Write only the 3 paragraphs, no headings, no bullet points.`;

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

module.exports = {
  generateStudentReport,
  generateLessonPlan,
  generateAIFeedback,
  chatStudentBuddy,
  generateMoodAlertMessage,
};
