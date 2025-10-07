// Hospital type definitions based on the database schema

export interface Hospital {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  website?: string
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
}

// Hospital service types
export interface HospitalService {
  id: string
  name: string
  category: string
  description?: string
  created_at: string
  updated_at: string
}

export interface HospitalServiceAssignment {
  id: string
  hospital_id: string
  service_id: string
  created_at: string
  updated_at: string
}

export interface EnhancedHospital extends Hospital {
  doctor_count?: number
  available_doctors_count?: number
  available_doctors?: number
  rating?: number
  average_rating?: number
  specialties?: string[]
  services?: string[]
  hospital_services?: HospitalService[]
  city?: string
  doctors?: any[]
}

export interface HospitalFilters {
  search?: string
  cities?: string[]
  specialties?: string[]
  services?: string[]
  minRating?: number
  hasAvailableDoctors?: boolean
}

// Service category types
export type ServiceCategory = 
  | 'Emergency Services'
  | 'Diagnostic Services'
  | 'Surgical Services'
  | 'Specialized Care'
  | 'Support Services'
  | 'Outpatient Services'
  | 'Rehabilitation Services'
  | 'Mental Health Services'