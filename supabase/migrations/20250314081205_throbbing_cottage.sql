/*
  # Add email templates functionality

  1. New Tables
    - `email_templates`
      - `id` (uuid, primary key)
      - `name` (text) - Template name
      - `description` (text) - Template description
      - `trigger_form` (form_type_enum) - Form that triggers the email
      - `recipient_field` (text) - Field ID from form to use as recipient
      - `sender_email` (text) - Sender email address
      - `subject` (text) - Email subject
      - `body` (text) - Email body content
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on email_templates table
    - Add policies for all operations
*/

-- Create email_templates table
CREATE TABLE email_templates (
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

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON email_templates
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON email_templates
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON email_templates
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON email_templates
    FOR DELETE TO public USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();