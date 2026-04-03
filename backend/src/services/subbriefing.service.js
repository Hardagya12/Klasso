'use strict';

const { query } = require('../db/neon');
const { generateSubBriefingSummary } = require('../utils/claudeApi');
const { createNotification } = require('../utils/notificationHelper');

/**
 * generateSubBriefing
 * Aggregates class data for a substitution and generates an AI briefing.
 * @param {string} substitutionId - UUID of the substitution record
 */
const generateSubBriefing = async (substitutionId) => {
  // ── 1. Fetch full substitution with related context ───────────────────────
  const subResult = await query(
    `SELECT
       sub.id,
       sub.date,
       sub.reason,
       sub.substitute_teacher_id,
       ts.period_number,
       ts.start_time,
       ts.end_time,
       ts.room,
       c.id            AS class_id,
       c.name          AS class_name,
       c.section,
       c.room_number,
       s.id            AS subject_id,
       s.name          AS subject_name,
       orig.name       AS original_teacher_name,
       sub_t.name      AS substitute_teacher_name,
       sub_t.id        AS substitute_user_id
     FROM substitutions sub
     LEFT JOIN timetable_slots ts   ON ts.id  = sub.timetable_slot_id
     LEFT JOIN class_subjects cs    ON cs.id  = ts.class_subject_id
     LEFT JOIN classes c            ON c.id   = ts.class_id
     LEFT JOIN subjects s           ON s.id   = cs.subject_id
     LEFT JOIN users orig           ON orig.id = sub.original_teacher_id
     LEFT JOIN users sub_t          ON sub_t.id = sub.substitute_teacher_id
     WHERE sub.id = $1`,
    [substitutionId]
  );

  if (!subResult.rows.length) throw new Error('Substitution not found');
  const sub = subResult.rows[0];

  // ── 2. Aggregate student count ────────────────────────────────────────────
  const studentCountRes = await query(
    'SELECT COUNT(*)::int AS count FROM students WHERE class_id = $1',
    [sub.class_id]
  );
  const studentCount = studentCountRes.rows[0]?.count || 0;

  // ── 3. Avg attendance for the class ───────────────────────────────────────
  const attendanceRes = await query(
    `SELECT
       ROUND(
         100.0 * COUNT(*) FILTER (WHERE ar.status = 'present') /
         NULLIF(COUNT(*), 0)
       , 0) AS avg_pct
     FROM attendance_records ar
     JOIN attendance_sessions asn ON asn.id = ar.session_id
     WHERE asn.class_id = $1`,
    [sub.class_id]
  );
  const avgAttendance = parseFloat(attendanceRes.rows[0]?.avg_pct || 0);

  // ── 4. Top 3 students by average mark ─────────────────────────────────────
  const topStudentsRes = await query(
    `SELECT u.name, ROUND(AVG(m.score), 1) AS avg_score
     FROM students st
     JOIN users u ON u.id = st.user_id
     JOIN marks m ON m.student_id = st.id
     WHERE st.class_id = $1
     GROUP BY u.name
     ORDER BY avg_score DESC
     LIMIT 3`,
    [sub.class_id]
  );
  const topStudents = topStudentsRes.rows.map((r) => ({ name: r.name, avgScore: parseFloat(r.avg_score) }));

  // ── 5. Students who may need attention (low attendance) ───────────────────
  const needsAttentionRes = await query(
    `SELECT u.name,
       ROUND(
         100.0 * COUNT(*) FILTER (WHERE ar.status = 'present') /
         NULLIF(COUNT(*), 0)
       , 0) AS att_pct
     FROM students st
     JOIN users u ON u.id = st.user_id
     JOIN attendance_records ar ON ar.student_id = st.id
     JOIN attendance_sessions asn ON asn.id = ar.session_id
     WHERE st.class_id = $1
     GROUP BY u.name
     HAVING ROUND(100.0 * COUNT(*) FILTER (WHERE ar.status = 'present') / NULLIF(COUNT(*), 0), 0) < 75
     ORDER BY att_pct ASC
     LIMIT 3`,
    [sub.class_id]
  );
  const needsAttention = needsAttentionRes.rows.map((r) => ({
    name: r.name,
    reason: `Attendance at ${r.att_pct}% — may need a check-in`,
  }));

  // ── 6. Recent assessment average (last 2 exams for subject in this class) ─
  const recentGradesRes = await query(
    `SELECT e.name AS exam_name,
       ROUND(AVG(m.score / es.max_marks * 100), 1) AS class_avg_pct
     FROM marks m
     JOIN exam_subjects es ON es.id = m.exam_subject_id
     JOIN exams e          ON e.id  = es.exam_id
     JOIN subjects s       ON s.id  = es.subject_id
     WHERE e.class_id = $1 AND s.id = $2
     GROUP BY e.id, e.name, e.start_date
     ORDER BY e.start_date DESC NULLS LAST
     LIMIT 2`,
    [sub.class_id, sub.subject_id]
  );
  const recentAssessments = recentGradesRes.rows.map((r) => ({
    examName: r.exam_name,
    classAvgPct: parseFloat(r.class_avg_pct),
  }));

  // ── 7. Assignments due today for this class/subject ───────────────────────
  const todayAssignmentsRes = await query(
    `SELECT a.title, a.due_date
     FROM assignments a
     JOIN class_subjects cs ON cs.id = a.class_subject_id
     WHERE cs.class_id = $1
       AND cs.subject_id = $2
       AND DATE(a.due_date) = $3
     ORDER BY a.due_date`,
    [sub.class_id, sub.subject_id, sub.date]
  );
  const todayAssignments = todayAssignmentsRes.rows.map((r) => ({
    title: r.title,
    dueTime: r.due_date,
  }));

  // ── 8. Most recent assignment title (subject context) ─────────────────────
  const recentAssignmentRes = await query(
    `SELECT a.title FROM assignments a
     JOIN class_subjects cs ON cs.id = a.class_subject_id
     WHERE cs.class_id = $1 AND cs.subject_id = $2
     ORDER BY a.created_at DESC LIMIT 1`,
    [sub.class_id, sub.subject_id]
  );
  const recentTopic = recentAssignmentRes.rows[0]?.title || 'recent curriculum topics';

  // ── 9. Class XP ────────────────────────────────────────────────────────────
  const xpRes = await query(
    'SELECT current_level, current_title, total_xp FROM class_xp WHERE class_id = $1',
    [sub.class_id]
  );
  const classXP = xpRes.rows[0] || { current_level: 1, current_title: 'Seedlings', total_xp: 0 };

  // ── 10. Assemble structured content ───────────────────────────────────────
  const content = {
    classInfo: {
      name: sub.class_name,
      section: sub.section,
      room: sub.room || sub.room_number || 'TBD',
      studentCount,
      subject: sub.subject_name,
      period: sub.period_number,
      startTime: sub.start_time,
      endTime: sub.end_time,
    },
    originalTeacher: sub.original_teacher_name,
    topStudents,
    needsAttention,
    subjectProgress: { recentTopic },
    recentAssessments,
    todayAssignments,
    classXP: {
      level: classXP.current_level,
      title: classXP.current_title,
      totalXP: classXP.total_xp,
    },
    avgAttendance,
  };

  // ── 11. Generate AI summary ────────────────────────────────────────────────
  const aiSummary = await generateSubBriefingSummary(content);

  // ── 12. Persist briefing (upsert) ─────────────────────────────────────────
  await query(
    `INSERT INTO sub_briefings (substitution_id, content, ai_summary)
     VALUES ($1, $2, $3)
     ON CONFLICT (substitution_id)
     DO UPDATE SET content = EXCLUDED.content, ai_summary = EXCLUDED.ai_summary, generated_at = NOW()`,
    [substitutionId, JSON.stringify(content), aiSummary]
  );

  // ── 13. Notify substitute teacher ─────────────────────────────────────────
  if (sub.substitute_user_id) {
    await createNotification(
      sub.substitute_user_id,
      'Class Briefing Ready 📋',
      `Your AI class briefing for ${sub.class_name} ${sub.section} · ${sub.subject_name} is ready. Tap to read before class.`,
      'info',
      'substitution',
      substitutionId
    );
  }

  return { content, aiSummary };
};

module.exports = { generateSubBriefing };
