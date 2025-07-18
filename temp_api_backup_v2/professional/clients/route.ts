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
    const search = url.searchParams.get('search') || '';
    const conditionType = url.searchParams.get('conditionType') || 'all';
    const status = url.searchParams.get('status') || 'active';
    const sortBy = url.searchParams.get('sortBy') || 'created_at';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build where clause
    let whereConditions = ['pc.professional_id = $1'];
    const queryParams: any[] = [user.id];
    let paramCount = 1;

    // Status filter
    if (status === 'active') {
      whereConditions.push('pc.is_active = true');
    } else if (status === 'inactive') {
      whereConditions.push('pc.is_active = false');
    }

    // Search filter
    if (search) {
      paramCount++;
      whereConditions.push(`(
        pc.first_name ILIKE $${paramCount} OR
        pc.last_name ILIKE $${paramCount} OR
        pc.email ILIKE $${paramCount} OR
        CONCAT(pc.first_name, ' ', pc.last_name) ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }

    // Condition type filter
    if (conditionType !== 'all') {
      paramCount++;
      whereConditions.push(`pc.condition_type = $${paramCount}`);
      queryParams.push(conditionType);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Valid sort columns
    const validSortColumns = ['first_name', 'last_name', 'created_at', 'last_session', 'total_sessions'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get clients with session data
    const clientsQuery = `
      SELECT
        pc.id,
        pc.first_name,
        pc.last_name,
        pc.email,
        pc.phone,
        pc.date_of_birth,
        pc.age,
        pc.condition_type,
        pc.diagnosis_date,
        pc.referral_source,
        pc.emergency_contact_name,
        pc.emergency_contact_phone,
        pc.emergency_contact_relationship,
        pc.medical_conditions,
        pc.medications,
        pc.special_requirements,
        pc.goals,
        pc.notes,
        pc.is_active,
        pc.created_at,
        pc.updated_at,

        -- Session statistics
        COUNT(a.id) as total_sessions,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN a.status = 'scheduled' OR a.status = 'confirmed' THEN 1 END) as upcoming_sessions,
        MAX(CASE WHEN a.status = 'completed' THEN a.appointment_date END) as last_session_date,
        MIN(CASE WHEN a.status = 'scheduled' OR a.status = 'confirmed' THEN a.appointment_date END) as next_session_date,

        -- Financial data
        SUM(CASE WHEN a.status = 'completed' AND a.payment_status = 'paid' THEN a.fee_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN a.status = 'completed' AND a.payment_status = 'pending' THEN a.fee_amount ELSE 0 END) as outstanding_balance,

        -- Assessment data
        COUNT(ast.id) as total_assessments,
        COUNT(CASE WHEN ast.status = 'completed' THEN 1 END) as completed_assessments,
        MAX(ast.completion_date) as last_assessment_date,

        COUNT(*) OVER() as total_count
      FROM professional_clients pc
      LEFT JOIN appointments a ON pc.id = a.client_id
      LEFT JOIN assessments ast ON pc.id = ast.client_id AND ast.professional_id = pc.professional_id
      ${whereClause}
      GROUP BY pc.id, pc.first_name, pc.last_name, pc.email, pc.phone, pc.date_of_birth,
               pc.age, pc.condition_type, pc.diagnosis_date, pc.referral_source,
               pc.emergency_contact_name, pc.emergency_contact_phone, pc.emergency_contact_relationship,
               pc.medical_conditions, pc.medications, pc.special_requirements, pc.goals,
               pc.notes, pc.is_active, pc.created_at, pc.updated_at
      ORDER BY
        ${sortColumn === 'last_session' ? 'MAX(CASE WHEN a.status = \'completed\' THEN a.appointment_date END)' :
          sortColumn === 'total_sessions' ? 'COUNT(a.id)' :
          `pc.${sortColumn}`} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(clientsQuery, queryParams);

    const clients = result.rows.map(row => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}`,
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.date_of_birth,
      age: row.age,
      conditionType: row.condition_type,
      diagnosisDate: row.diagnosis_date,
      referralSource: row.referral_source,
      emergencyContact: {
        name: row.emergency_contact_name,
        phone: row.emergency_contact_phone,
        relationship: row.emergency_contact_relationship
      },
      medicalInfo: {
        conditions: row.medical_conditions ? JSON.parse(row.medical_conditions) : [],
        medications: row.medications ? JSON.parse(row.medications) : [],
        specialRequirements: row.special_requirements
      },
      goals: row.goals ? JSON.parse(row.goals) : [],
      notes: row.notes,
      isActive: row.is_active,

      // Session data
      sessionStats: {
        total: parseInt(row.total_sessions),
        completed: parseInt(row.completed_sessions),
        upcoming: parseInt(row.upcoming_sessions),
        lastDate: row.last_session_date,
        nextDate: row.next_session_date
      },

      // Financial data
      financial: {
        totalPaid: parseFloat(row.total_paid) || 0,
        outstandingBalance: parseFloat(row.outstanding_balance) || 0
      },

      // Assessment data
      assessmentStats: {
        total: parseInt(row.total_assessments),
        completed: parseInt(row.completed_assessments),
        lastDate: row.last_assessment_date
      },

      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch clients'
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
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      conditionType,
      diagnosisDate,
      referralSource,
      emergencyContact,
      medicalConditions = [],
      medications = [],
      specialRequirements,
      goals = [],
      notes,
      parentEmail // For linking to parent account
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !conditionType) {
      return NextResponse.json({
        success: false,
        message: 'First name, last name, email, and condition type are required'
      }, { status: 400 });
    }

    // Check if client already exists
    const existingClient = await db.query(`
      SELECT id FROM professional_clients
      WHERE professional_id = $1 AND email = $2
    `, [user.id, email]);

    if (existingClient.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Client with this email already exists'
      }, { status: 400 });
    }

    // Calculate age if date of birth provided
    let age = null;
    if (dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Create client
    const result = await db.query(`
      INSERT INTO professional_clients (
        professional_id, first_name, last_name, email, phone, date_of_birth, age,
        condition_type, diagnosis_date, referral_source, emergency_contact_name,
        emergency_contact_phone, emergency_contact_relationship, medical_conditions,
        medications, special_requirements, goals, notes, is_active,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true, NOW(), NOW()
      ) RETURNING id
    `, [
      user.id,
      firstName,
      lastName,
      email,
      phone || null,
      dateOfBirth || null,
      age,
      conditionType,
      diagnosisDate || null,
      referralSource || null,
      emergencyContact?.name || null,
      emergencyContact?.phone || null,
      emergencyContact?.relationship || null,
      JSON.stringify(medicalConditions),
      JSON.stringify(medications),
      specialRequirements || null,
      JSON.stringify(goals),
      notes || null
    ]);

    const clientId = result.rows[0].id;

    // Link to parent account if parent email provided
    if (parentEmail) {
      const parentUser = await db.query(`
        SELECT id FROM users WHERE email = $1 AND role = 'PARENT'
      `, [parentEmail]);

      if (parentUser.rows.length > 0) {
        await db.query(`
          INSERT INTO parent_professional_connections (
            parent_user_id, professional_user_id, child_id, status, created_at
          ) VALUES ($1, $2, $3, 'active', NOW())
        `, [parentUser.rows[0].id, user.id, clientId]);
      }
    }

    // Log activity
    await db.query(`
      INSERT INTO professional_activity_log (
        professional_id, activity_type, description, related_id, created_at
      ) VALUES ($1, 'CLIENT_ADDED', $2, $3, NOW())
    `, [
      user.id,
      `Added new client: ${firstName} ${lastName}`,
      clientId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Client added successfully',
      data: {
        clientId,
        clientName: `${firstName} ${lastName}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create client'
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
      clientId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      conditionType,
      diagnosisDate,
      referralSource,
      emergencyContact,
      medicalConditions,
      medications,
      specialRequirements,
      goals,
      notes,
      isActive
    } = body;

    // Validate required fields
    if (!clientId) {
      return NextResponse.json({
        success: false,
        message: 'Client ID is required'
      }, { status: 400 });
    }

    // Verify client exists and belongs to professional
    const clientCheck = await db.query(`
      SELECT id, first_name, last_name FROM professional_clients
      WHERE id = $1 AND professional_id = $2
    `, [clientId, user.id]);

    if (clientCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Client not found'
      }, { status: 404 });
    }

    const client = clientCheck.rows[0];

    // Build update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (firstName) {
      updates.push(`first_name = $${paramCounter}`);
      values.push(firstName);
      paramCounter++;
    }

    if (lastName) {
      updates.push(`last_name = $${paramCounter}`);
      values.push(lastName);
      paramCounter++;
    }

    if (email) {
      updates.push(`email = $${paramCounter}`);
      values.push(email);
      paramCounter++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCounter}`);
      values.push(phone);
      paramCounter++;
    }

    if (dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCounter}`);
      values.push(dateOfBirth);
      paramCounter++;

      // Recalculate age
      if (dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        updates.push(`age = $${paramCounter}`);
        values.push(age);
        paramCounter++;
      }
    }

    if (conditionType) {
      updates.push(`condition_type = $${paramCounter}`);
      values.push(conditionType);
      paramCounter++;
    }

    if (diagnosisDate !== undefined) {
      updates.push(`diagnosis_date = $${paramCounter}`);
      values.push(diagnosisDate);
      paramCounter++;
    }

    if (referralSource !== undefined) {
      updates.push(`referral_source = $${paramCounter}`);
      values.push(referralSource);
      paramCounter++;
    }

    if (emergencyContact) {
      if (emergencyContact.name !== undefined) {
        updates.push(`emergency_contact_name = $${paramCounter}`);
        values.push(emergencyContact.name);
        paramCounter++;
      }
      if (emergencyContact.phone !== undefined) {
        updates.push(`emergency_contact_phone = $${paramCounter}`);
        values.push(emergencyContact.phone);
        paramCounter++;
      }
      if (emergencyContact.relationship !== undefined) {
        updates.push(`emergency_contact_relationship = $${paramCounter}`);
        values.push(emergencyContact.relationship);
        paramCounter++;
      }
    }

    if (medicalConditions !== undefined) {
      updates.push(`medical_conditions = $${paramCounter}`);
      values.push(JSON.stringify(medicalConditions));
      paramCounter++;
    }

    if (medications !== undefined) {
      updates.push(`medications = $${paramCounter}`);
      values.push(JSON.stringify(medications));
      paramCounter++;
    }

    if (specialRequirements !== undefined) {
      updates.push(`special_requirements = $${paramCounter}`);
      values.push(specialRequirements);
      paramCounter++;
    }

    if (goals !== undefined) {
      updates.push(`goals = $${paramCounter}`);
      values.push(JSON.stringify(goals));
      paramCounter++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCounter}`);
      values.push(notes);
      paramCounter++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCounter}`);
      values.push(isActive);
      paramCounter++;
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No updates provided'
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(clientId);

    // Update client
    await db.query(`
      UPDATE professional_clients
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
    `, values);

    // Log activity
    await db.query(`
      INSERT INTO professional_activity_log (
        professional_id, activity_type, description, related_id, created_at
      ) VALUES ($1, 'CLIENT_UPDATED', $2, $3, NOW())
    `, [
      user.id,
      `Updated client: ${client.first_name} ${client.last_name}`,
      clientId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Client updated successfully'
    });

  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update client'
    }, { status: 500 });
  }
}
