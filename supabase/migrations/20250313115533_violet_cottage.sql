/*
  # Add form type and data fields

  1. Changes
    - Create form_type_enum type for predefined form types
    - Add form_type column with enum type
    - Add form_data and form_fields columns for storing form configuration

  2. Security
    - Maintain existing RLS policies
*/

-- Create enum type for predefined forms
CREATE TYPE form_type_enum AS ENUM (
  'registration',
  'cost_reimbursement',
  'privacy',
  'examination',
  'custom'
);

-- Add new columns to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS form_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS form_fields jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS form_type form_type_enum DEFAULT 'custom'::form_type_enum NOT NULL;