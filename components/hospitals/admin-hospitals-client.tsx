'use client'

import { useState, useEffect } from 'react'
import { HospitalsDataTable } from '@/components/hospitals/hospitals-data-table'
import { Database } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/client'

type Hospital = Database['public']['Tables']['hospitals']['Row']

interface AdminHospitalsClientProps {
  initialHospitals: Hospital[]
}

export function AdminHospitalsClient({ initialHospitals }: AdminHospitalsClientProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals)
  const [isLoading, setIsLoading] = useState(false)

  const refreshHospitals = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching hospitals:', error)
      } else {
        setHospitals(data || [])
      }
    } catch (error) {
      console.error('Error refreshing hospitals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHospitalDeleted = async (hospitalId: string) => {
    // Optimistically remove the hospital from the UI
    setHospitals(prev => prev.filter(hospital => hospital.id !== hospitalId))
    
    // Optionally refresh from server to ensure consistency
    // await refreshHospitals()
  }

  return (
    <div className="space-y-4">
      <HospitalsDataTable 
        hospitals={hospitals} 
        isAdmin={true} 
        onHospitalDeleted={handleHospitalDeleted}
      />
    </div>
  )
}