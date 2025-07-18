import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

const documentCreateSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  childId: z.string().optional(),
  documentType: z.string().min(1, 'Document type is required'),
  fileSize: z.number().optional(),
  description: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const documents = await memoryDatabase.getDocumentsByUserId(userId);

    return NextResponse.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
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
    const validatedData = documentCreateSchema.parse(body);

    const userId = authResult.user.id;

    // Check child access if childId is provided
    if (validatedData.childId) {
      const hasAccess = await memoryDatabase.hasChildAccess(userId, validatedData.childId);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Child not found or access denied' }, { status: 403 });
      }
    }

    const document = await memoryDatabase.createDocument({
      uploadedBy: userId,
      fileName: validatedData.fileName,
      fileType: validatedData.fileType,
      childId: validatedData.childId,
      documentType: validatedData.documentType,
      fileSize: validatedData.fileSize, // Now valid after interface update
      description: validatedData.description, // Now valid after interface update
      hasAiAnalysis: false // Will be updated when AI analysis is complete
    });

    return NextResponse.json({
      success: true,
      data: document
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create document:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
