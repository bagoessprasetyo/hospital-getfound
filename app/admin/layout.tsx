import { requireAuth, getUserProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const profile = await getUserProfile()

  // Only allow admin users
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={profile} />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}