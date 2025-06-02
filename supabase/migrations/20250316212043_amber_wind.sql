/*
  # Add user management and roles

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text) - Role name (Admin, Verwaltung, MTRA, Arzt)
      - `description` (text) - Role description
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Reference to auth.users
      - `role_id` (uuid, foreign key) - Reference to roles
      - `created_at` (timestamp)

    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - Reference to auth.users
      - `title` (text) - Academic/professional title
      - `first_name` (text) - First name
      - `last_name` (text) - Last name
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create roles table
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles junction table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  title text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for roles
CREATE POLICY "Enable read access for authenticated users" ON roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for admin users" ON roles
    FOR INSERT TO authenticated WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

CREATE POLICY "Enable update access for admin users" ON roles
    FOR UPDATE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

CREATE POLICY "Enable delete access for admin users" ON roles
    FOR DELETE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

-- Create policies for user_roles
CREATE POLICY "Enable read access for authenticated users" ON user_roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for admin users" ON user_roles
    FOR INSERT TO authenticated WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

CREATE POLICY "Enable update access for admin users" ON user_roles
    FOR UPDATE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

CREATE POLICY "Enable delete access for admin users" ON user_roles
    FOR DELETE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

-- Create policies for user_profiles
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for admin users" ON user_profiles
    FOR INSERT TO authenticated WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

CREATE POLICY "Enable update access for admin users" ON user_profiles
    FOR UPDATE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

CREATE POLICY "Enable delete access for admin users" ON user_profiles
    FOR DELETE TO authenticated USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (SELECT id FROM roles WHERE name = 'Admin')
      )
    );

-- Add updated_at triggers
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('Admin', 'Vollzugriff auf alle Funktionen'),
  ('Verwaltung', 'Zugriff auf administrative Funktionen'),
  ('MTRA', 'Zugriff auf Terminplanung und Patientenverwaltung'),
  ('Arzt', 'Zugriff auf medizinische Funktionen und Befunde');