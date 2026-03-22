import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Upload, Link as LinkIcon, Loader2, CheckCircle2, Sparkles, LogIn, FileUp, MessageSquare } from "lucide-react";
import { NotionLogo } from "@/components/icons/NotionLogo";
import { GoogleDocsLogo } from "@/components/icons/GoogleDocsLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type ImportSource = "notion" | "google_doc" | "pdf" | "slack" | null;
type ImportState = "idle" | "connecting" | "importing" | "processing" | "done";

const SESSION_ID_KEY = "syncra_session_id";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function extractGoogleDocId(url: string): string | null {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

const sources = [
  { id: "notion" as const, name: "Notion", desc: "Import from a Notion page", color: "bg-foreground/5" },
  { id: "google_doc" as const, name: "Google Docs", desc: "Import from Google Docs", color: "bg-blue-50" },
  { id: "pdf" as const, name: "PDF Upload", desc: "Upload a PDF document", color: "bg-red-50" },
  { id: "slack" as const, name: "Slack", desc: "Import from Slack messages", color: "bg-purple-50" },
];

async function callGenerateEventPlan(payload: { text?: string; pdfBase64?: string }) {
  const { data, error } = await supabase.functions.invoke("generate-event-plan", { body: payload });
  if (error || data?.error) throw new Error(data?.error || error?.message || "AI processing failed");
  return data.plan;
}

async function createEventFromPlan(plan: any, sourceType: string, sourceUrl?: string) {
  const { data: newEvent, error } = await supabase
    .from("events")
    .insert({
      name: plan.title || "Imported Event",
      description: plan.description || "",
      date: plan.date || null,
      time: plan.time || null,
      location: plan.location || null,
      raw_content: JSON.stringify(plan),
      source_type: sourceType,
      source_url: sourceUrl || null,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return newEvent.id;
}

export default function EventImport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<ImportSource>(null);
  const [state, setState] = useState<ImportState>("idle");
  const [url, setUrl] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get("google_connected") === "true") {
      setGoogleConnected(true);
      setSelected("google_doc");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const checkGoogleConnection = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("google_tokens" as any)
        .select("id")
        .eq("user_session_id", getSessionId())
        .maybeSingle();
      setGoogleConnected(!!data);
    } catch {
      setGoogleConnected(false);
    }
  }, []);

  useEffect(() => {
    checkGoogleConnection();
  }, [checkGoogleConnection]);

  const handleGoogleAuth = async () => {
    setError(null);
    const sessionId = getSessionId();
    const { data, error: fnError } = await supabase.functions.invoke("google-auth", {
      body: { sessionId },
    });
    if (fnError || data?.error) {
      setError(data?.error || fnError?.message || "Failed to start Google auth");
      return;
    }
    window.location.href = data.url;
  };

  const handleGoogleDocImport = async () => {
    setError(null);
    const documentId = extractGoogleDocId(url);
    if (!documentId) {
      setError("Invalid Google Docs URL. Expected format: https://docs.google.com/document/d/...");
      return;
    }

    setState("connecting");
    try {
      await new Promise((r) => setTimeout(r, 400));
      setState("importing");

      const { data, error: fnError } = await supabase.functions.invoke("fetch-google-doc", {
        body: { sessionId: getSessionId(), documentId },
      });

      if (fnError || data?.error) {
        if (data?.needsAuth) {
          setState("idle");
          setGoogleConnected(false);
          setError("Google authorization expired. Please reconnect.");
          return;
        }
        throw new Error(data?.error || fnError?.message);
      }

      setState("processing");
      const plan = await callGenerateEventPlan({ text: data.content });
      const eventId = await createEventFromPlan(plan, "google_doc", url);

      setState("done");
      setTimeout(() => navigate(`/events/${eventId}`), 1200);
    } catch (err: any) {
      setState("idle");
      setError(err.message || "Failed to import document");
    }
  };

  const handlePdfImport = async () => {
    if (!pdfFile) return;
    setError(null);

    if (pdfFile.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    setState("connecting");
    try {
      await new Promise((r) => setTimeout(r, 300));
      setState("importing");

      // Read file as base64
      const buffer = await pdfFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const pdfBase64 = btoa(binary);

      setState("processing");
      const plan = await callGenerateEventPlan({ pdfBase64 });
      const eventId = await createEventFromPlan(plan, "pdf");

      setState("done");
      setTimeout(() => navigate(`/events/${eventId}`), 1200);
    } catch (err: any) {
      setState("idle");
      setError(err.message || "Failed to import PDF");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError(null);
    } else if (file) {
      setError("Please select a PDF file.");
    }
  };

  const handleNotionImport = async () => {
    setError(null);
    if (!url) return;

    setState("connecting");
    try {
      await new Promise((r) => setTimeout(r, 400));
      setState("importing");

      const { data, error: fnError } = await supabase.functions.invoke("fetch-notion-page", {
        body: { pageUrl: url },
      });

      if (fnError || data?.error) {
        throw new Error(data?.error || fnError?.message);
      }

      setState("processing");
      const plan = await callGenerateEventPlan({ text: data.content });
      const eventId = await createEventFromPlan(plan, "notion", url);

      setState("done");
      setTimeout(() => navigate(`/events/${eventId}`), 1200);
    } catch (err: any) {
      setState("idle");
      setError(err.message || "Failed to import from Notion");
    }
  };

  const handleImport = () => {
    if (selected === "google_doc") {
      handleGoogleDocImport();
      return;
    }
    if (selected === "pdf") {
      handlePdfImport();
      return;
    }
    if (selected === "notion") {
      handleNotionImport();
      return;
    }
  };

  const statusLabel = {
    connecting: selected === "pdf" ? "Reading PDF…" : "Connecting to source…",
    importing: selected === "pdf" ? "Uploading document…" : "Fetching document content…",
    processing: "AI is extracting event details…",
  };

  const statusSub = {
    connecting: "Preparing upload",
    importing: selected === "pdf" ? "Sending to AI for analysis" : "Reading and parsing content",
    processing: "Generating timeline, tasks, and assignments",
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Import Event</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bring in your event details from an existing source. Our AI will extract and organize everything.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-fade-in">
          {error}
        </div>
      )}

      {state === "idle" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => {
                  setSelected(source.id);
                  setError(null);
                  setPdfFile(null);
                }}
                className={`card-elevated text-left transition-all ${
                  selected === source.id ? "ring-2 ring-primary shadow-md" : ""
                }`}
              >
                <div className={`h-10 w-10 rounded-lg ${source.color} flex items-center justify-center text-lg mb-3`}>
                  {source.id === "notion" ? <NotionLogo className="h-5 w-5" /> : source.id === "google_doc" ? <GoogleDocsLogo className="h-5 w-5" /> : source.id === "slack" ? <MessageSquare className="h-5 w-5 text-purple-600" /> : <FileUp className="h-5 w-5 text-muted-foreground" />}
                </div>
                <p className="text-sm font-medium text-foreground">{source.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{source.desc}</p>
              </button>
            ))}
          </div>

          {/* Google Docs - not connected */}
          {selected === "google_doc" && !googleConnected && (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                <LogIn className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Connect your Google account</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Authorize Syncra to read your Google Docs for importing event details.
                </p>
                <Button onClick={handleGoogleAuth} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Connect Google Docs
                </Button>
              </div>
            </div>
          )}

          {/* Google Docs - connected */}
          {selected === "google_doc" && googleConnected && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span>Google account connected</span>
              </div>
              <label className="text-sm font-medium text-foreground">Paste Google Docs URL</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="url"
                    placeholder="https://docs.google.com/document/d/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
                <Button onClick={handleImport} disabled={!url} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Import
                </Button>
              </div>
            </div>
          )}

          {/* Notion */}
          {selected === "notion" && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium text-foreground">Paste URL</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="url"
                    placeholder="https://notion.so/your-page..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
                <Button onClick={handleImport} disabled={!url} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Import
                </Button>
              </div>
            </div>
          )}

          {/* PDF Upload */}
          {selected === "pdf" && (
            <div className="animate-fade-in space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-8 text-center hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  {pdfFile ? pdfFile.name : "Drop PDF here or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pdfFile ? `${(pdfFile.size / 1024 / 1024).toFixed(1)} MB` : "Max 10MB"}
                </p>
              </button>
              {pdfFile && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileUp className="h-3.5 w-3.5 text-green-600" />
                    <span>Ready to import</span>
                  </div>
                  <Button onClick={handleImport} className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Import PDF
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {state !== "idle" && (
        <div className="card-elevated text-center py-12 animate-fade-in">
          {state === "done" ? (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
              <p className="text-lg font-medium text-foreground">Event imported successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to your event dashboard…</p>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
              <p className="text-sm font-medium text-foreground">
                {statusLabel[state as keyof typeof statusLabel]}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {statusSub[state as keyof typeof statusSub]}
              </p>
            </>
          )}

          <div className="flex justify-center gap-1.5 mt-6">
            {["connecting", "importing", "processing", "done"].map((step, i) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  ["connecting", "importing", "processing", "done"].indexOf(state) >= i
                    ? "w-8 bg-primary"
                    : "w-8 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
