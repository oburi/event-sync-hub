import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ Must be INSIDE the serve handler
    const { sessionId } = await req.json().catch(() => ({}));
    const state = sessionId || "default";

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "GOOGLE_CLIENT_ID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/calendar.readonly",
      access_type: "offline",
      prompt: "consent",
      state: state, // ✅ passes sessionId through OAuth flow
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return new Response(JSON.stringify({ url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in google-auth:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
