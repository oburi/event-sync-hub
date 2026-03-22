import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mockEvents } from "@/lib/mock-data";

type ViewMode = "weekly" | "monthly";

interface CalEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  status: string;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>("monthly");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 22));
  const [dbEvents, setDbEvents] = useState<CalEvent[]>([]);

  useEffect(() => {
    supabase
      .from("events")
      .select("id, name, date, time, status")
      .eq("status", "published")
      .then(({ data }) => {
        if (data) {
          setDbEvents(
            data
              .filter((e) => e.date)
              .map((e) => ({
                id: e.id,
                name: e.name,
                date: e.date!,
                time: e.time || "",
                status: e.status,
              }))
          );
        }
      });
  }, []);

  const allEvents: CalEvent[] = [
    ...dbEvents,
    ...mockEvents
      .filter((e) => !dbEvents.some((db) => db.id === e.id))
      .map((e) => ({ id: e.id, name: e.name, date: e.date, time: e.time, status: e.status })),
  ];

  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());

  const monthDays: Date[] = [];
  const d = new Date(calendarStart);
  while (monthDays.length < 42) {
    monthDays.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return allEvents.filter((e) => e.date === dateStr);
  };

  const navigateWeek = (dir: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + dir * 7);
    setCurrentDate(next);
  };

  const navigateMonth = (dir: number) => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + dir);
    setCurrentDate(next);
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setView("weekly")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "weekly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setView("monthly")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => view === "weekly" ? navigateWeek(-1) : navigateMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-foreground min-w-[160px] text-center">
          {view === "weekly"
            ? `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
            : currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
          }
        </span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => view === "weekly" ? navigateWeek(1) : navigateMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {view === "weekly" ? (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
            <div className="p-2" />
            {weekDays.map((day, i) => (
              <div key={i} className="p-2 text-center border-l">
                <p className="text-[10px] text-muted-foreground uppercase">{dayNames[day.getDay()]}</p>
                <p className={`text-sm font-medium ${day.toDateString() === new Date().toDateString() ? "text-primary" : "text-foreground"}`}>
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[48px]">
                <div className="p-1 text-[10px] text-muted-foreground text-right pr-2 pt-0">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </div>
                {weekDays.map((day, i) => {
                  const events = getEventsForDate(day);
                  const hourEvents = events.filter(e => {
                    const match = e.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (!match) return false;
                    let h = parseInt(match[1]);
                    if (match[3].toUpperCase() === "PM" && h !== 12) h += 12;
                    if (match[3].toUpperCase() === "AM" && h === 12) h = 0;
                    return h === hour;
                  });
                  return (
                    <div key={i} className="border-l border-t p-0.5">
                      {hourEvents.map(ev => (
                        <Link key={ev.id} to={`/events/${ev.id}`}>
                          <div className="rounded bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 font-medium truncate hover:bg-primary/20 transition-colors">
                            {ev.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="grid grid-cols-7 border-b">
            {dayNames.map(name => (
              <div key={name} className="p-2 text-center text-[10px] font-medium text-muted-foreground uppercase">
                {name}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, i) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const events = getEventsForDate(day);
              return (
                <div key={i} className={`min-h-[80px] p-1.5 border-t ${i % 7 !== 0 ? 'border-l' : ''} ${!isCurrentMonth ? 'bg-muted/30' : ''}`}>
                  <span className={`text-xs font-medium inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    isToday ? 'bg-primary text-primary-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'
                  }`}>
                    {day.getDate()}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {events.map(ev => (
                      <Link key={ev.id} to={`/events/${ev.id}`}>
                        <div className={`rounded px-1.5 py-0.5 text-[10px] font-medium truncate hover:opacity-80 transition-opacity ${
                          ev.status === 'published' ? 'bg-primary/10 text-primary' :
                          ev.status === 'completed' ? 'bg-muted text-muted-foreground' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {ev.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
