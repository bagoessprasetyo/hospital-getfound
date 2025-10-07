-- Completely disable RLS for hospital_service_assignments table
-- The RLS policies are causing issues with service assignments

-- Drop all existing policies first
DROP POLICY IF EXISTS "Public can view hospital service assignments" ON hospital_service_assignments;
DROP POLICY IF EXISTS "Authenticated users can insert hospital service assignments" ON hospital_service_assignments;
DROP POLICY IF EXISTS "Authenticated users can update hospital service assignments" ON hospital_service_assignments;
DROP POLICY IF EXISTS "Authenticated users can delete hospital service assignments" ON hospital_service_assignments;
DROP POLICY IF EXISTS "Authenticated users can manage hospital service assignments" ON hospital_service_assignments;
DROP POLICY IF EXISTS "Anyone can view hospital service assignments" ON hospital_service_assignments;

-- Disable RLS entirely for this table
ALTER TABLE hospital_service_assignments DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to ensure no access issues
GRANT ALL PRIVILEGES ON hospital_service_assignments TO anon, authenticated, service_role;

-- Also ensure the hospital_services table is accessible
GRANT ALL PRIVILEGES ON hospital_services TO anon, authenticated, service_role;