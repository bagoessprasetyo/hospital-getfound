import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { DoctorAvailabilityManagement } from '@/components/availability/doctor-availability-management'

export default async function DoctorAvailabilityPage() {
  const { user, profile } = await requireRole('doctor')
  
  const supabase = await createClient()
  
  // Get the current doctor's information
  console.log('Looking up doctor for user ID:', user.id)
  const { data: doctorData, error: doctorError } = await supabase
    .from('doctors')
    .select(`
      id,
      specialization,
      user_id,
      user_profiles!inner (
        id,
        full_name,
        email
      )
    `)
    .eq('user_id', user.id)
    .single()

  console.log('Doctor lookup result:', { doctorData, doctorError })

  if (doctorError) {
    console.error('Doctor lookup error:', doctorError)
  }

  if (doctorError || !doctorData) {
    throw new Error('Doctor profile not found')
  }

  // Fetch hospitals associated with this doctor
  const { data: hospitalData, error: hospitalsError } = await supabase
    .from('doctor_hospitals')
    .select(`
      hospital:hospitals (
        id,
        name
      )
    `)
    .eq('doctor_id', doctorData.id)
    .order('hospital(name)')

  if (hospitalsError) {
    console.error('Error fetching hospitals:', hospitalsError)
  }

  // Transform the hospital data
  const hospitals = hospitalData?.map(item => item.hospital).filter(Boolean).flat() || []

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Availability</h1>
        <p className="text-gray-600 mt-2">
          Manage your schedule and availability across different hospitals
        </p>
      </div>
      
      <DoctorAvailabilityManagement 
        doctor={{
          id: doctorData.id,
          user_profiles: { full_name: (doctorData.user_profiles as any)?.full_name || '' },
          specialization: doctorData.specialization || ''
        }}
        hospitals={hospitals}
      />
    </div>
  )
}