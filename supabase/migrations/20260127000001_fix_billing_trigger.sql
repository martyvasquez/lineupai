-- Fix billing trigger to use explicit public schema
-- Required because auth triggers run as a different user without public in search_path

CREATE OR REPLACE FUNCTION public.create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, trial_ends_at)
  VALUES (NEW.id, NOW() + INTERVAL '14 days');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
