-- Fix doctor update RLS policies to ensure proper admin access
-- Similar to the hospital fix, ensure RLS policies work with both JWT claims and user_profiles fallback

-- First, ensure all existing admin users have the correct JWT claim for doctors operations
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', up.role)
FROM user_profiles up
WHERE auth.users.id = up.id AND up.role = 'admin';

-- Drop and recreate the doctor update policy to be more robust
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;

-- Create a more robust policy that checks both JWT and user_profiles as fallback
CREATE POLICY "Doctors can update their own profile" ON doctors
    FOR UPDATE TO authenticated USING (
        -- Allow doctors to update their own profile
        user_id = auth.uid() OR
        -- Check JWT claim first (primary method for admins)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check for admins
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Also update the admin management policy for consistency
DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;

CREATE POLICY "Admins can manage doctors" ON doctors
    FOR ALL TO authenticated USING (
        -- Check JWT claim first (primary method)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Ensure INSERT policy allows admins to create doctors
DROP POLICY IF EXISTS "Admins can create doctors" ON doctors;

CREATE POLICY "Admins can create doctors" ON doctors
    FOR INSERT TO authenticated WITH CHECK (
        -- Check JWT claim first (primary method)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Force update all existing user profiles to trigger the JWT claim update
UPDATE user_profiles SET role = role WHERE role IS NOT NULL;