'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, User as UserIcon, LogOut, Settings, ChevronDown, Building2, Stethoscope, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/lib/auth/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  full_name: string
  role: 'admin' | 'doctor' | 'patient'
}

interface NavigationItem {
  title: string
  href: string
  icon: string
  description: string
}

interface PublicHeaderClientProps {
  user: User | null
  profile: UserProfile | null
  navigationItems: NavigationItem[]
}

export function PublicHeaderClient({ user, profile, navigationItems }: PublicHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleDashboardLink = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'doctor':
        return '/doctor/dashboard'
      case 'patient':
        return '/my-profile'
      default:
        return '/my-profile'
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return Building2
      case 'Stethoscope':
        return Stethoscope
      case 'Calendar':
        return Calendar
      case 'Users':
        return Users
      default:
        return Building2
    }
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-8">
        {navigationItems.map((item) => {
          const IconComponent = getIconComponent(item.icon)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 transition-colors duration-200 group ${
                isActive(item.href)
                  ? 'rounded-lg text-gray-600 bg-primary-100'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${
                isActive(item.href) ? 'text-gray-600' : 'group-hover:text-black'
              }`} />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop Auth Section */}
      <div className="hidden lg:flex items-center gap-3">
        {user && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-gray-100">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {profile.full_name}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{profile.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href={getRoleDashboardLink(profile.role)} className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my-profile" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = getIconComponent(item.icon)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-gray-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {user && profile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">{profile.full_name}</div>
                      <div className="text-sm text-gray-500 capitalize">{profile.role}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href={getRoleDashboardLink(profile.role)}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <UserIcon className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/my-profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <Settings className="w-5 h-5" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}