-- Update appointments status constraint to include 'no_show' and insert dummy data
-- This migration first updates the constraint then inserts the dummy appointment data

-- First, drop the existing constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add the updated constraint that includes 'no_show'
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'));

-- Now insert the dummy appointment data for doctor.test@hospital.demo
INSERT INTO appointments (
    patient_id,
    doctor_id,
    hospital_id,
    appointment_date,
    appointment_time,
    status,
    reason_for_visit,
    notes,
    consultation_fee,
    duration
) VALUES
-- Past appointments (completed and cancelled)
(
    (SELECT id FROM user_profiles WHERE email = 'patient1@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333337',
    '2024-12-15',
    '09:00:00',
    'completed',
    'Eye examination and vision test',
    'Patient has mild myopia. Prescribed corrective lenses.',
    150.00,
    45
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient2@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333338',
    '2024-12-18',
    '14:30:00',
    'completed',
    'Follow-up consultation for dry eyes',
    'Condition improving with prescribed eye drops. Continue treatment.',
    120.00,
    30
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient3@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333337',
    '2024-12-20',
    '11:15:00',
    'cancelled',
    'Routine eye check-up',
    'Patient cancelled due to emergency. Rescheduled.',
    100.00,
    30
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient4@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333338',
    '2024-12-22',
    '16:00:00',
    'completed',
    'Cataract evaluation',
    'Early stage cataract detected. Monitoring recommended.',
    200.00,
    60
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient5@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333337',
    '2024-12-28',
    '10:30:00',
    'no_show',
    'Contact lens fitting',
    'Patient did not show up for appointment.',
    80.00,
    30
),

-- Current/Recent appointments (confirmed and pending)
(
    (SELECT id FROM user_profiles WHERE email = 'patient1@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333338',
    '2025-01-02',
    '09:30:00',
    'confirmed',
    'Annual eye examination',
    'Scheduled for comprehensive eye health check.',
    150.00,
    45
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient2@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333337',
    '2025-01-03',
    '13:00:00',
    'pending',
    'Glaucoma screening',
    'Patient requested screening due to family history.',
    180.00,
    60
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient3@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333338',
    '2025-01-05',
    '15:45:00',
    'confirmed',
    'Diabetic retinopathy check',
    'Regular monitoring for diabetic patient.',
    220.00,
    60
),

-- Future appointments (pending and confirmed)
(
    (SELECT id FROM user_profiles WHERE email = 'patient4@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333337',
    '2025-01-08',
    '10:00:00',
    'pending',
    'Eye strain consultation',
    'Patient works long hours on computer.',
    130.00,
    30
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient5@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333338',
    '2025-01-10',
    '14:15:00',
    'confirmed',
    'Post-surgery follow-up',
    'Follow-up after minor eye procedure.',
    160.00,
    45
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient1@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333337',
    '2025-01-12',
    '11:30:00',
    'pending',
    'Vision therapy consultation',
    'Exploring vision therapy options.',
    140.00,
    45
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient2@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333338',
    '2025-01-15',
    '16:30:00',
    'confirmed',
    'Prescription update',
    'Annual prescription review and update.',
    110.00,
    30
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient3@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333337',
    '2025-01-18',
    '09:15:00',
    'pending',
    'Emergency consultation',
    'Patient experiencing sudden vision changes.',
    250.00,
    60
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient4@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333338',
    '2025-01-20',
    '12:00:00',
    'confirmed',
    'Pediatric eye exam',
    'Child''s first comprehensive eye examination.',
    120.00,
    45
),
(
    (SELECT id FROM user_profiles WHERE email = 'patient5@email.com'),
    'cbddcffe-cecb-4692-a2d8-926450217646',
    '33333333-3333-3333-3333-333333333337',
    '2025-01-22',
    '15:00:00',
    'pending',
    'Contact lens follow-up',
    'Follow-up for new contact lens wearer.',
    90.00,
    30
);

-- Add some comments for tracking
COMMENT ON TABLE appointments IS 'Updated with dummy data for doctor.test@hospital.demo on 2025-01-02';