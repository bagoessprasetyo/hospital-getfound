'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { HospitalFilters, FilterState } from './hospital-filters'
import { EnhancedHospitalCard } from './enhanced-hospital-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Hospital, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Grid,
  List
} from 'lucide-react'
import type { EnhancedHospital } from '@/lib/types/hospital'

interface EnhancedHospitalListProps {
  hospitals: EnhancedHospital[]
  availableCities: string[]
  availableSpecialties: string[]
  availableServices: string[]
  isLoading?: boolean
}

const ITEMS_PER_PAGE = 12

export function EnhancedHospitalList({
  hospitals,
  availableCities,
  availableSpecialties,
  availableServices,
  isLoading = false
}: EnhancedHospitalListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>(() => ({
    search: searchParams.get('search') || '',
    cities: searchParams.get('cities')?.split(',').filter(Boolean) || [],
    specialties: searchParams.get('specialties')?.split(',').filter(Boolean) || [],
    services: searchParams.get('services')?.split(',').filter(Boolean) || [],
    minRating: parseInt(searchParams.get('minRating') || '0'),
    hasAvailableDoctors: searchParams.get('hasAvailableDoctors') === 'true'
  }))

  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter hospitals based on current filters
  const filteredHospitals = useMemo(() => {
    let filtered = hospitals

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchLower) ||
        hospital.address.toLowerCase().includes(searchLower) ||
        hospital.description?.toLowerCase().includes(searchLower) ||
        hospital.specialties?.some(s => s.toLowerCase().includes(searchLower)) ||
        hospital.hospital_services?.some(hs => hs.name?.toLowerCase().includes(searchLower))
      )
    }

    if (filters.cities.length > 0) {
      filtered = filtered.filter(hospital =>
        filters.cities.includes(hospital.city || '')
      )
    }

    if (filters.specialties.length > 0) {
      filtered = filtered.filter(hospital =>
        filters.specialties.some(specialty =>
          hospital.specialties?.includes(specialty)
        )
      )
    }

    if (filters.services.length > 0) {
      filtered = filtered.filter(hospital =>
        filters.services.some(service =>
          hospital.hospital_services?.some(hs => hs.name === service)
        )
      )
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(hospital =>
        (hospital.average_rating || 0) >= filters.minRating
      )
    }

    if (filters.hasAvailableDoctors) {
      filtered = filtered.filter(hospital =>
        (hospital.available_doctors || 0) > 0
      )
    }

    return filtered
  }, [hospitals, filters])

  // Pagination
  const totalPages = Math.ceil(filteredHospitals.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedHospitals = filteredHospitals.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.search) params.set('search', filters.search)
    if (filters.cities.length > 0) params.set('cities', filters.cities.join(','))
    if (filters.specialties.length > 0) params.set('specialties', filters.specialties.join(','))
    if (filters.services.length > 0) params.set('services', filters.services.join(','))
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString())
    if (filters.hasAvailableDoctors) params.set('hasAvailableDoctors', 'true')

    const newUrl = params.toString() ? `?${params.toString()}` : '/hospitals'
    router.replace(newUrl, { scroll: false })
  }, [filters, router])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Loading hospitals...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <HospitalFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableCities={availableCities}
        availableSpecialties={availableSpecialties}
        availableServices={availableServices}
        isLoading={isLoading}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results
            </h2>
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredHospitals.length)} of {filteredHospitals.length} hospitals
            </p>
          </div>
          
          {/* Active Filters Count */}
          {(filters.search || filters.cities.length > 0 || filters.specialties.length > 0 || 
            filters.services.length > 0 || filters.minRating > 0 || filters.hasAvailableDoctors) && (
            <Badge variant="secondary">
              {[
                filters.search ? 1 : 0,
                filters.cities.length,
                filters.specialties.length,
                filters.services.length,
                filters.minRating > 0 ? 1 : 0,
                filters.hasAvailableDoctors ? 1 : 0
              ].reduce((a, b) => a + b, 0)} filters active
            </Badge>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hospital Grid/List */}
      {paginatedHospitals.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {paginatedHospitals.map((hospital) => (
            <EnhancedHospitalCard
              key={hospital.id}
              hospital={hospital}
              showBookingButton={true}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <Hospital className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hospitals found
          </h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.cities.length > 0 || filters.specialties.length > 0 || 
             filters.services.length > 0 || filters.minRating > 0 || filters.hasAvailableDoctors
              ? 'Try adjusting your search criteria or filters'
              : 'No hospitals are available at the moment'
            }
          </p>
          {(filters.search || filters.cities.length > 0 || filters.specialties.length > 0 || 
            filters.services.length > 0 || filters.minRating > 0 || filters.hasAvailableDoctors) && (
            <Button
              variant="outline"
              onClick={() => setFilters({
                search: '',
                cities: [],
                specialties: [],
                services: [],
                minRating: 0,
                hasAvailableDoctors: false
              })}
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}