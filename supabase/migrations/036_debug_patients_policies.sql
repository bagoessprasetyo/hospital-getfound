-- Debug and fix patients table RLS policies
-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'patients';

-- Drop ALL existing policies on patients table to start fresh
DROP POLICY IF EXISTS "patients_select_policy" ON patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
DROP POLICY IF EXISTS "patients_update_policy" ON patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON patients;
DROP POLICY IF EXISTS "patients_insert_own" ON patients;
DROP POLICY IF EXISTS "patients_select_own" ON patients;
DROP POLICY IF EXISTS "patients_update_own" ON patients;
DROP POLICY IF EXISTS "Enable read access for all users" ON patients;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON patients;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON patients;

-- Create simple, permissive policies
-- Allow authenticated users to select their own records
CREATE POLICY "patients_select_own" ON patients
    FOR SELECT
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Allow authenticated users to insert their own records
CREATE POLICY "patients_insert_own" ON patients
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own records
CREATE POLICY "patients_update_own" ON patients
    FOR UPDATE
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Allow admins to delete any record
CREATE POLICY "patients_delete_admin" ON patients
    FOR DELETE
    USING (auth.jwt() ->> 'role' = 'admin');