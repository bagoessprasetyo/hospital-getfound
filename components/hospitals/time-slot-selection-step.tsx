'use client'

import { useState, useEffect } from 'react'
import { DoctorWithHospitals } from '@/lib/types/doctor'
import type { EnhancedHospital } from '@/lib/types/hospital'
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, addDays, startOfWeek, isSameDay, isToday, isBefore, startOfDay } from 'date-fns'
import { getDoctorAvailability } from '@/lib/supabase/availability'
import { getDoctorBookedAppointments } from '@/lib/supabase/appointments'

interface TimeSlot {
  time: string
  available: boolean
  booked?: boolean
}

interface DoctorAvailability {
  id: string
  doctor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

interface TimeSlotSelectionStepProps {
  doctor: DoctorWithHospitals
  hospital: EnhancedHospital
  selectedDate?: Date
  selectedTime?: string
  onNext: (selectedDate: Date, selectedTime: string) => void
  onBack: () => void
}

export function TimeSlotSelectionStep({
  doctor,
  hospital,
  selectedDate,
  selectedTime,
  onNext,
  onBack
}: TimeSlotSelectionStepProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))
  const [currentSelectedDate, setCurrentSelectedDate] = useState<Date | undefined>(selectedDate)
  const [currentSelectedTime, setCurrentSelectedTime] = useState<string | undefined>(selectedTime)
  const [availability, setAvailability] = useState<any[]>([])
  const [bookedSlots, setBookedSlots] = useState<{ [key: string]: string[] }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  // Generate time slots (9 AM to 5 PM, 30-minute intervals)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = []
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Fetch doctor availability and booked appointments
  useEffect(() => {
    const fetchAvailabilityData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch doctor availability
        const availabilityData = await getDoctorAvailability(doctor.id)
        setAvailability(availabilityData || [])
        
        // Fetch booked appointments for the current week
        const weekStart = startOfWeek(currentWeek)
        const weekEnd = addDays(weekStart, 6)
        
        const bookedByDate: { [key: string]: string[] } = {}
        
        // Fetch booked appointments for each day of the week
        for (let i = 0; i < 7; i++) {
          const date = addDays(weekStart, i)
          const dateStr = format(date, 'yyyy-MM-dd')
          
          try {
            const bookedAppointments = await getDoctorBookedAppointments(doctor.id, dateStr)
            bookedByDate[dateStr] = bookedAppointments.map(apt => apt.appointment_time)
          } catch (error) {
            console.error(`Error fetching appointments for ${dateStr}:`, error)
            bookedByDate[dateStr] = []
          }
        }
        
        setBookedSlots(bookedByDate)
        
      } catch (error) {
        console.error('Error fetching availability data:', error)
        setError('Failed to load availability data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAvailabilityData()
  }, [doctor.id, currentWeek])

  // Check if a time slot is available for a specific date
  const isTimeSlotAvailable = (date: Date, time: string): boolean => {
    const dayOfWeek = date.getDay()
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Check if doctor is available on this day of week
    const dayAvailability = availability.find(av => av.day_of_week === dayOfWeek)
    if (!dayAvailability) return false

    // Check if time is within doctor's working hours
    const [hour, minute] = time.split(':').map(Number)
    const timeMinutes = hour * 60 + minute
    
    const [startHour, startMinute] = dayAvailability.start_time.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute
    
    const [endHour, endMinute] = dayAvailability.end_time.split(':').map(Number)
    const endMinutes = endHour * 60 + endMinute

    if (timeMinutes < startMinutes || timeMinutes >= endMinutes) return false

    // Check if slot is already booked
    const bookedTimes = bookedSlots[dateStr] || []
    if (bookedTimes.includes(time)) return false

    return true
  }

  const handleDateSelect = (date: Date) => {
    setCurrentSelectedDate(date)
    setCurrentSelectedTime(undefined) // Reset time selection when date changes
  }

  const handleTimeSelect = (time: string) => {
    setCurrentSelectedTime(time)
  }

  const handleNext = () => {
    if (currentSelectedDate && currentSelectedTime) {
      onNext(currentSelectedDate, currentSelectedTime)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7)
    setCurrentWeek(newWeek)
    setCurrentSelectedDate(undefined)
    setCurrentSelectedTime(undefined)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading availability...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Date &amp; Time
        </h2>
        <p className="text-gray-600">
          Choose your preferred appointment date and time with Dr. {doctor.user_profiles?.full_name}.
        </p>
      </div>

      {/* Doctor Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Dr. {doctor.user_profiles?.full_name}
            </h3>
            <p className="text-blue-600">{doctor.specialization}</p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {format(currentWeek, 'MMMM yyyy')}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const isPast = isBefore(date, startOfDay(new Date()))
            const hasAvailability = availability.some(av => av.day_of_week === date.getDay())
            const isSelected = currentSelectedDate && isSameDay(date, currentSelectedDate)
            
            return (
              <button
                key={index}
                onClick={() => !isPast && hasAvailability && handleDateSelect(date)}
                disabled={isPast || !hasAvailability}
                className={`p-3 text-center rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isPast || !hasAvailability
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-xs font-medium">
                  {format(date, 'EEE')}
                </div>
                <div className={`text-lg font-semibold ${isToday(date) && !isSelected ? 'text-blue-600' : ''}`}>
                  {format(date, 'd')}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Slots */}
      {currentSelectedDate && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Available Times - {format(currentSelectedDate, 'EEEE, MMMM d')}
          </h3>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {timeSlots.map(time => {
              const isAvailable = isTimeSlotAvailable(currentSelectedDate, time)
              const isSelected = currentSelectedTime === time
              
              return (
                <button
                  key={time}
                  onClick={() => isAvailable && handleTimeSelect(time)}
                  disabled={!isAvailable}
                  className={`p-2 text-sm font-medium rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isAvailable
                      ? 'bg-white text-gray-900 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  {time}
                </button>
              )
            })}
          </div>
          
          {timeSlots.filter(time => isTimeSlotAvailable(currentSelectedDate, time)).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No available time slots for this date.
            </div>
          )}
        </div>
      )}

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
          disabled={!currentSelectedDate || !currentSelectedTime}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Patient Info
        </button>
      </div>
    </div>
  )
}