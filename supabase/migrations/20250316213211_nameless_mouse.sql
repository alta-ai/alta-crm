/*
  # Create initial admin user

  1. Changes
    - Create admin user with correct auth.users schema
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
    -- Create admin user in auth.users with correct schema
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      raw_user_meta_data,
      raw_app_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      last_sign_in_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      email_confirmed_at,
      encrypted_password,
      confirmation_sent_at,
      recovery_sent_at,
      email_change_sent_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      invited_at,
      is_sso_user,
      deleted_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@alta-klinik.local',
      '{}'::jsonb,
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::text[]),
      FALSE,
      NOW(),
      NOW(),
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NOW(),
      crypt('Admin123!', gen_salt('bf')),
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      FALSE,
      NULL
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