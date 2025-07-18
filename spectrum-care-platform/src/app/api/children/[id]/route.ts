import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/database';
import { z } from 'zod';

// Validation schema for child updates
const updateChildSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().datetime().optional(),
  nhsNumber: z.string().optional(),
  localAuthority: z.string().optional(),
  schoolName: z.string().optional(),
  currentYearGroup: z.string().optional(),
  medicalConditions: z.array(z.object({
    condition: z.string(),
    diagnosedBy: z.string(),
    diagnosedDate: z.string().datetime(),
    severity: z.enum(['mild', 'moderate', 'severe']).optional(),
    notes: z.string().optional()
  })).optional(),
  currentNeeds: z.array(z.object({
    category: z.enum([
      'communication', 'social_emotional', 'sensory', 'behavioral',
      'academic', 'physical', 'medical', 'daily_living', 'independence'
    ]),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    identifiedBy: z.string().optional(),
    identifiedDate: z.string().datetime()
  })).optional(),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    email: z.string().email().optional()
  })).optional()
});

// Helper function to check if user has access to child
async function checkChildAccess(childId: string, userId: string): Promise<boolean> {
  try {
    return await withDatabase(async (client) => {
      const result = await client.query(`
        SELECT 1 FROM family_relationships
        WHERE child_id = $1 AND parent_user_id = $2
      `, [childId, userId]);

      return result.rows.length > 0;
    });
  } catch (error) {
    console.error('Error checking child access:', error);
    return false;
  }
}

// GET /api/children/[id] - Get specific child details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const childId = resolvedParams.id;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    // Check access
    const hasAccess = await checkChildAccess(childId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Child not found or access denied' },
        { status: 404 }
      );
    }

    const result = await withDatabase(async (client) => {
      // Get child details with related data
      const childResult = await client.query(`
        SELECT * FROM children WHERE id = $1
      `, [childId]);

      if (childResult.rows.length === 0) {
        return null;
      }

      const child = childResult.rows[0];

      // Get recent assessments
      const assessmentsResult = await client.query(`
        SELECT
          a.*,
          u.first_name || ' ' || u.last_name as professional_name
        FROM assessments a
        LEFT JOIN users u ON a.professional_id = u.id
        WHERE a.child_id = $1
        ORDER BY a.scheduled_date DESC
        LIMIT 10
      `, [childId]);

      // Get recent documents
      const documentsResult = await client.query(`
        SELECT
          d.*,
          u.first_name || ' ' || u.last_name as uploaded_by_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.child_id = $1
        ORDER BY d.created_at DESC
        LIMIT 10
      `, [childId]);

      // Get EHC plan if exists
      const ehcResult = await client.query(`
        SELECT * FROM ehc_plans WHERE child_id = $1 ORDER BY created_at DESC LIMIT 1
      `, [childId]);

      return {
        child,
        assessments: assessmentsResult.rows,
        documents: documentsResult.rows,
        ehcPlan: ehcResult.rows[0] || null
      };
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Child not found' },
        { status: 404 }
      );
    }

    const { child, assessments, documents, ehcPlan } = result;

    return NextResponse.json({
      success: true,
      data: {
        id: child.id,
        firstName: child.first_name,
        lastName: child.last_name,
        dateOfBirth: child.date_of_birth,
        nhsNumber: child.nhs_number,
        localAuthority: child.local_authority,
        schoolName: child.school_name,
        currentYearGroup: child.current_year_group,
        medicalConditions: child.medical_conditions || [],
        currentNeeds: child.current_needs || [],
        emergencyContacts: child.emergency_contacts || [],
        createdAt: child.created_at,
        updatedAt: child.updated_at,
        recentAssessments: assessments.map(assessment => ({
          id: assessment.id,
          type: assessment.assessment_type,
          professionalName: assessment.professional_name || 'Unknown',
          scheduledDate: assessment.scheduled_date,
          completedDate: assessment.completed_date,
          status: assessment.status
        })),
        recentDocuments: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          type: doc.document_type || doc.type || 'Document',
          uploadedBy: doc.uploaded_by_name || 'Unknown',
          uploadedDate: doc.created_at,
          fileSize: doc.file_size
        })),
        ehcPlan: ehcPlan ? {
          id: ehcPlan.id,
          planNumber: ehcPlan.plan_number,
          status: ehcPlan.status,
          localAuthority: ehcPlan.local_authority,
          reviewDate: ehcPlan.review_date
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching child details:', error);

    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { success: false, error: 'Database temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch child details' },
      { status: 500 }
    );
  }
}

// PUT /api/children/[id] - Update child profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const childId = resolvedParams.id;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    // Check access
    const hasAccess = await checkChildAccess(childId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Child not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateChildSchema.parse(body);

    const result = await withDatabase(async (client) => {
      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      Object.entries(validatedData).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = key === 'firstName' ? 'first_name' :
                         key === 'lastName' ? 'last_name' :
                         key === 'dateOfBirth' ? 'date_of_birth' :
                         key === 'nhsNumber' ? 'nhs_number' :
                         key === 'localAuthority' ? 'local_authority' :
                         key === 'schoolName' ? 'school_name' :
                         key === 'currentYearGroup' ? 'current_year_group' :
                         key === 'medicalConditions' ? 'medical_conditions' :
                         key === 'currentNeeds' ? 'current_needs' :
                         key === 'emergencyContacts' ? 'emergency_contacts' :
                         key;

          if (['medical_conditions', 'current_needs', 'emergency_contacts'].includes(dbField)) {
            updateFields.push(`${dbField} = $${paramIndex}`);
            updateValues.push(JSON.stringify(value));
          } else {
            updateFields.push(`${dbField} = $${paramIndex}`);
            updateValues.push(value);
          }
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      const updateQuery = `
        UPDATE children
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      updateValues.push(childId);

      const updateResult = await client.query(updateQuery, updateValues);
      return updateResult.rows[0];
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Child not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        firstName: result.first_name,
        lastName: result.last_name,
        dateOfBirth: result.date_of_birth,
        nhsNumber: result.nhs_number,
        localAuthority: result.local_authority,
        schoolName: result.school_name,
        currentYearGroup: result.current_year_group,
        medicalConditions: result.medical_conditions || [],
        currentNeeds: result.current_needs || [],
        emergencyContacts: result.emergency_contacts || [],
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }
    });

  } catch (error) {
    console.error('Error updating child:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues
        },
        { status: 400 }
      );
    }

    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { success: false, error: 'Database temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update child profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/children/[id] - Delete child profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const childId = resolvedParams.id;
    const userId = request.headers.get('x-user-id') || 'demo-user';

    // Check access
    const hasAccess = await checkChildAccess(childId, userId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Child not found or access denied' },
        { status: 404 }
      );
    }

    const result = await withDatabase(async (client) => {
      await client.query('BEGIN');

      try {
        // Note: Due to CASCADE constraints, deleting the child will also delete:
        // - family_relationships
        // - assessments
        // - documents
        // - ehc_plans
        // - appointments
        // This is a destructive operation that should be used carefully

        const deleteResult = await client.query(`
          DELETE FROM children WHERE id = $1 RETURNING id
        `, [childId]);

        if (deleteResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return null;
        }

        await client.query('COMMIT');
        return deleteResult.rows[0];
      } catch (dbError) {
        await client.query('ROLLBACK');
        throw dbError;
      }
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Child not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Child profile and all related data deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting child:', error);

    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { success: false, error: 'Database temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete child profile' },
      { status: 500 }
    );
  }
}
