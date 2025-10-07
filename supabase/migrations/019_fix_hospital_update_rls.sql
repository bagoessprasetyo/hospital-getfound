-- Fix hospital update RLS policies to ensure proper admin access
-- The issue is that RLS policies rely on JWT claims but API routes check user_profiles table

-- First, let's ensure the JWT claim is properly set for existing users
-- Update all existing admin users to have the correct JWT claim
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', up.role)
FROM user_profiles up
WHERE auth.users.id = up.id AND up.role = 'admin';

-- Drop and recreate the hospital update policy to be more explicit
DROP POLICY IF EXISTS "Admins can update hospitals" ON hospitals;

-- Create a more robust policy that checks both JWT and user_profiles as fallback
CREATE POLICY "Admins can update hospitals" ON hospitals
    FOR UPDATE TO authenticated USING (
        -- Check JWT claim first (primary method)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Also update the delete policy for consistency
DROP POLICY IF EXISTS "Admins can delete hospitals" ON hospitals;

CREATE POLICY "Admins can delete hospitals" ON hospitals
    FOR DELETE TO authenticated USING (
        -- Check JWT claim first (primary method)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Ensure the trigger function is working correctly
-- Recreate the function to handle edge cases
CREATE OR REPLACE FUNCTION public.set_user_role_claim()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's JWT claims with their role
    -- Use COALESCE to handle null raw_app_meta_data
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', NEW.role)
    WHERE id = NEW.id;
    
    -- Log for debugging (remove in production)
    RAISE NOTICE 'Updated user % with role %', NEW.id, NEW.role;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is active
DROP TRIGGER IF EXISTS on_user_profile_role_change ON user_profiles;
CREATE TRIGGER on_user_profile_role_change
    AFTER INSERT OR UPDATE OF role ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_user_role_claim();

-- Force update all existing user profiles to trigger the JWT claim update
UPDATE user_profiles SET role = role WHERE role IS NOT NULL;