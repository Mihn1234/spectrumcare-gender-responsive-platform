import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

const childCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  needs: z.array(z.string()).optional().default([]),
  diagnosis: z.string().optional(),
  schoolName: z.string().optional(),
  yearGroup: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const children = await memoryDatabase.getChildrenByParentId(userId);

    return NextResponse.json({
      success: true,
      data: children
    });

  } catch (error) {
    console.error('Failed to fetch children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
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
    const validatedData = childCreateSchema.parse(body);

    const userId = authResult.user.id;
    const child = await memoryDatabase.createChild({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      dateOfBirth: validatedData.dateOfBirth,
      parentUserId: userId,
      needs: validatedData.needs,
      diagnosis: validatedData.diagnosis,
      schoolName: validatedData.schoolName,
      yearGroup: validatedData.yearGroup
    });

    return NextResponse.json({
      success: true,
      data: child
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create child:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create child' },
      { status: 500 }
    );
  }
}
