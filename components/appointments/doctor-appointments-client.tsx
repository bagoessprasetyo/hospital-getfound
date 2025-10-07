'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppointmentCard } from './appointment-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  reason_for_visit: string | null
  notes: string | null
  consultation_fee: number | null
  doctor_id: string
  patient_id: string
  hospital_id: string
  patients: {
    id: string
    user_profiles: {
      id: string
      full_name: string | null
      email: string
      phone: string | null
    }
  } | null
  hospitals: {
    id: string
    name: string
    address: string | null
    phone: string | null
  } | null
}

interface DoctorAppointmentsClientProps {
  initialAppointments: Appointment[]
  doctorId: string
}

const statusFilters = [
  { value: 'all', label: 'All', icon: Calendar },
  { value: 'pending', label: 'Pending', icon: Clock3 },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
  { value: 'no_show', label: 'No Show', icon: AlertCircle }
]

const timeFilters = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' }
]

export function DoctorAppointmentsClient({ 
  initialAppointments, 
  doctorId 
}: DoctorAppointmentsClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const refreshAppointments = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner (
            id,
            user_profiles!inner (
              id,
              full_name,
              email,
              phone
            )
          ),
          hospitals (
            id,
            name,
            address
          )
        `)
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (error) {
        console.error('Error fetching appointments:', error)
      } else {
        setAppointments(data || [])
      }
    } catch (error) {
      console.error('Error refreshing appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = (appointmentId: string, newStatus: string) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus as any }
          : appointment
      )
    )
  }

  const filteredAppointments = useMemo(() => {
    let filtered = appointments

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(appointment => 
        appointment.patients?.user_profiles?.full_name?.toLowerCase().includes(term) ||
        appointment.patients?.user_profiles?.email?.toLowerCase().includes(term) ||
        appointment.reason_for_visit?.toLowerCase().includes(term) ||
        appointment.hospitals?.name?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter)
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date)
        const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)

        switch (timeFilter) {
          case 'today':
            return appointmentDate.toDateString() === today.toDateString()
          case 'week':
            return appointmentDate >= weekStart && appointmentDate <= new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
          case 'month':
            return appointmentDate >= monthStart && appointmentDate < new Date(now.getFullYear(), now.getMonth() + 1, 1)
          case 'upcoming':
            return appointmentDateTime >= now
          case 'past':
            return appointmentDateTime < now
          default:
            return true
        }
      })
    }

    return filtered
  }, [appointments, searchTerm, statusFilter, timeFilter])

  const appointmentStats = useMemo(() => {
    const stats = {
      total: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    }

    appointments.forEach(appointment => {
      stats[appointment.status]++
    })

    return stats
  }, [appointments])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-[#1e40af]">{appointmentStats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">{appointmentStats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{appointmentStats.confirmed}</div>
          <div className="text-sm text-muted-foreground">Confirmed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{appointmentStats.completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{appointmentStats.cancelled}</div>
          <div className="text-sm text-muted-foreground">Cancelled</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-600">{appointmentStats.no_show}</div>
          <div className="text-sm text-muted-foreground">No Show</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, reasons, hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {filter.label}
                </Button>
              )
            })}
          </div>

          {/* Time Filter */}
          <div className="flex flex-wrap gap-2">
            {timeFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={timeFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e40af] mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No appointments found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your filters to see more appointments.'
                : 'You don\'t have any appointments yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAppointments.map((appointment) => {
              // Transform appointment to match PatientAppointment interface
              const patientAppointment = {
                ...appointment,
                doctor: {
                  id: appointment.doctor_id,
                  specialization: 'General Practice', // Default value since we don't have this in the current query
                  user_profile: {
                    full_name: 'Dr. Unknown' // Default value since we don't have this in the current query
                  }
                },
                hospital: appointment.hospitals ? {
                  id: appointment.hospitals.id,
                  name: appointment.hospitals.name,
                  address: appointment.hospitals.address,
                  phone: appointment.hospitals.phone || null
                } : {
                  id: '',
                  name: 'Unknown Hospital',
                  address: null,
                  phone: null
                }
              }
              
              return (
                <AppointmentCard
                  key={appointment.id}
                  appointment={patientAppointment as any}
                  onUpdate={() => {
                    // Refresh appointments after update
                    window.location.reload()
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={refreshAppointments}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Appointments'}
        </Button>
      </div>
    </div>
  )
}