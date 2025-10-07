-- Fix infinite recursion in user_profiles RLS policies
-- The issue is that policies were referencing user_profiles table within their own policy definitions

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Create new policies that don't cause circular references
-- Use auth.jwt() to check user role from JWT token instead of querying user_profiles table

-- Policy for admins to view all profiles using JWT role claim
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Policy for admins to update all profiles using JWT role claim
CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Also fix other policies that reference user_profiles to avoid potential issues

-- Fix hospitals policies
DROP POLICY IF EXISTS "Admins can manage hospitals" ON hospitals;
CREATE POLICY "Admins can manage hospitals" ON hospitals
    FOR ALL USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Fix doctors policies
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Admins can manage doctors" ON doctors;

CREATE POLICY "Doctors can update their own profile" ON doctors
    FOR UPDATE USING (
        user_id = auth.uid() OR
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

CREATE POLICY "Admins can manage doctors" ON doctors
    FOR ALL USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Fix doctor_hospitals policies
DROP POLICY IF EXISTS "Admins can manage doctor-hospital relationships" ON doctor_hospitals;
CREATE POLICY "Admins can manage doctor-hospital relationships" ON doctor_hospitals
    FOR ALL USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Fix patients policies
DROP POLICY IF EXISTS "Patients can view their own profile" ON patients;
DROP POLICY IF EXISTS "Admins can manage patients" ON patients;

CREATE POLICY "Patients can view their own profile" ON patients
    FOR SELECT USING (
        user_id = auth.uid() OR
        (auth.jwt() ->> 'user_role')::text IN ('admin', 'doctor')
    );

CREATE POLICY "Admins can manage patients" ON patients
    FOR ALL USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Fix doctor_availability policies
DROP POLICY IF EXISTS "Doctors can manage their own availability" ON doctor_availability;
CREATE POLICY "Doctors can manage their own availability" ON doctor_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        ) OR
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Fix appointments policies
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients and doctors can update appointments" ON appointments;

CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        ) OR
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

CREATE POLICY "Patients and doctors can update appointments" ON appointments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        ) OR
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Create a function to set user role in JWT claims when user profile is created/updated
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

-- Create trigger to automatically set role claim when user profile is created or updated
DROP TRIGGER IF EXISTS on_user_profile_role_change ON user_profiles;
CREATE TRIGGER on_user_profile_role_change
    AFTER INSERT OR UPDATE OF role ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_user_role_claim();