import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TeamMemberInput {
  name: string;
  role: string;
  availability: string;
}

export default function OrgSetup() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMemberInput[]>([
    { name: '', role: '', availability: '' }
  ]);

  const addMember = () => setMembers(prev => [...prev, { name: '', role: '', availability: '' }]);
  const removeMember = (i: number) => setMembers(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg space-y-8 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Syncra</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold">Set up your organization</h1>
          <p className="text-sm text-muted-foreground mt-1">Tell us about your club or group.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization / Club Name</label>
            <Input placeholder="CS Student Association" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">School or Community</label>
            <Input placeholder="University of California" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Short Description</label>
            <Input placeholder="We organize tech events for students..." className="mt-1" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Team Members</label>
            <Button variant="ghost" size="sm" onClick={addMember} className="text-xs gap-1">
              <Plus className="h-3 w-3" /> Add member
            </Button>
          </div>
          <div className="space-y-2">
            {members.map((member, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input placeholder="Name" className="flex-1" value={member.name} onChange={e => {
                  const updated = [...members];
                  updated[i].name = e.target.value;
                  setMembers(updated);
                }} />
                <Input placeholder="Role" className="w-28" value={member.role} onChange={e => {
                  const updated = [...members];
                  updated[i].role = e.target.value;
                  setMembers(updated);
                }} />
                <Input placeholder="Availability" className="w-28" value={member.availability} onChange={e => {
                  const updated = [...members];
                  updated[i].availability = e.target.value;
                  setMembers(updated);
                }} />
                {members.length > 1 && (
                  <button onClick={() => removeMember(i)} className="p-1 rounded hover:bg-muted">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={() => navigate('/')} className="w-full gap-1.5">
          Finish Setup
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
