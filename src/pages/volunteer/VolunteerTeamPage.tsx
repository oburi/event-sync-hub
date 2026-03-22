import { Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { volunteerContacts } from "@/lib/volunteer-data";
import { cn } from "@/lib/utils";

const relationshipColor: Record<string, string> = {
  Organizer: "bg-primary/10 text-primary",
  Coordinator: "bg-success/10 text-success",
  Teammate: "bg-secondary text-secondary-foreground",
};

export default function VolunteerTeamPage() {
  const organizers = volunteerContacts.filter((c) => c.relationship === "Organizer");
  const coordinators = volunteerContacts.filter((c) => c.relationship === "Coordinator");
  const teammates = volunteerContacts.filter((c) => c.relationship === "Teammate");

  const groups = [
    { label: "Organizers", contacts: organizers },
    { label: "Coordinators", contacts: coordinators },
    { label: "Teammates", contacts: teammates },
  ].filter((g) => g.contacts.length > 0);

  return (
    <div className="p-5 sm:p-8 max-w-2xl mx-auto space-y-7 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-foreground">My Team</h1>
        <p className="text-[15px] text-muted-foreground mt-1.5">
          People you're working with across your events.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.label}>
          <p className="section-title mb-3">
            {group.label} ({group.contacts.length})
          </p>
          <div className="space-y-2.5">
            {group.contacts.map((contact) => (
              <div
                key={contact.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[14px] font-semibold shrink-0">
                    {contact.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-foreground">{contact.name}</p>
                      <Badge className={cn(
                        "text-[10px] font-medium border-0 px-2 py-0",
                        relationshipColor[contact.relationship] || "bg-secondary text-secondary-foreground"
                      )}>
                        {contact.relationship}
                      </Badge>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{contact.role}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {contact.eventNames.join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3.5 pl-[56px]">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
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
