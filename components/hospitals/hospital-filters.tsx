'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Star,
  Users,
  Clock
} from 'lucide-react'

export interface FilterState {
  search: string
  cities: string[]
  specialties: string[]
  services: string[]
  minRating: number
  hasAvailableDoctors: boolean
}

interface HospitalFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  availableCities: string[]
  availableSpecialties: string[]
  availableServices: string[]
  isLoading?: boolean
}

export function HospitalFilters({
  filters,
  onFiltersChange,
  availableCities,
  availableSpecialties,
  availableServices,
  isLoading = false
}: HospitalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      cities: [],
      specialties: [],
      services: [],
      minRating: 0,
      hasAvailableDoctors: false
    })
  }

  const hasActiveFilters = 
    filters.search ||
    filters.cities.length > 0 ||
    filters.specialties.length > 0 ||
    filters.services.length > 0 ||
    filters.minRating > 0 ||
    filters.hasAvailableDoctors

  const toggleArrayFilter = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search hospitals, services, or specialties..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 pr-4"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[
                  filters.cities.length,
                  filters.specialties.length,
                  filters.services.length,
                  filters.minRating > 0 ? 1 : 0,
                  filters.hasAvailableDoctors ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Cities Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Cities
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableCities.map((city) => (
                <div key={city} className="flex items-center space-x-2">
                  <Checkbox
                    id={`city-${city}`}
                    checked={filters.cities.includes(city)}
                    onCheckedChange={() => 
                      updateFilters({ 
                        cities: toggleArrayFilter(filters.cities, city) 
                      })
                    }
                  />
                  <Label 
                    htmlFor={`city-${city}`} 
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {city}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Specialties
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableSpecialties.map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={`specialty-${specialty}`}
                    checked={filters.specialties.includes(specialty)}
                    onCheckedChange={() => 
                      updateFilters({ 
                        specialties: toggleArrayFilter(filters.specialties, specialty) 
                      })
                    }
                  />
                  <Label 
                    htmlFor={`specialty-${specialty}`} 
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {specialty}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Services Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3">
              Services
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableServices.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={filters.services.includes(service)}
                    onCheckedChange={() => 
                      updateFilters({ 
                        services: toggleArrayFilter(filters.services, service) 
                      })
                    }
                  />
                  <Label 
                    htmlFor={`service-${service}`} 
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Minimum Rating
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.minRating >= rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ 
                    minRating: filters.minRating === rating ? 0 : rating 
                  })}
                  className="flex items-center gap-1"
                >
                  <Star className="h-3 w-3" />
                  {rating}+
                </Button>
              ))}
            </div>
          </div>

          {/* Doctor Availability Filter */}
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available-doctors"
                checked={filters.hasAvailableDoctors}
                onCheckedChange={(checked) => 
                  updateFilters({ hasAvailableDoctors: !!checked })
                }
              />
              <Label 
                htmlFor="available-doctors" 
                className="text-sm text-gray-700 cursor-pointer flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Has Available Doctors
              </Label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {filters.cities.map((city) => (
              <Badge key={city} variant="secondary" className="flex items-center gap-1">
                {city}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ 
                    cities: filters.cities.filter(c => c !== city) 
                  })}
                />
              </Badge>
            ))}
            {filters.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                {specialty}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ 
                    specialties: filters.specialties.filter(s => s !== specialty) 
                  })}
                />
              </Badge>
            ))}
            {filters.services.map((service) => (
              <Badge key={service} variant="secondary" className="flex items-center gap-1">
                {service}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ 
                    services: filters.services.filter(s => s !== service) 
                  })}
                />
              </Badge>
            ))}
            {filters.minRating > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.minRating}+ Stars
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ minRating: 0 })}
                />
              </Badge>
            )}
            {filters.hasAvailableDoctors && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Available Doctors
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ hasAvailableDoctors: false })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}