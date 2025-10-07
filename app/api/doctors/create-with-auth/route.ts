import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/api';
import { CreateDoctorRequest } from '@/lib/types/doctor';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(request);
    const adminSupabase = createAdminClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role - be less restrictive and check multiple sources
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Check JWT claims first, then fallback to user_profiles
    const jwtRole = user.app_metadata?.user_role;
    const isAdmin = jwtRole === 'admin' || profile?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body: CreateDoctorRequest = await request.json();
    
    // Validate required fields
    if (!body.first_name || !body.last_name || !body.email || !body.specialization || 
        !body.license_number || !body.hospital_ids?.length || !body.primary_hospital_id) {
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

    // Check if email already exists
    const { data: existingUser } = await adminSupabase.auth.admin.listUsers();
    const emailExists = existingUser.users.some(u => u.email === body.email);
    
    if (emailExists) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      );
    }

    // Set default password for new doctors
    const tempPassword = 'doctor123';
    
    // Create auth user with admin client
    const { data: authUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
      email: body.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: body.first_name,
        last_name: body.last_name,
        role: 'doctor'
      }
    });

    if (createUserError || !authUser.user) {
      throw new Error(`Failed to create auth user: ${createUserError?.message}`);
    }

    try {
      // Create or update user profile using admin client to bypass RLS restrictions
      const { data: userProfile, error: profileError } = await adminSupabase
        .from('user_profiles')
        .upsert({
          id: authUser.user.id,
          email: body.email,
          full_name: `${body.first_name} ${body.last_name}`,
          phone: body.phone,
          role: 'doctor'
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      // Create doctor record - only include fields that exist in doctors table
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: authUser.user.id,
          specialization: body.specialization,
          license_number: body.license_number,
          years_of_experience: body.years_of_experience,
          bio: body.bio,
          consultation_fee: body.consultation_fee,
          image_url: body.image_url
        })
        .select()
        .single();

      if (doctorError) {
        throw new Error(`Failed to create doctor: ${doctorError.message}`);
      }

      // Create hospital associations
      const hospitalAssociations = body.hospital_ids.map(hospitalId => ({
        doctor_id: doctor.id,
        hospital_id: hospitalId,
        is_primary: hospitalId === body.primary_hospital_id
      }));

      const { error: hospitalError } = await supabase
        .from('doctor_hospitals')
        .insert(hospitalAssociations);

      if (hospitalError) {
        throw new Error(`Failed to associate doctor with hospitals: ${hospitalError.message}`);
      }

      // Password is set to default "doctor123" - no need for password reset email

      return NextResponse.json({
        doctor,
        user_profile: userProfile,
        message: 'Doctor created successfully. Default password is "doctor123".'
      }, { status: 201 });

    } catch (error) {
      // Rollback: delete the created auth user if doctor creation fails
      await adminSupabase.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

  } catch (error) {
    console.error('Error creating doctor with auth:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create doctor' },
      { status: 500 }
    );
  }
}