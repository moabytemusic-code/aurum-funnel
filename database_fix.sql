-- =========================================================
-- AURUM SECURITY HARDENING: MEMBERS & AFFILIATES
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =========================================================

-----------------------------------------------------------
-- 1. HARDEN aurum_affiliates TABLE
-----------------------------------------------------------

-- Enable RLS and Force it
ALTER TABLE public.aurum_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurum_affiliates FORCE ROW LEVEL SECURITY;

-- Absolute lockdown: Revoke all and grant back ONLY non-sensitive columns
REVOKE ALL ON public.aurum_affiliates FROM anon, authenticated, public;
GRANT SELECT (email, full_name, affiliate_code, status, is_rotator, rotator_pool, created_at, phone, instructions, affiliate_id, hero_title, hero_subtitle, hero_video, brand_name, plan) 
    ON public.aurum_affiliates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.aurum_affiliates TO anon, authenticated;

-- Policies for anon/authenticated (needed for RLS to pass)
DROP POLICY IF EXISTS "Allow public read" ON public.aurum_affiliates;
CREATE POLICY "Allow public read" ON public.aurum_affiliates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON public.aurum_affiliates;
CREATE POLICY "Allow public insert" ON public.aurum_affiliates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON public.aurum_affiliates;
CREATE POLICY "Allow public update" ON public.aurum_affiliates FOR UPDATE USING (true);


-----------------------------------------------------------
-- 2. HARDEN aurum_members TABLE
-----------------------------------------------------------

-- Enable RLS
ALTER TABLE public.aurum_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurum_members FORCE ROW LEVEL SECURITY;

-- Lockdown personal data
REVOKE ALL ON public.aurum_members FROM anon, authenticated, public;
GRANT INSERT, UPDATE ON public.aurum_members TO anon, authenticated;
-- Note: SELECT is NOT granted to anon/authenticated. They must use the RPC below to check status.

-- Policies
DROP POLICY IF EXISTS "Allow public insert" ON public.aurum_members;
CREATE POLICY "Allow public insert" ON public.aurum_members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON public.aurum_members;
CREATE POLICY "Allow public update" ON public.aurum_members FOR UPDATE USING (true);


-----------------------------------------------------------
-- 3. SECURE RPC FUNCTIONS
-----------------------------------------------------------

-- Secure Login (Affiliates)
CREATE OR REPLACE FUNCTION public.check_affiliate_login(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  email TEXT,
  affiliate_code TEXT,
  full_name TEXT,
  status TEXT,
  is_rotator BOOLEAN,
  rotator_pool TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.email, a.affiliate_code, a.full_name, a.status, a.is_rotator, a.rotator_pool, a.created_at
  FROM public.aurum_affiliates a
  WHERE a.email = p_email AND a.password = p_password;
END;
$$;

-- Secure Member Status Check (Members)
-- This allows checking membership without exposing the whole table to select
CREATE OR REPLACE FUNCTION public.get_member_status(p_email TEXT)
RETURNS TABLE (
  email TEXT,
  status TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT m.email, m.status, m.full_name
  FROM public.aurum_members m
  WHERE m.email = p_email;
END;
$$;

-- Secure Search (Affiliates)
CREATE OR REPLACE FUNCTION public.search_affiliates(query TEXT)
RETURNS TABLE (
  email TEXT,
  full_name TEXT,
  affiliate_code TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.email, a.full_name, a.affiliate_code, a.status
  FROM public.aurum_affiliates a
  WHERE a.email ILIKE '%' || query || '%' 
     OR a.affiliate_code ILIKE '%' || query || '%' 
     OR a.full_name ILIKE '%' || query || '%';
END;
$$;

-----------------------------------------------------------
-- 4. HARDEN aurum_tracking TABLE
-----------------------------------------------------------

-- Enable RLS
ALTER TABLE public.aurum_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aurum_tracking FORCE ROW LEVEL SECURITY;

-- Lockdown tracking data
REVOKE ALL ON public.aurum_tracking FROM anon, authenticated, public;
GRANT INSERT ON public.aurum_tracking TO anon, authenticated;
-- Select is ONLY available via Service Role (Master Key) or Superuser

-- Policies
DROP POLICY IF EXISTS "Allow public insert" ON public.aurum_tracking;
CREATE POLICY "Allow public insert" ON public.aurum_tracking FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service select" ON public.aurum_tracking;
CREATE POLICY "Allow service select" ON public.aurum_tracking FOR SELECT TO service_role USING (true);
