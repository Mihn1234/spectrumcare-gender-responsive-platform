import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.userId);

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    // Get children for this parent
    const result = await db.query(`
      SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.date_of_birth,
        c.nhs_number,
        c.upn,
        c.created_at,
        c.updated_at,
        s.school_name,
        ec.status as ehc_status,
        ec.case_number,
        ec.statutory_deadline as next_review,
        ec.estimated_budget,
        ec.actual_cost,
        CONCAT(kw.first_name, ' ', kw.last_name) as key_worker_name,
        (
          SELECT MAX(created_at)
          FROM assessments a
          WHERE a.child_id = c.id
        ) as last_assessment_date
      FROM children c
      LEFT JOIN family_relationships fr ON c.id = fr.child_id
      LEFT JOIN schools s ON c.school_id = s.id
      LEFT JOIN ehc_cases ec ON c.id = ec.child_id AND ec.status NOT IN ('CLOSED', 'CANCELLED')
      LEFT JOIN users kw ON ec.assigned_caseworker_id = kw.id
      WHERE fr.parent_user_id = $1
        AND c.is_active = true
      ORDER BY c.first_name, c.last_name
    `, [user.id]);

    const children = result.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth,
      school: row.school_name || 'Not assigned',
      ehcStatus: row.ehc_status || 'PENDING',
      caseNumber: row.case_number,
      nextReview: row.next_review,
      keyWorker: row.key_worker_name || 'Not assigned',
      lastAssessment: row.last_assessment_date,
      estimatedBudget: row.estimated_budget,
      actualCost: row.actual_cost || 0,
      nhsNumber: row.nhs_number,
      upn: row.upn
    }));

    return NextResponse.json({
      success: true,
      data: children
    });

  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch children data'
    }, { status: 500 });
  }
}

// POST - Add new child
export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.userId);

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, dateOfBirth, nhsNumber, upn, schoolId } = body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth) {
      return NextResponse.json({
        success: false,
        message: 'First name, last name, and date of birth are required'
      }, { status: 400 });
    }

    // Create child record
    const childResult = await db.query(`
      INSERT INTO children (
        first_name, last_name, date_of_birth, nhs_number, upn,
        school_id, tenant_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `, [
      firstName,
      lastName,
      dateOfBirth,
      nhsNumber || null,
      upn || null,
      schoolId || null,
      user.tenant_id
    ]);

    const childId = childResult.rows[0].id;

    // Create family relationship
    await db.query(`
      INSERT INTO family_relationships (
        parent_user_id, child_id, relationship_type, created_at
      ) VALUES ($1, $2, 'PARENT', NOW())
    `, [user.id, childId]);

    return NextResponse.json({
      success: true,
      message: 'Child added successfully',
      childId
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding child:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add child'
    }, { status: 500 });
  }
}
