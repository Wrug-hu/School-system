import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Assignment, FileResource } from '../../lib/supabase';
import { FileText, Upload, Users, Calendar, Plus, X } from 'lucide-react';
import AnnouncementBoard from '../shared/AnnouncementBoard';
import MessageCenter from '../shared/MessageCenter';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [files, setFiles] = useState<FileResource[]>([]);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'files' | 'create'>('overview');

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    due_date: '',
    grade_level: '',
    section: '',
  });

  const [showFileForm, setShowFileForm] = useState(false);
  const [newFile, setNewFile] = useState({
    file_name: '',
    file_url: '',
    subject: '',
    category: 'study_material',
    target_grade: '',
    target_section: '',
  });

  useEffect(() => {
    if (user) {
      loadTeacherData();
    }
  }, [user]);

  const loadTeacherData = async () => {
    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (teacher) {
        setTeacherData(teacher);

        const { data: assignmentData } = await supabase
          .from('assignments')
          .select('*')
          .eq('teacher_id', teacher.id)
          .order('created_at', { ascending: false });

        const { data: fileData } = await supabase
          .from('files')
          .select('*')
          .eq('uploaded_by', user?.id)
          .order('created_at', { ascending: false });

        setAssignments(assignmentData || []);
        setFiles(fileData || []);
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('assignments').insert({
        teacher_id: teacherData.id,
        ...newAssignment,
        grade_level: newAssignment.grade_level || null,
        section: newAssignment.section || null,
      });

      if (error) throw error;

      setShowAssignmentForm(false);
      setNewAssignment({
        title: '',
        description: '',
        subject: '',
        due_date: '',
        grade_level: '',
        section: '',
      });
      loadTeacherData();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('files').insert({
        uploaded_by: user?.id,
        ...newFile,
        target_grade: newFile.target_grade || null,
        target_section: newFile.target_section || null,
      });

      if (error) throw error;

      setShowFileForm(false);
      setNewFile({
        file_name: '',
        file_url: '',
        subject: '',
        category: 'study_material',
        target_grade: '',
        target_section: '',
      });
      loadTeacherData();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Teacher Dashboard</h2>
        <p className="opacity-90">
          {teacherData?.subject && `${teacherData.subject}`}
          {teacherData?.department && ` - ${teacherData.department}`}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {['overview', 'assignments', 'files', 'create'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50'
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
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-8 h-8 text-amber-600" />
                    <span className="text-2xl font-bold text-amber-700">{assignments.length}</span>
                  </div>
                  <p className="text-sm font-medium text-amber-900">Total Assignments</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Upload className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-700">{files.length}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-900">Uploaded Files</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-700">-</span>
                  </div>
                  <p className="text-sm font-medium text-green-900">Active Students</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Recent Assignments
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
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-600" />
                    Recent Files
                  </h3>
                  <div className="space-y-3">
                    {files.slice(0, 5).map((file) => (
                      <div
                        key={file.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <h4 className="font-semibold text-gray-800">{file.file_name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {file.category}
                          </span>
                          {file.subject && (
                            <span className="text-xs text-gray-600">{file.subject}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">All Assignments</h3>
                <button
                  onClick={() => setShowAssignmentForm(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Assignment
                </button>
              </div>

              {showAssignmentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Create New Assignment</h3>
                      <button
                        onClick={() => setShowAssignmentForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newAssignment.title}
                          onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newAssignment.description}
                          onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                          </label>
                          <input
                            type="text"
                            value={newAssignment.subject}
                            onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={newAssignment.due_date}
                            onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade Level
                          </label>
                          <select
                            value={newAssignment.grade_level}
                            onChange={(e) => setNewAssignment({ ...newAssignment, grade_level: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">All Grades</option>
                            {[9, 10, 11, 12].map((grade) => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section
                          </label>
                          <select
                            value={newAssignment.section}
                            onChange={(e) => setNewAssignment({ ...newAssignment, section: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">All Sections</option>
                            {['A', 'B', 'C', 'D'].map((sec) => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                        >
                          Create Assignment
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAssignmentForm(false)}
                          className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-5 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <h4 className="font-semibold text-gray-800 text-lg">{assignment.title}</h4>
                    <p className="text-gray-700 mt-2">{assignment.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      {assignment.subject && <span>{assignment.subject}</span>}
                      {assignment.grade_level && <span>Grade {assignment.grade_level}</span>}
                      {assignment.section && <span>Section {assignment.section}</span>}
                      {assignment.due_date && (
                        <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No assignments created yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Uploaded Files</h3>
                <button
                  onClick={() => setShowFileForm(true)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Upload File
                </button>
              </div>

              {showFileForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Upload New File</h3>
                      <button
                        onClick={() => setShowFileForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleUploadFile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File Name
                        </label>
                        <input
                          type="text"
                          value={newFile.file_name}
                          onChange={(e) => setNewFile({ ...newFile, file_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File URL
                        </label>
                        <input
                          type="url"
                          value={newFile.file_url}
                          onChange={(e) => setNewFile({ ...newFile, file_url: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject
                          </label>
                          <input
                            type="text"
                            value={newFile.subject}
                            onChange={(e) => setNewFile({ ...newFile, subject: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            value={newFile.category}
                            onChange={(e) => setNewFile({ ...newFile, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="study_material">Study Material</option>
                            <option value="assignment">Assignment</option>
                            <option value="reference">Reference</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade Level
                          </label>
                          <select
                            value={newFile.target_grade}
                            onChange={(e) => setNewFile({ ...newFile, target_grade: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">All Grades</option>
                            {[9, 10, 11, 12].map((grade) => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section
                          </label>
                          <select
                            value={newFile.target_section}
                            onChange={(e) => setNewFile({ ...newFile, target_section: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="">All Sections</option>
                            {['A', 'B', 'C', 'D'].map((sec) => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFileForm(false)}
                          className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-5 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{file.file_name}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {file.category}
                          </span>
                          {file.subject && <span className="text-gray-600">{file.subject}</span>}
                          {file.target_grade && <span className="text-gray-600">Grade {file.target_grade}</span>}
                          {file.target_section && <span className="text-gray-600">Section {file.target_section}</span>}
                        </div>
                      </div>
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No files uploaded yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setActiveTab('assignments');
                    setShowAssignmentForm(true);
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-left"
                >
                  <FileText className="w-10 h-10 text-amber-600 mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Create Assignment</h4>
                  <p className="text-sm text-gray-600">Post a new assignment for your students</p>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('files');
                    setShowFileForm(true);
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <Upload className="w-10 h-10 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Upload Files</h4>
                  <p className="text-sm text-gray-600">Share study materials with students</p>
                </button>
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
