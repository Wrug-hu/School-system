import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Schedule, Assignment, AssignmentSubmission, FileResource } from '../../lib/supabase';
import { Calendar, FileText, BookOpen, Award, Clock } from 'lucide-react';
import AnnouncementBoard from '../shared/AnnouncementBoard';
import MessageCenter from '../shared/MessageCenter';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'assignments' | 'materials'>('overview');

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (student) {
        setStudentData(student);

        const { data: scheduleData } = await supabase
          .from('schedules')
          .select('*, teacher:teachers(*)')
          .eq('student_id', student.id)
          .order('day_of_week')
          .order('start_time');

        const { data: assignmentData } = await supabase
          .from('assignments')
          .select('*, teacher:teachers(*)')
          .or(`grade_level.eq.${student.grade_level},grade_level.is.null`)
          .or(`section.eq.${student.section},section.is.null`)
          .order('due_date');

        const { data: submissionData } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('student_id', student.id);

        const { data: fileData } = await supabase
          .from('files')
          .select('*, uploader:user_profiles(*)')
          .or(`target_grade.eq.${student.grade_level},target_grade.is.null`)
          .or(`target_section.eq.${student.section},target_section.is.null`)
          .order('created_at', { ascending: false });

        setSchedules(scheduleData || []);
        setAssignments(assignmentData || []);
        setSubmissions(submissionData || []);
        setFiles(fileData || []);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(s => s.assignment_id === assignmentId);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="opacity-90">
          Grade {studentData?.grade_level} - Section {studentData?.section} | Student ID: {studentData?.student_id}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {['overview', 'schedule', 'assignments', 'materials'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-700">{assignments.length}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-900">Total Assignments</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-700">{submissions.length}</span>
                  </div>
                  <p className="text-sm font-medium text-green-900">Submitted</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-700">
                      {assignments.length - submissions.length}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-amber-900">Pending</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Recent Assignments
                  </h3>
                  <div className="space-y-3">
                    {assignments.slice(0, 5).map((assignment) => {
                      const submission = getSubmissionForAssignment(assignment.id);
                      return (
                        <div
                          key={assignment.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                            {submission && (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                Submitted
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{assignment.subject}</p>
                          {assignment.due_date && (
                            <p className="text-xs text-gray-500">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Today's Schedule
                  </h3>
                  <div className="space-y-3">
                    {schedules
                      .filter(s => s.day_of_week === daysOfWeek[new Date().getDay() - 1])
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{schedule.subject}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {schedule.start_time} - {schedule.end_time}
                              </p>
                              {schedule.room && (
                                <p className="text-xs text-gray-500 mt-1">Room: {schedule.room}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Weekly Schedule</h3>
              {daysOfWeek.map((day) => (
                <div key={day} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-semibold text-blue-900">{day}</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {schedules
                      .filter(s => s.day_of_week === day)
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800">{schedule.subject}</h5>
                            {schedule.room && (
                              <p className="text-sm text-gray-600 mt-1">Room: {schedule.room}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">
                              {schedule.start_time} - {schedule.end_time}
                            </p>
                          </div>
                        </div>
                      ))}
                    {schedules.filter(s => s.day_of_week === day).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No classes scheduled</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">All Assignments</h3>
              <div className="space-y-3">
                {assignments.map((assignment) => {
                  const submission = getSubmissionForAssignment(assignment.id);
                  return (
                    <div
                      key={assignment.id}
                      className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{assignment.subject}</p>
                        </div>
                        {submission ? (
                          <div className="text-right">
                            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                              Submitted
                            </span>
                            {submission.grade && (
                              <p className="text-sm font-semibold text-gray-800 mt-2">
                                Grade: {submission.grade}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-700 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      {assignment.description && (
                        <p className="text-gray-700 mb-3">{assignment.description}</p>
                      )}
                      {assignment.due_date && (
                        <p className="text-sm text-gray-600">
                          Due Date: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  );
                })}
                {assignments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No assignments available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Study Materials
              </h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{file.file_name}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                          {file.subject && <span>{file.subject}</span>}
                          {file.category && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {file.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Uploaded: {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No study materials available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnnouncementBoard />
        <MessageCenter />
      </div>
    </div>
  );
}
