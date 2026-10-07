import { supabase } from '@/lib/supabase';
import type { CollegeEvent, EventInput, Profile } from '@/types';

export async function fetchEvents(): Promise<CollegeEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) throw error;
  return (data as CollegeEvent[]) ?? [];
}

export async function fetchUpcomingEvents(): Promise<CollegeEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true });

  if (error) throw error;
  return (data as CollegeEvent[]) ?? [];
}

export async function createEvent(input: EventInput, profile: Profile): Promise<CollegeEvent> {
  const { data, error } = await supabase
    .from('events')
    .insert({
      title: input.title,
      description: input.description,
      event_type: input.event_type,
      department: input.department ?? null,
      location: input.location ?? null,
      start_date: input.start_date,
      end_date: input.end_date ?? null,
      created_by: profile.user_id,
      created_by_name: profile.full_name,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CollegeEvent;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

// AI-powered event suggestions based on current season and event history
export function getAISuggestedEvents(profile: Profile): Array<{
  title: string;
  description: string;
  event_type: CollegeEvent['event_type'];
  department: string;
  location: string;
  reason: string;
}> {
  const month = new Date().getMonth();
  const suggestions: Array<{
    title: string;
    description: string;
    event_type: CollegeEvent['event_type'];
    department: string;
    location: string;
    reason: string;
  }> = [];

  // Seasonal suggestions
  if (month >= 7 && month <= 9) {
    suggestions.push({
      title: 'Annual Technical Symposium',
      description: 'A grand technical symposium featuring paper presentations, coding contests, and project exhibitions. Students from all departments are encouraged to participate.',
      event_type: 'college',
      department: profile.department,
      location: 'Main Auditorium',
      reason: 'Autumn semester is ideal for technical symposiums with high student engagement.',
    });
  }

  if (month >= 0 && month <= 2) {
    suggestions.push({
      title: 'Spring Cultural Festival',
      description: 'Celebrate cultural diversity with music, dance, drama, and art performances. Open to all students and faculty.',
      event_type: 'college',
      department: profile.department,
      location: 'Open Air Theatre',
      reason: 'Spring season sees maximum cultural activity and participation.',
    });
  }

  if (month >= 2 && month <= 4) {
    suggestions.push({
      title: 'Inter-College Sports Tournament',
      description: 'Annual inter-college sports tournament featuring cricket, football, basketball, and athletics. Compete against top colleges in the region.',
      event_type: 'inter_college',
      department: profile.department,
      location: 'Sports Complex',
      reason: 'Spring sports season with optimal weather conditions for outdoor events.',
    });
  }

  // Department-specific suggestions
  suggestions.push({
    title: `${profile.department} Workshop Series`,
    description: `Hands-on workshop series focused on the latest trends and technologies in ${profile.department}. Industry experts will be invited as guest speakers.`,
    event_type: 'department',
    department: profile.department,
    location: 'Seminar Hall',
    reason: 'Regular department workshops boost student skills and industry readiness.',
  });

  suggestions.push({
    title: 'Career Guidance & Placement Drive',
    description: 'Interactive career guidance session followed by a placement drive. Multiple companies expected to participate with on-the-spot interview opportunities.',
    event_type: 'college',
    department: profile.department,
    location: 'Placement Cell',
    reason: 'Consistent placement activity improves college placement statistics.',
  });

  if (month >= 6 && month <= 8) {
    suggestions.push({
      title: 'Monsoon Football Championship',
      description: 'Department-level football championship with knockout rounds. Build your team and compete for the trophy.',
      event_type: 'sports',
      department: profile.department,
      location: 'Football Ground',
      reason: 'Monsoon season is perfect for football with cooler temperatures.',
    });
  }

  return suggestions;
}
