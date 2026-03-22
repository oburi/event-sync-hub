/* ------------------------------------------------------------------ */
/*  Volunteer-specific mock data                                       */
/* ------------------------------------------------------------------ */

export interface VolunteerProfile {
  id: string;
  name: string;
  firstName: string;
  role: string;
  avatar?: string;
}

export const currentVolunteer: VolunteerProfile = {
  id: "vol-1",
  name: "Jordan Kim",
  firstName: "Jordan",
  role: "Volunteer",
};

/* ── Events ──────────────────────────────────────────────────────── */

export type TaskStatus = "upcoming" | "in_progress" | "completed" | "updated";

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  date: string;
  time: string;
  location: string;
  collaborators: string[];
  dueDate?: string;
  contact?: string;
  isPreEvent?: boolean;
  changeNote?: string;
}

export interface VolunteerEvent {
  id: string;
  name: string;
  date: string;
  dateLabel: string;
  time: string;
  location: string;
  status: "published" | "upcoming" | "completed";
  lastUpdated: string;
  changesCount: number;
  tasks: VolunteerTask[];
}

export const volunteerEvents: VolunteerEvent[] = [
  {
    id: "evt-1",
    name: "Spring Welcome Mixer",
    date: "2026-04-05",
    dateLabel: "Saturday, April 5, 2026",
    time: "4:00 PM – 10:00 PM",
    location: "Student Union Ballroom",
    status: "published",
    lastUpdated: "2 hours ago",
    changesCount: 3,
    tasks: [
      {
        id: "t1",
        title: "Registration desk check-in",
        description: "Greet attendees, hand out name tags and welcome packets. Keep the line moving smoothly.",
        status: "updated",
        date: "April 5",
        time: "5:00 PM – 6:30 PM",
        location: "Main Entrance Lobby",
        collaborators: ["Alex Rivera"],
        contact: "Sarah Chen",
        changeNote: "Start time moved from 5:30 PM to 5:00 PM",
      },
      {
        id: "t2",
        title: "Workshop materials setup",
        description: "Distribute printed handouts and supplies to tables in Rooms 201–203. One packet per seat.",
        status: "upcoming",
        date: "April 5",
        time: "4:00 PM – 4:45 PM",
        location: "Rooms 201–203",
        collaborators: ["Taylor Nguyen"],
        contact: "Priya Patel",
      },
      {
        id: "t3",
        title: "Teardown support",
        description: "Help pack supplies, take down signage, and return AV equipment. Garbage bags are in the storage closet.",
        status: "upcoming",
        date: "April 5",
        time: "9:30 PM – 10:00 PM",
        location: "Student Union Ballroom",
        collaborators: ["Priya Patel", "Taylor Nguyen"],
        contact: "Sarah Chen",
      },
    ],
  },
  {
    id: "evt-2",
    name: "Hackathon 2026",
    date: "2026-04-18",
    dateLabel: "Saturday, April 18, 2026",
    time: "9:00 AM – 9:00 PM",
    location: "Engineering Building, Rooms 201–205",
    status: "upcoming",
    lastUpdated: "1 day ago",
    changesCount: 0,
    tasks: [
      {
        id: "t4",
        title: "Greet speakers & escort to green room",
        description: "Meet speakers at the main entrance. Walk them to the green room and ensure water and snacks are ready.",
        status: "upcoming",
        date: "April 18",
        time: "8:30 AM",
        location: "Main Entrance → Green Room",
        collaborators: ["Marcus Johnson"],
        contact: "Sarah Chen",
      },
      {
        id: "t5",
        title: "Volunteer lunch handoff",
        description: "Pick up boxed lunches from Café 9 and bring to volunteer break area. Count matches headcount.",
        status: "upcoming",
        date: "April 18",
        time: "12:00 PM",
        location: "Café 9 → Break Room B",
        collaborators: [],
        contact: "Alex Rivera",
      },
      {
        id: "t6",
        title: "Finalize venue booking",
        description: "Confirm room layout with venue staff. Ensure tables, chairs, and AV equipment are in place.",
        status: "completed",
        date: "April 16",
        time: "2:00 PM",
        location: "Engineering Building",
        collaborators: ["Priya Patel"],
        dueDate: "April 16",
        contact: "Priya Patel",
        isPreEvent: true,
      },
    ],
  },
  {
    id: "evt-3",
    name: "Career Fair Prep Workshop",
    date: "2026-03-28",
    dateLabel: "Saturday, March 28, 2026",
    time: "3:00 PM – 5:00 PM",
    location: "Library Room 302",
    status: "completed",
    lastUpdated: "5 days ago",
    changesCount: 0,
    tasks: [
      {
        id: "t7",
        title: "Print and sort resume packets",
        description: "Print 40 copies of resume templates and sort by table number.",
        status: "completed",
        date: "March 28",
        time: "2:00 PM",
        location: "Library Room 302",
        collaborators: ["Taylor Nguyen"],
        contact: "Marcus Johnson",
        isPreEvent: true,
      },
    ],
  },
];

/* ── Notifications ───────────────────────────────────────────────── */

export interface VolunteerNotification {
  id: string;
  eventId: string;
  eventName: string;
  message: string;
  type: "change" | "assignment" | "reminder" | "update";
  read: boolean;
  timestamp: string;
  actionNeeded: boolean;
  taskId?: string;
}

export const volunteerNotifications: VolunteerNotification[] = [
  {
    id: "n1",
    eventId: "evt-1",
    eventName: "Spring Welcome Mixer",
    message: "Registration start time changed from 5:30 PM to 5:00 PM",
    type: "change",
    read: false,
    timestamp: "2 hours ago",
    actionNeeded: false,
    taskId: "t1",
  },
  {
    id: "n2",
    eventId: "evt-1",
    eventName: "Spring Welcome Mixer",
    message: "Workshop room changed from Room 204 to Rooms 201–203",
    type: "change",
    read: false,
    timestamp: "5 hours ago",
    actionNeeded: false,
    taskId: "t2",
  },
  {
    id: "n3",
    eventId: "evt-1",
    eventName: "Spring Welcome Mixer",
    message: "Taylor Nguyen added as collaborator for Teardown support",
    type: "update",
    read: false,
    timestamp: "1 day ago",
    actionNeeded: false,
    taskId: "t3",
  },
  {
    id: "n4",
    eventId: "evt-2",
    eventName: "Hackathon 2026",
    message: "You've been assigned: Greet speakers & escort to green room",
    type: "assignment",
    read: true,
    timestamp: "2 days ago",
    actionNeeded: false,
    taskId: "t4",
  },
  {
    id: "n5",
    eventId: "evt-1",
    eventName: "Spring Welcome Mixer",
    message: "Reminder: Spring Welcome Mixer is in 2 weeks",
    type: "reminder",
    read: true,
    timestamp: "3 days ago",
    actionNeeded: false,
  },
  {
    id: "n6",
    eventId: "evt-2",
    eventName: "Hackathon 2026",
    message: "You've been assigned: Volunteer lunch handoff",
    type: "assignment",
    read: true,
    timestamp: "4 days ago",
    actionNeeded: false,
    taskId: "t5",
  },
];

/* ── Team / Contacts ─────────────────────────────────────────────── */

export interface VolunteerContact {
  id: string;
  name: string;
  role: string;
  relationship: string;
  eventNames: string[];
  phone: string;
  email: string;
}

export const volunteerContacts: VolunteerContact[] = [
  {
    id: "c1",
    name: "Sarah Chen",
    role: "Event Organizer",
    relationship: "Organizer",
    eventNames: ["Spring Welcome Mixer", "Hackathon 2026"],
    phone: "(555) 123-4567",
    email: "sarah@club.edu",
  },
  {
    id: "c2",
    name: "Priya Patel",
    role: "Logistics Lead",
    relationship: "Coordinator",
    eventNames: ["Spring Welcome Mixer", "Hackathon 2026"],
    phone: "(555) 345-6789",
    email: "priya@club.edu",
  },
  {
    id: "c3",
    name: "Alex Rivera",
    role: "Volunteer Coordinator",
    relationship: "Teammate",
    eventNames: ["Spring Welcome Mixer"],
    phone: "(555) 456-7890",
    email: "alex@club.edu",
  },
  {
    id: "c4",
    name: "Taylor Nguyen",
    role: "Volunteer",
    relationship: "Teammate",
    eventNames: ["Spring Welcome Mixer"],
    phone: "(555) 678-9012",
    email: "taylor@club.edu",
  },
  {
    id: "c5",
    name: "Marcus Johnson",
    role: "VP Events",
    relationship: "Teammate",
    eventNames: ["Hackathon 2026"],
    phone: "(555) 234-5678",
    email: "marcus@club.edu",
  },
];

/* ── Calendar entries ────────────────────────────────────────────── */

export interface CalendarEntry {
  id: string;
  eventId: string;
  eventName: string;
  taskTitle: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  updated?: boolean;
}

export const volunteerCalendar: CalendarEntry[] = [
  { id: "cal-1", eventId: "evt-1", eventName: "Spring Welcome Mixer", taskTitle: "Workshop materials setup", date: "2026-04-05", time: "4:00 PM", location: "Rooms 201–203" },
  { id: "cal-2", eventId: "evt-1", eventName: "Spring Welcome Mixer", taskTitle: "Registration desk check-in", date: "2026-04-05", time: "5:00 PM", location: "Main Entrance Lobby", updated: true },
  { id: "cal-3", eventId: "evt-1", eventName: "Spring Welcome Mixer", taskTitle: "Teardown support", date: "2026-04-05", time: "9:30 PM", location: "Student Union Ballroom" },
  { id: "cal-4", eventId: "evt-2", eventName: "Hackathon 2026", taskTitle: "Greet speakers", date: "2026-04-18", time: "8:30 AM", location: "Main Entrance" },
  { id: "cal-5", eventId: "evt-2", eventName: "Hackathon 2026", taskTitle: "Volunteer lunch handoff", date: "2026-04-18", time: "12:00 PM", location: "Café 9 → Break Room B" },
];
