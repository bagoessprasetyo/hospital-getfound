import { requireRole } from '@/lib/auth'
import { getDoctors } from '@/lib/supabase/doctors'
import { createClient } from '@/lib/supabase/server'
import { AvailabilityManagement } from '@/components/availability/availability-management'

export default async function AvailabilityPage() {
  await requireRole('admin')
  
  const supabase = await createClient()
  
  // Fetch doctors and hospitals for the form
  const [doctorsData, hospitalsData] = await Promise.all([
    getDoctors(),
    supabase.from('hospitals').select('id, name').order('name')
  ])
  
  const hospitals = hospitalsData.data || []
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Availability Management</h1>
        <p className="text-gray-600 mt-2">
          Manage doctor schedules and availability across different hospitals
        </p>
      </div>
      
      <AvailabilityManagement 
        doctors={doctorsData.map(doc => ({
          id: doc.id,
          first_name: doc.user_profiles?.full_name.split(' ')[0] || '',
          last_name: doc.user_profiles?.full_name.split(' ')[1] || '',
          user_profiles: { full_name: doc.user_profiles?.full_name || '' },
          specialization: doc.specialization || ''
        }))}
        hospitals={hospitals}
      />
    </div>
  )
}