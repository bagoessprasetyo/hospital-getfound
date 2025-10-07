'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PatientAppointment } from '@/lib/supabase/appointments'
import AppointmentCard from './appointment-card'

interface AppointmentsListProps {
  appointments: PatientAppointment[]
  onAppointmentUpdate: () => void
}

type SortField = 'date' | 'doctor' | 'hospital' | 'status'
type SortOrder = 'asc' | 'desc'

export default function AppointmentsList({ 
  appointments, 
  onAppointmentUpdate 
}: AppointmentsListProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'date':
        aValue = new Date(`${a.appointment_date}T${a.appointment_time}`).getTime()
        bValue = new Date(`${b.appointment_date}T${b.appointment_time}`).getTime()
        break
      case 'doctor':
        aValue = a.doctor.user_profile.full_name || ''
        bValue = b.doctor.user_profile.full_name || ''
        break
      case 'hospital':
        aValue = a.hospital.name
        bValue = b.hospital.name
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      default:
        aValue = 0
        bValue = 0
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortOrder === 'asc' ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
      )}
    </button>
  )

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with sorting */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Appointments ({appointments.length})
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Sort by:</span>
            <SortButton field="date">Date</SortButton>
            <SortButton field="doctor">Doctor</SortButton>
            <SortButton field="hospital">Hospital</SortButton>
            <SortButton field="status">Status</SortButton>
          </div>
        </div>
      </div>

      {/* Appointments list */}
      <div className="divide-y divide-gray-200">
        {sortedAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onUpdate={onAppointmentUpdate}
          />
        ))}
      </div>
    </div>
  )
}