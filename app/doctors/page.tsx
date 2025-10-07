import { Suspense } from 'react'
import { PublicHeaderServer } from '@/components/homepage/public-header-server'
import { PublicDoctorList } from '@/components/doctors/public-doctor-list'
import { Card, CardContent } from '@/components/ui/card'
import { getDoctorsWithDetails, getDoctorFilterOptions } from '@/lib/supabase/doctors'
import { createClient } from '@/lib/supabase/server'
import { FloatingChatButton } from '@/components/chat/floating-chat-button'

function DoctorListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse overflow-hidden">
          <div className="relative h-48 bg-gray-200">
            <div className="absolute top-4 right-4 w-16 h-8 bg-gray-300 rounded-full"></div>
          </div>
          <CardContent className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
            
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function DoctorsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()

  try {
    // Build filters from search parameters
    const filters = {
      search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
      specializations: typeof searchParams.specializations === 'string' ? searchParams.specializations.split(',').filter(Boolean) : [],
      hospitals: typeof searchParams.hospitals === 'string' ? searchParams.hospitals.split(',').filter(Boolean) : [],
      minExperience: typeof searchParams.minExperience === 'string' ? parseInt(searchParams.minExperience) : 0,
      maxFee: typeof searchParams.maxFee === 'string' ? parseInt(searchParams.maxFee) : 0,
      hasAvailability: searchParams.hasAvailability === 'true'
    }

    // Fetch doctors with enhanced data and filter options
    const [doctors, filterOptions] = await Promise.all([
      getDoctorsWithDetails(filters, supabase),
      getDoctorFilterOptions(supabase)
    ])

    return (
      <div className="min-h-screen bg-white">
        <PublicHeaderServer />
        
        <main className="pt-16">
          {/* Hero Section - Modern 2025 Design */}
          <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#3A3A3A' }}>
            {/* Subtle background pattern - solid color accents */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-32 h-32 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
              <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full" style={{ backgroundColor: '#ADE3FF' }}></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full border border-opacity-20" style={{ backgroundColor: 'rgba(173, 227, 255, 0.1)', borderColor: '#ADE3FF' }}>
                  <span className="text-sm font-medium" style={{ color: '#ADE3FF' }}>Healthcare Excellence</span>
                </div>
                
                {/* Main heading with modern typography */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                    Find the Right
                    <span className="block" style={{ color: '#ADE3FF' }}>Doctor</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    Connect with experienced healthcare professionals in your area. 
                    Browse by specialty, location, and availability to book your appointment today.
                  </p>
                </div>
                
                {/* Stats or features */}
                <div className="flex flex-wrap justify-center gap-8 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>500+</div>
                    <div className="text-gray-400 text-sm">Qualified Doctors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>50+</div>
                    <div className="text-gray-400 text-sm">Specializations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>24/7</div>
                    <div className="text-gray-400 text-sm">Available Support</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom border - solid color */}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#ADE3FF' }}></div>
          </section>
        
          {/* Doctor List Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Healthcare Professionals
                </h2>
                <p className="text-gray-600">
                  Browse and filter doctors to find the best care for you
                </p>
              </div>

              <Suspense fallback={<DoctorListSkeleton />}>
                <PublicDoctorList 
                  doctors={doctors} 
                  filterOptions={filterOptions}
                />
              </Suspense>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">HealthCare</h3>
                <p className="text-gray-400">
                  Connecting patients with quality healthcare providers nationwide.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Find Hospitals</li>
                  <li>Book Appointments</li>
                  <li>Emergency Care</li>
                  <li>Telemedicine</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Help Center</li>
                  <li>Contact Us</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Emergency</h4>
                <p className="text-gray-400 mb-2">For medical emergencies:</p>
                <p className="text-red-400 font-semibold">Call 911</p>
                <p className="text-gray-400">or (555) 911-HELP</p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 HealthCare Management System. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Floating Chat Button */}
        <FloatingChatButton />
      </div>
    )
  } catch (error) {
    console.error('Error loading doctors page:', error)
    return (
      <div className="min-h-screen bg-white">
        <PublicHeaderServer />
        
        <main className="pt-16">
          <section className="relative py-24 bg-black overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #ADE3FF 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, #ADE3FF 0%, transparent 50%)`
              }}></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 backdrop-blur-sm">
                  <span className="text-primary-400 text-sm font-medium">Healthcare Excellence</span>
                </div>
                
                {/* Main heading with modern typography */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                    Find the Right
                    <span className="block text-primary-400">Doctor</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    Browse our network of qualified healthcare professionals and book appointments with ease
                  </p>
                </div>
                
                {/* Stats or features */}
                <div className="flex flex-wrap justify-center gap-8 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-400">500+</div>
                    <div className="text-gray-400 text-sm">Qualified Doctors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-400">50+</div>
                    <div className="text-gray-400 text-sm">Specializations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-400">24/7</div>
                    <div className="text-gray-400 text-sm">Available Support</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom fade effect */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
          </section>

          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Unable to load doctors
                </h3>
                <p className="text-gray-600">
                  There was an error loading the doctor data. Please try again later.
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-400">
              <p>&copy; 2024 HealthCare Management System. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }
}