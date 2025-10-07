import { getOptionalUserWithProfile } from '@/lib/auth/server'
import { createClient } from '@/lib/supabase/server'
import { PublicHeaderServer } from '@/components/homepage/public-header-server'
import { EnhancedHospitalList } from '@/components/hospitals/enhanced-hospital-list'
import { getHospitalsWithDetails, getFilterOptions } from '@/lib/supabase/hospitals'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FloatingChatButton } from '@/components/chat/floating-chat-button'

// Loading component for the hospital list - matching doctor page skeleton
function HospitalListSkeleton() {
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

export default async function HospitalsPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { user, profile } = await getOptionalUserWithProfile()
  const supabase = await createClient()

  try {
    // Build filters from search parameters
    const filters = {
      search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
      cities: typeof searchParams.cities === 'string' ? searchParams.cities.split(',').filter(Boolean) : [],
      specialties: typeof searchParams.specialties === 'string' ? searchParams.specialties.split(',').filter(Boolean) : [],
      services: typeof searchParams.services === 'string' ? searchParams.services.split(',').filter(Boolean) : [],
      minRating: typeof searchParams.minRating === 'string' ? parseInt(searchParams.minRating) : 0,
      hasAvailableDoctors: searchParams.hasAvailableDoctors === 'true'
    }

    // Fetch hospitals with enhanced data and filter options
    const [hospitals, filterOptions] = await Promise.all([
      getHospitalsWithDetails(filters, supabase),
      getFilterOptions(supabase)
    ])

    return (
      <div className="min-h-screen bg-white">
        <PublicHeaderServer />
        
        <main className="pt-16">
          {/* Hero Section - Modern 2025 Design matching doctors page */}
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
                    Find the Best
                    <span className="block" style={{ color: '#ADE3FF' }}>Hospital</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    Discover top-rated healthcare facilities in your area. 
                    Browse by specialty, services, and location to find the perfect hospital for your needs.
                  </p>
                </div>
                
                {/* Stats or features */}
                <div className="flex flex-wrap justify-center gap-8 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>100+</div>
                    <div className="text-gray-400 text-sm">Trusted Hospitals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>30+</div>
                    <div className="text-gray-400 text-sm">Medical Specialties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>24/7</div>
                    <div className="text-gray-400 text-sm">Emergency Care</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom border - solid color */}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#ADE3FF' }}></div>
          </section>
        
          {/* Hospital List Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Healthcare Facilities
                </h2>
                <p className="text-gray-600">
                  Browse and filter hospitals to find the best care for you
                </p>
              </div>

              <Suspense fallback={<HospitalListSkeleton />}>
                <EnhancedHospitalList 
                  hospitals={hospitals}
                  availableCities={filterOptions.cities}
                  availableSpecialties={filterOptions.specialties}
                  availableServices={filterOptions.services}
                />
              </Suspense>
            </div>
          </section>
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

        {/* Floating Chat Button */}
        <FloatingChatButton />
      </div>
    )
  } catch (error) {
    console.error('Error loading hospitals page:', error)
    
    return (
      <div className="min-h-screen bg-white">
        <PublicHeaderServer />
        
        <main className="pt-16">
          {/* Hero Section - Modern 2025 Design matching doctors page */}
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
                    Find the Best
                    <span className="block" style={{ color: '#ADE3FF' }}>Hospital</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                    Discover top-rated healthcare facilities in your area. 
                    Browse by specialty, services, and location to find the perfect hospital for your needs.
                  </p>
                </div>
                
                {/* Stats or features */}
                <div className="flex flex-wrap justify-center gap-8 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>100+</div>
                    <div className="text-gray-400 text-sm">Trusted Hospitals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>30+</div>
                    <div className="text-gray-400 text-sm">Medical Specialties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold" style={{ color: '#ADE3FF' }}>24/7</div>
                    <div className="text-gray-400 text-sm">Emergency Care</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom border - solid color */}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#ADE3FF' }}></div>
          </section>
        
          {/* Error Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Healthcare Facilities
                </h2>
                <p className="text-gray-600">
                  Browse and filter hospitals to find the best care for you
                </p>
              </div>

              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Unable to load hospitals
                </h3>
                <p className="text-gray-600">
                  There was an error loading the hospital data. Please try again later.
                </p>
              </div>
            </div>
          </section>
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

        {/* Floating Chat Button */}
        <FloatingChatButton />
      </div>
    )
  }
}