import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { getDoctors, createDoctor } from '@/lib/supabase/doctors';
import { CreateDoctorRequest } from '@/lib/types/doctor';

export async function GET() {
  try {
    const supabase = createClient();
    const doctors = await getDoctors(supabase);
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { message: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(request);
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body: CreateDoctorRequest = await request.json();
    
    // Validate required fields
    if (!body.specialization || !body.license_number || !body.hospital_ids?.length || !body.primary_hospital_id) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that primary hospital is in the selected hospitals
    if (!body.hospital_ids.includes(body.primary_hospital_id)) {
      return NextResponse.json(
        { message: 'Primary hospital must be one of the selected hospitals' },
        { status: 400 }
      );
    }

    const doctor = await createDoctor(body, supabase);
    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create doctor' },
      { status: 500 }
    );
  }
}