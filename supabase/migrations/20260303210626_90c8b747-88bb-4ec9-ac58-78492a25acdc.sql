
CREATE TABLE public.movement_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assessment_type TEXT NOT NULL DEFAULT 'overhead_squat',
  video_snapshot_url TEXT,
  overall_score INTEGER DEFAULT 0,
  area_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  joint_measurements JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  findings_text TEXT,
  recommended_program_ids UUID[] DEFAULT '{}',
  raw_ai_response JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.movement_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assessments" ON public.movement_assessments
  FOR SELECT USING (is_owner(user_id));

CREATE POLICY "Users can insert own assessments" ON public.movement_assessments
  FOR INSERT WITH CHECK (is_owner(user_id));

CREATE POLICY "Users can delete own assessments" ON public.movement_assessments
  FOR DELETE USING (is_owner(user_id));
