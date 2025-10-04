import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, GraduationCap, Users, BookOpen } from 'lucide-react';

interface SignUpProps {
  onToggleMode: () => void;
}

export default function SignUp({ onToggleMode }: SignUpProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'parent' | 'teacher' | ''>('');

  const [gradeLevel, setGradeLevel] = useState('');
  const [section, setSection] = useState('');
  const [studentId, setStudentId] = useState('');

  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRoleSelection = (selectedRole: 'student' | 'parent' | 'teacher') => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let additionalData = {};
    if (role === 'student') {
      additionalData = { gradeLevel, section, studentId };
    } else if (role === 'teacher') {
      additionalData = { subject, department };
    }

    const { error } = await signUp(email, password, fullName, role, additionalData);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Create Account</h2>
              <p className="text-center text-gray-600 mb-8">Select your role to get started</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleRoleSelection('student')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition-colors">
                      <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Student</h3>
                    <p className="text-sm text-gray-600 text-center">Access courses and assignments</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('parent')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition-colors">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Parent</h3>
                    <p className="text-sm text-gray-600 text-center">Monitor your child's progress</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('teacher')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all group"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-amber-100 p-4 rounded-full group-hover:bg-amber-200 transition-colors">
                      <BookOpen className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Teacher</h3>
                    <p className="text-sm text-gray-600 text-center">Manage classes and students</p>
                  </div>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={onToggleMode}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2 text-sm font-medium"
              >
                ← Back to role selection
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Complete Your {role?.charAt(0).toUpperCase() + role?.slice(1)} Profile
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="you@school.edu"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                  />
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                      </label>
                      <input
                        id="studentId"
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="STU001"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Level
                      </label>
                      <select
                        id="gradeLevel"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Grade</option>
                        {[9, 10, 11, 12].map((grade) => (
                          <option key={grade} value={grade.toString()}>
                            Grade {grade}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                        Section
                      </label>
                      <select
                        id="section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Section</option>
                        {['A', 'B', 'C', 'D'].map((sec) => (
                          <option key={sec} value={sec}>
                            Section {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {role === 'teacher' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Mathematics"
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        id="department"
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Science Department"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
