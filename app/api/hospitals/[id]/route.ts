import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/api';
import { getHospitalById, updateHospital, deleteHospital } from '@/lib/supabase/hospitals';
import type { Hospital } from '@/lib/types/hospital';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(request);
    const hospital = await getHospitalById(params.id, supabase);
    
    if (!hospital) {
      return NextResponse.json(
        { message: 'Hospital not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(hospital);
  } catch (error) {
    console.error('Error fetching hospital:', error);
    return NextResponse.json(
      { message: 'Failed to fetch hospital' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body: Partial<Omit<Hospital, 'id' | 'created_at' | 'updated_at'>> = await request.json();
    
    // Validate required fields if they are being updated
    if (body.name !== undefined && !body.name) {
      return NextResponse.json(
        { message: 'Hospital name cannot be empty' },
        { status: 400 }
      );
    }

    if (body.address !== undefined && !body.address) {
      return NextResponse.json(
        { message: 'Hospital address cannot be empty' },
        { status: 400 }
      );
    }

    if (body.phone !== undefined && !body.phone) {
      return NextResponse.json(
        { message: 'Hospital phone cannot be empty' },
        { status: 400 }
      );
    }

    const hospital = await updateHospital(params.id, body, supabase);
    return NextResponse.json(hospital);
  } catch (error) {
    console.error('Error updating hospital:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update hospital' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await deleteHospital(params.id, supabase);
    return NextResponse.json({ message: 'Hospital deleted successfully' });
  } catch (error) {
    console.error('Error deleting hospital:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete hospital' },
      { status: 500 }
    );
  }
}