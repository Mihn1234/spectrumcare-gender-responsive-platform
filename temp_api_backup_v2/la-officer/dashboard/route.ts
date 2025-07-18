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

    // Get dashboard statistics
    const statsQueries = [
      // Total cases count
      db.query(`
        SELECT COUNT(*) as total_cases
        FROM ehc_cases
        WHERE tenant_id = $1 AND status NOT IN ('CLOSED', 'CANCELLED')
      `, [user.tenant_id]),

      // Pending cases
      db.query(`
        SELECT COUNT(*) as pending_cases
        FROM ehc_cases
        WHERE tenant_id = $1 AND status = 'PENDING'
      `, [user.tenant_id]),

      // Overdue deadlines
      db.query(`
        SELECT COUNT(*) as overdue_deadlines
        FROM ehc_cases
        WHERE tenant_id = $1
          AND statutory_deadline < CURRENT_DATE
          AND status NOT IN ('FINAL', 'CLOSED', 'CANCELLED')
      `, [user.tenant_id]),

      // Completed this month
      db.query(`
        SELECT COUNT(*) as completed_this_month
        FROM ehc_cases
        WHERE tenant_id = $1
          AND status = 'FINAL'
          AND actual_completion_date >= DATE_TRUNC('month', CURRENT_DATE)
      `, [user.tenant_id]),

      // Cases by status
      db.query(`
        SELECT status, COUNT(*) as count
        FROM ehc_cases
        WHERE tenant_id = $1 AND status NOT IN ('CLOSED', 'CANCELLED')
        GROUP BY status
      `, [user.tenant_id]),

      // Cases by priority
      db.query(`
        SELECT priority, COUNT(*) as count
        FROM ehc_cases
        WHERE tenant_id = $1 AND status NOT IN ('CLOSED', 'CANCELLED')
        GROUP BY priority
      `, [user.tenant_id]),

      // Team workload
      db.query(`
        SELECT
          CONCAT(u.first_name, ' ', u.last_name) as caseworker,
          COUNT(CASE WHEN ec.status NOT IN ('FINAL', 'CLOSED', 'CANCELLED') THEN 1 END) as active_cases,
          COUNT(CASE WHEN ec.status = 'FINAL' AND ec.actual_completion_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as completed_cases,
          COALESCE(AVG(
            CASE
              WHEN ec.status = 'FINAL' AND ec.statutory_deadline IS NOT NULL AND ec.actual_completion_date IS NOT NULL
              THEN EXTRACT(days FROM ec.actual_completion_date - ec.statutory_deadline + INTERVAL '20 weeks')
            END
          ), 0) as average_time
        FROM users u
        LEFT JOIN ehc_cases ec ON u.id = ec.assigned_caseworker_id
        WHERE u.tenant_id = $1
          AND u.role = 'LA_CASEWORKER'
          AND u.is_active = true
        GROUP BY u.id, u.first_name, u.last_name
        ORDER BY active_cases DESC
        LIMIT 10
      `, [user.tenant_id]),

      // Average processing time
      db.query(`
        SELECT
          COALESCE(AVG(
            CASE
              WHEN status = 'FINAL' AND statutory_deadline IS NOT NULL AND actual_completion_date IS NOT NULL
              THEN EXTRACT(days FROM actual_completion_date - statutory_deadline + INTERVAL '20 weeks')
            END
          ), 0) as avg_processing_time
        FROM ehc_cases
        WHERE tenant_id = $1
          AND actual_completion_date >= CURRENT_DATE - INTERVAL '6 months'
      `, [user.tenant_id]),

      // Budget utilization
      db.query(`
        SELECT
          COALESCE(SUM(actual_cost), 0) as total_spent,
          COALESCE(SUM(estimated_budget), 0) as total_budget,
          CASE
            WHEN SUM(estimated_budget) > 0
            THEN (SUM(actual_cost) / SUM(estimated_budget)) * 100
            ELSE 0
          END as utilization_percentage
        FROM ehc_cases
        WHERE tenant_id = $1
          AND status NOT IN ('CLOSED', 'CANCELLED')
          AND estimated_budget > 0
      `, [user.tenant_id])
    ];

    const results = await Promise.all(statsQueries);

    // Parse results
    const [
      totalCasesResult,
      pendingCasesResult,
      overdueDeadlinesResult,
      completedThisMonthResult,
      casesByStatusResult,
      casesByPriorityResult,
      teamWorkloadResult,
      avgProcessingTimeResult,
      budgetUtilizationResult
    ] = results;

    // Build response
    const stats = {
      totalCases: parseInt(totalCasesResult.rows[0]?.total_cases || '0'),
      pendingCases: parseInt(pendingCasesResult.rows[0]?.pending_cases || '0'),
      overdueDeadlines: parseInt(overdueDeadlinesResult.rows[0]?.overdue_deadlines || '0'),
      completedThisMonth: parseInt(completedThisMonthResult.rows[0]?.completed_this_month || '0'),
      averageProcessingTime: parseFloat(avgProcessingTimeResult.rows[0]?.avg_processing_time || '0'),
      budgetUtilization: parseFloat(budgetUtilizationResult.rows[0]?.utilization_percentage || '0'),
      casesByStatus: casesByStatusResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>),
      casesByPriority: casesByPriorityResult.rows.reduce((acc, row) => {
        acc[row.priority] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>),
      teamWorkload: teamWorkloadResult.rows.map(row => ({
        caseworker: row.caseworker,
        activeCases: parseInt(row.active_cases),
        completedCases: parseInt(row.completed_cases),
        averageTime: parseFloat(row.average_time)
      }))
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching LA Officer dashboard stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    }, { status: 500 });
  }
}
