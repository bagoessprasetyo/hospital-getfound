-- Final fix for patients table RLS policies
-- This migration will completely reset all policies and create working ones

-- First, let's see what policies currently exist
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'patients'
ORDER BY policyname;

-- Drop ALL existing policies on patients table (comprehensive cleanup)
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'patients' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON patients', policy_record.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
-- 1. Allow authenticated users to select their own records
CREATE POLICY "patients_select_own" ON patients
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Allow authenticated users to insert their own records
CREATE POLICY "patients_insert_own" ON patients
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Allow authenticated users to update their own records
CREATE POLICY "patients_update_own" ON patients
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Allow authenticated users to delete their own records
CREATE POLICY "patients_delete_own" ON patients
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'patients'
ORDER BY policyname;