-- =======================================================================
-- SEED DEFAULT USERS SCRIPT
-- =======================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/mejepolqielkftdskajw/sql/new
--
-- Credentials created:
-- 1) Client:
--    Email:    client@test.com
--    Password: TestPassword!2026
--    Role:     client
--
-- 2) Freelancer:
--    Email:    freelancer@test.com
--    Password: TestPassword!2026
--    Role:     freelancer
-- =======================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_client_id uuid;
  v_freelancer_id uuid;
BEGIN
  -- ==========================================
  -- 1. SETUP DEFAULT CLIENT
  -- ==========================================
  SELECT id INTO v_client_id FROM auth.users WHERE email = 'client@test.com';

  IF v_client_id IS NULL THEN
    v_client_id := '11111111-1111-1111-1111-111111111111';
    INSERT INTO auth.users (
      id,
      instance_id,
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
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      v_client_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'client@test.com',
      crypt('TestPassword!2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Default Client"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  ELSE
    UPDATE auth.users
    SET 
      encrypted_password = crypt('TestPassword!2026', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      aud = 'authenticated',
      role = 'authenticated',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object('full_name', 'Default Client'),
      updated_at = now()
    WHERE id = v_client_id;
  END IF;

  -- Ensure auth.identities exists for client (required by GoTrue for password login)
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_client_id AND provider = 'email') THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      v_client_id::text,
      v_client_id,
      jsonb_build_object('sub', v_client_id::text, 'email', 'client@test.com'),
      'email',
      v_client_id::text,
      now(),
      now(),
      now()
    );
  END IF;

  -- Ensure user role is 'client'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_client_id, 'client')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, full_name)
  VALUES (v_client_id, 'Default Client')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Default Client';


  -- ==========================================
  -- 2. SETUP DEFAULT FREELANCER
  -- ==========================================
  SELECT id INTO v_freelancer_id FROM auth.users WHERE email = 'freelancer@test.com';

  IF v_freelancer_id IS NULL THEN
    v_freelancer_id := '22222222-2222-2222-2222-222222222222';
    INSERT INTO auth.users (
      id,
      instance_id,
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
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      v_freelancer_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'freelancer@test.com',
      crypt('TestPassword!2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Default Freelancer"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  ELSE
    UPDATE auth.users
    SET 
      encrypted_password = crypt('TestPassword!2026', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      aud = 'authenticated',
      role = 'authenticated',
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = jsonb_build_object('full_name', 'Default Freelancer'),
      updated_at = now()
    WHERE id = v_freelancer_id;
  END IF;

  -- Ensure auth.identities exists for freelancer (required by GoTrue for password login)
  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_freelancer_id AND provider = 'email') THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      v_freelancer_id::text,
      v_freelancer_id,
      jsonb_build_object('sub', v_freelancer_id::text, 'email', 'freelancer@test.com'),
      'email',
      v_freelancer_id::text,
      now(),
      now(),
      now()
    );
  END IF;

  -- Ensure user role is 'freelancer'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_freelancer_id, 'freelancer')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, full_name, headline, hourly_rate)
  VALUES (v_freelancer_id, 'Default Freelancer', 'Senior Full-Stack Developer', 75.00)
  ON CONFLICT (id) DO UPDATE SET 
    full_name = 'Default Freelancer',
    headline = COALESCE(public.profiles.headline, 'Senior Full-Stack Developer'),
    hourly_rate = COALESCE(public.profiles.hourly_rate, 75.00);

  RAISE NOTICE 'Default client and freelancer successfully seeded!';
END $$;
