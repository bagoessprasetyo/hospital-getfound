-- Migration to create auth users for existing doctors
-- This creates auth users for doctor profiles that don't have corresponding auth users

DO $$
DECLARE
    doctor_record RECORD;
    temp_password TEXT;
    auth_user_id UUID;
BEGIN
    -- Loop through all doctor profiles that don't have corresponding auth users
    FOR doctor_record IN 
        SELECT up.id, up.email, up.full_name, up.phone
        FROM user_profiles up
        LEFT JOIN auth.users au ON up.id = au.id
        WHERE up.role = 'doctor' AND au.id IS NULL
    LOOP
        -- Generate a temporary password
        temp_password := encode(gen_random_bytes(12), 'base64');
        
        -- Generate a new UUID for the auth user
        auth_user_id := gen_random_uuid();
        
        -- Insert into auth.users table
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud
        ) VALUES (
            auth_user_id,
            '00000000-0000-0000-0000-000000000000',
            doctor_record.email,
            crypt(temp_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            jsonb_build_object(
                'role', 'doctor',
                'full_name', doctor_record.full_name,
                'first_name', split_part(doctor_record.full_name, ' ', 1),
                'last_name', substring(doctor_record.full_name from position(' ' in doctor_record.full_name) + 1)
            ),
            false,
            'authenticated',
            'authenticated'
        );
        
        -- Update the user_profiles table with the new auth user ID
        UPDATE user_profiles 
        SET id = auth_user_id 
        WHERE id = doctor_record.id;
        
        -- Update the doctors table with the new auth user ID
        UPDATE doctors 
        SET user_id = auth_user_id 
        WHERE user_id = doctor_record.id;
        
        RAISE NOTICE 'Created auth user for doctor: % (%) with ID: %', 
            doctor_record.full_name, doctor_record.email, auth_user_id;
    END LOOP;
END $$;