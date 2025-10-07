import { requireAuth, getUserProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DoctorSidebar } from '@/components/doctors/doctor-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const profile = await getUserProfile()

  // Only allow doctor users
  if (!profile || profile.role !== 'doctor') {
    redirect('/')
  }

  return (
    <SidebarProvider>
      <DoctorSidebar user={profile} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}