import { Calendar, Clock, MapPin, Bell } from "lucide-react";
import { mockEvents, mockTimeline, mockVolunteerView, mockTasks } from "@/lib/mock-data";

export default function VolunteerDashboard() {
  const event = mockEvents[0];
  const changes = mockVolunteerView.filter(i => i.type === "change");
  const myTasks = mockTasks.slice(0, 3);
  const nowItem = mockTimeline.find(t => t.status === "now");
  const upcomingItems = mockTimeline.filter(t => t.status === "upcoming").slice(0, 3);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Volunteer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's what you need to know for your upcoming events.</p>
      </div>

      {/* What Changed */}
      {changes.length > 0 && (
        <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-warning" />
            <span className="text-xs font-semibold text-warning uppercase tracking-wider">What Changed</span>
            <span className="ml-auto h-5 w-5 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-[10px] font-bold">{changes.length}</span>
          </div>
          {changes.map(item => (
            <p key={item.id} className="text-sm text-foreground">{item.content}</p>
          ))}
        </div>
      )}

      {/* Upcoming Event */}
      <div className="card-elevated">
        <span className="status-badge status-badge-success mb-2">{event.status}</span>
        <h2 className="text-lg font-semibold text-foreground">{event.name}</h2>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
        </div>
      </div>

      {/* Now */}
      {nowItem && (
        <div className="card-elevated border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="timeline-dot-now" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Happening Now</span>
          </div>
          <p className="text-base font-semibold text-foreground">{nowItem.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{nowItem.description}</p>
        </div>
      )}

      {/* My Tasks */}
      <div className="card-elevated">
        <h2 className="section-title mb-3">Your Tasks</h2>
        <div className="space-y-3">
          {myTasks.map(task => (
            <div key={task.id} className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-primary/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{task.time} · {task.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Up */}
      <div className="card-elevated">
        <h2 className="section-title mb-3">Coming Up</h2>
        <div className="space-y-3">
          {upcomingItems.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">{item.time}</span>
              <div className="timeline-dot-upcoming shrink-0" />
              <p className="text-sm text-foreground">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
