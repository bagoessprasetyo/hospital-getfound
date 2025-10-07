import { AuthForm } from '@/components/auth/auth-form'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SignupPage() {
  const user = await getUser()
  
  if (user) {
    // Get user profile to determine redirect
    const { getUserProfile } = await import('@/lib/auth')
    const profile = await getUserProfile()
    
    if (profile?.role === 'admin') {
      redirect('/admin/dashboard')
    } else if (profile?.role === 'doctor') {
      redirect('/doctor')
    } else {
      redirect('/my-profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            Hospital Management
          </h1>
          <p className="text-gray-600">
            Join our healthcare community
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  )
}