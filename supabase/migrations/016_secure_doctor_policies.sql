-- Fix RLS policies to be more secure while allowing necessary access
-- Only allow viewing doctor profiles for legitimate use cases

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;
DROP POLICY IF EXISTS "Authenticated users can view doctor profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Can view doctor user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view doctors" ON doctors;
DROP POLICY IF EXISTS "Anonymous can view doctors" ON doctors;

-- Create more secure policies for doctors table
-- Allow authenticated users to view doctors for booking appointments
CREATE POLICY "Authenticated users can view doctors" ON doctors
    FOR SELECT TO authenticated USING (true);

-- Allow anonymous users to view basic doctor info for public listings
CREATE POLICY "Anonymous can view doctors" ON doctors
    FOR SELECT TO anon USING (true);

-- Create more secure policies for user_profiles table
-- Allow viewing doctor profiles only when they are doctors and for legitimate purposes
CREATE POLICY "Can view doctor user profiles" ON user_profiles
    FOR SELECT TO authenticated, anon USING (
        role = 'doctor' AND 
        EXISTS (
            SELECT 1 FROM doctors 
            WHERE doctors.user_id = user_profiles.id
        )
    );

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Drop and recreate admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING ((auth.jwt() ->> 'user_role')::text = 'admin');