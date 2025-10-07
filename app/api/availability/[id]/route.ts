import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/api'
import { getAvailabilityById, updateAvailability, deleteAvailability } from '@/lib/supabase/availability'
import { UpdateAvailabilityRequest } from '@/lib/types/availability'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(request)
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Doctor access required' },
        { status: 403 }
      )
    }

    // If user is a doctor, verify they own this availability record
    if (profile.role === 'doctor') {
      const { data: availability } = await supabase
        .from('doctor_availability')
        .select(`
          doctor_id,
          doctors!inner(user_id)
        `)
        .eq('id', params.id)
        .single()

      if (!availability || (availability.doctors as any).user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: You can only view your own availability' },
          { status: 403 }
        )
      }
    }
    
    const availability = await getAvailabilityById(params.id, supabase)
    
    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(request)
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Doctor access required' },
        { status: 403 }
      )
    }

    // If user is a doctor, verify they own this availability record
    if (profile.role === 'doctor') {
      const { data: availability } = await supabase
        .from('doctor_availability')
        .select(`
          doctor_id,
          doctors!inner(user_id)
        `)
        .eq('id', params.id)
        .single()

      if (!availability || (availability.doctors as any).user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: You can only update your own availability' },
          { status: 403 }
        )
      }
    }
    
    const body = await request.json()
    
    // Validate time format if provided
    if (body.start_time || body.end_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (body.start_time && !timeRegex.test(body.start_time)) {
        return NextResponse.json(
          { error: 'Invalid start time format. Use HH:MM format' },
          { status: 400 }
        )
      }
      if (body.end_time && !timeRegex.test(body.end_time)) {
        return NextResponse.json(
          { error: 'Invalid end time format. Use HH:MM format' },
          { status: 400 }
        )
      }
    }
    
    // Validate day of week if provided
    if (body.day_of_week !== undefined && (body.day_of_week < 0 || body.day_of_week > 6)) {
      return NextResponse.json(
        { error: 'Day of week must be between 0 and 6' },
        { status: 400 }
      )
    }
    
    // Validate slot duration if provided
    if (body.slot_duration !== undefined && (body.slot_duration < 15 || body.slot_duration > 120)) {
      return NextResponse.json(
        { error: 'Slot duration must be between 15 and 120 minutes' },
        { status: 400 }
      )
    }
    
    // Validate max patients if provided
    if (body.max_patients !== undefined && (body.max_patients < 1 || body.max_patients > 50)) {
      return NextResponse.json(
        { error: 'Max patients must be between 1 and 50' },
        { status: 400 }
      )
    }
    
    // Get current availability to validate time range
    if (body.start_time || body.end_time) {
      const current = await getAvailabilityById(params.id)
      const startTime = body.start_time || current.start_time
      const endTime = body.end_time || current.end_time
      
      if (startTime >= endTime) {
        return NextResponse.json(
          { error: 'Start time must be before end time' },
          { status: 400 }
        )
      }
    }
    
    const updateData: UpdateAvailabilityRequest = {}
    
    // Only include fields that are provided
    if (body.day_of_week !== undefined) updateData.day_of_week = body.day_of_week
    if (body.start_time) updateData.start_time = body.start_time
    if (body.end_time) updateData.end_time = body.end_time
    if (body.slot_duration !== undefined) updateData.slot_duration = body.slot_duration
    if (body.max_patients !== undefined) updateData.max_patients = body.max_patients
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    
    const availability = await updateAvailability(params.id, updateData, supabase)
    
    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(request)
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'doctor')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Doctor access required' },
        { status: 403 }
      )
    }

    // If user is a doctor, verify they own this availability record
    if (profile.role === 'doctor') {
      const { data: availability } = await supabase
        .from('doctor_availability')
        .select(`
          doctor_id,
          doctors!inner(user_id)
        `)
        .eq('id', params.id)
        .single()

      if (!availability || (availability.doctors as any).user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: You can only delete your own availability' },
          { status: 403 }
        )
      }
    }
    
    await deleteAvailability(params.id, supabase)
    
    return NextResponse.json({ message: 'Availability deleted successfully' })
  } catch (error) {
    console.error('Error deleting availability:', error)
    return NextResponse.json(
      { error: 'Failed to delete availability' },
      { status: 500 }
    )
  }
}