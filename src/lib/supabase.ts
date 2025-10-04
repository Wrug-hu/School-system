import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  grade_level: string;
  section: string;
  student_id: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  subject?: string;
  department?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  target_roles: UserRole[];
  created_at: string;
  updated_at: string;
  author?: UserProfile;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: UserProfile;
  recipient?: UserProfile;
}

export interface Schedule {
  id: string;
  student_id: string;
  teacher_id?: string;
  subject: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room?: string;
  created_at: string;
  teacher?: Teacher;
}

export interface Assignment {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  subject?: string;
  due_date?: string;
  grade_level?: string;
  section?: string;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  file_url?: string;
  grade?: number;
  submitted_at: string;
  graded_at?: string;
}

export interface FileResource {
  id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  category?: string;
  target_grade?: string;
  target_section?: string;
  subject?: string;
  created_at: string;
  uploader?: UserProfile;
}
