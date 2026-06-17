-- ─────────────────────────────────────────────────────────────────
-- Auto-create a user_profiles row for every new auth user.
--
-- Phone (Twilio OTP) logins create an auth.users row but never insert a
-- user_profiles row from the app, so without this trigger those users have
-- no profile. Updating a missing profile matches 0 rows and PostgREST
-- returns 406 Not Acceptable. This (re)creates the trigger so phone, email
-- and OAuth signups all get a profile row automatically.
--
-- Idempotent: safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING;  -- never block signup if a row already exists
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trig_on_auth_user_created ON auth.users;
CREATE TRIGGER trig_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill: create profile rows for any existing auth users that are missing one
-- (e.g. phone users who signed up before this trigger existed).
INSERT INTO public.user_profiles (id, full_name, avatar_url, phone)
SELECT u.id, '', '', u.phone
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE p.id IS NULL;
