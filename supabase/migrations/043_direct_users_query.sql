-- Create a function to execute the exact SQL query for all users
-- This function executes the raw SQL query that should return 24 rows

CREATE OR REPLACE FUNCTION get_all_users_direct()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  updated_at timestamptz
) 
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  RETURN QUERY EXECUTE '
    SELECT u.id, u.email, u.created_at, u.email_confirmed_at, u.last_sign_in_at, u.updated_at
    FROM auth.users u
    WHERE u.deleted_at IS NULL
    ORDER BY u.created_at DESC
  ';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION get_all_users_direct() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_users_direct() TO service_role;