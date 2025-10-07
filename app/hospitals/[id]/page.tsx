import { getUser, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PublicHeaderServer } from '@/components/homepage/public-header-server'
import { getHospitalWithDetails } from '@/lib/supabase/hospitals'
import { HospitalDetail } from '@/components/hospitals/hospital-detail'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface HospitalDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: HospitalDetailPageProps): Promise<Metadata> {
  const supabase = await createClient()
  
  try {
    const hospital = await getHospitalWithDetails(params.id, supabase)
    
    if (!hospital) {
      return {
        title: 'Hospital Not Found',
        description: 'The requested hospital could not be found.'
      }
    }

    return {
      title: `${hospital.name} - Hospital Details`,
      description: hospital.description || `Find information about ${hospital.name}, including services, doctors, and contact details.`,
      openGraph: {
        title: `${hospital.name} - Hospital Details`,
        description: hospital.description || `Find information about ${hospital.name}`,
        images: hospital.image_url ? [hospital.image_url] : undefined,
      }
    }
  } catch (error) {
    return {
      title: 'Hospital Details',
      description: 'View detailed information about healthcare facilities.'
    }
  }
}

export default async function HospitalDetailPage({ params }: HospitalDetailPageProps) {
  const user = await getUser()
  const profile = user ? await getUserProfile() : null
  const supabase = await createClient()

  try {
    const hospital = await getHospitalWithDetails(params.id, supabase)
    
    if (!hospital) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-white">
        <PublicHeaderServer />
        
        <main className="pt-16">
          <HospitalDetail hospital={hospital} />
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
  } catch (error) {
    console.error('Error loading hospital detail page:', error)
    
    return (
      <div className="min-h-screen bg-white">
        <PublicHeaderServer />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Unable to load hospital details
              </h1>
              <p className="text-gray-600 mb-6">
                There was an error loading the hospital information. Please try again later.
              </p>
              <a
                href="/hospitals"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Back to Hospitals
              </a>
            </div>
          </div>
        </main>
      </div>
    )
  }
}