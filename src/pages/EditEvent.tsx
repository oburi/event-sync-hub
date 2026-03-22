import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Plus, Trash2, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskItem {
  title: string;
  description: string;
  assignedRole: string;
  assignedVolunteer: string;
  time: string;
  location: string;
}

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name);
          setDate(data.date || "");
          setTime(data.time || "");
          setLocation(data.location || "");
          setDescription(data.description || "");
          setStatus(data.status);
          if (data.raw_content) {
            try {
              const plan = JSON.parse(data.raw_content);
              if (plan.tasks) {
                setTasks(
                  plan.tasks.map((t: any) => ({
                    title: t.title || "",
                    description: t.description || "",
                    assignedRole: t.assignedRole || "",
                    assignedVolunteer: t.assignedVolunteer || "",
                    time: t.time || "",
                    location: t.location || "",
                  }))
                );
              }
            } catch {}
          }
        }
        setLoading(false);
      });
  }, [id]);

  const addTask = () => {
    setTasks((prev) => [...prev, { title: "", description: "", assignedRole: "", time: "", location: "" }]);
  };

  const updateTask = (index: number, field: keyof TaskItem, value: string) => {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const removeTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const rawContent = JSON.stringify({
      title: name,
      date,
      time,
      location,
      description,
      tasks: tasks.map((t) => ({
        title: t.title,
        description: t.description,
        assignedRole: t.assignedRole || null,
        time: t.time || null,
        location: t.location || null,
      })),
    });

    const { error } = await supabase
      .from("events")
      .update({
        name,
        date: date || null,
        time: time || null,
        location: location || null,
        description,
        status,
        raw_content: rawContent,
      })
      .eq("id", id!);

    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Event saved successfully");
      navigate(`/events/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/events/${id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Edit Event</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {/* Event Details */}
      <div className="card-elevated space-y-4">
        <h2 className="section-title">Event Details</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Event Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Event name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
              <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 6:00 PM" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue or address" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description" rows={3} />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="card-elevated space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Tasks & Responsibilities</h2>
          <Button variant="outline" size="sm" onClick={addTask} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet. Click "Add Task" to create one.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Input
                    value={task.title}
                    onChange={(e) => updateTask(i, "title", e.target.value)}
                    placeholder="Task title"
                    className="font-medium"
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive" onClick={() => removeTask(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Textarea
                  value={task.description}
                  onChange={(e) => updateTask(i, "description", e.target.value)}
                  placeholder="Description"
                  rows={2}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Input
                      value={task.assignedRole}
                      onChange={(e) => updateTask(i, "assignedRole", e.target.value)}
                      placeholder="Assigned role"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Input
                      value={task.time}
                      onChange={(e) => updateTask(i, "time", e.target.value)}
                      placeholder="Time"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Input
                      value={task.location}
                      onChange={(e) => updateTask(i, "location", e.target.value)}
                      placeholder="Location"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
