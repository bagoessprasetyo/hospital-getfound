-- Create hospital_services table for predefined services
CREATE TABLE hospital_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    icon_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hospital_service_assignments junction table
CREATE TABLE hospital_service_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES hospital_services(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hospital_id, service_id)
);

-- Insert predefined hospital services
INSERT INTO hospital_services (name, description, category, icon_name) VALUES
-- Emergency Services
('Emergency Care', 'Round-the-clock emergency medical services', 'Emergency Services', 'AlertTriangle'),
('Trauma Center', 'Specialized trauma and critical care services', 'Emergency Services', 'Zap'),
('Ambulance Services', 'Emergency medical transportation', 'Emergency Services', 'Truck'),

-- Specialized Care
('Cardiology', 'Heart and cardiovascular system care', 'Specialized Care', 'Heart'),
('Neurology', 'Brain and nervous system disorders', 'Specialized Care', 'Brain'),
('Oncology', 'Cancer diagnosis and treatment', 'Specialized Care', 'Shield'),
('Orthopedics', 'Bone, joint, and muscle care', 'Specialized Care', 'Bone'),
('Pediatrics', 'Medical care for infants, children, and adolescents', 'Specialized Care', 'Baby'),

-- Surgical Services
('General Surgery', 'Comprehensive surgical procedures', 'Surgical Services', 'Scissors'),
('Cardiac Surgery', 'Heart and cardiovascular surgery', 'Surgical Services', 'Heart'),
('Neurosurgery', 'Brain and nervous system surgery', 'Surgical Services', 'Brain'),
('Plastic Surgery', 'Reconstructive and cosmetic surgery', 'Surgical Services', 'Sparkles'),

-- Diagnostic Services
('Radiology', 'Medical imaging and diagnostic services', 'Diagnostic Services', 'Scan'),
('Laboratory', 'Medical testing and analysis', 'Diagnostic Services', 'TestTube'),
('MRI', 'Magnetic Resonance Imaging', 'Diagnostic Services', 'ScanLine'),
('CT Scan', 'Computed Tomography scanning', 'Diagnostic Services', 'ScanLine'),
('Ultrasound', 'Ultrasound imaging services', 'Diagnostic Services', 'Radio'),

-- Outpatient Services
('Consultation', 'General medical consultation', 'Outpatient Services', 'Stethoscope'),
('Physical Therapy', 'Rehabilitation and physical therapy', 'Outpatient Services', 'Activity'),
('Rehabilitation', 'Medical rehabilitation services', 'Outpatient Services', 'RotateCcw'),

-- Maternity Services
('Obstetrics', 'Pregnancy and childbirth care', 'Maternity Services', 'Baby'),
('Gynecology', 'Women''s reproductive health', 'Maternity Services', 'Heart'),
('Neonatal Care', 'Newborn intensive care', 'Maternity Services', 'Baby'),

-- Mental Health
('Psychiatry', 'Mental health medical treatment', 'Mental Health', 'Brain'),
('Psychology', 'Psychological counseling and therapy', 'Mental Health', 'MessageCircle'),
('Counseling', 'Mental health counseling services', 'Mental Health', 'Users');

-- Enable RLS on new tables
ALTER TABLE hospital_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_service_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for hospital_services (read-only for all authenticated users)
CREATE POLICY "Anyone can view hospital services" ON hospital_services
    FOR SELECT USING (is_active = true);

-- Create RLS policies for hospital_service_assignments
CREATE POLICY "Anyone can view hospital service assignments" ON hospital_service_assignments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage hospital service assignments" ON hospital_service_assignments
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON hospital_services TO anon, authenticated;
GRANT ALL PRIVILEGES ON hospital_service_assignments TO authenticated;
GRANT SELECT ON hospital_service_assignments TO anon;

-- Create indexes for better performance
CREATE INDEX idx_hospital_services_category ON hospital_services(category);
CREATE INDEX idx_hospital_services_active ON hospital_services(is_active);
CREATE INDEX idx_hospital_service_assignments_hospital ON hospital_service_assignments(hospital_id);
CREATE INDEX idx_hospital_service_assignments_service ON hospital_service_assignments(service_id);