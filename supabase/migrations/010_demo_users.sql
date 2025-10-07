-- Create demo users for hospital management system
-- This migration creates admin and doctor demo accounts

-- Insert demo admin user into auth.users
-- Note: In production, users should be created through Supabase Auth API
-- This is for demo purposes only
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@hospital.demo',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Insert demo doctor user into auth.users
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'doctor@hospital.demo',
    crypt('doctor123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Insert admin user profile
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role,
    phone,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@hospital.demo',
    'System Administrator',
    'admin',
    '+1-555-0001',
    NOW(),
    NOW()
);

-- Insert doctor user profile
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role,
    phone,
    created_at,
    updated_at
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'doctor@hospital.demo',
    'Dr. Sarah Johnson',
    'doctor',
    '+1-555-0002',
    NOW(),
    NOW()
);

-- Insert doctor profile for Dr. Sarah Johnson
INSERT INTO doctors (
    id,
    user_id,
    specialization,
    license_number,
    years_of_experience,
    bio,
    consultation_fee,
    image_url,
    created_at,
    updated_at
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'Cardiology',
    'MD-12345',
    10,
    'Dr. Sarah Johnson is a board-certified cardiologist with over 10 years of experience in treating cardiovascular diseases. She specializes in preventive cardiology, heart failure management, and interventional procedures.',
    150.00,
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20cardiologist%20doctor%20sarah%20johnson%20medical%20coat%20stethoscope%20confident%20smile%20cardiology%20specialist&image_size=square',
    NOW(),
    NOW()
);

-- Link doctor to all existing hospitals
INSERT INTO doctor_hospitals (
    doctor_id,
    hospital_id,
    is_primary,
    created_at
) 
SELECT 
    '33333333-3333-3333-3333-333333333333',
    id,
    CASE WHEN name = 'City General Hospital' THEN true ELSE false END,
    NOW()
FROM hospitals;

-- Add availability schedule for Dr. Sarah Johnson
-- Monday to Friday, 9 AM to 5 PM at all hospitals
INSERT INTO doctor_availability (
    doctor_id,
    hospital_id,
    day_of_week,
    start_time,
    end_time,
    is_available,
    slot_duration,
    max_patients,
    is_active,
    created_at,
    updated_at
)
SELECT 
    '33333333-3333-3333-3333-333333333333',
    h.id,
    dow.day_of_week,
    '09:00:00'::time,
    '17:00:00'::time,
    true,
    30,
    8,
    true,
    NOW(),
    NOW()
FROM hospitals h
CROSS JOIN (
    SELECT 1 as day_of_week UNION -- Monday
    SELECT 2 as day_of_week UNION -- Tuesday  
    SELECT 3 as day_of_week UNION -- Wednesday
    SELECT 4 as day_of_week UNION -- Thursday
    SELECT 5 as day_of_week       -- Friday
) dow;

-- Add Saturday morning availability at City General Hospital only
INSERT INTO doctor_availability (
    doctor_id,
    hospital_id,
    day_of_week,
    start_time,
    end_time,
    is_available,
    slot_duration,
    max_patients,
    is_active,
    created_at,
    updated_at
)
SELECT 
    '33333333-3333-3333-3333-333333333333',
    id,
    6, -- Saturday
    '09:00:00'::time,
    '13:00:00'::time,
    true,
    30,
    4,
    true,
    NOW(),
    NOW()
FROM hospitals 
WHERE name = 'City General Hospital';