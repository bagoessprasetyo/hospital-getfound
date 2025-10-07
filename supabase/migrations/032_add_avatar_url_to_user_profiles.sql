-- Add avatar_url column to user_profiles table
-- This fixes the missing column error in booking page

-- Add avatar_url column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for better performance when querying by avatar_url
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_url ON user_profiles(avatar_url);

-- Update existing records to have NULL avatar_url (which is fine)
-- No need to update existing data as NULL is acceptable for this column