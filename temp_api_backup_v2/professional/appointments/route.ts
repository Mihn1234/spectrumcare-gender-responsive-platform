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
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const status = url.searchParams.get('status') || 'all';
    const clientId = url.searchParams.get('clientId');
    const view = url.searchParams.get('view') || 'calendar'; // calendar, list
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build where clause
    let whereConditions = ['a.professional_id = $1'];
    const queryParams: any[] = [user.id];
    let paramCount = 1;

    // Date range filter
    if (startDate) {
      paramCount++;
      whereConditions.push(`a.appointment_date >= $${paramCount}`);
      queryParams.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereConditions.push(`a.appointment_date <= $${paramCount}`);
      queryParams.push(endDate);
    }

    // Status filter
    if (status !== 'all') {
      paramCount++;
      whereConditions.push(`a.status = $${paramCount}`);
      queryParams.push(status);
    }

    // Client filter
    if (clientId) {
      paramCount++;
      whereConditions.push(`a.client_id = $${paramCount}`);
      queryParams.push(clientId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get appointments
    const appointmentsQuery = `
      SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.duration_minutes,
        a.appointment_type,
        a.status,
        a.fee_amount,
        a.payment_status,
        a.notes,
        a.created_at,
        a.updated_at,
        pc.first_name as client_first_name,
        pc.last_name as client_last_name,
        pc.email as client_email,
        pc.phone as client_phone,
        pc.age as client_age,
        pc.condition_type,
        pc.emergency_contact_name,
        pc.emergency_contact_phone,
        (
          SELECT COUNT(*)
          FROM appointments a2
          WHERE a2.client_id = a.client_id
            AND a2.status = 'completed'
            AND a2.appointment_date < a.appointment_date
        ) as session_number,
        COUNT(*) OVER() as total_count
      FROM appointments a
      JOIN professional_clients pc ON a.client_id = pc.id
      ${whereClause}
      ORDER BY a.appointment_date, a.appointment_time
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(appointmentsQuery, queryParams);

    const appointments = result.rows.map(row => ({
      id: row.id,
      date: row.appointment_date,
      time: row.appointment_time,
      duration: parseInt(row.duration_minutes),
      type: row.appointment_type,
      status: row.status,
      feeAmount: parseFloat(row.fee_amount) || 0,
      paymentStatus: row.payment_status,
      notes: row.notes,
      sessionNumber: parseInt(row.session_number) + 1,
      client: {
        id: row.client_id,
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        fullName: `${row.client_first_name} ${row.client_last_name}`,
        email: row.client_email,
        phone: row.client_phone,
        age: row.client_age,
        conditionType: row.condition_type,
        emergencyContact: {
          name: row.emergency_contact_name,
          phone: row.emergency_contact_phone
        }
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
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
      appointmentDate,
      appointmentTime,
      durationMinutes = 60,
      appointmentType = 'assessment',
      feeAmount,
      notes,
      sendReminder = true
    } = body;

    // Validate required fields
    if (!clientId || !appointmentDate || !appointmentTime) {
      return NextResponse.json({
        success: false,
        message: 'Client ID, date, and time are required'
      }, { status: 400 });
    }

    // Verify client exists and belongs to professional
    const clientCheck = await db.query(`
      SELECT id, first_name, last_name, email
      FROM professional_clients
      WHERE id = $1 AND professional_id = $2 AND is_active = true
    `, [clientId, user.id]);

    if (clientCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Client not found'
      }, { status: 404 });
    }

    const client = clientCheck.rows[0];

    // Check for scheduling conflicts
    const conflictCheck = await db.query(`
      SELECT id FROM appointments
      WHERE professional_id = $1
        AND appointment_date = $2
        AND appointment_time < $3 + INTERVAL '${durationMinutes} minutes'
        AND appointment_time + INTERVAL '1 minute' * duration_minutes > $3
        AND status IN ('scheduled', 'confirmed')
    `, [user.id, appointmentDate, appointmentTime]);

    if (conflictCheck.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Time slot conflicts with existing appointment'
      }, { status: 400 });
    }

    // Create appointment
    const result = await db.query(`
      INSERT INTO appointments (
        professional_id, client_id, appointment_date, appointment_time,
        duration_minutes, appointment_type, status, fee_amount, notes,
        payment_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, 'pending', NOW(), NOW())
      RETURNING id
    `, [
      user.id,
      clientId,
      appointmentDate,
      appointmentTime,
      durationMinutes,
      appointmentType,
      feeAmount || null,
      notes || null
    ]);

    const appointmentId = result.rows[0].id;

    // Send confirmation email/SMS (if enabled)
    if (sendReminder && client.email) {
      // Create notification for client
      await db.query(`
        INSERT INTO notifications (
          user_id, title, message, notification_type, related_id, created_at
        ) VALUES (
          (SELECT id FROM users WHERE email = $1 LIMIT 1),
          $2, $3, 'APPOINTMENT_SCHEDULED', $4, NOW()
        )
      `, [
        client.email,
        'Appointment Scheduled',
        `Your appointment has been scheduled for ${appointmentDate} at ${appointmentTime}`,
        appointmentId
      ]);
    }

    // Log activity
    await db.query(`
      INSERT INTO professional_activity_log (
        professional_id, activity_type, description, related_id, created_at
      ) VALUES ($1, 'APPOINTMENT_CREATED', $2, $3, NOW())
    `, [
      user.id,
      `Scheduled ${appointmentType} appointment with ${client.first_name} ${client.last_name}`,
      appointmentId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: {
        appointmentId,
        clientName: `${client.first_name} ${client.last_name}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create appointment'
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
      appointmentId,
      status,
      appointmentDate,
      appointmentTime,
      durationMinutes,
      feeAmount,
      notes,
      paymentStatus,
      sessionNotes
    } = body;

    // Validate required fields
    if (!appointmentId) {
      return NextResponse.json({
        success: false,
        message: 'Appointment ID is required'
      }, { status: 400 });
    }

    // Verify appointment exists and belongs to professional
    const appointmentCheck = await db.query(`
      SELECT a.id, a.status as current_status, a.client_id,
             pc.first_name, pc.last_name
      FROM appointments a
      JOIN professional_clients pc ON a.client_id = pc.id
      WHERE a.id = $1 AND a.professional_id = $2
    `, [appointmentId, user.id]);

    if (appointmentCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 });
    }

    const appointment = appointmentCheck.rows[0];

    // Build update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (status) {
      updates.push(`status = $${paramCounter}`);
      values.push(status);
      paramCounter++;
    }

    if (appointmentDate) {
      updates.push(`appointment_date = $${paramCounter}`);
      values.push(appointmentDate);
      paramCounter++;
    }

    if (appointmentTime) {
      updates.push(`appointment_time = $${paramCounter}`);
      values.push(appointmentTime);
      paramCounter++;
    }

    if (durationMinutes) {
      updates.push(`duration_minutes = $${paramCounter}`);
      values.push(durationMinutes);
      paramCounter++;
    }

    if (feeAmount !== undefined) {
      updates.push(`fee_amount = $${paramCounter}`);
      values.push(feeAmount);
      paramCounter++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCounter}`);
      values.push(notes);
      paramCounter++;
    }

    if (paymentStatus) {
      updates.push(`payment_status = $${paramCounter}`);
      values.push(paymentStatus);
      paramCounter++;
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No updates provided'
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(appointmentId);

    // Update appointment
    await db.query(`
      UPDATE appointments
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
    `, values);

    // If session notes provided and status is completed, save them
    if (sessionNotes && status === 'completed') {
      await db.query(`
        INSERT INTO session_notes (
          appointment_id, professional_id, client_id, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (appointment_id)
        DO UPDATE SET notes = $4, updated_at = NOW()
      `, [appointmentId, user.id, appointment.client_id, sessionNotes]);
    }

    // Log activity
    let activityDescription = `Updated appointment with ${appointment.first_name} ${appointment.last_name}`;
    if (status && status !== appointment.current_status) {
      activityDescription = `Changed appointment status to ${status} for ${appointment.first_name} ${appointment.last_name}`;
    }

    await db.query(`
      INSERT INTO professional_activity_log (
        professional_id, activity_type, description, related_id, created_at
      ) VALUES ($1, 'APPOINTMENT_UPDATED', $2, $3, NOW())
    `, [user.id, activityDescription, appointmentId]);

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

export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url);
    const appointmentId = url.searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json({
        success: false,
        message: 'Appointment ID is required'
      }, { status: 400 });
    }

    // Verify appointment exists and belongs to professional
    const appointmentCheck = await db.query(`
      SELECT a.id, pc.first_name, pc.last_name
      FROM appointments a
      JOIN professional_clients pc ON a.client_id = pc.id
      WHERE a.id = $1 AND a.professional_id = $2
    `, [appointmentId, user.id]);

    if (appointmentCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Appointment not found'
      }, { status: 404 });
    }

    const appointment = appointmentCheck.rows[0];

    // Cancel appointment (soft delete)
    await db.query(`
      UPDATE appointments
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
    `, [appointmentId]);

    // Log activity
    await db.query(`
      INSERT INTO professional_activity_log (
        professional_id, activity_type, description, related_id, created_at
      ) VALUES ($1, 'APPOINTMENT_CANCELLED', $2, $3, NOW())
    `, [
      user.id,
      `Cancelled appointment with ${appointment.first_name} ${appointment.last_name}`,
      appointmentId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to cancel appointment'
    }, { status: 500 });
  }
}
