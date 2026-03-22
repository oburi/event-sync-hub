import { useState } from "react";
import { Bell, AlertTriangle, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationsContext";

const typeIcons = {
  task_change: RefreshCw,
  event_update: Calendar,
  what_changed: AlertTriangle,
};

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    markAsRead(id);
  };

  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Notifications</h1>
          <p className="text-[14px] text-muted-foreground mt-1.5">Stay up to date with event changes and updates.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} className="rounded-xl">Mark all read</Button>
      </div>

      <div className="space-y-2.5">
        {notifications.map(n => {
          const Icon = typeIcons[n.type];
          const isExpanded = expandedId === n.id;
          return (
            <button
              key={n.id}
              onClick={() => toggle(n.id)}
              className={`w-full text-left card-elevated transition-all ${!n.read ? 'border-primary/20 bg-primary/[0.02]' : ''}`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'what_changed' ? 'bg-warning/10 text-warning' :
                  n.type === 'task_change' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-[14px] ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-[13px] text-muted-foreground mt-0.5">{n.timestamp}</p>
                  {isExpanded && (
                    <p className="text-[14px] text-foreground mt-2.5 leading-relaxed animate-fade-in">{n.detail}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
