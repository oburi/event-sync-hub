DROP POLICY "Allow all access to google_tokens" ON public.google_tokens;

CREATE POLICY "Deny all client access to google_tokens" ON public.google_tokens
  FOR ALL USING (false) WITH CHECK (false);