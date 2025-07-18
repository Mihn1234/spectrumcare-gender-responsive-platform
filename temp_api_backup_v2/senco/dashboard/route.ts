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

    // Get user's school ID (assuming SENCO is associated with one school)
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

    // Get comprehensive dashboard statistics
    const dashboardQueries = [
      // School and student overview
      db.query(`
        SELECT
          s.name as school_name,
          s.senco_name,
          s.current_enrollment,
          s.pupil_capacity,
          COUNT(ss.id) as total_students,
          COUNT(ss.id) FILTER (WHERE ss.send_status != 'no_send') as send_students,
          COUNT(ss.id) FILTER (WHERE ss.send_status = 'ehc_plan') as ehcp_students,
          COUNT(ss.id) FILTER (WHERE ss.send_status = 'send_support') as send_support_students,
          ROUND(
            (COUNT(ss.id) FILTER (WHERE ss.send_status != 'no_send')::decimal /
             NULLIF(COUNT(ss.id), 0)) * 100, 2
          ) as send_percentage
        FROM schools s
        LEFT JOIN senco_students ss ON s.id = ss.school_id AND ss.is_active = true
        WHERE s.id = $1
        GROUP BY s.id, s.name, s.senco_name, s.current_enrollment, s.pupil_capacity
      `, [schoolId]),

      // Primary need breakdown
      db.query(`
        SELECT
          primary_need,
          COUNT(*) as count,
          ROUND((COUNT(*)::decimal / (
            SELECT COUNT(*) FROM senco_students
            WHERE school_id = $1 AND is_active = true AND send_status != 'no_send'
          )) * 100, 2) as percentage
        FROM senco_students
        WHERE school_id = $1 AND is_active = true AND send_status != 'no_send'
        GROUP BY primary_need
        ORDER BY count DESC
      `, [schoolId]),

      // Year group distribution
      db.query(`
        SELECT
          year_group,
          COUNT(*) as total_students,
          COUNT(*) FILTER (WHERE send_status != 'no_send') as send_students,
          ROUND(
            (COUNT(*) FILTER (WHERE send_status != 'no_send')::decimal /
             NULLIF(COUNT(*), 0)) * 100, 2
          ) as send_percentage
        FROM senco_students
        WHERE school_id = $1 AND is_active = true
        GROUP BY year_group
        ORDER BY year_group
      `, [schoolId]),

      // Compliance deadlines (next 60 days)
      db.query(`
        SELECT
          ep.id as plan_id,
          CONCAT(ss.first_name, ' ', ss.last_name) as student_name,
          ss.year_group,
          ep.plan_type,
          ep.next_review_date,
          (ep.next_review_date - CURRENT_DATE) as days_until_due,
          CASE
            WHEN ep.next_review_date < CURRENT_DATE THEN 'OVERDUE'
            WHEN ep.next_review_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'URGENT'
            WHEN ep.next_review_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'DUE_SOON'
            ELSE 'FUTURE'
          END as urgency
        FROM education_plans ep
        JOIN senco_students ss ON ep.student_id = ss.id
        WHERE ss.school_id = $1
        AND ep.status = 'active'
        AND ep.next_review_date IS NOT NULL
        AND ep.next_review_date <= CURRENT_DATE + INTERVAL '60 days'
        ORDER BY ep.next_review_date
        LIMIT 20
      `, [schoolId]),

      // Recent student activities
      db.query(`
        SELECT
          'progress_update' as activity_type,
          CONCAT(ss.first_name, ' ', ss.last_name) as student_name,
          sp.subject_area,
          sp.progress_rating,
          sp.measurement_date as activity_date,
          'Progress recorded in ' || sp.subject_area as description
        FROM student_progress sp
        JOIN senco_students ss ON sp.student_id = ss.id
        WHERE ss.school_id = $1
        AND sp.measurement_date >= CURRENT_DATE - INTERVAL '14 days'

        UNION ALL

        SELECT
          'assessment_completed' as activity_type,
          CONCAT(ss.first_name, ' ', ss.last_name) as student_name,
          sa.assessment_type,
          'completed' as status,
          sa.assessment_date as activity_date,
          sa.assessment_name || ' completed' as description
        FROM student_assessments sa
        JOIN senco_students ss ON sa.student_id = ss.id
        WHERE ss.school_id = $1
        AND sa.assessment_date >= CURRENT_DATE - INTERVAL '14 days'

        UNION ALL

        SELECT
          'intervention_started' as activity_type,
          CONCAT(ss.first_name, ' ', ss.last_name) as student_name,
          i.name as intervention_name,
          'started' as status,
          si.start_date as activity_date,
          'Started intervention: ' || i.name as description
        FROM student_interventions si
        JOIN senco_students ss ON si.student_id = ss.id
        JOIN interventions i ON si.intervention_id = i.id
        WHERE ss.school_id = $1
        AND si.start_date >= CURRENT_DATE - INTERVAL '14 days'

        ORDER BY activity_date DESC
        LIMIT 15
      `, [schoolId]),

      // Staff overview
      db.query(`
        SELECT
          COUNT(*) as total_staff,
          COUNT(*) FILTER (WHERE role_type = 'teacher') as teachers,
          COUNT(*) FILTER (WHERE role_type = 'teaching_assistant') as teaching_assistants,
          COUNT(*) FILTER (WHERE role_type = 'senco') as sencos,
          SUM(hours_per_week) FILTER (WHERE role_type = 'teaching_assistant') as total_ta_hours,
          AVG(hours_per_week) FILTER (WHERE role_type = 'teaching_assistant') as avg_ta_hours
        FROM school_staff
        WHERE school_id = $1 AND is_active = true
      `, [schoolId]),

      // Active interventions summary
      db.query(`
        SELECT
          i.name,
          i.intervention_type,
          COUNT(si.id) as active_students,
          AVG(si.frequency_per_week) as avg_frequency,
          COUNT(si.id) FILTER (WHERE si.outcome_achieved = true) as successful_outcomes
        FROM interventions i
        JOIN student_interventions si ON i.id = si.intervention_id
        JOIN senco_students ss ON si.student_id = ss.id
        WHERE ss.school_id = $1
        AND si.end_date IS NULL OR si.end_date >= CURRENT_DATE
        GROUP BY i.id, i.name, i.intervention_type
        ORDER BY active_students DESC
        LIMIT 10
      `, [schoolId]),

      // Monthly progress trends (last 6 months)
      db.query(`
        SELECT
          DATE_TRUNC('month', sp.measurement_date) as month,
          COUNT(*) as total_measurements,
          COUNT(*) FILTER (WHERE sp.progress_rating = 'exceeded') as exceeded,
          COUNT(*) FILTER (WHERE sp.progress_rating = 'met') as met,
          COUNT(*) FILTER (WHERE sp.progress_rating = 'progressing') as progressing,
          COUNT(*) FILTER (WHERE sp.progress_rating = 'concern') as concern,
          ROUND(
            (COUNT(*) FILTER (WHERE sp.progress_rating IN ('exceeded', 'met'))::decimal /
             NULLIF(COUNT(*), 0)) * 100, 2
          ) as success_rate
        FROM student_progress sp
        JOIN senco_students ss ON sp.student_id = ss.id
        WHERE ss.school_id = $1
        AND sp.measurement_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', sp.measurement_date)
        ORDER BY month
      `, [schoolId]),

      // Parent communication summary
      db.query(`
        SELECT
          COUNT(*) as total_communications,
          COUNT(*) FILTER (WHERE communication_type = 'meeting') as meetings,
          COUNT(*) FILTER (WHERE communication_type = 'phone') as phone_calls,
          COUNT(*) FILTER (WHERE communication_type = 'email') as emails,
          COUNT(*) FILTER (WHERE date_time >= CURRENT_DATE - INTERVAL '30 days') as recent_communications,
          AVG(parent_satisfaction_rating) as avg_satisfaction,
          COUNT(*) FILTER (WHERE follow_up_required = true AND follow_up_date > CURRENT_DATE) as pending_follow_ups
        FROM parent_communications pc
        JOIN senco_students ss ON pc.student_id = ss.id
        WHERE ss.school_id = $1
        AND pc.date_time >= CURRENT_DATE - INTERVAL '90 days'
      `, [schoolId]),

      // Upcoming deadlines count by urgency
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE ep.next_review_date < CURRENT_DATE) as overdue,
          COUNT(*) FILTER (WHERE ep.next_review_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as urgent,
          COUNT(*) FILTER (WHERE ep.next_review_date BETWEEN CURRENT_DATE + INTERVAL '8 days' AND CURRENT_DATE + INTERVAL '30 days') as due_soon,
          COUNT(*) FILTER (WHERE ep.next_review_date > CURRENT_DATE + INTERVAL '30 days') as future
        FROM education_plans ep
        JOIN senco_students ss ON ep.student_id = ss.id
        WHERE ss.school_id = $1
        AND ep.status = 'active'
        AND ep.next_review_date IS NOT NULL
      `, [schoolId])
    ];

    const results = await Promise.all(dashboardQueries);

    // Parse results
    const [
      schoolOverviewResult,
      primaryNeedsResult,
      yearGroupsResult,
      complianceResult,
      activitiesResult,
      staffResult,
      interventionsResult,
      progressTrendResult,
      communicationsResult,
      deadlinesCountResult
    ] = results;

    // Build comprehensive dashboard data
    const dashboard = {
      school: schoolOverviewResult.rows[0] || {},

      summary: {
        totalStudents: parseInt(schoolOverviewResult.rows[0]?.total_students || '0'),
        sendStudents: parseInt(schoolOverviewResult.rows[0]?.send_students || '0'),
        ehcpStudents: parseInt(schoolOverviewResult.rows[0]?.ehcp_students || '0'),
        sendSupportStudents: parseInt(schoolOverviewResult.rows[0]?.send_support_students || '0'),
        sendPercentage: parseFloat(schoolOverviewResult.rows[0]?.send_percentage || '0'),
        schoolCapacity: parseInt(schoolOverviewResult.rows[0]?.pupil_capacity || '0'),
        currentEnrollment: parseInt(schoolOverviewResult.rows[0]?.current_enrollment || '0')
      },

      primaryNeeds: primaryNeedsResult.rows.map(row => ({
        need: row.primary_need,
        count: parseInt(row.count),
        percentage: parseFloat(row.percentage)
      })),

      yearGroups: yearGroupsResult.rows.map(row => ({
        yearGroup: row.year_group,
        totalStudents: parseInt(row.total_students),
        sendStudents: parseInt(row.send_students),
        sendPercentage: parseFloat(row.send_percentage)
      })),

      complianceDeadlines: complianceResult.rows.map(row => ({
        planId: row.plan_id,
        studentName: row.student_name,
        yearGroup: row.year_group,
        planType: row.plan_type,
        reviewDate: row.next_review_date,
        daysUntilDue: parseInt(row.days_until_due),
        urgency: row.urgency
      })),

      recentActivities: activitiesResult.rows.map(row => ({
        type: row.activity_type,
        studentName: row.student_name,
        subject: row.subject_area || row.intervention_name || row.assessment_type,
        status: row.progress_rating || row.status,
        date: row.activity_date,
        description: row.description
      })),

      staffSummary: {
        totalStaff: parseInt(staffResult.rows[0]?.total_staff || '0'),
        teachers: parseInt(staffResult.rows[0]?.teachers || '0'),
        teachingAssistants: parseInt(staffResult.rows[0]?.teaching_assistants || '0'),
        sencos: parseInt(staffResult.rows[0]?.sencos || '0'),
        totalTAHours: parseFloat(staffResult.rows[0]?.total_ta_hours || '0'),
        avgTAHours: parseFloat(staffResult.rows[0]?.avg_ta_hours || '0')
      },

      activeInterventions: interventionsResult.rows.map(row => ({
        name: row.name,
        type: row.intervention_type,
        activeStudents: parseInt(row.active_students),
        avgFrequency: parseFloat(row.avg_frequency),
        successfulOutcomes: parseInt(row.successful_outcomes || '0')
      })),

      progressTrends: progressTrendResult.rows.map(row => ({
        month: row.month,
        totalMeasurements: parseInt(row.total_measurements),
        exceeded: parseInt(row.exceeded),
        met: parseInt(row.met),
        progressing: parseInt(row.progressing),
        concern: parseInt(row.concern),
        successRate: parseFloat(row.success_rate)
      })),

      communications: {
        total: parseInt(communicationsResult.rows[0]?.total_communications || '0'),
        meetings: parseInt(communicationsResult.rows[0]?.meetings || '0'),
        phoneCalls: parseInt(communicationsResult.rows[0]?.phone_calls || '0'),
        emails: parseInt(communicationsResult.rows[0]?.emails || '0'),
        recentCommunications: parseInt(communicationsResult.rows[0]?.recent_communications || '0'),
        avgSatisfaction: parseFloat(communicationsResult.rows[0]?.avg_satisfaction || '0'),
        pendingFollowUps: parseInt(communicationsResult.rows[0]?.pending_follow_ups || '0')
      },

      deadlinesSummary: {
        overdue: parseInt(deadlinesCountResult.rows[0]?.overdue || '0'),
        urgent: parseInt(deadlinesCountResult.rows[0]?.urgent || '0'),
        dueSoon: parseInt(deadlinesCountResult.rows[0]?.due_soon || '0'),
        future: parseInt(deadlinesCountResult.rows[0]?.future || '0')
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboard
    });

  } catch (error) {
    console.error('Error fetching SENCO dashboard:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch dashboard data'
    }, { status: 500 });
  }
}

// Update school information
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
    const {
      schoolName,
      sencoName,
      currentEnrollment,
      pupilCapacity,
      sendProvisionType,
      settings
    } = body;

    // Get user's school ID
    const schoolResult = await db.query(`
      SELECT id FROM schools WHERE senco_email = $1 OR tenant_id = $2 LIMIT 1
    `, [user.email, user.tenant_id]);

    if (schoolResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'School not found'
      }, { status: 404 });
    }

    const schoolId = schoolResult.rows[0].id;

    // Update school information
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (schoolName) {
      updates.push(`name = $${paramCount}`);
      values.push(schoolName);
      paramCount++;
    }

    if (sencoName) {
      updates.push(`senco_name = $${paramCount}`);
      values.push(sencoName);
      paramCount++;
    }

    if (currentEnrollment !== undefined) {
      updates.push(`current_enrollment = $${paramCount}`);
      values.push(currentEnrollment);
      paramCount++;
    }

    if (pupilCapacity !== undefined) {
      updates.push(`pupil_capacity = $${paramCount}`);
      values.push(pupilCapacity);
      paramCount++;
    }

    if (sendProvisionType) {
      updates.push(`send_provision_type = $${paramCount}`);
      values.push(sendProvisionType);
      paramCount++;
    }

    if (settings) {
      updates.push(`settings = $${paramCount}`);
      values.push(JSON.stringify(settings));
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No updates provided'
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(schoolId);

    await db.query(`
      UPDATE schools
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values);

    return NextResponse.json({
      success: true,
      message: 'School information updated successfully'
    });

  } catch (error) {
    console.error('Error updating school information:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update school information'
    }, { status: 500 });
  }
}
