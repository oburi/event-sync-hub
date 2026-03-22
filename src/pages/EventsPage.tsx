import { Link } from "react-router-dom";
import { Plus, Calendar, Clock, CheckCircle2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockEvents } from "@/lib/mock-data";

export default function EventsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Link to="/events/import">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Event
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {mockEvents.map(event => (
          <Link key={event.id} to={`/events/${event.id}`}>
            <div className="card-elevated group cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{event.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
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
    </div>
  );
}
