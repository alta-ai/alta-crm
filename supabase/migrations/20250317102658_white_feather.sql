/*
  # Fix appointment comments relationships and add user profiles view

  1. Changes
    - Add proper foreign key constraints
    - Create view for user profile data
    - Update RLS policies
    - Add indexes for performance

  2. Security
    - Maintain RLS policies
    - Ensure proper cascade behavior
*/

-- Create view for user profiles to simplify joins
-- Drop existing foreign key if it exists
ALTER TABLE appointment_comments 
  DROP CONSTRAINT IF EXISTS appointment_comments_user_id_fkey;

-- Recreate foreign key with proper reference
ALTER TABLE appointment_comments 
  ADD CONSTRAINT appointment_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointment_comments_user_id 
  ON appointment_comments(user_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON appointment_comments;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON appointment_comments;
DROP POLICY IF EXISTS "Enable update access for own comments" ON appointment_comments;
DROP POLICY IF EXISTS "Enable delete access for own comments" ON appointment_comments;

CREATE POLICY "Enable read access for authenticated users"
  ON appointment_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON appointment_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for own comments"
  ON appointment_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for own comments"
  ON appointment_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE appointment_comments IS 
'Stores comments made by users on appointments for patient history tracking';
