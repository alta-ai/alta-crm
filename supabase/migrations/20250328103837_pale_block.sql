/*
  # Add examination sequences and report title

  1. New Tables
    - `examination_sequences`
      - `id` (uuid, primary key)
      - `examination_id` (uuid, foreign key)
      - `name` (text) - Name of the sequence
      - `with_contrast` (boolean) - Whether sequence uses contrast medium
      - `is_standard` (boolean) - Whether sequence is standard/required
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add report_title field to examinations table
    - Add prompt field to examinations table

  3. Security
    - Enable RLS on examination_sequences table
    - Add policies for all operations
*/

-- Create examination_sequences table
CREATE TABLE examination_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id uuid REFERENCES examinations(id) ON DELETE CASCADE,
  name text NOT NULL,
  with_contrast boolean NOT NULL DEFAULT false,
  is_standard boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE examination_sequences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON examination_sequences
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON examination_sequences
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON examination_sequences
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON examination_sequences
    FOR DELETE TO public USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_examination_sequences_updated_at
    BEFORE UPDATE ON examination_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add new columns to examinations table
ALTER TABLE examinations
ADD COLUMN report_title text,
ADD COLUMN prompt text;

-- Add helpful comments
COMMENT ON TABLE examination_sequences IS 'Stores examination sequences with contrast medium and standard flags';
COMMENT ON COLUMN examinations.report_title IS 'Title template for examination reports';
COMMENT ON COLUMN examinations.prompt IS 'Prompt template for AI-assisted report generation';