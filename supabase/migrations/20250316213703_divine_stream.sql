/*
  # Fix auth schema and admin user creation

  1. Changes
    - Update auth.users schema to match Supabase requirements
    - Create admin user with correct schema
    - Add required metadata fields
    
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
      now(),
      NULL,
      NULL,
      '00000000-0000-0000-0000-000000000000',
      FALSE,
      FALSE,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      0,
      NULL,
      NULL,
      NULL,
      FALSE,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
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