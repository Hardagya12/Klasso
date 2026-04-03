'use strict';

const { query } = require('../db/neon');
const { sendSuccess, sendError } = require('../utils/response');
const { checkAndNotifyLowAttendance } = require('./attendanceController');
const streakService = require('../utils/streakService');

/**
 * POST /api/attendance/voice-ai
 * Body: { class_id, command, date? }
 * 
 * Takes a voice command string (e.g. "Mark all present except Aarav and Divya"),
 * sends it to Gemini for parsing, applies the attendance, and returns results.
 */
const processVoiceAttendance = async (req, res, next) => {
  try {
    const {
      class_id,
      command,
      date = new Date().toISOString().split('T')[0],
    } = req.body;

    if (!command || !command.trim()) {
      return sendError(res, 'Voice command is required', 400);
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return sendError(res, 'Gemini API key not configured. Set GEMINI_API_KEY in .env', 503);
    }

    // 1. Fetch all students in the class
    const studentsRes = await query(
      `SELECT st.id AS student_id, st.roll_no, u.name
       FROM students st
       JOIN users u ON u.id = st.user_id
       WHERE st.class_id = $1
       ORDER BY st.roll_no`,
      [class_id]
    );

    if (studentsRes.rows.length === 0) {
      return sendError(res, 'No students found in this class', 404);
    }

    const students = studentsRes.rows;
    const studentListText = students
      .map((s) => `${s.student_id}: ${s.name} (Roll #${s.roll_no})`)
      .join('\n');

    // 2. Call Gemini to parse the voice command
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const geminiPayload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an attendance management AI assistant for a school.

Here is the class roster with student IDs and names:
${studentListText}

The teacher gave this voice command: "${command}"

Parse the command and determine the attendance status for EVERY student.
Rules:
- "P" = Present, "A" = Absent, "L" = Late
- If the teacher says "mark all present except [names]", mark those named students as Absent and everyone else as Present.
- If the teacher says "mark all absent except [names]", mark those named students as Present and everyone else as Absent.
- If the teacher says "[name] is late", mark that student as Late, leave others unchanged (default Present).
- If the teacher says "mark [names] present", mark those students as Present.
- If the teacher says "mark [names] absent", mark those students as Absent.
- Match student names flexibly (first name, last name, or partial match).
- Default to Present if not mentioned.

Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation.
Format: {"statuses": {"<student_id>": "P"|"A"|"L", ...}, "summary": "<brief description of what was done>"}
Include ALL student IDs from the roster above.`,
            },
          ],
        },
      ],
    };

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[Voice AI] Gemini API error:', errText);
      return sendError(res, 'Failed to process voice command with AI', 502);
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // 3. Parse the AI response
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // Try cleaning markdown code fences
      const cleaned = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e2) {
        console.error('[Voice AI] Failed to parse Gemini response:', rawText);
        return sendError(
          res,
          'AI returned an unparseable response. Please try again with a clearer command.',
          422
        );
      }
    }

    if (!parsed?.statuses || typeof parsed.statuses !== 'object') {
      return sendError(
        res,
        'AI response missing statuses. Please try again.',
        422
      );
    }

    // 4. Create/find today's attendance session
    const sessRes = await query(
      `INSERT INTO attendance_sessions (class_id, date, session_type, marked_by)
       VALUES ($1, $2, 'daily', $3)
       ON CONFLICT (class_id, date, session_type) DO UPDATE
         SET marked_by = EXCLUDED.marked_by
       RETURNING id`,
      [class_id, date, req.user.id]
    );
    const session_id = sessRes.rows[0].id;

    // 5. Map Gemini's P/A/L to database statuses and upsert records
    const statusMap = { P: 'present', A: 'absent', L: 'late' };
    const results = [];
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    for (const student of students) {
      const aiStatus = parsed.statuses[student.student_id] || 'P';
      const dbStatus = statusMap[aiStatus] || 'present';

      await query(
        `INSERT INTO attendance_records (session_id, student_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (session_id, student_id) DO UPDATE SET status = EXCLUDED.status`,
        [session_id, student.student_id, dbStatus]
      );

      // Update streak
      streakService.updateStreak(student.student_id, date, dbStatus).catch(err => {
        console.error('Streak update failed (Voice AI) for', student.student_id, err);
      });

      if (dbStatus === 'present') presentCount++;
      else if (dbStatus === 'absent') absentCount++;
      else if (dbStatus === 'late') lateCount++;

      results.push({
        student_id: student.student_id,
        name: student.name,
        roll_no: student.roll_no,
        status: aiStatus,
      });
    }

    // Fire-and-forget low attendance check
    checkAndNotifyLowAttendance(class_id);

    return sendSuccess(
      res,
      {
        session_id,
        date,
        class_id,
        command,
        ai_summary: parsed.summary || `Processed: "${command}"`,
        records: results,
        summary: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          total: students.length,
        },
      },
      'Voice attendance processed successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { processVoiceAttendance };
