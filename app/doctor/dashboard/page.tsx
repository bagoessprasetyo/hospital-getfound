import { getUser, getUserProfile, requireDoctor } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  Clock, 
  Activity,
  Stethoscope,
  Heart,
  CalendarDays,
  UserCheck,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default async function DoctorDashboardPage() {
  const { user, profile } = await requireDoctor()
  const supabase = await createClient()

  // Get doctor's information
  const { data: doctorData } = await supabase
    .from('doctors')
    .select(`
      *,
      doctor_hospitals(
        hospital:hospitals(
          id,
          name,
          address
        )
      )
    `)
    .eq('user_id', user.id)
    .single()

  // Get recent appointments (mock data for now)
  const recentAppointments = [
    {
      id: '1',
      patient_name: 'John Doe',
      time: '9:00 AM',
      date: 'Today',
      status: 'confirmed',
      type: 'Consultation'
    },
    {
      id: '2',
      patient_name: 'Jane Smith',
      time: '10:30 AM',
      date: 'Today',
      status: 'pending',
      type: 'Follow-up'
    }
  ]

  // Get doctor's hospitals
  const hospitals = doctorData?.doctor_hospitals?.map((dh: any) => dh.hospital) || []

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, Dr. {profile?.full_name || 'Doctor'}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your practice today.
        </p>
      </div>

      {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                    <p className="text-3xl font-bold text-gray-900">8</p>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12% from yesterday</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-3xl font-bold text-gray-900">156</p>
                  </div>
                  <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-success-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <UserCheck className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+5 new this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Session Time</p>
                    <p className="text-3xl font-bold text-gray-900">32m</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Activity className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">Within target range</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Patient Rating</p>
                    <p className="text-3xl font-bold text-gray-900">4.8</p>
                  </div>
                  <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+0.2 this month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Appointments */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary-600" />
                    Today's Appointments
                  </CardTitle>
                  <Link href="/doctor/appointments">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patient_name}</p>
                            <p className="text-sm text-gray-600">{appointment.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{appointment.time}</p>
                          <Badge 
                            variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile & Quick Actions */}
            <div className="space-y-6">
              {/* Doctor Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary-600" />
                    Doctor Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Stethoscope className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      Dr. {profile?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">{doctorData?.specialization}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{doctorData?.years_of_experience || 0} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">License:</span>
                        <span className="font-medium">{doctorData?.license_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Consultation Fee:</span>
                        <span className="font-medium">${doctorData?.consultation_fee}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Associated Hospitals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Associated Hospitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hospitals.length > 0 ? (
                      hospitals.map((hospital: any) => (
                        <div key={hospital.id} className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 text-sm">{hospital.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{hospital.address}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">No hospitals associated</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/doctor/availability">
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="h-4 w-4 mr-2" />
                      Manage Availability
                    </Button>
                  </Link>
                  <Link href="/doctor/patients">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      View Patients
                    </Button>
                  </Link>
                  <Link href="/my-profile">
                    <Button variant="outline" className="w-full justify-start">
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
    </div>
  )
}