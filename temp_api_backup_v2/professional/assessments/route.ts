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

    // Get query parameters
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const assessmentType = url.searchParams.get('assessmentType') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build where clause
    let whereConditions = ['a.professional_id = $1'];
    const queryParams: any[] = [user.id];
    let paramCount = 1;

    if (clientId) {
      paramCount++;
      whereConditions.push(`a.client_id = $${paramCount}`);
      queryParams.push(clientId);
    }

    if (assessmentType !== 'all') {
      paramCount++;
      whereConditions.push(`a.assessment_type = $${paramCount}`);
      queryParams.push(assessmentType);
    }

    if (status !== 'all') {
      paramCount++;
      whereConditions.push(`a.status = $${paramCount}`);
      queryParams.push(status);
    }

    if (dateFrom) {
      paramCount++;
      whereConditions.push(`a.created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereConditions.push(`a.created_at <= $${paramCount}`);
      queryParams.push(dateTo);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get assessments
    const assessmentsQuery = `
      SELECT
        a.id,
        a.assessment_type,
        a.title,
        a.description,
        a.status,
        a.assessment_data,
        a.scores,
        a.recommendations,
        a.completion_date,
        a.created_at,
        a.updated_at,
        pc.first_name as client_first_name,
        pc.last_name as client_last_name,
        pc.age as client_age,
        pc.condition_type,
        COUNT(*) OVER() as total_count
      FROM assessments a
      JOIN professional_clients pc ON a.client_id = pc.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(assessmentsQuery, queryParams);

    const assessments = result.rows.map(row => ({
      id: row.id,
      assessmentType: row.assessment_type,
      title: row.title,
      description: row.description,
      status: row.status,
      assessmentData: row.assessment_data ? JSON.parse(row.assessment_data) : null,
      scores: row.scores ? JSON.parse(row.scores) : null,
      recommendations: row.recommendations ? JSON.parse(row.recommendations) : [],
      completionDate: row.completion_date,
      client: {
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        fullName: `${row.client_first_name} ${row.client_last_name}`,
        age: row.client_age,
        conditionType: row.condition_type
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: assessments,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch assessments'
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

    if (!user || user.role !== 'PROFESSIONAL') {
      return NextResponse.json({
        success: false,
        message: 'Professional access required'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientId,
      assessmentType,
      title,
      description,
      assessmentData,
      templateId
    } = body;

    // Validate required fields
    if (!clientId || !assessmentType || !title) {
      return NextResponse.json({
        success: false,
        message: 'Client ID, assessment type, and title are required'
      }, { status: 400 });
    }

    // Verify client exists and belongs to professional
    const clientCheck = await db.query(`
      SELECT id, first_name, last_name FROM professional_clients
      WHERE id = $1 AND professional_id = $2 AND is_active = true
    `, [clientId, user.id]);

    if (clientCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Client not found'
      }, { status: 404 });
    }

    const client = clientCheck.rows[0];

    // Get template data if templateId provided
    let templateData = null;
    if (templateId) {
      const templateResult = await db.query(`
        SELECT template_data FROM assessment_templates
        WHERE id = $1 AND (is_public = true OR created_by = $2)
      `, [templateId, user.id]);

      if (templateResult.rows.length > 0) {
        templateData = templateResult.rows[0].template_data;
      }
    }

    // Create assessment
    const result = await db.query(`
      INSERT INTO assessments (
        professional_id, client_id, assessment_type, title, description,
        assessment_data, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'in_progress', NOW(), NOW())
      RETURNING id
    `, [
      user.id,
      clientId,
      assessmentType,
      title,
      description || null,
      JSON.stringify(assessmentData || templateData || {})
    ]);

    const assessmentId = result.rows[0].id;

    // Log activity
    await db.query(`
      INSERT INTO professional_activity_log (
        professional_id, activity_type, description, related_id, created_at
      ) VALUES ($1, 'ASSESSMENT_CREATED', $2, $3, NOW())
    `, [
      user.id,
      `Started ${assessmentType} assessment for ${client.first_name} ${client.last_name}`,
      assessmentId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Assessment created successfully',
      data: {
        assessmentId,
        clientName: `${client.first_name} ${client.last_name}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create assessment'
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

    if (!user || user.role !== 'PROFESSIONAL') {
      return NextResponse.json({
        success: false,
        message: 'Professional access required'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      assessmentId,
      assessmentData,
      scores,
      recommendations,
      status,
      completionDate
    } = body;

    // Validate required fields
    if (!assessmentId) {
      return NextResponse.json({
        success: false,
        message: 'Assessment ID is required'
      }, { status: 400 });
    }

    // Verify assessment exists and belongs to professional
    const assessmentCheck = await db.query(`
      SELECT a.id, a.status as current_status, pc.first_name, pc.last_name
      FROM assessments a
      JOIN professional_clients pc ON a.client_id = pc.id
      WHERE a.id = $1 AND a.professional_id = $2
    `, [assessmentId, user.id]);

    if (assessmentCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Assessment not found'
      }, { status: 404 });
    }

    const assessment = assessmentCheck.rows[0];

    // Build update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (assessmentData !== undefined) {
      updates.push(`assessment_data = $${paramCounter}`);
      values.push(JSON.stringify(assessmentData));
      paramCounter++;
    }

    if (scores !== undefined) {
      updates.push(`scores = $${paramCounter}`);
      values.push(JSON.stringify(scores));
      paramCounter++;
    }

    if (recommendations !== undefined) {
      updates.push(`recommendations = $${paramCounter}`);
      values.push(JSON.stringify(recommendations));
      paramCounter++;
    }

    if (status) {
      updates.push(`status = $${paramCounter}`);
      values.push(status);
      paramCounter++;

      // Set completion date if completing
      if (status === 'completed' && !completionDate) {
        updates.push(`completion_date = NOW()`);
      }
    }

    if (completionDate) {
      updates.push(`completion_date = $${paramCounter}`);
      values.push(completionDate);
      paramCounter++;
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No updates provided'
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(assessmentId);

    // Update assessment
    await db.query(`
      UPDATE assessments
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
    `, values);

    // Log activity if status changed
    if (status && status !== assessment.current_status) {
      let activityDescription = `Updated assessment for ${assessment.first_name} ${assessment.last_name}`;
      if (status === 'completed') {
        activityDescription = `Completed assessment for ${assessment.first_name} ${assessment.last_name}`;
      }

      await db.query(`
        INSERT INTO professional_activity_log (
          professional_id, activity_type, description, related_id, created_at
        ) VALUES ($1, 'ASSESSMENT_UPDATED', $2, $3, NOW())
      `, [user.id, activityDescription, assessmentId]);
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment updated successfully'
    });

  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update assessment'
    }, { status: 500 });
  }
}

// Get assessment templates
export async function GET_TEMPLATES(request: NextRequest) {
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

    // Get assessment templates
    const templatesQuery = `
      SELECT
        id,
        name,
        description,
        assessment_type,
        template_data,
        is_public,
        created_by,
        created_at
      FROM assessment_templates
      WHERE is_public = true OR created_by = $1
      ORDER BY is_public DESC, name ASC
    `;

    const result = await db.query(templatesQuery, [user.id]);

    const templates = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      assessmentType: row.assessment_type,
      templateData: JSON.parse(row.template_data),
      isPublic: row.is_public,
      isOwned: row.created_by === user.id,
      createdAt: row.created_at
    }));

    return NextResponse.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Error fetching assessment templates:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch templates'
    }, { status: 500 });
  }
}

// Default assessment templates
const DEFAULT_ASSESSMENT_TEMPLATES = {
  'autism_diagnostic': {
    name: 'Autism Diagnostic Assessment',
    sections: [
      {
        title: 'Social Interaction',
        questions: [
          'Eye contact patterns',
          'Social reciprocity',
          'Non-verbal communication',
          'Peer relationships'
        ]
      },
      {
        title: 'Communication',
        questions: [
          'Verbal communication skills',
          'Non-verbal communication',
          'Conversation abilities',
          'Language development'
        ]
      },
      {
        title: 'Restricted/Repetitive Behaviors',
        questions: [
          'Repetitive motor movements',
          'Routine adherence',
          'Special interests',
          'Sensory sensitivities'
        ]
      }
    ],
    scoringCriteria: {
      'Minimal concern': '0-2 points per section',
      'Some concern': '3-4 points per section',
      'Significant concern': '5+ points per section'
    }
  },
  'developmental_assessment': {
    name: 'Developmental Assessment',
    sections: [
      {
        title: 'Cognitive Development',
        questions: [
          'Problem-solving abilities',
          'Memory and learning',
          'Attention and focus',
          'Processing speed'
        ]
      },
      {
        title: 'Motor Development',
        questions: [
          'Fine motor skills',
          'Gross motor skills',
          'Coordination',
          'Motor planning'
        ]
      },
      {
        title: 'Language Development',
        questions: [
          'Receptive language',
          'Expressive language',
          'Pragmatic skills',
          'Literacy development'
        ]
      }
    ]
  },
  'behavioral_assessment': {
    name: 'Behavioral Assessment',
    sections: [
      {
        title: 'Challenging Behaviors',
        questions: [
          'Frequency of behaviors',
          'Triggers and antecedents',
          'Function of behaviors',
          'Impact on daily life'
        ]
      },
      {
        title: 'Adaptive Behaviors',
        questions: [
          'Self-care skills',
          'Social skills',
          'Independence level',
          'Coping strategies'
        ]
      }
    ]
  }
};
