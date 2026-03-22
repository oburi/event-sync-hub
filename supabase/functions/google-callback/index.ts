import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response('Missing code parameter', { status: 400 });
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return new Response(`Token exchange failed: ${JSON.stringify(tokenData)}`, { status: 400 });
    }

    // Store tokens in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Use a default session id since we're not passing state
    const sessionId = 'default';

    await supabase.from('google_tokens').upsert({
      user_session_id: sessionId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      scopes: tokenData.scope,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_session_id' });

    // Redirect back to the app
    const returnUrl = 'https://id-preview--d468a051-3e18-4936-bc66-114f8110ceea.lovable.app/events/import?google_connected=true';

    return new Response(null, {
      status: 302,
      headers: { Location: returnUrl },
    });
  } catch (error) {
    console.error('Error in google-callback:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});
