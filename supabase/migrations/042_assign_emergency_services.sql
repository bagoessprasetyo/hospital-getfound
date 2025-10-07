-- Assign emergency care services to hospitals
-- First, let's check if we have hospitals and services

-- Get the Emergency Care service ID
DO $$
DECLARE
    emergency_service_id UUID;
    hospital_record RECORD;
BEGIN
    -- Get Emergency Care service ID
    SELECT id INTO emergency_service_id 
    FROM hospital_services 
    WHERE name = 'Emergency Care' 
    LIMIT 1;
    
    IF emergency_service_id IS NOT NULL THEN
        -- Assign Emergency Care to all hospitals (for testing)
        FOR hospital_record IN SELECT id FROM hospitals LOOP
            INSERT INTO hospital_service_assignments (hospital_id, service_id)
            VALUES (hospital_record.id, emergency_service_id)
            ON CONFLICT (hospital_id, service_id) DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Emergency Care service assigned to all hospitals';
    ELSE
        RAISE NOTICE 'Emergency Care service not found';
    END IF;
END $$;