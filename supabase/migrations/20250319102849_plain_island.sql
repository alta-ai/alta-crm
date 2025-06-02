/*
  # Fix comment completion handling

  1. Changes
    - Remove problematic check constraint
    - Add trigger to handle comment completion logic
    - Allow toggling completion status while preventing content changes
    
  2. Security
    - Maintain data integrity through trigger
    - Prevent unwanted modifications to completed comments
*/

-- Drop existing constraint if it exists
ALTER TABLE appointment_comments
DROP CONSTRAINT IF EXISTS prevent_completed_comment_updates;

-- Create function to handle comment updates
CREATE OR REPLACE FUNCTION handle_comment_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- If the comment was completed
  IF OLD.completed = false AND NEW.completed = true THEN
    -- Only allow changing the completed status
    IF NEW.content != OLD.content THEN
      RAISE EXCEPTION 'Cannot modify content when marking comment as completed';
    END IF;
    RETURN NEW;
  -- If the comment was uncompleted
  ELSIF OLD.completed = true AND NEW.completed = false THEN
    -- Only allow changing the completed status
    IF NEW.content != OLD.content THEN
      RAISE EXCEPTION 'Cannot modify content when unmarking comment as completed';
    END IF;
    RETURN NEW;
  -- If the comment is already completed and trying to modify anything
  ELSIF OLD.completed = true AND NEW.completed = true THEN
    RAISE EXCEPTION 'Cannot modify completed comments';
  END IF;
  
  -- Allow all other updates (for non-completed comments)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS prevent_completed_comment_updates ON appointment_comments;
CREATE TRIGGER prevent_completed_comment_updates
  BEFORE UPDATE ON appointment_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_comment_updates();

-- Add comment explaining the trigger
COMMENT ON FUNCTION handle_comment_updates() IS 
'Handles comment updates to prevent modifications to completed comments while allowing completion status changes';