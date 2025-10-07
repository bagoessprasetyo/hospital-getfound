'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  getFilteredPatientAppointments, 
  getPatientAppointmentStats,
  getPatientAppointmentDoctors,
  getPatientAppointmentHospitals,
  type PatientAppointment,
  type AppointmentStats,
  type AppointmentFilters
} from '@/lib/supabase/appointments'
import AppointmentsDashboard from './appointments-dashboard'
import AppointmentsList from './appointments-list'
import AppointmentsFilters from './appointments-filters'
import AppointmentsEmptyState from './appointments-empty-state'

interface AppointmentsClientProps {
  userId: string
}

export default function AppointmentsClient({ userId }: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([])
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; specialization: string }>>([])
  const [hospitals, setHospitals] = useState<Array<{ id: string; name: string; address: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: 'all'
  })

  // Load initial data
  useEffect(() => {
    loadAppointmentsData()
  }, [userId])

  // Load appointments when filters change
  useEffect(() => {
    if (!loading) {
      loadFilteredAppointments()
    }
  }, [filters])

  const loadAppointmentsData = async () => {
    try {
      console.log('🔄 Starting to load appointments data for userId:', userId)
      setLoading(true)
      setError(null)

      // Load all data in parallel - functions now handle userId internally
      console.log('📊 Fetching appointments data...')
      const [appointmentsData, statsData, doctorsData, hospitalsData] = await Promise.all([
        getFilteredPatientAppointments(userId, filters),
        getPatientAppointmentStats(userId),
        getPatientAppointmentDoctors(userId),
        getPatientAppointmentHospitals(userId)
      ])

      console.log('✅ Appointments data loaded:', {
        appointments: appointmentsData.length,
        stats: statsData,
        doctors: doctorsData.length,
        hospitals: hospitalsData.length
      })

      setAppointments(appointmentsData)
      setStats(statsData)
      setDoctors(doctorsData)
      setHospitals(hospitalsData)
    } catch (err) {
      console.error('❌ Error loading appointments data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
      toast.error('Failed to load appointments')
    } finally {
      console.log('🏁 Loading complete, setting loading to false')
      setLoading(false)
    }
  }

  const loadFilteredAppointments = async () => {
    try {
      const appointmentsData = await getFilteredPatientAppointments(userId, filters)
      setAppointments(appointmentsData)
    } catch (err) {
      console.error('Error loading filtered appointments:', err)
      toast.error('Failed to filter appointments')
    }
  }

  const handleFiltersChange = (newFilters: AppointmentFilters) => {
    setFilters(newFilters)
  }

  const handleAppointmentUpdate = () => {
    // Reload data when an appointment is updated
    loadAppointmentsData()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Dashboard skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex flex-wrap gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-32"></div>
              ))}
            </div>
          </div>
        </div>

        {/* List skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Appointments</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadAppointmentsData}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show empty state if no appointments exist at all
  if (stats?.total === 0) {
    return <AppointmentsEmptyState type="no-appointments" />
  }

  // Show no results state if filters return no results
  if (appointments.length === 0 && stats && stats.total > 0) {
    return (
      <div className="space-y-6">
        {stats && <AppointmentsDashboard stats={stats} />}
        <AppointmentsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          doctors={doctors}
          hospitals={hospitals}
        />
        <AppointmentsEmptyState type="no-results" onClearFilters={() => setFilters({ status: 'all' })} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard with statistics */}
      {stats && <AppointmentsDashboard stats={stats} />}
      
      {/* Filters */}
      <AppointmentsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        doctors={doctors}
        hospitals={hospitals}
      />
      
      {/* Appointments list */}
      <AppointmentsList
        appointments={appointments}
        onAppointmentUpdate={handleAppointmentUpdate}
      />
    </div>
  )
}