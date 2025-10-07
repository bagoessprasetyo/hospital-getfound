-- Fix RLS policies for doctor_availability table to allow authenticated users to view availability
-- while keeping admin-only access for modifications

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view availability" ON doctor_availability;
DROP POLICY IF EXISTS "Admins can manage availability" ON doctor_availability;
DROP POLICY IF EXISTS "Doctors can view their own availability" ON doctor_availability;
DROP POLICY IF EXISTS "Anonymous can view active availability" ON doctor_availability;
DROP POLICY IF EXISTS "Doctors can manage their own availability" ON doctor_availability;

-- Allow authenticated users to view doctor availability (for booking appointments)
CREATE POLICY "Authenticated users can view availability" ON doctor_availability
    FOR SELECT TO authenticated USING (true);

-- Allow anonymous users to view active availability (for public doctor listings)
CREATE POLICY "Anonymous can view active availability" ON doctor_availability
    FOR SELECT TO anon USING (is_active = true);

-- Allow doctors to view their own availability
CREATE POLICY "Doctors can view their own availability" ON doctor_availability
    FOR SELECT USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Allow admins to manage all availability (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage availability" ON doctor_availability
    FOR ALL USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Allow doctors to manage their own availability
CREATE POLICY "Doctors can manage their own availability" ON doctor_availability
    FOR ALL USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE user_id = auth.uid()
        )
    );