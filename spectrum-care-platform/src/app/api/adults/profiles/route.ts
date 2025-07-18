import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

// Validation schema for adult profile creation
const adultProfileCreateSchema = z.object({
  dateOfBirth: z.string(),
  employmentStatus: z.enum(['employed', 'unemployed', 'student', 'retired', 'supported_employment']),
  livingSituation: z.enum(['independent', 'supported', 'family_home', 'care_facility', 'sheltered_housing']),
  independenceLevel: z.enum(['high', 'moderate', 'low', 'requires_support']),
  communicationPreferences: z.object({
    preferredMethod: z.string(),
    accessibilityNeeds: z.array(z.string()),
    languagePreferences: z.array(z.string())
  }),
  supportNeeds: z.object({
    dailyLiving: z.array(z.string()),
    social: z.array(z.string()),
    vocational: z.array(z.string()),
    mental_health: z.array(z.string())
  }),
  goals: z.array(z.object({
    category: z.string(),
    description: z.string(),
    targetDate: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    progress: z.number()
  })),
  financialSupport: z.object({
    personalBudget: z.number(),
    directPayments: z.boolean(),
    benefitsReceived: z.array(z.string()),
    employmentSupport: z.boolean()
  })
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

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const profiles = await memoryDatabase.getAdultProfilesByUserId(userId);

    const profilesWithAge = profiles.map((profile: any) => {
      const age = calculateAge(profile.dateOfBirth);
      return {
        ...profile,
        age
      };
    });

    return NextResponse.json({
      success: true,
      data: profilesWithAge
    });

  } catch (error) {
    console.error('Failed to fetch adult profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch adult profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = adultProfileCreateSchema.parse(body);

    const userId = authResult.user.id;
    const profile = await memoryDatabase.createAdultProfile({
      userId,
      ...validatedData,
      personalInfo: {}, // Add required personalInfo field
      diagnosis: {}, // Add required diagnosis field
      services: {} // Add required services field
    });

    const age = calculateAge(profile.dateOfBirth);

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        age
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create adult profile:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create adult profile' },
      { status: 500 }
    );
  }
}
