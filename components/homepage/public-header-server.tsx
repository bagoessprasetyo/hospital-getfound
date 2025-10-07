import Link from 'next/link'
import { Building2, Stethoscope, Calendar, Users } from 'lucide-react'
import { getOptionalUserWithProfile } from '@/lib/auth/server'
import { PublicHeaderClient } from './public-header-client'

interface NavigationItem {
  title: string
  href: string
  icon: string
  description: string
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Hospitals',
    href: '/hospitals',
    icon: 'Building2',
    description: 'Find healthcare facilities'
  },
  {
    title: 'Doctors',
    href: '/doctors',
    icon: 'Stethoscope',
    description: 'Browse medical professionals'
  },
  {
    title: 'Book Appointment',
    href: '/appointments',
    icon: 'Calendar',
    description: 'Schedule your visit'
  },
  {
    title: 'About',
    href: '/about',
    icon: 'Users',
    description: 'Learn about our mission'
  }
]

export async function PublicHeaderServer() {
  const { user, profile } = await getOptionalUserWithProfile()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-black">HealthCare</h1>
              <p className="text-xs text-gray-600">Management System</p>
            </div>
          </Link>

          {/* Pass data to client component for interactive elements */}
          <PublicHeaderClient 
            user={user}
            profile={profile}
            navigationItems={navigationItems}
          />
        </div>
      </div>
    </header>
  )
}