import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Schedule, Assignment, Student } from '../../lib/supabase';
import { Users, Calendar, FileText, BookOpen } from 'lucide-react';
import AnnouncementBoard from '../shared/AnnouncementBoard';
import MessageCenter from '../shared/MessageCenter';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<(Student & { user_profiles?: any })[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'assignments'>('overview');

  useEffect(() => {
    if (user) {
      loadParentData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild);
    }
  }, [selectedChild]);

  const loadParentData = async () => {
    try {
      const { data: relations } = await supabase
        .from('parent_student_relations')
        .select(`
          student_id,
          students (
            id,
            user_id,
            grade_level,
            section,
            student_id,
            user_profiles (
              full_name,
              email
            )
          )
        `)
        .eq('parent_id', user?.id);

      if (relations && relations.length > 0) {
        const childrenData = relations.map(r => r.students).filter(Boolean);
        setChildren(childrenData as any);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading parent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (studentId: string) => {
    try {
      const child = children.find(c => c.id === studentId);
      if (!child) return;

      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*, teacher:teachers(*)')
        .eq('student_id', studentId)
        .order('day_of_week')
        .order('start_time');

      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*, teacher:teachers(*)')
        .or(`grade_level.eq.${child.grade_level},grade_level.is.null`)
        .or(`section.eq.${child.section},section.is.null`)
        .order('due_date');

      setSchedules(scheduleData || []);
      setAssignments(assignmentData || []);
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const selectedChildData = children.find(c => c.id === selectedChild);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Children Linked</h3>
        <p className="text-gray-600">Please contact the school administrator to link your child's account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Parent Dashboard</h2>
        <p className="opacity-90">Monitor your child's academic progress</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          My Children
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedChild === child.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-lg">
                  {child.user_profiles?.full_name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">
                    {child.user_profiles?.full_name || 'Student'}
                  </h4>
                  <p className="text-sm text-gray-600">ID: {child.student_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Grade {child.grade_level}</span>
                <span>•</span>
                <span>Section {child.section}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedChildData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['overview', 'schedule', 'assignments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
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
                      <Calendar className="w-8 h-8 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-700">{schedules.length}</span>
                    </div>
                    <p className="text-sm font-medium text-blue-900">Weekly Classes</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <FileText className="w-8 h-8 text-green-600" />
                      <span className="text-2xl font-bold text-green-700">{assignments.length}</span>
                    </div>
                    <p className="text-sm font-medium text-green-900">Active Assignments</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <BookOpen className="w-8 h-8 text-amber-600" />
                      <span className="text-2xl font-bold text-amber-700">-</span>
                    </div>
                    <p className="text-sm font-medium text-amber-900">Average Grade</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-green-600" />
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
                            <h4 className="font-semibold text-gray-800">{schedule.subject}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {schedule.start_time} - {schedule.end_time}
                            </p>
                            {schedule.room && (
                              <p className="text-xs text-gray-500 mt-1">Room: {schedule.room}</p>
                            )}
                          </div>
                        ))}
                      {schedules.filter(s => s.day_of_week === daysOfWeek[new Date().getDay() - 1]).length === 0 && (
                        <p className="text-gray-500 text-center py-8">No classes today</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Upcoming Assignments
                    </h3>
                    <div className="space-y-3">
                      {assignments.slice(0, 5).map((assignment) => (
                        <div
                          key={assignment.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{assignment.subject}</p>
                          {assignment.due_date && (
                            <p className="text-xs text-gray-500 mt-2">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                      {assignments.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No assignments</p>
                      )}
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
                    <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-semibold text-green-900">{day}</h4>
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
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">{assignment.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{assignment.subject}</p>
                        </div>
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
                  ))}
                  {assignments.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No assignments available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnnouncementBoard />
        <MessageCenter />
      </div>
    </div>
  );
}
