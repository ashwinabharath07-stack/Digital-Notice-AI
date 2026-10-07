import { Bell, Calendar, Building2, User, Paperclip, Clock, AlertTriangle } from 'lucide-react';
import type { Notice } from '@/types';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  PRIORITY_LABELS,
  PRIORITY_BADGES,
  PRIORITY_BORDER,
  AUDIENCE_LABELS,
} from '@/lib/constants';
import { formatDate, timeAgo, isExpired } from '@/lib/utils';

interface NoticeCardProps {
  notice: Notice;
  onView: (notice: Notice) => void;
  canManage?: boolean;
  onEdit?: (notice: Notice) => void;
  onDelete?: (notice: Notice) => void;
}

export default function NoticeCard({ notice, onView, canManage, onEdit, onDelete }: NoticeCardProps) {
  const expired = isExpired(notice.expiry_date);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 border-l-4 ${PRIORITY_BORDER[notice.priority]} p-4 lg:p-5 hover:shadow-md transition-shadow cursor-pointer group ${
        expired ? 'opacity-60' : ''
      }`}
      onClick={() => onView(notice)}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_BADGES[notice.priority]}`}>
              {notice.priority === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {PRIORITY_LABELS[notice.priority].toUpperCase()}
            </span>
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[notice.category]}`}>
              {CATEGORY_LABELS[notice.category]}
            </span>
            {expired && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 border border-slate-300">
                EXPIRED
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
            {notice.title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{notice.description}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <User className="w-3.5 h-3.5" />
          {notice.posted_by_name}
        </span>
        {notice.department && (
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {notice.department}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo(notice.created_at)}
        </span>
        {notice.expiry_date && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Expires {formatDate(notice.expiry_date)}
          </span>
        )}
        {notice.attachment_url && (
          <span className="flex items-center gap-1 text-blue-600">
            <Paperclip className="w-3.5 h-3.5" />
            Attachment
          </span>
        )}
        <span className="flex items-center gap-1">
          <Bell className="w-3.5 h-3.5" />
          {AUDIENCE_LABELS[notice.target_audience]}
        </span>
      </div>

      {canManage && (onEdit || onDelete) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              onClick={() => onEdit(notice)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(notice)}
              className="text-xs font-semibold text-red-600 hover:text-red-800 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
