-- Final fix for patients table RLS policies
-- The issue is that the INSERT policy needs to be more permissive for the booking flow

-- Drop all existing policies on patients table
DROP POLICY IF EXISTS "patients_select_own" ON patients;
DROP POLICY IF EXISTS "patients_insert_own" ON patients;
DROP POLICY IF EXISTS "patients_update_own" ON patients;
DROP POLICY IF EXISTS "patients_admin_all" ON patients;
DROP POLICY IF EXISTS "Patients can view their own profile" ON patients;
DROP POLICY IF EXISTS "Patients can update their own profile" ON patients;
DROP POLICY IF EXISTS "Admins can manage patients" ON patients;
DROP POLICY IF EXISTS "Users can create their own patient profile" ON patients;

-- Create simplified policies that work with the booking flow
-- Allow authenticated users to view patient profiles they have access to
CREATE POLICY "patients_select_policy" ON patients
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'doctor')
        )
    );

-- Allow authenticated users to insert their own patient profile
-- This is crucial for the booking flow when no patient profile exists
CREATE POLICY "patients_insert_policy" ON patients
    FOR INSERT TO authenticated WITH CHECK (
        user_id = auth.uid()
    );

-- Allow users to update their own patient profile
CREATE POLICY "patients_update_policy" ON patients
    FOR UPDATE TO authenticated USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to delete patient profiles
CREATE POLICY "patients_delete_policy" ON patients
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );