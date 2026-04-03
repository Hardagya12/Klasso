require('dotenv').config();
const { pool } = require('./neon');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    console.log('Starting seed process...');
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Transaction started.');

        // Clean up existing data to avoid conflicts on re-run
        // In a real prod environment we wouldn't do this, but for a hackathon we assume it's safe.
        // Uncomment if you want fresh seed every time:
        // await client.query('TRUNCATE table schools CASCADE');

        const defaultPasswordHash = await bcrypt.hash('klasso123', 10);
        console.log('Generated default password hash.');

        // 1. Create School
        const schoolRes = await client.query(`
            INSERT INTO schools (name, address, phone, email, board)
            VALUES ('Delhi Public School', 'Sector 14, Dwarka', '1234567890', 'admin@dps.edu', 'CBSE')
            RETURNING id
        `);
        const schoolId = schoolRes.rows[0].id;
        console.log('Created school:', schoolId);

        // 2. Create Academic Year
        const ayRes = await client.query(`
            INSERT INTO academic_years (school_id, label, start_date, end_date, is_current)
            VALUES ($1, '2023-24', '2023-04-01', '2024-03-31', true)
            RETURNING id
        `, [schoolId]);
        const ayId = ayRes.rows[0].id;
        console.log('Created academic year:', ayId);

        // 3. Create Users
        const users = [];

        // Admin
        const adminRes = await client.query(`
            INSERT INTO users (school_id, name, email, password_hash, role)
            VALUES ($1, 'Admin Principal', 'admin@school.com', $2, 'admin')
            RETURNING id
        `, [schoolId, defaultPasswordHash]);
        users.push({ id: adminRes.rows[0].id, role: 'admin' });

        // Teachers
        const teachers = [];
        for (let i = 1; i <= 3; i++) {
            const tRes = await client.query(`
                INSERT INTO users (school_id, name, email, password_hash, role)
                VALUES ($1, 'Teacher ${i}', 'teacher${i}@school.com', $2, 'teacher')
                RETURNING id
            `, [schoolId, defaultPasswordHash]);
            teachers.push(tRes.rows[0].id);
        }

        // Parents
        const parents = [];
        for (let i = 1; i <= 6; i++) {
            const pRes = await client.query(`
                INSERT INTO users (school_id, name, email, password_hash, role)
                VALUES ($1, 'Parent ${i}', 'parent${i}@mail.com', $2, 'parent')
                RETURNING id
            `, [schoolId, defaultPasswordHash]);
            parents.push(pRes.rows[0].id);
        }
        console.log(`Created 1 admin, 3 teachers, 6 parents.`);

        // Students Users
        const studentUsersA = [];
        for (let i = 1; i <= 6; i++) {
            const suRes = await client.query(`
                INSERT INTO users (school_id, name, email, password_hash, role)
                VALUES ($1, 'Student 10A_${i}', 'student10A_${i}@school.com', $2, 'student')
                RETURNING id
            `, [schoolId, defaultPasswordHash]);
            studentUsersA.push(suRes.rows[0].id);
        }

        const studentUsersB = [];
        for (let i = 1; i <= 6; i++) {
            const suRes = await client.query(`
                INSERT INTO users (school_id, name, email, password_hash, role)
                VALUES ($1, 'Student 10B_${i}', 'student10B_${i}@school.com', $2, 'student')
                RETURNING id
            `, [schoolId, defaultPasswordHash]);
            studentUsersB.push(suRes.rows[0].id);
        }

        // 4. Create Classes
        const class10ARes = await client.query(`
            INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
            VALUES ($1, $2, '10', 'A', $3, '101')
            RETURNING id
        `, [schoolId, ayId, teachers[0]]);
        const class10A = class10ARes.rows[0].id;

        const class10BRes = await client.query(`
            INSERT INTO classes (school_id, academic_year_id, name, section, class_teacher_id, room_number)
            VALUES ($1, $2, '10', 'B', $3, '102')
            RETURNING id
        `, [schoolId, ayId, teachers[1]]);
        const class10B = class10BRes.rows[0].id;
        console.log('Created classes 10A and 10B.');

        // 5. Create Subjects
        const subjectNames = ['Math', 'Physics', 'Chemistry', 'English', 'History', 'Computer Science'];
        const subjects = [];
        for (const name of subjectNames) {
            const sRes = await client.query(`
                INSERT INTO subjects (school_id, name, code)
                VALUES ($1, $2, $3)
                RETURNING id
            `, [schoolId, name, name.substring(0, 3).toUpperCase()]);
            subjects.push(sRes.rows[0].id);
        }
        console.log('Created subjects.');

        // 6. Class Subjects
        // 10A gets Math, Physics, Chemistry
        const cs10A = [];
        for (let i = 0; i < 3; i++) {
            const csRes = await client.query(`
                INSERT INTO class_subjects (class_id, subject_id, teacher_id)
                VALUES ($1, $2, $3)
                RETURNING id
            `, [class10A, subjects[i], teachers[i % 3]]);
            cs10A.push(csRes.rows[0].id);
        }

        // 10B gets English, History, CS
        const cs10B = [];
        for (let i = 3; i < 6; i++) {
            const csRes = await client.query(`
                INSERT INTO class_subjects (class_id, subject_id, teacher_id)
                VALUES ($1, $2, $3)
                RETURNING id
            `, [class10B, subjects[i], teachers[(i - 3) % 3]]);
            cs10B.push(csRes.rows[0].id);
        }
        console.log('Assigned subjects to classes.');

        // 7. Students & Student Parents
        const studentIdsA = [];
        for (let i = 0; i < 6; i++) {
            const sRes = await client.query(`
                INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [studentUsersA[i], schoolId, class10A, (i + 1).toString(), 'A100' + i, '2008-05-10', 'M']);
            studentIdsA.push(sRes.rows[0].id);

            await client.query(`
                INSERT INTO student_parents (student_id, parent_id, relation, is_primary)
                VALUES ($1, $2, 'father', true)
            `, [sRes.rows[0].id, parents[i]]);
        }

        const studentIdsB = [];
        for (let i = 0; i < 6; i++) {
            const sRes = await client.query(`
                INSERT INTO students (user_id, school_id, class_id, roll_no, admission_no, dob, gender)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [studentUsersB[i], schoolId, class10B, (i + 1).toString(), 'B100' + i, '2008-08-20', 'F']);
            studentIdsB.push(sRes.rows[0].id);

            await client.query(`
                INSERT INTO student_parents (student_id, parent_id, relation, is_primary)
                VALUES ($1, $2, 'mother', true)
            `, [sRes.rows[0].id, parents[5 - i]]); // Reverse to mix parents
        }
        console.log('Created students and parent links.');

        // 8. Attendance (30 days)
        const generateAttendance = async (classId, classSubjectId, studentIds) => {
            for (let d = 1; d <= 30; d++) {
                const dateStr = `2023-06-${d.toString().padStart(2, '0')}`;
                
                const sessionRes = await client.query(`
                    INSERT INTO attendance_sessions (class_id, class_subject_id, date, session_type, marked_by)
                    VALUES ($1, $2, $3, 'daily', $4)
                    RETURNING id
                `, [classId, classSubjectId, dateStr, teachers[0]]);
                
                const sessionId = sessionRes.rows[0].id;

                for (const stId of studentIds) {
                    const isAbsent = Math.random() < 0.1; // 10% absent rate
                    await client.query(`
                        INSERT INTO attendance_records (session_id, student_id, status)
                        VALUES ($1, $2, $3)
                    `, [sessionId, stId, isAbsent ? 'absent' : 'present']);
                }
            }
        };

        await generateAttendance(class10A, cs10A[0], studentIdsA);
        await generateAttendance(class10B, cs10B[0], studentIdsB);
        console.log('Generated 30 days of attendance.');

        // 9. Exams & Marks
        const generateExams = async (classId, studentIds, examPrefix) => {
            for (let i = 1; i <= 2; i++) {
                const examRes = await client.query(`
                    INSERT INTO exams (school_id, class_id, name, exam_type, start_date, end_date, created_by)
                    VALUES ($1, $2, $3, 'unit_test', '2023-07-01', '2023-07-05', $4)
                    RETURNING id
                `, [schoolId, classId, `${examPrefix} Unit Test ${i}`, adminRes.rows[0].id]);
                
                const examId = examRes.rows[0].id;
                
                // Tie to one subject just for simplicity
                const esRes = await client.query(`
                    INSERT INTO exam_subjects (exam_id, subject_id, max_marks)
                    VALUES ($1, $2, 100)
                    RETURNING id
                `, [examId, subjects[0]]);

                const esId = esRes.rows[0].id;

                for (const stId of studentIds) {
                    const score = Math.floor(Math.random() * 50) + 50; // 50 to 100
                    await client.query(`
                        INSERT INTO marks (student_id, exam_subject_id, score, grade)
                        VALUES ($1, $2, $3, 'A')
                    `, [stId, esId, score]);
                }
            }
        };

        await generateExams(class10A, studentIdsA, '10A');
        await generateExams(class10B, studentIdsB, '10B');
        console.log('Generated exams and marks.');

        // 10. Timetable (5 days x 6 periods)
        const generateTimetable = async (classId, classSubjectIds) => {
            for (let day = 1; day <= 5; day++) {
                for (let period = 1; period <= 6; period++) {
                    const csId = classSubjectIds[period % classSubjectIds.length];
                    const startTime = `${8 + period}:00:00`;
                    const endTime = `${8 + period}:45:00`;

                    await client.query(`
                        INSERT INTO timetable_slots (class_id, class_subject_id, day_of_week, period_number, start_time, end_time)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [classId, csId, day, period, startTime, endTime]);
                }
            }
        };

        await generateTimetable(class10A, cs10A);
        await generateTimetable(class10B, cs10B);
        console.log('Generated timetable.');

        // 11. Assignments
        const generateAssignments = async (classSubjectId) => {
            for (let i = 1; i <= 3; i++) {
                await client.query(`
                    INSERT INTO assignments (class_subject_id, title, description, due_date, max_marks, created_by)
                    VALUES ($1, $2, 'Please complete the worksheet attached.', '2023-08-01 10:00:00', 10, $3)
                `, [classSubjectId, `HW ${i}`, teachers[0]]);
            }
        };

        await generateAssignments(cs10A[0]);
        await generateAssignments(cs10B[0]);
        console.log('Generated assignments.');

        // 12. Announcements
        for (let i = 1; i <= 3; i++) {
            await client.query(`
                INSERT INTO announcements (school_id, title, body, audience, created_by)
                VALUES ($1, $2, 'This is a school wide announcement.', 'all', $3)
            `, [schoolId, `Announcement ${i}`, adminRes.rows[0].id]);
        }
        console.log('Generated announcements.');

        // 13. Events
        await client.query(`
            INSERT INTO events (school_id, title, description, start_datetime, location, audience, created_by)
            VALUES ($1, 'Annual Sports Meet', 'Join us for sports!', '2023-11-20 09:00:00', 'Main Ground', 'all', $2)
        `, [schoolId, adminRes.rows[0].id]);
        await client.query(`
            INSERT INTO events (school_id, title, description, start_datetime, location, audience, created_by)
            VALUES ($1, 'Science Fair', 'Science exhibition by students.', '2023-12-10 10:00:00', 'Auditorium', 'all', $2)
        `, [schoolId, adminRes.rows[0].id]);
        console.log('Generated events.');

        // 14. Fee Types & Payments
        const feeRes = await client.query(`
            INSERT INTO fee_types (school_id, name, amount, due_date, academic_year_id)
            VALUES ($1, 'Tuition Fee Term 1', 15000, '2023-05-10', $2)
            RETURNING id
        `, [schoolId, ayId]);
        const feeId = feeRes.rows[0].id;

        // Pay fee for early students
        for (let i = 0; i < 3; i++) {
            await client.query(`
                INSERT INTO fee_payments (student_id, fee_type_id, amount_paid, payment_method, status)
                VALUES ($1, $2, 15000, 'online', 'paid')
            `, [studentIdsA[i], feeId]);
        }
        console.log('Generated fees and payments.');

        // 15. Study Materials
        const generateMaterials = async (classSubjectId) => {
            for (let i = 1; i <= 2; i++) {
                await client.query(`
                    INSERT INTO study_materials (class_subject_id, title, description, file_url, file_type, uploaded_by)
                    VALUES ($1, $2, 'Notes for chapter.', 'https://example.com/notes.pdf', 'pdf', $3)
                `, [classSubjectId, `Notes ${i}`, teachers[0]]);
            }
        };

        await generateMaterials(cs10A[0]);
        await generateMaterials(cs10B[0]);
        console.log('Generated study materials.');

        await client.query('COMMIT');
        console.log('Data seeding completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during seeding, transaction rolled back.', error);
    } finally {
        client.release();
        pool.end();
    }
};

seedData();
