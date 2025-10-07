import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAvailability, getDoctorAvailability } from '@/lib/supabase/availability'
import { CreateAvailabilityRequest } from '@/lib/types/availability'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated (no admin requirement for viewing availability)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check in availability API:', { user: user?.id, authError })
    
    if (authError || !user) {
      console.log('Unauthorized access to availability API:', { authError, hasUser: !!user })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctor_id')
    const hospitalId = searchParams.get('hospital_id')
    
    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }
    
    const availability = await getDoctorAvailability(doctorId, hospitalId || undefined, supabase)
    
    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user role
    console.log('Checking user role for user ID:', user.id)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('Profile query result:', { profile, profileError })

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json(
        { error: 'Error fetching user profile' },
        { status: 500 }
      )
    }

    if (!profile || (profile.role !== 'admin' && profile.role !== 'doctor')) {
      console.log('Access denied. Profile:', profile)
      return NextResponse.json(
        { error: 'Forbidden: Admin or Doctor access required' },
        { status: 403 }
      )
    }

    console.log('User role verified:', profile.role)
    
    const body = await request.json()

    // If user is a doctor, they can only create availability for themselves
    if (profile.role === 'doctor') {
      console.log('User is a doctor, checking doctor profile for user ID:', user.id)
      // Get the doctor's profile to verify doctor_id
      const { data: doctorProfile, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single()

      console.log('Doctor profile query result:', { doctorProfile, doctorError })

      if (doctorError) {
        console.error('Error fetching doctor profile:', doctorError)
        return NextResponse.json(
          { error: 'Error fetching doctor profile' },
          { status: 500 }
        )
      }

      if (!doctorProfile) {
        console.log('No doctor profile found for user ID:', user.id)
        return NextResponse.json(
          { error: 'Doctor profile not found' },
          { status: 404 }
        )
      }

      console.log('Doctor profile found:', doctorProfile.id, 'Request doctor_id:', body.doctor_id)

      if (body.doctor_id !== doctorProfile.id) {
        console.log('Doctor ID mismatch. Profile ID:', doctorProfile.id, 'Request ID:', body.doctor_id)
        return NextResponse.json(
          { error: 'Doctors can only create availability for themselves' },
          { status: 403 }
        )
      }

      console.log('Doctor validation passed')
    }
    
    // Validate required fields
    const requiredFields = ['doctor_id', 'hospital_id', 'day_of_week', 'start_time', 'end_time', 'slot_duration', 'max_patients']
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(body.start_time) || !timeRegex.test(body.end_time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM format' },
        { status: 400 }
      )
    }
    
    // Validate start time is before end time
    if (body.start_time >= body.end_time) {
      return NextResponse.json(
        { error: 'Start time must be before end time' },
        { status: 400 }
      )
    }
    
    // Validate day of week
    if (body.day_of_week < 0 || body.day_of_week > 6) {
      return NextResponse.json(
        { error: 'Day of week must be between 0 and 6' },
        { status: 400 }
      )
    }
    
    // Validate slot duration
    if (body.slot_duration < 15 || body.slot_duration > 120) {
      return NextResponse.json(
        { error: 'Slot duration must be between 15 and 120 minutes' },
        { status: 400 }
      )
    }
    
    // Validate max patients
    if (body.max_patients < 1 || body.max_patients > 50) {
      return NextResponse.json(
        { error: 'Max patients must be between 1 and 50' },
        { status: 400 }
      )
    }
    
    const availabilityData: CreateAvailabilityRequest = {
      doctor_id: body.doctor_id,
      hospital_id: body.hospital_id,
      day_of_week: body.day_of_week,
      start_time: body.start_time,
      end_time: body.end_time,
      slot_duration: body.slot_duration,
      max_patients: body.max_patients,
      is_active: body.is_active ?? true,
    }
    
    const availability = await createAvailability(availabilityData, supabase)
    
    return NextResponse.json(availability, { status: 201 })
  } catch (error) {
    console.error('Error creating availability:', error)
    return NextResponse.json(
      { error: 'Failed to create availability' },
      { status: 500 }
    )
  }
}