import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { DoctorAppointmentsClient } from '@/components/appointments/doctor-appointments-client'
import { Button } from '@/components/ui/button'
import { Calendar, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DoctorAppointmentsPage() {
  const { user, profile } = await requireRole('doctor')
  const supabase = await createClient()

  // Get the doctor's ID
  console.log('Looking up doctor for user ID:', user.id)
  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('id, user_id')
    .eq('user_id', user.id)
    .single()

  console.log('Doctor lookup result:', { doctor, doctorError })

  if (doctorError) {
    console.error('Doctor lookup error:', doctorError)
  }

  if (!doctor) {
    throw new Error('Doctor profile not found')
  }

  // Fetch appointments for this doctor with related data
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients!inner (
        id,
        user_profiles!inner (
          id,
          full_name,
          email,
          phone
        )
      ),
      hospitals (
        id,
        name,
        address
      )
    `)
    .eq('doctor_id', doctor.id)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error)
  }

  return (
    <>
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-4">
          <Calendar className="h-6 w-6 mr-3 text-[#1e40af]" />
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold">My Appointments</h1>
              <p className="text-sm text-muted-foreground">
                Manage your patient appointments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
            <p className="text-muted-foreground">
              View and manage your upcoming and past appointments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/doctor/availability">
              <Button className="bg-[#ADE3FF] hover:bg-[#ADE3FF]/80 text-[#1e40af] border-[#ADE3FF]/20">
                <Plus className="h-4 w-4 mr-2" />
                Manage Availability
              </Button>
            </Link>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          <DoctorAppointmentsClient 
            initialAppointments={appointments || []} 
            doctorId={doctor.id}
          />
        </div>
      </div>
    </>
  )
}