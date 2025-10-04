/*
  # School Portal Database Schema

  ## Overview
  This migration creates a comprehensive school portal system with role-based access control
  for students, parents, and teachers.

  ## 1. New Tables

  ### `user_profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique, not null)
  - `full_name` (text, not null)
  - `role` (text, not null) - 'student', 'parent', or 'teacher'
  - `avatar_url` (text, nullable)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `students`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `grade_level` (text)
  - `section` (text)
  - `student_id` (text, unique)
  - `created_at` (timestamptz)

  ### `teachers`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references user_profiles)
  - `subject` (text)
  - `department` (text)
  - `created_at` (timestamptz)

  ### `parent_student_relations`
  - `id` (uuid, primary key)
  - `parent_id` (uuid, references user_profiles)
  - `student_id` (uuid, references students)
  - `relationship` (text) - e.g., 'mother', 'father', 'guardian'
  - `created_at` (timestamptz)

  ### `announcements`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `content` (text, not null)
  - `author_id` (uuid, references user_profiles)
  - `target_roles` (text array) - which roles can see this
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `messages`
  - `id` (uuid, primary key)
  - `sender_id` (uuid, references user_profiles)
  - `recipient_id` (uuid, references user_profiles)
  - `subject` (text)
  - `content` (text, not null)
  - `read` (boolean, default false)
  - `created_at` (timestamptz)

  ### `schedules`
  - `id` (uuid, primary key)
  - `student_id` (uuid, references students)
  - `teacher_id` (uuid, references teachers)
  - `subject` (text, not null)
  - `day_of_week` (text, not null)
  - `start_time` (time, not null)
  - `end_time` (time, not null)
  - `room` (text)
  - `created_at` (timestamptz)

  ### `assignments`
  - `id` (uuid, primary key)
  - `teacher_id` (uuid, references teachers)
  - `title` (text, not null)
  - `description` (text)
  - `subject` (text)
  - `due_date` (timestamptz)
  - `grade_level` (text)
  - `section` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `assignment_submissions`
  - `id` (uuid, primary key)
  - `assignment_id` (uuid, references assignments)
  - `student_id` (uuid, references students)
  - `submission_text` (text)
  - `file_url` (text)
  - `grade` (numeric)
  - `submitted_at` (timestamptz)
  - `graded_at` (timestamptz)

  ### `files`
  - `id` (uuid, primary key)
  - `uploaded_by` (uuid, references user_profiles)
  - `file_name` (text, not null)
  - `file_url` (text, not null)
  - `file_type` (text)
  - `category` (text) - 'study_material', 'assignment', etc.
  - `target_grade` (text)
  - `target_section` (text)
  - `subject` (text)
  - `created_at` (timestamptz)

  ## 2. Security (Row Level Security)
  - Enable RLS on all tables
  - Restrictive policies based on user roles
  - Users can only view their own data unless authorized
  - Teachers can view/manage content for their classes
  - Parents can view their children's data
  - Students can view their own data and assigned content

  ## 3. Indexes
  - Added indexes on frequently queried columns for performance
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'parent', 'teacher', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  grade_level text NOT NULL,
  section text NOT NULL,
  student_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject text,
  department text,
  created_at timestamptz DEFAULT now()
);

-- Create parent-student relations table
CREATE TABLE IF NOT EXISTS parent_student_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  relationship text DEFAULT 'parent',
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  target_roles text[] DEFAULT ARRAY['student', 'parent', 'teacher'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject text,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  subject text NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  created_at timestamptz DEFAULT now()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject text,
  due_date timestamptz,
  grade_level text,
  section text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  submission_text text,
  file_url text,
  grade numeric(5,2),
  submitted_at timestamptz DEFAULT now(),
  graded_at timestamptz,
  UNIQUE(assignment_id, student_id)
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  category text DEFAULT 'study_material',
  target_grade text,
  target_section text,
  subject text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for students
CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  );

CREATE POLICY "Parents can view their children"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relations
      JOIN user_profiles ON user_profiles.id = parent_student_relations.parent_id
      WHERE parent_student_relations.student_id = students.id
      AND user_profiles.id = auth.uid()
    )
  );

-- RLS Policies for teachers
CREATE POLICY "Teachers can view own record"
  ON teachers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "All authenticated users can view teachers"
  ON teachers FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for parent_student_relations
CREATE POLICY "Parents can view their relations"
  ON parent_student_relations FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

-- RLS Policies for announcements
CREATE POLICY "Users can view announcements for their role"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = ANY(announcements.target_roles)
    )
  );

CREATE POLICY "Teachers and admins can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Authors can update own announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete own announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages sent to them"
  ON messages FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR sender_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- RLS Policies for schedules
CREATE POLICY "Students can view own schedule"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = schedules.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view schedules they teach"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.id = schedules.teacher_id
      AND teachers.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their children's schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relations
      WHERE parent_student_relations.student_id = schedules.student_id
      AND parent_student_relations.parent_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage schedules"
  ON schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  );

-- RLS Policies for assignments
CREATE POLICY "Students can view assignments for their grade and section"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND (
        assignments.grade_level IS NULL 
        OR students.grade_level = assignments.grade_level
      )
      AND (
        assignments.section IS NULL 
        OR students.section = assignments.section
      )
    )
  );

CREATE POLICY "Teachers can view all assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  );

CREATE POLICY "Parents can view assignments for their children's grade"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relations
      JOIN students ON students.id = parent_student_relations.student_id
      WHERE parent_student_relations.parent_id = auth.uid()
      AND (
        assignments.grade_level IS NULL 
        OR students.grade_level = assignments.grade_level
      )
      AND (
        assignments.section IS NULL 
        OR students.section = assignments.section
      )
    )
  );

CREATE POLICY "Teachers can manage assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
      AND (
        teachers.id = assignments.teacher_id
        OR assignments.teacher_id IS NULL
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teachers
      WHERE teachers.user_id = auth.uid()
    )
  );

-- RLS Policies for assignment_submissions
CREATE POLICY "Students can view own submissions"
  ON assignment_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = assignment_submissions.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view all submissions"
  ON assignment_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  );

CREATE POLICY "Parents can view their children's submissions"
  ON assignment_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relations
      WHERE parent_student_relations.student_id = assignment_submissions.student_id
      AND parent_student_relations.parent_id = auth.uid()
    )
  );

CREATE POLICY "Students can submit assignments"
  ON assignment_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = assignment_submissions.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can update own submissions"
  ON assignment_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = assignment_submissions.student_id
      AND students.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = assignment_submissions.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can grade submissions"
  ON assignment_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  );

-- RLS Policies for files
CREATE POLICY "Students can view files for their grade"
  ON files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.user_id = auth.uid()
      AND (
        files.target_grade IS NULL 
        OR students.grade_level = files.target_grade
      )
      AND (
        files.target_section IS NULL 
        OR students.section = files.target_section
      )
    )
  );

CREATE POLICY "Teachers can view all files"
  ON files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  );

CREATE POLICY "Parents can view files for their children"
  ON files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_student_relations
      JOIN students ON students.id = parent_student_relations.student_id
      WHERE parent_student_relations.parent_id = auth.uid()
      AND (
        files.target_grade IS NULL 
        OR students.grade_level = files.target_grade
      )
      AND (
        files.target_section IS NULL 
        OR students.section = files.target_section
      )
    )
  );

CREATE POLICY "Teachers can upload files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage own files"
  ON files FOR ALL
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent_id ON parent_student_relations(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student_id ON parent_student_relations(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_schedules_student ON schedules(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_grade_section ON assignments(grade_level, section);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_files_grade_section ON files(target_grade, target_section);