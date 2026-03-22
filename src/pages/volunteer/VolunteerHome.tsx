import { Calendar, Clock, MapPin, ArrowRight, Bell, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { currentVolunteer, volunteerEvents, volunteerNotifications } from "@/lib/volunteer-data";
import { cn } from "@/lib/utils";

export default function VolunteerHome() {
  const unreadCount = volunteerNotifications.filter((n) => !n.read).length;
  const nextEvent = volunteerEvents.find((e) => e.status !== "completed");
  const allTasks = volunteerEvents.flatMap((e) => e.tasks);
  const nextTask = allTasks.find((t) => t.status === "upcoming" || t.status === "updated");
  const latestChange = volunteerNotifications.find((n) => n.type === "change" && !n.read);

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Hey, {currentVolunteer.firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's what's coming up for you.
        </p>
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Next event */}
        {nextEvent && (
          <Link
            to={`/volunteer/event/${nextEvent.id}`}
            className="rounded-xl border border-border bg-card p-3.5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Next Event</span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug truncate">{nextEvent.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{nextEvent.dateLabel}</p>
          </Link>
        )}

        {/* Next task */}
        {nextTask && (
          <div className="rounded-xl border border-border bg-card p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Next Task</span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug truncate">{nextTask.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{nextTask.time}</p>
          </div>
        )}

        {/* Updates */}
        <Link
          to="/notifications"
          className="rounded-xl border border-border bg-card p-3.5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center",
              unreadCount > 0 ? "bg-[hsl(var(--warning))]/10" : "bg-secondary"
            )}>
              <Bell className={cn("h-3.5 w-3.5", unreadCount > 0 ? "text-[hsl(var(--warning))]" : "text-muted-foreground")} />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Updates</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {unreadCount > 0 ? `${unreadCount} new` : "All caught up"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unreadCount > 0 ? "Tap to review" : "No new updates"}
          </p>
        </Link>

        {/* Team */}
        <Link
          to="/team"
          className="rounded-xl border border-border bg-card p-3.5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Team</span>
          </div>
          <p className="text-sm font-semibold text-foreground">Your contacts</p>
          <p className="text-xs text-muted-foreground mt-0.5">Organizers & teammates</p>
        </Link>
      </div>

      {/* Latest change alert */}
      {latestChange && (
        <div className="rounded-xl border border-[hsl(var(--warning))]/20 bg-[hsl(var(--warning))]/5 p-3.5">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-[hsl(var(--warning))]/10 flex items-center justify-center shrink-0">
              <Bell className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[hsl(var(--warning))] uppercase tracking-wide mb-0.5">Recent Change</p>
              <p className="text-sm text-foreground leading-snug">{latestChange.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{latestChange.eventName} · {latestChange.timestamp}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming events list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">My Events</h2>
          <Link to="/events" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            See all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {volunteerEvents.filter(e => e.status !== "completed").map((event) => (
            <Link
              key={event.id}
              to={`/volunteer/event/${event.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{event.name}</p>
                  {event.changesCount > 0 && (
                    <Badge className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-0 text-[10px] px-1.5 py-0">
                      {event.changesCount} updates
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.dateLabel}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{event.tasks.length} responsibilities assigned</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
