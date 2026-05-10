/*
  # FitTrack Core Schema

  1. New Tables
    - `daily_logs`
      - `id` (uuid, primary key)
      - `date` (date, unique) — one log per day
      - `day_num` (integer) — day number since app start (May 12 2026)
      - `meals` (jsonb) — meal tracking data with done/skipped status
      - `water` (integer) — water intake in ml, default 0
      - `workout` (jsonb) — workout completion data
      - `workout_swapped` (boolean) — whether workout was swapped, default false
      - `swap_reason` (text) — reason for swap
      - `sleep` (jsonb) — sleep data (bedtime, wake time, hours)
      - `weight` (decimal) — body weight in kg (Sunday only)
      - `dinner_type` (text) — selected dinner option id
      - `dinner_custom` (jsonb) — custom dinner entry (name, cal, protein)
      - `notes` (text) — daily observations
      - `ai_analysis` (text) — Claude's analysis text
      - `ai_score` (integer) — Claude's score out of 10
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `body_measurements`
      - `id` (uuid, primary key)
      - `date` (date) — measurement date (1st of month)
      - `waist` (decimal) — waist at navel level in cm
      - `hips` (decimal) — widest part in cm
      - `chest` (decimal) — at nipple line in cm
      - `thighs` (decimal) — mid thigh widest in cm
      - `biceps` (decimal) — flexed widest in cm
      - `forearms` (decimal) — widest below elbow in cm
      - `calves` (decimal) — widest lower leg in cm
      - `shoulders` (decimal) — widest across both in cm
      - `neck` (decimal) — mid neck in cm
      - `created_at` (timestamptz)

    - `exercise_history`
      - `id` (uuid, primary key)
      - `date` (date) — workout date
      - `day_num` (integer) — day number in cycle
      - `exercise_name` (text) — exercise name
      - `set_number` (integer) — set 1, 2, or 3
      - `weight` (decimal) — weight in kg
      - `reps` (integer) — reps completed
      - `is_personal_best` (boolean) — marked if new PB, default false
      - `created_at` (timestamptz)

    - `suggestion_tracker`
      - `id` (uuid, primary key)
      - `suggested_date` (date) — date suggestion was made
      - `week_number` (integer) — week number since start
      - `suggestion` (text) — the suggestion text from Claude
      - `category` (text) — diet / gym / sleep / water / supplement
      - `response_type` (text) — pending / implementing / will_do / rejected
      - `rejection_reason` (text) — why user rejected
      - `implemented_date` (date) — when user started implementing
      - `alternative_suggested` (boolean) — was alternative offered, default false
      - `attempt_number` (integer) — attempt count for this problem, default 1
      - `user_feedback` (text) — what happened after
      - `user_feedback_date` (date) — when feedback was given
      - `weight_before` (decimal) — weight when suggested
      - `weight_after` (decimal) — weight 1 week later
      - `weight_change` (decimal) — auto calculated change
      - `keep_change` (boolean) — should this change stay
      - `created_at` (timestamptz)

    - `user_settings`
      - `id` (uuid, primary key)
      - `calorie_target` (integer) — default 1824
      - `protein_target` (integer) — default 169
      - `water_target` (integer) — default 4000
      - `sleep_target` (decimal) — default 7.0
      - `notification_meals` (boolean) — default true
      - `notification_water` (boolean) — default true
      - `notification_measurements` (boolean) — default true
      - `water_reminder_hours` (integer) — default 2
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on ALL tables
    - All tables use permissive policies for single-user personal app
      (Prashanth's personal tracker — no multi-user auth needed yet)
    - Policies allow full CRUD for anon and authenticated roles
      since this is a personal single-user app

  3. Important Notes
    - This is a single-user personal fitness tracker
    - No authentication required initially — Prashanth is the sole user
    - RLS is enabled but policies are open since it's personal use
    - daily_logs.date is UNIQUE to enforce one log per day
    - All timestamps use timestamptz for consistency
*/

-- Daily logs table
CREATE TABLE IF NOT EXISTS daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  day_num integer NOT NULL,
  meals jsonb NOT NULL DEFAULT '{}',
  water integer DEFAULT 0,
  workout jsonb NOT NULL DEFAULT '{}',
  workout_swapped boolean DEFAULT false,
  swap_reason text,
  sleep jsonb NOT NULL DEFAULT '{}',
  weight decimal(4,1),
  dinner_type text,
  dinner_custom jsonb,
  notes text,
  ai_analysis text,
  ai_score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Body measurements table (monthly)
CREATE TABLE IF NOT EXISTS body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  waist decimal(4,1),
  hips decimal(4,1),
  chest decimal(4,1),
  thighs decimal(4,1),
  biceps decimal(4,1),
  forearms decimal(4,1),
  calves decimal(4,1),
  shoulders decimal(4,1),
  neck decimal(4,1),
  created_at timestamptz DEFAULT now()
);

-- Exercise history for progressive overload
CREATE TABLE IF NOT EXISTS exercise_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  day_num integer NOT NULL,
  exercise_name text NOT NULL,
  set_number integer NOT NULL,
  weight decimal(5,2),
  reps integer,
  is_personal_best boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Coach suggestions and memory
CREATE TABLE IF NOT EXISTS suggestion_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_date date NOT NULL,
  week_number integer NOT NULL,
  suggestion text NOT NULL,
  category text NOT NULL,
  response_type text DEFAULT 'pending',
  rejection_reason text,
  implemented_date date,
  alternative_suggested boolean DEFAULT false,
  attempt_number integer DEFAULT 1,
  user_feedback text,
  user_feedback_date date,
  weight_before decimal(4,1),
  weight_after decimal(4,1),
  weight_change decimal(4,1),
  keep_change boolean,
  created_at timestamptz DEFAULT now()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calorie_target integer DEFAULT 1824,
  protein_target integer DEFAULT 169,
  water_target integer DEFAULT 4000,
  sleep_target decimal(3,1) DEFAULT 7.0,
  notification_meals boolean DEFAULT true,
  notification_water boolean DEFAULT true,
  notification_measurements boolean DEFAULT true,
  water_reminder_hours integer DEFAULT 2,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies: single-user personal app, open access
-- These policies allow the anon key (used by the PWA) to fully manage data
-- When auth is added later, these will be tightened

CREATE POLICY "Allow full access to daily_logs"
  ON daily_logs FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to body_measurements"
  ON body_measurements FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to exercise_history"
  ON exercise_history FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to suggestion_tracker"
  ON suggestion_tracker FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to user_settings"
  ON user_settings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_exercise_history_date ON exercise_history(date);
CREATE INDEX IF NOT EXISTS idx_exercise_history_exercise ON exercise_history(exercise_name);
CREATE INDEX IF NOT EXISTS idx_suggestion_tracker_date ON suggestion_tracker(suggested_date);
CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON body_measurements(date);

-- Insert default user settings
INSERT INTO user_settings (calorie_target, protein_target, water_target, sleep_target)
VALUES (1824, 169, 4000, 7.0);
