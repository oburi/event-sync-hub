import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConflictFlag } from "@/lib/mock-data";

interface ConflictDrawerProps {
  open: boolean;
  onClose: () => void;
  conflicts: ConflictFlag[];
}

export default function ConflictDrawer({ open, onClose, conflicts }: ConflictDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l shadow-xl z-50 overflow-auto animate-slide-in-right">
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-base font-semibold">Source Conflicts</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {conflicts.map(conflict => (
            <div key={conflict.id} className="rounded-xl border p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">{conflict.field}</p>
              
              <div className="space-y-2">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{conflict.sourceA.name}</span>
                    <span className="text-[10px] text-muted-foreground">{conflict.sourceA.lastUpdated}</span>
                  </div>
                  <p className="text-sm text-foreground font-medium">{conflict.sourceA.value}</p>
                </div>

                <div className="flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">vs</span>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{conflict.sourceB.name}</span>
                    <span className="text-[10px] text-muted-foreground">{conflict.sourceB.lastUpdated}</span>
                  </div>
                  <p className="text-sm text-foreground font-medium">{conflict.sourceB.value}</p>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-1">Suggested</p>
                <p className="text-sm font-medium text-foreground">{conflict.suggestedValue}</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs">
                  <Check className="h-3 w-3" /> Accept Suggestion
                </Button>
                <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
