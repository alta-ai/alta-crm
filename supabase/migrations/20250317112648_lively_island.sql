/*
  # Update form type enum with CT consent form

  1. Changes
    - Add 'ct_consent' to form_type_enum
    - Update existing form_type_enum comment

  2. Security
    - Maintain existing RLS policies
*/

-- Add new type to form_type_enum
ALTER TYPE form_type_enum ADD VALUE IF NOT EXISTS 'ct_consent';

-- Update comment
COMMENT ON TYPE form_type_enum IS 'Available form types: registration, cost_reimbursement, privacy, examination, ct_consent, custom';