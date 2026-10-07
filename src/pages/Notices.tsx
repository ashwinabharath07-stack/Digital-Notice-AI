import { useEffect, useState, useCallback, useMemo } from 'react';
import { Bell, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchNoticesForUser } from '@/lib/notices';
import type { Notice } from '@/types';
import NoticeCard from '@/components/NoticeCard';
import NoticeDetailsModal from '@/components/NoticeDetailsModal';
import NoticeFilterBar, { filterNotices, type NoticeFilters } from '@/components/NoticeFilterBar';

export default function Notices() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [filters, setFilters] = useState<NoticeFilters>({
    search: '',
    category: 'all',
    priority: 'all',
    department: 'all',
    sort: 'newest',
  });

  const loadNotices = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const data = await fetchNoticesForUser(profile);
      setNotices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const filtered = useMemo(() => filterNotices(notices, filters), [notices, filters]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notices</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {profile?.role === 'faculty'
              ? 'View all college notices'
              : 'Browse all notices relevant to you'}
          </p>
        </div>
      </div>

      <NoticeFilterBar filters={filters} onChange={setFilters} showDepartment={profile?.role !== 'parent'} />

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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200">
          <Inbox className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No notices found</p>
          <p className="text-slate-400 text-sm mt-1">
            {notices.length === 0
              ? 'There are no notices available yet.'
              : 'Try adjusting your filters or search terms.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Showing {filtered.length} of {notices.length} notices
          </p>
          {filtered.map((n) => (
            <NoticeCard key={n.id} notice={n} onView={setSelectedNotice} />
          ))}
        </div>
      )}

      <NoticeDetailsModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  );
}
