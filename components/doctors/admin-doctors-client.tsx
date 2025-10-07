'use client'

import { useState } from 'react'
import { DoctorsDataTable } from './doctors-data-table'
import { Database } from '@/lib/supabase'

type Doctor = Database['public']['Tables']['doctors']['Row'] & {
  user_profiles?: {
    full_name: string | null
    email: string
    phone: string | null
  }
}

interface AdminDoctorsClientProps {
  doctors: Doctor[]
}

export function AdminDoctorsClient({ doctors: initialDoctors }: AdminDoctorsClientProps) {
  const [doctors, setDoctors] = useState(initialDoctors)

  const handleDoctorDeleted = (doctorId: string) => {
    setDoctors(doctors.filter(doctor => doctor.id !== doctorId))
  }

  return (
    <DoctorsDataTable 
      doctors={doctors} 
      isAdmin={true}
      onDoctorDeleted={handleDoctorDeleted}
    />
  )
}