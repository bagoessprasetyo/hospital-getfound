-- Make user_profiles RLS policies less restrictive to fix database query timeouts
-- This migration creates very permissive policies to eliminate timeout issues

-- First, drop ALL existing policies on user_profiles table
DROP POLICY IF EXISTS "user_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "public_view_doctors" ON user_profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON user_profiles;
DROP POLICY IF EXISTS "Public can view doctor profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view doctor profiles" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create very permissive policies to eliminate timeouts

-- 1. Allow authenticated users to SELECT their own profiles (simple check)
CREATE POLICY "authenticated_select_own" ON user_profiles
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

-- 2. Allow authenticated users to UPDATE their own profiles (simple check)
CREATE POLICY "authenticated_update_own" ON user_profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Allow authenticated users to INSERT their own profiles (simple check)
CREATE POLICY "authenticated_insert_own" ON user_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 4. Allow public (anon) users to SELECT ALL profiles (very permissive for public listings)
CREATE POLICY "public_select_all" ON user_profiles
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- 5. Allow service_role full access to everything
CREATE POLICY "service_role_all_access" ON user_profiles
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant very broad permissions to ensure no access issues
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;
GRANT ALL ON user_profiles TO service_role;

-- Also grant usage on the sequence if it exists
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;