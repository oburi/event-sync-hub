import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EventResult {
  id: string;
  name: string;
  date: string | null;
  status: string;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventResult[]>([]);

  useEffect(() => {
    if (open) {
      supabase
        .from("events")
        .select("id, name, date, status")
        .order("created_at", { ascending: false })
        .then(({ data }) => setEvents(data || []));
    }
  }, [open]);

  const handleSelect = (eventId: string) => {
    onOpenChange(false);
    navigate(`/events/${eventId}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search events..." />
      <CommandList>
        <CommandEmpty>No events found.</CommandEmpty>
        <CommandGroup heading="Events">
          {events.map((event) => (
            <CommandItem key={event.id} value={event.name} onSelect={() => handleSelect(event.id)}>
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{event.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{event.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
