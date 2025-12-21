-- Localities table (Jaipur locality knowledge graph)
DROP TABLE IF EXISTS public.localities;

CREATE TABLE public.localities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    zone TEXT,
    municipality TEXT,
    ward_number TEXT,
    ward_name TEXT,
    police_station TEXT,
    pin_codes TEXT[],
    assembly_constituency TEXT,
    population_estimate INT,
    geo_lat DOUBLE PRECISION,
    geo_lng DOUBLE PRECISION,
    micro_localities TEXT[],
    nearby_localities TEXT[],
    adjacent_localities TEXT[],
    major_landmarks JSONB,
    connectivity JSONB,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Basic performance index
CREATE INDEX IF NOT EXISTS localities_slug_idx ON public.localities (slug);

-- Row Level Security
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;

-- Public read access (locality pages are public)
CREATE POLICY "Anyone can view localities"
ON public.localities
FOR SELECT
USING (true);

-- Only admins can write (keeps public dataset safe)
CREATE POLICY "Admins can insert localities"
ON public.localities
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update localities"
ON public.localities
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete localities"
ON public.localities
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_localities_set_updated_at ON public.localities;
CREATE TRIGGER trg_localities_set_updated_at
BEFORE UPDATE ON public.localities
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
