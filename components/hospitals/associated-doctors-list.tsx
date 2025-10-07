'use client'

import { useState, useMemo } from 'react'
import { 
  User, 
  MapPin, 
  Clock,
  Calendar,
  Star,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AssociatedDoctorsListProps {
  doctors: any[]
  hospitalId: string
}

export function AssociatedDoctorsList({ doctors, hospitalId }: AssociatedDoctorsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)

  // Get unique specialties for filter
  const specialties = useMemo(() => {
    const uniqueSpecialties = Array.from(new Set(
      doctors.map(doctor => doctor.specialization).filter(Boolean)
    ))
    return uniqueSpecialties.sort()
  }, [doctors])

  // Filter doctors based on search and filters
  const filteredDoctors = useMemo(() => {
    let filtered = doctors

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(doctor =>
        doctor.first_name?.toLowerCase().includes(searchLower) ||
        doctor.last_name?.toLowerCase().includes(searchLower) ||
        doctor.user_profiles?.full_name?.toLowerCase().includes(searchLower) ||
        doctor.specialization?.toLowerCase().includes(searchLower)
      )
    }

    // Specialty filter
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialization === selectedSpecialty)
    }

    // Availability filter
    if (showAvailableOnly) {
      filtered = filtered.filter(doctor => 
        doctor.is_active !== false && 
        doctor.doctor_availability && 
        doctor.doctor_availability.length > 0 &&
        doctor.doctor_availability.some((availability: any) => availability.is_available)
      )
    }

    return filtered
  }, [doctors, searchTerm, selectedSpecialty, showAvailableOnly])

  const getDoctorAvailability = (doctor: any) => {
    if (doctor.is_active === false) {
      return {
        status: 'inactive',
        icon: <AlertCircle className="h-4 w-4 text-gray-400" />,
        text: 'Currently unavailable',
        className: 'text-gray-500 bg-gray-50'
      }
    }

    const hasAvailability = doctor.doctor_availability && 
      doctor.doctor_availability.length > 0 &&
      doctor.doctor_availability.some((availability: any) => availability.is_available)

    if (hasAvailability) {
      return {
        status: 'available',
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        text: 'Available for appointments',
        className: 'text-green-700 bg-green-50'
      }
    } else {
      return {
        status: 'limited',
        icon: <Clock className="h-4 w-4 text-yellow-500" />,
        text: 'Limited availability',
        className: 'text-yellow-700 bg-yellow-50'
      }
    }
  }

  const getDoctorDisplayName = (doctor: any) => {
    if (doctor.user_profiles?.full_name) {
      return doctor.user_profiles.full_name
    }
    return `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || 'Unknown Doctor'
  }

  const getDoctorInitials = (doctor: any) => {
    const name = getDoctorDisplayName(doctor)
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No doctors are currently associated with this hospital.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showAvailableOnly ? "default" : "outline"}
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
          className="w-full sm:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          Available Only
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </span>
        {(searchTerm || selectedSpecialty !== 'all' || showAvailableOnly) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('')
              setSelectedSpecialty('all')
              setShowAvailableOnly(false)
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Doctors List */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDoctors.map((doctor) => {
            const availability = getDoctorAvailability(doctor)
            const displayName = getDoctorDisplayName(doctor)
            const initials = getDoctorInitials(doctor)

            return (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Doctor Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doctor.image_url} alt={displayName} />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Doctor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            Dr. {displayName}
                          </h3>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        </div>
                        
                        {/* Availability Badge */}
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${availability.className}`}>
                          {availability.icon}
                          <span className="hidden sm:inline">{availability.text}</span>
                        </div>
                      </div>

                      {/* Experience & Fee */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {doctor.years_of_experience && (
                          <span>{doctor.years_of_experience} years exp.</span>
                        )}
                        {doctor.consultation_fee && (
                          <span>Fee: ${doctor.consultation_fee}</span>
                        )}
                      </div>

                      {/* Bio */}
                      {doctor.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {doctor.bio}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link href={`/doctors/${doctor.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                        
                        {availability.status === 'available' && (
                          <Button size="sm" className="btn-medical-primary">
                            <Calendar className="h-3 w-3 mr-1" />
                            Book
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* No Results */
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No doctors found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedSpecialty !== 'all' || showAvailableOnly
              ? 'Try adjusting your search criteria or filters'
              : 'No doctors match your current filters'
            }
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setSelectedSpecialty('all')
              setShowAvailableOnly(false)
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )
}