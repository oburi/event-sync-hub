import { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  detail: string;
  type: "task_change" | "event_update" | "what_changed";
  timestamp: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", title: "Registration time moved to 5:00 PM", detail: "The registration start time for Spring Welcome Mixer was updated from 5:30 PM to 5:00 PM. Please arrive 15 minutes early to set up.", type: "what_changed", timestamp: "2 hours ago", read: false },
  { id: "2", title: "New task assigned: Sound check with DJ", detail: "Marcus Johnson has been assigned to coordinate the sound check at 5:30 PM at the Main Stage.", type: "task_change", timestamp: "3 hours ago", read: false },
  { id: "3", title: "Hackathon 2026 draft created", detail: "A new event draft for Hackathon 2026 has been created. 3 details are still missing and need your review.", type: "event_update", timestamp: "1 day ago", read: false },
  { id: "4", title: "Source conflict detected", detail: "The Notion Planning Doc and Venue Floor Plan.pdf show different start times for Spring Welcome Mixer (6:00 PM vs 7:00 PM).", type: "what_changed", timestamp: "2 days ago", read: false },
  { id: "5", title: "Taylor Nguyen added to team", detail: "Taylor Nguyen has been added as a Volunteer and assigned to hang directional signage.", type: "task_change", timestamp: "3 days ago", read: true },
];

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
