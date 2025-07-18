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

    if (!user || !['LA_OFFICER', 'LA_MANAGER', 'LA_EXECUTIVE'].includes(user.role)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const priority = url.searchParams.get('priority') || 'all';
    const assignedTo = url.searchParams.get('assignedTo') || 'all';
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build where clause
    let whereConditions = ['ec.tenant_id = $1'];
    const queryParams: any[] = [user.tenant_id];
    let paramCount = 1;

    // Search filter
    if (search) {
      paramCount++;
      whereConditions.push(`(
        ec.case_number ILIKE $${paramCount} OR
        CONCAT(c.first_name, ' ', c.last_name) ILIKE $${paramCount} OR
        s.school_name ILIKE $${paramCount} OR
        CONCAT(cw.first_name, ' ', cw.last_name) ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    // Status filter
    if (status !== 'all') {
      paramCount++;
      whereConditions.push(`ec.status = $${paramCount}`);
      queryParams.push(status);
    }

    // Priority filter
    if (priority !== 'all') {
      paramCount++;
      whereConditions.push(`ec.priority = $${paramCount}`);
      queryParams.push(priority);
    }

    // Assigned to filter
    if (assignedTo !== 'all') {
      paramCount++;
      whereConditions.push(`ec.assigned_caseworker_id = $${paramCount}`);
      queryParams.push(assignedTo);
    }

    // Exclude closed and cancelled cases by default
    whereConditions.push(`ec.status NOT IN ('CLOSED', 'CANCELLED')`);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Valid sort columns
    const validSortColumns = ['case_number', 'child_name', 'status', 'priority', 'statutory_deadline', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get cases with pagination
    const casesQuery = `
      SELECT
        ec.id,
        ec.case_number,
        ec.status,
        ec.priority,
        ec.case_type,
        ec.statutory_deadline,
        ec.actual_completion_date,
        ec.estimated_budget,
        ec.actual_cost,
        ec.created_at,
        ec.updated_at,
        c.first_name,
        c.last_name,
        c.date_of_birth,
        s.school_name,
        CONCAT(cw.first_name, ' ', cw.last_name) as assigned_caseworker,
        cw.email as caseworker_email,
        CASE
          WHEN ec.statutory_deadline IS NOT NULL
          THEN EXTRACT(days FROM ec.statutory_deadline - CURRENT_DATE)
          ELSE NULL
        END as days_remaining,
        CASE
          WHEN ec.status = 'FINAL' AND ec.actual_completion_date IS NOT NULL THEN 100
          WHEN ec.status = 'REVIEW' THEN 90
          WHEN ec.status = 'DRAFT' THEN 75
          WHEN ec.status = 'ASSESSMENT' THEN 40
          WHEN ec.status = 'PENDING' THEN 10
          ELSE 0
        END as completion_percentage,
        (
          SELECT COUNT(*)
          FROM case_updates cu
          WHERE cu.case_id = ec.id
            AND cu.is_active = true
            AND cu.created_at >= CURRENT_DATE - INTERVAL '7 days'
        ) as recent_updates_count,
        COUNT(*) OVER() as total_count
      FROM ehc_cases ec
      JOIN children c ON ec.child_id = c.id
      LEFT JOIN schools s ON c.school_id = s.id
      LEFT JOIN users cw ON ec.assigned_caseworker_id = cw.id
      ${whereClause}
      ORDER BY ${sortColumn === 'child_name' ? 'c.first_name, c.last_name' : `ec.${sortColumn}`} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(casesQuery, queryParams);

    const cases = result.rows.map(row => ({
      id: row.id,
      caseNumber: row.case_number,
      childName: `${row.first_name} ${row.last_name}`,
      childAge: Math.floor((Date.now() - new Date(row.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
      status: row.status,
      priority: row.priority,
      caseType: row.case_type,
      assignedCaseworker: row.assigned_caseworker || 'Unassigned',
      caseworkerEmail: row.caseworker_email,
      nextDeadline: row.statutory_deadline,
      daysRemaining: row.days_remaining ? parseInt(row.days_remaining) : null,
      school: row.school_name || 'Not assigned',
      lastUpdate: row.updated_at,
      completionPercentage: parseInt(row.completion_percentage),
      estimatedBudget: parseFloat(row.estimated_budget) || 0,
      actualCost: parseFloat(row.actual_cost) || 0,
      recentUpdatesCount: parseInt(row.recent_updates_count),
      createdAt: row.created_at
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: cases,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching LA Officer cases:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch cases'
    }, { status: 500 });
  }
}

// POST - Create new case
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

    if (!user || !['LA_OFFICER', 'LA_MANAGER'].includes(user.role)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      childId,
      caseType = 'INITIAL',
      priority = 'MEDIUM',
      assignedCaseworkerId,
      estimatedBudget,
      notes
    } = body;

    // Validate required fields
    if (!childId) {
      return NextResponse.json({
        success: false,
        message: 'Child ID is required'
      }, { status: 400 });
    }

    // Verify child exists and belongs to tenant
    const childCheck = await db.query(`
      SELECT id FROM children
      WHERE id = $1 AND tenant_id = $2
    `, [childId, user.tenant_id]);

    if (childCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Child not found'
      }, { status: 404 });
    }

    // Generate case number
    const year = new Date().getFullYear();
    const caseCountResult = await db.query(`
      SELECT COUNT(*) as count
      FROM ehc_cases
      WHERE tenant_id = $1
        AND EXTRACT(year FROM created_at) = $2
    `, [user.tenant_id, year]);

    const caseCount = parseInt(caseCountResult.rows[0].count) + 1;
    const caseNumber = `EHC-${year}-${String(caseCount).padStart(3, '0')}`;

    // Calculate statutory deadline (20 weeks from today)
    const statutoryDeadline = new Date();
    statutoryDeadline.setDate(statutoryDeadline.getDate() + (20 * 7));

    // Create case
    const result = await db.query(`
      INSERT INTO ehc_cases (
        case_number, child_id, tenant_id, status, case_type, priority,
        assigned_officer_id, assigned_caseworker_id, statutory_deadline,
        estimated_budget, created_at, updated_at
      ) VALUES ($1, $2, $3, 'PENDING', $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id
    `, [
      caseNumber,
      childId,
      user.tenant_id,
      caseType,
      priority,
      user.id,
      assignedCaseworkerId || null,
      statutoryDeadline,
      estimatedBudget || null
    ]);

    const caseId = result.rows[0].id;

    // Create initial case update
    await db.query(`
      INSERT INTO case_updates (
        case_id, title, description, update_type, created_by_id, created_at, updated_at
      ) VALUES ($1, $2, $3, 'STATUS_CHANGE', $4, NOW(), NOW())
    `, [
      caseId,
      'Case Initiated',
      notes || `EHC needs assessment case initiated by ${user.first_name} ${user.last_name}`,
      user.id
    ]);

    // Send notification to assigned caseworker
    if (assignedCaseworkerId) {
      await db.query(`
        INSERT INTO notifications (
          user_id, title, message, notification_type, related_id, created_at
        ) VALUES ($1, $2, $3, 'CASE_ASSIGNMENT', $4, NOW())
      `, [
        assignedCaseworkerId,
        'New Case Assignment',
        `You have been assigned to case ${caseNumber}`,
        caseId
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      data: {
        caseId,
        caseNumber
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create case'
    }, { status: 500 });
  }
}

// PUT - Update case
export async function PUT(request: NextRequest) {
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

    if (!user || !['LA_OFFICER', 'LA_MANAGER', 'LA_CASEWORKER'].includes(user.role)) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      caseId,
      status,
      priority,
      assignedCaseworkerId,
      estimatedBudget,
      actualCost,
      notes
    } = body;

    // Validate required fields
    if (!caseId) {
      return NextResponse.json({
        success: false,
        message: 'Case ID is required'
      }, { status: 400 });
    }

    // Verify case exists and user has access
    const caseCheck = await db.query(`
      SELECT id, status as current_status, assigned_caseworker_id
      FROM ehc_cases
      WHERE id = $1 AND tenant_id = $2
    `, [caseId, user.tenant_id]);

    if (caseCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Case not found'
      }, { status: 404 });
    }

    const currentCase = caseCheck.rows[0];

    // Build update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (status && status !== currentCase.current_status) {
      updates.push(`status = $${paramCounter}`);
      values.push(status);
      paramCounter++;

      // Set completion date if status is FINAL
      if (status === 'FINAL') {
        updates.push(`actual_completion_date = CURRENT_DATE`);
      }
    }

    if (priority) {
      updates.push(`priority = $${paramCounter}`);
      values.push(priority);
      paramCounter++;
    }

    if (assignedCaseworkerId !== undefined) {
      updates.push(`assigned_caseworker_id = $${paramCounter}`);
      values.push(assignedCaseworkerId);
      paramCounter++;
    }

    if (estimatedBudget !== undefined) {
      updates.push(`estimated_budget = $${paramCounter}`);
      values.push(estimatedBudget);
      paramCounter++;
    }

    if (actualCost !== undefined) {
      updates.push(`actual_cost = $${paramCounter}`);
      values.push(actualCost);
      paramCounter++;
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No updates provided'
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(caseId);

    // Update case
    await db.query(`
      UPDATE ehc_cases
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
    `, values);

    // Create case update log
    if (notes || status) {
      let updateTitle = 'Case Updated';
      let updateDescription = notes || '';

      if (status) {
        updateTitle = 'Status Changed';
        updateDescription = `Case status changed to ${status}. ${notes || ''}`.trim();
      }

      await db.query(`
        INSERT INTO case_updates (
          case_id, title, description, update_type, created_by_id, created_at, updated_at
        ) VALUES ($1, $2, $3, 'STATUS_CHANGE', $4, NOW(), NOW())
      `, [caseId, updateTitle, updateDescription, user.id]);
    }

    // Send notifications for status changes or reassignments
    if (status && status !== currentCase.current_status) {
      // Notify assigned caseworker
      if (currentCase.assigned_caseworker_id) {
        await db.query(`
          INSERT INTO notifications (
            user_id, title, message, notification_type, related_id, created_at
          ) VALUES ($1, $2, $3, 'CASE_UPDATE', $4, NOW())
        `, [
          currentCase.assigned_caseworker_id,
          'Case Status Updated',
          `Case status has been changed to ${status}`,
          caseId
        ]);
      }
    }

    if (assignedCaseworkerId && assignedCaseworkerId !== currentCase.assigned_caseworker_id) {
      // Notify new caseworker
      if (assignedCaseworkerId) {
        await db.query(`
          INSERT INTO notifications (
            user_id, title, message, notification_type, related_id, created_at
          ) VALUES ($1, $2, $3, 'CASE_ASSIGNMENT', $4, NOW())
        `, [
          assignedCaseworkerId,
          'Case Reassigned',
          `You have been assigned to a case`,
          caseId
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Case updated successfully'
    });

  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update case'
    }, { status: 500 });
  }
}
