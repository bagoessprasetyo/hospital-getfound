'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, MapPin, Phone, Star, Users, Clock, Building2, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EnhancedHospital } from '@/lib/types/hospital'

interface PublicHospitalListProps {
  hospitals: EnhancedHospital[]
  availableCities: string[]
  availableSpecialties: string[]
  availableServices: string[]
  isLoading?: boolean
}

interface Filters {
  search: string
  cities: string[]
  specialties: string[]
  services: string[]
  minRating: number
  hasAvailableDoctors: boolean
}

export function PublicHospitalList({ 
  hospitals, 
  availableCities, 
  availableSpecialties, 
  availableServices,
  isLoading = false 
}: PublicHospitalListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') || '',
    cities: searchParams.get('cities')?.split(',').filter(Boolean) || [],
    specialties: searchParams.get('specialties')?.split(',').filter(Boolean) || [],
    services: searchParams.get('services')?.split(',').filter(Boolean) || [],
    minRating: parseInt(searchParams.get('minRating') || '0'),
    hasAvailableDoctors: searchParams.get('hasAvailableDoctors') === 'true'
  })

  // Filter hospitals based on current filters
  const filteredHospitals = useMemo(() => {
    let filtered = hospitals

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchLower) ||
        hospital.description?.toLowerCase().includes(searchLower) ||
        hospital.city?.toLowerCase().includes(searchLower) ||
        hospital.address?.toLowerCase().includes(searchLower)
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
        (hospital.rating || 0) >= filters.minRating
      )
    }

    if (filters.hasAvailableDoctors) {
      filtered = filtered.filter(hospital =>
        hospital.available_doctors_count && hospital.available_doctors_count > 0
      )
    }

    return filtered
  }, [hospitals, filters])

  // Pagination
  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage)
  const paginatedHospitals = filteredHospitals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.search) params.set('search', filters.search)
    if (filters.cities.length > 0) params.set('cities', filters.cities.join(','))
    if (filters.specialties.length > 0) params.set('specialties', filters.specialties.join(','))
    if (filters.services.length > 0) params.set('services', filters.services.join(','))
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString())
    if (filters.hasAvailableDoctors) params.set('hasAvailableDoctors', 'true')

    const newUrl = params.toString() ? `?${params.toString()}` : '/hospital'
    router.replace(newUrl, { scroll: false })
  }, [filters, router])

  const clearFilters = () => {
    setFilters({
      search: '',
      cities: [],
      specialties: [],
      services: [],
      minRating: 0,
      hasAvailableDoctors: false
    })
    setCurrentPage(1)
  }

  const toggleArrayFilter = (key: keyof Pick<Filters, 'cities' | 'specialties' | 'services'>, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search hospitals by name, location, or services..."
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }))
                setCurrentPage(1)
              }}
              className="pl-10 h-12 text-base border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6 border-gray-300 hover:border-black hover:text-black"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cities Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Cities</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableCities.map(city => (
                    <label key={city} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.cities.includes(city)}
                        onChange={() => toggleArrayFilter('cities', city)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="ml-2 text-sm text-gray-700">{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specialties Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Specialties</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableSpecialties.map(specialty => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.specialties.includes(specialty)}
                        onChange={() => toggleArrayFilter('specialties', specialty)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Services Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Services</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableServices.map(service => (
                    <label key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.services.includes(service)}
                        onChange={() => toggleArrayFilter('services', service)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="ml-2 text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating and Availability */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, minRating: parseInt(e.target.value) }))
                      setCurrentPage(1)
                    }}
                    className="w-full rounded-md border-gray-300 focus:border-black focus:ring-black"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3}>3+ Stars</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasAvailableDoctors}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, hasAvailableDoctors: e.target.checked }))
                        setCurrentPage(1)
                      }}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-2 text-sm text-gray-700">Has Available Doctors</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-gray-300 text-gray-600 hover:text-black hover:border-black"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(filters.search || filters.cities.length > 0 || filters.specialties.length > 0 || 
        filters.services.length > 0 || filters.minRating > 0 || filters.hasAvailableDoctors) && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              Search: {filters.search}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              />
            </Badge>
          )}
          {filters.cities.map(city => (
            <Badge key={city} variant="secondary" className="bg-gray-100 text-gray-800">
              {city}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleArrayFilter('cities', city)}
              />
            </Badge>
          ))}
          {filters.specialties.map(specialty => (
            <Badge key={specialty} variant="secondary" className="bg-gray-100 text-gray-800">
              {specialty}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleArrayFilter('specialties', specialty)}
              />
            </Badge>
          ))}
          {filters.services.map(service => (
            <Badge key={service} variant="secondary" className="bg-gray-100 text-gray-800">
              {service}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleArrayFilter('services', service)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {paginatedHospitals.length} of {filteredHospitals.length} hospitals
        </p>
      </div>

      {/* Hospital Cards Grid - Matching Homepage Style */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 bg-gray-100">
              {hospital.image_url && (
                <img
                  src={hospital.image_url}
                  alt={hospital.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{hospital.rating || 4.8}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-black mb-2">{hospital.name}</h3>
              
              <div className="flex items-start gap-2 text-gray-600 mb-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">{hospital.address}</span>
              </div>
              
              {hospital.phone && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{hospital.phone}</span>
                </div>
              )}
              
              {hospital.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {hospital.description}
                </p>
              )}

              {/* Specialties */}
              {hospital.specialties && hospital.specialties.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {hospital.specialties.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {specialty}
                      </Badge>
                    ))}
                    {hospital.specialties.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        +{hospital.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Hospital Services */}
              {hospital.hospital_services && hospital.hospital_services.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
                  <div className="flex flex-wrap gap-1">
                    {hospital.hospital_services.slice(0, 4).map((hs) => (
                      <Badge key={hs.id} variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                        {hs.name}
                      </Badge>
                    ))}
                    {hospital.hospital_services.length > 4 && (
                      <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                        +{hospital.hospital_services.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{hospital.available_doctors_count || 0} doctors</span>
                </div>
                
                <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">No hospitals found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or clearing some filters.
          </p>
          <Button onClick={clearFilters} variant="outline" className="border-black text-black hover:bg-gray-100">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="border-gray-300 text-gray-600 hover:text-black hover:border-black disabled:opacity-50"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum 
                    ? "bg-black text-white hover:bg-gray-800" 
                    : "border-gray-300 text-gray-600 hover:text-black hover:border-black"
                  }
                  size="sm"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="border-gray-300 text-gray-600 hover:text-black hover:border-black disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}