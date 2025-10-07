'use client'

import { 
  Hospital, 
  MapPin, 
  Phone, 
  Globe, 
  Star,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  ChevronLeft,
  Navigation,
  Shield,
  Heart,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EnhancedHospital } from '@/lib/types/hospital'
import { HospitalInfoCard } from './hospital-info-card'
import { AssociatedDoctorsList } from './associated-doctors-list'

interface HospitalDetailProps {
  hospital: EnhancedHospital
}

export function HospitalDetail({ hospital }: HospitalDetailProps) {
  const rating = hospital.average_rating || 0
  const doctorCount = hospital.doctor_count || 0
  const availableDoctors = hospital.available_doctors || 0
  const specialties = hospital.specialties || []
  const services = hospital.services || []
  const doctors = hospital.doctors || []

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getAvailabilityStatus = () => {
    if (availableDoctors > 0) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        text: `${availableDoctors} doctors available`,
        className: 'text-green-700 bg-green-50 border-green-200'
      }
    } else if (doctorCount > 0) {
      return {
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
        text: 'Limited availability',
        className: 'text-yellow-700 bg-yellow-50 border-yellow-200'
      }
    } else {
      return {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        text: 'No doctors available',
        className: 'text-red-700 bg-red-50 border-red-200'
      }
    }
  }

  const availabilityStatus = getAvailabilityStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/hospitals" className="hover:text-gray-700 flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Hospitals
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{hospital.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Hospital Image */}
            <div className="lg:col-span-2">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                {hospital.image_url ? (
                  <img
                    src={hospital.image_url}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Hospital className="h-24 w-24 text-gray-400" />
                  </div>
                )}
                
                {/* Rating Badge */}
                {rating > 0 && (
                  <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(rating)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hospital Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {hospital.name}
                </h1>
                
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 flex-shrink-0" />
                  <span>{hospital.address}</span>
                </div>

                {/* Availability Status */}
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${availabilityStatus.className}`}>
                  {availabilityStatus.icon}
                  <span>{availabilityStatus.text}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{doctorCount}</div>
                    <div className="text-sm text-gray-600">Doctors</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Heart className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{specialties.length}</div>
                    <div className="text-sm text-gray-600">Specialties</div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {hospital.phone && (
                  <Button className="w-full btn-medical-primary">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Hospital
                  </Button>
                )}
                
                {availableDoctors > 0 && (
                  <Button variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                )}
                
                {hospital.website && (
                  <Button variant="outline" className="w-full">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {hospital.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary-600" />
                      About {hospital.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{hospital.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Hospital Services */}
              {hospital.hospital_services && hospital.hospital_services.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary-600" />
                      Services Offered
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Group services by category */}
                    {(() => {
                      const servicesByCategory = hospital.hospital_services.reduce((acc, hs) => {
                        const category = hs.category
                        if (!acc[category]) {
                          acc[category] = []
                        }
                        acc[category].push(hs)
                        return acc
                      }, {} as Record<string, any[]>)

                      return (
                        <div className="space-y-6">
                          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                            <div key={category}>
                              <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                                {category}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {categoryServices.map((service) => (
                                  <div key={service.id} className="flex items-start gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-gray-700 font-medium">{service.name}</span>
                                      {service.description && (
                                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Specialties */}
              {specialties.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary-600" />
                      Medical Specialties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-sm">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Associated Doctors */}
              {doctors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary-600" />
                      Our Medical Team ({doctors.length} doctors)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AssociatedDoctorsList doctors={doctors} hospitalId={hospital.id} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Hospital Info Card */}
              <HospitalInfoCard hospital={hospital} />

              {/* Location Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    Location & Directions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-700">{hospital.address}</p>
                    {hospital.city && (
                      <p className="text-sm text-gray-500 mt-1">{hospital.city}</p>
                    )}
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              {(hospital.phone || hospital.email) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hospital.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{hospital.phone}</span>
                      </div>
                    )}
                    
                    {hospital.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{hospital.email}</span>
                      </div>
                    )}
                    
                    {hospital.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={hospital.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}