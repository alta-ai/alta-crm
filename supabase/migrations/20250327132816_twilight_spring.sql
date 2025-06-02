/*
  # Add PDF mappings column to forms table

  1. Changes
    - Add pdf_mappings column to forms table
    - Add comment explaining the column structure
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add pdf_mappings column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forms' 
    AND column_name = 'pdf_mappings'
  ) THEN
    ALTER TABLE forms 
    ADD COLUMN pdf_mappings jsonb DEFAULT '[]'::jsonb;

    -- Add comment explaining the structure
    COMMENT ON COLUMN forms.pdf_mappings IS 'Array of objects mapping form fields to PDF fields. Structure: [{"fieldId": "string", "pdfField": "string", "section": "string"}]';
  END IF;
END $$;