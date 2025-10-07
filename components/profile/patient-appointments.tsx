'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, User, Phone, FileText, Filter, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PatientAppointment } from '@/lib/supabase/patients'

interface PatientAppointmentsProps {
  appointments: PatientAppointment[]
}

type AppointmentStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

export function PatientAppointments({ appointments }: PatientAppointmentsProps) {
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter appointments based on status
  const filteredAppointments = appointments.filter(appointment => {
    if (statusFilter === 'all') return true
    return appointment.status === statusFilter
  })

  // Sort appointments by date (newest first)
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`)
    const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`)
    return dateB.getTime() - dateA.getTime()
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      completed: { color: 'bg-primary-100 text-primary-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isUpcoming = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date} ${time}`)
    return appointmentDateTime > new Date()
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No appointments yet
        </h3>
        <p className="text-gray-600 mb-4">
          You haven't booked any appointments yet. Start by finding a doctor or hospital.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <a href="/doctors">Find Doctors</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/hospital">Find Hospitals</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-gray-300"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {showFilters && (
            <Select value={statusFilter} onValueChange={(value: AppointmentStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>

      {/* Appointments List */}
      {sortedAppointments.length > 0 ? (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Appointment Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <User className="h-5 w-5 text-primary-600" />
                          Dr. {appointment.doctor.user_profile.full_name || 'Unknown Doctor'}
                        </h4>
                        <p className="text-primary-600 font-medium">
                          {appointment.doctor.specialization}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {isUpcoming(appointment.appointment_date, appointment.appointment_time) && 
                         appointment.status === 'confirmed' && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{formatDate(appointment.appointment_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{formatTime(appointment.appointment_time)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {appointment.hospital.name}, {appointment.hospital.address}
                        </span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 flex-shrink-0 text-gray-400 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-600 mt-1">{appointment.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
                    {appointment.status === 'confirmed' && 
                     isUpcoming(appointment.appointment_date, appointment.appointment_time) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {appointment.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary-200 text-primary-600 hover:bg-primary-50"
                      >
                        View Report
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-600">
            {statusFilter === 'all' 
              ? 'You have no appointments yet.'
              : `No ${statusFilter} appointments found.`
            }
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <a href="/appointments/book">Book New Appointment</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/doctors">Find More Doctors</a>
          </Button>
        </div>
      </div>
    </div>
  )
}