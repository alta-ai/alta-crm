/*
  # Update forms table RLS policies

  1. Changes
    - Add RLS policies for both authenticated and anon roles
    - Ensure full access for all operations

  2. Security
    - Enable RLS on forms table
    - Add policies for both authenticated and anon users
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON forms;
DROP POLICY IF EXISTS "Allow full access for anon users" ON forms;

-- Create separate policies for each operation
CREATE POLICY "Enable read access for all users" ON forms
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert access for all users" ON forms
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON forms
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON forms
    FOR DELETE
    TO public
    USING (true);