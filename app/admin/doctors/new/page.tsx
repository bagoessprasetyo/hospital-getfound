import { requireRole } from '@/lib/auth'
import { DoctorForm } from '@/components/doctors/doctor-form'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

export default async function NewDoctorPage() {
  await requireRole(['admin'])

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
            <span className="text-foreground">New Doctor</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Doctor</h1>
        </div>

        <Separator />

        <DoctorForm />
      </div>
    </div>
  )
}