import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, Loader2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatLocalDate } from "@/lib/utils";

interface PlanTask {
  title: string;
  description?: string;
  assignedRole?: string;
  assignedVolunteer?: string;
  time?: string | null;
  location?: string | null;
}

interface EventWithTasks {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  location: string | null;
  status: string;
  tasks: PlanTask[];
}

export default function VolunteerDashboard() {
  const [events, setEvents] = useState<EventWithTasks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("date", { ascending: true })
      .then(({ data }) => {
        if (data) {
          const parsed: EventWithTasks[] = data
            .map((e) => {
              let tasks: PlanTask[] = [];
              if (e.raw_content) {
                try {
                  const plan = JSON.parse(e.raw_content);
                  tasks = (plan.tasks || []).filter(
                    (t: PlanTask) => t.assignedVolunteer
                  );
                } catch {}
              }
              return {
                id: e.id,
                name: e.name,
                date: e.date,
                time: e.time,
                location: e.location,
                status: e.status,
                tasks,
              };
            })
            .filter((e) => e.tasks.length > 0);
          setEvents(parsed);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Volunteer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Published events with volunteer assignments.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No volunteer assignments yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Assign volunteers to tasks in the event editor, then publish the event.
          </p>
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="card-elevated space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{event.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {event.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatLocalDate(event.date!, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  {event.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
              <Link
                to={`/volunteer/event/${event.id}`}
                className="text-xs text-primary hover:underline flex items-center gap-0.5"
              >
                View <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Assigned Tasks ({event.tasks.length})
              </h3>
              {event.tasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="h-5 w-5 rounded-full border-2 border-primary/30 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Users className="h-3 w-3" />
                        {task.assignedVolunteer}
                      </span>
                      {task.assignedRole && (
                        <span className="text-muted-foreground">({task.assignedRole})</span>
                      )}
                      {task.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.time}
                        </span>
                      )}
                      {task.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {task.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
