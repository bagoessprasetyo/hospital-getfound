'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Hospital, 
  MapPin, 
  Phone, 
  Globe, 
  Star,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase'
import type { EnhancedHospital } from '@/lib/types/hospital'

type Hospital = Database['public']['Tables']['hospitals']['Row'] & {
  doctor_count?: number
  available_doctors?: number
  average_rating?: number
  specialties?: string[]
  services?: string[]
  city?: string
  phone?: string
}

interface EnhancedHospitalCardProps {
  hospital: EnhancedHospital
  showBookingButton?: boolean
}

export function EnhancedHospitalCard({ 
  hospital, 
  showBookingButton = true 
}: EnhancedHospitalCardProps) {
  const rating = hospital.average_rating || 0
  const doctorCount = hospital.doctor_count || 0
  const availableDoctors = hospital.available_doctors || 0
  const specialties = hospital.specialties || []
  const services = hospital.services || []

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
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
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        text: `${availableDoctors} doctors available`,
        className: 'text-green-700 bg-green-50'
      }
    } else if (doctorCount > 0) {
      return {
        icon: <Clock className="h-4 w-4 text-yellow-500" />,
        text: 'Limited availability',
        className: 'text-yellow-700 bg-yellow-50'
      }
    } else {
      return {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        text: 'No doctors available',
        className: 'text-red-700 bg-red-50'
      }
    }
  }

  const availabilityStatus = getAvailabilityStatus()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Hospital Image */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {hospital.image_url ? (
          <img
            src={hospital.image_url}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Hospital className="h-12 w-12 text-primary-400" />
          </div>
        )}
        
        {/* Rating Badge */}
        {rating > 0 && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs font-medium text-gray-900">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {hospital.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{hospital.address}</span>
          </div>
          
          {/* Rating Stars */}
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-gray-600">
                ({rating.toFixed(1)})
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {hospital.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {hospital.description}
          </p>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-1">
              {specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{specialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          {hospital.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{hospital.phone}</span>
            </div>
          )}
          
          {hospital.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
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
        </div>

        {/* Doctor Count & Availability */}
        <div className="flex items-center justify-between py-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{doctorCount} doctors</span>
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${availabilityStatus.className}`}>
            {availabilityStatus.icon}
            <span>{availabilityStatus.text}</span>
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Services</h4>
            <div className="flex flex-wrap gap-1">
              {services.slice(0, 4).map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {services.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{services.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/hospitals/${hospital.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          
          {showBookingButton && availableDoctors > 0 && (
            <Link href={`/hospitals/${hospital.id}/book`} className="flex-1">
              <Button className="w-full btn-medical-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}