'use client'

import { CheckCircle, Calendar, Clock, User, MapPin, Phone, Mail, Download, Share2 } from 'lucide-react'
import { BookingData } from './hospital-booking'
import { format } from 'date-fns'
import Link from 'next/link'

interface BookingSuccessStepProps {
  bookingData: BookingData
  onNewBooking: () => void
}

export function BookingSuccessStep({ bookingData, onNewBooking }: BookingSuccessStepProps) {
  const { hospital, doctor, selectedDate, selectedTime, patientInfo, appointmentId } = bookingData

  if (!doctor || !selectedDate || !selectedTime || !patientInfo) {
    return null
  }

  const handleDownloadConfirmation = () => {
    // Create a simple text confirmation
    const confirmationText = `
APPOINTMENT CONFIRMATION

Appointment ID: ${appointmentId}
Date: ${format(selectedDate, 'EEEE, MMMM d, yyyy')}
Time: ${selectedTime}

Hospital: ${hospital.name}
Address: ${hospital.address}

Doctor: Dr. ${doctor.user_profiles?.full_name}
Specialization: ${doctor.specialization}

Patient: ${patientInfo.fullName}
Phone: ${patientInfo.phone}
Email: ${patientInfo.email}

Reason: ${patientInfo.reason}
${patientInfo.notes ? `Notes: ${patientInfo.notes}` : ''}

Please arrive 15 minutes before your appointment time.
Bring a valid ID and insurance card if applicable.
    `.trim()

    const blob = new Blob([confirmationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointment-confirmation-${appointmentId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShareConfirmation = async () => {
    const shareData = {
      title: 'Appointment Confirmation',
      text: `Appointment confirmed for ${format(selectedDate, 'MMMM d, yyyy')} at ${selectedTime} with Dr. ${doctor.user_profiles?.full_name} at ${hospital.name}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text)
      alert('Appointment details copied to clipboard!')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Appointment Confirmed!
        </h1>
        <p className="text-gray-600">
          Your appointment has been successfully booked. You will receive a confirmation email shortly.
        </p>
      </div>

      {/* Appointment Details Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-900">
              Appointment Details
            </h2>
            {appointmentId && (
              <span className="text-sm text-blue-600 font-mono">
                ID: {appointmentId}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div className="flex items-center justify-center space-x-8 py-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-gray-900">
                {format(selectedDate, 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                {format(selectedDate, 'EEEE')}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-semibold text-gray-900">{selectedTime}</p>
              <p className="text-sm text-gray-600">
                {parseInt(selectedTime) >= 12 ? 'PM' : 'AM'}
              </p>
            </div>
          </div>

          {/* Hospital & Doctor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                Hospital
              </h3>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{hospital.name}</p>
                <p className="text-gray-600 text-sm">{hospital.address}</p>
                {hospital.phone && (
                  <p className="text-gray-600 text-sm flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {hospital.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Doctor
              </h3>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">
                  Dr. {doctor.user_profiles?.full_name}
                </p>
                <p className="text-blue-600 text-sm">{doctor.specialization}</p>
                {doctor.user_profiles?.phone && (
                  <p className="text-gray-600 text-sm flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {doctor.user_profiles.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{patientInfo.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium text-gray-900">{patientInfo.phone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium text-gray-900">{patientInfo.email}</span>
                </div>
                <div>
                  <span className="text-gray-600">Reason:</span>
                  <span className="ml-2 font-medium text-gray-900">{patientInfo.reason}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Reminders */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-900 mb-2">Important Reminders</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Please arrive 15 minutes before your appointment time</li>
          <li>• Bring a valid ID and insurance card if applicable</li>
          <li>• You will receive a confirmation email with additional details</li>
          <li>• For cancellations or rescheduling, contact the hospital at least 24 hours in advance</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadConfirmation}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Confirmation
          </button>
          <button
            onClick={handleShareConfirmation}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Details
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/my-appointments"
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View My Appointments
          </Link>
          <button
            onClick={onNewBooking}
            className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Book Another Appointment
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}