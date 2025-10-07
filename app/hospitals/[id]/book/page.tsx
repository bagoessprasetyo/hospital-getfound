import { getUser, getUserProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PublicHeaderServer } from '@/components/homepage/public-header-server'
import { HospitalBooking } from '@/components/hospitals/hospital-booking'
import { getHospitalWithDetails } from '@/lib/supabase/hospitals'
import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'

interface HospitalBookingPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: HospitalBookingPageProps): Promise<Metadata> {
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
      title: `Book Appointment - ${hospital.name}`,
      description: `Book an appointment at ${hospital.name}. Choose from available doctors and time slots for your medical consultation.`,
      keywords: `${hospital.name}, book appointment, medical consultation, healthcare, ${hospital.city}`,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Book Hospital Appointment',
      description: 'Book an appointment at your preferred hospital.'
    }
  }
}

export default async function HospitalBookingPage({ params }: HospitalBookingPageProps) {
  // Check authentication first
  const user = await getUser()
  
  if (!user) {
    // Redirect to login with return URL
    const returnUrl = `/hospitals/${params.id}/book`
    redirect(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  const profile = await getUserProfile()
  const supabase = await createClient()

  try {
    // Fetch hospital details
    const hospital = await getHospitalWithDetails(params.id, supabase)
    
    if (!hospital) {
      notFound()
    }

    // Fetch doctors associated with this hospital
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select(`
        *,
        user_profiles!inner(
          id,
          full_name,
          avatar_url,
          phone,
          email
        ),
        doctor_hospitals!inner(
          hospital_id
        )
      `)
      .eq('doctor_hospitals.hospital_id', params.id)
      .eq('status', 'active')

    if (doctorsError) {
      console.error('Error fetching doctors:', doctorsError)
      throw new Error('Failed to load doctors')
    }

    console.log('✅ Doctors fetched successfully:', {
      count: doctors?.length || 0,
      hospitalId: params.id,
      doctors: doctors?.map(d => ({ 
        id: d.id, 
        name: d.user_profiles?.full_name,
        specialization: d.specialization 
      }))
    })

    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeaderServer />
        
        <main className="pt-16">
          <HospitalBooking 
            hospital={hospital}
            doctors={doctors || []}
            user={user}
            userProfile={profile}
          />
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading hospital booking page:', error)
    
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeaderServer />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Unable to Load Booking Page
              </h1>
              <p className="text-gray-600 mb-8">
                There was an error loading the booking information. Please try again later.
              </p>
              <a 
                href={`/hospitals/${params.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Hospital Details
              </a>
            </div>
          </div>
        </main>
      </div>
    )
  }
}