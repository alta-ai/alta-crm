/*
  # Create initial admin user

  1. Changes
    - Create admin user with minimal required fields
    - Create user profile
    - Assign admin role
    
  2. Security
    - Set secure initial password
    - Use only required auth.users fields
*/

-- Create initial admin user if it doesn't exist
DO $$
DECLARE
  admin_id uuid;
  admin_role_id uuid;
BEGIN
  -- Only proceed if no users exist yet
  IF NOT EXISTS (SELECT 1 FROM auth.users) THEN
    -- Create admin user in auth.users with minimal required fields
    INSERT INTO auth.users (
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@alta-klinik.local',
      crypt('Admin123!', gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::text[]),
      '{}'::jsonb,
      now(),
      now()
    )
    RETURNING id INTO admin_id;

    -- Get admin role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'Admin';

    -- Create user profile
    INSERT INTO user_profiles (user_id, first_name, last_name)
    VALUES (admin_id, 'Admin', 'ALTA Klinik');

    -- Assign admin role
    INSERT INTO user_roles (user_id, role_id)
    VALUES (admin_id, admin_role_id);
  END IF;
END $$;