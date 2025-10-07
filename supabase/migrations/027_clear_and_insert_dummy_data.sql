-- Clear existing data and insert comprehensive dummy data
-- This migration clears all existing data and inserts fresh dummy data

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clear existing data in reverse dependency order
DELETE FROM appointments;
DELETE FROM doctor_availability;
DELETE FROM doctor_hospitals;
DELETE FROM patients;
DELETE FROM doctors;
DELETE FROM hospitals;
DELETE FROM user_profiles;

-- Clear auth users that match our dummy data IDs
DELETE FROM auth.users WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111112',
  '11111111-1111-1111-1111-111111111113',
  '11111111-1111-1111-1111-111111111114',
  '11111111-1111-1111-1111-111111111115',
  '11111111-1111-1111-1111-111111111116',
  '11111111-1111-1111-1111-111111111117',
  '11111111-1111-1111-1111-111111111118',
  '11111111-1111-1111-1111-111111111119',
  '11111111-1111-1111-1111-111111111120',
  '22222222-2222-2222-2222-222222222221',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222223',
  '22222222-2222-2222-2222-222222222224',
  '22222222-2222-2222-2222-222222222225',
  '22222222-2222-2222-2222-222222222226',
  '22222222-2222-2222-2222-222222222227',
  '22222222-2222-2222-2222-222222222228',
  '22222222-2222-2222-2222-222222222229',
  '22222222-2222-2222-2222-222222222230'
);

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Insert auth users (required for user_profiles foreign key)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES
-- Admin user
('00000000-0000-0000-0000-000000000001', 'admin@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),

-- Doctor users
('11111111-1111-1111-1111-111111111111', 'dr.smith@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111112', 'dr.johnson@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111113', 'dr.williams@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111114', 'dr.brown@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111115', 'dr.davis@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111116', 'dr.miller@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111117', 'dr.wilson@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111118', 'dr.moore@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111119', 'dr.taylor@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('11111111-1111-1111-1111-111111111120', 'dr.anderson@hospital.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),

-- Patient users
('22222222-2222-2222-2222-222222222221', 'patient1@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222222', 'patient2@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222223', 'patient3@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222224', 'patient4@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222225', 'patient5@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222226', 'patient6@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222227', 'patient7@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222228', 'patient8@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222229', 'patient9@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222230', 'patient10@email.com', '$2a$10$dummy.encrypted.password.hash', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false, 'authenticated', 'authenticated');

-- Insert user profiles (10 doctors + 10 patients + 1 admin)
INSERT INTO user_profiles (id, email, full_name, role, phone) VALUES
-- Admin user
('00000000-0000-0000-0000-000000000001', 'admin@hospital.com', 'System Administrator', 'admin', '+1-555-0001'),

-- Doctor users
('11111111-1111-1111-1111-111111111111', 'dr.smith@hospital.com', 'Dr. John Smith', 'doctor', '+1-555-1001'),
('11111111-1111-1111-1111-111111111112', 'dr.johnson@hospital.com', 'Dr. Sarah Johnson', 'doctor', '+1-555-1002'),
('11111111-1111-1111-1111-111111111113', 'dr.williams@hospital.com', 'Dr. Michael Williams', 'doctor', '+1-555-1003'),
('11111111-1111-1111-1111-111111111114', 'dr.brown@hospital.com', 'Dr. Emily Brown', 'doctor', '+1-555-1004'),
('11111111-1111-1111-1111-111111111115', 'dr.davis@hospital.com', 'Dr. David Davis', 'doctor', '+1-555-1005'),
('11111111-1111-1111-1111-111111111116', 'dr.miller@hospital.com', 'Dr. Lisa Miller', 'doctor', '+1-555-1006'),
('11111111-1111-1111-1111-111111111117', 'dr.wilson@hospital.com', 'Dr. Robert Wilson', 'doctor', '+1-555-1007'),
('11111111-1111-1111-1111-111111111118', 'dr.moore@hospital.com', 'Dr. Jennifer Moore', 'doctor', '+1-555-1008'),
('11111111-1111-1111-1111-111111111119', 'dr.taylor@hospital.com', 'Dr. Christopher Taylor', 'doctor', '+1-555-1009'),
('11111111-1111-1111-1111-111111111120', 'dr.anderson@hospital.com', 'Dr. Amanda Anderson', 'doctor', '+1-555-1010'),

-- Patient users
('22222222-2222-2222-2222-222222222221', 'patient1@email.com', 'Alice Cooper', 'patient', '+1-555-2001'),
('22222222-2222-2222-2222-222222222222', 'patient2@email.com', 'Bob Martinez', 'patient', '+1-555-2002'),
('22222222-2222-2222-2222-222222222223', 'patient3@email.com', 'Carol Thompson', 'patient', '+1-555-2003'),
('22222222-2222-2222-2222-222222222224', 'patient4@email.com', 'Daniel Rodriguez', 'patient', '+1-555-2004'),
('22222222-2222-2222-2222-222222222225', 'patient5@email.com', 'Eva Garcia', 'patient', '+1-555-2005'),
('22222222-2222-2222-2222-222222222226', 'patient6@email.com', 'Frank Lee', 'patient', '+1-555-2006'),
('22222222-2222-2222-2222-222222222227', 'patient7@email.com', 'Grace Kim', 'patient', '+1-555-2007'),
('22222222-2222-2222-2222-222222222228', 'patient8@email.com', 'Henry Chen', 'patient', '+1-555-2008'),
('22222222-2222-2222-2222-222222222229', 'patient9@email.com', 'Isabella White', 'patient', '+1-555-2009'),
('22222222-2222-2222-2222-222222222230', 'patient10@email.com', 'Jack Brown', 'patient', '+1-555-2010');

-- Insert hospitals (10 records)
INSERT INTO hospitals (id, name, address, phone, email, website, description) VALUES
('33333333-3333-3333-3333-333333333331', 'City General Hospital', '123 Main Street, Downtown, NY 10001', '+1-555-3001', 'info@citygeneral.com', 'www.citygeneral.com', 'Leading general hospital with comprehensive medical services'),
('33333333-3333-3333-3333-333333333332', 'St. Mary Medical Center', '456 Oak Avenue, Midtown, NY 10002', '+1-555-3002', 'contact@stmary.com', 'www.stmary.com', 'Catholic hospital specializing in family medicine and emergency care'),
('33333333-3333-3333-3333-333333333333', 'Metropolitan Heart Institute', '789 Pine Road, Uptown, NY 10003', '+1-555-3003', 'info@metheart.com', 'www.metheart.com', 'Specialized cardiac care and cardiovascular surgery center'),
('33333333-3333-3333-3333-333333333334', 'Children''s Hospital of NY', '321 Elm Street, Brooklyn, NY 11201', '+1-555-3004', 'info@childrensny.com', 'www.childrensny.com', 'Dedicated pediatric hospital with specialized child care'),
('33333333-3333-3333-3333-333333333335', 'University Medical Center', '654 College Ave, Queens, NY 11101', '+1-555-3005', 'info@umc.edu', 'www.umc.edu', 'Teaching hospital affiliated with medical university'),
('33333333-3333-3333-3333-333333333336', 'Women''s Health Center', '987 Rose Boulevard, Manhattan, NY 10004', '+1-555-3006', 'info@womenshealth.com', 'www.womenshealth.com', 'Specialized women''s health and maternity services'),
('33333333-3333-3333-3333-333333333337', 'Orthopedic Specialty Hospital', '147 Sports Drive, Bronx, NY 10451', '+1-555-3007', 'info@orthopedic.com', 'www.orthopedic.com', 'Leading orthopedic and sports medicine facility'),
('33333333-3333-3333-3333-333333333338', 'Mental Health Institute', '258 Wellness Way, Staten Island, NY 10301', '+1-555-3008', 'info@mentalhealth.com', 'www.mentalhealth.com', 'Comprehensive mental health and psychiatric services'),
('33333333-3333-3333-3333-333333333339', 'Cancer Treatment Center', '369 Hope Street, Long Island, NY 11501', '+1-555-3009', 'info@cancercenter.com', 'www.cancercenter.com', 'Advanced oncology and cancer treatment facility'),
('33333333-3333-3333-3333-333333333340', 'Emergency Medical Center', '741 Urgent Care Lane, Westchester, NY 10601', '+1-555-3010', 'info@emergency.com', 'www.emergency.com', '24/7 emergency and urgent care services');

-- Insert doctors (10 records)
INSERT INTO doctors (id, user_id, specialization, license_number, years_of_experience, bio, consultation_fee) VALUES
('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Cardiology', 'MD-CARD-001', 15, 'Experienced cardiologist specializing in interventional procedures and heart disease prevention.', 250.00),
('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111112', 'Pediatrics', 'MD-PED-002', 12, 'Board-certified pediatrician with expertise in child development and family medicine.', 180.00),
('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111113', 'Orthopedics', 'MD-ORTH-003', 18, 'Orthopedic surgeon specializing in sports injuries and joint replacement surgery.', 300.00),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111114', 'Dermatology', 'MD-DERM-004', 10, 'Dermatologist focused on skin cancer prevention and cosmetic dermatology.', 200.00),
('44444444-4444-4444-4444-444444444445', '11111111-1111-1111-1111-111111111115', 'Neurology', 'MD-NEURO-005', 20, 'Neurologist with expertise in stroke treatment and neurological disorders.', 280.00),
('44444444-4444-4444-4444-444444444446', '11111111-1111-1111-1111-111111111116', 'Obstetrics & Gynecology', 'MD-OBGYN-006', 14, 'OB/GYN specialist in high-risk pregnancies and women''s reproductive health.', 220.00),
('44444444-4444-4444-4444-444444444447', '11111111-1111-1111-1111-111111111117', 'Psychiatry', 'MD-PSYCH-007', 16, 'Psychiatrist specializing in anxiety disorders and cognitive behavioral therapy.', 190.00),
('44444444-4444-4444-4444-444444444448', '11111111-1111-1111-1111-111111111118', 'Oncology', 'MD-ONCO-008', 22, 'Medical oncologist with focus on breast cancer and immunotherapy treatments.', 350.00),
('44444444-4444-4444-4444-444444444449', '11111111-1111-1111-1111-111111111119', 'Emergency Medicine', 'MD-EM-009', 8, 'Emergency medicine physician with trauma and critical care experience.', 160.00),
('44444444-4444-4444-4444-444444444450', '11111111-1111-1111-1111-111111111120', 'Internal Medicine', 'MD-IM-010', 13, 'Internal medicine physician specializing in diabetes and chronic disease management.', 170.00);

-- Insert patients (10 records)
INSERT INTO patients (id, user_id, date_of_birth, gender, emergency_contact, medical_history) VALUES
('55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222221', '1985-03-15', 'female', 'John Cooper - +1-555-2101', 'Hypertension, allergic to penicillin'),
('55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222222', '1990-07-22', 'male', 'Maria Martinez - +1-555-2102', 'Type 2 diabetes, family history of heart disease'),
('55555555-5555-5555-5555-555555555553', '22222222-2222-2222-2222-222222222223', '1978-11-08', 'female', 'David Thompson - +1-555-2103', 'Asthma, previous knee surgery'),
('55555555-5555-5555-5555-555555555554', '22222222-2222-2222-2222-222222222224', '1992-01-30', 'male', 'Ana Rodriguez - +1-555-2104', 'No significant medical history'),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222225', '1987-09-12', 'female', 'Carlos Garcia - +1-555-2105', 'Migraine headaches, lactose intolerant'),
('55555555-5555-5555-5555-555555555556', '22222222-2222-2222-2222-222222222226', '1995-05-18', 'male', 'Susan Lee - +1-555-2106', 'Seasonal allergies'),
('55555555-5555-5555-5555-555555555557', '22222222-2222-2222-2222-222222222227', '1983-12-03', 'female', 'James Kim - +1-555-2107', 'Thyroid disorder, vitamin D deficiency'),
('55555555-5555-5555-5555-555555555558', '22222222-2222-2222-2222-222222222228', '1988-04-25', 'male', 'Linda Chen - +1-555-2108', 'High cholesterol, family history of cancer'),
('55555555-5555-5555-5555-555555555559', '22222222-2222-2222-2222-222222222229', '1991-08-14', 'female', 'Robert White - +1-555-2109', 'Depression, anxiety disorder'),
('55555555-5555-5555-5555-555555555560', '22222222-2222-2222-2222-222222222230', '1986-06-07', 'male', 'Jennifer Brown - +1-555-2110', 'Back pain, previous appendectomy');

-- Insert doctor_hospitals relationships (each doctor works at 1-3 hospitals)
INSERT INTO doctor_hospitals (doctor_id, hospital_id) VALUES
-- Dr. Smith (Cardiology) - works at City General and Heart Institute
('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331'),
('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333'),

-- Dr. Johnson (Pediatrics) - works at Children's Hospital and St. Mary
('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333334'),
('44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333332'),

-- Dr. Williams (Orthopedics) - works at Orthopedic Hospital and University Medical
('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333337'),
('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333335'),

-- Dr. Brown (Dermatology) - works at City General
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333331'),

-- Dr. Davis (Neurology) - works at University Medical and City General
('44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333335'),
('44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333331'),

-- Dr. Miller (OB/GYN) - works at Women's Health Center and St. Mary
('44444444-4444-4444-4444-444444444446', '33333333-3333-3333-3333-333333333336'),
('44444444-4444-4444-4444-444444444446', '33333333-3333-3333-3333-333333333332'),

-- Dr. Wilson (Psychiatry) - works at Mental Health Institute
('44444444-4444-4444-4444-444444444447', '33333333-3333-3333-3333-333333333338'),

-- Dr. Moore (Oncology) - works at Cancer Treatment Center and University Medical
('44444444-4444-4444-4444-444444444448', '33333333-3333-3333-3333-333333333339'),
('44444444-4444-4444-4444-444444444448', '33333333-3333-3333-3333-333333333335'),

-- Dr. Taylor (Emergency Medicine) - works at Emergency Medical Center and City General
('44444444-4444-4444-4444-444444444449', '33333333-3333-3333-3333-333333333340'),
('44444444-4444-4444-4444-444444444449', '33333333-3333-3333-3333-333333333331'),

-- Dr. Anderson (Internal Medicine) - works at City General and St. Mary
('44444444-4444-4444-4444-444444444450', '33333333-3333-3333-3333-333333333331'),
('44444444-4444-4444-4444-444444444450', '33333333-3333-3333-3333-333333333332');

-- Insert doctor availability (10 records with realistic schedules)
INSERT INTO doctor_availability (id, doctor_id, hospital_id, day_of_week, start_time, end_time, slot_duration, max_patients, is_active) VALUES
-- Dr. Smith (Cardiology) - Monday at City General
('66666666-6666-6666-6666-666666666661', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 1, '09:00', '17:00', 30, 16, true),
-- Dr. Smith (Cardiology) - Wednesday at Heart Institute
('66666666-6666-6666-6666-666666666662', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333', 3, '08:00', '16:00', 30, 16, true),

-- Dr. Johnson (Pediatrics) - Tuesday at Children's Hospital
('66666666-6666-6666-6666-666666666663', '44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333334', 2, '08:30', '16:30', 20, 24, true),
-- Dr. Johnson (Pediatrics) - Thursday at St. Mary
('66666666-6666-6666-6666-666666666664', '44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333332', 4, '09:00', '17:00', 20, 24, true),

-- Dr. Williams (Orthopedics) - Monday at Orthopedic Hospital
('66666666-6666-6666-6666-666666666665', '44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333337', 1, '07:00', '15:00', 45, 10, true),
-- Dr. Williams (Orthopedics) - Friday at University Medical
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333335', 5, '08:00', '16:00', 45, 10, true),

-- Dr. Brown (Dermatology) - Wednesday at City General
('66666666-6666-6666-6666-666666666667', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333331', 3, '10:00', '18:00', 25, 19, true),

-- Dr. Davis (Neurology) - Tuesday at University Medical
('66666666-6666-6666-6666-666666666668', '44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333335', 2, '09:00', '17:00', 40, 12, true),

-- Dr. Miller (OB/GYN) - Thursday at Women's Health Center
('66666666-6666-6666-6666-666666666669', '44444444-4444-4444-4444-444444444446', '33333333-3333-3333-3333-333333333336', 4, '08:00', '16:00', 30, 16, true),

-- Dr. Wilson (Psychiatry) - Friday at Mental Health Institute
('66666666-6666-6666-6666-666666666670', '44444444-4444-4444-4444-444444444447', '33333333-3333-3333-3333-333333333338', 5, '10:00', '18:00', 60, 8, true);

-- Insert appointments (10 records with realistic future dates)
INSERT INTO appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, status, notes) VALUES
('77777777-7777-7777-7777-777777777771', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', '2024-02-15', '09:00:00', 'scheduled', 'Patient reports intermittent chest discomfort'),
('77777777-7777-7777-7777-777777777772', '55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444450', '33333333-3333-3333-3333-333333333331', '2024-02-16', '10:30:00', 'scheduled', 'Regular check-up for blood sugar management'),
('77777777-7777-7777-7777-777777777773', '55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333337', '2024-02-17', '14:00:00', 'scheduled', 'Follow-up after previous knee surgery'),
('77777777-7777-7777-7777-777777777774', '55555555-5555-5555-5555-555555555554', '44444444-4444-4444-4444-444444444442', '33333333-3333-3333-3333-333333333334', '2024-02-18', '11:20:00', 'scheduled', 'Routine pediatric examination'),
('77777777-7777-7777-7777-777777777775', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333335', '2024-02-19', '15:00:00', 'scheduled', 'Severe headaches affecting daily activities'),
('77777777-7777-7777-7777-777777777776', '55555555-5555-5555-5555-555555555556', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333331', '2024-02-20', '16:30:00', 'scheduled', 'Persistent rash on arms and legs'),
('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555557', '44444444-4444-4444-4444-444444444446', '33333333-3333-3333-3333-333333333336', '2024-02-21', '13:00:00', 'scheduled', 'Monitoring thyroid hormone levels'),
('77777777-7777-7777-7777-777777777778', '55555555-5555-5555-5555-555555555558', '44444444-4444-4444-4444-444444444448', '33333333-3333-3333-3333-333333333339', '2024-02-22', '10:00:00', 'scheduled', 'Family history requires regular screening'),
('77777777-7777-7777-7777-777777777779', '55555555-5555-5555-5555-555555555559', '44444444-4444-4444-4444-444444444447', '33333333-3333-3333-3333-333333333338', '2024-02-23', '14:00:00', 'scheduled', 'Anxiety and depression management'),
('77777777-7777-7777-7777-777777777780', '55555555-5555-5555-5555-555555555560', '44444444-4444-4444-4444-444444444449', '33333333-3333-3333-3333-333333333340', '2024-02-24', '12:00:00', 'scheduled', 'Chronic lower back pain assessment');