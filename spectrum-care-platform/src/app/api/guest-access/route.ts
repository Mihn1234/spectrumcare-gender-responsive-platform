import { NextRequest, NextResponse } from 'next/server';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schema for guest access creation
const guestAccessSchema = z.object({
  professionalEmail: z.string().email('Invalid email format'),
  childId: z.string().min(1, 'Child ID is required'),
  accessLevel: z.enum(['read', 'write', 'admin']),
  expiresAt: z.string().datetime('Invalid expiration date'),
  purpose: z.string().min(1, 'Purpose is required'),
  restrictions: z.array(z.string()).optional()
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only LA officers and admins can view guest access records
    if (authResult.user.role !== 'la_officer' && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const childId = searchParams.get('childId');

    // Get guest access records from memory database
    const guestAccessRecords = await memoryDatabase.getGuestAccessRecords({
      status,
      childId
    });

    // Enrich records with additional information
    const enrichedRecords = guestAccessRecords.map((record: any) => ({
      ...record,
      isActive: new Date(record.expiresAt) > new Date() && record.status === 'active',
      isExpired: new Date(record.expiresAt) <= new Date(),
      daysleft: Math.ceil((new Date(record.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Generate summary statistics
    const summary = {
      total: enrichedRecords.length,
      active: enrichedRecords.filter((r: any) => r.isActive).length,
      expired: enrichedRecords.filter((r: any) => r.isExpired).length,
      unused: enrichedRecords.filter((r: any) => !r.usedAt).length
    };

    return NextResponse.json({
      success: true,
      data: {
        records: enrichedRecords,
        summary
      }
    });

  } catch (error) {
    console.error('Failed to fetch guest access records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest access records' },
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

    // Only LA officers and admins can create guest access
    if (authResult.user.role !== 'la_officer' && authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = guestAccessSchema.parse(body);

    // Create guest access record
    const guestAccess = await memoryDatabase.createGuestAccess({
      ...validatedData,
      createdBy: authResult.user.id,
      invitedBy: authResult.user.id,
      guestEmail: validatedData.professionalEmail,
      permissions: [validatedData.accessLevel],
      status: 'pending',
      accessToken: generateAccessToken()
    });

    // Send invitation email (simulated)
    await sendGuestAccessInvitation({
      ...guestAccess // This already includes professionalEmail, so no need to duplicate it
    });

    return NextResponse.json({
      success: true,
      data: guestAccess,
      message: 'Guest access created and invitation sent'
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create guest access:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create guest access' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateAccessToken(): string {
  return 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function sendGuestAccessInvitation(guestAccess: {
  professionalEmail: string;
  [key: string]: unknown;
}): Promise<void> {
  // Simulate sending invitation email
  console.log(`Guest access invitation sent to ${guestAccess.professionalEmail}`);
  return Promise.resolve();
}
