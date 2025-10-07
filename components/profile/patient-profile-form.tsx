'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Calendar, Users, Heart, Save, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PatientWithProfile, updatePatientProfile, updateUserProfile, createPatientProfile } from '@/lib/supabase/patients'
import { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface PatientProfileFormProps {
  userProfile: UserProfile
  patientProfile: PatientWithProfile | null
}

export function PatientProfileForm({ userProfile, patientProfile }: PatientProfileFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    // User profile data
    full_name: userProfile.full_name || '',
    phone: userProfile.phone || '',
    
    // Patient profile data
    date_of_birth: patientProfile?.date_of_birth || '',
    gender: patientProfile?.gender || '',
    emergency_contact: patientProfile?.emergency_contact || '',
    medical_history: patientProfile?.medical_history || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update user profile
      const userUpdates = {
        full_name: formData.full_name,
        phone: formData.phone
      }
      
      const updatedUserProfile = await updateUserProfile(userProfile.id, userUpdates)
      if (!updatedUserProfile) {
        throw new Error('Failed to update user profile')
      }

      // Update or create patient profile
      const patientUpdates = {
        date_of_birth: formData.date_of_birth || null,
        gender: (formData.gender as 'male' | 'female' | 'other') || null,
        emergency_contact: formData.emergency_contact || null,
        medical_history: formData.medical_history || null
      }

      if (patientProfile) {
        // Update existing patient profile
        const updatedPatientProfile = await updatePatientProfile(userProfile.id, patientUpdates)
        if (!updatedPatientProfile) {
          throw new Error('Failed to update patient profile')
        }
      } else {
        // Create new patient profile
        const newPatientProfile = await createPatientProfile({
          user_id: userProfile.id,
          ...patientUpdates
        })
        if (!newPatientProfile) {
          throw new Error('Failed to create patient profile')
        }
      }

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: userProfile.full_name || '',
      phone: userProfile.phone || '',
      date_of_birth: patientProfile?.date_of_birth || '',
      gender: patientProfile?.gender || '',
      emergency_contact: patientProfile?.emergency_contact || '',
      medical_history: patientProfile?.medical_history || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {userProfile.full_name || 'Patient'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Patient
              </Badge>
              <span className="text-sm text-gray-500">{userProfile.email}</span>
            </div>
          </div>
        </div>
        
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-primary-200 text-primary-600 hover:bg-primary-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  disabled
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed from this page
                </p>
              </div>

              <div>
                <Label htmlFor="date_of_birth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Personal Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="emergency_contact" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Emergency Contact
                </Label>
                <Input
                  id="emergency_contact"
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-1"
                  placeholder="Emergency contact number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Medical Information
            </h4>
            <div>
              <Label htmlFor="medical_history">
                Medical History & Allergies
              </Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => setFormData(prev => ({ ...prev, medical_history: e.target.value }))}
                disabled={!isEditing}
                className="mt-1"
                rows={4}
                placeholder="Please list any medical conditions, allergies, medications, or other relevant medical information..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This information helps doctors provide better care
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}