import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Upload, FileText, Link as LinkIcon, Loader2, CheckCircle2, Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type ImportSource = 'notion' | 'google_doc' | 'pdf' | null;
type ImportState = 'idle' | 'connecting' | 'importing' | 'processing' | 'done';

const SESSION_ID_KEY = 'syncra_session_id';

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
  { id: 'notion' as const, name: 'Notion', icon: '📝', desc: 'Import from a Notion page', color: 'bg-foreground/5' },
  { id: 'google_doc' as const, name: 'Google Docs', icon: '📄', desc: 'Import from Google Docs', color: 'bg-blue-50' },
  { id: 'pdf' as const, name: 'PDF Upload', icon: '📎', desc: 'Upload a PDF document', color: 'bg-red-50' },
];

export default function EventImport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<ImportSource>(null);
  const [state, setState] = useState<ImportState>('idle');
  const [url, setUrl] = useState('');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if returning from Google OAuth
  useEffect(() => {
    if (searchParams.get('google_connected') === 'true') {
      setGoogleConnected(true);
      setSelected('google_doc');
      // Clean the query param from the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const checkGoogleConnection = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('google_tokens' as any)
        .select('id')
        .eq('user_session_id', 'default')
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
    const { data, error: fnError } = await supabase.functions.invoke('google-auth');

    if (fnError || data?.error) {
      setError(data?.error || fnError?.message || 'Failed to start Google auth');
      return;
    }

    window.location.href = data.url;
  };

  const handleGoogleDocImport = async () => {
    setError(null);
    const documentId = extractGoogleDocId(url);
    if (!documentId) {
      setError('Invalid Google Docs URL. Expected format: https://docs.google.com/document/d/...');
      return;
    }

    setState('connecting');
    try {
      // Step 1: Connecting
      await new Promise(r => setTimeout(r, 500));
      setState('importing');

      // Step 2: Fetch document
      const { data, error: fnError } = await supabase.functions.invoke('fetch-google-doc', {
        body: { sessionId: 'default', documentId },
      });

      if (fnError || data?.error) {
        if (data?.needsAuth) {
          setState('idle');
          setGoogleConnected(false);
          setError('Google authorization expired. Please reconnect.');
          return;
        }
        throw new Error(data?.error || fnError?.message);
      }

      setState('processing');
      setFetchedContent(data.content);

      // Step 3: Simulate AI processing
      await new Promise(r => setTimeout(r, 2000));

      setState('done');
      setTimeout(() => navigate('/events'), 1500);
    } catch (err: any) {
      setState('idle');
      setError(err.message || 'Failed to import document');
    }
  };

  const handleImport = () => {
    if (selected === 'google_doc') {
      handleGoogleDocImport();
      return;
    }
    // Simulated flow for notion/pdf
    setState('connecting');
    setTimeout(() => setState('importing'), 1200);
    setTimeout(() => setState('processing'), 2800);
    setTimeout(() => {
      setState('done');
      setTimeout(() => navigate('/events'), 1500);
    }, 4500);
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

      {state === 'idle' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sources.map(source => (
              <button
                key={source.id}
                onClick={() => { setSelected(source.id); setError(null); }}
                className={`card-elevated text-left transition-all ${
                  selected === source.id ? 'ring-2 ring-primary shadow-md' : ''
                }`}
              >
                <div className={`h-10 w-10 rounded-lg ${source.color} flex items-center justify-center text-lg mb-3`}>
                  {source.icon}
                </div>
                <p className="text-sm font-medium text-foreground">{source.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{source.desc}</p>
              </button>
            ))}
          </div>

          {selected === 'google_doc' && !googleConnected && (
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

          {selected === 'google_doc' && googleConnected && (
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
                    onChange={e => setUrl(e.target.value)}
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

          {selected === 'notion' && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium text-foreground">Paste URL</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="url"
                    placeholder="https://notion.so/your-page..."
                    value={url}
                    onChange={e => setUrl(e.target.value)}
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

          {selected === 'pdf' && (
            <div className="animate-fade-in">
              <button
                onClick={handleImport}
                className="w-full rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-8 text-center hover:border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">Drop PDF here or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
              </button>
            </div>
          )}
        </>
      )}

      {state !== 'idle' && (
        <div className="card-elevated text-center py-12 animate-fade-in">
          {state === 'done' ? (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
              <p className="text-lg font-medium text-foreground">Event imported successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to your event dashboard…</p>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
              <p className="text-sm font-medium text-foreground">
                {state === 'connecting' && 'Connecting to Google Docs…'}
                {state === 'importing' && 'Fetching document content…'}
                {state === 'processing' && 'AI is extracting event details…'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {state === 'connecting' && 'Establishing connection'}
                {state === 'importing' && 'Reading and parsing content'}
                {state === 'processing' && 'Generating timeline, tasks, and volunteer assignments'}
              </p>
            </>
          )}

          <div className="flex justify-center gap-1.5 mt-6">
            {['connecting', 'importing', 'processing', 'done'].map((step, i) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  ['connecting', 'importing', 'processing', 'done'].indexOf(state) >= i
                    ? 'w-8 bg-primary'
                    : 'w-8 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
