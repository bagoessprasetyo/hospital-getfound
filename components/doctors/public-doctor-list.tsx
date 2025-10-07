'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter, MapPin, Phone, Star, Users, Clock, User, ChevronDown, X, DollarSign, Award, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EnhancedDoctor } from '@/lib/supabase/doctors'

interface PublicDoctorListProps {
  doctors: EnhancedDoctor[]
  availableSpecializations: string[]
  availableCities: string[]
  availableHospitals: Array<{ id: string; name: string }>
  isLoading?: boolean
}

interface Filters {
  search: string
  specializations: string[]
  hospitals: string[]
  minExperience: number
  maxFee: number
  hasAvailability: boolean
}

interface FilterOptions {
  specializations: string[]
  hospitals: Array<{ id: string; name: string }>
}

export function PublicDoctorList({ 
  doctors, 
  filterOptions
}: {
  doctors: EnhancedDoctor[]
  filterOptions: FilterOptions
}) {
  // Safely destructure filterOptions with default values
  const { specializations = [], hospitals = [] } = filterOptions || {}
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    specializations: searchParams.get('specializations')?.split(',').filter(Boolean) || [],
    hospitals: searchParams.get('hospitals')?.split(',').filter(Boolean) || [],
    minExperience: parseInt(searchParams.get('minExperience') || '0'),
    maxFee: parseInt(searchParams.get('maxFee') || '0'),
    hasAvailability: searchParams.get('hasAvailability') === 'true'
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'name' | 'experience' | 'fee' | 'rating'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 12

  // Filter doctors based on current filters
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          doctor.specialization?.toLowerCase().includes(searchLower) ||
          doctor.bio?.toLowerCase().includes(searchLower) ||
          doctor.hospitals.some(hospital => 
            hospital.name.toLowerCase().includes(searchLower)
          )
        if (!matchesSearch) return false
      }

      // Specialization filter
      if (filters.specializations.length > 0) {
        if (!filters.specializations.includes(doctor.specialization)) return false
      }

      // Hospital filter
      if (filters.hospitals.length > 0) {
        const hasMatchingHospital = doctor.hospitals.some(hospital => 
          filters.hospitals.includes(hospital.id)
        )
        if (!hasMatchingHospital) return false
      }

      // Experience filter
      if (filters.minExperience > 0) {
        if (doctor.years_of_experience < filters.minExperience) return false
      }

      // Fee filter
      if (filters.maxFee > 0) {
        if (doctor.consultation_fee > filters.maxFee) return false
      }

      // Availability filter
      if (filters.hasAvailability) {
        if (!doctor.availability_count || doctor.availability_count === 0) return false
      }

      return true
    })
  }, [doctors, filters])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.specializations.length > 0) params.set('specializations', filters.specializations.join(','))
    if (filters.hospitals.length > 0) params.set('hospitals', filters.hospitals.join(','))
    if (filters.minExperience > 0) params.set('minExperience', filters.minExperience.toString())
    if (filters.maxFee > 0) params.set('maxFee', filters.maxFee.toString())
    if (filters.hasAvailability) params.set('hasAvailability', 'true')
    
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.replace(newUrl, { scroll: false })
  }, [filters, router])

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      specializations: [],
      hospitals: [],
      minExperience: 0,
      maxFee: 0,
      hasAvailability: false
    })
    setCurrentPage(1)
  }

  // Toggle array filters (specializations, hospitals)
  const toggleArrayFilter = (key: keyof Pick<Filters, 'specializations' | 'hospitals'>, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
    setCurrentPage(1)
  }

  // Sort and paginate doctors
  const sortedDoctors = useMemo(() => {
    const sorted = [...filteredDoctors].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' 
            ? a.specialization.localeCompare(b.specialization)
            : b.specialization.localeCompare(a.specialization)
        case 'experience':
          return sortOrder === 'asc' 
            ? a.years_of_experience - b.years_of_experience
            : b.years_of_experience - a.years_of_experience
        case 'fee':
          return sortOrder === 'asc' 
            ? a.consultation_fee - b.consultation_fee
            : b.consultation_fee - a.consultation_fee
        case 'rating':
          return sortOrder === 'asc' 
            ? (a.rating || 0) - (b.rating || 0)
            : (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })
    return sorted
  }, [filteredDoctors, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedDoctors.length / itemsPerPage)
  const paginatedDoctors = sortedDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search doctors by name, specialization, or hospital..."
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
              {/* Specializations Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Specializations</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {specializations.map(specialization => (
                    <label key={specialization} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.specializations.includes(specialization)}
                        onChange={() => toggleArrayFilter('specializations', specialization)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="ml-2 text-sm text-gray-700">{specialization}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hospitals Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Hospitals</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {hospitals.map(hospital => (
                    <label key={hospital.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.hospitals.includes(hospital.id)}
                        onChange={() => toggleArrayFilter('hospitals', hospital.id)}
                        className="rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="ml-2 text-sm text-gray-700">{hospital.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Minimum Experience</label>
                <select
                  value={filters.minExperience}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, minExperience: parseInt(e.target.value) }))
                    setCurrentPage(1)
                  }}
                  className="w-full rounded-md border-gray-300 focus:border-black focus:ring-black"
                >
                  <option value={0}>Any Experience</option>
                  <option value={1}>1+ Years</option>
                  <option value={3}>3+ Years</option>
                  <option value={5}>5+ Years</option>
                  <option value={10}>10+ Years</option>
                </select>
              </div>

              {/* Fee and Availability */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Maximum Fee</label>
                  <select
                    value={filters.maxFee}
                    onChange={(e) => {
                      setFilters(prev => ({ ...prev, maxFee: parseInt(e.target.value) }))
                      setCurrentPage(1)
                    }}
                    className="w-full rounded-md border-gray-300 focus:border-black focus:ring-black"
                  >
                    <option value={0}>Any Fee</option>
                    <option value={50}>Under $50</option>
                    <option value={100}>Under $100</option>
                    <option value={200}>Under $200</option>
                    <option value={500}>Under $500</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasAvailability}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, hasAvailability: e.target.checked }))
                        setCurrentPage(1)
                      }}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available for Appointments</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={resetFilters}
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
      {(filters.search || filters.specializations.length > 0 || filters.hospitals.length > 0 || 
        filters.minExperience > 0 || filters.maxFee > 0 || filters.hasAvailability) && (
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
          {filters.specializations.map(specialization => (
            <Badge key={specialization} variant="secondary" className="bg-gray-100 text-gray-800">
              {specialization}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleArrayFilter('specializations', specialization)}
              />
            </Badge>
          ))}
          {filters.hospitals.map(hospitalId => {
            const hospital = hospitals.find(h => h.id === hospitalId)
            return (
              <Badge key={hospitalId} variant="secondary" className="bg-gray-100 text-gray-800">
                {hospital?.name || hospitalId}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => toggleArrayFilter('hospitals', hospitalId)}
                />
              </Badge>
            )
          })}
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {paginatedDoctors.length} of {filteredDoctors.length} doctors
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as typeof sortBy)
              setSortOrder(order as typeof sortOrder)
            }}
            className="rounded-md border-gray-300 text-sm focus:border-black focus:ring-black"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="experience-desc">Experience (High to Low)</option>
            <option value="experience-asc">Experience (Low to High)</option>
            <option value="fee-asc">Fee (Low to High)</option>
            <option value="fee-desc">Fee (High to Low)</option>
            <option value="rating-desc">Rating (High to Low)</option>
            <option value="rating-asc">Rating (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid - Card-based Layout */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedDoctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Doctor Photo */}
            <div className="relative h-48 bg-gray-100">
              {doctor.image_url ? (
                <img
                  src={doctor.image_url}
                  alt={`Dr. ${doctor.full_name || 'Unknown Doctor'}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Grey overlay when not available */}
              {(!doctor.availability_count || doctor.availability_count === 0) && (
                <div className="absolute inset-0 bg-gray-500/60 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-gray-800 font-medium text-sm">Not Available</span>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{doctor.rating?.toFixed(1) || '4.8'}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-black mb-1">
                {doctor.full_name || 'Unknown Doctor'}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{doctor.specialization}</p>
              
              {/* Experience and Fee */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Award className="w-4 h-4" />
                  <span>{doctor.years_of_experience} years exp.</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${doctor.consultation_fee}</span>
                </div>
              </div>
              
              {/* Bio */}
              {doctor.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {doctor.bio}
                </p>
              )}

              {/* Hospitals */}
              {doctor.hospitals && doctor.hospitals.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {doctor.hospitals.slice(0, 2).map((hospital) => (
                      <Badge key={hospital.id} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {hospital.name}
                      </Badge>
                    ))}
                    {doctor.hospitals.length > 2 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        +{doctor.hospitals.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  {doctor.availability_count && doctor.availability_count > 0 ? (
                    <span className="text-gray-600">{doctor.availability_count} slots</span>
                  ) : (
                    <span className="text-red-500 font-medium">Not Available</span>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  className={
                    doctor.availability_count && doctor.availability_count > 0
                      ? "bg-black hover:bg-gray-800 text-white"
                      : "bg-gray-400 text-white cursor-not-allowed"
                  }
                  disabled={!doctor.availability_count || doctor.availability_count === 0}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">No doctors found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or clearing some filters.
          </p>
          <Button onClick={resetFilters} variant="outline" className="border-black text-black hover:bg-gray-100">
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