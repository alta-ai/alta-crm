-- Add comment column to appointment_documents if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointment_documents' 
    AND column_name = 'comment'
  ) THEN
    -- Add comment column
    ALTER TABLE appointment_documents 
    ADD COLUMN comment text;
  END IF;
END $$;