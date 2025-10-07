import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { getHospitals, createHospital } from '@/lib/supabase/hospitals';
import type { Hospital } from '@/lib/types/hospital';

export async function GET() {
  try {
    const supabase = createClient();
    const hospitals = await getHospitals(supabase);
    return NextResponse.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json(
      { message: 'Failed to fetch hospitals' },
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

    const body: Omit<Hospital, 'id' | 'created_at' | 'updated_at'> = await request.json();
    
    // Validate required fields
    if (!body.name || !body.address || !body.phone) {
      return NextResponse.json(
        { message: 'Missing required fields: name, address, and phone are required' },
        { status: 400 }
      );
    }

    const hospital = await createHospital(body, supabase);
    return NextResponse.json(hospital, { status: 201 });
  } catch (error) {
    console.error('Error creating hospital:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create hospital' },
      { status: 500 }
    );
  }
}