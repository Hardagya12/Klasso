-- Klasso canonical PostgreSQL DDL. TypeScript ORM mirror: backend/prisma/schema.prisma
-- schools
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  board VARCHAR(50) DEFAULT 'CBSE', -- CBSE, ICSE, State
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- users (normalized: one table for all roles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','teacher','parent','student')),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- academic_years (normalized -- not just a string)
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  label VARCHAR(20) NOT NULL, -- e.g. '2024-25'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, label)
);

-- classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id),
  name VARCHAR(50) NOT NULL,   -- '10'
  section VARCHAR(10) NOT NULL, -- 'A'
  class_teacher_id UUID REFERENCES users(id),
  room_number VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, academic_year_id, name, section)
);

-- students (separate from users for extra academic fields)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- student login
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id),
  roll_no VARCHAR(20) NOT NULL,
  admission_no VARCHAR(50) UNIQUE,
  dob DATE,
  gender VARCHAR(10),
  blood_group VARCHAR(5),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, roll_no)
);

-- student_parents (many-to-many: one student can have 2 parents)
CREATE TABLE IF NOT EXISTS student_parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relation VARCHAR(20) DEFAULT 'parent', -- father, mother, guardian
  is_primary BOOLEAN DEFAULT FALSE,
  UNIQUE(student_id, parent_id)
);

-- subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, name)
);

-- class_subjects (which subjects are taught in which class, by which teacher)
CREATE TABLE IF NOT EXISTS class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  periods_per_week INTEGER DEFAULT 5,
  UNIQUE(class_id, subject_id)
);

-- attendance_sessions (one session = one class period or one day marker)
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  class_subject_id UUID REFERENCES class_subjects(id),
  date DATE NOT NULL,
  session_type VARCHAR(20) DEFAULT 'daily', -- daily, period
  marked_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, date, session_type)
);

-- attendance_records (one row per student per session)
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(10) NOT NULL CHECK (status IN ('present','absent','late','excused')),
  remark TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- qr_tokens
CREATE TABLE IF NOT EXISTS qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  session_id UUID REFERENCES attendance_sessions(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- exams
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  exam_type VARCHAR(30) DEFAULT 'unit_test', -- unit_test, midterm, final, practical
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- exam_subjects (which subjects are in this exam, what max marks)
CREATE TABLE IF NOT EXISTS exam_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  max_marks NUMERIC(5,2) NOT NULL DEFAULT 100,
  passing_marks NUMERIC(5,2) DEFAULT 33,
  exam_date DATE,
  UNIQUE(exam_id, subject_id)
);

-- marks
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_subject_id UUID REFERENCES exam_subjects(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL,
  grade VARCHAR(5),
  remarks TEXT,
  entered_by UUID REFERENCES users(id),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_subject_id)
);

-- reports (AI-generated progress reports)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id),
  content TEXT NOT NULL,
  generated_by UUID REFERENCES users(id),
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- timetable_slots
CREATE TABLE IF NOT EXISTS timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  class_subject_id UUID REFERENCES class_subjects(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  period_number SMALLINT NOT NULL CHECK (period_number BETWEEN 1 AND 10),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, day_of_week, period_number)
);

-- substitutions
CREATE TABLE IF NOT EXISTS substitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_slot_id UUID REFERENCES timetable_slots(id),
  date DATE NOT NULL,
  original_teacher_id UUID REFERENCES users(id),
  substitute_teacher_id UUID REFERENCES users(id),
  reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(timetable_slot_id, date)
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id UUID REFERENCES class_subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_marks NUMERIC(5,2),
  attachment_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  content TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  score NUMERIC(5,2),
  feedback TEXT,
  status VARCHAR(20) DEFAULT 'submitted', -- submitted, late, graded, missing
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

-- announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  audience VARCHAR(20) DEFAULT 'all', -- all, teachers, parents, students, class
  class_id UUID REFERENCES classes(id), -- null = school-wide
  attachment_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- messages (parent-teacher inbox)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  deleted_by_sender BOOLEAN DEFAULT FALSE,
  deleted_by_recipient BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'info', -- info, warning, alert, success
  entity_type VARCHAR(50), -- attendance, marks, assignment, fee
  entity_id UUID, -- polymorphic reference to the related record
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Tuition, Transport, Exam
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE,
  academic_year_id UUID REFERENCES academic_years(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  fee_type_id UUID REFERENCES fee_types(id),
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  payment_method VARCHAR(30) DEFAULT 'online', -- online, cash, cheque
  transaction_id VARCHAR(100),
  receipt_url TEXT,
  recorded_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'paid' -- paid, pending, partial
);

-- study_materials
CREATE TABLE IF NOT EXISTS study_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id UUID REFERENCES class_subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(20), -- pdf, video, image, link
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- lesson_plans
CREATE TABLE IF NOT EXISTS lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id UUID REFERENCES class_subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT FALSE,
  week_start DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location VARCHAR(255),
  audience VARCHAR(20) DEFAULT 'all',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- documents (bonafide, TC, certificates)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- bonafide, transfer_cert, character_cert
  content TEXT,
  file_url TEXT,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  issued BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_class_date ON attendance_sessions(class_id, date);
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_exam_subject ON marks(exam_subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_subject ON assignments(class_subject_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable_slots(class_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_class_subject ON study_materials(class_subject_id);
