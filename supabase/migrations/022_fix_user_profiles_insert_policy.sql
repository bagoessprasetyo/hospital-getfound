-- Fix user_profiles INSERT policy to allow admin users to create new user profiles
-- The current RLS policies don't have an INSERT policy for admins

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Admins can insert user profiles" ON user_profiles;

-- Create INSERT policy for admins to create new user profiles
CREATE POLICY "Admins can insert user profiles" ON user_profiles
    FOR INSERT TO authenticated WITH CHECK (
        -- Check JWT claim first (primary method)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Also ensure we have proper SELECT and UPDATE policies for admins
-- (These might already exist but let's make sure they're consistent)

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        -- Users can view their own profile
        auth.uid() = id OR
        -- Admins can view all profiles
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        -- Users can update their own profile
        auth.uid() = id OR
        -- Admins can update all profiles
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );