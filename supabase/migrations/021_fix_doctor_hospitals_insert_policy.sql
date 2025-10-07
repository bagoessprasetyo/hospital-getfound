-- Fix doctor_hospitals INSERT policy to allow admin users to create doctor-hospital relationships
-- The current FOR ALL policy might not be working properly for INSERT operations

-- Drop existing policies to recreate them with explicit INSERT policy
DROP POLICY IF EXISTS "Admins can manage doctor-hospital relationships" ON doctor_hospitals;
DROP POLICY IF EXISTS "Allow cascade deletion from hospitals" ON doctor_hospitals;

-- Keep the SELECT policy as is
-- CREATE POLICY "Anyone can view doctor-hospital relationships" ON doctor_hospitals
--     FOR SELECT TO authenticated, anon USING (true);

-- Create explicit INSERT policy for admins
CREATE POLICY "Admins can insert doctor-hospital relationships" ON doctor_hospitals
    FOR INSERT TO authenticated WITH CHECK (
        -- Check JWT claim first (primary method)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create explicit UPDATE policy for admins
CREATE POLICY "Admins can update doctor-hospital relationships" ON doctor_hospitals
    FOR UPDATE TO authenticated USING (
        -- Check JWT claim first (primary method)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create explicit DELETE policy for admins only
CREATE POLICY "Admins can delete doctor-hospital relationships" ON doctor_hospitals
    FOR DELETE TO authenticated USING (
        -- Check JWT claim first (primary method)
        (auth.jwt() ->> 'user_role')::text = 'admin' OR
        -- Fallback to user_profiles table check
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );