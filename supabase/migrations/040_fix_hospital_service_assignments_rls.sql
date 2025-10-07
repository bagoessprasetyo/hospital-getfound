-- Fix RLS policies for hospital_service_assignments table
-- The current policy is too restrictive and preventing service assignments

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage hospital service assignments" ON hospital_service_assignments;
DROP POLICY IF EXISTS "Anyone can view hospital service assignments" ON hospital_service_assignments;

-- Create more permissive policies for hospital_service_assignments

-- Allow public read access to view hospital services
CREATE POLICY "Public can view hospital service assignments" ON hospital_service_assignments
    FOR SELECT USING (true);

-- Allow authenticated users to insert service assignments
CREATE POLICY "Authenticated users can insert hospital service assignments" ON hospital_service_assignments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update service assignments
CREATE POLICY "Authenticated users can update hospital service assignments" ON hospital_service_assignments
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete service assignments
CREATE POLICY "Authenticated users can delete hospital service assignments" ON hospital_service_assignments
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Grant necessary permissions
GRANT SELECT ON hospital_service_assignments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON hospital_service_assignments TO authenticated;