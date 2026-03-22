import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Calendar, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLogo } from "@/components/icons/GoogleLogo";

export default function VolunteerSetup() {
  const navigate = useNavigate();
  const [calendarState, setCalendarState] = useState<"idle" | "connecting" | "connected">("idle");

  const handleGoogleCalendarSync = () => {
    setCalendarState("connecting");
    // Simulate OAuth flow
    setTimeout(() => setCalendarState("connected"), 1500);
  };

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
            {calendarState === "connected" ? (
              <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-foreground">Connected: Google Calendar — availability synced</span>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="mt-1 w-full gap-2 justify-center"
                disabled={calendarState === "connecting"}
                onClick={handleGoogleCalendarSync}
              >
                {calendarState === "connecting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleLogo className="h-4 w-4" />
                )}
                {calendarState === "connecting" ? "Connecting…" : "Sync with Google Calendar"}
              </Button>
            )}
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
