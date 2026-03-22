import { useState } from "react";
import { Calendar, Clock, MapPin, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { volunteerCalendar } from "@/lib/volunteer-data";
import { cn, formatLocalDate } from "@/lib/utils";

type View = "agenda" | "week";

export default function VolunteerCalendarPage() {
  const [view, setView] = useState<View>("agenda");

  // Group entries by date
  const grouped = volunteerCalendar.reduce<Record<string, typeof volunteerCalendar>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">My Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your schedule across all events.
          </p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {(["agenda", "week"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize",
                view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "agenda" ? (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <section key={date}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatLocalDate(date, { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {grouped[date].length} {grouped[date].length === 1 ? "responsibility" : "responsibilities"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pl-1">
                <div className="relative pl-5">
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
                  {grouped[date].map((entry) => (
                    <div key={entry.id} className="relative flex gap-3 items-start mb-3 last:mb-0">
                      <div className={cn(
                        "absolute left-[-13px] top-2 h-2.5 w-2.5 rounded-full border-2",
                        entry.updated ? "border-[hsl(var(--warning))] bg-[hsl(var(--warning))]" : "border-primary bg-primary"
                      )} />
                      <Link
                        to={`/volunteer/event/${entry.eventId}`}
                        className={cn(
                          "flex-1 rounded-xl border bg-card p-3 hover:shadow-sm transition-shadow",
                          entry.updated ? "border-[hsl(var(--warning))]/30" : "border-border"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-foreground">{entry.taskTitle}</p>
                          {entry.updated && (
                            <RefreshCw className="h-3 w-3 text-[hsl(var(--warning))]" />
                          )}
                        </div>
                        <p className="text-xs text-primary font-medium">{entry.eventName}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entry.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {entry.location}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Week view - simplified block layout */
        <div className="space-y-3">
          {sortedDates.map((date) => (
            <div key={date} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="bg-secondary px-3.5 py-2">
                <p className="text-xs font-semibold text-foreground">
                  {formatLocalDate(date, { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="divide-y divide-border">
                {grouped[date].map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/volunteer/event/${entry.eventId}`}
                    className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-xs font-mono text-primary font-medium w-16 shrink-0">{entry.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{entry.taskTitle}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{entry.location}</p>
                    </div>
                    {entry.updated && (
                      <Badge className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-0 text-[10px] px-1.5 py-0 shrink-0">
                        Updated
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedDates.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">No upcoming schedule</p>
          <p className="text-xs mt-1">Your event responsibilities will appear here.</p>
        </div>
      )}
    </div>
  );
}
