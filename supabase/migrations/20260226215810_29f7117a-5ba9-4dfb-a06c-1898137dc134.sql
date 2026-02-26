
-- Conditions knowledge base cache table
CREATE TABLE public.conditions_kb (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  condition_name text NOT NULL UNIQUE,
  body_region text,
  condition_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags text[] DEFAULT '{}'::text[],
  source_doc text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Program mapping table
CREATE TABLE public.program_mapping (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_name text NOT NULL,
  program_id uuid REFERENCES public.programs(id),
  tags text[] DEFAULT '{}'::text[],
  use_when text[] DEFAULT '{}'::text[],
  body_regions text[] DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Chat saved routines table
CREATE TABLE public.saved_routines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  routine_name text NOT NULL,
  routine_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_condition text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.conditions_kb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_routines ENABLE ROW LEVEL SECURITY;

-- conditions_kb: readable by all authenticated users
CREATE POLICY "conditions_kb_read" ON public.conditions_kb FOR SELECT USING (true);

-- program_mapping: readable by all authenticated users
CREATE POLICY "program_mapping_read" ON public.program_mapping FOR SELECT USING (true);

-- saved_routines: users own their routines
CREATE POLICY "saved_routines_insert" ON public.saved_routines FOR INSERT WITH CHECK (is_owner(user_id));
CREATE POLICY "saved_routines_read" ON public.saved_routines FOR SELECT USING (is_owner(user_id));
CREATE POLICY "saved_routines_delete" ON public.saved_routines FOR DELETE USING (is_owner(user_id));
