/*
  # Add body side selection and report title to examinations

  1. Changes
    - Add requires_body_side column to examinations table
    - Add report_title_template column to examinations table
    - Update existing records with default values

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to examinations table
ALTER TABLE examinations 
ADD COLUMN IF NOT EXISTS requires_body_side boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS report_title_template text;

-- Add helpful comments
COMMENT ON COLUMN examinations.requires_body_side IS 'Indicates if body side selection (left/right) is required for this examination';
COMMENT ON COLUMN examinations.report_title_template IS 'Template for report title with placeholders like {{bodyside}} and {{date}}';

-- Update existing records with default report title template
UPDATE examinations 
SET report_title_template = name || ' {{bodyside}}' 
WHERE requires_body_side = true 
  AND report_title_template IS NULL;