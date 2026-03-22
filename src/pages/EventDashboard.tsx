import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Users, AlertTriangle, FileText,
  ExternalLink, RefreshCw, Edit3, Eye, CheckCircle2, Info, Loader2, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mockEvents, mockSources, mockTasks, mockTimeline, mockConflicts, mockTeam } from "@/lib/mock-data";
import ConflictDrawer from "@/components/ConflictDrawer";
import { NotionLogo } from "@/components/icons/NotionLogo";
import { GoogleDocsLogo } from "@/components/icons/GoogleDocsLogo";
import type { Event, Task, TimelineItem, Source, TeamMember } from "@/lib/mock-data";

const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

interface RawPlan {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  tasks?: {
    title: string;
    description?: string;
    assignedRole?: string;
    time?: string | null;
    location?: string | null;
  }[];
  contacts?: {
    name: string;
    role?: string;
    email?: string | null;
    phone?: string | null;
  }[];
}

function parseRawContent(raw: string | null): RawPlan | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RawPlan;
  } catch {
    return null;
  }
}

function buildTimelineFromPlan(plan: RawPlan): TimelineItem[] {
  const tasks = plan.tasks || [];
  const withTime = tasks.filter(t => t.time).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const withoutTime = tasks.filter(t => !t.time);
  const sorted = [...withTime, ...withoutTime];
  return sorted.map((t, i) => ({
    id: `plan-${i}`,
    eventId: "",
    time: t.time || "TBD",
    title: t.title,
    description: t.description || "",
    assigneeNames: t.assignedRole ? [t.assignedRole] : [],
    status: "upcoming" as const,
  }));
}

function buildTasksFromPlan(plan: RawPlan): Task[] {
  return (plan.tasks || []).map((t, i) => ({
    id: `task-${i}`,
    eventId: "",
    title: t.title,
    description: t.description || "",
    assigneeName: t.assignedRole || undefined,
    time: t.time || undefined,
    location: t.location || undefined,
    status: "pending" as const,
  }));
}

function buildSourceFromEvent(dbEvent: { source_type?: string | null; source_url?: string | null; updated_at: string }): Source[] {
  if (!dbEvent.source_type) return [];
  const typeMap: Record<string, Source["type"]> = {
    google_doc: "google_doc",
    pdf: "pdf",
    notion: "notion",
  };
  return [{
    id: "src-1",
    eventId: "",
    type: typeMap[dbEvent.source_type] || "manual",
    name: dbEvent.source_type === "google_doc" ? "Google Doc" : dbEvent.source_type === "pdf" ? "Uploaded PDF" : dbEvent.source_type === "notion" ? "Notion Page" : "Manual",
    url: dbEvent.source_url || undefined,
    lastFetched: new Date(dbEvent.updated_at).toLocaleString(),
    status: "synced",
  }];
}

function buildContactsFromPlan(plan: RawPlan): TeamMember[] {
  const roles = new Map<string, string>();
  for (const t of plan.tasks || []) {
    if (t.assignedRole && !roles.has(t.assignedRole)) {
      roles.set(t.assignedRole, t.assignedRole);
    }
  }
  return Array.from(roles.entries()).map(([role], i) => ({
    id: `contact-${i}`,
    name: role,
    role: "Assigned Role",
    email: "",
    phone: "",
    availability: "Available",
  }));
}

export default function EventDashboard() {
  const { id } = useParams();
  const [showConflicts, setShowConflicts] = useState(false);
  const [dbEvent, setDbEvent] = useState<(Event & { raw_content?: string | null; source_type?: string | null; source_url?: string | null; updated_at_raw?: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (id && isUUID(id)) {
      setLoading(true);
      supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          if (data) {
            setIsImported(!!data.raw_content);
            setDbEvent({
              id: data.id,
              name: data.name,
              date: data.date || new Date().toISOString().split('T')[0],
              time: data.time || 'TBD',
              location: data.location || 'TBD',
              description: data.description || '',
              status: (data.status as Event['status']) || 'draft',
              lastUpdated: new Date(data.updated_at).toLocaleDateString(),
              conflicts: 0,
              missingInfo: 0,
              volunteersCount: 0,
              raw_content: data.raw_content,
              source_type: data.source_type,
              source_url: data.source_url,
              updated_at_raw: data.updated_at,
            });
          }
          setLoading(false);
        });
    }
  }, [id]);

  const event = dbEvent || mockEvents.find(e => e.id === id) || mockEvents[0];
  const plan = useMemo(() => parseRawContent(dbEvent?.raw_content ?? null), [dbEvent?.raw_content]);

  const timeline = isImported && plan ? buildTimelineFromPlan(plan) : mockTimeline;
  const tasks = isImported && plan ? buildTasksFromPlan(plan) : mockTasks;
  const sources = isImported && dbEvent ? buildSourceFromEvent({ source_type: dbEvent.source_type, source_url: dbEvent.source_url, updated_at: dbEvent.updated_at_raw || new Date().toISOString() }) : mockSources;
  const contacts = isImported && plan ? buildContactsFromPlan(plan) : mockTeam.slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`status-badge ${event.status === 'published' ? 'status-badge-success' : 'status-badge-info'}`}>
              {event.status}
            </span>
            <span className="text-xs text-muted-foreground">Updated {event.lastUpdated}</span>
          </div>
          <h1 className="text-2xl font-semibold">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{event.time}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isImported && event.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={publishing}
              onClick={async () => {
                setPublishing(true);
                const { error } = await supabase
                  .from('events')
                  .update({ status: 'published' })
                  .eq('id', id!);
                setPublishing(false);
                if (error) {
                  toast.error("Failed to publish: " + error.message);
                } else {
                  toast.success("Event published!");
                  setDbEvent(prev => prev ? { ...prev, status: 'published' } : prev);
                }
              }}
            >
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Publish
            </Button>
          )}
          <Link to={`/events/${event.id}/volunteer-editor`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Volunteer View
            </Button>
          </Link>
          <Link to={`/events/${event.id}/edit`}>
            <Button size="sm" className="gap-1.5">
              <Edit3 className="h-3.5 w-3.5" />
              Edit Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {(event.conflicts > 0 || event.missingInfo > 0) && (
        <div className="flex flex-wrap gap-2">
          {event.conflicts > 0 && (
            <button onClick={() => setShowConflicts(true)} className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-warning hover:bg-warning/10 transition-colors">
              <AlertTriangle className="h-4 w-4" />
              {event.conflicts} source conflicts
            </button>
          )}
          {event.missingInfo > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <Info className="h-4 w-4" />
              {event.missingInfo} missing details
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <div className="card-elevated">
            <h2 className="section-title mb-3">AI-Generated Summary</h2>
            <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
            <Button variant="ghost" size="sm" className="mt-2 text-xs gap-1 text-muted-foreground">
              <Edit3 className="h-3 w-3" /> Edit summary
            </Button>
          </div>

          {/* Timeline / Run of Show */}
          <div className="card-elevated">
            <h2 className="section-title mb-4">Run of Show</h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No timeline items extracted.</p>
            ) : (
              <div className="space-y-0">
                {timeline.map((item, i) => (
                  <div key={item.id} className="flex gap-3 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={item.status === 'now' ? 'timeline-dot-now' : item.status === 'past' ? 'timeline-dot-done' : 'timeline-dot-upcoming'} />
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 -mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
                        {item.status === 'now' && <span className="status-badge-info text-[10px]">NOW</span>}
                      </div>
                      <p className="text-sm font-medium text-foreground mt-0.5">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.assigneeNames.map(name => (
                          <span key={name} className="text-[10px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Responsibilities */}
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Responsibilities</h2>
              <Button variant="ghost" size="sm" className="text-xs">+ Add</Button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks extracted.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {task.assigneeName && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{task.assigneeName}</span>}
                        {task.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{task.time}</span>}
                        {task.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{task.location}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Sources */}
          <div className="card-elevated">
            <h2 className="section-title mb-3">Connected Sources</h2>
            {sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sources connected.</p>
            ) : (
              <div className="space-y-2">
                {sources.map(source => (
                  <div key={source.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <div className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium ${
                      source.type === 'notion' ? 'bg-foreground/5' :
                      source.type === 'google_doc' ? 'bg-blue-50 text-blue-600' :
                      source.type === 'pdf' ? 'bg-red-50 text-red-600' :
                      'bg-muted'
                    }`}>
                      {source.type === 'notion' ? <NotionLogo className="h-4 w-4" /> : source.type === 'google_doc' ? <GoogleDocsLogo className="h-4 w-4" /> : source.type === 'pdf' ? <FileText className="h-4 w-4" /> : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{source.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${source.status === 'synced' ? 'bg-emerald-500' : source.status === 'stale' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className="text-[10px] text-muted-foreground">{source.lastFetched}</span>
                      </div>
                    </div>
                    {source.url && (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-muted transition-colors">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Key Contacts */}
          <div className="card-elevated">
            <h2 className="section-title mb-3">Key Contacts</h2>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts identified.</p>
            ) : (
              <div className="space-y-2">
                {contacts.map(member => (
                  <div key={member.id} className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConflictDrawer open={showConflicts} onClose={() => setShowConflicts(false)} conflicts={mockConflicts} />
    </div>
  );
}