import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { HospitalForm } from '@/components/hospitals/hospital-form'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, Home } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface EditHospitalPageProps {
  params: {
    id: string
  }
}

// Loading skeleton component for the form
function HospitalFormSkeleton() {
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

export default async function EditHospitalPage({ params }: EditHospitalPageProps) {
  const { user, profile } = await requireRole('admin')
  const supabase = await createClient()

  const { data: hospital, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !hospital) {
    notFound()
  }

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="text-muted-foreground">Hospitals</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Edit Hospital</span>
          </div>
        </div>
      </header>
      <Separator />
      
      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Page Header */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Hospital</h2>
            <p className="text-muted-foreground">
              Update hospital information for {hospital.name}
            </p>
          </div>
        </div>

        {/* Hospital Form */}
        <div className="">
          <Suspense fallback={<HospitalFormSkeleton />}>
            <HospitalForm hospital={hospital} isEdit={true} />
          </Suspense>
        </div>
      </div>
    </>
  )
}