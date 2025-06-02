/*
  # Add new form types

  1. Changes
    - Add new form types to form_type_enum
    - Update comment to include new types

  2. Security
    - Maintain existing RLS policies
*/

-- Add new types to form_type_enum
ALTER TYPE form_type_enum ADD VALUE IF NOT EXISTS 'ct_therapy';
ALTER TYPE form_type_enum ADD VALUE IF NOT EXISTS 'mrt_ct_consent';
ALTER TYPE form_type_enum ADD VALUE IF NOT EXISTS 'prostate_questionnaire';

-- Update comment
COMMENT ON TYPE form_type_enum IS 'Available form types: registration, cost_reimbursement, privacy, examination, ct_consent, ct_therapy, mrt_ct_consent, prostate_questionnaire, custom';