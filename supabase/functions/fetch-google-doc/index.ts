import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractTextFromDoc(doc: any): string {
  const lines: string[] = [];

  function processElements(elements: any[]) {
    for (const element of elements) {
      if (element.paragraph) {
        const paragraphText = element.paragraph.elements
          ?.map((e: any) => e.textRun?.content || '')
          .join('') || '';
        lines.push(paragraphText);
      }
      if (element.table) {
        for (const row of element.table.tableRows || []) {
          for (const cell of row.tableCells || []) {
            if (cell.content) processElements(cell.content);
          }
        }
      }
    }
  }

  if (doc.body?.content) {
    processElements(doc.body.content);
  }

  return lines.join('').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, documentId } = await req.json();

    if (!sessionId || !documentId) {
      return new Response(JSON.stringify({ error: 'Missing sessionId or documentId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get stored token
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_session_id', sessionId)
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: 'Not authenticated with Google', needsAuth: true }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let accessToken = tokenData.access_token;

    // Check if token is expired and refresh
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      if (!tokenData.refresh_token) {
        return new Response(JSON.stringify({ error: 'Token expired and no refresh token', needsAuth: true }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      if (!refreshResponse.ok) {
        return new Response(JSON.stringify({ error: 'Token refresh failed', needsAuth: true }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      accessToken = refreshData.access_token;
      await supabase.from('google_tokens').update({
        access_token: accessToken,
        expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('user_session_id', sessionId);
    }

    // Fetch the Google Doc
    const docResponse = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!docResponse.ok) {
      const errBody = await docResponse.text();
      console.error(`Google Docs API error [${docResponse.status}]:`, errBody);
      return new Response(JSON.stringify({ error: `Failed to fetch document: ${docResponse.status}` }), {
        status: docResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const doc = await docResponse.json();
    const plainText = extractTextFromDoc(doc);

    return new Response(JSON.stringify({
      title: doc.title,
      content: plainText,
      documentId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-google-doc:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
