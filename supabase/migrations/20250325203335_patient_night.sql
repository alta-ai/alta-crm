/*
  # Drop old form_submissions table

  1. Changes
    - Drop old form_submissions table that has been replaced by specific form tables
    - Remove any associated indexes and triggers
    
  2. Security
    - No security changes needed as table is being removed
*/

-- Drop the old form_submissions table if it exists
DROP TABLE IF EXISTS form_submissions CASCADE;

-- Add helpful comment
COMMENT ON SCHEMA public IS 'Form submissions are now stored in separate tables for each form type';