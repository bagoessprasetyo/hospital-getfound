'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Menu, X, Stethoscope, Calendar, Users, Phone, User as UserIcon, LogOut, Settings, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { getSupabaseClient } from '@/lib/supabase/client'
import { signOut } from '@/lib/auth/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  full_name: string
  role: 'admin' | 'doctor' | 'patient'
}

export function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const navigationItems = [
    {
      title: 'Hospitals',
      href: '/hospitals',
      icon: Building2,
      description: 'Find healthcare facilities'
    },
    {
      title: 'Doctors',
      href: '/doctors',
      icon: Stethoscope,
      description: 'Browse medical professionals'
    },
    {
      title: 'Book Appointment',
      href: '/appointments',
      icon: Calendar,
      description: 'Schedule your visit'
    },
    {
      title: 'About',
      href: '/about',
      icon: Users,
      description: 'Learn about our mission'
    }
  ]

  useEffect(() => {
    const supabase = getSupabaseClient()
    let isMounted = true

    // Get initial session with retry logic
    const getInitialSession = async (retryCount = 0) => {
      try {
        console.log('🔍 Getting initial session... (attempt', retryCount + 1, ')')
        
        // Wait a bit for the client to initialize on first load
        if (retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          // Retry up to 3 times with exponential backoff
          if (retryCount < 2 && isMounted) {
            const delay = Math.pow(2, retryCount) * 500
            console.log(`⏳ Retrying in ${delay}ms...`)
            setTimeout(() => {
              if (isMounted) {
                getInitialSession(retryCount + 1)
              }
            }, delay)
            return
          }
        }
        
        console.log('📋 Initial session:', session)
        
        if (!isMounted) return
        
        if (session?.user) {
          console.log('👤 User found:', session.user.id, session.user.email)
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          console.log('❌ No user in initial session')
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('❌ Unexpected error getting session:', error)
        // Retry on unexpected errors too
        if (retryCount < 2 && isMounted) {
          const delay = Math.pow(2, retryCount) * 500
          setTimeout(() => {
            if (isMounted) {
              getInitialSession(retryCount + 1)
            }
          }, delay)
          return
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id)
        
        if (!isMounted) return
        
        // Don't process INITIAL_SESSION events as they're handled by getInitialSession
        if (event === 'INITIAL_SESSION') {
          console.log('⏭️ Skipping INITIAL_SESSION event (handled separately)')
          return
        }
        
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
          setUserProfile(null)
        }
        setIsLoading(false)
      }
    )

    // Also listen for storage changes to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      // Only react to supabase auth changes
      if (e.key?.startsWith('sb-') && isMounted) {
        console.log('💾 Supabase storage changed, refreshing session...')
        setIsLoading(true)
        getInitialSession()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)

    // Start the initial session check
    getInitialSession()

    return () => {
      isMounted = false
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    const maxRetries = 3
    let retryCount = 0
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🔍 Fetching user profile for: ${userId} (attempt ${retryCount + 1}/${maxRetries})`)
        const supabase = getSupabaseClient()
        
        // First try to get the profile
        console.log('📡 Making database query to user_profiles table...')
        console.log('🔍 Query details:', {
          table: 'user_profiles',
          select: 'id, full_name, role',
          filter: `id = ${userId}`,
          attempt: retryCount + 1
        })
      
      const queryStart = Date.now()
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Database query timeout after 10 seconds'))
        }, 10000) // 10 second timeout
      })
      
      // Create the query promise
      const queryPromise = supabase
        .from('user_profiles')
        .select('id, full_name, role')
        .eq('id', userId)
        .single()
      
      console.log('⏱️ Starting query with 10s timeout...')
      
      let profile, error
      try {
        // Race between query and timeout
        const result = await Promise.race([queryPromise, timeoutPromise]) as any
        profile = result.data
        error = result.error
        
        const queryTime = Date.now() - queryStart
        console.log(`📊 Database query completed in ${queryTime}ms`)
        console.log('📊 Database query result:', { profile, error })
      } catch (timeoutError: any) {
         const queryTime = Date.now() - queryStart
         console.log(`⏰ Database query timed out after ${queryTime}ms`)
         console.log('⏰ Timeout error:', timeoutError.message)
        
        // Treat timeout as an error
        error = {
          code: 'TIMEOUT',
          message: 'Database query timed out',
          details: timeoutError.message
        }
        profile = null
      }
      
      // Log the raw response for debugging
      if (profile) {
        console.log('✅ Profile data received:', JSON.stringify(profile, null, 2))
      }
      if (error) {
        console.log('❌ Error object:', JSON.stringify(error, null, 2))
      }

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        console.log('🔍 Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Handle timeout errors specifically
        if (error.code === 'TIMEOUT') {
          console.log(`⏰ Query timed out on attempt ${retryCount + 1}/${maxRetries}`)
          retryCount++
          if (retryCount >= maxRetries) {
            console.log('⏰ Max retries reached for timeout, setting fallback state...')
            setIsLoading(false)
            return
          }
          console.log(`🔄 Retrying after timeout... (attempt ${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
          continue
        }
        
        // If profile doesn't exist, try to create it (for users created outside the normal flow)
        if (error.code === 'PGRST116') {
          console.log('🆕 Profile not found, attempting to create default profile...')
          
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            console.log('👤 Current user data for profile creation:', {
              id: user.id,
              email: user.email,
              metadata: user.user_metadata
            })
            
            const profileData = {
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
              role: 'patient'
            }
            
            console.log('🆕 Attempting to create profile with data:', JSON.stringify(profileData, null, 2))
            
            const { data: insertData, error: createError } = await supabase
              .from('user_profiles')
              .insert(profileData)
              .select()
            
            console.log('🆕 Profile creation result:', { insertData, createError })
            
            if (createError) {
              console.log('❌ Profile creation error details:', JSON.stringify(createError, null, 2))
            }
            
            if (!createError) {
              console.log('✅ Profile created successfully, retrying fetch...')
              console.log('✅ Created profile data:', insertData)
              
              // Wait a moment for the database to be consistent
              await new Promise(resolve => setTimeout(resolve, 100))
              
              // Retry fetching the profile
              console.log('🔄 Retrying profile fetch after creation...')
              const { data: newProfile, error: retryError } = await supabase
                .from('user_profiles')
                .select('id, full_name, role')
                .eq('id', userId)
                .single()
              
              console.log('🔄 Retry fetch result:', { newProfile, retryError })
              
              if (newProfile && !retryError) {
                setUserProfile(newProfile)
                console.log('✅ Profile set successfully after creation:', newProfile)
                setIsLoading(false)
                return
              } else {
                console.log('❌ Failed to fetch profile after creation:', retryError)
                // If retry fails, use the created profile data directly
                if (insertData && insertData.length > 0) {
                  const createdProfile = insertData[0]
                  console.log('🔄 Using created profile data directly:', createdProfile)
                  setUserProfile({
                    id: createdProfile.id,
                    full_name: createdProfile.full_name,
                    role: createdProfile.role
                  })
                  setIsLoading(false)
                  return
                }
              }
            } else {
              console.log('❌ Failed to create profile:', createError)
              console.log('❌ Create error details:', JSON.stringify(createError, null, 2))
              
              // Check if it's a unique constraint violation (profile already exists)
              if (createError.code === '23505') {
                console.log('🔄 Profile already exists, retrying fetch...')
                const { data: existingProfile, error: existingError } = await supabase
                  .from('user_profiles')
                  .select('id, full_name, role')
                  .eq('id', userId)
                  .single()
                
                console.log('🔄 Existing profile fetch result:', { existingProfile, existingError })
                
                if (existingProfile && !existingError) {
                  setUserProfile(existingProfile)
                  console.log('✅ Found existing profile:', existingProfile)
                  setIsLoading(false)
                  return
                }
              }
            }
          }
        }
        
        // Set loading to false even if profile fetch failed
        console.log('🔄 Setting isLoading to false after profile fetch error...')
        setIsLoading(false)
        console.log('✅ isLoading set to false after error')
        return
      }

      if (profile) {
        console.log('✅ User profile fetched successfully:', profile)
        console.log('🔄 Setting userProfile state...')
        setUserProfile(profile)
        console.log('✅ userProfile state set')
        console.log('🔄 Setting isLoading to false after successful profile fetch...')
        setIsLoading(false)
        console.log('✅ isLoading set to false after success')
        return // Exit the retry loop on success
      } else {
        console.log('⚠️ Profile query succeeded but returned null/undefined')
        console.log('🔄 Setting isLoading to false after null profile...')
        setIsLoading(false)
        console.log('✅ isLoading set to false after null profile')
        return // Exit the retry loop
      }
      } catch (error) {
        console.error('❌ Unexpected error in fetchUserProfile:', error)
        retryCount++
        if (retryCount >= maxRetries) {
          console.log('❌ Max retries reached for unexpected error, setting fallback state...')
          setIsLoading(false)
          return
        }
        console.log(`🔄 Retrying after unexpected error... (attempt ${retryCount + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setUserProfile(null)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Add debug logging for state changes
  useEffect(() => {
    console.log('🔍 Component state update:', {
      user: user ? { id: user.id, email: user.email } : null,
      userProfile: userProfile,
      isLoading: isLoading
    })
  }, [user, userProfile, isLoading])

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

  const isActive = (href: string) => pathname === href

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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 transition-colors duration-200 group ${
                  isActive(item.href)
                    ? 'rounded-lg text-gray-600 bg-primary-100'
                    : 'text-gray-600 hover:text-black'
                }`}
                style={isActive(item.href) ? { 
                  
                  
                } : {}}
              >
                <item.icon className={`w-4 h-4 ${
                  isActive(item.href) ? 'text-gray-600' : 'group-hover:text-black'
                }`} 
                 />
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            ) : user && !userProfile ? (
              // User exists but no profile - show fallback with user email and retry button
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-gray-100">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-900">
                          {user.email?.split('@')[0] || 'User'}
                        </span>
                        <span className="text-xs text-gray-500">No Profile</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => fetchUserProfile(user.id)}>
                      <UserIcon className="w-4 h-4 mr-2" />
                      Retry Profile Load
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : user && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-gray-100">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-black text-white text-sm">
                        {getInitials(userProfile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {userProfile.full_name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {userProfile.role}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={getRoleDashboardLink(userProfile.role)} className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {userProfile.role === 'patient' ? 'My Profile' : 'Dashboard'}
                    </Link>
                  </DropdownMenuItem>
                  {userProfile.role === 'patient' && (
                    <DropdownMenuItem asChild>
                      <Link href="/appointments" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        My Appointments
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-600">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-black">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-black transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-3">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                      isActive(item.href)
                        ? 'text-black'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                    style={isActive(item.href) ? { 
                      backgroundColor: 'rgba(173, 227, 255, 0.1)' 
                    } : {}}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive(item.href)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}
                    style={isActive(item.href) ? { backgroundColor: '#ADE3FF' } : {}}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className={`font-medium ${
                        isActive(item.href) ? '' : 'text-gray-900'
                      }`}
                      style={isActive(item.href) ? { color: '#ADE3FF' } : {}}>{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {isLoading ? (
                  <div className="w-full h-10 animate-pulse bg-gray-200 rounded-lg" />
                ) : user && !userProfile ? (
                  // User exists but no profile - show fallback with user email and retry button
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {user.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-sm text-gray-500">No Profile</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fetchUserProfile(user.id)}
                      className="w-full"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Retry Profile Load
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : user && userProfile ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-black text-white">
                          {getInitials(userProfile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">
                          {userProfile.full_name}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {userProfile.role}
                        </div>
                      </div>
                    </div>
                    
                    {/* User Actions */}
                    <Link href={getRoleDashboardLink(userProfile.role)} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <UserIcon className="w-4 h-4 mr-2" />
                        {userProfile.role === 'patient' ? 'My Profile' : 'Dashboard'}
                      </Button>
                    </Link>
                    
                    {userProfile.role === 'patient' && (
                      <Link href="/appointments" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          My Appointments
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      variant="outline" 
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-gray-300 text-gray-600 hover:text-black">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-black hover:bg-gray-800 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-red-900">Emergency</div>
                    <div className="text-sm text-red-700">Call 911 or (555) 911-HELP</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}