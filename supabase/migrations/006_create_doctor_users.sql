-- Create sample doctor user profiles first
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role,
    phone
) VALUES 
(
    gen_random_uuid(),
    'dr.smith@hospital.com',
    'Dr. John Smith',
    'doctor',
    '+1-555-0101'
),
(
    gen_random_uuid(),
    'dr.johnson@hospital.com',
    'Dr. Sarah Johnson',
    'doctor',
    '+1-555-0102'
),
(
    gen_random_uuid(),
    'dr.williams@hospital.com',
    'Dr. Michael Williams',
    'doctor',
    '+1-555-0103'
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample doctors data using the created user profiles
INSERT INTO doctors (
    user_id, 
    specialization, 
    license_number, 
    years_of_experience, 
    bio, 
    consultation_fee, 
    image_url
) VALUES 
(
    (SELECT id FROM user_profiles WHERE email = 'dr.smith@hospital.com'),
    'Cardiology',
    'MD001234',
    15,
    'Experienced cardiologist specializing in heart disease prevention and treatment.',
    150.00,
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20doctor%20portrait%20cardiology%20specialist%20medical%20coat%20stethoscope%20confident%20smile&image_size=square'
),
(
    (SELECT id FROM user_profiles WHERE email = 'dr.johnson@hospital.com'),
    'Pediatrics',
    'MD005678',
    12,
    'Dedicated pediatrician with expertise in child healthcare and development.',
    120.00,
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=friendly%20pediatrician%20doctor%20children%20healthcare%20medical%20coat%20warm%20smile&image_size=square'
),
(
    (SELECT id FROM user_profiles WHERE email = 'dr.williams@hospital.com'),
    'Orthopedics',
    'MD009012',
    18,
    'Orthopedic surgeon specializing in bone, joint, and muscle disorders.',
    200.00,
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=orthopedic%20surgeon%20doctor%20bone%20specialist%20medical%20professional%20confident&image_size=square'
)
ON CONFLICT (license_number) DO NOTHING;

-- Assign doctors to hospitals (many-to-many relationship)
INSERT INTO doctor_hospitals (doctor_id, hospital_id, is_primary) 
SELECT 
    d.id,
    h.id,
    CASE WHEN ROW_NUMBER() OVER (PARTITION BY d.id ORDER BY h.created_at) = 1 THEN true ELSE false END
FROM doctors d
CROSS JOIN hospitals h
WHERE d.specialization IN ('Cardiology', 'Pediatrics', 'Orthopedics')
ON CONFLICT (doctor_id, hospital_id) DO NOTHING;

-- Insert sample doctor availability
INSERT INTO doctor_availability (
    doctor_id,
    hospital_id,
    day_of_week,
    start_time,
    end_time,
    is_available
) 
SELECT 
    dh.doctor_id,
    dh.hospital_id,
    generate_series(1, 5) as day_of_week, -- Monday to Friday
    '09:00'::time,
    '17:00'::time,
    true
FROM doctor_hospitals dh
WHERE dh.is_primary = true
ON CONFLICT (doctor_id, hospital_id, day_of_week, start_time) DO NOTHING;

-- Add weekend availability for some doctors
INSERT INTO doctor_availability (
    doctor_id,
    hospital_id,
    day_of_week,
    start_time,
    end_time,
    is_available
) 
SELECT 
    dh.doctor_id,
    dh.hospital_id,
    6 as day_of_week, -- Saturday
    '10:00'::time,
    '14:00'::time,
    true
FROM doctor_hospitals dh
WHERE dh.is_primary = true
LIMIT 2
ON CONFLICT (doctor_id, hospital_id, day_of_week, start_time) DO NOTHING;