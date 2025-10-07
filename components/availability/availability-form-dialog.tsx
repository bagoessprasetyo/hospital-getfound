'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Plus, Clock, Calendar, Loader2, Save } from 'lucide-react'
import { DoctorAvailability, DAYS_OF_WEEK, TIME_SLOTS } from '@/lib/types/availability'
import { getDoctorFullName } from '@/lib/supabase/doctors'

const availabilitySchema = z.object({
  doctor_id: z.string().min(1, 'Doctor is required'),
  hospital_id: z.string().min(1, 'Hospital is required'),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  slot_duration: z.number().min(15).max(120),
  max_patients: z.number().min(1).max(50),
  is_active: z.boolean(),
}).refine((data) => data.start_time < data.end_time, {
  message: 'End time must be after start time',
  path: ['end_time'],
})

interface AvailabilityFormDialogProps {
  availability?: DoctorAvailability
  doctors: Array<{ 
    id: string
    first_name?: string
    last_name?: string
    user_profiles?: { full_name: string }
    specialization: string 
  }>
  hospitals: Array<{ id: string; name: string }>
  onSuccess: () => void
  trigger?: React.ReactNode
  editData?: DoctorAvailability
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AvailabilityFormDialog({
  availability,
  doctors,
  hospitals,
  onSuccess,
  trigger,
  editData,
  open,
  onOpenChange
}: AvailabilityFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Use editData if provided, otherwise use availability prop
  const editingData = editData || availability
  
  // Use controlled open state if provided
  const dialogOpen = open !== undefined ? open : isOpen
  const setDialogOpen = onOpenChange || setIsOpen

  // Check if we should show doctor selection (multiple doctors = admin view)
  const showDoctorSelection = doctors.length > 1
  const defaultDoctorId = doctors.length === 1 ? doctors[0].id : (availability?.doctor_id || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      doctor_id: defaultDoctorId,
      hospital_id: availability?.hospital_id || '',
      day_of_week: availability?.day_of_week || 1,
      start_time: availability?.start_time || '09:00',
      end_time: availability?.end_time || '17:00',
      slot_duration: availability?.slot_duration || 30,
      max_patients: availability?.max_patients || 5,
      is_active: availability?.is_active ?? true,
    }
  })

  const watchedValues = watch()

  // Helper function to normalize time format from HH:MM:SS to HH:MM
  const normalizeTimeForForm = (timeStr: string) => {
    if (!timeStr) return ''
    // If it's already in HH:MM format, return as is
    if (timeStr.length === 5 && timeStr.includes(':')) return timeStr
    // If it's in HH:MM:SS format, remove seconds
    if (timeStr.length === 8 && timeStr.split(':').length === 3) {
      return timeStr.substring(0, 5)
    }
    return timeStr
  }

  useEffect(() => {
    if (editingData) {
      console.log('Resetting form with editingData:', editingData)
      reset({
        doctor_id: editingData.doctor_id,
        hospital_id: editingData.hospital_id,
        day_of_week: editingData.day_of_week,
        start_time: normalizeTimeForForm(editingData.start_time),
        end_time: normalizeTimeForForm(editingData.end_time),
        slot_duration: editingData.slot_duration,
        max_patients: editingData.max_patients,
        is_active: editingData.is_active,
      })
    } else if (!showDoctorSelection) {
      // Auto-set doctor when there's only one doctor
      setValue('doctor_id', defaultDoctorId)
    }
  }, [editingData, reset, showDoctorSelection, defaultDoctorId, setValue])

  const onSubmit = async (data: z.infer<typeof availabilitySchema>) => {
    setLoading(true)
    
    try {
      const url = editingData 
        ? `/api/availability/${editingData.id}`
        : '/api/availability'
      
      const method = editingData ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save availability')
      }

      const doctor = doctors.find(d => d.id === data.doctor_id)
      const hospital = hospitals.find(h => h.id === data.hospital_id)
      const dayName = DAYS_OF_WEEK.find(d => d.value === data.day_of_week)?.label || 'Unknown'

      toast.success(editingData ? 'Availability updated successfully!' : 'Availability created successfully!', {
        description: editingData 
          ? `${getDoctorFullName(doctor as any)}'s ${dayName} schedule has been updated.`
          : `${getDoctorFullName(doctor as any)}'s ${dayName} availability at ${hospital?.name} has been added.`
      })
      
      setDialogOpen(false)
      onSuccess()
      
      if (!availability) {
        reset()
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      toast.error(availability ? 'Failed to update availability' : 'Failed to create availability', {
        description: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      {!trigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Availability
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            {editingData ? 'Edit Availability' : 'Add Availability'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {showDoctorSelection && (
            <div className="space-y-2">
              <Label htmlFor="doctor_id">Doctor</Label>
              <Select
                value={watchedValues.doctor_id}
                onValueChange={(value) => setValue('doctor_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex flex-col">
                        <span>{doctor.user_profiles?.full_name}</span>
                        <span className="text-sm text-muted-foreground">{doctor.specialization}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctor_id && (
                <p className="text-sm text-red-600">{errors.doctor_id.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="hospital_id">Hospital</Label>
            <Select
              value={watchedValues.hospital_id}
              onValueChange={(value) => setValue('hospital_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hospital_id && (
              <p className="text-sm text-red-600">{errors.hospital_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="day_of_week">Day of Week</Label>
            <Select
              value={watchedValues.day_of_week.toString()}
              onValueChange={(value) => setValue('day_of_week', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.day_of_week && (
              <p className="text-sm text-red-600">{errors.day_of_week.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Select
                value={watchedValues.start_time}
                onValueChange={(value) => setValue('start_time', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.start_time && (
                <p className="text-sm text-red-600">{errors.start_time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Select
                value={watchedValues.end_time}
                onValueChange={(value) => setValue('end_time', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.end_time && (
                <p className="text-sm text-red-600">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slot_duration">Slot Duration (minutes)</Label>
              <Input
                id="slot_duration"
                type="number"
                min="15"
                max="120"
                step="15"
                {...register('slot_duration', { valueAsNumber: true })}
              />
              {errors.slot_duration && (
                <p className="text-sm text-red-600">{errors.slot_duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_patients">Max Patients per Slot</Label>
              <Input
                id="max_patients"
                type="number"
                min="1"
                max="50"
                {...register('max_patients', { valueAsNumber: true })}
              />
              {errors.max_patients && (
                <p className="text-sm text-red-600">{errors.max_patients.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={watchedValues.is_active}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingData ? 'Update Availability' : 'Create Availability'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}