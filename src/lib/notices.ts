import { supabase } from '@/lib/supabase';
import type { Notice, NoticeInput, Profile } from '@/types';

function shouldSeeNotice(
  notice: Notice,
  profile: Profile,
): boolean {
  // Expired notices are hidden
  if (notice.expiry_date && new Date(notice.expiry_date).getTime() < Date.now()) {
    return false;
  }

  switch (notice.target_audience) {
    case 'everyone':
      return true;
    case 'all_students':
      return profile.role === 'student' || profile.role === 'faculty' || profile.role === 'parent';
    case 'department_students':
      return (
        (profile.role === 'student' || profile.role === 'parent') &&
        notice.department === profile.department
      ) || profile.role === 'faculty';
    case 'faculty':
      return profile.role === 'faculty';
    case 'parents':
      return profile.role === 'parent' || profile.role === 'faculty';
    default:
      return true;
  }
}

export async function fetchNotices(): Promise<Notice[]> {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Notice[]) ?? [];
}

export async function fetchNoticesForUser(profile: Profile): Promise<Notice[]> {
  const all = await fetchNotices();
  return all.filter((n) => shouldSeeNotice(n, profile));
}

export async function fetchMyNotices(userId: string): Promise<Notice[]> {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('posted_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Notice[]) ?? [];
}

export async function createNotice(input: NoticeInput, profile: Profile): Promise<Notice> {
  const { data, error } = await supabase
    .from('notices')
    .insert({
      title: input.title,
      description: input.description,
      category: input.category,
      department: input.department ?? null,
      priority: input.priority,
      target_audience: input.target_audience,
      attachment_url: input.attachment_url ?? null,
      attachment_name: input.attachment_name ?? null,
      expiry_date: input.expiry_date ?? null,
      event_id: input.event_id ?? null,
      posted_by: profile.user_id,
      posted_by_name: profile.full_name,
      posted_by_role: profile.role,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Notice;
}

export async function updateNotice(id: string, input: Partial<NoticeInput>): Promise<Notice> {
  const { data, error } = await supabase
    .from('notices')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Notice;
}

export async function deleteNotice(id: string): Promise<void> {
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) throw error;
}
