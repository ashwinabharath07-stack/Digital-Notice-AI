import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  UserCog,
  Users,
  LayoutDashboard,
  Bell,
  CalendarDays,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  icon: typeof Bell;
  path: string;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/student' },
    { label: 'Notices', icon: Bell, path: '/notices' },
    { label: 'Events', icon: CalendarDays, path: '/events' },
  ],
  faculty: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/faculty' },
    { label: 'Notices', icon: Bell, path: '/notices' },
    { label: 'Create Notice', icon: PlusCircle, path: '/notices/create' },
    { label: 'My Notices', icon: Bell, path: '/notices/mine' },
    { label: 'Events', icon: CalendarDays, path: '/events' },
  ],
  parent: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/parent' },
    { label: 'Notices', icon: Bell, path: '/notices' },
    { label: 'Events', icon: CalendarDays, path: '/events' },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  parent: 'Parent',
};

const ROLE_ICONS: Record<UserRole, typeof Users> = {
  student: GraduationCap,
  faculty: UserCog,
  parent: Users,
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'bg-blue-600',
  faculty: 'bg-teal-600',
  parent: 'bg-indigo-600',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!profile) return null;

  const role = profile.role;
  const navItems = NAV_BY_ROLE[role];
  const RoleIcon = ROLE_ICONS[role];
  const roleColor = ROLE_COLORS[role];
  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => {
    if (path === `/dashboard/${role}`) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — desktop */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm">EduNotice Pro</h1>
            <p className="text-slate-400 text-xs">Campus Portal</p>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      active
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User card */}
        <div className="border-t border-slate-700/50 p-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50">
            <div className={`w-10 h-10 ${roleColor} rounded-full flex items-center justify-center text-sm font-bold shrink-0`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{profile.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{profile.department}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button
            className="lg:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${roleColor} rounded-lg flex items-center justify-center`}>
              <RoleIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700 hidden sm:block">
              {ROLE_LABELS[role]} Portal
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{profile.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
            <div className={`w-9 h-9 ${roleColor} rounded-full flex items-center justify-center text-sm font-bold text-white`}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
