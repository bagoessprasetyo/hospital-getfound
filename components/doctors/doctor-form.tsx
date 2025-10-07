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
import { ImageUpload } from '@/components/ui/image-upload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/lib/supabase'
import { toast } from 'sonner'
import { getHospitals } from '@/lib/supabase/hospitals'

type Doctor = Database['public']['Tables']['doctors']['Row']
type DoctorInsert = Database['public']['Tables']['doctors']['Insert']
type Hospital = Database['public']['Tables']['hospitals']['Row']

const doctorSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  specialization: z.string().min(1, 'Specialization is required'),
  license_number: z.string().min(1, 'License number is required'),
  years_of_experience: z.coerce.number().min(0, 'Years of experience must be 0 or greater'),
  bio: z.string().optional(),
  consultation_fee: z.coerce.number().min(0, 'Consultation fee must be 0 or greater'),
  image_url: z.string().optional().nullable(),
  hospital_ids: z.array(z.string()).min(1, 'At least one hospital must be selected'),
  primary_hospital_id: z.string().min(1, 'Primary hospital is required'),
})

type DoctorFormData = z.infer<typeof doctorSchema>

interface DoctorFormProps {
  doctor?: Doctor & {
    doctor_hospitals?: Array<{
      hospital_id: string
      is_primary: boolean
    }>
  }
  isEdit?: boolean
}

const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Family Medicine',
  'Internal Medicine',
  'Neurology',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Urology'
]

export function DoctorForm({ doctor, isEdit = false }: DoctorFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema) as any,
    defaultValues: {
      first_name: (doctor as any)?.first_name || '',
      last_name: (doctor as any)?.last_name || '',
      email: (doctor as any)?.email || '',
      phone: (doctor as any)?.phone || '',
      specialization: doctor?.specialization || '',
      license_number: doctor?.license_number || '',
      years_of_experience: doctor?.years_of_experience || 0,
      bio: doctor?.bio || '',
      consultation_fee: doctor?.consultation_fee || 0,
      image_url: doctor?.image_url || null,
      hospital_ids: doctor?.doctor_hospitals?.map(dh => dh.hospital_id) || [],
      primary_hospital_id: doctor?.doctor_hospitals?.find(dh => dh.is_primary)?.hospital_id || '',
    }
  })

  const imageUrl = watch('image_url')
  const watchedHospitalIds = watch('hospital_ids')

  // Load hospitals
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const hospitalData = await getHospitals()
        setHospitals(hospitalData as Hospital[])
      } catch (error) {
        console.error('Error loading hospitals:', error)
        toast.error('Failed to load hospitals')
      }
    }
    loadHospitals()
  }, [])

  // Reset primary hospital if it's not in selected hospitals
  useEffect(() => {
    const primaryHospitalId = watch('primary_hospital_id')
    if (primaryHospitalId && !watchedHospitalIds.includes(primaryHospitalId)) {
      setValue('primary_hospital_id', '')
    }
  }, [watchedHospitalIds, watch, setValue])

  const onSubmit = async (data: DoctorFormData) => {
    setLoading(true)
    setError('')

    try {
      const { hospital_ids, primary_hospital_id, first_name, last_name, email, phone, ...doctorData } = data

      if (isEdit && doctor) {
        // Use API endpoint for updates to ensure proper permissions and validation
        const response = await fetch(`/api/doctors/${doctor.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name,
            last_name,
            email,
            phone,
            ...doctorData,
            hospital_ids,
            primary_hospital_id
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to update doctor')
        }

        const result = await response.json()
        toast.success('Doctor updated successfully!')
      } else {
        // Create new doctor with authentication
        const response = await fetch('/api/doctors/create-with-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name,
            last_name,
            email,
            phone,
            ...doctorData,
            hospital_ids,
            primary_hospital_id
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to create doctor')
        }

        const result = await response.json()
        toast.success(result.message || 'Doctor created successfully!')
      }

      router.push('/admin/doctors')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving doctor:', error)
      setError(error.message || 'An error occurred while saving the doctor')
      toast.error('Failed to save doctor')
    } finally {
      setLoading(false)
    }
  }

  const handleHospitalToggle = (hospitalId: string, checked: boolean) => {
    const currentHospitalIds = watch('hospital_ids')
    if (checked) {
      setValue('hospital_ids', [...currentHospitalIds, hospitalId])
    } else {
      setValue('hospital_ids', currentHospitalIds.filter(id => id !== hospitalId))
      // If this was the primary hospital, clear it
      if (watch('primary_hospital_id') === hospitalId) {
        setValue('primary_hospital_id', '')
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-6">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600" />
          <CardTitle>{isEdit ? 'Edit Doctor' : 'Add New Doctor'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email address"
                disabled={isEdit} // Don't allow email changes in edit mode
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <Select
                value={watch('specialization')}
                onValueChange={(value) => setValue('specialization', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialization && (
                <p className="text-sm text-red-600">{errors.specialization.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                placeholder="MD123456"
                {...register('license_number')}
              />
              {errors.license_number && (
                <p className="text-sm text-red-600">{errors.license_number.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Experience *</Label>
              <Input
                id="years_of_experience"
                type="number"
                min="0"
                placeholder="5"
                {...register('years_of_experience')}
              />
              {errors.years_of_experience && (
                <p className="text-sm text-red-600">{errors.years_of_experience.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultation_fee">Consultation Fee ($) *</Label>
              <Input
                id="consultation_fee"
                type="number"
                min="0"
                step="0.01"
                placeholder="150.00"
                {...register('consultation_fee')}
              />
              {errors.consultation_fee && (
                <p className="text-sm text-red-600">{errors.consultation_fee.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Profile Image</Label>
            <ImageUpload
              bucket="doctor-images"
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Brief description of the doctor's background and expertise..."
              className="resize-none"
              rows={3}
              {...register('bio')}
            />
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hospital Assignments *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {hospitals.map((hospital) => (
                  <div key={hospital.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`hospital-${hospital.id}`}
                      checked={watchedHospitalIds.includes(hospital.id)}
                      onCheckedChange={(checked) => 
                        handleHospitalToggle(hospital.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`hospital-${hospital.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {hospital.name}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.hospital_ids && (
                <p className="text-sm text-red-600">{errors.hospital_ids.message}</p>
              )}
            </div>

            {watchedHospitalIds.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="primary_hospital_id">Primary Hospital *</Label>
                <Select
                  value={watch('primary_hospital_id')}
                  onValueChange={(value) => setValue('primary_hospital_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals
                      .filter((hospital) => watchedHospitalIds.includes(hospital.id))
                      .map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.primary_hospital_id && (
                  <p className="text-sm text-red-600">{errors.primary_hospital_id.message}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <Link href="/admin/doctors">
              <Button type="button" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Doctors
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Doctor' : 'Create Doctor'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}