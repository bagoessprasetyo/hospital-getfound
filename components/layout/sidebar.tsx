'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Hospital, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3, 
  Stethoscope,
  User,
  Clock,
  FileText
} from 'lucide-react'

interface SidebarProps {
  userRole: 'admin' | 'doctor' | 'patient'
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: BarChart3,
        roles: ['admin', 'doctor', 'patient']
      }
    ]

    const adminItems = [
      {
        title: 'Hospitals',
        href: '/admin/hospitals',
        icon: Hospital,
        roles: ['admin']
      },
      {
        title: 'Doctors',
        href: '/admin/doctors',
        icon: Users,
        roles: ['admin']
      },
      {
        title: 'Users',
        href: '/admin/users',
        icon: User,
        roles: ['admin']
      }
    ]

    const doctorItems = [
      {
        title: 'My Schedule',
        href: '/doctor/schedule',
        icon: Clock,
        roles: ['doctor']
      },
      {
        title: 'Appointments',
        href: '/doctor/appointments',
        icon: Calendar,
        roles: ['doctor']
      },
      {
        title: 'Patients',
        href: '/doctor/patients',
        icon: Users,
        roles: ['doctor']
      }
    ]

    const patientItems = [
      {
        title: 'Hospitals',
        href: '/hospitals',
        icon: Hospital,
        roles: ['patient']
      },
      {
        title: 'Doctors',
        href: '/doctors',
        icon: Stethoscope,
        roles: ['patient']
      },
      {
        title: 'My Appointments',
        href: '/appointments',
        icon: Calendar,
        roles: ['patient']
      },
      {
        title: 'Medical Records',
        href: '/medical-records',
        icon: FileText,
        roles: ['patient']
      }
    ]

    const settingsItems = [
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        roles: ['admin', 'doctor', 'patient']
      },
      {
        title: 'Profile',
        href: '/profile',
        icon: User,
        roles: ['admin', 'doctor', 'patient']
      }
    ]

    let allItems = [...baseItems]
    
    if (userRole === 'admin') {
      allItems = [...allItems, ...adminItems]
    } else if (userRole === 'doctor') {
      allItems = [...allItems, ...doctorItems]
    } else if (userRole === 'patient') {
      allItems = [...allItems, ...patientItems]
    }

    allItems = [...allItems, ...settingsItems]

    return allItems.filter(item => item.roles.includes(userRole))
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Stethoscope className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-600">
              Hospital Management
            </h2>
            <p className="text-xs text-gray-500 capitalize">
              {userRole} Dashboard
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'border border-opacity-20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                style={isActive ? { 
                  backgroundColor: 'rgba(173, 227, 255, 0.1)', 
                  color: '#ADE3FF',
                  borderColor: '#ADE3FF'
                } : {}}
              >
                <item.icon className={cn(
                  'h-5 w-5',
                  isActive ? '' : 'text-gray-400'
                )} 
                style={isActive ? { color: '#ADE3FF' } : {}} />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}