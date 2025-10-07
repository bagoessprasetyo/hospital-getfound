-- Create auth users for existing doctor profiles that don't have auth users
-- This migration creates new auth users and updates the references

DO $$
DECLARE
    doctor_record RECORD;
    temp_password TEXT := 'TempPass123!';
    new_auth_id UUID;
    old_profile_id UUID;
BEGIN
    RAISE NOTICE 'Starting doctor auth user creation...';
    
    -- Loop through doctor profiles that don't have corresponding auth users
    FOR doctor_record IN 
        SELECT up.id as profile_id, up.email, up.full_name, up.phone, up.role
        FROM user_profiles up
        WHERE up.role = 'doctor' 
        AND NOT EXISTS (
            SELECT 1 FROM auth.users au WHERE au.id = up.id
        )
    LOOP
        old_profile_id := doctor_record.profile_id;
        new_auth_id := gen_random_uuid();
        
        RAISE NOTICE 'Processing doctor: % (%) - Old ID: %, New ID: %', 
            doctor_record.full_name, doctor_record.email, old_profile_id, new_auth_id;
        
        -- Insert into auth.users
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
            new_auth_id,
            '00000000-0000-0000-0000-000000000000',
            doctor_record.email,
            crypt(temp_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            jsonb_build_object(
                'role', 'doctor',
                'full_name', doctor_record.full_name,
                'first_name', COALESCE(split_part(doctor_record.full_name, ' ', 1), 'Doctor'),
                'last_name', COALESCE(NULLIF(substring(doctor_record.full_name from position(' ' in doctor_record.full_name) + 1), ''), 'User')
            ),
            false,
            'authenticated',
            'authenticated'
        );
        
        -- Insert new user profile with the auth user ID
        INSERT INTO user_profiles (
            id,
            email,
            full_name,
            phone,
            role,
            created_at,
            updated_at
        ) VALUES (
            new_auth_id,
            doctor_record.email,
            doctor_record.full_name,
            doctor_record.phone,
            'doctor',
            NOW(),
            NOW()
        );
        
        -- Update doctors table to reference the new auth user
        UPDATE doctors 
        SET user_id = new_auth_id 
        WHERE user_id = old_profile_id;
        
        -- Delete the old user profile
        DELETE FROM user_profiles WHERE id = old_profile_id;
        
        RAISE NOTICE 'Successfully created auth user and updated references for: %', doctor_record.full_name;
        
    END LOOP;
    
    RAISE NOTICE 'Doctor auth user creation completed!';
END $$;