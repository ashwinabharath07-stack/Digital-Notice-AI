import { useEffect, useState, useCallback, useMemo } from 'react';
import { Bell, Loader2, AlertCircle, Inbox, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchMyNotices, deleteNotice } from '@/lib/notices';
import type { Notice } from '@/types';
import NoticeCard from '@/components/NoticeCard';
import NoticeDetailsModal from '@/components/NoticeDetailsModal';
import NoticeFilterBar, { filterNotices, type NoticeFilters } from '@/components/NoticeFilterBar';

export default function MyNotices() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
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
      const data = await fetchMyNotices(profile.user_id);
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

  const handleDelete = async (notice: Notice) => {
    if (!confirm(`Delete "${notice.title}"? This action cannot be undone.`)) return;
    setDeleting(notice.id);
    try {
      await deleteNotice(notice.id);
      setNotices((prev) => prev.filter((n) => n.id !== notice.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notice');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Notices</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage notices you have created</p>
        </div>
        <Link
          to="/notices/create"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Create Notice
        </Link>
      </div>

      <NoticeFilterBar filters={filters} onChange={setFilters} />

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
          <p className="text-slate-600 font-medium">
            {notices.length === 0 ? 'You haven\'t created any notices yet' : 'No notices match your filters'}
          </p>
          {notices.length === 0 && (
            <Link
              to="/notices/create"
              className="mt-3 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Create your first notice
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Showing {filtered.length} of {notices.length} notices
          </p>
          {filtered.map((n) => (
            <div key={n.id} className={deleting === n.id ? 'opacity-50 pointer-events-none' : ''}>
              <NoticeCard
                notice={n}
                onView={setSelectedNotice}
                canManage
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <NoticeDetailsModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
    </div>
  );
}
