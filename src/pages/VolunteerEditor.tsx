import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Eye, EyeOff, GripVertical, Send, ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockEvents, mockTasks, mockTimeline, mockTeam, mockSources } from "@/lib/mock-data";

interface Section {
  id: string;
  title: string;
  visible: boolean;
  content: string;
}

export default function VolunteerEditor() {
  const { id } = useParams();
  const event = mockEvents.find(e => e.id === id) || mockEvents[0];
  const [published, setPublished] = useState(false);

  const [sections, setSections] = useState<Section[]>([
    { id: '1', title: 'Event Details', visible: true, content: `${event.name}\n${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n${event.time}\n${event.location}` },
    { id: '2', title: 'Volunteer Responsibilities', visible: true, content: mockTasks.map(t => `• ${t.title} — ${t.assigneeName} (${t.time}, ${t.location})`).join('\n') },
    { id: '3', title: 'Run of Show', visible: true, content: mockTimeline.map(t => `${t.time} — ${t.title}`).join('\n') },
    { id: '4', title: 'Key Logistics', visible: true, content: '• Parking available in Lot A (south entrance)\n• Wear club t-shirts — extras in storage closet, Room 104\n• First aid kit at Info Desk\n• Emergency contact: Sarah Chen (555) 123-4567' },
    { id: '5', title: 'What Changed', visible: true, content: '• Registration start time moved from 5:30 PM to 5:00 PM\n• Added new food truck (Taco Lab) at position 3' },
    { id: '6', title: 'Source References', visible: true, content: mockSources.map(s => `• ${s.name} (${s.type}) — last synced ${s.lastFetched}`).join('\n') },
  ]);

  const toggleVisibility = (sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s));
  };

  const handlePublish = () => {
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

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
          {published ? 'Published!' : 'Publish'}
        </Button>
      </div>

      <div className="space-y-3">
        {sections.map(section => (
          <div key={section.id} className={`card-elevated transition-opacity ${!section.visible ? 'opacity-50' : ''}`}>
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
              onChange={e => setSections(prev => prev.map(s => s.id === section.id ? { ...s, content: e.target.value } : s))}
              className="w-full bg-muted/30 rounded-lg p-3 text-sm text-foreground leading-relaxed resize-none outline-none focus:ring-1 focus:ring-primary/30 min-h-[80px]"
              rows={section.content.split('\n').length + 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
