-- ViceVerse Ideathon Platform — Club Member Portal Database Schema
-- Team 4: Puttashankar Prasad (Lead), Prasiddh, Bidappa
-- Run this in your Supabase SQL Editor

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('admin', 'club_member', 'judge', 'team_leader', 'participant')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- TEAMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT UNIQUE NOT NULL, -- e.g. IDN26-042
  team_name TEXT NOT NULL,
  domain TEXT,
  qr_token TEXT UNIQUE, -- secure random token for QR
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),

  -- Event tracking (per member, per activity)
  registration_status BOOLEAN NOT NULL DEFAULT FALSE,
  registration_by TEXT,
  registration_at TIMESTAMPTZ,

  goodies_status BOOLEAN NOT NULL DEFAULT FALSE,
  goodies_by TEXT,
  goodies_at TIMESTAMPTZ,

  lunch_status BOOLEAN NOT NULL DEFAULT FALSE,
  lunch_by TEXT,
  lunch_at TIMESTAMPTZ,

  snacks_status BOOLEAN NOT NULL DEFAULT FALSE,
  snacks_by TEXT,
  snacks_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (team_id, email)
);

-- ============================================================
-- ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure the is_active column exists if the table was created previously
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ============================================================
-- AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name TEXT,
  team_id UUID REFERENCES public.teams(id),
  member_id UUID REFERENCES public.members(id),
  activity TEXT NOT NULL CHECK (activity IN ('registration', 'goodies', 'lunch', 'snacks')),
  action TEXT NOT NULL DEFAULT 'marked_complete',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Teams: authenticated club members can read approved teams
CREATE POLICY "Club members can view approved teams"
  ON public.teams FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() = 'club_member'
    AND payment_status = 'approved'
  );

-- Members: club members can view members
CREATE POLICY "Club members can view members"
  ON public.members FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() = 'club_member'
  );

-- Members: club members can update activity fields only
CREATE POLICY "Club members can update activity status"
  ON public.members FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() = 'club_member'
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_role() = 'club_member'
  );

-- Announcements: all authenticated users can read active announcements
CREATE POLICY "Authenticated can view active announcements"
  ON public.announcements FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND is_active = TRUE
  );

-- Audit logs: club members can insert, admin can read all
CREATE POLICY "Club members can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_role() = 'club_member'
  );

CREATE POLICY "Authenticated can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_teams_team_id ON public.teams(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_qr_token ON public.teams(qr_token);
CREATE INDEX IF NOT EXISTS idx_members_team_id ON public.members(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_team_id ON public.audit_logs(team_id);

-- ============================================================
-- SAMPLE DATA (for testing — remove in production)
-- ============================================================
/*
INSERT INTO public.teams (team_id, team_name, domain, qr_token, payment_status)
VALUES
  ('IDN26-001', 'Code Crusaders', 'AI & ML', 'qr_token_abc123', 'approved'),
  ('IDN26-002', 'Tech Titans', 'Web3', 'qr_token_def456', 'approved'),
  ('IDN26-003', 'Data Dynamos', 'Data Science', 'qr_token_ghi789', 'approved');
*/
