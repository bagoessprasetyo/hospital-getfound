-- Fix RLS policies to ensure booking page can access hospital and doctor data
-- This addresses the PGRST116 error by ensuring proper data access

-- First, ensure hospitals table has proper public access
DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;
DROP POLICY IF EXISTS "Public can view hospitals" ON hospitals;

CREATE POLICY "public_can_view_hospitals" ON hospitals
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Ensure doctors table has proper public access
DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;
DROP POLICY IF EXISTS "Public can view doctors" ON doctors;

CREATE POLICY "public_can_view_doctors" ON doctors
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Ensure doctor_hospitals junction table has proper public access
DROP POLICY IF EXISTS "Anyone can view doctor-hospital relationships" ON doctor_hospitals;
DROP POLICY IF EXISTS "Public can view doctor-hospital relationships" ON doctor_hospitals;

CREATE POLICY "public_can_view_doctor_hospitals" ON doctor_hospitals
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Add missing status column to doctors table if it doesn't exist
-- This is needed for the booking page query that filters by status = 'active'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'status') THEN
        ALTER TABLE doctors ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
        
        -- Update all existing doctors to have 'active' status
        UPDATE doctors SET status = 'active' WHERE status IS NULL;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
    END IF;
END $$;

-- Grant necessary permissions to ensure no access issues
GRANT SELECT ON hospitals TO anon, authenticated;
GRANT SELECT ON doctors TO anon, authenticated;
GRANT SELECT ON doctor_hospitals TO anon, authenticated;
GRANT SELECT ON user_profiles TO anon, authenticated;