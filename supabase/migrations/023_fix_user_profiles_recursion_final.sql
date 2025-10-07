-- Fix infinite recursion in user_profiles RLS policies - Final Fix
-- The issue is that the getHospitalsWithDetails function is causing infinite recursion
-- when it tries to access user_profiles through the doctor relationship

-- Drop all existing user_profiles policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Can view doctor user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view doctor profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can view doctor profiles" ON user_profiles;

-- Create simple, non-recursive policies for user_profiles

-- Allow users to view their own profile (no recursion)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (no recursion)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles using JWT claims (no recursion)
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Allow admins to update all profiles using JWT claims (no recursion)
CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Allow public access to doctor profiles only (for public doctor listings)
-- This is safe because we're only checking the role field directly
CREATE POLICY "Public can view doctor profiles" ON user_profiles
    FOR SELECT TO anon, authenticated USING (
        role = 'doctor'
    );

-- Allow admins to insert new profiles using JWT claims (no recursion)
CREATE POLICY "Admins can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (
        (auth.jwt() ->> 'user_role')::text = 'admin'
        OR auth.uid() = id
    );