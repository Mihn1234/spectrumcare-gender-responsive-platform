import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

const whiteLabelUpdateSchema = z.object({
  brandingEnabled: z.boolean().optional(),
  companyName: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  customDomain: z.string().optional(),
  contactEmail: z.string().email().optional(),
  customTerms: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only professionals can access white label settings
    if (authResult.user.role !== 'professional') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const userId = authResult.user.id;
    const professional = await memoryDatabase.getProfessionalByUserId(userId);

    if (!professional) {
      return NextResponse.json({ error: 'Professional profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: professional.whiteLabel || {}
    });

  } catch (error) {
    console.error('Failed to fetch white label settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch white label settings' },
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

    // Only professionals can update white label settings
    if (authResult.user.role !== 'professional') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = whiteLabelUpdateSchema.parse(body);

    const userId = authResult.user.id;
    const updatedProfessional = await memoryDatabase.updateProfessionalWhiteLabel(userId, validatedData);

    if (!updatedProfessional) {
      return NextResponse.json({ error: 'Professional profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedProfessional.whiteLabel,
      message: 'White label settings updated successfully'
    });

  } catch (error) {
    console.error('Failed to update white label settings:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update white label settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only professionals can update white label settings
    if (authResult.user.role !== 'professional') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = whiteLabelUpdateSchema.parse(body);

    const userId = authResult.user.id;
    const updatedProfessional = await memoryDatabase.updateProfessionalWhiteLabel(userId, validatedData);

    if (!updatedProfessional) {
      return NextResponse.json({ error: 'Professional profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedProfessional.whiteLabel,
      message: 'White label settings updated successfully'
    });

  } catch (error) {
    console.error('Failed to update white label settings:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update white label settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only professionals can delete white label settings
    if (authResult.user.role !== 'professional') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const userId = authResult.user.id;
    const updatedProfessional = await memoryDatabase.updateProfessionalWhiteLabel(userId, {
      brandingEnabled: false,
      companyName: '',
      logoUrl: '',
      primaryColor: '',
      secondaryColor: '',
      customDomain: '',
      contactEmail: '',
      customTerms: ''
    });

    if (!updatedProfessional) {
      return NextResponse.json({ error: 'Professional profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'White label settings reset successfully'
    });

  } catch (error) {
    console.error('Failed to reset white label settings:', error);
    return NextResponse.json(
      { error: 'Failed to reset white label settings' },
      { status: 500 }
    );
  }
}
