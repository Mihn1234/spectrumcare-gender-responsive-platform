import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

// Validation schema for assessment creation
const assessmentCreateSchema = z.object({
  childId: z.string(),
  professionalId: z.string(),
  assessmentType: z.string(),
  scheduledDate: z.string(),
  durationMinutes: z.number(),
  location: z.string(),
  notes: z.string().optional(),
  fundingSource: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const assessments = await memoryDatabase.getAssessmentsByUserId(userId);

    const enrichedAssessments = await Promise.all(
      assessments.map(async (assessment: any) => {
        const child = await memoryDatabase.getChildById(assessment.childId);
        const professional = await memoryDatabase.getProfessionalById(assessment.professionalId);

        return {
          id: assessment.id,
          childId: assessment.childId,
          childName: child ? `${child.firstName} ${child.lastName}` : 'Unknown Child',
          professionalId: assessment.professionalId,
          professionalName: professional ? `${professional.firstName || 'Unknown'} ${professional.lastName || 'Professional'}` : 'Unknown Professional',
          assessmentType: assessment.assessmentType || 'General Assessment',
          scheduledDate: assessment.scheduledDate,
          durationMinutes: assessment.durationMinutes || 60,
          location: assessment.location || 'TBD',
          status: assessment.status,
          cost: assessment.cost || 0,
          fundingSource: assessment.fundingSource || 'Private',
          notes: assessment.notes || '',
          createdAt: assessment.createdAt
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedAssessments
    });

  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
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
    const validatedData = assessmentCreateSchema.parse(body);

    // Verify the user has access to the child
    const child = await memoryDatabase.getChildById(validatedData.childId);
    if (!child || child.parentUserId !== authResult.user.id) {
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 404 });
    }

    // Verify the professional exists
    const professional = await memoryDatabase.getProfessionalById(validatedData.professionalId);
    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    // Calculate cost (using default rate if professional doesn't have hourlyRate)
    const hourlyRate = (professional as any).hourlyRate || 100; // Default rate
    const cost = hourlyRate * (validatedData.durationMinutes / 60);

    // Create the assessment
    const assessment = await memoryDatabase.createAssessment({
      childId: validatedData.childId,
      professionalId: validatedData.professionalId,
      assessmentType: validatedData.assessmentType,
      scheduledDate: validatedData.scheduledDate,
      location: validatedData.location,
      cost,
      fundingSource: validatedData.fundingSource || 'Private',
      notes: validatedData.notes || '',
      status: 'scheduled',
      type: validatedData.assessmentType, // Add required type field
      durationMinutes: validatedData.durationMinutes // Now valid after interface update
    });

    // Return enriched assessment data
    const enrichedAssessment = {
      id: assessment.id,
      childId: assessment.childId,
      childName: `${child.firstName} ${child.lastName}`,
      professionalId: assessment.professionalId,
      professionalName: `${(professional as any).firstName || 'Unknown'} ${(professional as any).lastName || 'Professional'}`,
      assessmentType: (assessment as any).assessmentType,
      scheduledDate: assessment.scheduledDate,
      durationMinutes: (assessment as any).durationMinutes,
      location: (assessment as any).location,
      status: assessment.status,
      cost: (assessment as any).cost,
      fundingSource: (assessment as any).fundingSource,
      notes: (assessment as any).notes,
      createdAt: assessment.createdAt
    };

    return NextResponse.json({
      success: true,
      data: enrichedAssessment
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create assessment:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}
