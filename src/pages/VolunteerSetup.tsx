import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VolunteerSetup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">Syncra</span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold">Set up your profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Tell us a bit about yourself so organizers can reach you.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input placeholder="Jordan Kim" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Phone Number</label>
            <Input type="tel" placeholder="(555) 123-4567" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Availability</label>
            <Input placeholder="Full day, mornings only, etc." className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">T-Shirt Size</label>
            <Input placeholder="S, M, L, XL" className="mt-1" />
          </div>
        </div>

        <Button onClick={() => navigate("/")} className="w-full gap-1.5">
          Done
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
