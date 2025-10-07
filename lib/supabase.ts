import { createClient } from '@supabase/supabase-js'
// import { createClientComponentClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client component client (for use in client components)
// export { createClientComponentClient }

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'doctor' | 'patient'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'admin' | 'doctor' | 'patient'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'doctor' | 'patient'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hospitals: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string | null
          website: string | null
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email?: string | null
          website?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string | null
          website?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          user_id: string
          specialization: string
          license_number: string
          years_of_experience: number
          bio: string | null
          consultation_fee: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialization: string
          license_number: string
          years_of_experience: number
          bio?: string | null
          consultation_fee: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialization?: string
          license_number?: string
          years_of_experience?: number
          bio?: string | null
          consultation_fee?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      doctor_hospitals: {
        Row: {
          id: string
          doctor_id: string
          hospital_id: string
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          hospital_id: string
          created_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          hospital_id?: string
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          emergency_contact: string | null
          medical_history: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          emergency_contact?: string | null
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          emergency_contact?: string | null
          medical_history?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      doctor_availability: {
        Row: {
          id: string
          doctor_id: string
          hospital_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          hospital_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          hospital_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          hospital_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          hospital_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          hospital_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}