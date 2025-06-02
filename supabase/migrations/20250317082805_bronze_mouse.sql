/*
  # Fix authentication schema and admin user

  1. Changes
    - Drop and recreate admin user with correct schema
    - Ensure all required auth fields are present
    - Set email confirmation to true
    - Add proper metadata

  2. Security
    - Use secure password hashing
    - Enable proper authentication flags
*/

-- Drop existing admin user if exists
DELETE FROM auth.users WHERE email LIKE '%@alta-klinik.local';

-- Create admin user with proper schema
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
  updated_at,
  confirmation_token,
  recovery_token,
  instance_id,
  is_super_admin,
  is_sso_user,
  last_sign_in_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_token_new,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_anonymous,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change,
  email_change_sent_at,
  invited_at,
  deleted_at
)
SELECT
  gen_random_uuid(),                    -- id
  'authenticated',                      -- aud
  'authenticated',                      -- role
  'admin@alta-klinik.local',           -- email
  crypt('Admin123!', gen_salt('bf')),  -- encrypted_password
  now(),                               -- email_confirmed_at
  '{"provider": "email", "providers": ["email"]}'::jsonb,  -- raw_app_meta_data
  '{}'::jsonb,                         -- raw_user_meta_data
  now(),                               -- created_at
  now(),                               -- updated_at
  null,                                -- confirmation_token
  null,                                -- recovery_token
  '00000000-0000-0000-0000-000000000000'::uuid,  -- instance_id
  false,                               -- is_super_admin
  false,                               -- is_sso_user
  now(),                               -- last_sign_in_at
  null,                                -- confirmation_sent_at
  null,                                -- recovery_sent_at
  null,                                -- email_change_token_new
  null,                                -- email_change_token_current
  0,                                   -- email_change_confirm_status
  null,                                -- banned_until
  null,                                -- reauthentication_token
  null,                                -- reauthentication_sent_at
  false,                               -- is_anonymous
  null,                                -- phone
  null,                                -- phone_confirmed_at
  null,                                -- phone_change
  null,                                -- phone_change_token
  null,                                -- phone_change_sent_at
  null,                                -- email_change
  null,                                -- email_change_sent_at
  null,                                -- invited_at
  null                                 -- deleted_at
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@alta-klinik.local'
)
RETURNING id;

-- Create user profile and role assignments
DO $$
DECLARE
  admin_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@alta-klinik.local';
  
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'Admin';

  -- Create user profile if it doesn't exist
  INSERT INTO user_profiles (user_id, first_name, last_name)
  SELECT admin_id, 'Admin', 'ALTA Klinik'
  WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = admin_id
  );

  -- Create role assignment if it doesn't exist
  INSERT INTO user_roles (user_id, role_id)
  SELECT admin_id, admin_role_id
  WHERE NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = admin_id AND role_id = admin_role_id
  );
END $$;