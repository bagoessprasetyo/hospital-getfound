-- Add missing fields to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing fields to doctor_availability table
ALTER TABLE doctor_availability 
ADD COLUMN IF NOT EXISTS slot_duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS max_patients INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Rename is_available to is_active in doctor_availability if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'doctor_availability' 
               AND column_name = 'is_available') THEN
        ALTER TABLE doctor_availability RENAME COLUMN is_available TO is_active;
    END IF;
END $$;

-- Add missing fields to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS reason_for_visit TEXT,
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2);

-- Update status check constraint to include 'no_show'
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'));

-- Add missing fields to doctor_hospitals table
ALTER TABLE doctor_hospitals 
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Add unique constraint for email in doctors table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'doctors_email_key' 
                   AND table_name = 'doctors') THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_email_key UNIQUE (email);
    END IF;
END $$;

-- Add unique constraint for license_number in doctors table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'doctors_license_number_key' 
                   AND table_name = 'doctors') THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_license_number_key UNIQUE (license_number);
    END IF;
END $$;

-- Add unique constraint for doctor_hospitals if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'doctor_hospitals_doctor_id_hospital_id_key' 
                   AND table_name = 'doctor_hospitals') THEN
        ALTER TABLE doctor_hospitals ADD CONSTRAINT doctor_hospitals_doctor_id_hospital_id_key UNIQUE (doctor_id, hospital_id);
    END IF;
END $$;

-- Add unique constraint for doctor_availability if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'doctor_availability_unique_slot' 
                   AND table_name = 'doctor_availability') THEN
        ALTER TABLE doctor_availability ADD CONSTRAINT doctor_availability_unique_slot UNIQUE (doctor_id, hospital_id, day_of_week, start_time);
    END IF;
END $$;

-- Add unique constraint for appointments if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'appointments_unique_slot' 
                   AND table_name = 'appointments') THEN
        ALTER TABLE appointments ADD CONSTRAINT appointments_unique_slot UNIQUE (doctor_id, hospital_id, appointment_date, appointment_time);
    END IF;
END $$;