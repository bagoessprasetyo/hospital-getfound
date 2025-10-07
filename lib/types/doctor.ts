export interface Doctor {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  bio?: string;
  consultation_fee: number;
  profile_image_url?: string;
  image_url?: string;
  full_name?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorHospital {
  id: string;
  doctor_id: string;
  hospital_id: string;
  is_primary: boolean;
  created_at: string;
  doctor?: Doctor;
  hospital?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  hospital_id: string;
  day_of_week: number; // 1-7 (Monday-Sunday)
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration?: number;
  max_patients?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDoctorRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  bio?: string;
  consultation_fee: number;
  image_url?: string;
  full_name?: string;
  hospital_ids: string[];
  primary_hospital_id: string;
}

export interface UpdateDoctorRequest extends Partial<CreateDoctorRequest> {
  id: string;
}

export interface DoctorWithHospitals extends Doctor {
  experience_years: any;
  doctor_hospitals: DoctorHospital[];
  user_profiles?: {
    id: string;
    full_name: string;
    phone?: string;
  };
  primary_hospital?: {
    id: string;
    name: string;
    address: string;
  };
}