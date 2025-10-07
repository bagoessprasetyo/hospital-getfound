'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getRedirectUrlByRole } from '@/lib/auth/redirect'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const handleAuthCallback = async () => {
      const supabase = createClient()

      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_error')
          return
        }

        if (data.session) {
          const user = data.session.user
          console.log('🔍 Processing auth callback for user:', user.id, user.email)

          // Use admin client to bypass RLS for profile creation
          const adminSupabase = createClient()
          
          // Check if user profile exists
          const { data: existingProfile, error: profileFetchError } = await adminSupabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          console.log('📋 Profile fetch result:', { existingProfile, profileFetchError })

          if (!existingProfile) {
            console.log('🆕 Creating new user profile for Google user:', user.id)
            
            // Extract name from metadata
            const fullName = user.user_metadata?.full_name || 
                           user.user_metadata?.name || 
                           user.email!.split('@')[0]
            
            console.log('👤 User metadata:', user.user_metadata)
            console.log('📝 Creating profile with name:', fullName)
            
            // Create user profile for new Google users using upsert to handle conflicts
            const { data: profileData, error: profileError } = await adminSupabase
              .from('user_profiles')
              .upsert({
                id: user.id,
                email: user.email!,
                full_name: fullName,
                role: 'patient', // Default role for Google sign-ups
              }, { 
                onConflict: 'id',
                ignoreDuplicates: false 
              })
              .select()
              .single()

            if (profileError) {
              console.error('❌ Profile creation error:', profileError)
              // Continue anyway - maybe trigger created it
            } else {
              console.log('✅ Profile created/updated successfully:', profileData)
            }

            // Create patient record for new users
            const { data: patientData, error: patientError } = await adminSupabase
              .from('patients')
              .upsert({
                user_id: user.id,
              }, { 
                onConflict: 'user_id',
                ignoreDuplicates: true 
              })
              .select()

            if (patientError) {
              console.error('❌ Patient record creation error:', patientError)
            } else {
              console.log('✅ Patient record created/found successfully:', patientData)
            }

            // Wait a moment for the profile to be created, then redirect
            console.log('🔄 Redirecting to patient profile...')
            setTimeout(() => {
              router.push('/my-profile')
            }, 1500)
          } else {
            console.log('✅ Existing user profile found:', existingProfile.role)
            // Existing user - redirect based on role
            const redirectUrl = getRedirectUrlByRole(existingProfile.role)
            console.log('🔄 Redirecting to:', redirectUrl)
            router.push(redirectUrl)
          }
        } else {
          // No session found
          router.push('/auth/login?error=no_session')
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Completing sign in...
          </h2>
          <p className="text-gray-600">
            Please wait while we redirect you to your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}