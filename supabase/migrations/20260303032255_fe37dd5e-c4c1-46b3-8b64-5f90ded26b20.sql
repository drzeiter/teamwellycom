
-- Table to store company access codes
CREATE TABLE public.access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  company_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  max_uses integer DEFAULT NULL,
  current_uses integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can validate a code (needed before signup)
CREATE POLICY "Anyone can read active codes"
ON public.access_codes
FOR SELECT
USING (is_active = true);

-- Only admins can manage codes
CREATE POLICY "Admins can manage codes"
ON public.access_codes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add company_code column to profiles to track which code was used
ALTER TABLE public.profiles ADD COLUMN company_code text;

-- Function to validate and consume an access code during signup
CREATE OR REPLACE FUNCTION public.validate_access_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record access_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_record FROM access_codes
  WHERE UPPER(code) = UPPER(p_code) AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid access code');
  END IF;

  IF v_record.max_uses IS NOT NULL AND v_record.current_uses >= v_record.max_uses THEN
    RETURN json_build_object('valid', false, 'error', 'This code has reached its usage limit');
  END IF;

  -- Increment usage count
  UPDATE access_codes SET current_uses = current_uses + 1 WHERE id = v_record.id;

  RETURN json_build_object('valid', true, 'company_name', v_record.company_name);
END;
$$;
