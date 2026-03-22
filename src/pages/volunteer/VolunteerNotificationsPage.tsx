import { useState } from "react";
import { Bell, Calendar, RefreshCw, UserPlus, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { volunteerNotifications, type VolunteerNotification } from "@/lib/volunteer-data";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

const typeConfig: Record<VolunteerNotification["type"], { Icon: typeof Bell; className: string }> = {
  change: { Icon: RefreshCw, className: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" },
  assignment: { Icon: UserPlus, className: "bg-primary/10 text-primary" },
  reminder: { Icon: Clock, className: "bg-secondary text-muted-foreground" },
  update: { Icon: Bell, className: "bg-primary/10 text-primary" },
};

export default function VolunteerNotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [readIds, setReadIds] = useState<Set<string>>(
    new Set(volunteerNotifications.filter((n) => n.read).map((n) => n.id))
  );

  const markRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const markAllRead = () => setReadIds(new Set(volunteerNotifications.map((n) => n.id)));

  const notifications = volunteerNotifications.filter((n) => {
    if (filter === "unread") return !readIds.has(n.id);
    return true;
  });

  const unreadCount = volunteerNotifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary hover:underline font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "unread"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            )}
          >
            {f === "all" ? "All" : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {notifications.map((n) => {
          const isUnread = !readIds.has(n.id);
          const cfg = typeConfig[n.type];
          const TypeIcon = cfg.Icon;

          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                "w-full text-left rounded-xl border bg-card p-3.5 transition-all hover:shadow-sm",
                isUnread ? "border-primary/20" : "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", cfg.className)}>
                  <TypeIcon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {isUnread && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    <p className={cn(
                      "text-sm leading-snug",
                      isUnread ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {n.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {n.eventName}
                    </span>
                    <span>·</span>
                    <span>{n.timestamp}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 mx-auto text-[hsl(var(--success))]/40 mb-3" />
          <p className="font-medium text-foreground">All caught up!</p>
          <p className="text-xs mt-1">No unread notifications.</p>
        </div>
      )}
    </div>
  );
}
