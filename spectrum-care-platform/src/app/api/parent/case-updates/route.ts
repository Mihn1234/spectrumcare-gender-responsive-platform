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

    // Get query parameters
    const url = new URL(request.url);
    const childId = url.searchParams.get('childId');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build query conditions
    let whereClause = `
      WHERE fr.parent_user_id = $1
        AND cu.is_active = true
    `;
    const queryParams = [user.id];

    if (childId) {
      whereClause += ` AND c.id = $${queryParams.length + 1}`;
      queryParams.push(childId);
    }

    // Get case updates
    const result = await db.query(`
      SELECT
        cu.id,
        cu.title,
        cu.description,
        cu.update_type,
        cu.priority,
        cu.created_at,
        cu.updated_at,
        c.first_name,
        c.last_name,
        ec.case_number,
        ec.status as case_status,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        u.role as created_by_role,
        COUNT(*) OVER() as total_count
      FROM case_updates cu
      JOIN ehc_cases ec ON cu.case_id = ec.id
      JOIN children c ON ec.child_id = c.id
      JOIN family_relationships fr ON c.id = fr.child_id
      LEFT JOIN users u ON cu.created_by_id = u.id
      ${whereClause}
      ORDER BY cu.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `, [...queryParams, limit, offset]);

    const caseUpdates = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.update_type,
      priority: row.priority,
      date: row.created_at,
      childName: `${row.first_name} ${row.last_name}`,
      caseNumber: row.case_number,
      caseStatus: row.case_status,
      createdBy: row.created_by_name,
      createdByRole: row.created_by_role
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: caseUpdates,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching case updates:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch case updates'
    }, { status: 500 });
  }
}

// POST - Add case update/comment from parent
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
    const { caseId, title, description, priority = 'MEDIUM' } = body;

    // Validate required fields
    if (!caseId || !title || !description) {
      return NextResponse.json({
        success: false,
        message: 'Case ID, title, and description are required'
      }, { status: 400 });
    }

    // Verify parent has access to this case
    const accessCheck = await db.query(`
      SELECT ec.id
      FROM ehc_cases ec
      JOIN children c ON ec.child_id = c.id
      JOIN family_relationships fr ON c.id = fr.child_id
      WHERE ec.id = $1 AND fr.parent_user_id = $2
    `, [caseId, user.id]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Case not found or access denied'
      }, { status: 404 });
    }

    // Create case update
    const result = await db.query(`
      INSERT INTO case_updates (
        case_id, title, description, update_type, priority,
        created_by_id, created_at, updated_at
      ) VALUES ($1, $2, $3, 'PARENT_COMMENT', $4, $5, NOW(), NOW())
      RETURNING id
    `, [caseId, title, description, priority, user.id]);

    return NextResponse.json({
      success: true,
      message: 'Case update added successfully',
      updateId: result.rows[0].id
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding case update:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add case update'
    }, { status: 500 });
  }
}
