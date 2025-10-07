'use client'

import { useState, useEffect } from 'react'
import { DoctorAvailability, DAYS_OF_WEEK } from '@/lib/types/availability'
import { AvailabilityFormDialog } from './availability-form-dialog'
import { AvailabilityCard } from './availability-card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Plus, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { getDoctorFullName } from '@/lib/supabase/doctors'

interface AvailabilityManagementProps {
  doctors: Array<{ 
    id: string
    first_name: string
    last_name: string
    user_profiles?: { full_name: string }
    specialization: string
  }>
  hospitals: Array<{ id: string; name: string }>
}

export function AvailabilityManagement({ doctors, hospitals }: AvailabilityManagementProps) {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [selectedHospital, setSelectedHospital] = useState<string>('')
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchAvailability = async () => {
    if (!selectedDoctor || selectedDoctor === 'all') {
      setAvailability([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ doctor_id: selectedDoctor })
      if (selectedHospital && selectedHospital !== 'all') params.append('hospital_id', selectedHospital)
      
      const response = await fetch(`/api/availability?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch availability')
      }
      
      const data = await response.json()
      setAvailability(data)
    } catch (error) {
      console.error('Error fetching availability:', error)
      toast.error('Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailability()
  }, [selectedDoctor, selectedHospital])

  const filteredAvailability = availability.filter((item) => {
    const matchesDay = !selectedDay || selectedDay === 'all' || item.day_of_week.toString() === selectedDay
    const matchesSearch = !searchTerm || 
      DAYS_OF_WEEK.find(d => d.value === item.day_of_week)?.label
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.start_time.includes(searchTerm) ||
      item.end_time.includes(searchTerm)
    
    return matchesDay && matchesSearch
  })

  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor && selectedDoctor !== 'all')

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Doctor</label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All doctors</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex flex-col">
                      <span>{getDoctorFullName(doctor as any)}</span>
                      <span className="text-sm text-muted-foreground">{doctor.specialization}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Hospital</label>
            <Select value={selectedHospital} onValueChange={setSelectedHospital}>
              <SelectTrigger>
                <SelectValue placeholder="All hospitals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hospitals</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Day of Week</label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger>
                <SelectValue placeholder="All days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All days</SelectItem>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by day or time..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Availability Schedule
            {selectedDoctorData && (
              <span className="text-base font-normal text-gray-600">
                - {getDoctorFullName(selectedDoctorData as any)}
              </span>
            )}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {selectedDoctor ? 'Manage availability for the selected doctor' : 'Select a doctor to view and manage their availability'}
          </p>
        </div>
        
        {selectedDoctor && selectedDoctor !== 'all' && (
          <AvailabilityFormDialog
            doctors={doctors}
            hospitals={hospitals}
            onSuccess={fetchAvailability}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            }
          />
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !selectedDoctor || selectedDoctor === 'all' ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Doctor</h3>
          <p className="text-gray-600 mb-4">
            Choose a doctor from the filter above to view and manage their availability schedule.
          </p>
        </div>
      ) : filteredAvailability.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Availability Found</h3>
          <p className="text-gray-600 mb-4">
            {availability.length === 0 
              ? 'This doctor has no availability scheduled yet.'
              : 'No availability matches your current filters.'
            }
          </p>
          {availability.length === 0 && (
            <AvailabilityFormDialog
              doctors={doctors}
              hospitals={hospitals}
              onSuccess={fetchAvailability}
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Availability
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAvailability.map((item) => (
            <AvailabilityCard
              key={item.id}
              availability={item}
              doctors={doctors}
              hospitals={hospitals}
              onUpdate={fetchAvailability}
              onDelete={fetchAvailability}
            />
          ))}
        </div>
      )}
    </div>
  )
}