import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createNotice } from '@/lib/notices';
import {
  NOTICE_CATEGORIES,
  NOTICE_PRIORITIES,
  TARGET_AUDIENCES,
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  AUDIENCE_LABELS,
  DEPARTMENTS,
} from '@/lib/constants';
import type { NoticeCategory, NoticePriority, TargetAudience } from '@/types';

export default function CreateNotice() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('general');
  const [department, setDepartment] = useState<string>(profile?.department ?? 'General');
  const [priority, setPriority] = useState<NoticePriority>('medium');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('everyone');
  const [expiryDate, setExpiryDate] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Notice title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Notice description is required.');
      return;
    }

    if (!profile) {
      setError('You must be logged in to create a notice.');
      return;
    }

    setLoading(true);
    try {
      await createNotice(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          department: department || undefined,
          priority,
          target_audience: targetAudience,
          expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
          attachment_url: attachmentUrl || null,
          attachment_name: attachmentName || null,
        },
        profile,
      );
      setSuccess(true);
      setTimeout(() => navigate('/notices/mine'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Notice</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Post a new notice to the campus portal
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Notice created successfully! Redirecting to your notices...</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Notice Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900"
            placeholder="e.g. Mid-Semester Exam Schedule Released"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Description / Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={5000}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 resize-y"
            placeholder="Enter the full notice content..."
          />
          <p className="text-xs text-slate-400 mt-1">{description.length}/5000 characters</p>
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoticeCategory)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 bg-white"
            >
              {NOTICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NoticePriority)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 bg-white"
            >
              {NOTICE_PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Department & Target Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 bg-white"
            >
              <option value="">No specific department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 bg-white"
            >
              {TARGET_AUDIENCES.map((a) => (
                <option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Expiry Date <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900"
          />
          <p className="text-xs text-slate-400 mt-1">Notice will be hidden after this date</p>
        </div>

        {/* Attachment URL */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Attachment Link <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="url"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="sm:col-span-2 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900"
              placeholder="https://example.com/document.pdf"
            />
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900"
              placeholder="Display name"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading || success}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? 'Publishing...' : 'Publish Notice'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/notices')}
            className="text-sm text-slate-600 hover:text-slate-900 font-semibold px-4 py-2.5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
