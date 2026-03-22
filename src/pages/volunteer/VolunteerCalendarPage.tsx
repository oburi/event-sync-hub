import { useState } from "react";
import { Calendar, Clock, MapPin, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { volunteerCalendar } from "@/lib/volunteer-data";
import { cn, formatLocalDate } from "@/lib/utils";

type View = "agenda" | "week";

export default function VolunteerCalendarPage() {
  const [view, setView] = useState<View>("agenda");

  const grouped = volunteerCalendar.reduce<Record<string, typeof volunteerCalendar>>((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="p-5 sm:p-8 max-w-2xl mx-auto space-y-7 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">My Calendar</h1>
          <p className="text-[15px] text-muted-foreground mt-1.5">
            Your schedule across all events.
          </p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-0.5">
          {(["agenda", "week"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors capitalize",
                view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "agenda" ? (
        <div className="space-y-7">
          {sortedDates.map((date) => (
            <section key={date}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-foreground">
                    {formatLocalDate(date, { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
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
                        entry.updated ? "border-warning bg-warning" : "border-primary bg-primary"
                      )} />
                      <Link
                        to={`/volunteer/event/${entry.eventId}`}
                        className={cn(
                          "flex-1 rounded-2xl border bg-card p-3.5 hover:shadow-sm transition-shadow",
                          entry.updated ? "border-warning/30" : "border-border"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[14px] font-semibold text-foreground">{entry.taskTitle}</p>
                          {entry.updated && (
                            <RefreshCw className="h-3 w-3 text-warning" />
                          )}
                        </div>
                        <p className="text-[13px] text-primary font-medium">{entry.eventName}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[13px] text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {entry.time}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
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
        <div className="space-y-3">
          {sortedDates.map((date) => (
            <div key={date} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="bg-secondary px-4 py-2.5">
                <p className="text-[13px] font-semibold text-foreground">
                  {formatLocalDate(date, { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="divide-y divide-border">
                {grouped[date].map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/volunteer/event/${entry.eventId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-[13px] font-mono text-primary font-medium w-16 shrink-0">{entry.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground truncate">{entry.taskTitle}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{entry.location}</p>
                    </div>
                    {entry.updated && (
                      <Badge className="bg-warning/10 text-warning border-0 text-[10px] px-1.5 py-0 shrink-0">
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
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-serif text-xl text-foreground mb-1">No upcoming schedule</p>
          <p className="text-[14px]">Your event responsibilities will appear here.</p>
        </div>
      )}
    </div>
  );
}
