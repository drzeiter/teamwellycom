
-- 1) COMPANIES TABLE (no RLS policies yet that reference profiles.company_id)
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  employee_access_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  plan_name text DEFAULT 'starter',
  plan_status text DEFAULT 'active',
  renewal_date date,
  seats integer DEFAULT 50,
  logo_url text,
  accent_color text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 2) ADD company_id + last_active_at TO PROFILES (before any policies reference it)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();

-- 3) NOW create companies RLS policies
CREATE POLICY "Super admins can manage all companies"
  ON public.companies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own company"
  ON public.companies FOR SELECT TO authenticated
  USING (id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- 4) INVITES TABLE
CREATE TABLE public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role_to_assign text NOT NULL DEFAULT 'hr_admin',
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  used_at timestamptz,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all invites"
  ON public.invites FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can manage own company invites"
  ON public.invites FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Anyone can read invites for acceptance"
  ON public.invites FOR SELECT TO authenticated
  USING (true);

-- 5) EVENTS TABLE
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  location text,
  attendance_code text,
  points_award integer DEFAULT 0,
  created_by_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all events"
  ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can manage own company events"
  ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Employees can read own company published events"
  ON public.events FOR SELECT TO authenticated
  USING (status = 'published' AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- 6) EVENT ATTENDANCE
CREATE TABLE public.event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  attended_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all attendance"
  ON public.event_attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can manage own company attendance"
  ON public.event_attendance FOR ALL TO authenticated
  USING (event_id IN (SELECT e.id FROM public.events e WHERE e.company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid())))
  WITH CHECK (event_id IN (SELECT e.id FROM public.events e WHERE e.company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid())));

CREATE POLICY "Employees can read own attendance"
  ON public.event_attendance FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Employees can insert own attendance"
  ON public.event_attendance FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 7) REWARDS TABLE
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  points_cost integer NOT NULL DEFAULT 0,
  inventory_limit integer,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all rewards"
  ON public.rewards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can manage own company rewards"
  ON public.rewards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Employees can read own company rewards"
  ON public.rewards FOR SELECT TO authenticated
  USING (company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- 8) REWARD REDEMPTIONS
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id uuid NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all redemptions"
  ON public.reward_redemptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can manage own company redemptions"
  ON public.reward_redemptions FOR ALL TO authenticated
  USING (reward_id IN (SELECT r.id FROM public.rewards r WHERE r.company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid())))
  WITH CHECK (reward_id IN (SELECT r.id FROM public.rewards r WHERE r.company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid())));

CREATE POLICY "Employees can read own redemptions"
  ON public.reward_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Employees can request redemptions"
  ON public.reward_redemptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 9) WELLY POINTS LEDGER
CREATE TABLE public.welly_points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  points_delta integer NOT NULL,
  reason text NOT NULL,
  related_event_id uuid REFERENCES public.events(id),
  related_challenge_id uuid,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.welly_points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all ledger"
  ON public.welly_points_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can manage own company ledger"
  ON public.welly_points_ledger FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Employees can read own ledger"
  ON public.welly_points_ledger FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 10) CHALLENGES
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  points_award integer NOT NULL DEFAULT 0,
  metric_type text NOT NULL DEFAULT 'custom',
  status text NOT NULL DEFAULT 'draft',
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all challenges"
  ON public.challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can manage own company challenges"
  ON public.challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'hr_admin') AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Employees can read own company published challenges"
  ON public.challenges FOR SELECT TO authenticated
  USING (status = 'published' AND company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- 11) CHALLENGE PARTICIPANTS
CREATE TABLE public.challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  progress_value numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  winner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all participants"
  ON public.challenge_participants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can manage own company participants"
  ON public.challenge_participants FOR ALL TO authenticated
  USING (challenge_id IN (SELECT c.id FROM public.challenges c WHERE c.company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid())))
  WITH CHECK (challenge_id IN (SELECT c.id FROM public.challenges c WHERE c.company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid())));

CREATE POLICY "Employees can read own participation"
  ON public.challenge_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Employees can join challenges"
  ON public.challenge_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employees can update own progress"
  ON public.challenge_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 12) METRICS DAILY
CREATE TABLE public.metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  date date NOT NULL,
  steps integer,
  sleep_score numeric,
  hrv numeric,
  resting_hr numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE public.metrics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can read all metrics"
  ON public.metrics_daily FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR admins can read own company metrics"
  ON public.metrics_daily FOR SELECT TO authenticated
  USING (company_id IN (SELECT p.company_id FROM public.profiles p WHERE p.user_id = auth.uid()));

CREATE POLICY "Users can manage own metrics"
  ON public.metrics_daily FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 13) HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.validate_company_access_code(p_code text)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_company companies%ROWTYPE;
BEGIN
  SELECT * INTO v_company FROM companies WHERE UPPER(employee_access_code) = UPPER(p_code);
  IF NOT FOUND THEN RETURN json_build_object('valid', false, 'error', 'Invalid company access code'); END IF;
  RETURN json_build_object('valid', true, 'company_id', v_company.id, 'company_name', v_company.name);
END;
$$;
