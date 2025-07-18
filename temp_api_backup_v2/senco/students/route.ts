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
    const search = url.searchParams.get('search') || '';
    const yearGroup = url.searchParams.get('yearGroup') || 'all';
    const sendStatus = url.searchParams.get('sendStatus') || 'all';
    const primaryNeed = url.searchParams.get('primaryNeed') || 'all';
    const sortBy = url.searchParams.get('sortBy') || 'last_name';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const includeProgress = url.searchParams.get('includeProgress') === 'true';

    // Build where clause
    let whereConditions = ['ss.school_id = $1', 'ss.is_active = true'];
    const queryParams: any[] = [schoolId];
    let paramCount = 1;

    // Search filter
    if (search) {
      paramCount++;
      whereConditions.push(`(
        ss.first_name ILIKE $${paramCount} OR
        ss.last_name ILIKE $${paramCount} OR
        ss.student_id ILIKE $${paramCount} OR
        CONCAT(ss.first_name, ' ', ss.last_name) ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    // Year group filter
    if (yearGroup !== 'all') {
      paramCount++;
      whereConditions.push(`ss.year_group = $${paramCount}`);
      queryParams.push(yearGroup);
    }

    // SEND status filter
    if (sendStatus !== 'all') {
      paramCount++;
      whereConditions.push(`ss.send_status = $${paramCount}`);
      queryParams.push(sendStatus);
    }

    // Primary need filter
    if (primaryNeed !== 'all') {
      paramCount++;
      whereConditions.push(`ss.primary_need = $${paramCount}`);
      queryParams.push(primaryNeed);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Valid sort columns
    const validSortColumns = ['first_name', 'last_name', 'year_group', 'send_status', 'date_identified', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'last_name';
    const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Get students with education plans and recent progress
    const studentsQuery = `
      SELECT
        ss.id,
        ss.student_id,
        ss.first_name,
        ss.last_name,
        ss.date_of_birth,
        ss.year_group,
        ss.class_name,
        ss.gender,
        ss.send_status,
        ss.primary_need,
        ss.secondary_needs,
        ss.date_identified,
        ss.send_register_entry_date,
        ss.parent_1_name,
        ss.parent_1_email,
        ss.parent_1_phone,
        ss.parent_2_name,
        ss.parent_2_email,
        ss.parent_2_phone,
        ss.medical_conditions,
        ss.current_interventions,
        ss.teaching_assistant_hours,
        ss.notes,
        ss.created_at,
        ss.updated_at,

        -- Current education plan
        ep.id as plan_id,
        ep.plan_type,
        ep.status as plan_status,
        ep.next_review_date,
        ep.title as plan_title,

        -- Recent progress (last measurement)
        sp.measurement_date as last_progress_date,
        sp.progress_rating as last_progress_rating,
        sp.subject_area as last_progress_subject,

        -- Active interventions count
        COUNT(si.id) as active_interventions_count,

        -- Recent assessment
        sa.assessment_date as last_assessment_date,
        sa.assessment_name as last_assessment_name,
        sa.assessment_type as last_assessment_type,

        COUNT(*) OVER() as total_count
      FROM senco_students ss

      -- Current/most recent education plan
      LEFT JOIN LATERAL (
        SELECT id, plan_type, status, next_review_date, title
        FROM education_plans
        WHERE student_id = ss.id AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
      ) ep ON true

      -- Most recent progress entry
      LEFT JOIN LATERAL (
        SELECT measurement_date, progress_rating, subject_area
        FROM student_progress
        WHERE student_id = ss.id
        ORDER BY measurement_date DESC
        LIMIT 1
      ) sp ON true

      -- Active interventions
      LEFT JOIN student_interventions si ON ss.id = si.student_id
        AND (si.end_date IS NULL OR si.end_date >= CURRENT_DATE)

      -- Most recent assessment
      LEFT JOIN LATERAL (
        SELECT assessment_date, assessment_name, assessment_type
        FROM student_assessments
        WHERE student_id = ss.id
        ORDER BY assessment_date DESC
        LIMIT 1
      ) sa ON true

      ${whereClause}
      GROUP BY ss.id, ss.student_id, ss.first_name, ss.last_name, ss.date_of_birth,
               ss.year_group, ss.class_name, ss.gender, ss.send_status, ss.primary_need,
               ss.secondary_needs, ss.date_identified, ss.send_register_entry_date,
               ss.parent_1_name, ss.parent_1_email, ss.parent_1_phone,
               ss.parent_2_name, ss.parent_2_email, ss.parent_2_phone,
               ss.medical_conditions, ss.current_interventions, ss.teaching_assistant_hours,
               ss.notes, ss.created_at, ss.updated_at,
               ep.id, ep.plan_type, ep.status, ep.next_review_date, ep.title,
               sp.measurement_date, sp.progress_rating, sp.subject_area,
               sa.assessment_date, sa.assessment_name, sa.assessment_type
      ORDER BY ss.${sortColumn} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(studentsQuery, queryParams);

    // If includeProgress is true, get detailed progress for each student
    let studentsWithProgress = result.rows;
    if (includeProgress && result.rows.length > 0) {
      const studentIds = result.rows.map(row => row.id);

      const progressQuery = `
        SELECT
          student_id,
          subject_area,
          AVG(CASE
            WHEN progress_rating = 'exceeded' THEN 4
            WHEN progress_rating = 'met' THEN 3
            WHEN progress_rating = 'progressing' THEN 2
            WHEN progress_rating = 'concern' THEN 1
            ELSE 0
          END) as avg_progress_score,
          COUNT(*) as total_measurements,
          MAX(measurement_date) as latest_measurement
        FROM student_progress
        WHERE student_id = ANY($1::uuid[])
        AND measurement_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY student_id, subject_area
      `;

      const progressResult = await db.query(progressQuery, [studentIds]);
      const progressByStudent = progressResult.rows.reduce((acc, row) => {
        if (!acc[row.student_id]) acc[row.student_id] = [];
        acc[row.student_id].push({
          subject: row.subject_area,
          avgScore: parseFloat(row.avg_progress_score),
          totalMeasurements: parseInt(row.total_measurements),
          latestMeasurement: row.latest_measurement
        });
        return acc;
      }, {});

      studentsWithProgress = result.rows.map(student => ({
        ...student,
        progressSummary: progressByStudent[student.id] || []
      }));
    }

    const students = studentsWithProgress.map(row => {
      const age = row.date_of_birth
        ? Math.floor((new Date().getTime() - new Date(row.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : null;

      return {
        id: row.id,
        studentId: row.student_id,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: `${row.first_name} ${row.last_name}`,
        dateOfBirth: row.date_of_birth,
        age,
        yearGroup: row.year_group,
        className: row.class_name,
        gender: row.gender,

        // SEND Information
        sendStatus: row.send_status,
        primaryNeed: row.primary_need,
        secondaryNeeds: row.secondary_needs || [],
        dateIdentified: row.date_identified,
        sendRegisterEntryDate: row.send_register_entry_date,

        // Contact Information
        contacts: {
          parent1: {
            name: row.parent_1_name,
            email: row.parent_1_email,
            phone: row.parent_1_phone
          },
          parent2: {
            name: row.parent_2_name,
            email: row.parent_2_email,
            phone: row.parent_2_phone
          }
        },

        // Support Information
        medicalConditions: row.medical_conditions || [],
        currentInterventions: row.current_interventions || [],
        teachingAssistantHours: parseFloat(row.teaching_assistant_hours || '0'),
        activeInterventionsCount: parseInt(row.active_interventions_count || '0'),

        // Education Plan
        currentPlan: row.plan_id ? {
          id: row.plan_id,
          type: row.plan_type,
          status: row.plan_status,
          title: row.plan_title,
          nextReviewDate: row.next_review_date,
          daysUntilReview: row.next_review_date
            ? Math.ceil((new Date(row.next_review_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : null
        } : null,

        // Recent Progress
        recentProgress: row.last_progress_date ? {
          date: row.last_progress_date,
          rating: row.last_progress_rating,
          subject: row.last_progress_subject
        } : null,

        // Recent Assessment
        recentAssessment: row.last_assessment_date ? {
          date: row.last_assessment_date,
          name: row.last_assessment_name,
          type: row.last_assessment_type
        } : null,

        // Progress Summary (if requested)
        progressSummary: row.progressSummary || undefined,

        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch students'
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

    const body = await request.json();
    const {
      studentId,
      firstName,
      lastName,
      dateOfBirth,
      yearGroup,
      className,
      gender,
      ethnicity,
      primaryLanguage,
      sendStatus,
      primaryNeed,
      secondaryNeeds = [],
      dateIdentified,
      parent1,
      parent2,
      emergencyContact,
      medicalConditions = [],
      allergies = [],
      medications = {},
      currentInterventions = [],
      teachingAssistantHours = 0,
      notes
    } = body;

    // Validate required fields
    if (!studentId || !firstName || !lastName || !dateOfBirth || !yearGroup || !sendStatus) {
      return NextResponse.json({
        success: false,
        message: 'Student ID, name, date of birth, year group, and SEND status are required'
      }, { status: 400 });
    }

    // Check if student ID already exists in school
    const existingStudent = await db.query(`
      SELECT id FROM senco_students WHERE school_id = $1 AND student_id = $2
    `, [schoolId, studentId]);

    if (existingStudent.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Student ID already exists in this school'
      }, { status: 400 });
    }

    // Create student
    const result = await db.query(`
      INSERT INTO senco_students (
        school_id, student_id, first_name, last_name, date_of_birth, year_group, class_name,
        gender, ethnicity, primary_language, send_status, primary_need, secondary_needs,
        date_identified, send_register_entry_date,
        parent_1_name, parent_1_email, parent_1_phone, parent_1_relationship,
        parent_2_name, parent_2_email, parent_2_phone, parent_2_relationship,
        emergency_contact_name, emergency_contact_phone,
        medical_conditions, allergies, medications, current_interventions,
        teaching_assistant_hours, notes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        CASE WHEN $11 != 'no_send' THEN CURRENT_DATE ELSE NULL END,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, NOW(), NOW()
      ) RETURNING id
    `, [
      schoolId, studentId, firstName, lastName, dateOfBirth, yearGroup, className || null,
      gender || null, ethnicity || null, primaryLanguage || null,
      sendStatus, primaryNeed || null, JSON.stringify(secondaryNeeds),
      dateIdentified || null,
      parent1?.name || null, parent1?.email || null, parent1?.phone || null, parent1?.relationship || null,
      parent2?.name || null, parent2?.email || null, parent2?.phone || null, parent2?.relationship || null,
      emergencyContact?.name || null, emergencyContact?.phone || null,
      JSON.stringify(medicalConditions), JSON.stringify(allergies), JSON.stringify(medications),
      JSON.stringify(currentInterventions), teachingAssistantHours, notes || null
    ]);

    const newStudentId = result.rows[0].id;

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      data: {
        studentId: newStudentId,
        studentName: `${firstName} ${lastName}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create student'
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
    const { id: studentId, ...updateData } = body;

    if (!studentId) {
      return NextResponse.json({
        success: false,
        message: 'Student ID is required'
      }, { status: 400 });
    }

    // Get user's school ID and verify student belongs to school
    const schoolResult = await db.query(`
      SELECT s.id as school_id FROM schools s
      JOIN senco_students ss ON s.id = ss.school_id
      WHERE ss.id = $1 AND (s.senco_email = $2 OR s.tenant_id = $3)
    `, [studentId, user.email, user.tenant_id]);

    if (schoolResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Student not found or access denied'
      }, { status: 404 });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'first_name', 'last_name', 'year_group', 'class_name', 'gender', 'ethnicity',
      'primary_language', 'send_status', 'primary_need', 'secondary_needs',
      'date_identified', 'parent_1_name', 'parent_1_email', 'parent_1_phone',
      'parent_2_name', 'parent_2_email', 'parent_2_phone', 'emergency_contact_name',
      'emergency_contact_phone', 'medical_conditions', 'allergies', 'medications',
      'current_interventions', 'teaching_assistant_hours', 'notes'
    ];

    // Map frontend field names to database field names
    const fieldMap = {
      'firstName': 'first_name',
      'lastName': 'last_name',
      'yearGroup': 'year_group',
      'className': 'class_name',
      'primaryLanguage': 'primary_language',
      'sendStatus': 'send_status',
      'primaryNeed': 'primary_need',
      'secondaryNeeds': 'secondary_needs',
      'dateIdentified': 'date_identified',
      'medicalConditions': 'medical_conditions',
      'currentInterventions': 'current_interventions',
      'teachingAssistantHours': 'teaching_assistant_hours'
    };

    Object.entries(updateData).forEach(([key, value]) => {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = $${paramCount}`);

        // Handle JSON fields
        if (['secondary_needs', 'medical_conditions', 'allergies', 'medications', 'current_interventions'].includes(dbField)) {
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

    // Update send_register_entry_date if send_status changed to non-no_send
    if (updateData.sendStatus && updateData.sendStatus !== 'no_send') {
      updates.push(`send_register_entry_date = COALESCE(send_register_entry_date, CURRENT_DATE)`);
    }

    updates.push(`updated_at = NOW()`);
    values.push(studentId);

    await db.query(`
      UPDATE senco_students
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values);

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully'
    });

  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update student'
    }, { status: 500 });
  }
}
