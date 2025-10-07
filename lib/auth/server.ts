import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserProfile() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error getting user profile:', profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return user
}

export async function requireRole(role: string | string[]) {
  const user = await requireAuth()
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect('/auth/login')
  }
  
  const allowedRoles = Array.isArray(role) ? role : [role]
  
  if (!allowedRoles.includes(profile.role)) {
    redirect('/dashboard')
  }
  
  return { user, profile }
}

export async function requireAdmin() {
  return requireRole('admin')
}

export async function requireDoctor() {
  return requireRole('doctor')
}

export async function requirePatient() {
  return requireRole('patient')
}

export async function getOptionalUserWithProfile() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { user: null, profile: null }
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error getting user profile:', profileError)
      return { user, profile: null }
    }

    return { user, profile }
  } catch (error) {
    console.error('Error getting optional user with profile:', error)
    return { user: null, profile: null }
  }
}