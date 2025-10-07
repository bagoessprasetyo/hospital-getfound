'use client'

import { useEffect, useState } from 'react'
import { Building2, MapPin, Phone, Star, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { getHospitals } from '@/lib/supabase/hospitals'
import type { Hospital } from '@/lib/types/hospital'

interface FeaturedHospitalsProps {
  hospitals?: Hospital[]
}

export function FeaturedHospitals({ hospitals: propHospitals }: FeaturedHospitalsProps = {}) {
  const [hospitals, setHospitals] = useState<Hospital[]>(propHospitals || [])
  const [loading, setLoading] = useState(!propHospitals)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (propHospitals) return

    async function fetchHospitals() {
      try {
        setLoading(true)
        const data = await getHospitals()
        setHospitals(data)
      } catch (err) {
        console.error('Error fetching hospitals:', err)
        setError('Failed to load hospitals')
        // Fallback to default hospitals
        setHospitals(defaultHospitals)
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [propHospitals])

  // Show only first 6 hospitals for featured section
  const featuredHospitals = hospitals.slice(0, 6)

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black mb-4">
              Featured Healthcare Providers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading top-rated hospitals and medical centers...
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Featured Healthcare Providers
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Please try again later or contact support.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-black mb-4">
            Featured Healthcare Providers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover top-rated hospitals and medical centers in your area, 
            trusted by thousands of patients for quality healthcare services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {hospitals.slice(0, 6).map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 bg-gray-100">
                {hospital.image_url && (
                  <img
                    src={hospital.image_url}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-black mb-2">{hospital.name}</h3>
                
                <div className="flex items-start gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span className="text-sm">{hospital.address}</span>
                </div>
                
                {hospital.phone && (
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{hospital.phone}</span>
                  </div>
                )}
                
                {hospital.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hospital.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Available 24/7</span>
                  </div>
                  
                  <Link href={`/hospitals/${hospital.id}`}>
                    <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/hospitals">
            <Button size="lg" variant="outline" className="border-black text-black hover:bg-gray-100">
              <Building2 className="w-5 h-5 mr-2" />
              View All Hospitals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Default hospitals data for when Supabase data is not available
const defaultHospitals: (Hospital & { specialties?: string[], rating?: number, doctorCount?: number })[] = [
  {
    id: '1',
    name: 'City General Hospital',
    address: '123 Medical Center Drive, Downtown',
    phone: '+1 (555) 123-4567',
    description: 'Leading medical facility providing comprehensive healthcare services with state-of-the-art equipment and experienced medical professionals.',
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hospital%20building%20medical%20center%20healthcare%20facility%20blue%20sky&image_size=landscape_4_3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specialties: ['Cardiology', 'Emergency Care', 'Surgery', 'Pediatrics'],
    rating: 4.8,
    doctorCount: 45
  },
  {
    id: '2',
    name: 'Metropolitan Medical Center',
    address: '456 Health Plaza, Medical District',
    phone: '+1 (555) 234-5678',
    description: 'Specialized in advanced cardiac care and emergency services, serving the community for over 30 years.',
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=large%20medical%20hospital%20complex%20healthcare%20building%20professional%20architecture&image_size=landscape_4_3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specialties: ['Cardiology', 'Neurology', 'Oncology'],
    rating: 4.7,
    doctorCount: 38
  },
  {
    id: '3',
    name: 'Regional Health Institute',
    address: '789 Wellness Boulevard, Health District',
    phone: '+1 (555) 345-6789',
    description: 'Comprehensive healthcare facility focusing on preventive care and specialized treatments.',
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=regional%20hospital%20medical%20institute%20healthcare%20center%20modern%20design&image_size=landscape_4_3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specialties: ['Internal Medicine', 'Orthopedics', 'Radiology'],
    rating: 4.6,
    doctorCount: 32
  },
  {
    id: '4',
    name: 'Community Care Hospital',
    address: '321 Community Street, Riverside',
    phone: '+1 (555) 456-7890',
    description: 'Patient-centered care with a focus on family medicine and community health services.',
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=community%20hospital%20healthcare%20facility%20welcoming%20medical%20center&image_size=landscape_4_3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specialties: ['Family Medicine', 'Pediatrics', 'Women\'s Health'],
    rating: 4.5,
    doctorCount: 28
  },
  {
    id: '5',
    name: 'Advanced Surgical Center',
    address: '654 Surgery Lane, Medical Park',
    phone: '+1 (555) 567-8901',
    description: 'State-of-the-art surgical facility with minimally invasive procedures and expert surgical teams.',
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=surgical%20center%20medical%20facility%20advanced%20healthcare%20technology&image_size=landscape_4_3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specialties: ['Surgery', 'Anesthesiology', 'Recovery Care'],
    rating: 4.9,
    doctorCount: 22
  },
  {
    id: '6',
    name: 'Children\'s Medical Center',
    address: '987 Kids Care Avenue, Family District',
    phone: '+1 (555) 678-9012',
    description: 'Dedicated pediatric hospital providing specialized care for children and adolescents.',
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=children%20hospital%20pediatric%20medical%20center%20colorful%20kid%20friendly&image_size=landscape_4_3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specialties: ['Pediatrics', 'Pediatric Surgery', 'Child Psychology'],
    rating: 4.8,
    doctorCount: 35
  }
]