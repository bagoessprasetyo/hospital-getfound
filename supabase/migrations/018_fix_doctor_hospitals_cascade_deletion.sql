-- Fix RLS policies for doctor_hospitals table to allow CASCADE deletion when hospitals are deleted
-- The issue is that ON DELETE CASCADE operations are blocked by RLS policies

-- Drop existing policy that's too restrictive for cascade operations
DROP POLICY IF EXISTS "Admins can manage doctor-hospital relationships" ON doctor_hospitals;
DROP POLICY IF EXISTS "Anyone can view doctor-hospital relationships" ON doctor_hospitals;

-- Create a policy that allows viewing doctor-hospital relationships
CREATE POLICY "Anyone can view doctor-hospital relationships" ON doctor_hospitals
    FOR SELECT TO authenticated, anon USING (true);

-- Create a policy that allows admins to manage doctor-hospital relationships
-- AND allows cascade deletions to work by checking if the hospital is being deleted
CREATE POLICY "Admins can manage doctor-hospital relationships" ON doctor_hospitals
    FOR ALL USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Create a specific policy for DELETE operations that allows cascade deletion
-- This policy allows deletion when it's part of a cascade operation
CREATE POLICY "Allow cascade deletion from hospitals" ON doctor_hospitals
    FOR DELETE USING (
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Allow deletion if the referenced hospital doesn't exist (cascade scenario)
        NOT EXISTS (SELECT 1 FROM hospitals WHERE hospitals.id = doctor_hospitals.hospital_id)
    );