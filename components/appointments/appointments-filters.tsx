'use client'

import { useState } from 'react'
import { Search, Filter, Calendar, X } from 'lucide-react'
import type { AppointmentFilters } from '@/lib/supabase/appointments'

interface AppointmentsFiltersProps {
  filters: AppointmentFilters
  onFiltersChange: (filters: AppointmentFilters) => void
  doctors: Array<{ id: string; name: string; specialization: string }>
  hospitals: Array<{ id: string; name: string; address: string | null }>
}

export default function AppointmentsFilters({
  filters,
  onFiltersChange,
  doctors,
  hospitals
}: AppointmentsFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'text-gray-600' },
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'confirmed', label: 'Confirmed', color: 'text-blue-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
    { value: 'no_show', label: 'No Show', color: 'text-gray-600' }
  ]

  const handleStatusChange = (status: AppointmentFilters['status']) => {
    onFiltersChange({ ...filters, status })
  }

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined })
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const dateRange = filters.dateRange || { start: '', end: '' }
    const newDateRange = { ...dateRange, [field]: value }
    
    // Remove date range if both fields are empty
    if (!newDateRange.start && !newDateRange.end) {
      const { dateRange: _, ...newFilters } = filters
      onFiltersChange(newFilters)
    } else {
      onFiltersChange({ ...filters, dateRange: newDateRange })
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    onFiltersChange({ 
      ...filters, 
      doctorId: doctorId || undefined 
    })
  }

  const handleHospitalChange = (hospitalId: string) => {
    onFiltersChange({ 
      ...filters, 
      hospitalId: hospitalId || undefined 
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({ status: 'all' })
    setShowAdvancedFilters(false)
  }

  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.search ||
    filters.dateRange ||
    filters.doctorId ||
    filters.hospitalId

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filter Appointments</h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Clear all</span>
              </button>
            )}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>{showAdvancedFilters ? 'Hide' : 'Show'} advanced</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by doctor, specialization, hospital, or notes..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value as AppointmentFilters['status'])}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.status === option.value
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Doctor Filter */}
            {doctors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                <select
                  value={filters.doctorId || ''}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Doctors</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Hospital Filter */}
            {hospitals.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
                <select
                  value={filters.hospitalId || ''}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Hospitals</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                      {hospital.address && ` - ${hospital.address}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}