import { useParams } from "react-router-dom";
import { Calendar, Clock, MapPin, Phone, Bell, ChevronRight, Zap } from "lucide-react";
import { mockEvents, mockTimeline, mockVolunteerView, mockTeam } from "@/lib/mock-data";

export default function VolunteerView() {
  const { eventId } = useParams();
  const event = mockEvents.find(e => e.id === eventId) || mockEvents[0];
  const volunteer = mockTeam[4]; // Jordan Kim
  const changes = mockVolunteerView.filter(i => i.type === 'change');
  const responsibilities = mockVolunteerView.filter(i => i.type === 'responsibility');
  const logistics = mockVolunteerView.filter(i => i.type === 'logistics' || i.type === 'note');
  const nowItem = mockTimeline.find(t => t.status === 'now');
  const upcomingItems = mockTimeline.filter(t => t.status === 'upcoming').slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-4 w-4 text-primary-foreground/80" />
          <span className="text-xs font-medium text-primary-foreground/80">Syncra</span>
        </div>
        <h1 className="text-xl font-semibold text-primary-foreground">{event.name}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-primary-foreground/70">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-4 pb-8 max-w-lg mx-auto">
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

        {/* Now */}
        {nowItem && (
          <div className="rounded-xl bg-card border shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="timeline-dot-now" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Happening Now</span>
            </div>
            <p className="text-base font-semibold text-foreground">{nowItem.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{nowItem.description}</p>
            <span className="text-xs text-muted-foreground mt-2 block">{nowItem.time}</span>
          </div>
        )}

        {/* Your Responsibilities */}
        <div className="rounded-xl bg-card border shadow-sm p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Responsibilities</h2>
          <div className="space-y-3">
            {responsibilities.map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full border-2 border-primary/30 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.content}</p>
                  {item.time && <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Up */}
        <div className="rounded-xl bg-card border shadow-sm p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Coming Up</h2>
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

        {/* Logistics */}
        <div className="rounded-xl bg-card border shadow-sm p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Logistics & Notes</h2>
          <div className="space-y-2">
            {logistics.map(item => (
              <p key={item.id} className="text-sm text-foreground">{item.content}</p>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="rounded-xl bg-card border shadow-sm p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Emergency Contact</h2>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">SC</div>
            <div>
              <p className="text-sm font-medium text-foreground">Sarah Chen</p>
              <p className="text-xs text-muted-foreground">Event Organizer</p>
            </div>
            <a href="tel:5551234567" className="ml-auto p-2 rounded-full bg-primary/10 text-primary">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
