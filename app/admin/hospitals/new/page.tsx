import { requireRole } from '@/lib/auth'
import { HospitalForm } from '@/components/hospitals/hospital-form'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, Home } from 'lucide-react'

export default async function NewHospitalPage() {
  const { user, profile } = await requireRole('admin')

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
            <span className="font-medium text-foreground">Add Hospital</span>
          </div>
        </div>
      </header>
      <Separator />
      
      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Page Header */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Hospital</h2>
            <p className="text-muted-foreground">
              Create a new hospital profile in your network
            </p>
          </div>
        </div>

        {/* Hospital Form */}
        <div className="">
          <HospitalForm />
        </div>
      </div>
    </>
  )
}