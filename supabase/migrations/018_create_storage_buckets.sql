-- Create storage buckets for hospital and doctor images
-- This migration sets up the necessary storage buckets and policies

-- Create hospital images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hospital-images',
  'hospital-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create doctor images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'doctor-images',
  'doctor-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for hospital images
-- Allow authenticated users to upload hospital images
CREATE POLICY "Authenticated users can upload hospital images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'hospital-images' AND
    (auth.jwt() ->> 'user_role')::text = 'admin'
  );

-- Allow public read access to hospital images
CREATE POLICY "Public can view hospital images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'hospital-images');

-- Allow admins to update hospital images
CREATE POLICY "Admins can update hospital images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'hospital-images' AND
    (auth.jwt() ->> 'user_role')::text = 'admin'
  );

-- Allow admins to delete hospital images
CREATE POLICY "Admins can delete hospital images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'hospital-images' AND
    (auth.jwt() ->> 'user_role')::text = 'admin'
  );

-- Create storage policies for doctor images
-- Allow authenticated users to upload doctor images
CREATE POLICY "Authenticated users can upload doctor images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'doctor-images' AND
    (auth.jwt() ->> 'user_role')::text IN ('admin', 'doctor')
  );

-- Allow public read access to doctor images
CREATE POLICY "Public can view doctor images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'doctor-images');

-- Allow doctors to update their own images and admins to update all
CREATE POLICY "Users can update doctor images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'doctor-images' AND
    (
      (auth.jwt() ->> 'user_role')::text = 'admin' OR
      (
        (auth.jwt() ->> 'user_role')::text = 'doctor' AND
        name LIKE '%' || auth.uid()::text || '%'
      )
    )
  );

-- Allow doctors to delete their own images and admins to delete all
CREATE POLICY "Users can delete doctor images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'doctor-images' AND
    (
      (auth.jwt() ->> 'user_role')::text = 'admin' OR
      (
        (auth.jwt() ->> 'user_role')::text = 'doctor' AND
        name LIKE '%' || auth.uid()::text || '%'
      )
    )
  );