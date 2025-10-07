'use client'

import { useState } from 'react'
import { MedicalCard } from '@/components/ui/medical-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Hospital, 
  MapPin, 
  Phone, 
  Globe, 
  Edit, 
  Trash2, 
  Search,
  Users,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase'
import { DeleteHospitalDialog } from './delete-hospital-dialog'

type Hospital = Database['public']['Tables']['hospitals']['Row']

interface HospitalListProps {
  hospitals: Hospital[]
  isAdmin?: boolean
}

export function HospitalList({ hospitals, isAdmin = false }: HospitalListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredHospitals, setFilteredHospitals] = useState(hospitals)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = hospitals.filter(hospital =>
      hospital.name.toLowerCase().includes(term.toLowerCase()) ||
      hospital.address.toLowerCase().includes(term.toLowerCase()) ||
      hospital.description?.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredHospitals(filtered)
  }

  const handleDeleteHospital = (hospital: Hospital) => {
    setHospitalToDelete(hospital)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirmed = (hospitalId: string) => {
    // Remove the hospital from the filtered list
    setFilteredHospitals(prev => prev.filter(h => h.id !== hospitalId))
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search hospitals by name, location, or description..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredHospitals.length} of {hospitals.length} hospitals
      </div>

      {/* Hospital Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <MedicalCard
            key={hospital.id}
            title={hospital.name}
            description={hospital.description || 'Healthcare facility'}
            icon={<Hospital className="h-5 w-5 text-primary-600" />}
          >
            <div className="space-y-4">
              {/* Hospital Image */}
              {hospital.image_url && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={hospital.image_url}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Hospital Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{hospital.address}</span>
                </div>

                {hospital.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{hospital.phone}</span>
                  </div>
                )}

                {hospital.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{hospital.email}</span>
                  </div>
                )}

                {hospital.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className="bg-success-100 text-success-800">
                  Active
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>Available</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {isAdmin ? (
                  <>
                    <Link href={`/admin/hospitals/${hospital.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteHospital(hospital)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Link href={`/hospitals/${hospital.id}`} className="flex-1">
                    <Button className="w-full btn-medical-primary">
                      View Details
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </MedicalCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <Hospital className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hospitals found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No hospitals match your search for "${searchTerm}"`
              : 'No hospitals have been added yet'
            }
          </p>
          {isAdmin && !searchTerm && (
            <Link href="/admin/hospitals/new">
              <Button className="btn-medical-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Hospital
              </Button>
            </Link>
          )}
        </div>
      )}

      {hospitalToDelete && (
        <DeleteHospitalDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          hospital={hospitalToDelete}
          onHospitalDeleted={handleDeleteConfirmed}
        />
      )}
    </div>
  )
}