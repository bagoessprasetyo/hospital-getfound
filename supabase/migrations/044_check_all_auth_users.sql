-- Create a function to check all users including deleted ones
-- This will help us understand the actual state of the auth.users table

CREATE OR REPLACE FUNCTION check_all_auth_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  updated_at timestamptz,
  deleted_at timestamptz,
  is_deleted boolean
) 
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    u.last_sign_in_at,
    u.updated_at,
    u.deleted_at,
    (u.deleted_at IS NOT NULL) as is_deleted
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_all_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION check_all_auth_users() TO service_role;