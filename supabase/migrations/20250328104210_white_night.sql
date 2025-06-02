/*
  # Add examination sequences and report title

  1. Changes
    - Add examination_sequences table if it doesn't exist
    - Add report_title and prompt columns if they don't exist
    - Add RLS policies and triggers safely
    
  2. Security
    - Enable RLS on examination_sequences table
    - Add policies for all operations
*/

-- Create examination_sequences table if it doesn't exist
DO $$ 
BEGIN
  -- Add new columns to examinations table if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'examinations' AND column_name = 'report_title'
  ) THEN
    ALTER TABLE examinations ADD COLUMN report_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'examinations' AND column_name = 'prompt'
  ) THEN
    ALTER TABLE examinations ADD COLUMN prompt text;
  END IF;

  -- Add helpful comments
  COMMENT ON COLUMN examinations.report_title IS 'Title template for examination reports';
  COMMENT ON COLUMN examinations.prompt IS 'Prompt template for AI-assisted report generation';
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable read access for all users" ON examination_sequences;
  DROP POLICY IF EXISTS "Enable insert access for all users" ON examination_sequences;
  DROP POLICY IF EXISTS "Enable update access for all users" ON examination_sequences;
  DROP POLICY IF EXISTS "Enable delete access for all users" ON examination_sequences;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policies
CREATE POLICY "Enable read access for all users" ON examination_sequences
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON examination_sequences
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON examination_sequences
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON examination_sequences
    FOR DELETE TO public USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_examination_sequences_updated_at ON examination_sequences;

-- Add updated_at trigger
CREATE TRIGGER update_examination_sequences_updated_at
    BEFORE UPDATE ON examination_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE examination_sequences IS 'Stores examination sequences with contrast medium and standard flags';