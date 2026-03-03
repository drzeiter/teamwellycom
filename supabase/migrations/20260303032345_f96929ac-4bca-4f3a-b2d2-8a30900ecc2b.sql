
-- Update handle_new_user to store company_code from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, company_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'company_code'
  );
  
  INSERT INTO public.welly_points (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;
