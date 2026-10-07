import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CalendarDays,
  Loader2,
  AlertCircle,
  Inbox,
  MapPin,
  Clock,
  User,
  Sparkles,
  PlusCircle,
  Trash2,
  X,
  Wand2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchEvents, createEvent, deleteEvent, getAISuggestedEvents } from '@/lib/events';
import type { CollegeEvent, EventType, EventInput, Profile } from '@/types';
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
  EVENT_TYPES,
  DEPARTMENTS,
} from '@/lib/constants';
import { formatDateTime, formatDate } from '@/lib/utils';

type FilterType = EventType | 'all';

export default function Events() {
  const { profile } = useAuth();
  const isFaculty = profile?.role === 'faculty';

  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filtered = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => e.event_type === filter);
  }, [events, filter]);

  const handleCreate = async (input: EventInput) => {
    if (!profile) return;
    setCreating(true);
    try {
      await createEvent(input, profile);
      await loadEvents();
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Events</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            College, inter-college, department & sports events
          </p>
        </div>
        {isFaculty && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAISuggestions(true)}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              AI Suggestions
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Post Event
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <FilterTab label="All Events" active={filter === 'all'} onClick={() => setFilter('all')} />
        {EVENT_TYPES.map((t) => (
          <FilterTab
            key={t}
            label={EVENT_TYPE_LABELS[t]}
            active={filter === t}
            onClick={() => setFilter(t)}
          />
        ))}
      </div>

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
          <p className="text-slate-600 font-medium">No events found</p>
          <p className="text-slate-400 text-sm mt-1">
            {events.length === 0 ? 'There are no events yet.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              canDelete={isFaculty && e.created_by === profile?.user_id}
              onDelete={() => handleDelete(e.id)}
            />
          ))}
        </div>
      )}

      {/* Create event modal */}
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          creating={creating}
          defaultDept={profile?.department ?? 'General'}
        />
      )}

      {/* AI suggestions modal */}
      {showAISuggestions && profile && (
        <AISuggestionsModal
          profile={profile}
          onClose={() => setShowAISuggestions(false)}
          onCreate={handleCreate}
          creating={creating}
        />
      )}
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function EventCard({
  event,
  canDelete,
  onDelete,
}: {
  event: CollegeEvent;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const isUpcoming = new Date(event.start_date).getTime() >= Date.now();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[event.event_type]}`}>
            {EVENT_TYPE_LABELS[event.event_type]}
          </span>
          {event.ai_suggested && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          )}
          {isUpcoming && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
              Upcoming
            </span>
          )}
        </div>

        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3 mb-3">{event.description}</p>

        <div className="space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDateTime(event.start_date)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.location}</span>
            </div>
          )}
          {event.department && (
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{event.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            <span>{event.created_by_name}</span>
          </div>
        </div>

        {canDelete && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={onDelete}
              className="text-xs font-semibold text-red-600 hover:text-red-800 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateEventModal({
  onClose,
  onCreate,
  creating,
  defaultDept,
  prefill,
}: {
  onClose: () => void;
  onCreate: (input: EventInput) => void;
  creating: boolean;
  defaultDept: string;
  prefill?: Partial<EventInput>;
}) {
  const [title, setTitle] = useState(prefill?.title ?? '');
  const [description, setDescription] = useState(prefill?.description ?? '');
  const [eventType, setEventType] = useState<EventType>(prefill?.event_type ?? 'college');
  const [department, setDepartment] = useState(prefill?.department ?? defaultDept);
  const [location, setLocation] = useState(prefill?.location ?? '');
  const [startDate, setStartDate] = useState(prefill?.start_date ?? '');
  const [endDate, setEndDate] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !startDate) {
      setErr('Title, description, and start date are required.');
      return;
    }
    onCreate({
      title: title.trim(),
      description: description.trim(),
      event_type: eventType,
      department: department || undefined,
      location: location || undefined,
      start_date: new Date(startDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Create Event</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {err && <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3"><AlertCircle className="w-4 h-4" />{err}</div>}
          <Field label="Title *">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Event title" />
          </Field>
          <Field label="Description *">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} placeholder="Event description" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={eventType} onChange={(e) => setEventType(e.target.value as EventType)} className={inputCls}>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
              </select>
            </Field>
            <Field label="Department">
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={inputCls}>
                <option value="">All departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Location">
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="e.g. Main Auditorium" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date & Time *">
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="End Date (optional)">
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              Create Event
            </button>
            <button type="button" onClick={onClose} className="text-sm text-slate-600 font-semibold px-4 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AISuggestionsModal({
  profile,
  onClose,
  onCreate,
  creating,
}: {
  profile: Profile;
  onClose: () => void;
  onCreate: (input: EventInput) => void;
  creating: boolean;
}) {
  const suggestions = useMemo(() => getAISuggestedEvents(profile), [profile]);
  const [selected, setSelected] = useState<typeof suggestions[0] | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            <h2 className="font-bold">AI Event Suggestions</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-600 mb-2">
            Based on the current season and your department, here are some recommended events:
          </p>
          {suggestions.map((s, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{s.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${EVENT_TYPE_COLORS[s.event_type]}`}>
                      {EVENT_TYPE_LABELS[s.event_type]}
                    </span>
                    {s.location && <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>}
                  </div>
                  <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    {s.reason}
                  </p>
                  <button
                    onClick={() => setSelected(s)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-800"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Use this suggestion
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <CreateEventModal
          onClose={() => setSelected(null)}
          onCreate={(input) => { onCreate(input); setSelected(null); }}
          creating={creating}
          defaultDept={profile.department}
          prefill={{
            title: selected.title,
            description: selected.description,
            event_type: selected.event_type,
            department: selected.department,
            location: selected.location,
          }}
        />
      )}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 bg-white text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
