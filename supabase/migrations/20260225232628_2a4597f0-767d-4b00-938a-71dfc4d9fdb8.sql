
-- Canonical exercises: unique exercise definitions (no duplicates)
CREATE TABLE public.canonical_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'mobility',
  description TEXT,
  cues JSONB DEFAULT '[]'::jsonb,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  regressions TEXT,
  progressions TEXT,
  media_spec JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_bilateral BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Weekly modules: week 1-12 per program
CREATE TABLE public.weekly_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  focus_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(program_id, week_number)
);

-- Module exercises: junction linking weeks to canonical exercises with per-week instructions
CREATE TABLE public.module_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.weekly_modules(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.canonical_exercises(id) ON DELETE CASCADE,
  sequence_label TEXT NOT NULL DEFAULT 'A',
  sets TEXT,
  reps TEXT,
  hold_duration TEXT,
  frequency TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add region and duration_weeks to programs
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 0;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS equipment_needed TEXT[] DEFAULT '{}';

-- RLS for canonical_exercises (readable by all authenticated)
ALTER TABLE public.canonical_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Canonical exercises readable by authenticated" ON public.canonical_exercises
  FOR SELECT USING (true);

-- RLS for weekly_modules (readable by all authenticated)
ALTER TABLE public.weekly_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Weekly modules readable by authenticated" ON public.weekly_modules
  FOR SELECT USING (true);

-- RLS for module_exercises (readable by all authenticated)
ALTER TABLE public.module_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Module exercises readable by authenticated" ON public.module_exercises
  FOR SELECT USING (true);
