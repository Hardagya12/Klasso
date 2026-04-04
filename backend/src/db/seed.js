require('dotenv').config();
const { pool } = require('./neon');
const bcrypt = require('bcryptjs');

// ── Utility ──────────────────────────────────────────────────────────────────
function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function isWeekend(d) { return d.getDay() === 0 || d.getDay() === 6; }
function fmtDate(d) { return d.toISOString().split('T')[0]; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function cuid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }

const feedbacks = [
  "Great effort! Keep up the consistent work.",
  "Good understanding of core concepts. Practice more problems.",
  "Shows improvement from last assessment. Well done!",
  "Needs more practice with problem-solving techniques.",
  "Excellent work! Strong analytical skills demonstrated.",
  "Average performance. Focus on revision before next test.",
  "Good attempt but some conceptual gaps remain.",
  "Impressive progress! Your hard work is paying off.",
  "Review the marked sections for better understanding.",
  "Solid performance. Aim higher next time!",
];

const seedData = async () => {
  console.log('🌱 Starting Klasso comprehensive seed...');
  try {
    // ── Clean everything ──────────────────────────────────────────────────
    const tables = [
      'student_badges', 'badges', 'attendance_streaks',
      'xp_events', 'class_xp', 'quest_completions', 'quests',
      'mood_checkins', 'mood_alerts', 'time_capsules',
      'duel_answers', 'duel_sessions', 'duel_questions', 'duels',
      'sub_briefings', 'substitutions',
      'ptm_slots', 'ptm_events',
      'fee_payments', 'fee_types',
      'documents', 'study_materials', 'lesson_plans',
      'assignment_submissions', 'assignments',
      'timetable_slots', 'reports',
      'marks', 'exam_subjects', 'exams',
      'qr_tokens', 'attendance_records', 'attendance_sessions',
      'notifications', 'messages', 'announcements', 'events',
      'student_parents', 'students', 'class_subjects', 'subjects',
      'classes', 'academic_years', 'users', 'schools',
    ];
    for (const t of tables) {
      await pool.query(`DELETE FROM ${t}`);
    }
    console.log('✅ Cleaned all tables.');

    const passwordHash = await bcrypt.hash('Password123!', 12);

    // ── 1. School ───────────────────────────────────────────────────────
    const schoolRes = await pool.query(`
      INSERT INTO schools (name, address, phone, email, board)
      VALUES ('Greenwood International School', '42 Education Lane, Ahmedabad, Gujarat 380001',
              '+91 79 2645 3200', 'admin@greenwood.edu.in', 'CBSE')
      RETURNING id
    `);
    const schoolId = schoolRes.rows[0].id;
    console.log('✅ School created');

    // ── 2. Academic Year ────────────────────────────────────────────────
    const ayRes = await pool.query(`
      INSERT INTO academic_years (school_id, label, start_date, end_date, is_current)
      VALUES ($1, '2024-25', '2024-04-01', '2025-03-31', true)
      RETURNING id
    `, [schoolId]);
    const ayId = ayRes.rows[0].id;

    // ── 3. Users ────────────────────────────────────────────────────────
    const createUser = async (name, email, role) => {
      const r = await pool.query(`
        INSERT INTO users (school_id, name, email, password_hash, role)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [schoolId, name, email.toLowerCase(), passwordHash, role]);
      return r.rows[0].id;
    };

    // Admin
    const adminId = await createUser('Rajesh Verma', 'admin@klasso.com', 'admin');

    // Teachers
    const teacher1Id = await createUser('Priya Sharma', 'teacher1@klasso.com', 'teacher');
    const teacher2Id = await createUser('Amit Patel', 'teacher2@klasso.com', 'teacher');
    const teacher3Id = await createUser('Sunita Joshi', 'teacher3@klasso.com', 'teacher');
    const teacher4Id = await createUser('Ravi Kumar', 'teacher4@klasso.com', 'teacher');

    // Parents
    const parent1Id = await createUser('Meera Mehta', 'parent1@klasso.com', 'parent');
    const parent2Id = await createUser('Suresh Shah', 'parent2@klasso.com', 'parent');
    const parent3Id = await createUser('Kavita Patel', 'parent3@klasso.com', 'parent');
    const parent4Id = await createUser('Deepak Singh', 'parent4@klasso.com', 'parent');
    const parent5Id = await createUser('Anita Gupta', 'parent5@klasso.com', 'parent');

    // Students (user records)
    const studentUsers = [
      { name: 'Arjun Mehta',   email: 'student1@klasso.com',  rollNo: '01', cls: '8A', dob: '2010-05-15', gender: 'M' },
      { name: 'Priya Shah',    email: 'student2@klasso.com',  rollNo: '02', cls: '8A', dob: '2010-08-22', gender: 'F' },
      { name: 'Rohan Patel',   email: 'student3@klasso.com',  rollNo: '03', cls: '8A', dob: '2010-03-10', gender: 'M' },
      { name: 'Ananya Singh',  email: 'student4@klasso.com',  rollNo: '04', cls: '8A', dob: '2010-11-05', gender: 'F' },
      { name: 'Mihir Gupta',   email: 'student5@klasso.com',  rollNo: '05', cls: '8A', dob: '2010-07-18', gender: 'M' },
      { name: 'Sneha Joshi',   email: 'student6@klasso.com',  rollNo: '06', cls: '9B', dob: '2009-12-25', gender: 'F' },
      { name: 'Karan Kumar',   email: 'student7@klasso.com',  rollNo: '07', cls: '9B', dob: '2009-06-14', gender: 'M' },
      { name: 'Divya Sharma',  email: 'student8@klasso.com',  rollNo: '08', cls: '9B', dob: '2009-09-30', gender: 'F' },
      { name: 'Aditya Verma',  email: 'student9@klasso.com',  rollNo: '09', cls: '9B', dob: '2009-04-02', gender: 'M' },
      { name: 'Pooja Nair',    email: 'student10@klasso.com', rollNo: '10', cls: '9B', dob: '2009-02-11', gender: 'F' },
    ];

    const studentUserIds = [];
    for (const s of studentUsers) {
      const id = await createUser(s.name, s.email, 'student');
      studentUserIds.push(id);
    }
    console.log('✅ Created 19 users');

    // ── 4. Classes ──────────────────────────────────────────────────────
    const class8ARes = await pool.query(`
      INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
      VALUES ($1, $2, '8', 'A', $3, 'Room 101') RETURNING id
    `, [schoolId, ayId, teacher1Id]);
    const class8AId = class8ARes.rows[0].id;

    const class9BRes = await pool.query(`
      INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
      VALUES ($1, $2, '9', 'B', $3, 'Room 205') RETURNING id
    `, [schoolId, ayId, teacher2Id]);
    const class9BId = class9BRes.rows[0].id;
    console.log('✅ Created classes 8-A and 9-B');

    // ── 5. Subjects ─────────────────────────────────────────────────────
    const subjectData = [
      { name: 'Mathematics',      code: 'MAT' },
      { name: 'Science',          code: 'SCI' },
      { name: 'English',          code: 'ENG' },
      { name: 'Hindi',            code: 'HIN' },
      { name: 'Social Studies',   code: 'SST' },
      { name: 'Computer Science', code: 'CSC' },
    ];
    const subjectIds = [];
    for (const s of subjectData) {
      const r = await pool.query(`
        INSERT INTO subjects (school_id, name, code)
        VALUES ($1, $2, $3) RETURNING id
      `, [schoolId, s.name, s.code]);
      subjectIds.push(r.rows[0].id);
    }
    console.log('✅ Created 6 subjects');

    // ── 6. Class Subjects ───────────────────────────────────────────────
    // 8-A: teacher1=Math+Science, teacher2=English+Hindi, teacher3=SST+CS
    const teacherMap8A = [teacher1Id, teacher1Id, teacher2Id, teacher2Id, teacher3Id, teacher3Id];
    const cs8A = [];
    for (let i = 0; i < 6; i++) {
      const r = await pool.query(`
        INSERT INTO class_subjects (class_id, subject_id, teacher_id)
        VALUES ($1, $2, $3) RETURNING id
      `, [class8AId, subjectIds[i], teacherMap8A[i]]);
      cs8A.push(r.rows[0].id);
    }

    // 9-B: teacher2=Math+Science+English, teacher3=Hindi+SST, teacher1=CS
    const teacherMap9B = [teacher2Id, teacher2Id, teacher2Id, teacher3Id, teacher3Id, teacher1Id];
    const cs9B = [];
    for (let i = 0; i < 6; i++) {
      const r = await pool.query(`
        INSERT INTO class_subjects (class_id, subject_id, teacher_id)
        VALUES ($1, $2, $3) RETURNING id
      `, [class9BId, subjectIds[i], teacherMap9B[i]]);
      cs9B.push(r.rows[0].id);
    }
    console.log('✅ Assigned subjects to classes');

    // ── 7. Students ─────────────────────────────────────────────────────
    const studentIds = [];
    for (let i = 0; i < 10; i++) {
      const s = studentUsers[i];
      const classId = s.cls === '8A' ? class8AId : class9BId;
      const admNo = `KL24${String(i + 1).padStart(3, '0')}`;
      const r = await pool.query(`
        INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [studentUserIds[i], schoolId, classId, s.rollNo, admNo, s.dob, s.gender]);
      studentIds.push(r.rows[0].id);
    }
    console.log('✅ Created 10 students');

    // ── 8. Student Parents ──────────────────────────────────────────────
    const parentLinks = [
      [studentIds[0], parent1Id, 'mother'],
      [studentIds[1], parent2Id, 'father'],
      [studentIds[2], parent3Id, 'mother'],
      [studentIds[3], parent4Id, 'father'],
      [studentIds[4], parent5Id, 'mother'],
    ];
    for (const [sid, pid, rel] of parentLinks) {
      await pool.query(`
        INSERT INTO student_parents (student_id, parent_id, relation, is_primary)
        VALUES ($1, $2, $3, true)
      `, [sid, pid, rel]);
    }
    console.log('✅ Linked 5 parents to students');

    // ── 9. Timetable for 8-A ────────────────────────────────────────────
    // Mon=1, Tue=2, ..., Sat=6
    // cs8A indices: 0=Math, 1=Science, 2=English, 3=Hindi, 4=SST, 5=CS
    const tt8A = {
      1: [0,1,2,3,4,5,null,null], // Mon: Math,Sci,Eng,Hin,SST,CS,PE,Art (use last math/sci for PE/Art slots)
      2: [2,0,1,4,3,5,null,null],
      3: [1,2,0,3,4,5,null,null],
      4: [0,3,2,1,5,4,null,null],
      5: [2,0,1,4,3,5,null,null],
      6: [5,3,0,1,4,2,null,null],
    };
    const periodTimes = [
      ['08:00:00','08:45:00'], ['08:45:00','09:30:00'], ['09:30:00','10:15:00'],
      ['10:30:00','11:15:00'], ['11:15:00','12:00:00'], ['12:00:00','12:45:00'],
      ['13:30:00','14:15:00'], ['14:15:00','15:00:00'],
    ];
    for (let day = 1; day <= 6; day++) {
      for (let p = 0; p < 8; p++) {
        let csIdx = tt8A[day][p];
        if (csIdx === null) csIdx = p % cs8A.length; // fallback
        await pool.query(`
          INSERT INTO timetable_slots (class_id, class_subject_id, day_of_week, period_number, start_time, end_time, room)
          VALUES ($1, $2, $3, $4, $5, $6, 'Room 101')
          ON CONFLICT (class_id, day_of_week, period_number) DO NOTHING
        `, [class8AId, cs8A[csIdx], day, p + 1, periodTimes[p][0], periodTimes[p][1]]);
      }
    }
    // Also create timetable for 9-B
    for (let day = 1; day <= 6; day++) {
      for (let p = 0; p < 8; p++) {
        const csIdx = (day + p) % cs9B.length;
        await pool.query(`
          INSERT INTO timetable_slots (class_id, class_subject_id, day_of_week, period_number, start_time, end_time, room)
          VALUES ($1, $2, $3, $4, $5, $6, 'Room 205')
          ON CONFLICT (class_id, day_of_week, period_number) DO NOTHING
        `, [class9BId, cs9B[csIdx], day, p + 1, periodTimes[p][0], periodTimes[p][1]]);
      }
    }
    console.log('✅ Created timetable (8-A + 9-B)');

    // ── 10. Attendance (90 days) ────────────────────────────────────────
    // Distribution per student (index): presentRate, lateRate
    const attDist = [
      { present: 0.92, late: 0.03 }, // student1 Arjun
      { present: 0.88, late: 0.04 }, // student2 Priya
      { present: 0.95, late: 0.02 }, // student3 Rohan
      { present: 0.78, late: 0.07 }, // student4 Ananya - at risk
      { present: 0.85, late: 0.05 }, // student5 Mihir
      { present: 0.90, late: 0.03 }, // student6 Sneha
      { present: 0.87, late: 0.04 }, // student7 Karan
      { present: 0.93, late: 0.02 }, // student8 Divya
      { present: 0.86, late: 0.05 }, // student9 Aditya
      { present: 0.91, late: 0.03 }, // student10 Pooja
    ];

    let totalAttRecords = 0;
    for (let d = 90; d >= 1; d--) {
      const date = daysAgo(d);
      if (isWeekend(date)) continue;
      const dateStr = fmtDate(date);

      // 8-A session
      const sess8A = await pool.query(`
        INSERT INTO attendance_sessions (class_id, class_subject_id, date, session_type, marked_by)
        VALUES ($1, $2, $3, 'daily', $4)
        ON CONFLICT (class_id, date, session_type) DO NOTHING
        RETURNING id
      `, [class8AId, cs8A[0], dateStr, teacher1Id]);

      if (sess8A.rows.length) {
        for (let i = 0; i < 5; i++) { // students 0-4 in 8-A
          const rand = Math.random();
          const dist = attDist[i];
          let status;
          if (rand < dist.present) status = 'present';
          else if (rand < dist.present + dist.late) status = 'late';
          else status = 'absent';
          await pool.query(`
            INSERT INTO attendance_records (session_id, student_id, status)
            VALUES ($1, $2, $3)
          `, [sess8A.rows[0].id, studentIds[i], status]);
          totalAttRecords++;
        }
      }

      // 9-B session
      const sess9B = await pool.query(`
        INSERT INTO attendance_sessions (class_id, class_subject_id, date, session_type, marked_by)
        VALUES ($1, $2, $3, 'daily', $4)
        ON CONFLICT (class_id, date, session_type) DO NOTHING
        RETURNING id
      `, [class9BId, cs9B[0], dateStr, teacher2Id]);

      if (sess9B.rows.length) {
        for (let i = 5; i < 10; i++) { // students 5-9 in 9-B
          const rand = Math.random();
          const dist = attDist[i];
          let status;
          if (rand < dist.present) status = 'present';
          else if (rand < dist.present + dist.late) status = 'late';
          else status = 'absent';
          await pool.query(`
            INSERT INTO attendance_records (session_id, student_id, status)
            VALUES ($1, $2, $3)
          `, [sess9B.rows[0].id, studentIds[i], status]);
          totalAttRecords++;
        }
      }
    }
    console.log(`✅ Created ${totalAttRecords} attendance records (~90 days)`);

    // ── 11. Exams & Marks ───────────────────────────────────────────────
    const examDefs = [
      { name: 'Unit Test 1',         type: 'unit_test',  start: '2024-09-15', end: '2024-09-15' },
      { name: 'Mid-Term Exam',       type: 'mid_term',   start: '2024-10-20', end: '2024-10-25' },
      { name: 'Unit Test 2',         type: 'unit_test',  start: '2024-11-18', end: '2024-11-18' },
      { name: 'Project Submission',  type: 'project',    start: '2024-12-10', end: '2024-12-10' },
    ];

    // Score ranges per student (min, max for each exam type)
    const scoreRanges = [
      [[75,82],[78,85],[80,87],[85,88]],   // Arjun: improving
      [[88,92],[90,94],[91,95],[93,96]],   // Priya: consistently high
      [[65,72],[68,75],[70,78],[72,80]],   // Rohan: average
      [[55,62],[58,65],[60,68],[62,72]],   // Ananya: below avg
      [[80,85],[82,88],[84,90],[86,92]],   // Mihir: good, improving
      [[78,84],[80,86],[82,88],[84,90]],   // Sneha
      [[70,78],[72,80],[74,82],[76,84]],   // Karan
      [[85,91],[87,93],[88,94],[90,95]],   // Divya
      [[72,80],[74,82],[76,84],[78,86]],   // Aditya
      [[82,88],[84,90],[86,92],[88,94]],   // Pooja
    ];

    const letterGrade = (pct) => {
      if (pct >= 90) return 'A+';
      if (pct >= 80) return 'A';
      if (pct >= 70) return 'B+';
      if (pct >= 60) return 'B';
      if (pct >= 50) return 'C';
      if (pct >= 40) return 'D';
      return 'F';
    };

    let totalMarks = 0;
    for (let ei = 0; ei < examDefs.length; ei++) {
      const ed = examDefs[ei];

      // Create exam for 8-A
      const exam8ARes = await pool.query(`
        INSERT INTO exams (school_id, class_id, name, exam_type, start_date, end_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [schoolId, class8AId, ed.name, ed.type, ed.start, ed.end, adminId]);
      const exam8AId = exam8ARes.rows[0].id;

      // Create exam for 9-B
      const exam9BRes = await pool.query(`
        INSERT INTO exams (school_id, class_id, name, exam_type, start_date, end_date, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [schoolId, class9BId, ed.name, ed.type, ed.start, ed.end, adminId]);
      const exam9BId = exam9BRes.rows[0].id;

      // Exam subjects for both classes
      for (let si = 0; si < 6; si++) {
        const es8ARes = await pool.query(`
          INSERT INTO exam_subjects (exam_id, subject_id, max_marks, exam_date)
          VALUES ($1, $2, 100, $3) RETURNING id
        `, [exam8AId, subjectIds[si], ed.start]);
        const esId8A = es8ARes.rows[0].id;

        const es9BRes = await pool.query(`
          INSERT INTO exam_subjects (exam_id, subject_id, max_marks, exam_date)
          VALUES ($1, $2, 100, $3) RETURNING id
        `, [exam9BId, subjectIds[si], ed.start]);
        const esId9B = es9BRes.rows[0].id;

        // Marks for 8-A students (0-4)
        for (let sti = 0; sti < 5; sti++) {
          const [mn, mx] = scoreRanges[sti][ei];
          const score = randomBetween(mn, mx);
          const grade = letterGrade(score);
          const remark = feedbacks[totalMarks % feedbacks.length];
          await pool.query(`
            INSERT INTO marks (student_id, exam_subject_id, score, grade, remarks, entered_by)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [studentIds[sti], esId8A, score, grade, remark, teacher1Id]);
          totalMarks++;
        }

        // Marks for 9-B students (5-9)
        for (let sti = 5; sti < 10; sti++) {
          const [mn, mx] = scoreRanges[sti][ei];
          const score = randomBetween(mn, mx);
          const grade = letterGrade(score);
          const remark = feedbacks[totalMarks % feedbacks.length];
          await pool.query(`
            INSERT INTO marks (student_id, exam_subject_id, score, grade, remarks, entered_by)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [studentIds[sti], esId9B, score, grade, remark, teacher2Id]);
          totalMarks++;
        }
      }
    }
    console.log(`✅ Created ${totalMarks} marks across 4 exams`);

    // ── 12. Assignments (15 for 8-A) ────────────────────────────────────
    const assignmentDefs = [
      { title: 'Chapter 3 Problems',              csIdx: 0, days: 3,  desc: 'Solve all problems from Chapter 3 exercises. Show your working.' },
      { title: 'Essay: My Favourite Season',       csIdx: 2, days: 5,  desc: 'Write a 500-word essay about your favourite season.' },
      { title: 'Chemical Reactions Lab Report',    csIdx: 1, days: 2,  desc: 'Document observations from the chemical reactions experiment.' },
      { title: 'Hindi Kavita Lekhan',              csIdx: 3, days: 7,  desc: 'Write an original Hindi poem about nature.' },
      { title: 'Map Work: Rivers of India',        csIdx: 4, days: 4,  desc: 'Mark all major rivers of India on the outline map.' },
      { title: 'Python Basics Exercise',           csIdx: 5, days: 6,  desc: 'Complete the Python programming exercises from the workbook.' },
      { title: 'Algebra Practice Set',             csIdx: 0, days: 1,  desc: 'Solve all 20 algebra problems. Show steps.' },
      { title: 'Book Review: The Jungle Book',     csIdx: 2, days: -2, desc: 'Write a detailed book review of The Jungle Book.' },
      { title: 'Photosynthesis Diagram',           csIdx: 1, days: -1, desc: 'Draw and label the complete photosynthesis process diagram.' },
      { title: 'Paragraph Writing',                csIdx: 3, days: 10, desc: 'Write 3 paragraphs on given topics in Hindi.' },
      { title: 'History Chapter 5 Questions',      csIdx: 4, days: 8,  desc: 'Answer all questions from Chapter 5.' },
      { title: 'Scratch Animation Project',        csIdx: 5, days: 14, desc: 'Create an animated story using Scratch programming.' },
      { title: 'Geometry Constructions',           csIdx: 0, days: 3,  desc: 'Complete all geometric construction exercises.' },
      { title: 'Grammar Worksheet',                csIdx: 2, days: 2,  desc: 'Complete the grammar worksheet on tenses and articles.' },
      { title: "Newton's Laws Problems",           csIdx: 1, days: 5,  desc: "Solve problems based on Newton's three laws of motion." },
    ];

    const assignmentIds = [];
    for (const a of assignmentDefs) {
      const dueDate = daysFromNow(a.days);
      const r = await pool.query(`
        INSERT INTO assignments (class_subject_id, title, description, due_date, max_marks, created_by)
        VALUES ($1, $2, $3, $4, 20, $5) RETURNING id
      `, [cs8A[a.csIdx], a.title, a.desc, dueDate.toISOString(), teacher1Id]);
      assignmentIds.push(r.rows[0].id);
    }
    console.log('✅ Created 15 assignments');

    // ── 13. Submissions ─────────────────────────────────────────────────
    // student1 (Arjun) submitted: 0,1,4,5,6,9,10 on-time + 7 late
    const s1Subs = [0,1,4,5,6,9,10];
    for (const idx of s1Subs) {
      await pool.query(`
        INSERT INTO assignment_submissions (assignment_id, student_id, content, status, score, feedback)
        VALUES ($1, $2, 'Completed all questions.', 'graded', $3, 'Good work!')
      `, [assignmentIds[idx], studentIds[0], randomBetween(14, 19)]);
    }
    // Late submission for overdue assignment 7
    await pool.query(`
      INSERT INTO assignment_submissions (assignment_id, student_id, content, status, score, feedback)
      VALUES ($1, $2, 'Completed - submitted late.', 'late', 12, 'Submitted late but good content.')
    `, [assignmentIds[7], studentIds[0]]);

    // student2 submitted all except 2,3,8
    for (let i = 0; i < 15; i++) {
      if ([2,3,8].includes(i)) continue;
      await pool.query(`
        INSERT INTO assignment_submissions (assignment_id, student_id, content, status, score, feedback)
        VALUES ($1, $2, 'Done.', 'graded', $3, 'Well done!')
      `, [assignmentIds[i], studentIds[1], randomBetween(15, 20)]);
    }

    // student3 submitted 0,1,5
    for (const idx of [0,1,5]) {
      await pool.query(`
        INSERT INTO assignment_submissions (assignment_id, student_id, content, status)
        VALUES ($1, $2, 'Submitted.', 'submitted')
      `, [assignmentIds[idx], studentIds[2]]);
    }
    console.log('✅ Created assignment submissions');

    // ── 14. Reports ─────────────────────────────────────────────────────
    for (let i = 0; i < 10; i++) {
      // Term 1 report - APPROVED
      await pool.query(`
        INSERT INTO reports (student_id, exam_id, content, generated_by, approved, approved_by, approved_at)
        VALUES ($1, (SELECT id FROM exams WHERE class_id=$2 AND name='Mid-Term Exam' LIMIT 1),
                $3, $4, true, $4, NOW())
      `, [studentIds[i], i < 5 ? class8AId : class9BId,
          `Term 1 Report: ${studentUsers[i].name} has shown ${i < 4 ? 'good' : 'excellent'} progress this term.`,
          adminId]);

      // Term 2 report - mixed DRAFT/APPROVED
      await pool.query(`
        INSERT INTO reports (student_id, exam_id, content, generated_by, approved)
        VALUES ($1, (SELECT id FROM exams WHERE class_id=$2 AND name='Unit Test 2' LIMIT 1),
                $3, $4, $5)
      `, [studentIds[i], i < 5 ? class8AId : class9BId,
          `Term 2 Report: ${studentUsers[i].name} continues to ${i % 2 === 0 ? 'improve' : 'maintain strong performance'}.`,
          adminId, i % 3 === 0]);
    }
    console.log('✅ Created reports');

    // ── 15. Notifications ───────────────────────────────────────────────
    const studentNotifs = [
      { type: 'grade',       title: 'New Grade Posted',        message: 'Your Math Unit Test 2 grade is available.' },
      { type: 'assignment',  title: 'New Assignment',          message: 'Algebra Practice Set has been assigned.' },
      { type: 'quest',       title: 'New Quest Available',     message: 'Complete "Perfect Week" to earn 75 XP!' },
      { type: 'badge',       title: 'Badge Earned! 🏆',       message: 'You earned the "Consistent" badge!' },
      { type: 'announcement',title: 'School Announcement',     message: 'Sports Day practice starts Monday.' },
    ];
    const parentNotifs = [
      { type: 'attendance',   title: 'Absence Alert',          message: 'Your child was absent today.' },
      { type: 'grade',        title: 'Grade Posted',           message: 'Mid-Term exam results are available.' },
      { type: 'report',       title: 'Report Card Ready',      message: 'Term 1 report card is ready for download.' },
      { type: 'fee',          title: 'Fee Reminder',           message: 'Term 2 fee payment is due.' },
      { type: 'message',      title: 'New Message',            message: 'You have a new message from a teacher.' },
    ];
    const teacherNotifs = [
      { type: 'report',       title: 'Report Due',             message: 'Report submission deadline approaching.' },
      { type: 'substitution', title: 'Substitution Assigned',  message: 'You have a substitution class tomorrow.' },
      { type: 'ai',           title: 'AI Suggestion',          message: 'AI detected a student at risk.' },
      { type: 'info',         title: 'Welcome',                message: 'Welcome to Klasso!' },
      { type: 'assignment',   title: 'Submissions Pending',    message: '5 assignment submissions need grading.' },
    ];

    // Student notifications
    for (let i = 0; i < 5; i++) {
      for (const n of studentNotifs) {
        await pool.query(`
          INSERT INTO notifications (user_id, title, message, type, is_read)
          VALUES ($1, $2, $3, $4, $5)
        `, [studentUserIds[i], n.title, n.message, n.type, Math.random() > 0.5]);
      }
    }
    // Parent notifications
    const parentIds = [parent1Id, parent2Id, parent3Id, parent4Id, parent5Id];
    for (const pid of parentIds) {
      for (const n of parentNotifs) {
        await pool.query(`
          INSERT INTO notifications (user_id, title, message, type, is_read)
          VALUES ($1, $2, $3, $4, $5)
        `, [pid, n.title, n.message, n.type, Math.random() > 0.5]);
      }
    }
    // Teacher notifications
    const teacherIds = [teacher1Id, teacher2Id, teacher3Id, teacher4Id];
    for (const tid of teacherIds) {
      for (const n of teacherNotifs) {
        await pool.query(`
          INSERT INTO notifications (user_id, title, message, type)
          VALUES ($1, $2, $3, $4)
        `, [tid, n.title, n.message, n.type]);
      }
    }
    console.log('✅ Created notifications');

    // ── 16. Messages ────────────────────────────────────────────────────
    const msgConvos = [
      // parent1 ↔ teacher1: about Arjun (5 messages)
      [parent1Id, teacher1Id, "Arjun's Progress", "Dear Ma'am, how is Arjun doing in Mathematics this term?"],
      [teacher1Id, parent1Id, "Re: Arjun's Progress", "Dear Mrs. Mehta, Arjun is performing well! He scored 87 in the last test. Keep encouraging him."],
      [parent1Id, teacher1Id, "Re: Arjun's Progress", "That's wonderful! Any areas where he needs improvement?"],
      [teacher1Id, parent1Id, "Re: Arjun's Progress", "He could practice more geometry problems. Otherwise, he's on track."],
      [parent1Id, teacher1Id, "Re: Arjun's Progress", "Thank you so much! We'll work on that at home."],
      // parent4 ↔ teacher1: about Ananya's attendance (3 messages)
      [parent4Id, teacher1Id, "Ananya's Attendance Concern", "Hello, I noticed Ananya has been missing school. She's been unwell."],
      [teacher1Id, parent4Id, "Re: Ananya's Attendance", "Thank you for informing us. Her attendance is at 78% which is concerning. Please provide a medical certificate."],
      [parent4Id, teacher1Id, "Re: Ananya's Attendance", "I'll send it tomorrow. Thank you for understanding."],
      // parent2 ↔ teacher2: about homework (4 messages)
      [parent2Id, teacher2Id, "Homework Query", "Is there extra homework for English this week?"],
      [teacher2Id, parent2Id, "Re: Homework", "Yes, there's a book review assignment due this Friday."],
      [parent2Id, teacher2Id, "Re: Homework", "Priya is finding it challenging. Any tips?"],
      [teacher2Id, parent2Id, "Re: Homework", "She can start with a summary and then add her personal thoughts. Happy to help in class too."],
    ];
    for (const [sid, rid, subj, body] of msgConvos) {
      await pool.query(`
        INSERT INTO messages (sender_id, recipient_id, subject, body)
        VALUES ($1, $2, $3, $4)
      `, [sid, rid, subj, body]);
    }
    console.log('✅ Created messages');

    // ── 17. Fees ────────────────────────────────────────────────────────
    const feeDefs = [
      { name: 'Tuition Fee Term 1', amount: 15000, due: '2024-07-15' },
      { name: 'Tuition Fee Term 2', amount: 15000, due: '2025-01-15' },
      { name: 'Transport Fee',      amount: 3000,  due: '2024-08-01' },
    ];
    const feeTypeIds = [];
    for (const f of feeDefs) {
      const r = await pool.query(`
        INSERT INTO fee_types (school_id, name, amount, due_date, academic_year_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [schoolId, f.name, f.amount, f.due, ayId]);
      feeTypeIds.push(r.rows[0].id);
    }

    // All students paid Term 1
    for (let i = 0; i < 10; i++) {
      await pool.query(`
        INSERT INTO fee_payments (student_id, fee_type_id, amount_paid, payment_method, transaction_id, status, recorded_by)
        VALUES ($1, $2, 15000, 'UPI', $3, 'paid', $4)
      `, [studentIds[i], feeTypeIds[0], `TXN${String(i + 1).padStart(6, '0')}T1`, adminId]);
    }

    // Term 2: students 0-4 paid, 5-9 pending
    for (let i = 0; i < 5; i++) {
      await pool.query(`
        INSERT INTO fee_payments (student_id, fee_type_id, amount_paid, payment_method, transaction_id, status, recorded_by)
        VALUES ($1, $2, 15000, 'UPI', $3, 'paid', $4)
      `, [studentIds[i], feeTypeIds[1], `TXN${String(i + 1).padStart(6, '0')}T2`, adminId]);
    }

    // Transport: students 0-2 paid, rest pending
    for (let i = 0; i < 3; i++) {
      await pool.query(`
        INSERT INTO fee_payments (student_id, fee_type_id, amount_paid, payment_method, transaction_id, status, recorded_by)
        VALUES ($1, $2, 3000, 'online', $3, 'paid', $4)
      `, [studentIds[i], feeTypeIds[2], `TXN${String(i + 1).padStart(6, '0')}TR`, adminId]);
    }
    console.log('✅ Created fees and payments');

    // ── 18. Attendance Streaks ───────────────────────────────────────────
    const streakData = [
      { idx: 0, current: 12, longest: 28, total: 83 },
      { idx: 1, current: 7,  longest: 21, total: 79 },
      { idx: 2, current: 18, longest: 30, total: 85 },
      { idx: 3, current: 0,  longest: 5,  total: 70 },
      { idx: 4, current: 5,  longest: 15, total: 77 },
      { idx: 5, current: 10, longest: 22, total: 81 },
      { idx: 6, current: 8,  longest: 18, total: 78 },
      { idx: 7, current: 14, longest: 25, total: 84 },
      { idx: 8, current: 3,  longest: 12, total: 77 },
      { idx: 9, current: 11, longest: 20, total: 82 },
    ];
    for (const s of streakData) {
      const lastDate = s.current > 0 ? fmtDate(daysAgo(1)) : fmtDate(daysAgo(5));
      await pool.query(`
        INSERT INTO attendance_streaks (student_id, current_streak, longest_streak, last_present_date, total_present_days, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [studentIds[s.idx], s.current, s.longest, lastDate, s.total]);
    }
    console.log('✅ Created attendance streaks');

    // ── 19. Badges ──────────────────────────────────────────────────────
    const badgeDefs = [
      { name: 'First Step',   desc: 'Started your streak!',         type: 'STREAK',  threshold: 1,  icon: 'footprints', color: '#3ECFB2', rarity: 'COMMON' },
      { name: 'Consistent',   desc: '10-day attendance streak!',    type: 'STREAK',  threshold: 10, icon: 'flame',      color: '#FF8C42', rarity: 'COMMON' },
      { name: 'Early Bird',   desc: 'Never late for a full week!',  type: 'STREAK',  threshold: 5,  icon: 'sunrise',    color: '#4ECDC4', rarity: 'RARE' },
      { name: 'On Fire',      desc: '20-day attendance streak!',    type: 'STREAK',  threshold: 20, icon: 'fire',       color: '#FF6B6B', rarity: 'RARE' },
      { name: 'Legend',       desc: '30-day attendance streak!',    type: 'STREAK',  threshold: 30, icon: 'trophy',     color: '#B5A8FF', rarity: 'EPIC' },
      { name: 'Perfect Month',desc: '100% attendance for a month!', type: 'STREAK',  threshold: 22, icon: 'star',       color: '#FFE566', rarity: 'EPIC' },
      { name: 'Scholar',      desc: 'Scored 90%+ in an exam!',      type: 'PERFORMANCE', threshold: 90, icon: 'award',  color: '#4A90D9', rarity: 'RARE' },
      { name: 'Homework Hero', desc: 'Submitted 10 assignments!',   type: 'SUBMISSION',  threshold: 10, icon: 'book',   color: '#3ECFB2', rarity: 'COMMON' },
    ];
    const badgeIds = [];
    for (const b of badgeDefs) {
      const r = await pool.query(`
        INSERT INTO badges (name, description, type, threshold, icon_name, color, rarity)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [b.name, b.desc, b.type, b.threshold, b.icon, b.color, b.rarity]);
      badgeIds.push(r.rows[0].id);
    }

    // Award badges:
    // Arjun: First Step, Consistent, Early Bird, On Fire
    for (const bi of [0,1,2,3]) {
      await pool.query(`INSERT INTO student_badges (student_id, badge_id, is_new) VALUES ($1, $2, $3)`,
        [studentIds[0], badgeIds[bi], bi === 3]);
    }
    // Priya: First Step, Consistent, Perfect Month
    for (const bi of [0,1,5]) {
      await pool.query(`INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2)`,
        [studentIds[1], badgeIds[bi]]);
    }
    // Rohan: First Step, Consistent, On Fire, Legend
    for (const bi of [0,1,3,4]) {
      await pool.query(`INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2)`,
        [studentIds[2], badgeIds[bi]]);
    }
    // Ananya: First Step only
    await pool.query(`INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2)`,
      [studentIds[3], badgeIds[0]]);
    // Others: 1-3 badges each
    for (let i = 4; i < 10; i++) {
      const count = randomBetween(1, 3);
      const awarded = new Set();
      for (let j = 0; j < count; j++) {
        const bi = randomBetween(0, 2); // First Step, Consistent, Early Bird
        if (!awarded.has(bi)) {
          awarded.add(bi);
          await pool.query(`INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2)`,
            [studentIds[i], badgeIds[bi]]);
        }
      }
    }
    console.log('✅ Created badges and awards');

    // ── 20. ClassXP ─────────────────────────────────────────────────────
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekStartStr = fmtDate(weekStart);

    const xp8ARes = await pool.query(`
      INSERT INTO class_xp (class_id, total_xp, current_level, current_title, xp_to_next_level, weekly_xp, week_start_date)
      VALUES ($1, 1850, 2, 'Sprouts', 2500, 150, $2) RETURNING id
    `, [class8AId, weekStartStr]);
    const xp8AId = xp8ARes.rows[0].id;

    const xp9BRes = await pool.query(`
      INSERT INTO class_xp (class_id, total_xp, current_level, current_title, xp_to_next_level, weekly_xp, week_start_date)
      VALUES ($1, 2800, 3, 'Explorers', 4000, 200, $2) RETURNING id
    `, [class9BId, weekStartStr]);
    const xp9BId = xp9BRes.rows[0].id;

    // XP Events for 8-A
    const xpEvents = [
      { type: 'FULL_ATTENDANCE_DAY', xp: 30, desc: 'Full attendance day: +30 XP' },
      { type: 'HIGH_ATTENDANCE_DAY', xp: 20, desc: '95%+ attendance: +20 XP' },
      { type: 'ALL_HOMEWORK_SUBMITTED', xp: 25, desc: 'All homework submitted: +25 XP' },
      { type: 'CLASS_TEST_AVG_ABOVE_80', xp: 40, desc: 'Class test avg above 80%: +40 XP' },
      { type: 'ZERO_LATE_SUBMISSIONS', xp: 15, desc: 'Zero late submissions: +15 XP' },
      { type: 'FULL_ATTENDANCE_DAY', xp: 30, desc: 'Full attendance day: +30 XP' },
      { type: 'HIGH_SUBMISSION_RATE', xp: 20, desc: '90%+ submission rate: +20 XP' },
      { type: 'STREAK_MILESTONE', xp: 50, desc: 'Class streak milestone: +50 XP' },
      { type: 'FULL_ATTENDANCE_DAY', xp: 30, desc: 'Full attendance day: +30 XP' },
      { type: 'TEACHER_BONUS', xp: 25, desc: 'Teacher bonus: +25 XP' },
    ];
    for (let i = 0; i < xpEvents.length; i++) {
      const e = xpEvents[i];
      const createdAt = daysAgo(xpEvents.length - i);
      await pool.query(`
        INSERT INTO xp_events (class_xp_id, type, xp_earned, description, created_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [xp8AId, e.type, e.xp, e.desc, createdAt.toISOString()]);
    }
    console.log('✅ Created ClassXP + events');

    // ── 21. Quests ──────────────────────────────────────────────────────
    const questDefs = [
      { title: 'Perfect Week', type: 'ZERO_ABSENCES_WEEK', target: {count:5}, xp: 75, ends: 5, desc: 'Maintain zero absences for the full week.' },
      { title: 'Study Buddy Sessions', type: 'AI_BUDDY_SESSIONS', target: {count:3}, xp: 50, ends: 7, desc: 'Complete 3 AI study buddy sessions this week.' },
      { title: 'Math Score Challenge', type: 'GRADE_TARGET', target: {subject:'Mathematics',minScore:80}, xp: 100, ends: 14, desc: 'Score 80% or above in the next Math test.' },
    ];
    const questIds = [];
    for (const q of questDefs) {
      const qid = cuid();
      const r = await pool.query(`
        INSERT INTO quests (id, teacher_id, class_id, title, description, type, target, xp_reward, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9) RETURNING id
      `, [qid, teacher1Id, class8AId, q.title, q.desc, q.type, JSON.stringify(q.target), q.xp, daysFromNow(q.ends).toISOString()]);
      questIds.push(r.rows[0].id);
    }

    // Arjun completed "Study Buddy Sessions"
    await pool.query(`
      INSERT INTO quest_completions (id, quest_id, student_id, xp_awarded)
      VALUES ($1, $2, $3, 50)
    `, [cuid(), questIds[1], studentIds[0]]);
    console.log('✅ Created quests');

    // ── 22. Mood Check-ins ──────────────────────────────────────────────
    const moods = ['GREAT', 'GOOD', 'OKAY', 'SAD', 'STRESSED'];
    // Arjun: mostly GOOD/GREAT
    for (let d = 14; d >= 1; d--) {
      const date = daysAgo(d);
      if (isWeekend(date)) continue;
      const mood = d === 5 || d === 9 ? 'OKAY' : pick(['GOOD', 'GREAT']);
      await pool.query(`
        INSERT INTO mood_checkins (id, student_id, mood, date) VALUES ($1, $2, $3, $4)
        ON CONFLICT (student_id, date) DO NOTHING
      `, [cuid(), studentIds[0], mood, fmtDate(date)]);
    }
    // Priya: all GOOD/GREAT
    for (let d = 14; d >= 1; d--) {
      const date = daysAgo(d);
      if (isWeekend(date)) continue;
      await pool.query(`
        INSERT INTO mood_checkins (id, student_id, mood, date) VALUES ($1, $2, $3, $4)
        ON CONFLICT (student_id, date) DO NOTHING
      `, [cuid(), studentIds[1], pick(['GOOD', 'GREAT']), fmtDate(date)]);
    }
    // Ananya: mostly SAD/STRESSED
    for (let d = 14; d >= 1; d--) {
      const date = daysAgo(d);
      if (isWeekend(date)) continue;
      const mood = d % 3 === 0 ? 'OKAY' : pick(['SAD', 'STRESSED']);
      await pool.query(`
        INSERT INTO mood_checkins (id, student_id, mood, date) VALUES ($1, $2, $3, $4)
        ON CONFLICT (student_id, date) DO NOTHING
      `, [cuid(), studentIds[3], mood, fmtDate(date)]);
    }
    console.log('✅ Created mood check-ins');

    // ── 23. Events ──────────────────────────────────────────────────────
    const eventDefs = [
      { title: 'Parent-Teacher Meeting',      desc: 'PTM for all classes',            days: 7,  aud: 'all' },
      { title: 'Unit Test 3',                 desc: 'Math + Science unit test',       days: 14, aud: 'student' },
      { title: 'Annual Sports Day',           desc: 'Inter-class sports competition', days: 21, aud: 'all' },
      { title: 'Diwali Holiday',              desc: 'School closed for Diwali',       days: 30, aud: 'all' },
    ];
    for (const e of eventDefs) {
      const dt = daysFromNow(e.days);
      await pool.query(`
        INSERT INTO events (school_id, title, description, start_datetime, audience, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [schoolId, e.title, e.desc, dt.toISOString(), e.aud, adminId]);
    }
    console.log('✅ Created events');

    // ── 24. Announcements ───────────────────────────────────────────────
    const annDefs = [
      { title: 'Sports Day Practice Starts Monday', body: 'All students must report to the ground at 7:30 AM.', audience: 'student' },
      { title: 'PTM Schedule Released',             body: 'PTM will be held next Saturday. Check your slot timings.', audience: 'parent' },
      { title: 'Report Submission Deadline Extended', body: 'Deadline extended by 3 days for all pending reports.', audience: 'teacher' },
      { title: 'School Annual Day Preparations',     body: 'Annual Day rehearsals start next week. All participants report.', audience: 'all' },
    ];
    for (const a of annDefs) {
      await pool.query(`
        INSERT INTO announcements (school_id, title, body, audience, created_by)
        VALUES ($1, $2, $3, $4, $5)
      `, [schoolId, a.title, a.body, a.audience === 'parent' ? 'parent' : a.audience === 'teacher' ? 'teacher' : a.audience === 'student' ? 'student' : 'all', adminId]);
    }
    console.log('✅ Created announcements');

    // ── 25. PTM ─────────────────────────────────────────────────────────
    const ptmRes = await pool.query(`
      INSERT INTO ptm_events (id, school_id, title, date, start_time, end_time, created_by_id)
      VALUES ($1, $2, 'Spring Term PTM', $3, '10:00', '14:00', $4) RETURNING id
    `, [cuid(), schoolId, fmtDate(daysFromNow(7)), teacher1Id]);
    const ptmId = ptmRes.rows[0].id;

    await pool.query(`
      INSERT INTO ptm_slots (id, ptm_event_id, teacher_id, parent_id, student_id, scheduled_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMED')
    `, [cuid(), ptmId, teacher1Id, parent1Id, studentIds[0], daysFromNow(7).toISOString()]);
    await pool.query(`
      INSERT INTO ptm_slots (id, ptm_event_id, teacher_id, parent_id, student_id, scheduled_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'CONFIRMED')
    `, [cuid(), ptmId, teacher1Id, parent4Id, studentIds[3], daysFromNow(7).toISOString()]);
    console.log('✅ Created PTM');

    // ── Print summary ───────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEED COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Users:       19`);
    console.log(`Students:    10`);
    console.log(`Attendance:  ~${totalAttRecords} records`);
    console.log(`Marks:       ${totalMarks}`);
    console.log(`Assignments: 15`);
    console.log(`Badges:      8 types, multiple awards`);
    console.log('');
    console.log('📧 Test Accounts (all passwords: Password123!):');
    console.log('   admin@klasso.com       (Admin - Rajesh Verma)');
    console.log('   teacher1@klasso.com    (Teacher - Priya Sharma)');
    console.log('   teacher2@klasso.com    (Teacher - Amit Patel)');
    console.log('   parent1@klasso.com     (Parent - Meera Mehta)');
    console.log('   parent4@klasso.com     (Parent - Deepak Singh)');
    console.log('   student1@klasso.com    (Student - Arjun Mehta, 8-A)');
    console.log('   student2@klasso.com    (Student - Priya Shah, 8-A)');
    console.log('   student4@klasso.com    (Student - Ananya Singh, 8-A)');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    pool.end();
  }
};

seedData();
