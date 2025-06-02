/*
  # Update examinations table RLS policies

  1. Changes
    - Add RLS policies for both authenticated and anon roles
    - Ensure full access for all operations

  2. Security
    - Enable RLS on examinations table
    - Add policies for both authenticated and anon users
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON examinations;
DROP POLICY IF EXISTS "Allow full access for anon users" ON examinations;

-- Create separate policies for each operation
CREATE POLICY "Enable read access for all users" ON examinations
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert access for all users" ON examinations
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON examinations
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON examinations
    FOR DELETE
    TO public
    USING (true);

-- Also add policies for examination_forms table
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON examination_forms;
DROP POLICY IF EXISTS "Allow full access for anon users" ON examination_forms;

CREATE POLICY "Enable read access for all users" ON examination_forms
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable insert access for all users" ON examination_forms
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON examination_forms
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON examination_forms
    FOR DELETE
    TO public
    USING (true);