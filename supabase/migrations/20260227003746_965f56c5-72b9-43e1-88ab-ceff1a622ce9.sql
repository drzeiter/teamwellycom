
CREATE TABLE public.scheduled_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '2 hours'),
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  program_id UUID REFERENCES public.programs(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks" ON public.scheduled_tasks FOR SELECT USING (is_owner(user_id));
CREATE POLICY "Users can insert own tasks" ON public.scheduled_tasks FOR INSERT WITH CHECK (is_owner(user_id));
CREATE POLICY "Users can update own tasks" ON public.scheduled_tasks FOR UPDATE USING (is_owner(user_id));
CREATE POLICY "Users can delete own tasks" ON public.scheduled_tasks FOR DELETE USING (is_owner(user_id));
