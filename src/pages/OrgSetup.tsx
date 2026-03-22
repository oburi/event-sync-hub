import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, X, Sparkles, Users, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TeamMemberInput {
  name: string;
  role: string;
  availability: string;
}

export default function OrgSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"role" | "org" | null>("role");
  const [members, setMembers] = useState<TeamMemberInput[]>([
    { name: '', role: '', availability: '' }
  ]);

  const addMember = () => setMembers(prev => [...prev, { name: '', role: '', availability: '' }]);
  const removeMember = (i: number) => setMembers(prev => prev.filter((_, idx) => idx !== i));

  if (step === "role") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display">Syncra</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">How will you use Syncra?</h1>
            <p className="text-sm text-muted-foreground mt-1.5">This helps us tailor your experience.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setStep("org")}
              className="rounded-2xl border bg-card p-6 text-left flex flex-col items-center gap-4 py-8 hover:ring-2 hover:ring-primary hover:shadow-warm transition-all shadow-soft"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground font-display">Event Organizer</p>
                <p className="text-xs text-muted-foreground mt-1">I plan and manage events</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/volunteer-setup")}
              className="rounded-2xl border bg-card p-6 text-left flex flex-col items-center gap-4 py-8 hover:ring-2 hover:ring-primary hover:shadow-warm transition-all shadow-soft"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Hand className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground font-display">Volunteer</p>
                <p className="text-xs text-muted-foreground mt-1">I help out at events</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg space-y-8 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display">Syncra</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold font-display">Set up your organization</h1>
          <p className="text-sm text-muted-foreground mt-1.5">Tell us about your club or group — you can always update this later.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization / Club Name</label>
            <Input placeholder="CS Student Association" className="mt-1.5 h-10 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium">School or Community</label>
            <Input placeholder="University of California" className="mt-1.5 h-10 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium">Short Description</label>
            <Input placeholder="We organize tech events for students..." className="mt-1.5 h-10 rounded-xl" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Team Members <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Button variant="ghost" size="sm" onClick={addMember} className="text-xs gap-1">
              <Plus className="h-3 w-3" /> Add member
            </Button>
          </div>
          <div className="space-y-2">
            {members.map((member, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input placeholder="Name" className="flex-1 h-10 rounded-xl" value={member.name} onChange={e => {
                  const updated = [...members];
                  updated[i].name = e.target.value;
                  setMembers(updated);
                }} />
                <Input placeholder="Role" className="w-28 h-10 rounded-xl" value={member.role} onChange={e => {
                  const updated = [...members];
                  updated[i].role = e.target.value;
                  setMembers(updated);
                }} />
                <Input placeholder="Availability" className="w-28 h-10 rounded-xl" value={member.availability} onChange={e => {
                  const updated = [...members];
                  updated[i].availability = e.target.value;
                  setMembers(updated);
                }} />
                {members.length > 1 && (
                  <button onClick={() => removeMember(i)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => navigate('/')} className="w-full gap-1.5 h-11" size="lg">
          Finish Setup
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
