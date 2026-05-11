/*
  # Restore open RLS policies for single-user personal app

  1. Changes
    - Drop all restrictive auth.uid() = user_id policies from all 5 tables
    - Create permissive "Allow full access" policies for anon and authenticated roles
    - This is a personal single-user app, so open access is intentional

  2. Security
    - All tables allow full read/write for anon and authenticated users
    - This is by design for a personal single-user application

  3. Tables affected
    - daily_logs
    - body_measurements
    - exercise_history
    - suggestion_tracker
    - user_settings
*/

-- Drop restrictive policies on daily_logs
DROP POLICY IF EXISTS "Users can read own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can insert own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can update own daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can delete own daily logs" ON daily_logs;

-- Drop restrictive policies on body_measurements
DROP POLICY IF EXISTS "Users can read own body measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can insert own body measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can update own body measurements" ON body_measurements;
DROP POLICY IF EXISTS "Users can delete own body measurements" ON body_measurements;

-- Drop restrictive policies on exercise_history
DROP POLICY IF EXISTS "Users can read own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can insert own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can update own exercise history" ON exercise_history;
DROP POLICY IF EXISTS "Users can delete own exercise history" ON exercise_history;

-- Drop restrictive policies on suggestion_tracker
DROP POLICY IF EXISTS "Users can read own suggestions" ON suggestion_tracker;
DROP POLICY IF EXISTS "Users can insert own suggestions" ON suggestion_tracker;
DROP POLICY IF EXISTS "Users can update own suggestions" ON suggestion_tracker;
DROP POLICY IF EXISTS "Users can delete own suggestions" ON suggestion_tracker;

-- Drop restrictive policies on user_settings
DROP POLICY IF EXISTS "Users can read own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

-- Create open policies for daily_logs
CREATE POLICY "Allow full access to daily_logs"
  ON daily_logs FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create open policies for body_measurements
CREATE POLICY "Allow full access to body_measurements"
  ON body_measurements FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create open policies for exercise_history
CREATE POLICY "Allow full access to exercise_history"
  ON exercise_history FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create open policies for suggestion_tracker
CREATE POLICY "Allow full access to suggestion_tracker"
  ON suggestion_tracker FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create open policies for user_settings
CREATE POLICY "Allow full access to user_settings"
  ON user_settings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
