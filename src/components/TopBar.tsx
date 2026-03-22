import { useState, useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppMode } from "@/contexts/AppModeContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { SearchCommand } from "@/components/SearchCommand";

export function TopBar() {
  const navigate = useNavigate();
  const { mode, setMode } = useAppMode();
  const { unreadCount } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
    <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <button onClick={() => setSearchOpen(true)} className="hidden sm:flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 cursor-pointer hover:bg-muted/80 transition-colors">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Search…</span>
          <kbd className="ml-4 rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground border">⌘K</kbd>
        </button>
      </div>
      <div className="flex items-center gap-2">
        {/* Mode Toggle */}
        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => setMode("organizer")}
            className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${mode === "organizer" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Organizer
          </button>
          <button
            onClick={() => setMode("volunteer")}
            className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${mode === "volunteer" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Volunteer
          </button>
        </div>
        <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
          SC
        </div>
      </div>
    </header>
    </>
  );
}
