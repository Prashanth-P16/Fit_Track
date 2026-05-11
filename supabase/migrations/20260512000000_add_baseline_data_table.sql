-- Baseline data table for first-time setup
-- Stores starting weight and first measurements
CREATE TABLE IF NOT EXISTS baseline_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  weight decimal(4,1) NOT NULL,
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

-- Enable RLS
ALTER TABLE baseline_data ENABLE ROW LEVEL SECURITY;

-- RLS policy: single-user personal app, open access
CREATE POLICY "Allow full access to baseline_data"
  ON baseline_data FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for date queries
CREATE INDEX IF NOT EXISTS idx_baseline_data_date ON baseline_data(date);
