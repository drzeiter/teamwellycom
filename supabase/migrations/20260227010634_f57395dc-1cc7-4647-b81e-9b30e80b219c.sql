
CREATE TABLE public.user_enrolled_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  program_id uuid NOT NULL REFERENCES public.programs(id),
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  current_week integer NOT NULL DEFAULT 1,
  UNIQUE(user_id, program_id)
);

ALTER TABLE public.user_enrolled_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own enrollments" ON public.user_enrolled_programs
  FOR SELECT USING (public.is_owner(user_id));

CREATE POLICY "Users can insert own enrollments" ON public.user_enrolled_programs
  FOR INSERT WITH CHECK (public.is_owner(user_id));

CREATE POLICY "Users can update own enrollments" ON public.user_enrolled_programs
  FOR UPDATE USING (public.is_owner(user_id));

CREATE POLICY "Users can delete own enrollments" ON public.user_enrolled_programs
  FOR DELETE USING (public.is_owner(user_id));
