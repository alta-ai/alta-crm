/*
  # Add form token functionality for appointments

  1. New Tables
    - `form_tokens`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, references appointments)
      - `token` (text, unique)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on form_tokens table
    - Add policies for both authenticated and anon users
    - Add unique constraint on token
*/

-- Create form_tokens table
CREATE TABLE IF NOT EXISTS form_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT form_tokens_token_key UNIQUE (token)
);

-- Enable RLS
ALTER TABLE form_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users"
  ON form_tokens
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON form_tokens
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON form_tokens
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON form_tokens
  FOR DELETE
  TO public
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_form_tokens_updated_at
  BEFORE UPDATE ON form_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate secure random token
CREATE OR REPLACE FUNCTION generate_secure_token() 
RETURNS text 
LANGUAGE plpgsql 
AS $$
DECLARE
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
  rand_bytes bytea;
BEGIN
  -- Generate 32 random characters
  WHILE i < 32 LOOP
    -- Get random bytes
    rand_bytes := gen_random_bytes(1);
    -- Convert to integer and use modulo to get index into chars
    result := result || substr(chars, (get_byte(rand_bytes, 0)::integer % length(chars)) + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN result;
END;
$$;