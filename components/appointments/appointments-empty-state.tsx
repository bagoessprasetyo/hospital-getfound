'use client'

import { Calendar, Search, Plus } from 'lucide-react'
import Link from 'next/link'

interface AppointmentsEmptyStateProps {
  type: 'no-appointments' | 'no-results'
  onClearFilters?: () => void
}

export default function AppointmentsEmptyState({ 
  type, 
  onClearFilters 
}: AppointmentsEmptyStateProps) {
  if (type === 'no-appointments') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Calendar className="h-12 w-12 text-blue-500" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No appointments yet
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You haven&apos;t scheduled any appointments yet. Browse our hospitals and doctors to book your first appointment.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/hospitals"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Browse Hospitals
          </Link>
          
          <Link
            href="/doctors"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Search className="h-5 w-5 mr-2" />
            Find Doctors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Search className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No appointments match your filters
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Try adjusting your search criteria or filters to find the appointments you&apos;re looking for.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
        
        <Link
          href="/hospitals"
          className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Book New Appointment
        </Link>
      </div>
    </div>
  )
}