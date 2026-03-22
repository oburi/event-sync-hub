import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle2,
  Circle,
  RefreshCw,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const mockEvent = {
  name: "Spring Welcome Mixer",
  date: "Saturday, April 5, 2026",
  time: "4:00 PM – 10:00 PM",
  location: "Student Union Ballroom",
  status: "published" as const,
  lastUpdated: "2 hours ago",
  changesCount: 3,
};

type TaskStatus = "upcoming" | "in_progress" | "completed" | "updated";

interface VolunteerTask {
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

const mockTasks: VolunteerTask[] = [
  {
    id: "1",
    title: "Finalize venue booking & room setup",
    description: "Confirm room layout with venue staff. Ensure tables, chairs, and AV equipment are in place by 3:30 PM.",
    status: "completed",
    date: "April 4",
    time: "2:00 PM",
    location: "Student Union — Room 101",
    collaborators: ["Priya Patel"],
    dueDate: "April 4",
    contact: "Priya Patel",
    isPreEvent: true,
  },
  {
    id: "2",
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
    id: "3",
    title: "Greet speakers & escort to green room",
    description: "Meet speakers at the south entrance. Walk them to the green room and ensure water/snacks are ready.",
    status: "upcoming",
    date: "April 5",
    time: "5:15 PM",
    location: "South Entrance → Green Room (Room 104)",
    collaborators: ["Marcus Johnson"],
    contact: "Sarah Chen",
  },
  {
    id: "4",
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
    id: "5",
    title: "Volunteer lunch handoff",
    description: "Pick up boxed lunches from Café 9 and bring to volunteer break area. Count matches headcount.",
    status: "upcoming",
    date: "April 5",
    time: "12:00 PM",
    location: "Café 9 → Break Room B",
    collaborators: [],
    contact: "Alex Rivera",
  },
  {
    id: "6",
    title: "Teardown support",
    description: "Help pack supplies, take down signage, and return AV equipment. Garbage bags are in the storage closet.",
    status: "upcoming",
    date: "April 5",
    time: "9:30 PM – 10:00 PM",
    location: "Student Union Ballroom",
    collaborators: ["Priya Patel", "Taylor Nguyen"],
    contact: "Sarah Chen",
  },
];

const mockChanges = [
  { id: "1", text: "Registration start time moved from 5:30 PM → 5:00 PM", ago: "2 hours ago" },
  { id: "2", text: "Workshop room changed from 204 to 201–203", ago: "5 hours ago" },
  { id: "3", text: "Teardown collaborator added: Taylor Nguyen", ago: "1 day ago" },
];

interface TimelineEntry {
  time: string;
  title: string;
  isMine: boolean;
}

const mockTimeline: TimelineEntry[] = [
  { time: "12:00 PM", title: "Volunteer lunch handoff", isMine: true },
  { time: "4:00 PM", title: "Workshop materials setup", isMine: true },
  { time: "4:00 PM", title: "Vendor arrival & parking", isMine: false },
  { time: "4:30 PM", title: "Signage & wayfinding", isMine: false },
  { time: "5:00 PM", title: "Registration desk check-in", isMine: true },
  { time: "5:15 PM", title: "Greet speakers", isMine: true },
  { time: "5:30 PM", title: "Sound check", isMine: false },
  { time: "6:00 PM", title: "Doors open — welcome remarks", isMine: false },
  { time: "7:00 PM", title: "Networking activity", isMine: false },
  { time: "9:30 PM", title: "Teardown support", isMine: true },
];

const mockContacts = [
  { name: "Sarah Chen", role: "Event Organizer", phone: "(555) 123-4567", email: "sarah@club.edu" },
  { name: "Priya Patel", role: "Logistics Lead", phone: "(555) 345-6789", email: "priya@club.edu" },
  { name: "Alex Rivera", role: "Volunteer Coordinator", phone: "(555) 456-7890", email: "alex@club.edu" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statusConfig: Record<TaskStatus, { label: string; className: string; Icon: typeof Circle }> = {
  upcoming: { label: "Upcoming", className: "bg-secondary text-secondary-foreground", Icon: Circle },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary", Icon: Play },
  completed: { label: "Completed", className: "bg-success/10 text-success", Icon: CheckCircle2 },
  updated: { label: "Updated", className: "bg-warning/10 text-warning", Icon: AlertCircle },
};

type Filter = "all" | "today" | "upcoming" | "completed";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VolunteerEventDashboard() {
  const { eventId } = useParams();
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const toggleComplete = (taskId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const getEffectiveStatus = (task: VolunteerTask): TaskStatus =>
    completedIds.has(task.id) ? "completed" : task.status;

  const filteredTasks = mockTasks.filter((t) => {
    const effective = getEffectiveStatus(t);
    if (filter === "all") return true;
    if (filter === "today") return t.date === "April 5";
    if (filter === "upcoming") return effective === "upcoming";
    if (filter === "completed") return effective === "completed";
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aDone = completedIds.has(a.id) ? 1 : 0;
    const bDone = completedIds.has(b.id) ? 1 : 0;
    return aDone - bDone;
  });

  const preEventTasks = sortedTasks.filter((t) => t.isPreEvent);
  const dayOfTasks = sortedTasks.filter((t) => !t.isPreEvent);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/60">
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] font-semibold text-foreground truncate">
              {mockEvent.name}
            </h1>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mt-0.5">
              <span>{mockEvent.date}</span>
              <span>·</span>
              <span>{mockEvent.time}</span>
            </div>
          </div>
          {mockEvent.changesCount > 0 && (
            <Badge className="bg-warning/10 text-warning border-0 text-[10px] font-semibold px-2 py-0.5 rounded-lg">
              {mockEvent.changesCount} updates
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-7 pb-16">
        {/* Event Info */}
        <div className="rounded-2xl border border-border bg-card p-4.5 space-y-3">
          <div className="flex items-center gap-2.5 text-[14px] text-foreground font-medium">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            {mockEvent.location}
          </div>
          <div className="flex items-center gap-2.5 text-[14px] text-foreground font-medium">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            {mockEvent.time}
          </div>
          <div className="flex items-center gap-2.5 text-[14px] text-foreground font-medium">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            {mockEvent.date}
          </div>
          <p className="text-[12px] text-muted-foreground pt-1">
            Last updated {mockEvent.lastUpdated}
          </p>
        </div>

        {/* What Changed */}
        {mockChanges.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-3.5 w-3.5 text-warning" />
              </div>
              <h2 className="text-[15px] font-semibold text-foreground">What Changed</h2>
            </div>
            <div className="space-y-2">
              {mockChanges.map((c) => (
                <div
                  key={c.id}
                  className="flex gap-3.5 items-start rounded-2xl border border-warning/20 bg-warning/5 px-4 py-3"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-foreground leading-snug">{c.text}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{c.ago}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(["all", "today", "upcoming", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {f === "all" ? "All" : f === "today" ? "Today" : f === "upcoming" ? "Upcoming" : "Completed"}
            </button>
          ))}
        </div>

        {/* My Responsibilities */}
        <section>
          <h2 className="text-[15px] font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            My Responsibilities
            <span className="text-[13px] font-normal text-muted-foreground">
              ({filteredTasks.length})
            </span>
          </h2>

          {preEventTasks.length > 0 && (
            <div className="mb-4">
              <p className="section-title mb-2.5">Pre-Event</p>
              <div className="space-y-2.5">
                {preEventTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    expanded={expandedTask === task.id}
                    isCompleted={completedIds.has(task.id)}
                    onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    onToggleComplete={() => toggleComplete(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {dayOfTasks.length > 0 && (
            <div>
              {preEventTasks.length > 0 && (
                <p className="section-title mb-2.5">Day-Of</p>
              )}
              <div className="space-y-2.5">
                {dayOfTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    expanded={expandedTask === task.id}
                    isCompleted={completedIds.has(task.id)}
                    onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    onToggleComplete={() => toggleComplete(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && (
            <div className="text-center py-10 text-[14px] text-muted-foreground">
              No tasks match this filter.
            </div>
          )}
        </section>

        <Separator />

        {/* Event Timeline */}
        <section>
          <h2 className="text-[15px] font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Event Timeline
          </h2>
          <div className="relative pl-5">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
            <div className="space-y-3">
              {mockTimeline.map((entry, i) => (
                <div key={i} className="relative flex gap-3 items-start">
                  <div
                    className={cn(
                      "absolute left-[-13px] top-1.5 h-2.5 w-2.5 rounded-full border-2 shrink-0",
                      entry.isMine
                        ? "border-primary bg-primary"
                        : "border-border bg-background"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[13px] font-mono w-16 shrink-0 pt-0.5",
                      entry.isMine ? "text-primary font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {entry.time}
                  </span>
                  <span
                    className={cn(
                      "text-[14px] leading-snug pt-0.5",
                      entry.isMine ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {entry.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Contacts */}
        <section>
          <h2 className="text-[15px] font-semibold text-foreground mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Key Contacts
          </h2>
          <div className="space-y-2.5">
            {mockContacts.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[14px] font-semibold shrink-0">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground">{c.name}</p>
                  <p className="text-[13px] text-muted-foreground">{c.role}</p>
                </div>
                <div className="flex gap-1.5">
                  <a
                    href={`tel:${c.phone}`}
                    className="p-2 rounded-xl hover:bg-accent transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </a>
                  <a
                    href={`mailto:${c.email}`}
                    className="p-2 rounded-xl hover:bg-accent transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TaskCard                                                           */
/* ------------------------------------------------------------------ */

function TaskCard({
  task,
  expanded,
  isCompleted,
  onToggle,
  onToggleComplete,
}: {
  task: VolunteerTask;
  expanded: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onToggleComplete: () => void;
}) {
  const effectiveStatus: TaskStatus = isCompleted ? "completed" : task.status;
  const cfg = statusConfig[effectiveStatus];
  const StatusIcon = cfg.Icon;

  return (
    <div
      className={cn(
        "w-full text-left rounded-2xl border bg-card transition-all",
        isCompleted
          ? "border-border opacity-60"
          : task.status === "updated"
            ? "border-warning/30"
            : "border-border",
        "hover:shadow-sm"
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            className={cn(
              "mt-0.5 h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
              isCompleted
                ? "border-success bg-success"
                : "border-border hover:border-primary"
            )}
            aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />}
          </button>

          <button onClick={onToggle} className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-[10px] font-semibold border-0 px-2 py-0 rounded-md", cfg.className)}>
                <StatusIcon className="h-2.5 w-2.5 mr-1" />
                {cfg.label}
              </Badge>
              {task.changeNote && !isCompleted && (
                <Badge className="text-[10px] font-semibold border-0 px-2 py-0 rounded-md bg-warning/10 text-warning">
                  Changed
                </Badge>
              )}
            </div>
            <h3
              className={cn(
                "text-[14px] font-semibold leading-snug transition-colors",
                isCompleted ? "text-muted-foreground line-through" : "text-foreground"
              )}
            >
              {task.title}
            </h3>
          </button>

          <button onClick={onToggle} className="pt-1 shrink-0">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[13px] text-muted-foreground pl-9">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {task.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[140px]">{task.location}</span>
          </span>
          {task.collaborators.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {task.collaborators.join(", ")}
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border mt-0 pt-3">
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            {task.description}
          </p>

          {task.changeNote && (
            <div className="flex gap-2.5 items-start rounded-xl bg-warning/5 px-3.5 py-2.5">
              <RefreshCw className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
              <p className="text-[13px] text-warning">{task.changeNote}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            {task.dueDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Due {task.dueDate}
              </span>
            )}
            {task.contact && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Contact: {task.contact}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
