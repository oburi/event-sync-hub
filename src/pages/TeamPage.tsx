import { Mail, Phone } from "lucide-react";
import { mockTeam } from "@/lib/mock-data";

export default function TeamPage() {
  return (
    <div className="p-5 sm:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Team</h1>
        <p className="text-[14px] text-muted-foreground mt-1.5">Your organization's members and their availability.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockTeam.map(member => (
          <div key={member.id} className="card-elevated">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-[15px] font-medium text-foreground">{member.name}</p>
                <p className="text-[13px] text-muted-foreground">{member.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-[13px] text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5" />
                <span>{member.phone}</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="status-badge status-badge-info">{member.availability}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
