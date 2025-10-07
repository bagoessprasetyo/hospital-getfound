import { AuthForm } from '@/components/auth/auth-form'
import { getUser } from '@/lib/auth'
import { getRedirectUrlByRole } from '@/lib/auth/redirect'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const user = await getUser()
  
  if (user) {
    // Get user profile to determine redirect
    const { getUserProfile } = await import('@/lib/auth')
    const profile = await getUserProfile()
    
    const redirectUrl = getRedirectUrlByRole(profile?.role || 'patient')
    redirect(redirectUrl)
  }

  return (
    <div className="min-h-screen bg-[#F6F4F2] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Hospital Management
          </h1>
          <p className="text-gray-600">
            Your trusted healthcare partner
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  )
}