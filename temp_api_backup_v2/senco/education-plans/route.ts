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

    if (!user || user.role !== 'SCHOOL_SENCO') {
      return NextResponse.json({
        success: false,
        message: 'SENCO access required'
      }, { status: 403 });
    }

    // Get user's school ID
    const schoolResult = await db.query(`
      SELECT id FROM schools WHERE senco_email = $1 OR tenant_id = $2 LIMIT 1
    `, [user.email, user.tenant_id]);

    if (schoolResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'School association not found'
      }, { status: 404 });
    }

    const schoolId = schoolResult.rows[0].id;

    // Get query parameters
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const planType = url.searchParams.get('planType') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const reviewDue = url.searchParams.get('reviewDue'); // 'overdue', 'this_month', 'next_month'
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'next_review_date';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build where clause
    let whereConditions = ['ss.school_id = $1'];
    const queryParams: any[] = [schoolId];
    let paramCount = 1;

    // Student filter
    if (studentId) {
      paramCount++;
      whereConditions.push(`ep.student_id = $${paramCount}`);
      queryParams.push(studentId);
    }

    // Plan type filter
    if (planType !== 'all') {
      paramCount++;
      whereConditions.push(`ep.plan_type = $${paramCount}`);
      queryParams.push(planType);
    }

    // Status filter
    if (status !== 'all') {
      paramCount++;
      whereConditions.push(`ep.status = $${paramCount}`);
      queryParams.push(status);
    }

    // Review due filter
    if (reviewDue) {
      switch (reviewDue) {
        case 'overdue':
          whereConditions.push(`ep.next_review_date < CURRENT_DATE`);
          break;
        case 'this_month':
          whereConditions.push(`ep.next_review_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`);
          break;
        case 'next_month':
          whereConditions.push(`ep.next_review_date BETWEEN CURRENT_DATE + INTERVAL '30 days' AND CURRENT_DATE + INTERVAL '60 days'`);
          break;
      }
    }

    // Search filter
    if (search) {
      paramCount++;
      whereConditions.push(`(
        CONCAT(ss.first_name, ' ', ss.last_name) ILIKE $${paramCount} OR
        ep.title ILIKE $${paramCount} OR
        ep.plan_number ILIKE $${paramCount} OR
        ss.student_id ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Valid sort columns
    const validSortColumns = ['next_review_date', 'start_date', 'created_at', 'student_name', 'plan_type'];
    const sortColumn = validSortColumns.includes(sortBy) ?
      (sortBy === 'student_name' ? 'ss.last_name' : `ep.${sortBy}`) : 'ep.next_review_date';
    const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Get education plans with student information and participants
    const plansQuery = `
      SELECT
        ep.id,
        ep.plan_type,
        ep.plan_number,
        ep.status,
        ep.title,
        ep.start_date,
        ep.end_date,
        ep.review_date,
        ep.next_review_date,
        ep.annual_review_due,
        ep.current_provision,
        ep.outcomes,
        ep.targets,
        ep.strategies,
        ep.resources_required,
        ep.staffing_requirements,
        ep.strengths,
        ep.difficulties,
        ep.barriers_to_learning,
        ep.student_views,
        ep.parent_views,
        ep.professional_views,
        ep.transition_planning,
        ep.review_notes,
        ep.parent_attendance,
        ep.student_attendance,
        ep.created_at,
        ep.updated_at,

        -- Student information
        ss.id as student_id,
        ss.student_id as student_number,
        ss.first_name,
        ss.last_name,
        ss.year_group,
        ss.class_name,
        ss.primary_need,
        ss.send_status,

        -- Calculate urgency for review
        CASE
          WHEN ep.next_review_date < CURRENT_DATE THEN 'OVERDUE'
          WHEN ep.next_review_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'URGENT'
          WHEN ep.next_review_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'DUE_SOON'
          ELSE 'FUTURE'
        END as review_urgency,

        (ep.next_review_date - CURRENT_DATE) as days_until_review,

        -- Progress summary
        COUNT(sp.id) as progress_entries_count,
        AVG(CASE
          WHEN sp.progress_rating = 'exceeded' THEN 4
          WHEN sp.progress_rating = 'met' THEN 3
          WHEN sp.progress_rating = 'progressing' THEN 2
          WHEN sp.progress_rating = 'concern' THEN 1
          ELSE 0
        END) as avg_progress_rating,

        COUNT(*) OVER() as total_count
      FROM education_plans ep
      JOIN senco_students ss ON ep.student_id = ss.id
      LEFT JOIN student_progress sp ON ss.id = sp.student_id
        AND sp.measurement_date >= CURRENT_DATE - INTERVAL '90 days'
        AND sp.plan_id = ep.id

      ${whereClause}
      GROUP BY ep.id, ss.id, ss.student_id, ss.first_name, ss.last_name,
               ss.year_group, ss.class_name, ss.primary_need, ss.send_status
      ORDER BY ${sortColumn} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(plansQuery, queryParams);

    // Get participants for each plan
    const planIds = result.rows.map(row => row.id);
    let participantsData = {};

    if (planIds.length > 0) {
      const participantsResult = await db.query(`
        SELECT
          plan_id,
          participant_type,
          name,
          role,
          email,
          organization,
          contribution,
          attendance_required,
          attended_review
        FROM plan_participants
        WHERE plan_id = ANY($1::uuid[])
        ORDER BY plan_id, participant_type, name
      `, [planIds]);

      participantsData = participantsResult.rows.reduce((acc, row) => {
        if (!acc[row.plan_id]) acc[row.plan_id] = [];
        acc[row.plan_id].push({
          type: row.participant_type,
          name: row.name,
          role: row.role,
          email: row.email,
          organization: row.organization,
          contribution: row.contribution,
          attendanceRequired: row.attendance_required,
          attendedReview: row.attended_review
        });
        return acc;
      }, {});
    }

    const plans = result.rows.map(row => ({
      id: row.id,
      planType: row.plan_type,
      planNumber: row.plan_number,
      status: row.status,
      title: row.title,
      startDate: row.start_date,
      endDate: row.end_date,
      reviewDate: row.review_date,
      nextReviewDate: row.next_review_date,
      annualReviewDue: row.annual_review_due,
      reviewUrgency: row.review_urgency,
      daysUntilReview: parseInt(row.days_until_review || '0'),

      // Student information
      student: {
        id: row.student_id,
        studentNumber: row.student_number,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: `${row.first_name} ${row.last_name}`,
        yearGroup: row.year_group,
        className: row.class_name,
        primaryNeed: row.primary_need,
        sendStatus: row.send_status
      },

      // Plan content
      currentProvision: row.current_provision,
      outcomes: row.outcomes ? JSON.parse(row.outcomes) : [],
      targets: row.targets ? JSON.parse(row.targets) : [],
      strategies: row.strategies ? JSON.parse(row.strategies) : [],
      resourcesRequired: row.resources_required || [],
      staffingRequirements: row.staffing_requirements ? JSON.parse(row.staffing_requirements) : {},

      // Assessment information
      strengths: row.strengths,
      difficulties: row.difficulties,
      barriersToLearning: row.barriers_to_learning,

      // Views and aspirations
      views: {
        student: row.student_views,
        parent: row.parent_views,
        professional: row.professional_views
      },

      // Planning
      transitionPlanning: row.transition_planning,

      // Review information
      review: {
        notes: row.review_notes,
        parentAttendance: row.parent_attendance,
        studentAttendance: row.student_attendance
      },

      // Progress summary
      progressSummary: {
        entriesCount: parseInt(row.progress_entries_count || '0'),
        avgRating: parseFloat(row.avg_progress_rating || '0')
      },

      // Participants
      participants: participantsData[row.id] || [],

      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: plans,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching education plans:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch education plans'
    }, { status: 500 });
  }
}

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

    if (!user || user.role !== 'SCHOOL_SENCO') {
      return NextResponse.json({
        success: false,
        message: 'SENCO access required'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      studentId,
      planType,
      planNumber,
      title,
      startDate,
      endDate,
      reviewDate,
      nextReviewDate,
      currentProvision,
      outcomes = [],
      targets = [],
      strategies = [],
      resourcesRequired = [],
      staffingRequirements = {},
      strengths,
      difficulties,
      barriersToLearning,
      studentViews,
      parentViews,
      professionalViews,
      transitionPlanning,
      participants = []
    } = body;

    // Validate required fields
    if (!studentId || !planType || !title || !startDate || !reviewDate) {
      return NextResponse.json({
        success: false,
        message: 'Student ID, plan type, title, start date, and review date are required'
      }, { status: 400 });
    }

    // Verify student exists and belongs to user's school
    const studentCheck = await db.query(`
      SELECT ss.id, s.id as school_id
      FROM senco_students ss
      JOIN schools s ON ss.school_id = s.id
      WHERE ss.id = $1 AND (s.senco_email = $2 OR s.tenant_id = $3)
    `, [studentId, user.email, user.tenant_id]);

    if (studentCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Student not found or access denied'
      }, { status: 404 });
    }

    // Calculate next review date if not provided
    const calculatedNextReviewDate = nextReviewDate || new Date(new Date(reviewDate).getTime() + 365 * 24 * 60 * 60 * 1000);

    // Create education plan
    const result = await db.query(`
      INSERT INTO education_plans (
        student_id, plan_type, plan_number, title, status, start_date, end_date,
        review_date, next_review_date, current_provision, outcomes, targets, strategies,
        resources_required, staffing_requirements, strengths, difficulties, barriers_to_learning,
        student_views, parent_views, professional_views, transition_planning,
        created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW()
      ) RETURNING id
    `, [
      studentId, planType, planNumber || null, title, startDate, endDate || null,
      reviewDate, calculatedNextReviewDate, currentProvision || null,
      JSON.stringify(outcomes), JSON.stringify(targets), JSON.stringify(strategies),
      JSON.stringify(resourcesRequired), JSON.stringify(staffingRequirements),
      strengths || null, difficulties || null, barriersToLearning || null,
      studentViews || null, parentViews || null, professionalViews || null,
      transitionPlanning || null, user.id
    ]);

    const planId = result.rows[0].id;

    // Add participants
    if (participants.length > 0) {
      const participantValues = participants.map(p =>
        `('${planId}', '${p.type}', '${p.name}', '${p.role || ''}', '${p.email || ''}', '${p.organization || ''}', '${p.contribution || ''}', ${p.attendanceRequired || false}, NOW())`
      ).join(', ');

      await db.query(`
        INSERT INTO plan_participants (
          plan_id, participant_type, name, role, email, organization, contribution, attendance_required, created_at
        ) VALUES ${participantValues}
      `);
    }

    return NextResponse.json({
      success: true,
      message: 'Education plan created successfully',
      data: {
        planId,
        planTitle: title
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating education plan:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create education plan'
    }, { status: 500 });
  }
}

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

    if (!user || user.role !== 'SCHOOL_SENCO') {
      return NextResponse.json({
        success: false,
        message: 'SENCO access required'
      }, { status: 403 });
    }

    const body = await request.json();
    const { planId, ...updateData } = body;

    if (!planId) {
      return NextResponse.json({
        success: false,
        message: 'Plan ID is required'
      }, { status: 400 });
    }

    // Verify plan exists and belongs to user's school
    const planCheck = await db.query(`
      SELECT ep.id
      FROM education_plans ep
      JOIN senco_students ss ON ep.student_id = ss.id
      JOIN schools s ON ss.school_id = s.id
      WHERE ep.id = $1 AND (s.senco_email = $2 OR s.tenant_id = $3)
    `, [planId, user.email, user.tenant_id]);

    if (planCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Education plan not found or access denied'
      }, { status: 404 });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'status', 'end_date', 'next_review_date', 'current_provision',
      'outcomes', 'targets', 'strategies', 'resources_required', 'staffing_requirements',
      'strengths', 'difficulties', 'barriers_to_learning', 'student_views',
      'parent_views', 'professional_views', 'transition_planning', 'review_notes',
      'parent_attendance', 'student_attendance'
    ];

    Object.entries(updateData).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`);

        // Handle JSON fields
        if (['outcomes', 'targets', 'strategies', 'resources_required', 'staffing_requirements'].includes(key)) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid fields to update'
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(planId);

    await db.query(`
      UPDATE education_plans
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values);

    // Update participants if provided
    if (updateData.participants) {
      // Delete existing participants
      await db.query(`DELETE FROM plan_participants WHERE plan_id = $1`, [planId]);

      // Add new participants
      if (updateData.participants.length > 0) {
        const participantValues = updateData.participants.map(p =>
          `('${planId}', '${p.type}', '${p.name}', '${p.role || ''}', '${p.email || ''}', '${p.organization || ''}', '${p.contribution || ''}', ${p.attendanceRequired || false}, NOW())`
        ).join(', ');

        await db.query(`
          INSERT INTO plan_participants (
            plan_id, participant_type, name, role, email, organization, contribution, attendance_required, created_at
          ) VALUES ${participantValues}
        `);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Education plan updated successfully'
    });

  } catch (error) {
    console.error('Error updating education plan:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update education plan'
    }, { status: 500 });
  }
}

// Schedule review or update review status
export async function PATCH(request: NextRequest) {
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

    if (!user || user.role !== 'SCHOOL_SENCO') {
      return NextResponse.json({
        success: false,
        message: 'SENCO access required'
      }, { status: 403 });
    }

    const body = await request.json();
    const { planId, action, reviewDate, nextReviewDate, reviewNotes, attendees } = body;

    if (!planId || !action) {
      return NextResponse.json({
        success: false,
        message: 'Plan ID and action are required'
      }, { status: 400 });
    }

    // Verify plan exists and belongs to user's school
    const planCheck = await db.query(`
      SELECT ep.id, ep.title, ss.first_name, ss.last_name
      FROM education_plans ep
      JOIN senco_students ss ON ep.student_id = ss.id
      JOIN schools s ON ss.school_id = s.id
      WHERE ep.id = $1 AND (s.senco_email = $2 OR s.tenant_id = $3)
    `, [planId, user.email, user.tenant_id]);

    if (planCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Education plan not found or access denied'
      }, { status: 404 });
    }

    const plan = planCheck.rows[0];

    switch (action) {
      case 'complete_review':
        // Mark review as completed and set next review date
        await db.query(`
          UPDATE education_plans
          SET
            review_date = $1,
            next_review_date = $2,
            review_notes = $3,
            parent_attendance = $4,
            student_attendance = $5,
            reviewed_by = $6,
            updated_at = NOW()
          WHERE id = $7
        `, [
          reviewDate || new Date(),
          nextReviewDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          reviewNotes || null,
          attendees?.parentAttended || false,
          attendees?.studentAttended || false,
          user.id,
          planId
        ]);

        // Update participant attendance
        if (attendees?.participants) {
          for (const participant of attendees.participants) {
            await db.query(`
              UPDATE plan_participants
              SET attended_review = $1
              WHERE plan_id = $2 AND name = $3
            `, [participant.attended, planId, participant.name]);
          }
        }

        break;

      case 'schedule_review':
        // Schedule next review
        await db.query(`
          UPDATE education_plans
          SET next_review_date = $1, updated_at = NOW()
          WHERE id = $2
        `, [nextReviewDate, planId]);

        break;

      case 'activate':
        // Activate plan
        await db.query(`
          UPDATE education_plans
          SET status = 'active', updated_at = NOW()
          WHERE id = $1
        `, [planId]);

        break;

      case 'complete':
        // Complete plan
        await db.query(`
          UPDATE education_plans
          SET status = 'completed', end_date = CURRENT_DATE, updated_at = NOW()
          WHERE id = $1
        `, [planId]);

        break;

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Plan ${action.replace('_', ' ')} completed successfully`,
      data: {
        planTitle: plan.title,
        studentName: `${plan.first_name} ${plan.last_name}`
      }
    });

  } catch (error) {
    console.error('Error updating plan review:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update plan review'
    }, { status: 500 });
  }
}
