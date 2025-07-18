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
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    // Get team members with workload data
    const teamQuery = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.organization,
        u.is_active,
        u.last_login,
        u.created_at,
        u.profile_data,

        -- Active cases count
        COUNT(CASE WHEN ec.status NOT IN ('FINAL', 'CLOSED', 'CANCELLED') THEN 1 END) as active_cases,

        -- Completed cases in last 30 days
        COUNT(CASE
          WHEN ec.status = 'FINAL'
            AND ec.actual_completion_date >= CURRENT_DATE - INTERVAL '30 days'
          THEN 1
        END) as completed_cases_30d,

        -- Completed cases in last 90 days
        COUNT(CASE
          WHEN ec.status = 'FINAL'
            AND ec.actual_completion_date >= CURRENT_DATE - INTERVAL '90 days'
          THEN 1
        END) as completed_cases_90d,

        -- Overdue cases
        COUNT(CASE
          WHEN ec.statutory_deadline < CURRENT_DATE
            AND ec.status NOT IN ('FINAL', 'CLOSED', 'CANCELLED')
          THEN 1
        END) as overdue_cases,

        -- Average completion time (in days from start)
        COALESCE(AVG(
          CASE
            WHEN ec.status = 'FINAL'
              AND ec.actual_completion_date IS NOT NULL
              AND ec.actual_completion_date >= CURRENT_DATE - INTERVAL '6 months'
            THEN EXTRACT(days FROM ec.actual_completion_date - ec.created_at)
          END
        ), 0) as avg_completion_days,

        -- Cases by priority
        COUNT(CASE WHEN ec.priority = 'URGENT' AND ec.status NOT IN ('FINAL', 'CLOSED', 'CANCELLED') THEN 1 END) as urgent_cases,
        COUNT(CASE WHEN ec.priority = 'HIGH' AND ec.status NOT IN ('FINAL', 'CLOSED', 'CANCELLED') THEN 1 END) as high_priority_cases,

        -- Performance metrics
        COALESCE(AVG(
          CASE
            WHEN ec.status = 'FINAL'
              AND ec.statutory_deadline IS NOT NULL
              AND ec.actual_completion_date IS NOT NULL
              AND ec.actual_completion_date >= CURRENT_DATE - INTERVAL '6 months'
            THEN
              CASE
                WHEN ec.actual_completion_date <= ec.statutory_deadline THEN 100
                ELSE GREATEST(0, 100 - EXTRACT(days FROM ec.actual_completion_date - ec.statutory_deadline))
              END
          END
        ), 0) as compliance_score,

        -- Budget efficiency
        COALESCE(AVG(
          CASE
            WHEN ec.status = 'FINAL'
              AND ec.estimated_budget > 0
              AND ec.actual_cost > 0
              AND ec.actual_completion_date >= CURRENT_DATE - INTERVAL '6 months'
            THEN (ec.estimated_budget / NULLIF(ec.actual_cost, 0)) * 100
          END
        ), 100) as budget_efficiency

      FROM users u
      LEFT JOIN ehc_cases ec ON u.id = ec.assigned_caseworker_id
      WHERE u.tenant_id = $1
        AND u.role = 'LA_CASEWORKER'
        ${includeInactive ? '' : 'AND u.is_active = true'}
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.organization,
               u.is_active, u.last_login, u.created_at, u.profile_data
      ORDER BY active_cases DESC, u.first_name, u.last_name
    `;

    const teamResult = await db.query(teamQuery, [user.tenant_id]);

    // Get additional performance data
    const performanceQueries = await Promise.all(teamResult.rows.map(async (member) => {
      // Get recent activity
      const recentActivityQuery = await db.query(`
        SELECT
          cu.title,
          cu.update_type,
          cu.created_at,
          ec.case_number
        FROM case_updates cu
        JOIN ehc_cases ec ON cu.case_id = ec.id
        WHERE cu.created_by_id = $1
          AND cu.created_at >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY cu.created_at DESC
        LIMIT 5
      `, [member.id]);

      // Get case load distribution
      const caseDistributionQuery = await db.query(`
        SELECT
          ec.status,
          COUNT(*) as count
        FROM ehc_cases ec
        WHERE ec.assigned_caseworker_id = $1
          AND ec.status NOT IN ('CLOSED', 'CANCELLED')
        GROUP BY ec.status
      `, [member.id]);

      return {
        userId: member.id,
        recentActivity: recentActivityQuery.rows,
        caseDistribution: caseDistributionQuery.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {} as Record<string, number>)
      };
    }));

    // Combine data
    const teamMembers = teamResult.rows.map((member, index) => {
      const performance = performanceQueries[index];

      return {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        phone: member.phone,
        organization: member.organization,
        isActive: member.is_active,
        lastLogin: member.last_login,
        joinedDate: member.created_at,
        specializations: member.profile_data?.specializations || [],

        // Workload metrics
        workload: {
          activeCases: parseInt(member.active_cases),
          completedCases30d: parseInt(member.completed_cases_30d),
          completedCases90d: parseInt(member.completed_cases_90d),
          overdueCases: parseInt(member.overdue_cases),
          urgentCases: parseInt(member.urgent_cases),
          highPriorityCases: parseInt(member.high_priority_cases),
          avgCompletionDays: parseFloat(member.avg_completion_days),
          complianceScore: parseFloat(member.compliance_score),
          budgetEfficiency: parseFloat(member.budget_efficiency)
        },

        // Case distribution
        caseDistribution: performance.caseDistribution,

        // Recent activity
        recentActivity: performance.recentActivity.map(activity => ({
          title: activity.title,
          type: activity.update_type,
          date: activity.created_at,
          caseNumber: activity.case_number
        })),

        // Performance indicators
        performance: {
          workloadStatus: getWorkloadStatus(parseInt(member.active_cases)),
          complianceRating: getComplianceRating(parseFloat(member.compliance_score)),
          efficiencyRating: getEfficiencyRating(parseFloat(member.budget_efficiency))
        }
      };
    });

    // Calculate team statistics
    const teamStats = {
      totalMembers: teamMembers.length,
      activeMembers: teamMembers.filter(m => m.isActive).length,
      totalActiveCases: teamMembers.reduce((sum, m) => sum + m.workload.activeCases, 0),
      totalOverdueCases: teamMembers.reduce((sum, m) => sum + m.workload.overdueCases, 0),
      avgComplianceScore: teamMembers.length > 0
        ? teamMembers.reduce((sum, m) => sum + m.workload.complianceScore, 0) / teamMembers.length
        : 0,
      avgBudgetEfficiency: teamMembers.length > 0
        ? teamMembers.reduce((sum, m) => sum + m.workload.budgetEfficiency, 0) / teamMembers.length
        : 0,
      workloadDistribution: {
        overloaded: teamMembers.filter(m => m.performance.workloadStatus === 'overloaded').length,
        normal: teamMembers.filter(m => m.performance.workloadStatus === 'normal').length,
        light: teamMembers.filter(m => m.performance.workloadStatus === 'light').length
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        teamMembers,
        teamStats
      }
    });

  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch team data'
    }, { status: 500 });
  }
}

// POST - Assign cases or update team member
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
    const { action, memberId, caseIds, newAssigneeId, notes } = body;

    if (action === 'reassign_cases') {
      // Reassign multiple cases
      if (!caseIds || !Array.isArray(caseIds) || caseIds.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Case IDs required'
        }, { status: 400 });
      }

      if (!newAssigneeId) {
        return NextResponse.json({
          success: false,
          message: 'New assignee required'
        }, { status: 400 });
      }

      // Verify new assignee exists and is a caseworker
      const assigneeCheck = await db.query(`
        SELECT id, first_name, last_name
        FROM users
        WHERE id = $1 AND tenant_id = $2 AND role = 'LA_CASEWORKER' AND is_active = true
      `, [newAssigneeId, user.tenant_id]);

      if (assigneeCheck.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'Invalid assignee'
        }, { status: 400 });
      }

      const assignee = assigneeCheck.rows[0];

      // Update cases
      const updateResult = await db.query(`
        UPDATE ehc_cases
        SET assigned_caseworker_id = $1, updated_at = NOW()
        WHERE id = ANY($2::uuid[]) AND tenant_id = $3
        RETURNING id, case_number
      `, [newAssigneeId, caseIds, user.tenant_id]);

      // Create case updates for each reassigned case
      for (const caseRow of updateResult.rows) {
        await db.query(`
          INSERT INTO case_updates (
            case_id, title, description, update_type, created_by_id, created_at, updated_at
          ) VALUES ($1, $2, $3, 'ASSIGNMENT_CHANGE', $4, NOW(), NOW())
        `, [
          caseRow.id,
          'Case Reassigned',
          `Case reassigned to ${assignee.first_name} ${assignee.last_name}. ${notes || ''}`.trim(),
          user.id
        ]);

        // Send notification to new assignee
        await db.query(`
          INSERT INTO notifications (
            user_id, title, message, notification_type, related_id, created_at
          ) VALUES ($1, $2, $3, 'CASE_ASSIGNMENT', $4, NOW())
        `, [
          newAssigneeId,
          'New Case Assignment',
          `You have been assigned case ${caseRow.case_number}`,
          caseRow.id
        ]);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully reassigned ${updateResult.rows.length} cases`,
        data: {
          reassignedCases: updateResult.rows.length,
          assignee: `${assignee.first_name} ${assignee.last_name}`
        }
      });

    } else if (action === 'update_member_status') {
      // Update team member active status
      if (!memberId) {
        return NextResponse.json({
          success: false,
          message: 'Member ID required'
        }, { status: 400 });
      }

      const { isActive } = body;

      await db.query(`
        UPDATE users
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2 AND tenant_id = $3 AND role = 'LA_CASEWORKER'
      `, [isActive, memberId, user.tenant_id]);

      return NextResponse.json({
        success: true,
        message: 'Team member status updated successfully'
      });

    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid action'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in team management:', error);
    return NextResponse.json({
      success: false,
      message: 'Team management operation failed'
    }, { status: 500 });
  }
}

// Helper functions
function getWorkloadStatus(activeCases: number): 'light' | 'normal' | 'overloaded' {
  if (activeCases <= 15) return 'light';
  if (activeCases <= 25) return 'normal';
  return 'overloaded';
}

function getComplianceRating(score: number): 'excellent' | 'good' | 'needs_improvement' | 'poor' {
  if (score >= 95) return 'excellent';
  if (score >= 85) return 'good';
  if (score >= 70) return 'needs_improvement';
  return 'poor';
}

function getEfficiencyRating(efficiency: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (efficiency >= 95) return 'excellent';
  if (efficiency >= 85) return 'good';
  if (efficiency >= 75) return 'average';
  return 'poor';
}
