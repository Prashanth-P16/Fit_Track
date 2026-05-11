/*
  # Fix user_id NOT NULL constraint blocking anon key writes

  1. Problem
    - All 5 tables have user_id uuid NOT NULL with FK to auth.users(id)
    - The app uses the anon key (no auth session), so user_id is never set
    - This causes all INSERT and UPDATE operations to silently fail
    - Buttons appear non-functional because Supabase rejects writes

  2. Changes
    - Make user_id nullable on all 5 tables (daily_logs, body_measurements,
      exercise_history, suggestion_tracker, user_settings)
    - Set default value for user_id to NULL so inserts without auth succeed
    - Keep the foreign key constraint for when auth is added later

  3. Security
    - No RLS changes — existing open policies remain
    - This is a single-user personal app, open access is intentional
*/

DO $$
BEGIN
  -- daily_logs
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'user_id' AND is_nullable = 'NO') THEN
    ALTER TABLE daily_logs ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE daily_logs ALTER COLUMN user_id SET DEFAULT NULL;
  END IF;

  -- body_measurements
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'body_measurements' AND column_name = 'user_id' AND is_nullable = 'NO') THEN
    ALTER TABLE body_measurements ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE body_measurements ALTER COLUMN user_id SET DEFAULT NULL;
  END IF;

  -- exercise_history
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercise_history' AND column_name = 'user_id' AND is_nullable = 'NO') THEN
    ALTER TABLE exercise_history ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE exercise_history ALTER COLUMN user_id SET DEFAULT NULL;
  END IF;

  -- suggestion_tracker
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suggestion_tracker' AND column_name = 'user_id' AND is_nullable = 'NO') THEN
    ALTER TABLE suggestion_tracker ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE suggestion_tracker ALTER COLUMN user_id SET DEFAULT NULL;
  END IF;

  -- user_settings
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'user_id' AND is_nullable = 'NO') THEN
    ALTER TABLE user_settings ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE user_settings ALTER COLUMN user_id SET DEFAULT NULL;
  END IF;
END $$;
