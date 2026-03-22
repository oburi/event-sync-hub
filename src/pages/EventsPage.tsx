import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, Clock, CheckCircle2, FileEdit, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mockEvents } from "@/lib/mock-data";
import { formatLocalDate } from "@/lib/utils";

interface DbEvent {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  location: string | null;
  status: string;
}

export default function EventsPage() {
  const [dbEvents, setDbEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("id, name, date, time, location, status")
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
      status: e.status,
      isDb: true,
    })),
    ...mockEvents.map(e => ({
      id: e.id,
      name: e.name,
      date: e.date,
      time: e.time,
      location: e.location,
      status: e.status,
      isDb: false,
    })),
  ];

  return (
    <div className="p-5 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-foreground">Events</h1>
        <div className="flex gap-2">
          <Link to="/events/import">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9">
              <Upload className="h-3.5 w-3.5" />
              Import
            </Button>
          </Link>
          <Link to="/events/import">
            <Button size="sm" className="gap-1.5 rounded-xl h-9">
              <Plus className="h-3.5 w-3.5" />
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : allEvents.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-xl text-foreground mb-2">No events yet</p>
          <p className="text-[14px] text-muted-foreground">Import or create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {allEvents.map(event => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <div className="card-elevated group cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center">
                    <Calendar className="h-[18px] w-[18px] text-primary" />
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-foreground">{event.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-[13px] text-muted-foreground">
                      <span>{formatLocalDate(event.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.time}</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-badge ${
                    event.status === 'published' ? 'status-badge-success' :
                    event.status === 'completed' ? 'status-badge-neutral' : 'status-badge-info'
                  }`}>
                    {event.status === 'published' && <CheckCircle2 className="h-3 w-3" />}
                    {event.status === 'draft' && <FileEdit className="h-3 w-3" />}
                    {event.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
