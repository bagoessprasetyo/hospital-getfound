-- Fix infinite recursion in user_profiles RLS policies
-- The issue is in migration 016 where policies reference other tables that reference back to user_profiles

-- Drop all existing user_profiles policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Can view doctor user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view doctor profiles" ON user_profiles;

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

-- Ensure the trigger function exists to set JWT claims
CREATE OR REPLACE FUNCTION public.set_user_role_claim()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user's JWT claims with their role
    UPDATE auth.users 
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', NEW.role)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to set role claims
DROP TRIGGER IF EXISTS on_user_profile_role_change ON user_profiles;
CREATE TRIGGER on_user_profile_role_change
    AFTER INSERT OR UPDATE OF role ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_user_role_claim();

-- Update existing users' JWT claims with their roles
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', up.role)
FROM user_profiles up
WHERE auth.users.id = up.id;