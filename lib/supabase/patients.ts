import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

type Patient = Database['public']['Tables']['patients']['Row']
type PatientInsert = Database['public']['Tables']['patients']['Insert']
type PatientUpdate = Database['public']['Tables']['patients']['Update']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export interface PatientWithProfile extends Patient {
  user_profile: UserProfile
}

export interface PatientAppointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  doctor: {
    id: string
    specialization: string
    user_profile: {
      full_name: string | null
    }
  }
  hospital: {
    id: string
    name: string
    address: string
  }
}

export async function getPatientProfile(userId: string): Promise<PatientWithProfile | null> {
  try {
    console.log('🔍 Getting patient profile for userId:', userId)
    
    const { data, error } = await supabase
  .from('patients')
  .select(`
    *,
    user_profile:user_profiles!patients_user_id_fkey(*)
  `)
  .eq('user_id', userId)
  

    if (error) {
      console.log('⚠️ No patient profile found for user:', userId, '- Error:', error.message)
      // Return null gracefully for users without patient records (don't create one)
      return null
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No patient profile data found for user:', userId)
      return null
    }

    console.log('✅ Found patient profile for user:', userId)
    return data[0] as PatientWithProfile
  } catch (error) {
    console.error('❌ Error in getPatientProfile:', error)
    return null
  }
}

export async function createPatientProfile(patientData: PatientInsert): Promise<Patient | null> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single()

    if (error) {
      console.error('Error creating patient profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createPatientProfile:', error)
    return null
  }
}

export async function updatePatientProfile(userId: string, updates: PatientUpdate): Promise<Patient | null> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating patient profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updatePatientProfile:', error)
    return null
  }
}

export async function getPatientAppointments(userId: string): Promise<PatientAppointment[]> {
  console.log('🔍 [getPatientAppointments] Starting with userId:', userId)
  
  try {
    // Use the regular client but with service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey)
    
    console.log('🔍 [getPatientAppointments] Getting patient record for userId:', userId)
    
    // First, get the patient record using the user_id
    const { data: patientData, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id')
      .eq('user_id', userId)
    
    if (patientError) {
      console.error('⚠️ [getPatientAppointments] Error fetching patient:', patientError)
      return []
    }
    
    if (!patientData || patientData.length === 0) {
      console.log('⚠️ [getPatientAppointments] No patient record found for userId:', userId)
      return []
    }
    
    const patient = patientData[0]
    console.log('✅ [getPatientAppointments] Found patient:', patient.id)
    
    // Now get appointments using the patient.id
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        doctor:doctors!inner (
          id,
          specialization,
          user_profile:user_profiles!inner (
            full_name
          )
        ),
        hospital:hospitals!inner (
          id,
          name,
          address
        )
      `)
      .eq('patient_id', patient.id)
      .order('appointment_date', { ascending: false })
    
    if (appointmentsError) {
      console.error('⚠️ [getPatientAppointments] Error fetching appointments:', appointmentsError)
      return []
    }
    
    console.log(`✅ [getPatientAppointments] Found ${appointments?.length || 0} appointments for patient ${patient.id}`)
    
    return appointments || []
  } catch (error) {
    console.error('⚠️ [getPatientAppointments] Unexpected error:', error)
    return []
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return null
  }
}

// Get or create patient profile for a user
export async function getOrCreatePatientProfile(userId: string, supabaseClient?: SupabaseClient): Promise<Patient | null> {
  // Use provided client or fall back to default client
  const client = supabaseClient || supabase
  
  try {
    // First try to get existing patient profile without .single() to avoid PGRST116 error
    const { data: existingPatients, error: fetchError } = await client
      .from('patients')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('Error fetching patient profile:', fetchError)
      return null
    }

    // If patient profile exists, return it
    if (existingPatients && existingPatients.length > 0) {
      return existingPatients[0]
    }

    // If no patient profile exists, create one
    const { data: newPatient, error: createError } = await client
      .from('patients')
      .insert({ user_id: userId })
      .select()
      .single()

    if (createError) {
      console.error('Error creating patient profile:', createError)
      return null
    }

    return newPatient
  } catch (error) {
    console.error('Error in getOrCreatePatientProfile:', error)
    return null
  }
}