import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  UserCog,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Loader2,
  AlertCircle,
  BookOpen,
  CalendarDays,
  BellRing,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { DEPARTMENTS } from '@/lib/constants';

const ROLES: { value: UserRole; label: string; icon: typeof Users; desc: string }[] = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Access notices, events & department updates' },
  { value: 'faculty', label: 'Faculty', icon: UserCog, desc: 'Post & manage notices, create events' },
  { value: 'parent', label: 'Parent', icon: Users, desc: 'Track college notices & event updates' },
];

export default function Login() {
  const { signIn, signUp, session, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && profile) {
      navigate(`/dashboard/${profile.role}`, { replace: true });
    }
  }, [session, profile, navigate]);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (mode === 'signup' && !fullName) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      // Auth state change will handle redirect
    } else {
      const { error: err } = await signUp(email, password, fullName, role, department);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      // After signup, sign in automatically
      const { error: signInErr } = await signIn(email, password);
      if (signInErr) {
        setError(signInErr);
        setLoading(false);
        return;
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Left panel — branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EduNotice Pro</h1>
              <p className="text-blue-300 text-sm">Digital Notice & Event Management</p>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            AI-Powered College<br />Notice Priority System
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-md">
            Streamline campus communication with priority-based notices, role-based access, and intelligent event management.
          </p>

          <div className="grid grid-cols-1 gap-3 max-w-md">
            {[
              { icon: BellRing, text: 'Priority-based notice management' },
              { icon: CalendarDays, text: 'AI-powered event suggestions' },
              { icon: BookOpen, text: 'Role-specific dashboards' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-slate-200">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-400 text-sm mt-8">
          © {new Date().getFullYear()} EduNotice Pro. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === 'signin'
                ? 'Sign in to access your dashboard'
                : 'Register to join the campus portal'}
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const active = role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-semibold">{r.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2">{ROLES.find((r) => r.value === role)?.desc}</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 bg-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900"
                  placeholder="you@college.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
