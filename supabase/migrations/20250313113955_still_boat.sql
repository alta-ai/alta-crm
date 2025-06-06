/*
  # Create examination management tables

  1. New Tables
    - `devices`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the device (e.g., "MRT Skyra")
      - `type` (text) - Type of device (e.g., "MRT", "CT")
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `forms`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the form
      - `description` (text) - Description of the form
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `examinations`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the examination
      - `description` (text) - Description of the examination
      - `cost` (numeric) - Cost of the examination
      - `duration` (interval) - Duration of the examination
      - `device_id` (uuid, foreign key) - Reference to devices table
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `examination_forms`
      - `id` (uuid, primary key)
      - `examination_id` (uuid, foreign key)
      - `form_id` (uuid, foreign key)
      - `order` (integer) - Order in which forms should be presented
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin users
*/

-- Create devices table
CREATE TABLE devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users"
  ON devices
  FOR ALL
  TO authenticated
  USING (true);

-- Create forms table
CREATE TABLE forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users"
  ON forms
  FOR ALL
  TO authenticated
  USING (true);

-- Create examinations table
CREATE TABLE examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cost numeric NOT NULL,
  duration interval NOT NULL,
  device_id uuid REFERENCES devices(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users"
  ON examinations
  FOR ALL
  TO authenticated
  USING (true);

-- Create examination_forms table
CREATE TABLE examination_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id uuid REFERENCES examinations(id) ON DELETE CASCADE,
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(examination_id, form_id)
);

ALTER TABLE examination_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access for authenticated users"
  ON examination_forms
  FOR ALL
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_examinations_updated_at
  BEFORE UPDATE ON examinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ROLES
create table if not exists public.roles (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint roles_pkey primary key (id),
  constraint roles_name_key unique (name)
) TABLESPACE pg_default;

-- Disable RLS on auth-related tables to prevent recursion
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

create type public.app_permission as enum ('all.delete', 'all.select', 'all.update', 'all.insert');

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
create trigger update_roles_updated_at BEFORE
update on roles for EACH row
execute FUNCTION update_updated_at_column ();

comment on table public.roles is 'Application roles that can be assigned to users.';

-- USER ROLES
create table if not exists public.user_roles (
  id uuid   PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid not null,
  role_id   uuid references public.roles on delete cascade not null,
  created_at timestamp with time zone null default now(),
  unique (user_id, role_id)
);

-- Disable RLS on user_roles to prevent recursion
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

comment on table public.user_roles is 'Application roles for each user.';

-- Create admin user with correct format
DO $$
DECLARE
  admin_id uuid := 'a22821f9-6e9c-4d97-bd32-74ab22ab72ab';
  admin_role_id uuid;
BEGIN
  -- Create admin user with exact working format
  INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      recovery_sent_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      email_change_confirm_status
  )
  VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test@test.de',
    crypt('password', gen_salt('bf', 10)),
    now(),
    null,  -- confirmation_sent_at = null
    null,
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::text[]),
    jsonb_build_object('email_verified', true),  -- proper user metadata
    null,  -- is_super_admin = null
    now(),
    now(),
    null,
    null,
    '',
    '',
    '',    -- confirmation_token = ''
    '',    -- recovery_token = ''
    '',    -- email_change_token_new = ''
    '',
    '',
    0
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign admin role
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin';
  
  IF admin_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (admin_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END $$;