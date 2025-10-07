'use client'

import { useState } from 'react'
import { DoctorAvailability, DAYS_OF_WEEK } from '@/lib/types/availability'
import { AvailabilityFormDialog } from './availability-form-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  MoreVertical, 
  Edit, 
  Trash2,
  Timer,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { getDoctorFullName } from '@/lib/supabase/doctors'

interface AvailabilityCardProps {
  availability: DoctorAvailability
  doctors: Array<{ 
    id: string
    first_name: string
    last_name: string
    user_profiles?: { full_name: string }
    specialization: string
  }>
  hospitals: Array<{ id: string; name: string }>
  onUpdate: () => void
  onDelete: () => void
}

export function AvailabilityCard({ 
  availability, 
  doctors, 
  hospitals, 
  onUpdate, 
  onDelete 
}: AvailabilityCardProps) {
  const [deleting, setDeleting] = useState(false)

  const dayName = DAYS_OF_WEEK.find(d => d.value === availability.day_of_week)?.label || 'Unknown'
  const hospital = hospitals.find(h => h.id === availability.hospital_id)
  const doctor = doctors.find(d => d.id === availability.doctor_id)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this availability? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/availability/${availability.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete availability')
      }

      const doctor = doctors.find(d => d.id === availability.doctor_id)
      const hospital = hospitals.find(h => h.id === availability.hospital_id)
      const dayName = DAYS_OF_WEEK.find(d => d.value === availability.day_of_week)?.label || 'Unknown'

      toast.success('Availability deleted successfully!', {
        description: `${getDoctorFullName(doctor as any)}'s ${dayName} schedule at ${hospital?.name} has been removed.`
      })
      
      onDelete()
    } catch (error) {
      console.error('Error deleting availability:', error)
      toast.error('Failed to delete availability', {
        description: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const calculateDuration = () => {
    const [startHours, startMinutes] = availability.start_time.split(':').map(Number)
    const [endHours, endMinutes] = availability.end_time.split(':').map(Number)
    
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    const durationMinutes = endTotalMinutes - startTotalMinutes
    
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${minutes}m`
    }
  }

  const calculateSlots = () => {
    const [startHours, startMinutes] = availability.start_time.split(':').map(Number)
    const [endHours, endMinutes] = availability.end_time.split(':').map(Number)
    
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    const durationMinutes = endTotalMinutes - startTotalMinutes
    
    return Math.floor(durationMinutes / availability.slot_duration)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">{dayName}</CardTitle>
            <Badge variant={availability.is_active ? 'default' : 'secondary'}>
              {availability.is_active ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {availability.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AvailabilityFormDialog
                availability={availability}
                doctors={doctors}
                hospitals={hospitals}
                onSuccess={onUpdate}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Information */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            {formatTime(availability.start_time)} - {formatTime(availability.end_time)}
          </span>
          <Badge variant="outline" className="ml-auto">
            {calculateDuration()}
          </Badge>
        </div>

        {/* Hospital */}
        {hospital && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{hospital.name}</span>
          </div>
        )}

        {/* Doctor */}
        {doctor && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="flex flex-col">
              <span>{getDoctorFullName(doctor as any)}</span>
              <span className="text-xs text-gray-500">{doctor.specialization}</span>
            </div>
          </div>
        )}

        {/* Slot Information */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <Timer className="h-3 w-3" />
              <span>Slot Duration</span>
            </div>
            <div className="font-semibold text-primary-600">
              {availability.slot_duration}m
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-1">
              <Users className="h-3 w-3" />
              <span>Max Patients</span>
            </div>
            <div className="font-semibold text-primary-600">
              {availability.max_patients}
            </div>
          </div>
        </div>

        {/* Total Slots */}
        <div className="text-center pt-2 border-t">
          <div className="text-sm text-gray-600 mb-1">Total Slots Available</div>
          <div className="font-semibold text-lg text-primary-600">
            {calculateSlots()} slots
          </div>
          <div className="text-xs text-gray-500">
            Up to {calculateSlots() * availability.max_patients} patients
          </div>
        </div>
      </CardContent>
    </Card>
  )
}