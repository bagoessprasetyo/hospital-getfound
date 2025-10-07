'use client'

import { 
  Phone, 
  Mail, 
  Globe, 
  Clock,
  Star,
  Users,
  Heart,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { EnhancedHospital } from '@/lib/types/hospital'

interface HospitalInfoCardProps {
  hospital: EnhancedHospital
}

export function HospitalInfoCard({ hospital }: HospitalInfoCardProps) {
  const rating = hospital.average_rating || 0
  const doctorCount = hospital.doctor_count || 0
  const availableDoctors = hospital.available_doctors || 0
  const specialties = hospital.specialties || []

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hospital Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rating */}
        {rating > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-700">Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(rating)}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                (Based on patient reviews)
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Users className="h-5 w-5 text-primary-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{doctorCount}</div>
            <div className="text-xs text-gray-600">Total Doctors</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Heart className="h-5 w-5 text-primary-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-gray-900">{specialties.length}</div>
            <div className="text-xs text-gray-600">Specialties</div>
          </div>
        </div>

        {/* Availability */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Availability</span>
          </div>
          <div className="text-sm text-gray-600">
            {availableDoctors > 0 ? (
              <span className="text-green-600 font-medium">
                {availableDoctors} doctors available today
              </span>
            ) : doctorCount > 0 ? (
              <span className="text-yellow-600 font-medium">
                Limited availability - please call
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                No doctors currently available
              </span>
            )}
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Contact</span>
          </div>
          
          <div className="space-y-2">
            {hospital.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-600">{hospital.phone}</span>
              </div>
            )}
            
            {hospital.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-600">{hospital.email}</span>
              </div>
            )}
            
            {hospital.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3 text-gray-400" />
                <a 
                  href={hospital.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Operating Hours */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Hours</span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Monday - Friday</span>
              <span>8:00 AM - 8:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday</span>
              <span>9:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday</span>
              <span>10:00 AM - 4:00 PM</span>
            </div>
            <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span className="font-medium">Emergency: 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Insurance</span>
          </div>
          <div className="text-sm text-gray-600">
            Accepts most major insurance plans
          </div>
          <div className="mt-1">
            <Badge variant="secondary" className="text-xs">
              Verify Coverage
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}