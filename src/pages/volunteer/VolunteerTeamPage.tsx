import { Phone, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { volunteerContacts } from "@/lib/volunteer-data";
import { cn } from "@/lib/utils";

const relationshipColor: Record<string, string> = {
  Organizer: "bg-primary/10 text-primary",
  Coordinator: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
  Teammate: "bg-secondary text-secondary-foreground",
};

export default function VolunteerTeamPage() {
  // Group by relationship
  const organizers = volunteerContacts.filter((c) => c.relationship === "Organizer");
  const coordinators = volunteerContacts.filter((c) => c.relationship === "Coordinator");
  const teammates = volunteerContacts.filter((c) => c.relationship === "Teammate");

  const groups = [
    { label: "Organizers", contacts: organizers },
    { label: "Coordinators", contacts: coordinators },
    { label: "Teammates", contacts: teammates },
  ].filter((g) => g.contacts.length > 0);

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-foreground">My Team</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          People you're working with across your events.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.label}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {group.label} ({group.contacts.length})
          </p>
          <div className="space-y-2.5">
            {group.contacts.map((contact) => (
              <div
                key={contact.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                    {contact.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{contact.name}</p>
                      <Badge className={cn(
                        "text-[10px] font-medium border-0 px-2 py-0",
                        relationshipColor[contact.relationship] || "bg-secondary text-secondary-foreground"
                      )}>
                        {contact.relationship}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{contact.role}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {contact.eventNames.join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pl-[52px]">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
