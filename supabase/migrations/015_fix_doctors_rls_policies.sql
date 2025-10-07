-- Fix doctors table RLS policies to allow authenticated users to read doctor data
-- The current policies are too restrictive and prevent normal users from viewing doctor information

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view active doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
DROP POLICY IF EXISTS "Admins can manage all doctors" ON doctors;
DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;
DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;

-- Create new policies that allow proper access
-- Allow authenticated and anonymous users to view all doctors (for public doctor listings)
CREATE POLICY "Anyone can view doctors" ON doctors
    FOR SELECT TO authenticated, anon USING (true);

-- Drop and recreate doctors update policy
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;

-- Allow doctors to update their own profile
CREATE POLICY "Doctors can update their own profile" ON doctors
    FOR UPDATE USING (
        user_id = auth.uid() OR
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Allow admins to manage all doctors (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage doctors" ON doctors
    FOR ALL USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Also ensure user_profiles can be read by authenticated users for joins
-- Drop existing restrictive policies on user_profiles if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view doctor profiles" ON user_profiles;

-- Create new policy to allow authenticated users to read user profiles (needed for joins)
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (
        auth.uid() = id OR
        (auth.jwt() ->> 'user_role')::text IN ('admin', 'doctor')
    );

-- Allow authenticated users to read user profiles for doctor information
CREATE POLICY "Authenticated users can view doctor profiles" ON user_profiles
    FOR SELECT TO authenticated USING (
        role = 'doctor' OR
        auth.uid() = id OR
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );