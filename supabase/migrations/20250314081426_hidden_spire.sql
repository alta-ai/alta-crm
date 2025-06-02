/*
  # Add email templates functionality

  1. Changes
    - Add email_templates table if it doesn't exist
    - Enable RLS and add policies
    - Add updated_at trigger

  2. Security
    - Enable RLS on email_templates table
    - Add policies for all operations
*/

-- Create email_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_form form_type_enum NOT NULL,
  recipient_field text NOT NULL,
  sender_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON email_templates;
    DROP POLICY IF EXISTS "Enable insert access for all users" ON email_templates;
    DROP POLICY IF EXISTS "Enable update access for all users" ON email_templates;
    DROP POLICY IF EXISTS "Enable delete access for all users" ON email_templates;
    
    -- Create new policies
    CREATE POLICY "Enable read access for all users" ON email_templates
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON email_templates
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON email_templates
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON email_templates
        FOR DELETE TO public USING (true);
END $$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();