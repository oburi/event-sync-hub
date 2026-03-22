import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, AlertTriangle, Clock, Plus, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mockEvents } from "@/lib/mock-data";

interface DbEvent {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  location: string | null;
  status: string;
  description: string | null;
  updated_at: string;
}

export default function HomePage() {
  const [dbEvents, setDbEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("id, name, date, time, location, status, description, updated_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDbEvents(data || []);
        setLoading(false);
      });
  }, []);

  const allEvents = [
    ...dbEvents.map(e => ({
      id: e.id,
      name: e.name,
      date: e.date || new Date().toISOString().split("T")[0],
      time: e.time || "TBD",
      location: e.location || "TBD",
      status: e.status as "draft" | "published" | "completed",
      description: e.description || "",
      lastUpdated: new Date(e.updated_at).toLocaleDateString(),
      conflicts: 0,
      missingInfo: 0,
      volunteersCount: 0,
    })),
    ...mockEvents,
  ];

  const needsReview = mockEvents.filter(e => e.conflicts > 0 || e.missingInfo > 0);
  const upcoming = allEvents.filter(e => e.status !== 'completed');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Welcome back, Sarah</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your events.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/events/import">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Import Event
            </Button>
          </Link>
        </div>
      </div>

      {needsReview.length > 0 && (
        <section>
          <h2 className="section-title mb-3">Needs Review</h2>
          <div className="space-y-2">
            {needsReview.map(event => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <div className="card-elevated flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.conflicts > 0 && `${event.conflicts} conflicts`}
                        {event.conflicts > 0 && event.missingInfo > 0 && ' · '}
                        {event.missingInfo > 0 && `${event.missingInfo} missing details`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title mb-3">Upcoming Events</h2>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map(event => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <div className="card-elevated group cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{event.name}</span>
                    </div>
                    <span className={`status-badge ${event.status === 'published' ? 'status-badge-success' : 'status-badge-neutral'}`}>
                      {event.status === 'published' ? <CheckCircle2 className="h-3 w-3" /> : null}
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{event.location}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <span>{event.volunteersCount} volunteers</span>
                    <span>Updated {event.lastUpdated}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
