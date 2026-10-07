import type { NoticeCategory, NoticePriority, TargetAudience, EventType } from '@/types';

export const CATEGORY_LABELS: Record<NoticeCategory, string> = {
  general: 'General',
  academic: 'Academic',
  department: 'Department',
  exam: 'Exam',
  sports: 'Sports',
  event: 'Event',
  emergency: 'Emergency',
  placement: 'Placement',
};

export const CATEGORY_COLORS: Record<NoticeCategory, string> = {
  general: 'bg-slate-100 text-slate-700 border-slate-200',
  academic: 'bg-blue-100 text-blue-700 border-blue-200',
  department: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  exam: 'bg-amber-100 text-amber-700 border-amber-200',
  sports: 'bg-green-100 text-green-700 border-green-200',
  event: 'bg-pink-100 text-pink-700 border-pink-200',
  emergency: 'bg-red-100 text-red-700 border-red-200',
  placement: 'bg-teal-100 text-teal-700 border-teal-200',
};

export const PRIORITY_LABELS: Record<NoticePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_BADGES: Record<NoticePriority, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-600 text-white border-red-700',
};

export const PRIORITY_BORDER: Record<NoticePriority, string> = {
  low: 'border-l-slate-300',
  medium: 'border-l-yellow-400',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-600',
};

export const PRIORITY_DOT: Record<NoticePriority, string> = {
  low: 'bg-slate-400',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-600',
};

export const AUDIENCE_LABELS: Record<TargetAudience, string> = {
  all_students: 'All Students',
  department_students: 'Department Students',
  faculty: 'Faculty',
  parents: 'Parents',
  everyone: 'Everyone',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  college: 'College Event',
  inter_college: 'Inter-College Event',
  department: 'Department Event',
  sports: 'Sports Event',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  college: 'bg-blue-100 text-blue-700 border-blue-200',
  inter_college: 'bg-purple-100 text-purple-700 border-purple-200',
  department: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  sports: 'bg-green-100 text-green-700 border-green-200',
};

export const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Business Administration',
  'General',
];

export const NOTICE_CATEGORIES = Object.keys(CATEGORY_LABELS) as NoticeCategory[];
export const NOTICE_PRIORITIES = Object.keys(PRIORITY_LABELS) as NoticePriority[];
export const TARGET_AUDIENCES = Object.keys(AUDIENCE_LABELS) as TargetAudience[];
export const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[];
