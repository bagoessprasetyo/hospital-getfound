'use client'

import type { EnhancedHospital } from '@/lib/types/hospital'
import { MapPin, Phone, Mail, Globe, Star, Users, Clock } from 'lucide-react'
import Image from 'next/image'

interface HospitalInfoStepProps {
  hospital: EnhancedHospital
  onNext: () => void
}

export function HospitalInfoStep({ hospital, onNext }: HospitalInfoStepProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Hospital Information
        </h2>
        <p className="text-gray-600">
          Review the hospital details before proceeding with your appointment booking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hospital Image */}
        <div className="space-y-4">
          <div className="relative h-64 w-full rounded-lg overflow-hidden bg-gray-100">
            {hospital.image_url ? (
              <Image
                src={hospital.image_url}
                alt={hospital.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-blue-600 font-medium">{hospital.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(hospital as any).doctorCount || 0}
              </div>
              <div className="text-sm text-blue-700">Doctors Available</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center mb-1">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-2xl font-bold text-green-600">
                  {(hospital as any).rating || 'N/A'}
                </span>
              </div>
              <div className="text-sm text-green-700">Patient Rating</div>
            </div>
          </div>
        </div>

        {/* Hospital Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {hospital.name}
            </h3>
            
            {hospital.description && (
              <p className="text-gray-600 mb-4 leading-relaxed">
                {hospital.description}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Contact Information</h4>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-900">{hospital.address}</p>
                {hospital.city && (
                  <p className="text-gray-600 text-sm">{hospital.city}</p>
                )}
              </div>
            </div>

            {hospital.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <a 
                  href={`tel:${hospital.phone}`}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {hospital.phone}
                </a>
              </div>
            )}

            {hospital.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <a 
                  href={`mailto:${hospital.email}`}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {hospital.email}
                </a>
              </div>
            )}

            {hospital.website && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <a 
                  href={hospital.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Specialties */}
          {hospital.specialties && hospital.specialties.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Medical Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {hospital.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {hospital.services && hospital.services.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Available Services</h4>
              <div className="flex flex-wrap gap-2">
                {hospital.services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Operating Hours */}
          {(hospital as any).operating_hours && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Operating Hours</h4>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{(hospital as any).operating_hours}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Continue to Doctor Selection
        </button>
      </div>
    </div>
  )
}