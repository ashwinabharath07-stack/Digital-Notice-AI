import { Search, SlidersHorizontal, X } from 'lucide-react';
import { NOTICE_CATEGORIES, NOTICE_PRIORITIES, CATEGORY_LABELS, PRIORITY_LABELS, DEPARTMENTS } from '@/lib/constants';
import type { NoticeCategory, NoticePriority } from '@/types';

export interface NoticeFilters {
  search: string;
  category: NoticeCategory | 'all';
  priority: NoticePriority | 'all';
  department: string | 'all';
  sort: 'newest' | 'oldest';
}

interface NoticeFilterBarProps {
  filters: NoticeFilters;
  onChange: (filters: NoticeFilters) => void;
  showDepartment?: boolean;
}

export default function NoticeFilterBar({ filters, onChange, showDepartment = true }: NoticeFilterBarProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.priority !== 'all' ||
    filters.department !== 'all';

  const update = (patch: Partial<NoticeFilters>) => onChange({ ...filters, ...patch });

  const reset = () =>
    onChange({ search: '', category: 'all', priority: 'all', department: 'all', sort: 'newest' });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Search notices by title or description..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mr-1">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        <select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value as NoticeFilters['category'] })}
          className="text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        >
          <option value="all">All Categories</option>
          {NOTICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => update({ priority: e.target.value as NoticeFilters['priority'] })}
          className="text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        >
          <option value="all">All Priorities</option>
          {NOTICE_PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>

        {showDepartment && (
          <select
            value={filters.department}
            onChange={(e) => update({ department: e.target.value })}
            className="text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}

        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as NoticeFilters['sort'] })}
          className="text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all ml-auto"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={reset}
            className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1 px-2 py-2 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export function filterNotices<T extends {
  title: string;
  description: string;
  category: NoticeCategory;
  priority: NoticePriority;
  department: string | null;
  created_at: string;
}>(notices: T[], filters: NoticeFilters): T[] {
  let result = [...notices];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (n) => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q),
    );
  }

  if (filters.category !== 'all') {
    result = result.filter((n) => n.category === filters.category);
  }

  if (filters.priority !== 'all') {
    result = result.filter((n) => n.priority === filters.priority);
  }

  if (filters.department !== 'all') {
    result = result.filter((n) => n.department === filters.department);
  }

  result.sort((a, b) => {
    const cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return filters.sort === 'newest' ? -cmp : cmp;
  });

  return result;
}
