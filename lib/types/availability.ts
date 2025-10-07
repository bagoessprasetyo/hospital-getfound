export interface DoctorAvailability {
  id: string
  doctor_id: string
  hospital_id: string
  day_of_week: number // 0 = Sunday, 1 = Monday, etc.
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  slot_duration: number // in minutes
  max_patients: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateAvailabilityRequest {
  doctor_id: string
  hospital_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration: number
  max_patients: number
  is_active?: boolean
}

export interface UpdateAvailabilityRequest {
  day_of_week?: number
  start_time?: string
  end_time?: string
  slot_duration?: number
  max_patients?: number
  is_active?: boolean
}

export interface AvailabilitySlot {
  time: string
  is_available: boolean
  booked_count: number
  max_patients: number
}

export interface DayAvailability {
  day_of_week: number
  day_name: string
  slots: AvailabilitySlot[]
  is_active: boolean
}

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00'
]