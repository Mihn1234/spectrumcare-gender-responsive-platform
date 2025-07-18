import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

// Validation schema for updating adult profile
const adultProfileUpdateSchema = z.object({
  dateOfBirth: z.string().optional(),
  employmentStatus: z.enum(['employed', 'unemployed', 'student', 'retired', 'supported_employment']).optional(),
  livingSituation: z.enum(['independent', 'supported', 'family_home', 'care_facility', 'sheltered_housing']).optional(),
  independenceLevel: z.enum(['high', 'moderate', 'low', 'requires_support']).optional(),
  communicationPreferences: z.object({
    preferredMethod: z.string(),
    accessibilityNeeds: z.array(z.string()),
    languagePreferences: z.array(z.string())
  }).optional(),
  supportNeeds: z.object({
    dailyLiving: z.array(z.string()),
    social: z.array(z.string()),
    vocational: z.array(z.string()),
    mental_health: z.array(z.string())
  }).optional(),
  goals: z.array(z.object({
    category: z.string(),
    description: z.string(),
    targetDate: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    progress: z.number()
  })).optional(),
  financialSupport: z.object({
    personalBudget: z.number(),
    directPayments: z.boolean(),
    benefitsReceived: z.array(z.string()),
    employmentSupport: z.boolean()
  }).optional()
});

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const profileId = id;

    const profile = await memoryDatabase.getAdultProfileById(profileId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has access to this profile
    if (profile.userId !== authResult.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate age if dateOfBirth exists
    let age = 0;
    if (profile.dateOfBirth) {
      age = calculateAge(profile.dateOfBirth);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        age
      }
    });
  } catch (error) {
    console.error('Failed to fetch adult profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch adult profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const profileId = id;

    const body = await request.json();
    const validatedData = adultProfileUpdateSchema.parse(body);

    // Check if profile exists and user has access
    const existingProfile = await memoryDatabase.getAdultProfileById(profileId);
    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (existingProfile.userId !== authResult.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update profile with proper typing
    const updateData: any = {};
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key as keyof typeof validatedData] !== undefined) {
        updateData[key] = validatedData[key as keyof typeof validatedData];
      }
    });

    const updatedProfile = await memoryDatabase.updateAdultProfile(profileId, updateData);
    if (!updatedProfile) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Calculate age if dateOfBirth exists
    let age = 0;
    if (updatedProfile.dateOfBirth) {
      age = calculateAge(updatedProfile.dateOfBirth);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedProfile,
        age
      }
    });
  } catch (error) {
    console.error('Failed to update adult profile:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update adult profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const profileId = id;

    // Check if profile exists and user has access
    const existingProfile = await memoryDatabase.getAdultProfileById(profileId);
    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (existingProfile.userId !== authResult.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const deleted = await memoryDatabase.deleteAdultProfile(profileId);
    if (!deleted) {
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete adult profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete adult profile' },
      { status: 500 }
    );
  }
}
