'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ui/image-upload'
import { Hospital, Save, ArrowLeft, Search, X } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase'
import { toast } from 'sonner'
import { getHospitalServices, getHospitalServicesByCategory, getHospitalAssignedServices, assignServicesToHospital } from '@/lib/supabase/hospitals'
import type { HospitalService, ServiceCategory } from '@/lib/types/hospital'

type Hospital = Database['public']['Tables']['hospitals']['Row']
type HospitalInsert = Database['public']['Tables']['hospitals']['Insert']

const hospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().optional(),
  image_url: z.string().optional().nullable(),
  service_ids: z.array(z.string()).optional()
})

type HospitalFormData = z.infer<typeof hospitalSchema>

interface HospitalFormProps {
  hospital?: Hospital
  isEdit?: boolean
}

export function HospitalForm({ hospital, isEdit = false }: HospitalFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<HospitalService[]>([])
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, HospitalService[]>>({})
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [loadingServices, setLoadingServices] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: hospital?.name || '',
      address: hospital?.address || '',
      phone: hospital?.phone || '',
      email: hospital?.email || '',
      website: hospital?.website || '',
      description: hospital?.description || '',
      image_url: hospital?.image_url || null,
      service_ids: []
    }
  })

  const imageUrl = watch('image_url')

  // Load services and assigned services on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true)
        const [allServices, servicesByCategory] = await Promise.all([
          getHospitalServices(),
          getHospitalServicesByCategory()
        ])
        
        setServices(allServices)
        setServicesByCategory(servicesByCategory)

        // If editing, load assigned services
        if (isEdit && hospital?.id) {
          const assignedServices = await getHospitalAssignedServices(hospital.id)
          const assignedServiceIds = assignedServices.map(s => s.id)
          setSelectedServices(assignedServiceIds)
          setValue('service_ids', assignedServiceIds)
        }
      } catch (error) {
        console.error('Error loading services:', error)
        toast.error('Failed to load hospital services')
      } finally {
        setLoadingServices(false)
      }
    }

    loadServices()
  }, [hospital?.id, isEdit, setValue])

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
  )

  const filteredServicesByCategory = Object.entries(servicesByCategory).reduce((acc, [category, categoryServices]) => {
    const filtered = categoryServices.filter(service =>
      service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
    )
    if (filtered.length > 0) {
      acc[category] = filtered
    }
    return acc
  }, {} as Record<string, HospitalService[]>)

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    let updatedServices: string[]
    if (checked) {
      updatedServices = [...selectedServices, serviceId]
    } else {
      updatedServices = selectedServices.filter(id => id !== serviceId)
    }
    setSelectedServices(updatedServices)
    setValue('service_ids', updatedServices)
  }

  const removeService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(id => id !== serviceId)
    setSelectedServices(updatedServices)
    setValue('service_ids', updatedServices)
  }

  const onSubmit = async (data: HospitalFormData) => {
    setLoading(true)
    setError('')

    try {
      const hospitalData: HospitalInsert = {
        name: data.name,
        address: data.address,
        phone: data?.phone || '',
        email: data.email || null,
        website: data.website || null,
        description: data.description || null,
        image_url: data.image_url || null
      }

      let hospitalId: string

      if (isEdit && hospital) {
        const { error } = await supabase
          .from('hospitals')
          .update(hospitalData)
          .eq('id', hospital.id)

        if (error) throw error
        
        hospitalId = hospital.id
        
        toast.success('Hospital updated successfully!', {
          description: `${data.name} has been updated.`
        })
      } else {
        const { data: newHospital, error } = await supabase
          .from('hospitals')
          .insert(hospitalData)
          .select()
          .single()

        if (error) throw error
        
        hospitalId = newHospital.id
        
        toast.success('Hospital created successfully!', {
          description: `${data.name} has been added to the system.`
        })
      }

      // Assign services to hospital
      if (data.service_ids && data.service_ids.length > 0) {
        await assignServicesToHospital(hospitalId, data.service_ids)
      }

      router.push('/admin/hospitals')
      router.refresh()
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred'
      setError(errorMessage)
      
      toast.error(isEdit ? 'Failed to update hospital' : 'Failed to create hospital', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Hospital className="h-5 w-5 text-primary-600" />
          </div>
          <CardTitle>
            {isEdit ? 'Edit Hospital' : 'Hospital Information'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Hospital Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter hospital name"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter complete address"
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Hospital Image</Label>
            <ImageUpload
              bucket="hospital-images"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              disabled={loading}
            />
            {errors.image_url && (
              <p className="text-sm text-red-600">{errors.image_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the hospital and its services"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Hospital Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Hospital Services</Label>
              <Badge variant="secondary" className="text-xs">
                {selectedServices.length} selected
              </Badge>
            </div>
            
            {loadingServices ? (
              <div className="text-sm text-gray-500">Loading services...</div>
            ) : (
              <>
                {/* Selected Services Display */}
                {selectedServices.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Selected Services:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map(serviceId => {
                        const service = services.find(s => s.id === serviceId)
                        if (!service) return null
                        return (
                          <Badge 
                            key={serviceId} 
                            variant="default" 
                            className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            {service.name}
                            <button
                              type="button"
                              onClick={() => removeService(serviceId)}
                              className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Service Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search services..."
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Services by Category */}
                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
                  {Object.entries(filteredServicesByCategory).map(([category, categoryServices]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 border-b pb-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryServices.map((service) => (
                          <div key={service.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`service-${service.id}`}
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={(checked) => 
                                handleServiceToggle(service.id, checked as boolean)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <Label 
                                htmlFor={`service-${service.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {service.name}
                              </Label>
                              {service.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(filteredServicesByCategory).length === 0 && serviceSearchTerm && (
                    <div className="text-center text-gray-500 py-4">
                      No services found matching "{serviceSearchTerm}"
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Link href="/admin/hospitals">
              <Button type="button" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="btn-medical-primary"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (isEdit ? 'Update Hospital' : 'Create Hospital')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}