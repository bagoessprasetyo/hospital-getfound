-- Fix storage bucket policies to allow authenticated users to upload images
-- This migration removes overly restrictive role-based policies and creates more permissive ones

-- Drop existing restrictive policies for hospital images
DROP POLICY IF EXISTS "Authenticated users can upload hospital images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hospital images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hospital images" ON storage.objects;

-- Drop existing restrictive policies for doctor images
DROP POLICY IF EXISTS "Authenticated users can upload doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update doctor images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete doctor images" ON storage.objects;

-- Create new permissive policies for hospital images
-- Allow any authenticated user to upload hospital images
CREATE POLICY "Authenticated users can upload hospital images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'hospital-images'
  );

-- Allow authenticated users to update hospital images they uploaded
CREATE POLICY "Authenticated users can update hospital images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'hospital-images' AND
    owner = auth.uid()
  );

-- Allow authenticated users to delete hospital images they uploaded
CREATE POLICY "Authenticated users can delete hospital images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'hospital-images' AND
    owner = auth.uid()
  );

-- Create new permissive policies for doctor images
-- Allow any authenticated user to upload doctor images
CREATE POLICY "Authenticated users can upload doctor images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'doctor-images'
  );

-- Allow authenticated users to update doctor images they uploaded
CREATE POLICY "Authenticated users can update doctor images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'doctor-images' AND
    owner = auth.uid()
  );

-- Allow authenticated users to delete doctor images they uploaded
CREATE POLICY "Authenticated users can delete doctor images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'doctor-images' AND
    owner = auth.uid()
  );

-- Note: Public read access policies remain unchanged as they were already correct
-- "Public can view hospital images" and "Public can view doctor images" policies are still active