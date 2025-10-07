-- Create RPC function to update doctor passwords to "doctor123"
-- This function uses the service role to update passwords via the auth.users table

CREATE OR REPLACE FUNCTION update_doctor_passwords()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    doctor_record RECORD;
    updated_count INTEGER := 0;
    result JSON;
    doctor_users JSON[] := '{}';
BEGIN
    -- Find all users with role='doctor' in user_profiles
    FOR doctor_record IN 
        SELECT up.id, up.email, up.full_name
        FROM user_profiles up
        WHERE up.role = 'doctor'
    LOOP
        -- Update password in auth.users table using encrypted_password
        -- Note: This requires service role privileges
        UPDATE auth.users 
        SET encrypted_password = crypt('doctor123', gen_salt('bf'))
        WHERE id = doctor_record.id;
        
        -- Check if update was successful
        IF FOUND THEN
            updated_count := updated_count + 1;
            doctor_users := doctor_users || json_build_object(
                'id', doctor_record.id,
                'email', doctor_record.email,
                'full_name', doctor_record.full_name
            );
        END IF;
    END LOOP;
    
    -- Build result JSON
    result := json_build_object(
        'success', true,
        'updated_count', updated_count,
        'updated_doctors', doctor_users,
        'message', format('Successfully updated passwords for %s doctor(s)', updated_count)
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'message', 'Failed to update doctor passwords'
        );
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION update_doctor_passwords() TO authenticated, service_role;

-- Add comment for documentation
COMMENT ON FUNCTION update_doctor_passwords() IS 'Updates all doctor user passwords to "doctor123" using service role privileges';