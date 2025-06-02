/*
  # Add completed flag to appointment comments

  1. Changes
    - Add completed column to appointment_comments table
    - Add check constraint to prevent editing completed comments
    - Add default value of false for completed flag

  2. Security
    - Maintain existing RLS policies
*/

-- Add completed column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointment_comments' 
    AND column_name = 'completed'
  ) THEN
    -- Add completed column with default value false
    ALTER TABLE appointment_comments 
    ADD COLUMN completed boolean NOT NULL DEFAULT false;

    -- Add constraint to prevent updating completed comments
    ALTER TABLE appointment_comments
    ADD CONSTRAINT prevent_completed_comment_updates
    CHECK (
      CASE 
        WHEN completed = true THEN false  -- Prevent any updates to completed comments
        ELSE true
      END
    );
  END IF;
END $$;