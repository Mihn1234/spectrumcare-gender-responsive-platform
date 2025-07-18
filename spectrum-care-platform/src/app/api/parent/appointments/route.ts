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

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const childId = url.searchParams.get('childId');
    const status = url.searchParams.get('status');
    const fromDate = url.searchParams.get('fromDate');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build query conditions
    let whereClause = `
      WHERE fr.parent_user_id = $1
        AND a.is_active = true
    `;
    const queryParams = [user.id];

    if (childId) {
      whereClause += ` AND c.id = $${queryParams.length + 1}`;
      queryParams.push(childId);
    }

    if (status) {
      whereClause += ` AND a.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (fromDate) {
      whereClause += ` AND a.appointment_date >= $${queryParams.length + 1}`;
      queryParams.push(fromDate);
    }

    // Get appointments
    const result = await db.query(`
      SELECT
        a.id,
        a.title,
        a.description,
        a.appointment_date,
        a.appointment_time,
        a.duration_minutes,
        a.appointment_type,
        a.status,
        a.location,
        a.location_type,
        a.notes,
        a.created_at,
        a.updated_at,
        c.first_name,
        c.last_name,
        CONCAT(prof.first_name, ' ', prof.last_name) as professional_name,
        prof.specialization,
        prof.organization,
        prof.email as professional_email,
        prof.phone as professional_phone,
        COUNT(*) OVER() as total_count
      FROM appointments a
      JOIN children c ON a.child_id = c.id
      JOIN family_relationships fr ON c.id = fr.child_id
      LEFT JOIN users prof ON a.professional_id = prof.id
      ${whereClause}
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `, [...queryParams, limit, offset]);

    const appointments = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.appointment_date,
      time: row.appointment_time,
      duration: row.duration_minutes,
      type: row.appointment_type,
      status: row.status,
      location: row.location,
      locationType: row.location_type,
      notes: row.notes,
      childName: `${row.first_name} ${row.last_name}`,
      professional: {
        name: row.professional_name,
        specialization: row.specialization,
        organization: row.organization,
        email: row.professional_email,
        phone: row.professional_phone
      }
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: appointments,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch appointments'
    }, { status: 500 });
  }
}

// POST - Request new appointment
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

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      childId,
      title,
      description,
      appointmentType,
      preferredDate,
      preferredTime,
      professionalId,
      notes
    } = body;

    // Validate required fields
    if (!childId || !title || !appointmentType) {
      return NextResponse.json({
        success: false,
        message: 'Child ID, title, and appointment type are required'
      }, { status: 400 });
    }

    // Verify parent has access to this child
    const accessCheck = await db.query(`
      SELECT c.id
      FROM children c
      JOIN family_relationships fr ON c.id = fr.child_id
      WHERE c.id = $1 AND fr.parent_user_id = $2
    `, [childId, user.id]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Child not found or access denied'
      }, { status: 404 });
    }

    // Create appointment request
    const result = await db.query(`
      INSERT INTO appointments (
        child_id, title, description, appointment_type,
        appointment_date, appointment_time, professional_id,
        status, notes, requested_by_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'REQUESTED', $8, $9, NOW(), NOW())
      RETURNING id
    `, [
      childId,
      title,
      description,
      appointmentType,
      preferredDate || null,
      preferredTime || null,
      professionalId || null,
      notes,
      user.id
    ]);

    // Create notification for professional if specified
    if (professionalId) {
      await db.query(`
        INSERT INTO notifications (
          user_id, title, message, notification_type,
          related_id, created_at
        ) VALUES ($1, $2, $3, 'APPOINTMENT_REQUEST', $4, NOW())
      `, [
        professionalId,
        'New Appointment Request',
        `New appointment request from ${user.profile_data?.firstName} ${user.profile_data?.lastName} for ${title}`,
        result.rows[0].id
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment request submitted successfully',
      appointmentId: result.rows[0].id
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create appointment request'
    }, { status: 500 });
  }
}

// PUT - Update appointment (cancel, reschedule)
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

    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 403 });
    }

    const body = await request.json();
    const { appointmentId, status, notes, newDate, newTime } = body;

    // Validate required fields
    if (!appointmentId) {
      return NextResponse.json({
        success: false,
        message: 'Appointment ID is required'
      }, { status: 400 });
    }

    // Verify parent has access to this appointment
    const accessCheck = await db.query(`
      SELECT a.id, a.status as current_status
      FROM appointments a
      JOIN children c ON a.child_id = c.id
      JOIN family_relationships fr ON c.id = fr.child_id
      WHERE a.id = $1 AND fr.parent_user_id = $2
    `, [appointmentId, user.id]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found or access denied'
      }, { status: 404 });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (status) {
      updates.push(`status = $${paramCounter}`);
      values.push(status);
      paramCounter++;
    }

    if (notes) {
      updates.push(`notes = $${paramCounter}`);
      values.push(notes);
      paramCounter++;
    }

    if (newDate) {
      updates.push(`appointment_date = $${paramCounter}`);
      values.push(newDate);
      paramCounter++;
    }

    if (newTime) {
      updates.push(`appointment_time = $${paramCounter}`);
      values.push(newTime);
      paramCounter++;
    }

    updates.push(`updated_at = NOW()`);
    values.push(appointmentId);

    // Update appointment
    await db.query(`
      UPDATE appointments
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
    `, values);

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update appointment'
    }, { status: 500 });
  }
}
