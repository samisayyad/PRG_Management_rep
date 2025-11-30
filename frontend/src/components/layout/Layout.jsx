import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Columns3,
  Calendar,
  FolderKanban,
  BarChart3,
  Clock,
  Users,
  Settings,
  Bell,
  Plus,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  ChevronLeft,
  X
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/kanban', icon: Columns3, label: 'Kanban Board' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/time-tracking', icon: Clock, label: 'Time Tracking' },
  { path: '/team', icon: Users, label: 'Team' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.email || 'User';

  // Sidebar Component
  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <Link to="/dashboard" className={`flex items-center gap-2 justify-center w-full`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Columns3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">TaskFlow</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 font-medium group justify-start ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 group-hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto space-y-3">
        <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 rounded-xl justify-start">
          <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {getInitials(displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role === 'scrum_master' ? 'Scrum Master' : 'Employee'}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Sidebar - Right side */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-white via-white to-blue-50 border-l border-gray-100 flex-col fixed h-screen top-0 right-0 z-40 overflow-y-auto shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`bg-gradient-to-b from-white via-white to-blue-50 border-l border-gray-100 flex flex-col fixed h-screen top-0 right-0 z-40 overflow-y-auto shadow-lg transition-all duration-300 ease-in-out lg:hidden w-64 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-900">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:mr-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative flex-1 max-w-xl hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks, projects..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="hidden md:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium text-sm transform hover:scale-105">
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No new notifications
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                {getInitials(displayName)}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
