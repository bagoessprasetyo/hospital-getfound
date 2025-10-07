import { requireAuth, getUserProfile } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import { PublicHeaderServer } from '@/components/homepage/public-header-server'
import { PatientProfileForm } from '@/components/profile/patient-profile-form'
import { PatientAppointments } from '@/components/profile/patient-appointments'
import { getPatientProfile, getPatientAppointments } from '@/lib/supabase/patients'

export default async function MyProfilePage() {
  const user = await requireAuth()
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/auth/login')
  }

  // Only allow patients to access this page
  if (profile.role !== 'patient') {
    redirect('/dashboard')
  }

  // Get patient profile and appointments
  const patientProfile = await getPatientProfile(user.id)
  const appointments = await getPatientAppointments(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeaderServer />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information and view your appointments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Personal Information
              </h2>
              <PatientProfileForm 
                userProfile={profile}
                patientProfile={patientProfile}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Appointments</span>
                  <span className="font-semibold text-blue-600">
                    {appointments.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upcoming</span>
                  <span className="font-semibold text-green-600">
                    {appointments.filter(apt => 
                      apt.status === 'confirmed' && 
                      new Date(apt.appointment_date) > new Date()
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-primary-600">
                    {appointments.filter(apt => apt.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href="/hospitals"
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Find Hospitals
                </a>
                <a
                  href="/doctors"
                  className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Find Doctors
                </a>
                <a
                  href="/appointments/book"
                  className="block w-full text-center border border-primary-600 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Book Appointment
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              My Appointments
            </h2>
            <PatientAppointments appointments={appointments} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">HealthCare Connect</h3>
              <p className="text-gray-400 mb-4">
                Connecting patients with quality healthcare providers and facilities across the region.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/doctors" className="hover:text-white transition-colors">Find Doctors</a></li>
                <li><a href="/hospitals" className="hover:text-white transition-colors">Find Hospitals</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 HealthCare Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}