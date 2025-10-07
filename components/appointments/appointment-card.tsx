'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import type { PatientAppointment } from '@/lib/supabase/appointments'
import { updateAppointmentStatus, deleteAppointment } from '@/lib/supabase/appointments'

interface AppointmentCardProps {
  appointment: PatientAppointment
  onUpdate: () => void
}

export function AppointmentCard({ appointment, onUpdate }: AppointmentCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [loading, setLoading] = useState(false)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        border: 'border-yellow-200',
        label: 'Pending' 
      },
      confirmed: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        border: 'border-blue-200',
        label: 'Confirmed' 
      },
      completed: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        border: 'border-green-200',
        label: 'Completed' 
      },
      cancelled: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        border: 'border-red-200',
        label: 'Cancelled' 
      },
      no_show: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        border: 'border-gray-200',
        label: 'No Show' 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    )
  }

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = new Date(`${date}T${time}`)
      return {
        date: format(dateTime, 'MMM dd, yyyy'),
        time: format(dateTime, 'h:mm a'),
        dayOfWeek: format(dateTime, 'EEEE')
      }
    } catch (error) {
      return {
        date: date,
        time: time,
        dayOfWeek: ''
      }
    }
  }

  const isUpcoming = () => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`)
    const now = new Date()
    return appointmentDateTime > now && (appointment.status === 'confirmed' || appointment.status === 'pending')
  }

  const canCancel = () => {
    return isUpcoming() && appointment.status !== 'cancelled'
  }

  const handleStatusUpdate = async (newStatus: 'cancelled') => {
    if (loading) return

    try {
      setLoading(true)
      await updateAppointmentStatus(appointment.id, newStatus)
      toast.success(`Appointment ${newStatus}`)
      onUpdate()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment')
    } finally {
      setLoading(false)
      setShowActions(false)
    }
  }

  const handleDelete = async () => {
    if (loading) return
    
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      await deleteAppointment(appointment.id)
      toast.success('Appointment deleted')
      onUpdate()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Failed to delete appointment')
    } finally {
      setLoading(false)
      setShowActions(false)
    }
  }

  const { date, time, dayOfWeek } = formatDateTime(appointment.appointment_date, appointment.appointment_time)

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors relative">
      {/* Status and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusBadge(appointment.status)}
          {isUpcoming() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
              Upcoming
            </span>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
              {canCancel() && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel Appointment</span>
                </button>
              )}
              {appointment.status === 'completed' && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Appointment</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Date & Time */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{date}</p>
              <p className="text-sm text-gray-600">{dayOfWeek}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{time}</p>
              <p className="text-sm text-gray-600">Appointment time</p>
            </div>
          </div>
        </div>

        {/* Right Column - Doctor & Hospital */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {appointment.doctor.user_profile.full_name || 'Unknown Doctor'}
              </p>
              <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{appointment.hospital.name}</p>
              {appointment.hospital.address && (
                <p className="text-sm text-gray-600">{appointment.hospital.address}</p>
              )}
              {appointment.hospital.phone && (
                <div className="flex items-center space-x-1 mt-1">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <p className="text-sm text-gray-600">{appointment.hospital.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Notes</p>
              <p className="text-sm text-gray-600">{appointment.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}

export default AppointmentCard