-- Drop and recreate admin user with correct credentials
DO $$
DECLARE
  admin_id uuid;
  admin_role_id uuid;
BEGIN
  -- Delete existing admin user if exists
  DELETE FROM auth.users WHERE email = 'admin@alta-klinik.local';
  
  -- Create admin user with simple login
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

  -- Delete existing profile if exists
  DELETE FROM user_profiles WHERE user_id = admin_id;
  
  -- Create user profile
  INSERT INTO user_profiles (user_id, first_name, last_name)
  VALUES (admin_id, 'Admin', 'ALTA Klinik');

  -- Delete existing role assignments
  DELETE FROM user_roles WHERE user_id = admin_id;
  
  -- Assign admin role
  INSERT INTO user_roles (user_id, role_id)
  VALUES (admin_id, admin_role_id);
END $$;