'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import type { EnhancedHospital } from '@/lib/types/hospital'
import { DoctorWithHospitals } from '@/lib/types/doctor'
import { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
import { BookingProgressIndicator } from './booking-progress-indicator'
import { HospitalInfoStep } from './hospital-info-step'
import { DoctorSelectionStep } from './doctor-selection-step'
import { TimeSlotSelectionStep } from './time-slot-selection-step'
import { PatientInfoStep } from './patient-info-step'
import { BookingConfirmationStep } from './booking-confirmation-step'
import { BookingSuccessStep } from './booking-success-step'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { createAppointment } from '@/lib/supabase/appointments'
import { getOrCreatePatientProfile } from '@/lib/supabase/patients'

export interface BookingData {
  hospital: EnhancedHospital
  doctor?: DoctorWithHospitals
  selectedDate?: Date
  selectedTime?: string
  patientInfo?: {
    fullName: string
    phone: string
    email: string
    dateOfBirth: string
    gender: 'male' | 'female' | 'other'
    reason: string
    notes?: string
  }
  appointmentId?: string
}

interface HospitalBookingProps {
  hospital: EnhancedHospital
  doctors: DoctorWithHospitals[]
  user: User
  userProfile: UserProfile | null
}

const BOOKING_STEPS = [
  { id: 1, title: 'Hospital Info', description: 'Review hospital details' },
  { id: 2, title: 'Select Doctor', description: 'Choose your preferred doctor' },
  { id: 3, title: 'Choose Time', description: 'Pick date and time slot' },
  { id: 4, title: 'Patient Info', description: 'Enter patient details' },
  { id: 5, title: 'Confirmation', description: 'Review and confirm booking' },
]

export function HospitalBooking({ hospital, doctors, user, userProfile }: HospitalBookingProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    hospital
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isBookingComplete, setIsBookingComplete] = useState(false)

  // Initialize patient info with user profile data
  useEffect(() => {
    if (userProfile && !bookingData.patientInfo) {
      setBookingData(prev => ({
        ...prev,
        patientInfo: {
          fullName: userProfile.full_name || '',
          phone: userProfile.phone || '',
          email: userProfile.email || user.email || '',
          dateOfBirth: '',
          gender: 'other' as 'male' | 'female' | 'other',
          reason: '',
          notes: ''
        }
      }))
    }
  }, [userProfile, user.email, bookingData.patientInfo])

  const handleStepComplete = (stepData: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...stepData }))
    setError(null)
    
    if (currentStep < BOOKING_STEPS.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setError(null)
    }
  }

  const handleBookingSubmit = async () => {
    if (!bookingData.doctor || !bookingData.selectedDate || !bookingData.selectedTime || !bookingData.patientInfo) {
      setError('Please complete all required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !currentUser) {
        throw new Error('User not authenticated')
      }
      
      // Get or create patient profile - pass the authenticated supabase client
      const patient = await getOrCreatePatientProfile(currentUser.id, supabase)
      if (!patient) {
        throw new Error('Failed to create patient profile')
      }
      
      // Create appointment
      const appointmentData = {
        patient_id: patient.id,
        doctor_id: bookingData.doctor.id,
        hospital_id: hospital.id,
        appointment_date: bookingData.selectedDate.toISOString().split('T')[0],
        appointment_time: bookingData.selectedTime,
        status: 'pending' as const,
        reason_for_visit: bookingData.patientInfo.reason,
        notes: bookingData.patientInfo.notes || null
      }
      
      const appointment = await createAppointment(appointmentData)

      // Update booking data with appointment ID
      setBookingData(prev => ({
        ...prev,
        appointmentId: appointment.id
      }))

      setIsBookingComplete(true)
      toast.success('Appointment booked successfully!')
      
    } catch (error) {
      console.error('Error creating appointment:', error)
      setError(error instanceof Error ? error.message : 'Failed to book appointment')
      toast.error('Failed to book appointment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isBookingComplete) {
    return (
      <BookingSuccessStep 
        bookingData={bookingData}
        onNewBooking={() => {
          setIsBookingComplete(false)
          setCurrentStep(1)
          setBookingData({ hospital })
          setError(null)
        }}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Book Appointment
        </h1>
        <p className="text-gray-600">
          Schedule your appointment at {hospital.name}
        </p>
      </div>

      {/* Progress Indicator */}
      <BookingProgressIndicator 
        steps={BOOKING_STEPS}
        currentStep={currentStep}
        className="mb-8"
      />

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {currentStep === 1 && (
          <HospitalInfoStep
            hospital={hospital}
            onNext={() => handleStepComplete({})}
          />
        )}

        {currentStep === 2 && (
          <DoctorSelectionStep
            doctors={doctors}
            selectedDoctor={bookingData.doctor}
            onNext={(doctor) => handleStepComplete({ doctor })}
            onBack={handleStepBack}
          />
        )}

        {currentStep === 3 && bookingData.doctor && (
          <TimeSlotSelectionStep
            doctor={bookingData.doctor}
            hospital={hospital}
            selectedDate={bookingData.selectedDate}
            selectedTime={bookingData.selectedTime}
            onNext={(selectedDate, selectedTime) => 
              handleStepComplete({ selectedDate, selectedTime })
            }
            onBack={handleStepBack}
          />
        )}

        {currentStep === 4 && (
          <PatientInfoStep
            patientInfo={bookingData.patientInfo}
            onNext={(patientInfo) => handleStepComplete({ patientInfo })}
            onBack={handleStepBack}
          />
        )}

        {currentStep === 5 && (
          <BookingConfirmationStep
            bookingData={bookingData}
            isLoading={isLoading}
            onConfirm={handleBookingSubmit}
            onBack={handleStepBack}
          />
        )}
      </div>
    </div>
  )
}