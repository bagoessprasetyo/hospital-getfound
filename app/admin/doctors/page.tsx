import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { AdminDoctorsClient } from '@/components/doctors/admin-doctors-client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus, Home, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDoctorsPage() {
  const { user, profile } = await requireRole('admin')
  const supabase = await createClient()

  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      *,
      user_profiles (
        full_name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching doctors:', error)
  }

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Doctors</span>
          </div>
        </div>
      </header>
      <Separator />
      
      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Page Header */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Doctor Management</h2>
            <p className="text-muted-foreground">
              Manage doctors in your network
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/admin/doctors/new">
              <Button className="bg-[#ADE3FF] hover:bg-[#ADE3FF]/80 text-[#1e40af] border-[#ADE3FF]/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <AdminDoctorsClient doctors={doctors || []} />
      </div>
    </>
  )
}