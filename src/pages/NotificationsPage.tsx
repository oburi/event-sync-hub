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
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay up to date with event changes and updates.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>Mark all read</Button>
      </div>

      <div className="space-y-2">
        {notifications.map(n => {
          const Icon = typeIcons[n.type];
          const isExpanded = expandedId === n.id;
          return (
            <button
              key={n.id}
              onClick={() => toggle(n.id)}
              className={`w-full text-left card-elevated transition-all ${!n.read ? 'border-primary/30 bg-primary/[0.02]' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === 'what_changed' ? 'bg-warning/10 text-warning' :
                  n.type === 'task_change' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.timestamp}</p>
                  {isExpanded && (
                    <p className="text-sm text-foreground mt-2 leading-relaxed animate-fade-in">{n.detail}</p>
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
