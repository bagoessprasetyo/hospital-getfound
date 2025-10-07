-- Create demo users for hospital management system (with upsert to handle existing data)
-- This migration creates admin and doctor demo accounts safely

-- Insert or update demo admin user profile
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
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- Insert or update doctor user profile
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
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- Insert or update doctor profile for Dr. Sarah Johnson
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
) ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    specialization = EXCLUDED.specialization,
    license_number = EXCLUDED.license_number,
    years_of_experience = EXCLUDED.years_of_experience,
    bio = EXCLUDED.bio,
    consultation_fee = EXCLUDED.consultation_fee,
    image_url = EXCLUDED.image_url,
    updated_at = NOW();

-- Clear existing doctor-hospital relationships for this doctor
DELETE FROM doctor_hospitals WHERE doctor_id = '33333333-3333-3333-3333-333333333333';

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

-- Clear existing availability for this doctor
DELETE FROM doctor_availability WHERE doctor_id = '33333333-3333-3333-3333-333333333333';

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