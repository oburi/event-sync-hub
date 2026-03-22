CREATE POLICY "Allow public delete access to events"
ON public.events
FOR DELETE
TO anon, authenticated
USING (true);