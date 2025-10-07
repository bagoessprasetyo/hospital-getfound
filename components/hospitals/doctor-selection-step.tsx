'use client'

import { useState } from 'react'
import { DoctorWithHospitals } from '@/lib/types/doctor'
import { Search, Star, Clock, DollarSign, User, ChevronLeft } from 'lucide-react'
import Image from 'next/image'

interface DoctorSelectionStepProps {
  doctors: DoctorWithHospitals[]
  selectedDoctor?: DoctorWithHospitals
  onNext: (doctor: DoctorWithHospitals) => void
  onBack: () => void
}

export function DoctorSelectionStep({ 
  doctors, 
  selectedDoctor, 
  onNext, 
  onBack 
}: DoctorSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [currentSelectedDoctor, setCurrentSelectedDoctor] = useState<DoctorWithHospitals | undefined>(selectedDoctor)

  // Debug logging
  console.log('🔍 DoctorSelectionStep received doctors:', {
    count: doctors?.length || 0,
    doctors: doctors?.map(d => ({ 
      id: d.id, 
      name: d.user_profiles?.full_name,
      specialization: d.specialization 
    }))
  })

  // Get unique specialties for filtering
  const specialties = Array.from(new Set(
    doctors
      .map(doctor => doctor.specialization)
      .filter(Boolean)
  )).sort()

  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm || 
      doctor.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialty = !selectedSpecialty || doctor.specialization === selectedSpecialty
    
    return matchesSearch && matchesSpecialty
  })

  const handleDoctorSelect = (doctor: DoctorWithHospitals) => {
    setCurrentSelectedDoctor(doctor)
  }

  const handleNext = () => {
    if (currentSelectedDoctor) {
      onNext(currentSelectedDoctor)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select a Doctor
        </h2>
        <p className="text-gray-600">
          Choose your preferred doctor from our available specialists.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty('')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !selectedSpecialty
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Specialties
          </button>
          {specialties.map(specialty => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedSpecialty === specialty
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="space-y-4 mb-6">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or specialty filter.
            </p>
          </div>
        ) : (
          filteredDoctors.map(doctor => (
            <div
              key={doctor.id}
              onClick={() => handleDoctorSelect(doctor)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                currentSelectedDoctor?.id === doctor.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Doctor Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    {(doctor.user_profiles as any)?.avatar_url || doctor.image_url ? (
                      <Image
                        src={(doctor.user_profiles as any)?.avatar_url || doctor.image_url || ''}
                        alt={(doctor.user_profiles as any)?.full_name || 'Doctor'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {doctor.user_profiles?.full_name || 'Unknown'}
                      </h3>
                      {doctor.specialization && (
                        <p className="text-blue-600 font-medium">
                          {doctor.specialization}
                        </p>
                      )}
                    </div>
                    
                    {/* Selection Indicator */}
                    {currentSelectedDoctor?.id === doctor.id && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Doctor Details */}
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {doctor.experience_years && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{doctor.experience_years} years experience</span>
                        </div>
                      )}
                      
                      {doctor.consultation_fee && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${doctor.consultation_fee}</span>
                        </div>
                      )}
                      
                      {(doctor as any).rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{(doctor as any).rating}</span>
                        </div>
                      )}
                    </div>

                    {doctor.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {doctor.bio}
                      </p>
                    )}

                    {/* Languages */}
                    {(doctor as any).languages && (doctor as any).languages.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(doctor as any).languages.map((language: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!currentSelectedDoctor}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Time Selection
        </button>
      </div>
    </div>
  )
}