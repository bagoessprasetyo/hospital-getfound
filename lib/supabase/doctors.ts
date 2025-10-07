import { createClient } from '@/lib/supabase/api';
import { Doctor, DoctorWithHospitals, CreateDoctorRequest, UpdateDoctorRequest } from '@/lib/types/doctor';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getDoctors(supabaseClient?: SupabaseClient): Promise<DoctorWithHospitals[]> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      user_profiles (
        id,
        full_name
      ),
      doctor_hospitals (
        id,
        hospital_id,
        is_primary,
        hospital:hospitals (
          id,
          name,
          address
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch doctors: ${error.message}`);
  }

  return data.map(doctor => ({
    ...doctor,
    primary_hospital: doctor.doctor_hospitals.find((dh: { is_primary: any; }) => dh.is_primary)?.hospital
  }));
}

export async function getDoctorById(id: string, supabaseClient?: SupabaseClient): Promise<DoctorWithHospitals | null> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      user_profiles (
        id,
        full_name
      ),
      doctor_hospitals (
        id,
        hospital_id,
        is_primary,
        hospital:hospitals (
          id,
          name,
          address
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch doctor: ${error.message}`);
  }

  return {
    ...data,
    primary_hospital: data.doctor_hospitals.find((dh: { is_primary: any; }) => dh.is_primary)?.hospital
  };
}

export async function createDoctor(doctorData: CreateDoctorRequest, supabaseClient?: SupabaseClient): Promise<Doctor> {
  const supabase = supabaseClient || await createClient();
  
  // Start a transaction by creating the doctor first
  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .insert({
      specialization: doctorData.specialization,
      license_number: doctorData.license_number,
      years_of_experience: doctorData.years_of_experience,
      bio: doctorData.bio,
      consultation_fee: doctorData.consultation_fee,
      image_url: doctorData.image_url
    })
    .select()
    .single();

  if (doctorError) {
    throw new Error(`Failed to create doctor: ${doctorError.message}`);
  }

  // Create hospital associations
  const hospitalAssociations = doctorData.hospital_ids.map(hospitalId => ({
    doctor_id: doctor.id,
    hospital_id: hospitalId,
    is_primary: hospitalId === doctorData.primary_hospital_id
  }));

  const { error: hospitalError } = await supabase
    .from('doctor_hospitals')
    .insert(hospitalAssociations);

  if (hospitalError) {
    // Rollback: delete the created doctor
    await supabase.from('doctors').delete().eq('id', doctor.id);
    throw new Error(`Failed to associate doctor with hospitals: ${hospitalError.message}`);
  }

  return doctor;
}

export async function updateDoctor(doctorData: UpdateDoctorRequest, supabaseClient?: SupabaseClient): Promise<Doctor> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('doctors')
    .update({
      specialization: doctorData.specialization,
      license_number: doctorData.license_number,
      years_of_experience: doctorData.years_of_experience,
      bio: doctorData.bio,
      consultation_fee: doctorData.consultation_fee,
      image_url: doctorData.image_url
    })
    .eq('id', doctorData.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update doctor: ${error.message}`);
  }

  // Update hospital associations if provided
  if (doctorData.hospital_ids && doctorData.primary_hospital_id) {
    // Delete existing associations
    await supabase
      .from('doctor_hospitals')
      .delete()
      .eq('doctor_id', doctorData.id);

    // Create new associations
    const hospitalAssociations = doctorData.hospital_ids.map(hospitalId => ({
      doctor_id: doctorData.id,
      hospital_id: hospitalId,
      is_primary: hospitalId === doctorData.primary_hospital_id
    }));

    const { error: hospitalError } = await supabase
      .from('doctor_hospitals')
      .insert(hospitalAssociations);

    if (hospitalError) {
      throw new Error(`Failed to update doctor hospital associations: ${hospitalError.message}`);
    }
  }

  return data;
}

export async function deleteDoctor(id: string, supabaseClient?: SupabaseClient): Promise<void> {
  const supabase = supabaseClient || await createClient();
  
  // Delete hospital associations first (due to foreign key constraints)
  await supabase
    .from('doctor_hospitals')
    .delete()
    .eq('doctor_id', id);

  // Delete availability records
  await supabase
    .from('doctor_availability')
    .delete()
    .eq('doctor_id', id);

  // Delete the doctor
  const { error } = await supabase
    .from('doctors')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete doctor: ${error.message}`);
  }
}

export async function getDoctorsByHospital(hospitalId: string, supabaseClient?: SupabaseClient): Promise<DoctorWithHospitals[]> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('doctor_hospitals')
    .select(`
      doctor:doctors (
        *,
        user_profiles (
          id,
          full_name
        ),
        doctor_hospitals (
          id,
          hospital_id,
          is_primary,
          hospital:hospitals (
            id,
            name,
            address
          )
        )
      )
    `)
    .eq('hospital_id', hospitalId);

  if (error) {
    throw new Error(`Failed to fetch doctors by hospital: ${error.message}`);
  }

  return data.map(item => ({
    ...item.doctor,
    primary_hospital: (item.doctor as any).doctor_hospitals?.find((dh: { is_primary: any; }) => dh.is_primary)?.hospital
  })) as unknown as DoctorWithHospitals[];
}

// Enhanced doctor interface for public pages
export interface EnhancedDoctor extends DoctorWithHospitals {
  image_url: any;
  full_name: string;
  hospitals: Array<{
    id: string;
    name: string;
    address?: string;
  }>;
  availability_count?: number;
  rating?: number;
  total_reviews?: number;
}

// Get doctors with enhanced details for public pages
export async function getDoctorsWithDetails(
  filters: {
    search?: string;
    specializations?: string[];
    hospitals?: string[];
    minExperience?: number;
    maxFee?: number;
    hasAvailability?: boolean;
  } = {},
  supabaseClient?: SupabaseClient
): Promise<EnhancedDoctor[]> {
  const supabase = supabaseClient || await createClient();
  
  let query = supabase
    .from('doctors')
    .select(`
      *,
      user_profiles (
        full_name
      ),
      doctor_hospitals (
        id,
        hospital_id,
        is_primary,
        hospital:hospitals (
          id,
          name,
          address
        )
      ),
      doctor_availability (
        id,
        is_available
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(`specialization.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
  }

  if (filters.specializations && filters.specializations.length > 0) {
    query = query.in('specialization', filters.specializations);
  }

  if (filters.minExperience && filters.minExperience > 0) {
    query = query.gte('years_of_experience', filters.minExperience);
  }

  if (filters.maxFee && filters.maxFee > 0) {
    query = query.lte('consultation_fee', filters.maxFee);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch doctors with details: ${error.message}`);
  }

  let enhancedDoctors: EnhancedDoctor[] = data.map(doctor => ({
    ...doctor,
    full_name: getDoctorFullName(doctor as any),
    primary_hospital: doctor.doctor_hospitals.find((dh: { is_primary: any; }) => dh.is_primary)?.hospital,
    hospitals: doctor.doctor_hospitals.map((dh: any) => dh.hospital),
    availability_count: doctor.doctor_availability?.filter((av: any) => av.is_available).length || 0,
    rating: Math.floor((4.5 + Math.random() * 0.5) * 10) / 10, // Mock rating rounded to 1 decimal
    total_reviews: Math.floor(Math.random() * 100) + 10 // Mock reviews for now
  }));

  // Apply additional filters that require post-processing
  if (filters.hospitals && filters.hospitals.length > 0) {
    enhancedDoctors = enhancedDoctors.filter(doctor =>
      doctor.hospitals.some(hospital => 
        filters.hospitals!.includes(hospital.id)
      )
    );
  }

  if (filters.hasAvailability) {
    enhancedDoctors = enhancedDoctors.filter(doctor =>
      doctor.availability_count && doctor.availability_count > 0
    );
  }

  return enhancedDoctors;
}

// Get filter options for doctors
export async function getDoctorFilterOptions(supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient();
  
  const [specializationsData, hospitalsData] = await Promise.all([
    supabase
      .from('doctors')
      .select('specialization')
      .not('specialization', 'is', null),
    supabase
      .from('hospitals')
      .select('id, name')
      .order('name')
  ]);

  const specializations = Array.from(new Set(
    specializationsData.data?.map(d => d.specialization).filter(Boolean) || []
  )).sort();

  const hospitals = hospitalsData.data || [];

  return {
    specializations,
    hospitals
  };
}

// Helper function to get full name from doctor data
export function getDoctorFullName(doctor: DoctorWithHospitals): string {
  // First try user_profiles.full_name
  if (doctor.user_profiles?.full_name) {
    return doctor.user_profiles.full_name;
  }
  
  // Fallback to first_name + last_name
  if (doctor.first_name && doctor.last_name) {
    return `${doctor.first_name} ${doctor.last_name}`;
  }
  
  // Final fallback
  return doctor.first_name || doctor.last_name || 'Unknown Doctor';
}

// Doctor's patients management
export interface DoctorPatient {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  gender: string | null;
  emergency_contact: string | null;
  medical_history: string | null;
  created_at: string;
  updated_at: string;
  user_profiles: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
  };
  latest_appointment: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    notes: string | null;
    hospital: {
      name: string;
      address: string;
    };
  } | null;
  appointment_count: number;
  last_visit_date: string | null;
}

export async function getDoctorPatients(doctorId: string, supabaseClient?: SupabaseClient): Promise<DoctorPatient[]> {
  const supabase = supabaseClient || await createClient();
  
  try {
    // Get all patients who have appointments with this doctor
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        appointment_date,
        appointment_time,
        status,
        notes,
        created_at,
        hospital:hospitals(
          name,
          address
        )
      `)
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: false });

    if (appointmentError) {
      throw new Error(`Failed to fetch appointments: ${appointmentError.message}`);
    }

    if (!appointmentData || appointmentData.length === 0) {
      return [];
    }

    // Get unique patient IDs
    const patientIds = Array.from(new Set(appointmentData.map(apt => apt.patient_id)));
    
    // Get patient details with profiles
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        user_profiles:user_id(
          id,
          full_name,
          email,
          phone
        )
      `)
      .in('id', patientIds);

    if (patientError) {
      throw new Error(`Failed to fetch patients: ${patientError.message}`);
    }

    // Process and combine data
    const doctorPatients: DoctorPatient[] = patientData.map((patient: any) => {
      // Get all appointments for this patient with this doctor
      const patientAppointments = appointmentData.filter(apt => apt.patient_id === patient.id);
      
      // Get latest appointment
      const latestAppointment = patientAppointments.length > 0 ? patientAppointments[0] : null;
      
      // Get last completed visit
      const completedAppointments = patientAppointments.filter(apt => apt.status === 'completed');
      const lastVisitDate = completedAppointments.length > 0 ? completedAppointments[0].appointment_date : null;

      return {
        ...patient,
        user_profiles: patient.user_profiles,
        latest_appointment: latestAppointment ? {
          id: latestAppointment.id || '',

          appointment_date: latestAppointment.appointment_date,
          appointment_time: latestAppointment.appointment_time,
          status: latestAppointment.status,
          notes: latestAppointment.notes,
          hospital: latestAppointment.hospital
        } : null,
        appointment_count: patientAppointments.length,
        last_visit_date: lastVisitDate
      };
    });

    // Sort by most recent appointment
    return doctorPatients.sort((a, b) => {
      if (!a.latest_appointment && !b.latest_appointment) return 0;
      if (!a.latest_appointment) return 1;
      if (!b.latest_appointment) return -1;
      
      return new Date(b.latest_appointment.appointment_date).getTime() - 
             new Date(a.latest_appointment.appointment_date).getTime();
    });

  } catch (error) {
    console.error('Error in getDoctorPatients:', error);
    throw error;
  }
}

export async function getPatientDetailForDoctor(
  patientId: string, 
  doctorId: string, 
  supabaseClient?: SupabaseClient
): Promise<DoctorPatient | null> {
  const supabase = supabaseClient || await createClient();
  
  try {
    // Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        user_profiles:user_id(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', patientId)
      .single();

    if (patientError) {
      throw new Error(`Failed to fetch patient: ${patientError.message}`);
    }

    // Get appointment history with this doctor
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        hospital:hospitals(
          name,
          address
        )
      `)
      .eq('patient_id', patientId)
      .eq('doctor_id', doctorId)
      .order('appointment_date', { ascending: false });

    if (appointmentError) {
      throw new Error(`Failed to fetch appointments: ${appointmentError.message}`);
    }

    const latestAppointment = appointments && appointments.length > 0 ? appointments[0] : null;
    const completedAppointments = appointments?.filter(apt => apt.status === 'completed') || [];
    const lastVisitDate = completedAppointments.length > 0 ? completedAppointments[0].appointment_date : null;

    return {
      ...patient,
      user_profiles: patient.user_profiles,
      latest_appointment: latestAppointment ? {
        id: latestAppointment.id,
        appointment_date: latestAppointment.appointment_date,
        appointment_time: latestAppointment.appointment_time,
        status: latestAppointment.status,
        notes: latestAppointment.notes,
        hospital: latestAppointment.hospital
      } : null,
      appointment_count: appointments?.length || 0,
      last_visit_date: lastVisitDate,
      appointment_history: appointments || []
    } as DoctorPatient & { appointment_history: any[] };

  } catch (error) {
    console.error('Error in getPatientDetailForDoctor:', error);
    return null;
  }
}

function sort(): (v: any, k: number) => unknown {
  throw new Error('Function not implemented.');
}
