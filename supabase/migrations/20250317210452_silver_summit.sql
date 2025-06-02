/*
  # Add device working hours functionality

  1. New Tables
    - `device_working_hours`
      - `id` (uuid, primary key)
      - `device_id` (uuid, foreign key)
      - `day_of_week` (integer) - 1 (Monday) to 7 (Sunday)
      - `start_time` (time) - Start of working hours
      - `end_time` (time) - End of working hours
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `device_working_hours_exceptions`
      - `id` (uuid, primary key)
      - `device_id` (uuid, foreign key)
      - `start_date` (date) - Start date of exception period
      - `end_date` (date) - End date of exception period
      - `start_time` (time) - Temporary start time
      - `end_time` (time) - Temporary end time
      - `reason` (text) - Reason for the exception
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for all operations
*/

-- Create device_working_hours table
CREATE TABLE device_working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_working_hours CHECK (end_time > start_time),
  
  -- Only one time range per device per day
  UNIQUE(device_id, day_of_week)
);

-- Create device_working_hours_exceptions table
CREATE TABLE device_working_hours_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time,
  end_time time,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure end_date is after or equal to start_date
  CONSTRAINT valid_exception_dates CHECK (end_date >= start_date),
  
  -- If times are provided, ensure end_time is after start_time
  CONSTRAINT valid_exception_times CHECK (
    (start_time IS NULL AND end_time IS NULL) OR
    (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- Enable RLS
ALTER TABLE device_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_working_hours_exceptions ENABLE ROW LEVEL SECURITY;

-- Create policies for device_working_hours
CREATE POLICY "Enable read access for all users" ON device_working_hours
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON device_working_hours
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON device_working_hours
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON device_working_hours
    FOR DELETE TO public USING (true);

-- Create policies for device_working_hours_exceptions
CREATE POLICY "Enable read access for all users" ON device_working_hours_exceptions
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON device_working_hours_exceptions
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON device_working_hours_exceptions
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON device_working_hours_exceptions
    FOR DELETE TO public USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_device_working_hours_updated_at
    BEFORE UPDATE ON device_working_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_working_hours_exceptions_updated_at
    BEFORE UPDATE ON device_working_hours_exceptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE device_working_hours IS 
'Stores regular working hours for each device per day of week';

COMMENT ON TABLE device_working_hours_exceptions IS 
'Stores temporary changes to device working hours (e.g., maintenance, holidays)';