import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/database';
import { z } from 'zod';

// Validation schema for plan queries
const PlanQuerySchema = z.object({
  childId: z.string().uuid().optional(),
  status: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  sortBy: z.enum(['created_at', 'updated_at', 'plan_number', 'status']).default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// GET - List EHC Plans
export async function GET(request: NextRequest) {
  try {
    // Authentication
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

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { childId, status, page, limit, sortBy, sortOrder } = PlanQuerySchema.parse(queryParams);

    const offset = (page - 1) * limit;

    // Build WHERE clause based on user role
    let whereClause = 'WHERE 1=1';
    const queryValues = [];
    let paramCount = 1;

    // Role-based access control
    if (user.role === 'PARENT') {
      whereClause += ` AND c.parent_id = $${paramCount}`;
      queryValues.push(user.id);
      paramCount++;
    } else if (user.role === 'PROFESSIONAL') {
      // Professionals can see plans they're involved with
      whereClause += ` AND (p.created_by = $${paramCount} OR p.shared_with ? $${paramCount}::text)`;
      queryValues.push(user.id);
      paramCount++;
    } else if (user.role === 'LA_OFFICER') {
      // LA officers can see plans from their authority
      whereClause += ` AND p.local_authority = $${paramCount}`;
      queryValues.push(user.local_authority || 'Unknown');
      paramCount++;
    }

    // Add filters
    if (childId) {
      whereClause += ` AND p.child_id = $${paramCount}`;
      queryValues.push(childId);
      paramCount++;
    }

    if (status) {
      whereClause += ` AND p.status = $${paramCount}`;
      queryValues.push(status);
      paramCount++;
    }

    // Main query to get plans
    const plansQuery = `
      SELECT
        p.id,
        p.plan_number,
        p.plan_title,
        p.status,
        p.urgency_level,
        p.completion_percentage,
        p.legal_compliance_score,
        p.ai_confidence_score,
        p.local_authority,
        p.annual_review_date,
        p.next_review_date,
        p.created_at,
        p.updated_at,
        p.finalised_at,
        p.submitted_at,

        -- Child information
        c.first_name as child_first_name,
        c.last_name as child_last_name,
        c.date_of_birth as child_dob,
        c.primary_diagnosis,

        -- Creator information
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name,
        u.role as created_by_role,

        -- Counts
        (SELECT COUNT(*) FROM ehc_plan_sections s WHERE s.plan_id = p.id) as sections_count,
        (SELECT COUNT(*) FROM ehc_plan_outcomes o WHERE o.plan_id = p.id) as outcomes_count,
        (SELECT COUNT(*) FROM ehc_plan_provision pr WHERE pr.plan_id = p.id) as provision_count,
        (SELECT COUNT(*) FROM ehc_plan_comments cm WHERE cm.plan_id = p.id AND cm.status = 'open') as open_comments_count,

        -- Progress indicators
        (SELECT COUNT(*) FROM ehc_plan_sections s WHERE s.plan_id = p.id AND s.status IN ('reviewed', 'approved')) as approved_sections,
        (SELECT COUNT(*) FROM ehc_plan_outcomes o WHERE o.plan_id = p.id AND o.achieved = true) as achieved_outcomes,

        -- Recent activity
        (SELECT MAX(activity_date) FROM (
          SELECT MAX(updated_at) as activity_date FROM ehc_plan_sections WHERE plan_id = p.id
          UNION ALL
          SELECT MAX(updated_at) as activity_date FROM ehc_plan_comments WHERE plan_id = p.id
          UNION ALL
          SELECT MAX(updated_at) as activity_date FROM ehc_plan_outcomes WHERE plan_id = p.id
        ) activities) as last_activity

      FROM ehc_plans p
      JOIN children c ON p.child_id = c.id
      JOIN users u ON p.created_by = u.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    queryValues.push(limit, offset);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ehc_plans p
      JOIN children c ON p.child_id = c.id
      ${whereClause}
    `;

    const [plansResult, countResult] = await Promise.all([
      db.query(plansQuery, queryValues),
      db.query(countQuery, queryValues.slice(0, -2)) // Remove limit and offset for count
    ]);

    const plans = plansResult.rows.map(row => ({
      id: row.id,
      planNumber: row.plan_number,
      planTitle: row.plan_title,
      status: row.status,
      urgencyLevel: row.urgency_level,
      completionPercentage: row.completion_percentage || 0,
      complianceScore: parseFloat(row.legal_compliance_score || '0') * 100,
      confidenceScore: parseFloat(row.ai_confidence_score || '0') * 100,
      localAuthority: row.local_authority,
      reviewDate: row.next_review_date,

      child: {
        firstName: row.child_first_name,
        lastName: row.child_last_name,
        dateOfBirth: row.child_dob,
        primaryDiagnosis: row.primary_diagnosis
      },

      createdBy: {
        firstName: row.created_by_first_name,
        lastName: row.created_by_last_name,
        role: row.created_by_role
      },

      stats: {
        sectionsCount: parseInt(row.sections_count || '0'),
        outcomesCount: parseInt(row.outcomes_count || '0'),
        provisionCount: parseInt(row.provision_count || '0'),
        openCommentsCount: parseInt(row.open_comments_count || '0'),
        approvedSections: parseInt(row.approved_sections || '0'),
        achievedOutcomes: parseInt(row.achieved_outcomes || '0')
      },

      timestamps: {
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        finalisedAt: row.finalised_at,
        submittedAt: row.submitted_at,
        lastActivity: row.last_activity
      }
    }));

    const total = parseInt(countResult.rows[0]?.total || '0');
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        plans,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching EHC plans:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch EHC plans'
    }, { status: 500 });
  }
}

// POST - Create new EHC Plan (basic creation, not AI generation)
export async function POST(request: NextRequest) {
  try {
    // Authentication
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

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const body = await request.json();
    const {
      childId,
      planTitle,
      localAuthority,
      urgencyLevel = 'standard',
      caseOfficerName,
      caseOfficerEmail,
      statutoryAssessmentDate,
      planStartDate
    } = body;

    // Validate child access
    const childResult = await db.query(`
      SELECT * FROM children WHERE id = $1 AND parent_id = $2
    `, [childId, user.id]);

    if (childResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Child not found or access denied'
      }, { status: 403 });
    }

    const child = childResult.rows[0];

    // Generate plan number
    const planNumberResult = await db.query('SELECT generate_plan_number() as plan_number');
    const planNumber = planNumberResult.rows[0].plan_number;

    // Create plan
    const planResult = await db.query(`
      INSERT INTO ehc_plans (
        tenant_id, child_id, created_by, plan_number, plan_title,
        local_authority, case_officer_name, case_officer_email,
        statutory_assessment_date, plan_start_date, annual_review_date,
        next_review_date, urgency_level, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING id, created_at
    `, [
      user.tenant_id,
      childId,
      user.id,
      planNumber,
      planTitle || `EHC Plan for ${child.first_name} ${child.last_name}`,
      localAuthority,
      caseOfficerName,
      caseOfficerEmail,
      statutoryAssessmentDate,
      planStartDate || new Date(),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      urgencyLevel,
      'draft'
    ]);

    const planId = planResult.rows[0].id;

    return NextResponse.json({
      success: true,
      message: 'EHC plan created successfully',
      data: {
        planId,
        planNumber,
        createdAt: planResult.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error creating EHC plan:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create EHC plan'
    }, { status: 500 });
  }
}
