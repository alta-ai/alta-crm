/*
  # Add user management and roles

  1. Changes
    - Create tables if they don't exist
    - Add RLS policies
    - Insert default roles
    - Handle existing tables gracefully

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
  -- Create roles table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roles') THEN
    CREATE TABLE roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      description text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;

  -- Create user_roles table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_roles') THEN
    CREATE TABLE user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, role_id)
    );
  END IF;

  -- Create user_profiles table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      title text,
      first_name text NOT NULL,
      last_name text NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  -- Policies for roles
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON roles;
  DROP POLICY IF EXISTS "Enable insert access for admin users" ON roles;
  DROP POLICY IF EXISTS "Enable update access for admin users" ON roles;
  DROP POLICY IF EXISTS "Enable delete access for admin users" ON roles;

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

  -- Policies for user_roles
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_roles;
  DROP POLICY IF EXISTS "Enable insert access for admin users" ON user_roles;
  DROP POLICY IF EXISTS "Enable update access for admin users" ON user_roles;
  DROP POLICY IF EXISTS "Enable delete access for admin users" ON user_roles;

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

  -- Policies for user_profiles
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
  DROP POLICY IF EXISTS "Enable insert access for admin users" ON user_profiles;
  DROP POLICY IF EXISTS "Enable update access for admin users" ON user_profiles;
  DROP POLICY IF EXISTS "Enable delete access for admin users" ON user_profiles;

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
END $$;

-- Create or replace triggers
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();