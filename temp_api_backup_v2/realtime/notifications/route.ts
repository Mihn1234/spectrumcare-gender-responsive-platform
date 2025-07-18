import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/database';
import { getWebSocketManager } from '@/lib/websocket/server';

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

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const type = url.searchParams.get('type');

    // Build where clause
    let whereConditions = ['user_id = $1'];
    const queryParams: any[] = [user.id];
    let paramCount = 1;

    if (unreadOnly) {
      whereConditions.push('is_read = FALSE');
    }

    if (type) {
      paramCount++;
      whereConditions.push(`notification_type = $${paramCount}`);
      queryParams.push(type);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get notifications
    const notificationsQuery = `
      SELECT
        n.id,
        n.notification_type,
        n.title,
        n.message,
        n.sender_id,
        n.related_id,
        n.priority,
        n.is_read,
        n.read_at,
        n.expires_at,
        n.metadata,
        n.created_at,
        n.updated_at,
        CASE
          WHEN n.sender_id IS NOT NULL THEN
            CONCAT(sender.profile_data->>'firstName', ' ', sender.profile_data->>'lastName')
          ELSE NULL
        END as sender_name,
        CASE
          WHEN n.sender_id IS NOT NULL THEN sender.email
          ELSE NULL
        END as sender_email,
        COUNT(*) OVER() as total_count
      FROM notifications n
      LEFT JOIN users sender ON n.sender_id = sender.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(notificationsQuery, queryParams);

    // Get unread count
    const unreadCountResult = await db.query(`
      SELECT get_unread_notification_count($1) as unread_count
    `, [user.id]);

    const notifications = result.rows.map(row => ({
      id: row.id,
      type: row.notification_type,
      title: row.title,
      message: row.message,
      senderId: row.sender_id,
      senderName: row.sender_name,
      senderEmail: row.sender_email,
      relatedId: row.related_id,
      priority: row.priority,
      isRead: row.is_read,
      readAt: row.read_at,
      expiresAt: row.expires_at,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const unreadCount = parseInt(unreadCountResult.rows[0].unread_count);

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch notifications'
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

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const body = await request.json();
    const {
      recipientId,
      type,
      title,
      message,
      relatedId,
      priority = 'medium',
      expiresAt,
      metadata
    } = body;

    // Validate required fields
    if (!recipientId || !type || !title || !message) {
      return NextResponse.json({
        success: false,
        message: 'Recipient ID, type, title, and message are required'
      }, { status: 400 });
    }

    // Verify recipient exists
    const recipientCheck = await db.query(`
      SELECT id FROM users WHERE id = $1
    `, [recipientId]);

    if (recipientCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Recipient not found'
      }, { status: 404 });
    }

    // Create notification
    const result = await db.query(`
      INSERT INTO notifications (
        user_id, notification_type, title, message, sender_id, related_id,
        priority, expires_at, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, created_at
    `, [
      recipientId,
      type,
      title,
      message,
      user.id,
      relatedId || null,
      priority,
      expiresAt || null,
      metadata ? JSON.stringify(metadata) : null
    ]);

    const notificationId = result.rows[0].id;
    const createdAt = result.rows[0].created_at;

    // Broadcast notification via WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      await wsManager.broadcastNotification({
        type,
        title,
        message,
        recipientId,
        senderId: user.id,
        relatedId,
        priority
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notificationId,
        createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create notification'
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

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const body = await request.json();
    const { notificationIds, action } = body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Notification IDs array is required'
      }, { status: 400 });
    }

    if (!action || !['mark_read', 'mark_unread', 'delete'].includes(action)) {
      return NextResponse.json({
        success: false,
        message: 'Valid action is required (mark_read, mark_unread, delete)'
      }, { status: 400 });
    }

    let query: string;
    let params: any[];

    if (action === 'mark_read') {
      query = `
        UPDATE notifications
        SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
        WHERE id = ANY($1::uuid[]) AND user_id = $2
        RETURNING id
      `;
      params = [notificationIds, user.id];

    } else if (action === 'mark_unread') {
      query = `
        UPDATE notifications
        SET is_read = FALSE, read_at = NULL, updated_at = NOW()
        WHERE id = ANY($1::uuid[]) AND user_id = $2
        RETURNING id
      `;
      params = [notificationIds, user.id];

    } else if (action === 'delete') {
      query = `
        DELETE FROM notifications
        WHERE id = ANY($1::uuid[]) AND user_id = $2
        RETURNING id
      `;
      params = [notificationIds, user.id];
    }

    const result = await db.query(query!, params!);

    return NextResponse.json({
      success: true,
      message: `Successfully ${action.replace('_', ' ')}ed ${result.rows.length} notifications`,
      data: {
        updatedCount: result.rows.length,
        updatedIds: result.rows.map(row => row.id)
      }
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update notifications'
    }, { status: 500 });
  }
}
