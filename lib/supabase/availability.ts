import { createClient } from './api'
import { DoctorAvailability, CreateAvailabilityRequest, UpdateAvailabilityRequest } from '@/lib/types/availability'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function getDoctorAvailability(doctorId: string, hospitalId?: string, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient()
  
  let query = supabase
    .from('doctor_availability')
    .select(`
      *,
      hospitals:hospital_id(name),
      doctors:doctor_id(
        user_profiles:user_id(full_name)
      )
    `)
    .eq('doctor_id', doctorId)
    .order('day_of_week')
  
  if (hospitalId) {
    query = query.eq('hospital_id', hospitalId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching doctor availability:', error)
    throw new Error('Failed to fetch doctor availability')
  }
  
  return data as DoctorAvailability[]
}

export async function getAvailabilityById(id: string, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient()
  
  const { data, error } = await supabase
    .from('doctor_availability')
    .select(`
      *,
      hospitals:hospital_id(name),
      doctors:doctor_id(
        user_profiles:user_id(full_name)
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching availability:', error)
    throw new Error('Failed to fetch availability')
  }
  
  return data as DoctorAvailability
}

export async function createAvailability(availability: CreateAvailabilityRequest, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient()
  
  const { data, error } = await supabase
    .from('doctor_availability')
    .insert(availability)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating availability:', error)
    throw new Error('Failed to create availability')
  }
  
  return data as DoctorAvailability
}

export async function updateAvailability(id: string, updates: UpdateAvailabilityRequest, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient()
  
  const { data, error } = await supabase
    .from('doctor_availability')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating availability:', error)
    throw new Error('Failed to update availability')
  }
  
  return data as DoctorAvailability
}

export async function deleteAvailability(id: string, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient()
  
  const { error } = await supabase
    .from('doctor_availability')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting availability:', error)
    throw new Error('Failed to delete availability')
  }
}

export async function getHospitalAvailability(hospitalId: string, dayOfWeek?: number, supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient()
  
  let query = supabase
    .from('doctor_availability')
    .select(`
      *,
      doctors:doctor_id(
        id,
        specialization,
        user_profiles:user_id(full_name)
      )
    `)
    .eq('hospital_id', hospitalId)
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time')
  
  if (dayOfWeek !== undefined) {
    query = query.eq('day_of_week', dayOfWeek)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching hospital availability:', error)
    throw new Error('Failed to fetch hospital availability')
  }
  
  return data as DoctorAvailability[]
}