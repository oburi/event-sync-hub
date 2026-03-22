
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled Event',
  date date,
  time text,
  location text,
  description text,
  status text NOT NULL DEFAULT 'draft',
  raw_content text,
  source_type text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read events for now (no auth yet)
CREATE POLICY "Allow public read access to events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert events for now
CREATE POLICY "Allow public insert access to events"
  ON public.events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update events for now
CREATE POLICY "Allow public update access to events"
  ON public.events FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
