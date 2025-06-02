/*
  # Add API authentication support

  1. Changes
    - Add api_auth_token column to store authentication tokens
    - Update form_data structure to include API configuration

  2. Security
    - Maintain existing RLS policies
*/

-- Add new column for API authentication
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS api_auth_token text;

-- Update form_data column comment to include API configuration structure
COMMENT ON COLUMN forms.form_data IS 'Object containing form configuration including API settings. Structure: {"component": "string", "api": {"method": "POST", "format": "JSON", "charset": "Use blog charset", "endpoint": "string", "auth_token": "string"}}';