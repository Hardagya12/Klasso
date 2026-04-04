/**
 * seed-attendance-students.js
 * 
 * Seeds realistic Indian student names into the DB for the voice-attendance feature.
 * This script is idempotent — it checks for existing data before inserting.
 * 
 * Usage: node src/db/seed-attendance-students.js
 */
require('dotenv').config();
const { pool } = require('./neon');
const bcrypt = require('bcryptjs');

const STUDENT_NAMES = [
  'Aarav Patel',
  'Ananya Sharma',
  'Arjun Mehta',
  'Divya Singh',
  'Ishaan Kumar',
  'Kavya Reddy',
  'Manav Joshi',
  'Nisha Verma',
  'Om Mishra',
  'Prachi Agarwal',
  'Rahul Gupta',
  'Riya Chopra',
  'Sanya Bose',
  'Shivam Rao',
  'Sneha Nair',
  'Tanmay Das',
  'Uday Pillai',
  'Vanya Khanna',
  'Vivek Tiwari',
  'Zara Ansari',
];

const seedAttendanceStudents = async () => {
  console.log('🎯 Starting attendance student seeding...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Find or create the school
    let schoolRes = await client.query(`SELECT id FROM schools LIMIT 1`);
    let schoolId;
    if (schoolRes.rows.length === 0) {
      const newSchool = await client.query(`
        INSERT INTO schools (name, address, phone, email, board)
        VALUES ('Delhi Public School', 'Sector 14, Dwarka', '1234567890', 'admin@dps.edu', 'CBSE')
        RETURNING id
      `);
      schoolId = newSchool.rows[0].id;
      console.log('  Created school:', schoolId);
    } else {
      schoolId = schoolRes.rows[0].id;
      console.log('  Using existing school:', schoolId);
    }

    // 2. Find or create academic year
    let ayRes = await client.query(`SELECT id FROM academic_years WHERE school_id = $1 AND is_current = true LIMIT 1`, [schoolId]);
    let ayId;
    if (ayRes.rows.length === 0) {
      const newAy = await client.query(`
        INSERT INTO academic_years (school_id, label, start_date, end_date, is_current)
        VALUES ($1, '2025-26', '2025-04-01', '2026-03-31', true)
        RETURNING id
      `, [schoolId]);
      ayId = newAy.rows[0].id;
      console.log('  Created academic year:', ayId);
    } else {
      ayId = ayRes.rows[0].id;
      console.log('  Using existing academic year:', ayId);
    }

    // 3. Find or create a teacher user
    let teacherRes = await client.query(`
      SELECT id FROM users WHERE school_id = $1 AND role = 'teacher' LIMIT 1
    `, [schoolId]);
    let teacherId;
    if (teacherRes.rows.length === 0) {
      const hash = await bcrypt.hash('klasso123', 10);
      const newTeacher = await client.query(`
        INSERT INTO users (school_id, name, email, password_hash, role)
        VALUES ($1, 'Priya Sharma', 'teacher1@school.com', $2, 'teacher')
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `, [schoolId, hash]);
      teacherId = newTeacher.rows[0].id;
      console.log('  Created teacher:', teacherId);
    } else {
      teacherId = teacherRes.rows[0].id;
      console.log('  Using existing teacher:', teacherId);
    }

    // 4. Find or create class 8-A (matches the frontend UI)
    let classRes = await client.query(`
      SELECT id FROM classes 
      WHERE school_id = $1 AND name = '8' AND section = 'A'
      LIMIT 1
    `, [schoolId]);
    let classId;
    if (classRes.rows.length === 0) {
      const newClass = await client.query(`
        INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
        VALUES ($1, $2, '8', 'A', $3, '201')
        RETURNING id
      `, [schoolId, ayId, teacherId]);
      classId = newClass.rows[0].id;
      console.log('  Created class 8-A:', classId);
    } else {
      classId = classRes.rows[0].id;
      console.log('  Using existing class 8-A:', classId);
    }

    // 5. Find or create subjects and class_subjects
    const subjectNames = ['Mathematics', 'Science', 'English'];
    const classSubjectIds = [];
    for (const subName of subjectNames) {
      let subRes = await client.query(`
        SELECT id FROM subjects WHERE school_id = $1 AND name = $2 LIMIT 1
      `, [schoolId, subName]);
      let subId;
      if (subRes.rows.length === 0) {
        const newSub = await client.query(`
          INSERT INTO subjects (school_id, name, code)
          VALUES ($1, $2, $3) RETURNING id
        `, [schoolId, subName, subName.substring(0, 3).toUpperCase()]);
        subId = newSub.rows[0].id;
      } else {
        subId = subRes.rows[0].id;
      }

      let csRes = await client.query(`
        SELECT id FROM class_subjects WHERE class_id = $1 AND subject_id = $2 LIMIT 1
      `, [classId, subId]);
      if (csRes.rows.length === 0) {
        const newCs = await client.query(`
          INSERT INTO class_subjects (class_id, subject_id, teacher_id)
          VALUES ($1, $2, $3) RETURNING id
        `, [classId, subId, teacherId]);
        classSubjectIds.push(newCs.rows[0].id);
      } else {
        classSubjectIds.push(csRes.rows[0].id);
      }
    }
    console.log('  Ensured subjects & class_subjects exist');

    // 6. Seed students with real names
    const defaultPasswordHash = await bcrypt.hash('klasso123', 10);
    const studentIds = [];
    let created = 0;
    let existing = 0;

    for (let i = 0; i < STUDENT_NAMES.length; i++) {
      const name = STUDENT_NAMES[i];
      const rollNo = String(i + 1).padStart(2, '0');
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}@student.dps.edu`;
      const admissionNo = `DPS-8A-${rollNo}`;

      // Check if student user already exists by email
      let userRes = await client.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email]);
      let userId;
      if (userRes.rows.length === 0) {
        const newUser = await client.query(`
          INSERT INTO users (school_id, name, email, password_hash, role)
          VALUES ($1, $2, $3, $4, 'student')
          RETURNING id
        `, [schoolId, name, email, defaultPasswordHash]);
        userId = newUser.rows[0].id;
      } else {
        userId = userRes.rows[0].id;
        // Update the name to match
        await client.query(`UPDATE users SET name = $1 WHERE id = $2`, [name, userId]);
      }

      // Check if student record exists
      let stuRes = await client.query(`SELECT id FROM students WHERE user_id = $1 LIMIT 1`, [userId]);
      let studentId;
      if (stuRes.rows.length === 0) {
        const newStu = await client.query(`
          INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [
          userId, schoolId, classId, rollNo, admissionNo,
          `2012-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
          i % 2 === 0 ? 'M' : 'F'
        ]);
        studentId = newStu.rows[0].id;
        created++;
      } else {
        studentId = stuRes.rows[0].id;
        // Make sure class matches
        await client.query(`UPDATE students SET class_id = $1, roll_no = $2 WHERE id = $3`, [classId, rollNo, studentId]);
        existing++;
      }
      studentIds.push(studentId);
    }
    console.log(`  Students: ${created} created, ${existing} already existed`);

    // 7. Seed attendance history (last 30 days) if not already present
    const attendanceCheck = await client.query(`
      SELECT COUNT(*) AS cnt FROM attendance_sessions 
      WHERE class_id = $1 AND date >= NOW() - INTERVAL '30 days'
    `, [classId]);

    if (parseInt(attendanceCheck.rows[0].cnt) < 10) {
      console.log('  Seeding 30 days of attendance history...');
      const statuses = ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'absent', 'late', 'present'];
      
      for (let d = 30; d >= 1; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const dateStr = date.toISOString().split('T')[0];

        // Check if session already exists
        const existingSession = await client.query(`
          SELECT id FROM attendance_sessions WHERE class_id = $1 AND date = $2 AND session_type = 'daily'
        `, [classId, dateStr]);

        let sessionId;
        if (existingSession.rows.length === 0) {
          const sessionRes = await client.query(`
            INSERT INTO attendance_sessions (class_id, date, session_type, marked_by)
            VALUES ($1, $2, 'daily', $3)
            RETURNING id
          `, [classId, dateStr, teacherId]);
          sessionId = sessionRes.rows[0].id;
        } else {
          sessionId = existingSession.rows[0].id;
          continue; // Already has attendance data
        }

        for (const stId of studentIds) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          await client.query(`
            INSERT INTO attendance_records (session_id, student_id, status)
            VALUES ($1, $2, $3)
            ON CONFLICT (session_id, student_id) DO NOTHING
          `, [sessionId, stId, status]);
        }
      }
      console.log('  ✅ Attendance history seeded');
    } else {
      console.log('  Attendance history already exists, skipping');
    }

    await client.query('COMMIT');
    console.log('✅ Attendance student seeding completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   School: ${schoolId}`);
    console.log(`   Class 8-A: ${classId}`);
    console.log(`   Teacher: ${teacherId}`);
    console.log(`   Students: ${studentIds.length}`);
    console.log('');
    console.log('🔑 Login credentials:');
    console.log('   Teacher: teacher1@school.com / klasso123');
    console.log('   Students: [firstname.lastname]@student.dps.edu / klasso123');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error during seeding, transaction rolled back.', error);
  } finally {
    client.release();
    pool.end();
  }
};

seedAttendanceStudents();
