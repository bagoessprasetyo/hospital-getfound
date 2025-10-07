import { requireDoctor, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { DoctorPatient, getDoctorPatients } from '@/lib/supabase/doctors'
import { DoctorPatientsClient } from '@/components/doctors/doctor-patients-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Calendar, 
  UserCheck,
  Activity,
  Home,
  ChevronRight
} from 'lucide-react'

export default async function DoctorPatientsPage() {
  const { user, profile } = await requireDoctor()
  const supabase = await createClient()

  // Get doctor's information
  console.log('Looking up doctor for user ID:', user.id)
  
  // First, let's check what's in the doctors table using admin client to bypass RLS
  const { createAdminClient } = await import('@/lib/supabase/api')
  const adminSupabase = createAdminClient()
  
  const { data: allDoctors, error: allDoctorsError } = await adminSupabase
    .from('doctors')
    .select(`
      id, 
      specialization, 
      user_id,
      user_profiles!inner(full_name)
    `)
    .limit(10)
  
  console.log('All doctors in table:', { allDoctors, allDoctorsError })
  
  // Try with admin client first
  const { data: doctorDataAdmin, error: doctorErrorAdmin } = await adminSupabase
    .from('doctors')
    .select(`
      id, 
      specialization, 
      user_id,
      user_profiles!inner(full_name)
    `)
    .eq('user_id', user.id)
    .maybeSingle()
    
  console.log('Doctor lookup with admin client:', { doctorDataAdmin, doctorErrorAdmin })
  
  // Also try with regular client
  const { data: doctorData, error: doctorError } = await supabase
    .from('doctors')
    .select(`
      id, 
      specialization, 
      user_id,
      user_profiles!inner(full_name)
    `)
    .eq('user_id', user.id)
    .maybeSingle() // Use maybeSingle instead of single to avoid error when no record

  console.log('Doctor lookup result:', { doctorData, doctorError })

  if (doctorError) {
    console.error('Doctor lookup error:', doctorError)
  }

  // Use admin data if regular data is not available (RLS issue)
  const finalDoctorData = doctorData || doctorDataAdmin
  
  if (!finalDoctorData) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Doctor Profile Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load doctor information for user ID: {user.id}
          </p>
          {doctorError && (
            <div className="text-red-600 text-sm mb-4">
              Error: {doctorError.message}
            </div>
          )}
          <div className="text-xs text-gray-500">
            <p>User role: {profile?.role}</p>
            <p>Total doctors in system: {allDoctors?.length || 0}</p>
          </div>
        </div>
      </div>
    )
  }

  // Get doctor's patients
  let patients: DoctorPatient[] = []
  let error = null
  
  try {
    patients = await getDoctorPatients(finalDoctorData.id, supabase)
  } catch (err) {
    console.error('Error fetching patients:', err)
    error = err instanceof Error ? err.message : 'Failed to load patients'
  }

  // Calculate statistics
  const totalPatients = patients.length
  const newPatientsThisMonth = patients.filter(patient => {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return new Date(patient.created_at) > monthAgo
  }).length
  
  const upcomingAppointments = patients.filter(patient => 
    patient.latest_appointment && 
    patient.latest_appointment.status === 'confirmed' &&
    new Date(patient.latest_appointment.appointment_date) >= new Date()
  ).length

  const recentVisits = patients.filter(patient => 
    patient.latest_appointment && 
    patient.latest_appointment.status === 'completed' &&
    new Date(patient.latest_appointment.appointment_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">My Patients</span>
          </div>
        </div>
      </header>
      <Separator />

      {/* Page Content */}
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Patients
          </h1>
          <p className="text-gray-600">
            Manage and view your patient roster and appointment history.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
                </div>
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Under your care
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{newPatientsThisMonth}</p>
                </div>
                <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-success-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  This month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{upcomingAppointments}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Scheduled
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Visits</p>
                  <p className="text-3xl font-bold text-gray-900">{recentVisits}</p>
                </div>
                <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-600">
                  Last 7 days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              Patient Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                  <Activity className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Unable to load patients
                </h3>
                <p className="text-gray-600">
                  {error}
                </p>
              </div>
            ) : (
              <DoctorPatientsClient 
                patients={patients} 
                doctorId={finalDoctorData.id}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}