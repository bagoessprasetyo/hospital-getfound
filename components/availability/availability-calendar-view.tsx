'use client'

import { useState } from 'react'
import { DoctorAvailability, DAYS_OF_WEEK } from '@/lib/types/availability'
import { AvailabilityFormDialog } from './availability-form-dialog'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface AvailabilityCalendarViewProps {
  availability: DoctorAvailability[]
  doctor: { 
    id: string
    first_name?: string
    last_name?: string
    user_profiles?: { full_name: string }
    specialization: string
  }
  hospitals: Array<{ id: string; name: string }>
  onUpdate: () => void
  onDelete: () => void
}

// Generate time slots from 6 AM to 10 PM
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 6; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 22) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

// Hospital colors for visual distinction
const HOSPITAL_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
]

export function AvailabilityCalendarView({ 
  availability, 
  doctor, 
  hospitals, 
  onUpdate, 
  onDelete 
}: AvailabilityCalendarViewProps) {
  const [selectedAvailability, setSelectedAvailability] = useState<DoctorAvailability | null>(null)

  // Debug logging
  console.log('AvailabilityCalendarView - availability data:', availability)
  console.log('AvailabilityCalendarView - TIME_SLOTS:', TIME_SLOTS)
  console.log('AvailabilityCalendarView - DAYS_OF_WEEK:', DAYS_OF_WEEK)
  
  // Debug time formats
  if (availability.length > 0) {
    console.log('Sample availability start_time format:', availability[0].start_time, typeof availability[0].start_time)
    console.log('Sample availability end_time format:', availability[0].end_time, typeof availability[0].end_time)
    console.log('Sample TIME_SLOTS format:', TIME_SLOTS[0], typeof TIME_SLOTS[0])
    console.log('Full availability object:', JSON.stringify(availability[0], null, 2))
  }

  // Get hospital color based on hospital ID
  const getHospitalColor = (hospitalId: string) => {
    const index = hospitals.findIndex(h => h.id === hospitalId)
    return HOSPITAL_COLORS[index % HOSPITAL_COLORS.length]
  }

  // Get hospital name by ID
  const getHospitalName = (hospitalId: string) => {
    return hospitals.find(h => h.id === hospitalId)?.name || 'Unknown Hospital'
  }

  // Convert time string to minutes for positioning
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Normalize time format - convert HH:MM:SS to HH:MM
  const normalizeTime = (timeStr: string) => {
    if (!timeStr) return ''
    // If it's already in HH:MM format, return as is
    if (timeStr.length === 5 && timeStr.includes(':')) return timeStr
    // If it's in HH:MM:SS format, remove seconds
    if (timeStr.length === 8 && timeStr.split(':').length === 3) {
      return timeStr.substring(0, 5)
    }
    return timeStr
  }

  // Get availability for a specific day and time slot
  const getAvailabilityForSlot = (dayValue: number, timeSlot: string) => {
    const result = availability.filter(avail => {
      if (avail.day_of_week !== dayValue) return false
      
      const normalizedStartTime = normalizeTime(avail.start_time)
      const normalizedEndTime = normalizeTime(avail.end_time)
      
      const slotMinutes = timeToMinutes(timeSlot)
      const startMinutes = timeToMinutes(normalizedStartTime)
      const endMinutes = timeToMinutes(normalizedEndTime)
      
      const isInRange = slotMinutes >= startMinutes && slotMinutes <= endMinutes
      
      // Debug logging for all checks
      console.log(`Checking slot ${timeSlot} for day ${dayValue}:`, {
        availId: avail.id,
        originalStartTime: avail.start_time,
        normalizedStartTime,
        originalEndTime: avail.end_time,
        normalizedEndTime,
        slotMinutes,
        startMinutes,
        endMinutes,
        isInRange
      })
      
      return isInRange
    })
    
    // Debug logging for specific slots
    if (result.length > 0) {
      console.log(`Found ${result.length} availability(s) for day ${dayValue}, slot ${timeSlot}:`, result)
    }
    
    return result
  }

  // Calculate the height and position of availability blocks
  const getAvailabilityBlockStyle = (avail: DoctorAvailability) => {
    const normalizedStartTime = normalizeTime(avail.start_time)
    const normalizedEndTime = normalizeTime(avail.end_time)
    const startMinutes = timeToMinutes(normalizedStartTime)
    const endMinutes = timeToMinutes(normalizedEndTime)
    const durationMinutes = endMinutes - startMinutes
    
    // Calculate position from the start of the calendar (6:00 AM = 360 minutes)
    const calendarStartMinutes = 6 * 60 // 6:00 AM
    const topOffset = ((startMinutes - calendarStartMinutes) / 30) * 64 // Each 30-min slot is 64px
    
    // Each 30-minute slot is 64px high (h-16)
    const height = Math.max((durationMinutes / 30) * 64, 40)
    
    console.log(`Block style for ${avail.id}:`, {
      originalStart: avail.start_time,
      normalizedStart: normalizedStartTime,
      originalEnd: avail.end_time,
      normalizedEnd: normalizedEndTime,
      startMinutes,
      endMinutes,
      durationMinutes,
      topOffset,
      height
    })
    
    return {
      height: `${height}px`,
      top: `${topOffset}px`,
      minHeight: '40px'
    }
  }

  const handleDelete = async (availabilityId: string) => {
    try {
      const response = await fetch(`/api/availability/${availabilityId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete availability')
      }

      toast.success('Availability deleted successfully')
      onDelete()
    } catch (error) {
      console.error('Error deleting availability:', error)
      toast.error('Failed to delete availability')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Calendar Header */}
      <div className="grid grid-cols-8 border-b bg-gray-50">
        <div className="p-4 text-sm font-medium text-gray-600 border-r">Time</div>
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.value} className="p-4 text-sm font-medium text-gray-900 text-center border-r last:border-r-0">
            {day.label}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="relative">
        <div className="grid grid-cols-8">
          {/* Time Column */}
          <div className="border-r bg-gray-50">
            {TIME_SLOTS.map((timeSlot) => (
              <div key={timeSlot} className="h-16 p-2 border-b text-xs text-gray-600 flex items-center">
                {timeSlot}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className="border-r last:border-r-0 relative">
              {/* Time slot grid */}
              {TIME_SLOTS.map((timeSlot) => (
                <div key={timeSlot} className="h-16 border-b"></div>
              ))}
              
              {/* Availability blocks positioned absolutely */}
              {availability
                .filter(avail => avail.day_of_week === day.value)
                .map((avail) => (
                  <div
                    key={avail.id}
                    className={`absolute left-1 right-1 border-2 rounded-md p-1 cursor-pointer hover:shadow-md transition-shadow group ${getHospitalColor(avail.hospital_id)}`}
                    style={getAvailabilityBlockStyle(avail)}
                    onClick={() => setSelectedAvailability(avail)}
                  >
                    <div className="text-xs font-medium truncate">
                      {getHospitalName(avail.hospital_id)}
                    </div>
                    <div className="text-xs opacity-75">
                      {normalizeTime(avail.start_time)} - {normalizeTime(avail.end_time)}
                    </div>
                    <div className="text-xs opacity-75">
                      Max: {avail.max_patients}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AvailabilityFormDialog
                        doctors={[doctor]}
                        hospitals={hospitals}
                        onSuccess={onUpdate}
                        editData={avail}
                        trigger={
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-white/50"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        }
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(avail.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="text-sm font-medium text-gray-700 mr-4">Hospitals:</div>
          {hospitals.map((hospital, index) => (
            <div key={hospital.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border-2 ${getHospitalColor(hospital.id)}`}></div>
              <span className="text-sm text-gray-700">{hospital.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Availability Detail Modal */}
      {selectedAvailability && (
        <AvailabilityFormDialog
          doctors={[doctor]}
          hospitals={hospitals}
          onSuccess={() => {
            onUpdate()
            setSelectedAvailability(null)
          }}
          editData={selectedAvailability}
          trigger={<div />}
          open={!!selectedAvailability}
          onOpenChange={(open) => !open && setSelectedAvailability(null)}
        />
      )}
    </div>
  )
}