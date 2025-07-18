import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

// Validation schema for review creation
const reviewCreateSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  reviewType: z.enum(['annual', 'emergency', 'transition', 'amendment']),
  scheduledDate: z.string().datetime('Invalid scheduled date'),
  participants: z.array(z.object({
    name: z.string(),
    role: z.string(),
    email: z.string().email().optional()
  })),
  agenda: z.array(z.string()).optional(),
  notes: z.string().optional()
});

// Validation schema for review updates
const reviewUpdateSchema = z.object({
  reviewStatus: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  outcomes: z.object({
    decisionsReached: z.array(z.string()).optional(),
    actionItems: z.array(z.object({
      task: z.string(),
      assignedTo: z.string(),
      dueDate: z.string().optional()
    })).optional(),
    nextReviewDate: z.string().datetime().optional()
  }).optional(),
  attendanceNotes: z.string().optional(),
  meetingNotes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const planId = searchParams.get('planId');

    let reviews;

    if (type === 'upcoming') {
      reviews = await memoryDatabase.getUpcomingReviews();
    } else if (type === 'overdue') {
      reviews = await memoryDatabase.getOverdueReviews();
    } else if (planId) {
      reviews = await memoryDatabase.getReviewsByPlanId(planId);
    } else {
      reviews = await memoryDatabase.getUpcomingReviews();
    }

    return NextResponse.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
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
    const validatedData = reviewCreateSchema.parse(body);

    const review = await memoryDatabase.createReview({
      planId: validatedData.planId,
      reviewType: validatedData.reviewType,
      scheduledDate: validatedData.scheduledDate,
      participants: validatedData.participants,
      reviewStatus: 'scheduled'
    });

    return NextResponse.json({
      success: true,
      data: review
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = reviewUpdateSchema.parse(body);

    const result = await memoryDatabase.updateReview(reviewId, validatedData);

    if (!result) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Failed to update review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
