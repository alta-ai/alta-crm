/*
  # Add email templates functionality

  1. Changes
    - Add RLS policies for email_templates table
    - Add updated_at trigger

  2. Security
    - Enable RLS on email_templates table
    - Add policies for all operations
*/

-- Only enable RLS and add policies if they don't exist
DO $$ 
BEGIN
  -- Enable RLS
  ALTER TABLE IF EXISTS email_templates ENABLE ROW LEVEL SECURITY;

  -- Create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON email_templates
      FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Enable insert access for all users'
  ) THEN
    CREATE POLICY "Enable insert access for all users" ON email_templates
      FOR INSERT TO public WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Enable update access for all users'
  ) THEN
    CREATE POLICY "Enable update access for all users" ON email_templates
      FOR UPDATE TO public USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Enable delete access for all users'
  ) THEN
    CREATE POLICY "Enable delete access for all users" ON email_templates
      FOR DELETE TO public USING (true);
  END IF;

  -- Add updated_at trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_email_templates_updated_at
      BEFORE UPDATE ON email_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;