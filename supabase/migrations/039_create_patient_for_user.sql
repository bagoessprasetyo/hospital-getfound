-- Create a patient record for the specific user ID that's having issues
-- This ensures the patient record exists and can be accessed by the application

-- Insert patient record for the user
INSERT INTO patients (user_id, date_of_birth, gender, emergency_contact, medical_history)
SELECT 
  '751f085f-5fbe-4854-8618-807a8ca744b8'::uuid,
  '1990-01-01'::date,
  'other',
  '+1234567890',
  'No significant medical history'
WHERE NOT EXISTS (
  SELECT 1 FROM patients WHERE user_id = '751f085f-5fbe-4854-8618-807a8ca744b8'::uuid
);