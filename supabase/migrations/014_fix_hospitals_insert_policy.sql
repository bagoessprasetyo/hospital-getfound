-- Fix hospitals table RLS policies to allow INSERT operations for authenticated users
-- The current policy only allows admins to perform ALL operations, but we need to allow
-- authenticated users to insert new hospitals

-- Drop all existing policies for hospitals
DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;
DROP POLICY IF EXISTS "Admins can manage hospitals" ON hospitals;
DROP POLICY IF EXISTS "Authenticated users can create hospitals" ON hospitals;
DROP POLICY IF EXISTS "Admins can update hospitals" ON hospitals;
DROP POLICY IF EXISTS "Admins can delete hospitals" ON hospitals;

-- Create separate policies for different operations
-- Allow anyone to view hospitals (SELECT)
CREATE POLICY "Anyone can view hospitals" ON hospitals
    FOR SELECT TO authenticated, anon USING (true);

-- Allow authenticated users to insert hospitals (INSERT)
CREATE POLICY "Authenticated users can create hospitals" ON hospitals
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow admins to update hospitals (UPDATE)
CREATE POLICY "Admins can update hospitals" ON hospitals
    FOR UPDATE TO authenticated USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );

-- Allow admins to delete hospitals (DELETE)
CREATE POLICY "Admins can delete hospitals" ON hospitals
    FOR DELETE TO authenticated USING (
        (auth.jwt() ->> 'user_role')::text = 'admin'
    );