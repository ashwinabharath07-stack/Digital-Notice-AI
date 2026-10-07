import { X, User, Building2, Calendar, Clock, Bell, Paperclip, Download, AlertTriangle, Tag, Target } from 'lucide-react';
import type { Notice } from '@/types';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  PRIORITY_LABELS,
  PRIORITY_BADGES,
  PRIORITY_DOT,
  AUDIENCE_LABELS,
} from '@/lib/constants';
import { formatDateTime, formatDate, isExpired } from '@/lib/utils';

interface NoticeDetailsModalProps {
  notice: Notice | null;
  onClose: () => void;
}

export default function NoticeDetailsModal({ notice, onClose }: NoticeDetailsModalProps) {
  if (!notice) return null;

  const expired = isExpired(notice.expiry_date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${PRIORITY_BADGES[notice.priority]}`}>
                {notice.priority === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
                {PRIORITY_LABELS[notice.priority].toUpperCase()}
              </span>
              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[notice.category]}`}>
                {CATEGORY_LABELS[notice.category]}
              </span>
              {expired && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300">
                  EXPIRED
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{notice.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-1.5 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Description */}
          <div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{notice.description}</p>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={User} label="Posted by" value={`${notice.posted_by_name} (${notice.posted_by_role})`} />
            <InfoRow icon={Tag} label="Category" value={CATEGORY_LABELS[notice.category]} />
            <InfoRow
              icon={AlertTriangle}
              label="Priority"
              value={PRIORITY_LABELS[notice.priority]}
              indicator={<span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[notice.priority]}`} />}
            />
            <InfoRow icon={Target} label="Target Audience" value={AUDIENCE_LABELS[notice.target_audience]} />
            {notice.department && <InfoRow icon={Building2} label="Department" value={notice.department} />}
            <InfoRow icon={Clock} label="Posted on" value={formatDateTime(notice.created_at)} />
            {notice.expiry_date && (
              <InfoRow icon={Calendar} label="Expires on" value={formatDate(notice.expiry_date)} />
            )}
          </div>

          {/* Attachment */}
          {notice.attachment_url && (
            <a
              href={notice.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                <Paperclip className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900 truncate">
                  {notice.attachment_name || 'Download attachment'}
                </p>
                <p className="text-xs text-blue-600">Click to download</p>
              </div>
              <Download className="w-5 h-5 text-blue-600 shrink-0" />
            </a>
          )}

          {/* Audience indicator */}
          <div className="flex items-center gap-2 text-sm text-slate-500 pt-2 border-t border-slate-100">
            <Bell className="w-4 h-4" />
            <span>This notice was sent to: <strong className="text-slate-700">{AUDIENCE_LABELS[notice.target_audience]}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  indicator,
}: {
  icon: typeof User;
  label: string;
  value: string;
  indicator?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
          {indicator}
          {value}
        </p>
      </div>
    </div>
  );
}
