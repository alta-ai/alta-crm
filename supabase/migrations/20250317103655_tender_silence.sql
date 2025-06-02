/*
  # Fix appointment comments schema and relationships

  1. Changes
    - Create appointment_comments table if not exists
    - Set up proper relationships and cascading deletes
    - Create updated_at trigger
    - Create user_profile_view
    - Set up RLS policies
    - Add performance indexes
    - Add helpful comments

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Ensure proper cascading behavior
*/

-- Create appointment_comments table if not exists
CREATE TABLE IF NOT EXISTS public.appointment_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_appointment_comments_updated_at ON appointment_comments;
CREATE TRIGGER update_appointment_comments_updated_at
    BEFORE UPDATE ON public.appointment_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create or replace user_profile_view
CREATE OR REPLACE VIEW user_profile_view AS
SELECT 
  u.id as user_id,
  up.title,
  up.first_name,
  up.last_name
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.user_id = u.id;

-- Enable RLS
ALTER TABLE appointment_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON appointment_comments;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON appointment_comments;
DROP POLICY IF EXISTS "Enable update access for own comments" ON appointment_comments;
DROP POLICY IF EXISTS "Enable delete access for own comments" ON appointment_comments;

-- Create new RLS policies
CREATE POLICY "Enable read access for authenticated users"
  ON appointment_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON appointment_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for own comments"
  ON appointment_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for own comments"
  ON appointment_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_appointment_comments_appointment_id 
  ON appointment_comments(appointment_id);
  
CREATE INDEX IF NOT EXISTS idx_appointment_comments_user_id 
  ON appointment_comments(user_id);

-- Add helpful comments
COMMENT ON TABLE appointment_comments IS 
  'Speichert Kommentare von Benutzern zu Terminen für die Patientenhistorie';

COMMENT ON VIEW user_profile_view IS
  'Bietet einfachen Zugriff auf Benutzerprofildaten einschließlich Name und Titel';