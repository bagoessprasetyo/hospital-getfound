-- Fix patients table RLS policies to allow authenticated users to create their own patient profiles
-- This addresses the 42501 RLS policy violation error during appointment booking

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Patients can view their own profile" ON patients;
DROP POLICY IF EXISTS "Patients can update their own profile" ON patients;
DROP POLICY IF EXISTS "Admins can manage patients" ON patients;
DROP POLICY IF EXISTS "Users can create their own patient profile" ON patients;

-- Create new policies with proper INSERT access
-- Allow users to view their own patient profile
CREATE POLICY "patients_select_own" ON patients
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'doctor')
        )
    );

-- Allow users to create their own patient profile
CREATE POLICY "patients_insert_own" ON patients
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Allow users to update their own patient profile
CREATE POLICY "patients_update_own" ON patients
    FOR UPDATE USING (
        user_id = auth.uid()
    );

-- Allow admins to manage all patient profiles
CREATE POLICY "patients_admin_all" ON patients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );