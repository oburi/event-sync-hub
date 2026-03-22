import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, MapPin, Phone, Bell, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mockEvents, mockTimeline, mockVolunteerView, mockTeam } from "@/lib/mock-data";
import type { Event } from "@/lib/mock-data";
import { formatLocalDate } from "@/lib/utils";

const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

interface PlanTask {
  title: string;
  description?: string;
  assignedRole?: string;
  time?: string | null;
  location?: string | null;
}

interface RawPlan {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  tasks?: PlanTask[];
}

export default function VolunteerView() {
  const { eventId } = useParams();
  const [dbEvent, setDbEvent] = useState<(Event & { raw_content?: string | null }) | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId && isUUID(eventId)) {
      setLoading(true);
      supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single()
        .then(({ data }) => {
          if (data) {
            setDbEvent({
              id: data.id,
              name: data.name,
              date: data.date || new Date().toISOString().split("T")[0],
              time: data.time || "TBD",
              location: data.location || "TBD",
              description: data.description || "",
              status: (data.status as Event["status"]) || "draft",
              lastUpdated: new Date(data.updated_at).toLocaleDateString(),
              conflicts: 0,
              missingInfo: 0,
              volunteersCount: 0,
              raw_content: data.raw_content,
            });
          }
          setLoading(false);
        });
    }
  }, [eventId]);

  const event = dbEvent || mockEvents.find((e) => e.id === eventId) || mockEvents[0];
  const plan: RawPlan | null = useMemo(() => {
    if (!dbEvent?.raw_content) return null;
    try { return JSON.parse(dbEvent.raw_content); } catch { return null; }
  }, [dbEvent?.raw_content]);

  const isImported = !!plan;

  // Build data from plan or fallback to mock
  const tasks = isImported
    ? (plan.tasks || []).filter((t) => t.time).sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    : null;
  const tasksNoTime = isImported ? (plan.tasks || []).filter((t) => !t.time) : null;
  const allTasks = tasks && tasksNoTime ? [...tasks, ...tasksNoTime] : null;

  const nowItem = isImported ? null : mockTimeline.find((t) => t.status === "now");
  const upcomingItems = isImported
    ? allTasks?.slice(0, 5) || []
    : mockTimeline.filter((t) => t.status === "upcoming").slice(0, 3);

  const responsibilities = isImported
    ? (plan.tasks || []).map((t, i) => ({ id: `r-${i}`, content: t.title, time: t.time || undefined, description: t.description }))
    : mockVolunteerView.filter((i) => i.type === "responsibility");

  const changes = isImported ? [] : mockVolunteerView.filter((i) => i.type === "change");
  const logistics = isImported
    ? [
        ...(event.location !== "TBD" ? [{ id: "loc", content: `📍 Location: ${event.location}` }] : []),
        ...(event.time !== "TBD" ? [{ id: "time", content: `🕐 Time: ${event.time}` }] : []),
      ]
    : mockVolunteerView.filter((i) => i.type === "logistics" || i.type === "note");

  // Extract first assigned role as "organizer" for emergency contact
  const orgRole = isImported ? (plan.tasks || []).find((t) => t.assignedRole?.toLowerCase().includes("coordinator"))?.assignedRole || "Coordinator" : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary-foreground/80" />
          <span className="text-xs font-medium text-primary-foreground/80">Syncra</span>
        </div>
        <h1 className="text-xl font-semibold text-primary-foreground">{event.name}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-primary-foreground/70">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatLocalDate(event.date, { weekday: "short", month: "short", day: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-4 pb-8 max-w-lg mx-auto">
        {/* What Changed */}
        {changes.length > 0 && (
          <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-warning" />
              <span className="text-xs font-semibold text-warning uppercase tracking-wider">What Changed</span>
              <span className="ml-auto h-5 w-5 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-[10px] font-bold">{changes.length}</span>
            </div>
            {changes.map((item) => (
              <p key={item.id} className="text-sm text-foreground">{item.content}</p>
            ))}
          </div>
        )}

        {/* Now */}
        {nowItem && (
          <div className="rounded-xl bg-card border shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="timeline-dot-now" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Happening Now</span>
            </div>
            <p className="text-base font-semibold text-foreground">{nowItem.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{nowItem.description}</p>
            <span className="text-xs text-muted-foreground mt-2 block">{nowItem.time}</span>
          </div>
        )}

        {/* Your Responsibilities */}
        <div className="rounded-xl bg-card border shadow-sm p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Responsibilities</h2>
          {responsibilities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No responsibilities assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {responsibilities.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-primary/30 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.content}</p>
                    {item.time && <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>}
                    {"description" in item && item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description as string}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Up */}
        <div className="rounded-xl bg-card border shadow-sm p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Coming Up</h2>
          {upcomingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming items.</p>
          ) : (
            <div className="space-y-3">
              {isImported
                ? upcomingItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                        {(item as PlanTask).time || "TBD"}
                      </span>
                      <div className="timeline-dot-upcoming shrink-0" />
                      <p className="text-sm text-foreground">{(item as PlanTask).title}</p>
                    </div>
                  ))
                : (upcomingItems as typeof mockTimeline).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">{item.time}</span>
                      <div className="timeline-dot-upcoming shrink-0" />
                      <p className="text-sm text-foreground">{item.title}</p>
                    </div>
                  ))}
            </div>
          )}
        </div>

        {/* Logistics */}
        {logistics.length > 0 && (
          <div className="rounded-xl bg-card border shadow-sm p-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Logistics & Notes</h2>
            <div className="space-y-2">
              {logistics.map((item) => (
                <p key={item.id} className="text-sm text-foreground">{item.content}</p>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="rounded-xl bg-card border shadow-sm p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Emergency Contact</h2>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {isImported ? orgRole?.charAt(0) || "C" : "SC"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{isImported ? orgRole || "Coordinator" : "Sarah Chen"}</p>
              <p className="text-xs text-muted-foreground">Event Organizer</p>
            </div>
            <a href="tel:5551234567" className="ml-auto p-2 rounded-full bg-primary/10 text-primary">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
