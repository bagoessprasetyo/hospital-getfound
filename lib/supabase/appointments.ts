import { createClient } from './client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'

type Appointment = Database['public']['Tables']['appointments']['Row']
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

// Enhanced interface for appointment with all related data
export interface AppointmentWithDetails extends Appointment {
  user_profiles: {
    id: string
    full_name: string | null
    email: string
    phone: string | null
  } | null
  hospitals: {
    id: string
    name: string
    address: string | null
    phone: string | null
  } | null
  doctors: {
    id: string
    specialization: string
    user_profiles: {
      full_name: string | null
    } | null
  } | null
}

// Patient appointment interface for the appointments page
export interface PatientAppointment extends Appointment {
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
    address: string | null
    phone: string | null
  }
}

// Appointment statistics interface
export interface AppointmentStats {
  total: number
  upcoming: number
  completed: number
  cancelled: number
  pending: number
  confirmed: number
}

// Filter options for appointments
export interface AppointmentFilters {
  status?: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
  dateRange?: {
    start: string
    end: string
  }
  doctorId?: string
  hospitalId?: string
  search?: string
}

// Get appointments for a specific doctor
export async function getDoctorAppointments(
  doctorId: string
): Promise<AppointmentWithDetails[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      user_profiles!appointments_patient_id_fkey (
        id,
        full_name,
        email,
        phone
      ),
      hospitals (
        id,
        name,
        address,
        phone
      )
    `)
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (error) {
    console.error('Error fetching doctor appointments:', error)
    throw error
  }

  return data || []
}

// Get appointments for a specific patient with enhanced details
export async function getPatientAppointments(
  patientId: string
): Promise<PatientAppointment[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors (
        id,
        specialization,
        user_profiles (
          full_name
        )
      ),
      hospitals (
        id,
        name,
        address,
        phone
      )
    `)
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  if (error) {
    console.error('Error fetching patient appointments:', error)
    throw error
  }

  // Transform the data to match PatientAppointment interface
  return (data || []).map(appointment => ({
    ...appointment,
    doctor: {
      id: appointment.doctors?.id || '',
      specialization: appointment.doctors?.specialization || '',
      user_profile: {
        full_name: appointment.doctors?.user_profiles?.full_name || null
      }
    },
    hospital: {
      id: appointment.hospitals?.id || '',
      name: appointment.hospitals?.name || '',
      address: appointment.hospitals?.address || null,
      phone: appointment.hospitals?.phone || null
    }
  }))
}

// Get filtered appointments for a patient
export async function getFilteredPatientAppointments(
  userId: string,
  filters: AppointmentFilters
): Promise<PatientAppointment[]> {
  const supabase = createClient()
  
  console.log('🔍 Getting filtered appointments for userId:', userId, 'with filters:', filters)
  
  // First, get the patient ID from the user ID
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (patientError) {
    console.log('⚠️ No patient record found for user:', userId, '- Error:', patientError.message)
    // Return empty array for new users without patient records
    return []
  }

  if (!patientData) {
    console.log('⚠️ No patient record found for user:', userId)
    return []
  }

  console.log('✅ Found patient ID:', patientData.id)

  // Build the query
  let query = supabase
    .from('appointments')
    .select(`
      *,
      doctors (
        id,
        specialization,
        user_profiles (
          full_name
        )
      ),
      hospitals (
        id,
        name,
        address,
        phone
      )
    `)
    .eq('patient_id', patientData.id)

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply date range filter
  if (filters.dateRange) {
    query = query
      .gte('appointment_date', filters.dateRange.start)
      .lte('appointment_date', filters.dateRange.end)
  }

  // Apply doctor filter
  if (filters.doctorId) {
    query = query.eq('doctor_id', filters.doctorId)
  }

  // Apply hospital filter
  if (filters.hospitalId) {
    query = query.eq('hospital_id', filters.hospitalId)
  }

  // Order by date and time
  query = query
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('❌ Error fetching filtered appointments:', error)
    throw error
  }

  console.log('✅ Found appointments:', data?.length || 0)

  // Transform the data to match PatientAppointment interface
  const appointments = (data || []).map(appointment => {
    const doctor = Array.isArray(appointment.doctors) ? appointment.doctors[0] : appointment.doctors
    const hospital = Array.isArray(appointment.hospitals) ? appointment.hospitals[0] : appointment.hospitals
    
    return {
      ...appointment,
      doctor: {
        id: doctor?.id || '',
        specialization: doctor?.specialization || '',
        user_profile: {
          full_name: doctor?.user_profiles?.full_name || null
        }
      },
      hospital: {
        id: hospital?.id || '',
        name: hospital?.name || '',
        address: hospital?.address || null,
        phone: hospital?.phone || null
      }
    }
  })

  // Apply search filter on the client side if needed
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    return appointments.filter(appointment => 
      appointment.doctor.user_profile.full_name?.toLowerCase().includes(searchTerm) ||
      appointment.doctor.specialization.toLowerCase().includes(searchTerm) ||
      appointment.hospital.name.toLowerCase().includes(searchTerm) ||
      appointment.reason_for_visit?.toLowerCase().includes(searchTerm) ||
      appointment.notes?.toLowerCase().includes(searchTerm)
    )
  }

  return appointments
}

// Get appointment statistics for a patient
export async function getPatientAppointmentStats(
  userId: string
): Promise<AppointmentStats> {
  const supabase = createClient()
  
  console.log('📊 Getting appointment stats for userId:', userId)
  
  // First, get the patient ID from the user ID
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (patientError) {
    console.log('⚠️ No patient record found for user stats:', userId, '- Error:', patientError.message)
    // Return empty stats for new users without patient records
    return {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      confirmed: 0
    }
  }

  if (!patientData) {
    console.log('⚠️ No patient record found for user stats:', userId)
    return {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      confirmed: 0
    }
  }

  console.log('✅ Found patient ID for stats:', patientData.id)
  
  const { data, error } = await supabase
    .from('appointments')
    .select('status, appointment_date, appointment_time')
    .eq('patient_id', patientData.id)

  if (error) {
    console.error('Error fetching appointment stats:', error)
    throw error
  }

  const now = new Date()
  const stats: AppointmentStats = {
    total: data?.length || 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    confirmed: 0
  }

  data?.forEach(appointment => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    
    // Count by status
    switch (appointment.status) {
      case 'completed':
        stats.completed++
        break
      case 'cancelled':
        stats.cancelled++
        break
      case 'pending':
        stats.pending++
        break
      case 'confirmed':
        stats.confirmed++
        break
    }

    // Count upcoming appointments (confirmed or pending appointments in the future)
    if ((appointment.status === 'confirmed' || appointment.status === 'pending') && 
        appointmentDateTime > now) {
      stats.upcoming++
    }
  })

  return stats
}

// Get unique doctors from patient's appointments for filtering
export async function getPatientAppointmentDoctors(
  userId: string
): Promise<Array<{ id: string; name: string; specialization: string }>> {
  const supabase = createClient()
  
  console.log('👨‍⚕️ Getting appointment doctors for userId:', userId)
  
  // First, get the patient ID from the user ID
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (patientError) {
    console.log('⚠️ No patient record found for user doctors:', userId, '- Error:', patientError.message)
    // Return empty array for new users without patient records
    return []
  }

  if (!patientData) {
    console.log('⚠️ No patient record found for user doctors:', userId)
    return []
  }

  console.log('✅ Found patient ID for doctors:', patientData.id)
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      doctors (
        id,
        specialization,
        user_profiles (
          full_name
        )
      )
    `)
    .eq('patient_id', patientData.id)

  if (error) {
    console.error('Error fetching patient appointment doctors:', error)
    throw error
  }

  // Remove duplicates and format
  const uniqueDoctors = new Map()
  data?.forEach(appointment => {
    if (appointment.doctors) {
      const doctor = Array.isArray(appointment.doctors) ? appointment.doctors[0] : appointment.doctors
      if (doctor && !uniqueDoctors.has(doctor.id)) {
        uniqueDoctors.set(doctor.id, {
          id: doctor.id,
          name: (doctor.user_profiles as any)?.full_name || 'Unknown Doctor',
          specialization: doctor.specialization
        })
      }
    }
  })

  return Array.from(uniqueDoctors.values())
}

// Get unique hospitals from patient's appointments for filtering
export async function getPatientAppointmentHospitals(
  userId: string
): Promise<Array<{ id: string; name: string; address: string | null }>> {
  const supabase = createClient()
  
  console.log('🏥 Getting appointment hospitals for userId:', userId)
  
  // First, get the patient ID from the user ID
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (patientError) {
    console.log('⚠️ No patient record found for user hospitals:', userId, '- Error:', patientError.message)
    // Return empty array for new users without patient records
    return []
  }

  if (!patientData) {
    console.log('⚠️ No patient record found for user hospitals:', userId)
    return []
  }

  console.log('✅ Found patient ID for hospitals:', patientData.id)
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      hospitals (
        id,
        name,
        address
      )
    `)
    .eq('patient_id', patientData.id)

  if (error) {
    console.error('Error fetching patient appointment hospitals:', error)
    throw error
  }

  // Remove duplicates and format
  const uniqueHospitals = new Map()
  data?.forEach(appointment => {
    if (appointment.hospitals) {
      const hospital = Array.isArray(appointment.hospitals) ? appointment.hospitals[0] : appointment.hospitals
      if (hospital && !uniqueHospitals.has(hospital.id)) {
        uniqueHospitals.set(hospital.id, {
          id: hospital.id,
          name: hospital.name,
          address: hospital.address
        })
      }
    }
  })

  return Array.from(uniqueHospitals.values())
}

// Get a specific appointment by ID
export async function getAppointmentById(
  appointmentId: string
): Promise<AppointmentWithDetails | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      user_profiles!appointments_patient_id_fkey (
        id,
        full_name,
        email,
        phone
      ),
      doctors (
        id,
        specialization,
        user_profiles (
          full_name
        )
      ),
      hospitals (
        id,
        name,
        address,
        phone
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (error) {
    console.error('Error fetching appointment:', error)
    throw error
  }

  return data
}

// Create a new appointment
export async function createAppointment(
  appointmentData: AppointmentInsert
): Promise<Appointment> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()

  if (error) {
    console.error('Error creating appointment:', error)
    throw error
  }

  return data
}

// Update an appointment
export async function updateAppointment(
  appointmentId: string,
  updates: AppointmentUpdate
): Promise<Appointment> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating appointment:', error)
    throw error
  }

  return data
}

// Update appointment status
export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<Appointment> {
  return updateAppointment(appointmentId, { status })
}

// Delete an appointment
export async function deleteAppointment(
  appointmentId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)

  if (error) {
    console.error('Error deleting appointment:', error)
    throw error
  }
}

// Get booked appointments for a specific doctor on a specific date
export async function getDoctorBookedAppointments(
  doctorId: string,
  date: string
): Promise<{ appointment_time: string }[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed'])
    .order('appointment_time')

  if (error) {
    console.error('Error fetching booked appointments:', error)
    throw error
  }

  return data || []
}