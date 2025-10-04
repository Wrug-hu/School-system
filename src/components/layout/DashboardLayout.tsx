import { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LogOut,
  Menu,
  X,
  Home,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  BookOpen,
  Users,
  Upload
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentNavItems = [
    { icon: Home, label: 'Dashboard', href: '#dashboard' },
    { icon: Calendar, label: 'Schedule', href: '#schedule' },
    { icon: FileText, label: 'Assignments', href: '#assignments' },
    { icon: BookOpen, label: 'Study Materials', href: '#materials' },
    { icon: MessageSquare, label: 'Messages', href: '#messages' },
    { icon: Bell, label: 'Announcements', href: '#announcements' },
  ];

  const teacherNavItems = [
    { icon: Home, label: 'Dashboard', href: '#dashboard' },
    { icon: FileText, label: 'Assignments', href: '#assignments' },
    { icon: Upload, label: 'Upload Files', href: '#upload' },
    { icon: Calendar, label: 'Schedules', href: '#schedules' },
    { icon: Users, label: 'Students', href: '#students' },
    { icon: MessageSquare, label: 'Messages', href: '#messages' },
    { icon: Bell, label: 'Announcements', href: '#announcements' },
  ];

  const parentNavItems = [
    { icon: Home, label: 'Dashboard', href: '#dashboard' },
    { icon: Users, label: 'My Children', href: '#children' },
    { icon: Calendar, label: 'Schedule', href: '#schedule' },
    { icon: FileText, label: 'Assignments', href: '#assignments' },
    { icon: MessageSquare, label: 'Messages', href: '#messages' },
    { icon: Bell, label: 'Announcements', href: '#announcements' },
  ];

  const navItems = profile?.role === 'student'
    ? studentNavItems
    : profile?.role === 'teacher'
    ? teacherNavItems
    : parentNavItems;

  const roleColors = {
    student: 'bg-blue-600',
    teacher: 'bg-amber-600',
    parent: 'bg-green-600',
    admin: 'bg-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
        sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">School Portal</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full ${roleColors[profile?.role || 'student']} flex items-center justify-center text-white font-semibold`}>
                {profile?.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className="flex items-center space-x-3 px-4 py-3 w-full text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-xl font-semibold text-gray-800 capitalize">
              {profile?.role} Dashboard
            </h1>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:inline">{profile?.email}</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
