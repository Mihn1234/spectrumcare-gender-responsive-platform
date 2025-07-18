import { NextRequest, NextResponse } from 'next/server';
import { AuthService, RegisterData } from '@/lib/auth';
import { z } from 'zod';

// Registration validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
  role: z.enum(['PARENT', 'PROFESSIONAL', 'LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'LA_EXECUTIVE', 'SCHOOL_SENCO', 'HEALTHCARE_PROVIDER']),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  organization: z.string().optional(),
  phone: z.string().optional(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Register user
    const { user, tokens } = await AuthService.register({
      email: validatedData.email,
      password: validatedData.password,
      role: validatedData.role,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      organization: validatedData.organization,
      phone: validatedData.phone
    });

    // Set refresh token as httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile_data: user.profile_data
      },
      accessToken: tokens.accessToken
    }, { status: 201 });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed'
    }, { status: 400 });
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
