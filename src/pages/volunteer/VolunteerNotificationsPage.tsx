import { useState } from "react";
import { Bell, Calendar, RefreshCw, UserPlus, Clock, CheckCircle2 } from "lucide-react";
import { volunteerNotifications, type VolunteerNotification } from "@/lib/volunteer-data";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread";

const typeConfig: Record<VolunteerNotification["type"], { Icon: typeof Bell; className: string }> = {
  change: { Icon: RefreshCw, className: "bg-warning/10 text-warning" },
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
    <div className="p-5 sm:p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Notifications</h1>
          <p className="text-[15px] text-muted-foreground mt-1.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-[13px] text-primary hover:underline font-medium"
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
              "px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-colors capitalize",
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
      <div className="space-y-2.5">
        {notifications.map((n) => {
          const isUnread = !readIds.has(n.id);
          const cfg = typeConfig[n.type];
          const TypeIcon = cfg.Icon;

          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={cn(
                "w-full text-left rounded-2xl border bg-card p-4 transition-all hover:shadow-sm",
                isUnread ? "border-primary/20" : "border-border"
              )}
            >
              <div className="flex items-start gap-3.5">
                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0", cfg.className)}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {isUnread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    <p className={cn(
                      "text-[14px] leading-snug",
                      isUnread ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {n.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
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
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto text-success/30 mb-4" />
          <p className="font-serif text-xl text-foreground mb-1">All caught up!</p>
          <p className="text-[14px]">No unread notifications.</p>
        </div>
      )}
    </div>
  );
}
