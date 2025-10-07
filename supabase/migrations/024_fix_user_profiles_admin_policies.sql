-- Fix user_profiles RLS policies to allow admin operations without restrictions
-- The current policies are too restrictive for admin users creating doctor profiles

-- Drop all existing user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can view doctor profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;

-- Create more permissive policies for user_profiles

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles using JWT claims
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Allow admins to update all profiles using JWT claims
CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Allow public access to doctor profiles only (for public doctor listings)
CREATE POLICY "Public can view doctor profiles" ON user_profiles
    FOR SELECT TO anon, authenticated USING (
        role = 'doctor'
    );

-- CRITICAL: Allow admins to insert ANY user profile without restrictions
-- This is the key fix - no USING clause restrictions for admin INSERT operations
CREATE POLICY "Admins can insert any profile" ON user_profiles
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Also allow users to insert their own profile (for self-registration)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );