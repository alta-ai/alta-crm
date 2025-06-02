-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON appointment_comments;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON appointment_comments;
DROP POLICY IF EXISTS "Enable update access for own comments" ON appointment_comments;
DROP POLICY IF EXISTS "Enable delete access for own comments" ON appointment_comments;

-- Create new policies that allow public access
CREATE POLICY "Enable read access for all users" ON appointment_comments
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON appointment_comments
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON appointment_comments
    FOR UPDATE TO public USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON appointment_comments
    FOR DELETE TO public USING (true);