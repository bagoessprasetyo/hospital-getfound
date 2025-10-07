'use client'

import { ChevronLeft, Calendar, Clock, User, Phone, Mail, MapPin, FileText, DollarSign } from 'lucide-react'
import { BookingData } from './hospital-booking'
import { format } from 'date-fns'
import Image from 'next/image'

interface BookingConfirmationStepProps {
  bookingData: BookingData
  isLoading: boolean
  onConfirm: () => void
  onBack: () => void
}

export function BookingConfirmationStep({
  bookingData,
  isLoading,
  onConfirm,
  onBack
}: BookingConfirmationStepProps) {
  const { hospital, doctor, selectedDate, selectedTime, patientInfo } = bookingData

  if (!doctor || !selectedDate || !selectedTime || !patientInfo) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Missing booking information. Please go back and complete all steps.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirm Your Appointment
        </h2>
        <p className="text-gray-600">
          Please review your appointment details before confirming.
        </p>
      </div>

      <div className="space-y-6">
        {/* Hospital Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Hospital Details
          </h3>
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{hospital.name}</p>
            <p className="text-gray-600">{hospital.address}</p>
            {hospital.phone && (
              <p className="text-gray-600 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {hospital.phone}
              </p>
            )}
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Doctor Details
          </h3>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                {doctor.image_url ? (
                  <Image
                    src={doctor.image_url || ''}
                    alt={doctor.user_profiles?.full_name || 'Doctor'}
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
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Dr. {doctor.user_profiles?.full_name}
              </p>
              <p className="text-blue-600">{doctor.specialization}</p>
              {doctor.experience_years && (
                <p className="text-gray-600 text-sm">
                  {doctor.experience_years} years experience
                </p>
              )}
              {doctor.consultation_fee && (
                <p className="text-gray-900 font-medium flex items-center mt-1">
                  <DollarSign className="w-4 h-4 mr-1" />
                  ${doctor.consultation_fee} consultation fee
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Date & Time */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Appointment Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium text-gray-900">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium text-gray-900">{selectedTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium text-gray-900">{patientInfo.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium text-gray-900">
                {format(new Date(patientInfo.dateOfBirth), 'MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">{patientInfo.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{patientInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium text-gray-900 capitalize">{patientInfo.gender}</p>
            </div>
          </div>
        </div>

        {/* Reason for Visit */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Appointment Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Reason for Visit</p>
              <p className="text-gray-900">{patientInfo.reason}</p>
            </div>
            {patientInfo.notes && (
              <div>
                <p className="text-sm text-gray-600">Additional Notes</p>
                <p className="text-gray-900">{patientInfo.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-yellow-900 mb-1">Important Notice</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Please arrive 15 minutes before your appointment time</li>
                <li>• Bring a valid ID and insurance card if applicable</li>
                <li>• You will receive a confirmation email after booking</li>
                <li>• Cancellations must be made at least 24 hours in advance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Booking Appointment...
            </>
          ) : (
            'Confirm Appointment'
          )}
        </button>
      </div>
    </div>
  )
}