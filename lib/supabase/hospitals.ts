import { createClient } from '@/lib/supabase/api';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Hospital, EnhancedHospital, HospitalFilters, HospitalService, HospitalServiceAssignment } from '@/lib/types/hospital';

export async function getHospitals(supabaseClient?: SupabaseClient): Promise<Hospital[]> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch hospitals: ${error.message}`);
  }

  return data;
}

export async function getHospitalById(id: string, supabaseClient?: SupabaseClient): Promise<Hospital | null> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch hospital: ${error.message}`);
  }

  return data;
}

export async function createHospital(hospital: Omit<Hospital, 'id' | 'created_at' | 'updated_at'>, supabaseClient?: SupabaseClient): Promise<Hospital> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('hospitals')
    .insert(hospital)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create hospital: ${error.message}`);
  }

  return data;
}

export async function updateHospital(id: string, hospital: Partial<Omit<Hospital, 'id' | 'created_at' | 'updated_at'>>, supabaseClient?: SupabaseClient): Promise<Hospital> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('hospitals')
    .update(hospital)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update hospital: ${error.message}`);
  }

  return data;
}

export async function deleteHospital(id: string, supabaseClient?: SupabaseClient): Promise<void> {
  const supabase = supabaseClient || await createClient();
  
  console.log(`Starting hospital deletion for ID: ${id}`);
  
  try {
    // First, delete related doctor_hospitals records
    console.log('Deleting doctor_hospitals relationships...');
    const { error: doctorHospitalsError } = await supabase
      .from('doctor_hospitals')
      .delete()
      .eq('hospital_id', id);
    
    if (doctorHospitalsError) {
      console.warn('Warning deleting doctor_hospitals:', doctorHospitalsError);
      // Continue with hospital deletion even if this fails
    }

    // Delete the hospital
    console.log('Deleting hospital...');
    const { error: hospitalError } = await supabase
      .from('hospitals')
      .delete()
      .eq('id', id);

    if (hospitalError) {
      console.error('Error deleting hospital:', hospitalError);
      throw new Error(`Failed to delete hospital: ${hospitalError.message}`);
    }
    
    console.log(`Successfully deleted hospital with ID: ${id}`);
  } catch (err) {
    console.error('Error in deleteHospital:', err);
    throw err;
  }
}

export async function getHospitalsWithDetails(
  filters?: HospitalFilters,
  supabaseClient?: SupabaseClient
): Promise<EnhancedHospital[]> {
  const supabase = supabaseClient || await createClient();
  
  let query = supabase
    .from('hospitals')
    .select(`
      *,
      doctor_hospitals!inner(
        doctor:doctors(
          id,
          specialization,
          user_profiles:user_id(full_name)
        )
      ),
      hospital_service_assignments!left(
        hospital_services!inner(
          id,
          name,
          category
        )
      )
    `);

  // Apply database-level search filtering for better performance
  if (filters?.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm) {
      // Use ILIKE for case-insensitive search in PostgreSQL
      // Search in hospital basic fields first
      query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
  }

  // Apply service-specific filters
  if (filters?.services && filters.services.length > 0) {
    const serviceConditions = filters.services.map(service => 
      `hospital_service_assignments.hospital_services.name.ilike.%${service}%`
    ).join(',');
    query = query.or(serviceConditions);
  }

  // Apply specialty-specific filters
  if (filters?.specialties && filters.specialties.length > 0) {
    const specialtyConditions = filters.specialties.map(specialty => 
      `doctor_hospitals.doctor.specialization.ilike.%${specialty}%`
    ).join(',');
    query = query.or(specialtyConditions);
  }

  // Apply other database-level filters
  if (filters?.cities && filters.cities.length > 0) {
    // Extract city from address using ILIKE for flexible matching
    const cityConditions = filters.cities.map(city => `address.ilike.%${city}%`).join(',');
    query = query.or(cityConditions);
  }

  const { data: hospitalData, error } = await query.order('name');

  if (error) {
    throw new Error(`Failed to fetch hospitals with details: ${error.message}`);
  }

  // Process the data to add computed fields
  const enhancedHospitals: EnhancedHospital[] = await Promise.all(
    hospitalData.map(async (hospital: any) => {
      // Extract city from address (simple extraction - you might want to improve this)
      const city = hospital.address.split(',').pop()?.trim() || 'Unknown';
      
      // Get unique specialties from doctors
      const specialties = Array.from(new Set(
        hospital.doctor_hospitals
          ?.map((dh: any) => dh.doctor?.specialization)
          .filter(Boolean) || []
      ));

      // Count doctors
      const doctorCount = hospital.doctor_hospitals?.length || 0;

      // Get available doctors (you might want to check actual availability)
      const availableDoctors = Math.floor(doctorCount * 0.7); // Mock calculation

      // Mock rating (you might want to implement actual ratings)
      const averageRating = 4.0 + Math.random() * 1.0;

      // Get services from the joined data or fallback to separate query
      let hospitalServices: HospitalService[] = [];
      if (hospital.hospital_service_assignments && hospital.hospital_service_assignments.length > 0) {
        hospitalServices = hospital.hospital_service_assignments
          .map((assignment: any) => assignment.hospital_services)
          .filter(Boolean);
      } else {
        // Fallback to separate query if no services in joined data
        hospitalServices = await getHospitalAssignedServices(hospital.id, supabase);
      }
      const services = hospitalServices.map(s => s.name);

      return {
        ...hospital,
        doctor_count: doctorCount,
        available_doctors: availableDoctors,
        average_rating: parseFloat(averageRating.toFixed(1)),
        specialties,
        services,
        hospital_services: hospitalServices,
        city
      };
    })
  );

  // Apply remaining client-side filters for computed fields
  let filteredHospitals = enhancedHospitals;

  // Apply additional search filtering for services and specialties (client-side for now)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase().trim();
    if (searchTerm) {
      filteredHospitals = filteredHospitals.filter(h => {
        // Basic fields are already filtered at database level
        // Check services
        const serviceMatch = h.services?.some(service => 
          service.toLowerCase().includes(searchTerm)
        ) || false;

        // Check specialties
        const specialtyMatch = h.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm)
        ) || false;

        // Return true if any match found (database already filtered basic fields)
        return serviceMatch || specialtyMatch || true; // Allow all through since basic search is done at DB level
      });
    }
  }

  if (filters?.minRating && filters.minRating > 0) {
    filteredHospitals = filteredHospitals.filter(h =>
      (h.average_rating || 0) >= filters.minRating!
    );
  }

  if (filters?.hasAvailableDoctors) {
    filteredHospitals = filteredHospitals.filter(h =>
      (h.available_doctors || 0) > 0
    );
  }

  return filteredHospitals;
}

export async function getHospitalWithDetails(id: string, supabaseClient?: SupabaseClient): Promise<EnhancedHospital | null> {
  const supabase = supabaseClient || await createClient();
  
  // First get the basic hospital data
  const { data: hospitalData, error: hospitalError } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single();

  if (hospitalError) {
    if (hospitalError.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch hospital: ${hospitalError.message}`);
  }

  if (!hospitalData) return null;

  // Then get associated doctors (using left join to handle hospitals without doctors)
  const { data: doctorData, error: doctorError } = await supabase
    .from('doctor_hospitals')
    .select(`
      doctor:doctors(
        id,
        first_name,
        last_name,
        email,
        specialization,
        license_number,
        years_of_experience,
        bio,
        consultation_fee,
        image_url,
        is_active,
        user_profiles:user_id(full_name)
      )
    `)
    .eq('hospital_id', id);

  // Get doctor availability separately to avoid complex joins
  let doctorAvailability: any[] = [];
  if (doctorData && doctorData.length > 0) {
    const doctorIds = doctorData.map(d => (d.doctor as any)?.id).filter(Boolean);
    if (doctorIds.length > 0) {
      const { data: availabilityData } = await supabase
        .from('doctor_availability')
        .select('*')
        .in('doctor_id', doctorIds)
        .eq('hospital_id', id);
      
      doctorAvailability = availabilityData || [];
    }
  }

  // Process the data to add computed fields
  const city = hospitalData.address.split(',').pop()?.trim() || 'Unknown';
  
  // Get doctors with their availability
  const doctors = doctorData?.map((dh: any) => {
    const doctor = dh.doctor;
    if (!doctor) return null;
    
    // Add availability to doctor
    const availability = doctorAvailability.filter(a => a.doctor_id === doctor.id);
    return {
      ...doctor,
      doctor_availability: availability
    };
  }).filter(Boolean) || [];

  // Get unique specialties from doctors
  const specialties = Array.from(new Set(
    doctors.map((doctor: any) => doctor?.specialization).filter(Boolean)
  ));

  const doctorCount = doctors.length;
  
  // Check availability based on doctor_availability (using is_active or is_available)
  const availableDoctors = doctors.filter((doctor: any) => 
    doctor.is_active !== false && 
    doctor.doctor_availability && 
    doctor.doctor_availability.length > 0 &&
    doctor.doctor_availability.some((availability: any) => 
      availability.is_active !== false || availability.is_available !== false
    )
  ).length;

  // Mock rating (you might want to implement actual ratings)
  const averageRating = 4.0 + Math.random() * 1.0;

  // Get actual services from database
  const hospitalServices = await getHospitalAssignedServices(id, supabase);
  const services = hospitalServices.map(s => s.name);

  return {
    ...hospitalData,
    doctor_count: doctorCount,
    available_doctors: availableDoctors,
    average_rating: parseFloat(averageRating.toFixed(1)),
    specialties,
    services,
    hospital_services: hospitalServices,
    city,
    doctors
  };
}

export async function getFilterOptions(supabaseClient?: SupabaseClient) {
  const supabase = supabaseClient || await createClient();
  
  // Get all hospitals with their details
  const hospitals = await getHospitalsWithDetails({}, supabase);
  
  // Extract unique values for filters
  const cities = Array.from(new Set(hospitals.map(h => h.city).filter(Boolean) as string[])).sort();
  const specialties = Array.from(new Set(hospitals.flatMap(h => h.specialties || []))).sort();
  
  // Get services from the database instead of mock data
  const services = await getHospitalServices(supabase);
  const serviceNames = services.map(s => s.name).sort();
  
  return {
    cities,
    specialties,
    services: serviceNames
  };
}

// Hospital Services API Functions

export async function getHospitalServices(supabaseClient?: SupabaseClient): Promise<HospitalService[]> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('hospital_services')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch hospital services: ${error.message}`);
  }

  return data;
}

export async function getHospitalServicesByCategory(supabaseClient?: SupabaseClient): Promise<Record<string, HospitalService[]>> {
  const services = await getHospitalServices(supabaseClient);
  
  return services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, HospitalService[]>);
}

export async function getHospitalAssignedServices(hospitalId: string, supabaseClient?: SupabaseClient): Promise<HospitalService[]> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('hospital_service_assignments')
    .select(`
      service:hospital_services(*)
    `)
    .eq('hospital_id', hospitalId);

  if (error) {
    throw new Error(`Failed to fetch hospital assigned services: ${error.message}`);
  }

  return (data.map(item => item.service).filter(Boolean) as unknown) as HospitalService[];
}

export async function assignServicesToHospital(
  hospitalId: string, 
  serviceIds: string[], 
  supabaseClient?: SupabaseClient
): Promise<void> {
  const supabase = supabaseClient || await createClient();
  
  // First, remove existing assignments
  const { error: deleteError } = await supabase
    .from('hospital_service_assignments')
    .delete()
    .eq('hospital_id', hospitalId);

  if (deleteError) {
    throw new Error(`Failed to remove existing service assignments: ${deleteError.message}`);
  }

  // Then, add new assignments
  if (serviceIds.length > 0) {
    const assignments = serviceIds.map(serviceId => ({
      hospital_id: hospitalId,
      service_id: serviceId
    }));

    const { error: insertError } = await supabase
      .from('hospital_service_assignments')
      .insert(assignments);

    if (insertError) {
      throw new Error(`Failed to assign services to hospital: ${insertError.message}`);
    }
  }
}

export async function createHospitalService(
  service: Omit<HospitalService, 'id' | 'created_at' | 'updated_at'>, 
  supabaseClient?: SupabaseClient
): Promise<HospitalService> {
  const supabase = supabaseClient || await createClient();
  
  const { data, error } = await supabase
    .from('hospital_services')
    .insert(service)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create hospital service: ${error.message}`);
  }

  return data;
}