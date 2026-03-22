import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { volunteerEvents } from "@/lib/volunteer-data";

export default function VolunteerEventsPage() {
  const active = volunteerEvents.filter((e) => e.status !== "completed");
  const past = volunteerEvents.filter((e) => e.status === "completed");

  return (
    <div className="p-5 sm:p-8 max-w-2xl mx-auto space-y-7 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-foreground">My Events</h1>
        <p className="text-[15px] text-muted-foreground mt-1.5">
          Events you're volunteering for.
        </p>
      </div>

      {/* Active events */}
      <section>
        <p className="section-title mb-3">
          Upcoming ({active.length})
        </p>
        <div className="space-y-2.5">
          {active.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Past events */}
      {past.length > 0 && (
        <section>
          <p className="section-title mb-3">
            Past ({past.length})
          </p>
          <div className="space-y-2.5 opacity-60">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventCard({ event }: { event: typeof volunteerEvents[0] }) {
  const taskCount = event.tasks.length;
  const completedCount = event.tasks.filter((t) => t.status === "completed").length;

  return (
    <Link
      to={`/volunteer/event/${event.id}`}
      className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 hover:shadow-[0_4px_12px_-2px_hsl(230_15%_15%/0.08)] transition-shadow"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="text-[15px] font-semibold text-foreground truncate">{event.name}</h3>
          {event.changesCount > 0 && (
            <Badge className="bg-warning/10 text-warning border-0 text-[10px] px-1.5 py-0 shrink-0">
              {event.changesCount} updates
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {event.dateLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {event.time}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5" />
          {event.location}
        </div>

        <div className="flex items-center gap-2.5 mt-2.5">
          <Badge variant="secondary" className="text-[11px] font-medium border-0 px-2.5 py-0.5 rounded-lg">
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
          </Badge>
          {completedCount > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {completedCount}/{taskCount} done
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
    </Link>
  );
}
