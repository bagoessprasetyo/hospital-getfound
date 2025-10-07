'use client'

import { useState, useEffect } from 'react'
import { DoctorAvailability, DAYS_OF_WEEK } from '@/lib/types/availability'
import { AvailabilityFormDialog } from './availability-form-dialog'
import { AvailabilityCard } from './availability-card'
import { AvailabilityCalendarView } from './availability-calendar-view'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Plus, Search, Filter, Grid, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { getDoctorFullName } from '@/lib/supabase/doctors'

interface DoctorAvailabilityManagementProps {
  doctor: { 
    id: string,
    first_name?: string,
    last_name?: string,
    user_profiles?: { full_name: string }
    specialization: string
  }
  hospitals: Array<{ id: string; name: string }>
}

export function DoctorAvailabilityManagement({ doctor, hospitals }: DoctorAvailabilityManagementProps) {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState<string>('')
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'calendar'>('card')

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ doctor_id: doctor.id })
      if (selectedHospital && selectedHospital !== 'all') params.append('hospital_id', selectedHospital)
      
      const response = await fetch(`/api/availability?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        throw new Error(`Failed to fetch availability: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Fetched availability data:', data)
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
  }, [doctor.id, selectedHospital])

  const filteredAvailability = availability.filter((item) => {
    const matchesDay = !selectedDay || selectedDay === 'all' || item.day_of_week.toString() === selectedDay
    const matchesSearch = !searchTerm || 
      DAYS_OF_WEEK.find(d => d.value === item.day_of_week)?.label
        .toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.start_time.includes(searchTerm) ||
      item.end_time.includes(searchTerm)
    
    return matchesDay && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Header with View Toggle and Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            My Availability Schedule
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage your availability across different hospitals
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Button>
          </div>
          
          <AvailabilityFormDialog
            doctors={[doctor]}
            hospitals={hospitals}
            onSuccess={fetchAvailability}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Availability
              </Button>
            }
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAvailability.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Availability Found</h3>
          <p className="text-gray-600 mb-4">
            {availability.length === 0 
              ? 'You have no availability scheduled yet.'
              : 'No availability matches your current filters.'
            }
          </p>
          {availability.length === 0 && (
            <AvailabilityFormDialog
              doctors={[doctor]}
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
      ) : viewMode === 'calendar' ? (
        <AvailabilityCalendarView
          availability={filteredAvailability}
          doctor={doctor}
          hospitals={hospitals}
          onUpdate={fetchAvailability}
          onDelete={fetchAvailability}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAvailability.map((item) => (
            <AvailabilityCard
              key={item.id}
              availability={item}
              doctors={[{
                ...doctor,
                first_name: doctor.first_name ?? '',
                last_name: doctor.last_name ?? ''
              }]}
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