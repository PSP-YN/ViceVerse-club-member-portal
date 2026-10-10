-- Run this if you have existing tables that are missing columns

-- 1. Ensure Teams table exists and has all columns
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS team_id TEXT UNIQUE;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS team_name TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- 2. Ensure Members table exists and has all columns
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS registration_status BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS registration_by TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS registration_at TIMESTAMPTZ;

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS goodies_status BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS goodies_by TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS goodies_at TIMESTAMPTZ;

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS lunch_status BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS lunch_by TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS lunch_at TIMESTAMPTZ;

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS snacks_status BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS snacks_by TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS snacks_at TIMESTAMPTZ;

-- 3. Ensure Announcements table has all columns
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY
);
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
