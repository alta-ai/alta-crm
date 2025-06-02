/*
  # Add form field mappings support

  1. Changes
    - Add form_fields column to store field definitions
    - Add api_mappings column to store API key mappings
    - Add api_endpoint column for the target URL

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS api_endpoint text,
ADD COLUMN IF NOT EXISTS api_mappings jsonb DEFAULT '[]'::jsonb;

-- Update form_fields column to have a better default structure
ALTER TABLE forms 
ALTER COLUMN form_fields SET DEFAULT '{"fields": []}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN forms.api_mappings IS 'Array of objects mapping form field IDs to API keys. Structure: [{"fieldId": "string", "apiKey": "string"}]';
COMMENT ON COLUMN forms.form_fields IS 'Object containing form field definitions. Structure: {"fields": [{"id": "string", "type": "string", "label": "string", "required": boolean, ...}]}';