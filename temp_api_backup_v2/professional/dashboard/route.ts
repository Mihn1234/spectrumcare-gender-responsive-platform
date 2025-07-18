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

    if (!user || user.role !== 'PROFESSIONAL') {
      return NextResponse.json({
        success: false,
        message: 'Professional access required'
      }, { status: 403 });
    }

    // Get dashboard statistics
    const statsQueries = [
      // Total clients count
      db.query(`
        SELECT COUNT(*) as total_clients
        FROM professional_clients
        WHERE professional_id = $1 AND is_active = true
      `, [user.id]),

      // Active appointments this week
      db.query(`
        SELECT COUNT(*) as active_appointments
        FROM appointments
        WHERE professional_id = $1
          AND appointment_date >= CURRENT_DATE
          AND appointment_date < CURRENT_DATE + INTERVAL '7 days'
          AND status IN ('scheduled', 'confirmed')
      `, [user.id]),

      // Revenue this month
      db.query(`
        SELECT
          COALESCE(SUM(fee_amount), 0) as monthly_revenue,
          COUNT(*) as paid_sessions
        FROM appointments
        WHERE professional_id = $1
          AND appointment_date >= DATE_TRUNC('month', CURRENT_DATE)
          AND status = 'completed'
          AND payment_status = 'paid'
      `, [user.id]),

      // Pending assessments
      db.query(`
        SELECT COUNT(*) as pending_assessments
        FROM assessments
        WHERE professional_id = $1
          AND status = 'in_progress'
      `, [user.id]),

      // Appointment distribution by type
      db.query(`
        SELECT
          appointment_type,
          COUNT(*) as count
        FROM appointments
        WHERE professional_id = $1
          AND appointment_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY appointment_type
      `, [user.id]),

      // Revenue trend (last 6 months)
      db.query(`
        SELECT
          DATE_TRUNC('month', appointment_date) as month,
          SUM(fee_amount) as revenue,
          COUNT(*) as sessions
        FROM appointments
        WHERE professional_id = $1
          AND appointment_date >= CURRENT_DATE - INTERVAL '6 months'
          AND status = 'completed'
          AND payment_status = 'paid'
        GROUP BY DATE_TRUNC('month', appointment_date)
        ORDER BY month
      `, [user.id]),

      // Client satisfaction scores
      db.query(`
        SELECT
          AVG(satisfaction_rating) as avg_satisfaction,
          COUNT(*) as total_ratings
        FROM session_feedback
        WHERE professional_id = $1
          AND satisfaction_rating IS NOT NULL
          AND created_at >= CURRENT_DATE - INTERVAL '90 days'
      `, [user.id]),

      // Assessment completion rate
      db.query(`
        SELECT
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(*) as total,
          CASE
            WHEN COUNT(*) > 0
            THEN (COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)) * 100
            ELSE 0
          END as completion_rate
        FROM assessments
        WHERE professional_id = $1
          AND created_at >= CURRENT_DATE - INTERVAL '90 days'
      `, [user.id]),

      // Upcoming appointments today
      db.query(`
        SELECT
          a.id,
          a.appointment_time,
          a.duration_minutes,
          a.appointment_type,
          a.status,
          pc.first_name,
          pc.last_name,
          pc.age
        FROM appointments a
        JOIN professional_clients pc ON a.client_id = pc.id
        WHERE a.professional_id = $1
          AND a.appointment_date = CURRENT_DATE
          AND a.status IN ('scheduled', 'confirmed')
        ORDER BY a.appointment_time
        LIMIT 10
      `, [user.id]),

      // Recent client activity
      db.query(`
        SELECT
          pc.id,
          pc.first_name,
          pc.last_name,
          pc.condition_type,
          MAX(a.appointment_date) as last_session,
          COUNT(a.id) as total_sessions
        FROM professional_clients pc
        LEFT JOIN appointments a ON pc.id = a.client_id AND a.status = 'completed'
        WHERE pc.professional_id = $1
          AND pc.is_active = true
        GROUP BY pc.id, pc.first_name, pc.last_name, pc.condition_type
        ORDER BY MAX(a.appointment_date) DESC NULLS LAST
        LIMIT 10
      `, [user.id])
    ];

    const results = await Promise.all(statsQueries);

    // Parse results
    const [
      totalClientsResult,
      activeAppointmentsResult,
      monthlyRevenueResult,
      pendingAssessmentsResult,
      appointmentTypesResult,
      revenueTrendResult,
      satisfactionResult,
      completionRateResult,
      todayAppointmentsResult,
      recentClientsResult
    ] = results;

    // Build response
    const stats = {
      totalClients: parseInt(totalClientsResult.rows[0]?.total_clients || '0'),
      activeAppointments: parseInt(activeAppointmentsResult.rows[0]?.active_appointments || '0'),
      monthlyRevenue: parseFloat(monthlyRevenueResult.rows[0]?.monthly_revenue || '0'),
      monthlySessions: parseInt(monthlyRevenueResult.rows[0]?.paid_sessions || '0'),
      pendingAssessments: parseInt(pendingAssessmentsResult.rows[0]?.pending_assessments || '0'),

      appointmentTypes: appointmentTypesResult.rows.reduce((acc, row) => {
        acc[row.appointment_type] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>),

      revenueTrend: revenueTrendResult.rows.map(row => ({
        month: row.month,
        revenue: parseFloat(row.revenue),
        sessions: parseInt(row.sessions)
      })),

      avgSatisfaction: parseFloat(satisfactionResult.rows[0]?.avg_satisfaction || '0'),
      totalRatings: parseInt(satisfactionResult.rows[0]?.total_ratings || '0'),

      assessmentCompletionRate: parseFloat(completionRateResult.rows[0]?.completion_rate || '0'),
      completedAssessments: parseInt(completionRateResult.rows[0]?.completed || '0'),
      totalAssessments: parseInt(completionRateResult.rows[0]?.total || '0'),

      todayAppointments: todayAppointmentsResult.rows.map(row => ({
        id: row.id,
        time: row.appointment_time,
        duration: parseInt(row.duration_minutes),
        type: row.appointment_type,
        status: row.status,
        clientName: `${row.first_name} ${row.last_name}`,
        clientAge: row.age
      })),

      recentClients: recentClientsResult.rows.map(row => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        conditionType: row.condition_type,
        lastSession: row.last_session,
        totalSessions: parseInt(row.total_sessions || '0')
      }))
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching professional dashboard stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    }, { status: 500 });
  }
}
