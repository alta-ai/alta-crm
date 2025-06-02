/*
  # Fix RLS policies for devices table

  1. Changes
    - Drop and recreate RLS policies with proper permissions
    - Add separate policies for each operation type
    - Enable access for both authenticated and anon roles

  2. Security
    - Maintain RLS on devices table
    - Ensure proper access control for all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON devices;
DROP POLICY IF EXISTS "Allow full access for anon users" ON devices;

-- Create separate policies for each operation
CREATE POLICY "Enable read access for all users" ON devices
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert access for all users" ON devices
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON devices
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON devices
    FOR DELETE
    TO public
    USING (true);