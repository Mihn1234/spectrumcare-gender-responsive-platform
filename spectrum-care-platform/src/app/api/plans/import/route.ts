import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

const planImportSchema = z.object({
  planText: z.string().min(1, 'Plan text is required'),
  planType: z.enum(['ehc', 'iep', 'support_plan']),
  childId: z.string().optional(),
  source: z.string().optional(),
  fileName: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const plans = await memoryDatabase.getImportedPlansByUserId(userId);

    return NextResponse.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Failed to fetch imported plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch imported plans' },
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
    const validatedData = planImportSchema.parse(body);

    const userId = authResult.user.id;

    // Simulate AI analysis
    const analysisResults = {
      quality: Math.floor(Math.random() * 20) + 80, // 80-100%
      compliance: Math.floor(Math.random() * 15) + 85, // 85-100%
      completeness: Math.floor(Math.random() * 10) + 90, // 90-100%
      recommendations: [
        'Consider adding more specific sensory support strategies',
        'Ensure transition planning includes post-16 options',
        'Include parent/carer training recommendations'
      ],
      extractedSections: {
        personalDetails: 'Extracted personal information',
        needs: 'Identified support needs and interventions',
        outcomes: 'Educational and care outcomes specified',
        provision: 'Support services and provisions outlined'
      }
    };

    // Create imported plan
    const importedPlan = await memoryDatabase.createImportedPlan({
      userId,
      originalPlan: validatedData.planText,
      analysisResults,
      extractedData: analysisResults.extractedSections,
      planType: validatedData.planType,
      childId: validatedData.childId,
      source: validatedData.source || 'manual_upload',
      fileName: validatedData.fileName
    });

    return NextResponse.json({
      success: true,
      data: importedPlan,
      message: 'Plan imported and analyzed successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to import plan:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to import plan' },
      { status: 500 }
    );
  }
}
