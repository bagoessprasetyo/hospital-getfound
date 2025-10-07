import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { DoctorForm } from '@/components/doctors/doctor-form'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, Home } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface EditDoctorPageProps {
  params: {
    id: string
  }
}

// Loading skeleton component for the form
function DoctorFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}

export default async function EditDoctorPage({ params }: EditDoctorPageProps) {
  await requireRole(['admin'])

  const supabase = await createClient()
  
  // Fetch doctor with hospital relationships and user profile data
  const { data: doctor, error } = await supabase
    .from('doctors')
    .select(`
      *,
      doctor_hospitals (
        hospital_id,
        is_primary
      ),
      user_profiles!inner (
        full_name,
        email
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !doctor) {
    notFound()
  }

  // Split full_name into first_name and last_name
  const fullName = doctor.user_profiles?.full_name || ''
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Create enhanced doctor object with split name and email
  const enhancedDoctor = {
    ...doctor,
    first_name: firstName,
    last_name: lastName,
    email: doctor.user_profiles?.email || ''
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Link href="/admin" className="hover:text-foreground">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/admin/doctors" className="hover:text-foreground">
              Doctors
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Edit Doctor</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Doctor</h1>
        </div>

        <Separator />

        <Suspense fallback={<DoctorFormSkeleton />}>
          <DoctorForm doctor={enhancedDoctor} isEdit={true} />
        </Suspense>
      </div>
    </div>
  )
}