import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { requireAuth, getUserProfile } from '@/lib/auth/server'
import { PublicHeaderServer } from '@/components/homepage/public-header-server'
import AppointmentsClient from '@/components/appointments/appointments-client'

export default async function AppointmentsPage() {
  // Require authentication
  const user = await requireAuth()
  
  // Get user profile
  const profile = await getUserProfile()

  // Redirect doctors and admins to their respective dashboards
  if (profile.role === 'doctor') {
    redirect('/doctor/appointments')
  }
  
  if (profile.role === 'admin') {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeaderServer />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#3A3A3A' }}>
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-opacity-20" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)', borderColor: '#ADE3FF' }}>
                <span className="text-sm font-medium" style={{ color: '#ADE3FF' }}>Healthcare Management</span>
              </div>
              
              {/* Main heading */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                  My
                  <span className="block" style={{ color: '#ADE3FF' }}>Appointments</span>
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  View and manage your medical appointments with ease
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }>
              <AppointmentsClient userId={user.id} />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  )
}