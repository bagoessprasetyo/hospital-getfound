-- Completely reset and simplify user_profiles RLS policies
-- This migration fixes the overly restrictive policies causing database query timeouts

-- First, drop ALL existing policies on user_profiles table
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

-- Create simple, non-recursive policies

-- 1. Users can SELECT their own profile (no nested queries)
CREATE POLICY "user_select_own" ON user_profiles
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

-- 2. Users can UPDATE their own profile (no nested queries)
CREATE POLICY "user_update_own" ON user_profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Users can INSERT their own profile during registration (no nested queries)
CREATE POLICY "user_insert_own" ON user_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 4. Public can view doctor profiles for public listings (no auth required)
CREATE POLICY "public_view_doctors" ON user_profiles
    FOR SELECT 
    TO anon, authenticated
    USING (role = 'doctor');

-- 5. Simple admin policies using service role (avoid JWT parsing in policies)
-- Note: These will be used by server-side operations with service role key
CREATE POLICY "service_role_full_access" ON user_profiles
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;
GRANT ALL ON user_profiles TO service_role;