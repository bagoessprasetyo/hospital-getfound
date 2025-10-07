-- Create a test appointment for user ID: 751f085f-5fbe-4854-8618-807a8ca744b8
-- This will allow the user to see appointments on their profile page

-- First, let's get the first available doctor and hospital
WITH first_doctor AS (
  SELECT id FROM doctors LIMIT 1
),
first_hospital AS (
  SELECT id FROM hospitals LIMIT 1
)

-- Insert a test appointment
INSERT INTO appointments (
  patient_id,
  doctor_id,
  hospital_id,
  appointment_date,
  appointment_time,
  status,
  notes,
  created_at,
  updated_at
)
SELECT 
  '751f085f-5fbe-4854-8618-807a8ca744b8'::uuid as patient_id,
  first_doctor.id as doctor_id,
  first_hospital.id as hospital_id,
  CURRENT_DATE + INTERVAL '7 days' as appointment_date,
  '10:00:00'::time as appointment_time,
  'confirmed' as status,
  'Test appointment for profile page demonstration' as notes,
  NOW() as created_at,
  NOW() as updated_at
FROM first_doctor, first_hospital;