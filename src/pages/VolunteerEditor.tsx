import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Eye, EyeOff, GripVertical, Send, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mockEvents, mockTasks, mockTimeline, mockSources } from "@/lib/mock-data";
import { formatLocalDate } from "@/lib/utils";
import type { Event } from "@/lib/mock-data";

const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

interface RawPlan {
  tasks?: { title: string; description?: string; assignedRole?: string; time?: string | null; location?: string | null }[];
}

interface Section {
  id: string;
  title: string;
  visible: boolean;
  content: string;
}

function buildSections(event: Event, plan: RawPlan | null, sourceType?: string | null): Section[] {
  const tasks = plan?.tasks || [];

  const responsibilitiesContent = tasks.length > 0
    ? tasks.map((t) => `• ${t.title}${t.assignedRole ? ` — ${t.assignedRole}` : ""}${t.time ? ` (${t.time})` : ""}`).join("\n")
    : mockTasks.map((t) => `• ${t.title} — ${t.assigneeName} (${t.time}, ${t.location})`).join("\n");

  const timelineContent = tasks.length > 0
    ? tasks.filter((t) => t.time).sort((a, b) => (a.time || "").localeCompare(b.time || "")).map((t) => `${t.time} — ${t.title}`).join("\n")
      + (tasks.filter((t) => !t.time).length > 0 ? "\n" + tasks.filter((t) => !t.time).map((t) => `TBD — ${t.title}`).join("\n") : "")
    : mockTimeline.map((t) => `${t.time} — ${t.title}`).join("\n");

  const sourceContent = sourceType
    ? `• ${sourceType === "google_doc" ? "Google Doc" : sourceType === "pdf" ? "Uploaded PDF" : sourceType === "notion" ? "Notion Page" : "Manual"} — synced just now`
    : mockSources.map((s) => `• ${s.name} (${s.type}) — last synced ${s.lastFetched}`).join("\n");

  return [
    { id: "1", title: "Event Details", visible: true, content: `${event.name}\n${formatLocalDate(event.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}\n${event.time}\n${event.location}` },
    { id: "2", title: "Volunteer Responsibilities", visible: true, content: responsibilitiesContent },
    { id: "3", title: "Run of Show", visible: true, content: timelineContent },
    { id: "4", title: "Key Logistics", visible: true, content: event.location !== "TBD" ? `• Location: ${event.location}\n• Time: ${event.time}` : "• Parking available in Lot A (south entrance)\n• Wear club t-shirts\n• First aid kit at Info Desk" },
    { id: "5", title: "What Changed", visible: true, content: "No recent changes." },
    { id: "6", title: "Source References", visible: true, content: sourceContent },
  ];
}

export default function VolunteerEditor() {
  const { id } = useParams();
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbEvent, setDbEvent] = useState<(Event & { raw_content?: string | null; source_type?: string | null }) | null>(null);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (id && isUUID(id)) {
      setLoading(true);
      supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) {
            const ev: Event & { raw_content?: string | null; source_type?: string | null } = {
              id: data.id,
              name: data.name,
              date: data.date || new Date().toISOString().split("T")[0],
              time: data.time || "TBD",
              location: data.location || "TBD",
              description: data.description || "",
              status: (data.status as Event["status"]) || "draft",
              lastUpdated: new Date(data.updated_at).toLocaleDateString(),
              conflicts: 0, missingInfo: 0, volunteersCount: 0,
              raw_content: data.raw_content,
              source_type: data.source_type,
            };
            setDbEvent(ev);
            let plan: RawPlan | null = null;
            try { plan = data.raw_content ? JSON.parse(data.raw_content) : null; } catch {}
            setSections(buildSections(ev, plan, data.source_type));
          }
          setLoading(false);
        });
    } else {
      const event = mockEvents.find((e) => e.id === id) || mockEvents[0];
      setSections(buildSections(event, null));
    }
  }, [id]);

  const event = dbEvent || mockEvents.find((e) => e.id === id) || mockEvents[0];

  const toggleVisibility = (sectionId: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, visible: !s.visible } : s)));
  };

  const handlePublish = () => {
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/events/${event.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Volunteer View Editor</h1>
            <p className="text-xs text-muted-foreground">Curate what volunteers will see for {event.name}</p>
          </div>
        </div>
        <Button onClick={handlePublish} size="sm" className="gap-1.5">
          {published ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
          {published ? "Published!" : "Publish"}
        </Button>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className={`card-elevated transition-opacity ${!section.visible ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
              </div>
              <button onClick={() => toggleVisibility(section.id)} className="p-1 rounded hover:bg-muted transition-colors">
                {section.visible ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
            <textarea
              value={section.content}
              onChange={(e) => setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, content: e.target.value } : s)))}
              className="w-full bg-muted/30 rounded-lg p-3 text-sm text-foreground leading-relaxed resize-none outline-none focus:ring-1 focus:ring-primary/30 min-h-[80px]"
              rows={section.content.split("\n").length + 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
