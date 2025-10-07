import { PublicHeader } from '@/components/homepage/public-header'
import { PublicHospitalList } from '@/components/hospitals/public-hospital-list'
import { getHospitalsWithDetails, getFilterOptions } from '@/lib/supabase/hospitals'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Loading component for the hospital list
function HospitalListLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      <span className="ml-2 text-gray-600">Loading hospitals...</span>
    </div>
  )
}

export default async function PublicHospitalPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
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
        <PublicHeader />
        
        <main className="pt-16">
          {/* Hero Section */}
          <section className="py-20 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Find the Best Hospitals
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Discover top-rated healthcare facilities with advanced search and filtering. 
                Find the perfect hospital for your medical needs.
              </p>
            </div>
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

              <Suspense fallback={<HospitalListLoading />}>
                <PublicHospitalList 
                  hospitals={hospitals.map(h => ({ ...h, phone: h.phone ?? '' }))}
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
      </div>
    )
  } catch (error) {
    console.error('Error loading hospitals page:', error)
    
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        
        <main className="pt-16">
          <section className="py-20 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Find the Best Hospitals
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Discover top-rated healthcare facilities in your area
              </p>
            </div>
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
                  Unable to load hospitals
                </h3>
                <p className="text-gray-600">
                  There was an error loading the hospital data. Please try again later.
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