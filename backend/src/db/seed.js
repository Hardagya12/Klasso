require('dotenv').config();
const { pool } = require('./neon');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    console.log('🌱 Starting Klasso seed process...');
        try {
        console.log('Starting seed operations...');

        await pool.query('DELETE FROM student_badges');
        await pool.query('DELETE FROM badges');
        await pool.query('DELETE FROM attendance_streaks');
        await pool.query('DELETE FROM xp_events');
        await pool.query('DELETE FROM class_xp');
        await pool.query('DELETE FROM quest_completions');
        await pool.query('DELETE FROM quests');
        await pool.query('DELETE FROM mood_checkins');
        await pool.query('DELETE FROM mood_alerts');
        await pool.query('DELETE FROM time_capsules');
        await pool.query('DELETE FROM duel_answers');
        await pool.query('DELETE FROM duel_sessions');
        await pool.query('DELETE FROM duel_questions');
        await pool.query('DELETE FROM duels');
        await pool.query('DELETE FROM sub_briefings');
        await pool.query('DELETE FROM substitutions');
        await pool.query('DELETE FROM ptm_slots');
        await pool.query('DELETE FROM ptm_events');
        await pool.query('DELETE FROM fee_payments');
        await pool.query('DELETE FROM fee_types');
        await pool.query('DELETE FROM documents');
        await pool.query('DELETE FROM study_materials');
        await pool.query('DELETE FROM lesson_plans');
        await pool.query('DELETE FROM assignment_submissions');
        await pool.query('DELETE FROM assignments');
        await pool.query('DELETE FROM timetable_slots');
        await pool.query('DELETE FROM reports');
        await pool.query('DELETE FROM marks');
        await pool.query('DELETE FROM exam_subjects');
        await pool.query('DELETE FROM exams');
        await pool.query('DELETE FROM qr_tokens');
        await pool.query('DELETE FROM attendance_records');
        await pool.query('DELETE FROM attendance_sessions');
        await pool.query('DELETE FROM notifications');
        await pool.query('DELETE FROM messages');
        await pool.query('DELETE FROM announcements');
        await pool.query('DELETE FROM events');
        await pool.query('DELETE FROM student_parents');
        await pool.query('DELETE FROM students');
        await pool.query('DELETE FROM class_subjects');
        await pool.query('DELETE FROM subjects');
        await pool.query('DELETE FROM classes');
        await pool.query('DELETE FROM academic_years');
        await pool.query('DELETE FROM users');
        await pool.query('DELETE FROM schools');
        console.log('✅ Cleaned up old data.');

        const passwordHash = await bcrypt.hash('Password123!', 12);
        console.log('Generated password hash for Password123!');

        // 1. Create School
        const schoolRes = await pool.query(`
            INSERT INTO schools (name, address, phone, email, board)
            VALUES ('Klasso Demo School', 'HSR Layout, Bangalore', '9876543210', 'admin@klasso.school', 'CBSE')
            RETURNING id
        `);
        const schoolId = schoolRes.rows[0].id;
        console.log('✅ Created school:', schoolId);

        // 2. Create Academic Year
        const ayRes = await pool.query(`
            INSERT INTO academic_years (school_id, label, start_date, end_date, is_current)
            VALUES ($1, '2024-25', '2024-04-01', '2025-03-31', true)
            RETURNING id
        `, [schoolId]);
        const ayId = ayRes.rows[0].id;
        console.log('✅ Created academic year:', ayId);

        // 3. Create Users
        // Admin
        const adminRes = await pool.query(`
            INSERT INTO users (school_id, name, email, password_hash, role)
            VALUES ($1, 'Admin Principal', 'admin@klasso.com', $2, 'admin')
            RETURNING id
        `, [schoolId, passwordHash]);
        const adminId = adminRes.rows[0].id;

        // Teacher 1 - Priya Sharma
        const teacher1Res = await pool.query(`
            INSERT INTO users (school_id, name, email, password_hash, role)
            VALUES ($1, 'Priya Sharma', 'teacher@klasso.com', $2, 'teacher')
            RETURNING id
        `, [schoolId, passwordHash]);
        const teacher1Id = teacher1Res.rows[0].id;

        // Teacher 2 - Raj Patel
        const teacher2Res = await pool.query(`
            INSERT INTO users (school_id, name, email, password_hash, role)
            VALUES ($1, 'Raj Patel', 'teacher2@klasso.com', $2, 'teacher')
            RETURNING id
        `, [schoolId, passwordHash]);
        const teacher2Id = teacher2Res.rows[0].id;

        // Parent - Sunita Mehta
        const parent1Res = await pool.query(`
            INSERT INTO users (school_id, name, email, password_hash, role)
            VALUES ($1, 'Sunita Mehta', 'parent@klasso.com', $2, 'parent')
            RETURNING id
        `, [schoolId, passwordHash]);
        const parent1Id = parent1Res.rows[0].id;

        // Student User 1 - Arjun Mehta
        const studentUser1Res = await pool.query(`
            INSERT INTO users (school_id, name, email, password_hash, role)
            VALUES ($1, 'Arjun Mehta', 'student@klasso.com', $2, 'student')
            RETURNING id
        `, [schoolId, passwordHash]);
        const studentUser1Id = studentUser1Res.rows[0].id;

        // Student User 2 - Priya Shah
        const studentUser2Res = await pool.query(`
            INSERT INTO users (school_id, name, email, password_hash, role)
            VALUES ($1, 'Priya Shah', 'student2@klasso.com', $2, 'student')
            RETURNING id
        `, [schoolId, passwordHash]);
        const studentUser2Id = studentUser2Res.rows[0].id;

        console.log('✅ Created all users.');

        // 4. Create Classes
        const class8ARes = await pool.query(`
            INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
            VALUES ($1, $2, '8', 'A', $3, '101')
            RETURNING id
        `, [schoolId, ayId, teacher1Id]);
        const class8AId = class8ARes.rows[0].id;

        const class9BRes = await pool.query(`
            INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
            VALUES ($1, $2, '9', 'B', $3, '202')
            RETURNING id
        `, [schoolId, ayId, teacher2Id]);
        const class9BId = class9BRes.rows[0].id;
        console.log('✅ Created classes 8-A and 9-B.');

        // 5. Create Subjects with colors
        const subjectData = [
            { name: 'Mathematics', code: 'MAT' },
            { name: 'Science', code: 'SCI' },
            { name: 'English', code: 'ENG' },
            { name: 'Hindi', code: 'HIN' },
            { name: 'Social Studies', code: 'SST' },
            { name: 'Computer Science', code: 'CSC' },
        ];
        const subjectIds = [];
        for (const sub of subjectData) {
            const sRes = await pool.query(`
                INSERT INTO subjects (school_id, name, code)
                VALUES ($1, $2, $3)
                RETURNING id
            `, [schoolId, sub.name, sub.code]);
            subjectIds.push(sRes.rows[0].id);
        }
        console.log('✅ Created subjects.');

        // 6. Class Subjects - Link teacher1 to Math + Science for 8-A
        const cs8A = [];
        // Math - teacher 1
        let csRes = await pool.query(`
            INSERT INTO class_subjects (class_id, subject_id, teacher_id)
            VALUES ($1, $2, $3) RETURNING id
        `, [class8AId, subjectIds[0], teacher1Id]);
        cs8A.push(csRes.rows[0].id);
        
        // Science - teacher 1
        csRes = await pool.query(`
            INSERT INTO class_subjects (class_id, subject_id, teacher_id)
            VALUES ($1, $2, $3) RETURNING id
        `, [class8AId, subjectIds[1], teacher1Id]);
        cs8A.push(csRes.rows[0].id);
        
        // English - teacher 2
        csRes = await pool.query(`
            INSERT INTO class_subjects (class_id, subject_id, teacher_id)
            VALUES ($1, $2, $3) RETURNING id
        `, [class8AId, subjectIds[2], teacher2Id]);
        cs8A.push(csRes.rows[0].id);

        // Hindi - teacher 2
        csRes = await pool.query(`
            INSERT INTO class_subjects (class_id, subject_id, teacher_id)
            VALUES ($1, $2, $3) RETURNING id
        `, [class8AId, subjectIds[3], teacher2Id]);
        cs8A.push(csRes.rows[0].id);

        // Social Studies - teacher 1
        csRes = await pool.query(`
            INSERT INTO class_subjects (class_id, subject_id, teacher_id)
            VALUES ($1, $2, $3) RETURNING id
        `, [class8AId, subjectIds[4], teacher1Id]);
        cs8A.push(csRes.rows[0].id);

        // Computer Science - teacher 2
        csRes = await pool.query(`
            INSERT INTO class_subjects (class_id, subject_id, teacher_id)
            VALUES ($1, $2, $3) RETURNING id
        `, [class8AId, subjectIds[5], teacher2Id]);
        cs8A.push(csRes.rows[0].id);

        // 9-B class subjects
        const cs9B = [];
        for (let i = 0; i < 6; i++) {
            csRes = await pool.query(`
                INSERT INTO class_subjects (class_id, subject_id, teacher_id)
                VALUES ($1, $2, $3) RETURNING id
            `, [class9BId, subjectIds[i], i < 3 ? teacher2Id : teacher1Id]);
            cs9B.push(csRes.rows[0].id);
        }
        console.log('✅ Assigned subjects to classes.');

        // 7. Students
        const student1Res = await pool.query(`
            INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender)
            VALUES ($1, $2, $3, '001', 'KL24001', '2010-05-15', 'M')
            RETURNING id
        `, [studentUser1Id, schoolId, class8AId]);
        const student1Id = student1Res.rows[0].id;

        const student2Res = await pool.query(`
            INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender)
            VALUES ($1, $2, $3, '002', 'KL24002', '2010-08-22', 'F')
            RETURNING id
        `, [studentUser2Id, schoolId, class8AId]);
        const student2Id = student2Res.rows[0].id;
        console.log('✅ Created students.');

        // 8. Student Parents - link parent to student1 (Arjun)
        await pool.query(`
            INSERT INTO student_parents (student_id, parent_id, relation, is_primary)
            VALUES ($1, $2, 'mother', true)
        `, [student1Id, parent1Id]);
        console.log('✅ Linked parent to student.');

        // 9. Attendance (30 days)
        const today = new Date();
        for (let d = 14; d >= 1; d--) {
            const date = new Date(today);
            date.setDate(date.getDate() - d);
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            const dateStr = date.toISOString().split('T')[0];
            
            const sessionRes = await pool.query(`
                INSERT INTO attendance_sessions (class_id, class_subject_id, date, session_type, marked_by)
                VALUES ($1, $2, $3, 'daily', $4)
                ON CONFLICT (class_id, date, session_type) DO NOTHING
                RETURNING id
            `, [class8AId, cs8A[0], dateStr, teacher1Id]);
            
            if (sessionRes.rows.length === 0) continue;
            const sessionId = sessionRes.rows[0].id;

            // Student 1 attendance: mostly present (90%)
            const status1 = Math.random() < 0.1 ? (Math.random() < 0.5 ? 'absent' : 'late') : 'present';
            await pool.query(`
                INSERT INTO attendance_records (session_id, student_id, status)
                VALUES ($1, $2, $3)
            `, [sessionId, student1Id, status1]);

            // Student 2 attendance: 80% present
            const status2 = Math.random() < 0.2 ? (Math.random() < 0.5 ? 'absent' : 'late') : 'present';
            await pool.query(`
                INSERT INTO attendance_records (session_id, student_id, status)
                VALUES ($1, $2, $3)
            `, [sessionId, student2Id, status2]);
        }
        console.log('✅ Generated 30 days of attendance.');

        // 10. Exams & Marks (grades)
        for (let examIdx = 0; examIdx < 2; examIdx++) {
            const examNames = ['Mid-Term Exam', 'Unit Test 1'];
            const examRes = await pool.query(`
                INSERT INTO exams (school_id, class_id, name, exam_type, start_date, end_date, created_by)
                VALUES ($1, $2, $3, 'unit_test', $4, $5, $6)
                RETURNING id
            `, [schoolId, class8AId, examNames[examIdx], '2025-01-15', '2025-01-20', adminId]);
            const examId = examRes.rows[0].id;

            // Create exam subjects for each subject
            for (let i = 0; i < Math.min(5, subjectIds.length); i++) {
                const esRes = await pool.query(`
                    INSERT INTO exam_subjects (exam_id, subject_id, max_marks)
                    VALUES ($1, $2, 100)
                    RETURNING id
                `, [examId, subjectIds[i]]);
                const esId = esRes.rows[0].id;

                // Marks for student 1 (Arjun - good student)
                const score1 = Math.floor(Math.random() * 20) + 75; // 75-95
                const grade1 = score1 >= 90 ? 'A+' : score1 >= 80 ? 'A' : score1 >= 70 ? 'B+' : 'B';
                await pool.query(`
                    INSERT INTO marks (student_id, exam_subject_id, score, grade, entered_by)
                    VALUES ($1, $2, $3, $4, $5)
                `, [student1Id, esId, score1, grade1, teacher1Id]);

                // Marks for student 2 (Priya - average student)
                const score2 = Math.floor(Math.random() * 30) + 55; // 55-85
                const grade2 = score2 >= 90 ? 'A+' : score2 >= 80 ? 'A' : score2 >= 70 ? 'B+' : score2 >= 60 ? 'B' : 'C';
                await pool.query(`
                    INSERT INTO marks (student_id, exam_subject_id, score, grade, entered_by)
                    VALUES ($1, $2, $3, $4, $5)
                `, [student2Id, esId, score2, grade2, teacher1Id]);
            }
        }
        console.log('✅ Generated exams and marks.');

        // 11. Timetable for 8-A (Mon-Sat, 8 periods)
        const periodTimes = [
            ['08:00:00', '08:45:00'],
            ['08:45:00', '09:30:00'],
            ['09:45:00', '10:30:00'],
            ['10:30:00', '11:15:00'],
            ['11:30:00', '12:15:00'],
            ['12:15:00', '13:00:00'],
            ['13:45:00', '14:30:00'],
            ['14:30:00', '15:15:00'],
        ];
        for (let day = 1; day <= 6; day++) { // Mon(1) to Sat(6)
            for (let period = 0; period < 8; period++) {
                const csId = cs8A[period % cs8A.length];
                await pool.query(`
                    INSERT INTO timetable_slots (class_id, class_subject_id, day_of_week, period_number, start_time, end_time)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (class_id, day_of_week, period_number) DO NOTHING
                `, [class8AId, csId, day, period + 1, periodTimes[period][0], periodTimes[period][1]]);
            }
        }
        console.log('✅ Generated timetable.');

        // 12. Assignments for 8-A
        const assignmentTitles = [
            'Algebra Practice Set 3',
            'Science Lab Report - Photosynthesis',
            'English Essay: My Favorite Season',
            'Hindi Poetry Analysis',
            'SST Chapter 5 Worksheet',
        ];
        const assignmentIds = [];
        for (let i = 0; i < 5; i++) {
            const dueDate = new Date(today);
            dueDate.setDate(dueDate.getDate() + (i * 3 - 5));
            const aRes = await pool.query(`
                INSERT INTO assignments (class_subject_id, title, description, due_date, max_marks, created_by)
                VALUES ($1, $2, $3, $4, 10, $5)
                RETURNING id
            `, [cs8A[i % cs8A.length], assignmentTitles[i], 'Complete the assignment by the due date.', dueDate.toISOString(), teacher1Id]);
            assignmentIds.push(aRes.rows[0].id);
        }
        console.log('✅ Generated assignments.');

        // 13. Submissions from student 1 (2 submissions)
        for (let i = 0; i < 2; i++) {
            await pool.query(`
                INSERT INTO assignment_submissions (assignment_id, student_id, content, status, score, feedback)
                VALUES ($1, $2, $3, 'graded', $4, $5)
            `, [assignmentIds[i], student1Id, 'Completed all questions.', 8 + i, 'Good work, Arjun!']);
        }
        console.log('✅ Generated submissions.');

        // 14. ClassXP for 8-A
        const classXpRes = await pool.query(`
            INSERT INTO class_xp (class_id, total_xp, current_level, current_title, xp_to_next_level, weekly_xp, week_start_date)
            VALUES ($1, 800, 2, 'Sprouts', 500, 200, $2)
            RETURNING id
        `, [class8AId, new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1).toISOString().split('T')[0]]);
        console.log('✅ Created ClassXP.');

        // 15. AttendanceStreak for Arjun
        await pool.query(`
            INSERT INTO attendance_streaks (student_id, current_streak, longest_streak, last_present_date, total_present_days, updated_at)
            VALUES ($1, 7, 15, $2, 22, NOW())
        `, [student1Id, new Date(today.getTime() - 86400000).toISOString().split('T')[0]]);
        console.log('✅ Created attendance streak.');

        // 16. Badges
        const badge1Res = await pool.query(`
            INSERT INTO badges (name, description, type, threshold, icon_name, color, rarity)
            VALUES ('Consistent', '7-day attendance streak!', 'STREAK', 7, 'flame', '#F5A623', 'COMMON')
            RETURNING id
        `);
        const badge2Res = await pool.query(`
            INSERT INTO badges (name, description, type, threshold, icon_name, color, rarity)
            VALUES ('Early Bird', 'Never late for a week!', 'STREAK', 5, 'sunrise', '#4ECDC4', 'RARE')
            RETURNING id
        `);
        const badge3Res = await pool.query(`
            INSERT INTO badges (name, description, type, threshold, icon_name, color, rarity)
            VALUES ('First Step', 'Completed first assignment!', 'SUBMISSION', 1, 'footprints', '#FF6B6B', 'COMMON')
            RETURNING id
        `);

        // Award badges to Arjun
        await pool.query(`INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2)`, [student1Id, badge1Res.rows[0].id]);
        await pool.query(`INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2)`, [student1Id, badge2Res.rows[0].id]);
        await pool.query(`INSERT INTO student_badges (student_id, badge_id) VALUES ($1, $2)`, [student1Id, badge3Res.rows[0].id]);
        console.log('✅ Created badges and awarded to Arjun.');

        // 17. Notifications
        const allUserIds = [adminId, teacher1Id, teacher2Id, parent1Id, studentUser1Id, studentUser2Id];
        for (const userId of allUserIds) {
            await pool.query(`
                INSERT INTO notifications (user_id, title, message, type)
                VALUES ($1, 'Welcome to Klasso!', 'Welcome to the Klasso platform. Explore all features!', 'info')
            `, [userId]);
            await pool.query(`
                INSERT INTO notifications (user_id, title, message, type)
                VALUES ($1, 'New Assignment Posted', 'A new assignment has been posted for your class.', 'assignment')
            `, [userId]);
        }
        console.log('✅ Generated notifications.');

        // 18. Fee Type + Payment
        const feeRes = await pool.query(`
            INSERT INTO fee_types (school_id, name, amount, due_date, academic_year_id)
            VALUES ($1, 'Tuition Fee Term 1', 25000, '2025-05-15', $2)
            RETURNING id
        `, [schoolId, ayId]);
        const feeId = feeRes.rows[0].id;

        await pool.query(`
            INSERT INTO fee_payments (student_id, fee_type_id, amount_paid, payment_method, status, recorded_by)
            VALUES ($1, $2, 25000, 'online', 'paid', $3)
        `, [student1Id, feeId, adminId]);
        console.log('✅ Generated fees and payment.');

        // 19. Messages (conversation between parent and teacher)
        await pool.query(`
            INSERT INTO messages (sender_id, recipient_id, subject, body)
            VALUES ($1, $2, 'Arjun''s Progress', 'Dear Ma''am, how is Arjun doing in Mathematics this term?')
        `, [parent1Id, teacher1Id]);
        await pool.query(`
            INSERT INTO messages (sender_id, recipient_id, subject, body)
            VALUES ($1, $2, 'Re: Arjun''s Progress', 'Dear Mrs. Mehta, Arjun is doing very well! He scored 92/100 in the last test.')
        `, [teacher1Id, parent1Id]);
        await pool.query(`
            INSERT INTO messages (sender_id, recipient_id, subject, body)
            VALUES ($1, $2, 'Re: Arjun''s Progress', 'That''s wonderful news! Thank you for the update.')
        `, [parent1Id, teacher1Id]);
        console.log('✅ Generated messages.');

        // 20. Announcements
        await pool.query(`
            INSERT INTO announcements (school_id, title, body, audience, created_by)
            VALUES ($1, 'Annual Sports Day', 'Annual sports day will be held on March 15th. All students must participate.', 'all', $2)
        `, [schoolId, adminId]);
        await pool.query(`
            INSERT INTO announcements (school_id, title, body, audience, created_by)
            VALUES ($1, 'Parent-Teacher Meeting', 'PTM scheduled for next Saturday at 10 AM.', 'all', $2)
        `, [schoolId, adminId]);
        console.log('✅ Generated announcements.');

        // 21. Events
        await pool.query(`
            INSERT INTO events (school_id, title, description, start_datetime, location, audience, created_by)
            VALUES ($1, 'Annual Sports Meet', 'Join us for an exciting day of sports!', '2025-03-15 09:00:00+05:30', 'School Ground', 'all', $2)
        `, [schoolId, adminId]);
        console.log('✅ Generated events.');



        // 24. PTM Events & Slots
        const ptmRes = await pool.query(`
            INSERT INTO ptm_events (school_id, title, date, start_time, end_time, created_by_id)
            VALUES ($1, 'Spring Term PTM', '2025-04-15', '10:00:00', '14:00:00', $2)
            RETURNING id
        `, [schoolId, teacher1Id]);
        const ptmId = ptmRes.rows[0].id;

        await pool.query(`
            INSERT INTO ptm_slots (ptm_event_id, teacher_id, parent_id, student_id, scheduled_at, status)
            VALUES ($1, $2, $3, $4, '2025-04-15 10:00:00+00', 'CONFIRMED')
        `, [ptmId, teacher1Id, parent1Id, student1Id]);
        console.log('✅ Generated PTM events and slots.');

        // 25. Quests and Completions
        const questRes = await pool.query(`
            INSERT INTO quests (teacher_id, class_id, title, description, type, target, xp_reward, badge_name, badge_color, start_date, end_date)
            VALUES ($1, $2, 'Math Master Challenge', 'Solve 5 math assignments this month.', 'ASSIGNMENT_SUBMISSIONS', '{"count": 5}'::json, 200, 'Math Pro', '#4A90e2', '2025-04-01', '2025-04-30')
            RETURNING id
        `, [teacher1Id, class8AId]);
        const questId = questRes.rows[0].id;

        await pool.query(`
            INSERT INTO quest_completions (quest_id, student_id, xp_awarded)
            VALUES ($1, $2, 200)
        `, [questId, student1Id]);
        console.log('✅ Generated Quests.');

        // 26. Duels and Active Real-time sessions
        const duelRes = await pool.query(`
            INSERT INTO duels (class_id, subject_id, teacher_id, title, status, current_q)
            VALUES ($1, $2, $3, 'Science Pop Quiz', 'ACTIVE', 1)
            RETURNING id
        `, [class8AId, subjectIds[1], teacher1Id]);
        const duelId = duelRes.rows[0].id;

        const dQRes = await pool.query(`
            INSERT INTO duel_questions (duel_id, "order", question_text, options, correct_index)
            VALUES ($1, 1, 'What is the powerhouse of the cell?', '["Nucleus", "Ribosome", "Mitochondria", "Golgi"]'::json, 2)
            RETURNING id
        `, [duelId]);
        const questionId = dQRes.rows[0].id;

        const sessionIdRes = await pool.query(`
            INSERT INTO duel_sessions (duel_id, student_id, score, is_active)
            VALUES ($1, $2, 0, true)
            RETURNING id
        `, [duelId, student1Id]);
        
        await pool.query(`
            INSERT INTO duel_answers (session_id, question_id, selected_index, is_correct, response_time_ms)
            VALUES ($1, $2, 2, true, 4500)
        `, [sessionIdRes.rows[0].id, questionId]);
        console.log('✅ Generated Real-Time Duels.');

        // 27. Substitutions & Sub Briefings
        const subRes = await pool.query(`
            INSERT INTO substitutions (timetable_slot_id, date, original_teacher_id, substitute_teacher_id, reason, created_by)
            VALUES ((SELECT id FROM timetable_slots LIMIT 1), '2025-04-05', $1, $2, 'Medical Leave', $3)
            RETURNING id
        `, [teacher1Id, teacher2Id, adminId]);
        
        await pool.query(`
            INSERT INTO sub_briefings (substitution_id, content, ai_summary)
            VALUES ($1, '{"topicsToCover": ["Algebra review"], "urgentTasks": []}'::json, 'Cover ALgebra Review. No urgent tasks.')
        `, [subRes.rows[0].id]);
        console.log('✅ Generated Substitutions.');

        // 28. Mood Check-ins & Alerts
        await pool.query(`
            INSERT INTO mood_checkins (student_id, mood, note, ai_analysis, recorded_at)
            VALUES ($1, 'sad', 'Stressed about exams', 'Student seems anxious regarding upcoming exams.', NOW() - INTERVAL '1 day')
        `, [student2Id]);
        await pool.query(`
            INSERT INTO mood_alerts (student_id, alert_level, reason)
            VALUES ($1, 'medium', 'Student logged negative mood')
        `, [student2Id]);
        console.log('✅ Generated Mood Check-ins.');

        // 29. Time Capsules
        await pool.query(`
            INSERT INTO time_capsules (student_id, title, content, unlock_date)
            VALUES ($1, 'Message to Future Self', 'I hope you became an engineer!', '2030-05-15')
        `, [student1Id]);
        console.log('✅ Generated Time Capsules.');

        console.log('\n📧 Test Accounts (all passwords: Password123!):');
        console.log('   admin@klasso.com    (Admin)');
        console.log('   teacher@klasso.com  (Teacher - Priya Sharma)');
        console.log('   teacher2@klasso.com (Teacher - Raj Patel)');
        console.log('   parent@klasso.com   (Parent - Sunita Mehta)');
        console.log('   student@klasso.com  (Student - Arjun Mehta, 8-A)');
        console.log('   student2@klasso.com (Student - Priya Shah, 8-A)');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        pool.end();
    }
};

seedData();
