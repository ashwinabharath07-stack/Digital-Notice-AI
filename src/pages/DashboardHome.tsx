import { useEffect, useState, useCallback } from 'react';
import { Bell, CalendarDays, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchNoticesForUser } from '@/lib/notices';
import { fetchUpcomingEvents } from '@/lib/events';
import type { Notice, CollegeEvent } from '@/types';
import NoticeCard from '@/components/NoticeCard';
import NoticeDetailsModal from '@/components/NoticeDetailsModal';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { UserRole } from '@/types';

interface DashboardHomeProps {
  role: UserRole;
}

export default function DashboardHome({ role }: DashboardHomeProps) {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const loadData = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const [n, e] = await Promise.all([
        fetchNoticesForUser(profile),
        fetchUpcomingEvents(),
      ]);
      setNotices(n);
      setEvents(e);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!profile) return null;

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const urgentNotices = notices.filter((n) => n.priority === 'urgent' || n.priority === 'high');
  const latestNotices = notices.slice(0, 5);
  const departmentEvents = events.filter((e) => e.department === profile.department);
  const sportsEvents = events.filter((e) => e.event_type === 'sports');
  const collegeEvents = events.filter((e) => e.event_type === 'college' || e.event_type === 'inter_college');

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-blue-300 text-sm mb-1">{greeting},</p>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome, {roleLabel}</h1>
          <p className="text-slate-300 text-sm lg:text-base">
            {profile.full_name} · {profile.department}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/notices"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
            >
              <Bell className="w-4 h-4" />
              View All Notices
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
            >
              <CalendarDays className="w-4 h-4" />
              View Events
            </Link>
            {role === 'faculty' && (
              <Link
                to="/notices/create"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                Create Notice
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total Notices" value={notices.length} color="bg-blue-50 text-blue-700 border-blue-200" icon={Bell} />
        <StatCard label="Priority Notices" value={urgentNotices.length} color="bg-orange-50 text-orange-700 border-orange-200" icon={AlertCircle} />
        <StatCard label="Upcoming Events" value={events.length} color="bg-teal-50 text-teal-700 border-teal-200" icon={CalendarDays} />
        <StatCard label="Dept Events" value={departmentEvents.length} color="bg-indigo-50 text-indigo-700 border-indigo-200" icon={CalendarDays} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Notices */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Latest Notices</h2>
              <Link to="/notices" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                View all →
              </Link>
            </div>
            {latestNotices.length === 0 ? (
              <EmptyState icon={Inbox} message="No notices yet" />
            ) : (
              <div className="space-y-3">
                {latestNotices.map((n) => (
                  <NoticeCard key={n.id} notice={n} onView={setSelectedNotice} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events sidebar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Upcoming Events</h2>
              <Link to="/events" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                View all →
              </Link>
            </div>
            {events.length === 0 ? (
              <EmptyState icon={CalendarDays} message="No upcoming events" />
            ) : (
              <div className="space-y-2">
                {events.slice(0, 5).map((e) => (
                  <Link
                    key={e.id}
                    to="/events"
                    className="block bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[e.event_type]}`}>
                        {EVENT_TYPE_LABELS[e.event_type]}
                      </span>
                      {e.ai_suggested && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                          AI
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{e.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(e.start_date)} {e.location && `· ${e.location}`}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {/* Event type quick links */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Browse by Type</h3>
              <div className="space-y-2">
                <EventLinkRow label="College Events" count={collegeEvents.length} to="/events" />
                <EventLinkRow label="Department Events" count={departmentEvents.length} to="/events" />
                <EventLinkRow label="Sports Events" count={sportsEvents.length} to="/events" />
              </div>
            </div>
          </div>
        </div>
      )}

      <NoticeDetailsModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: typeof Bell;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl lg:text-3xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80 mt-1">{label}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Bell; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-xl border border-slate-200">
      <Icon className="w-10 h-10 text-slate-300 mb-2" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}

function EventLinkRow({ label, count, to }: { label: string; count: number; to: string }) {
  return (
    <Link to={to} className="flex items-center justify-between text-sm hover:bg-slate-50 rounded-lg p-2 transition-colors">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800">{count}</span>
    </Link>
  );
}
