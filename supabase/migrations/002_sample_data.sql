-- Insert sample hospitals
INSERT INTO hospitals (id, name, address, phone, email, website, description, image_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'City General Hospital',
    '123 Main Street, Downtown, City 12345',
    '+1-555-0101',
    'info@citygeneralhospital.com',
    'https://citygeneralhospital.com',
    'A leading healthcare facility providing comprehensive medical services with state-of-the-art equipment and experienced medical professionals.',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hospital%20building%20exterior%20with%20glass%20facade%20and%20medical%20cross%20sign%2C%20professional%20healthcare%20architecture&image_size=landscape_4_3'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'St. Mary Medical Center',
    '456 Oak Avenue, Westside, City 12346',
    '+1-555-0102',
    'contact@stmarymedical.org',
    'https://stmarymedical.org',
    'A compassionate healthcare institution dedicated to providing quality medical care with a focus on patient comfort and family-centered treatment.',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20medical%20center%20building%20with%20healing%20garden%20and%20modern%20architecture%2C%20healthcare%20facility&image_size=landscape_4_3'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Metro Health Institute',
    '789 Pine Road, Eastside, City 12347',
    '+1-555-0103',
    'hello@metrohealthinstitute.com',
    'https://metrohealthinstitute.com',
    'An innovative healthcare institute specializing in advanced medical treatments and research, committed to excellence in patient care.',
    'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20medical%20institute%20with%20clean%20white%20architecture%20and%20blue%20accents%2C%20healthcare%20innovation&image_size=landscape_4_3'
);

-- Grant permissions to anon and authenticated roles for hospitals
GRANT SELECT ON hospitals TO anon;
GRANT ALL PRIVILEGES ON hospitals TO authenticated;

-- Grant permissions for other tables
GRANT SELECT ON user_profiles TO anon;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

GRANT SELECT ON doctors TO anon;
GRANT ALL PRIVILEGES ON doctors TO authenticated;

GRANT SELECT ON doctor_hospitals TO anon;
GRANT ALL PRIVILEGES ON doctor_hospitals TO authenticated;

GRANT SELECT ON patients TO anon;
GRANT ALL PRIVILEGES ON patients TO authenticated;

GRANT SELECT ON doctor_availability TO anon;
GRANT ALL PRIVILEGES ON doctor_availability TO authenticated;

GRANT SELECT ON appointments TO anon;
GRANT ALL PRIVILEGES ON appointments TO authenticated;