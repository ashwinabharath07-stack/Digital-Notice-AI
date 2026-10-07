export type UserRole = 'student' | 'faculty' | 'parent';

export interface Profile {
  user_id: string;
  full_name: string;
  role: UserRole;
  department: string;
  phone?: string | null;
  created_at: string;
}

export type NoticeCategory =
  | 'general'
  | 'academic'
  | 'department'
  | 'exam'
  | 'sports'
  | 'event'
  | 'emergency'
  | 'placement';

export type NoticePriority = 'low' | 'medium' | 'high' | 'urgent';

export type TargetAudience =
  | 'all_students'
  | 'department_students'
  | 'faculty'
  | 'parents'
  | 'everyone';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  department: string | null;
  priority: NoticePriority;
  posted_by: string;
  posted_by_name: string;
  posted_by_role: string;
  target_audience: TargetAudience;
  attachment_url: string | null;
  attachment_name: string | null;
  expiry_date: string | null;
  event_id: string | null;
  created_at: string;
  updated_at: string;
}

export type EventType = 'college' | 'inter_college' | 'department' | 'sports';

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  department: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  created_by: string;
  created_by_name: string;
  ai_suggested: boolean;
  created_at: string;
}

export interface NoticeInput {
  title: string;
  description: string;
  category: NoticeCategory;
  department?: string;
  priority: NoticePriority;
  target_audience: TargetAudience;
  attachment_url?: string | null;
  attachment_name?: string | null;
  expiry_date?: string | null;
  event_id?: string | null;
}

export interface EventInput {
  title: string;
  description: string;
  event_type: EventType;
  department?: string;
  location?: string;
  start_date: string;
  end_date?: string | null;
}
