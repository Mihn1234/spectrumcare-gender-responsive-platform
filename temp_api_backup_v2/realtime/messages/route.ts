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
    const conversationId = url.searchParams.get('conversationId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const beforeMessageId = url.searchParams.get('beforeMessageId');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        message: 'Conversation ID is required'
      }, { status: 400 });
    }

    // Verify user is participant in conversation
    const participantCheck = await db.query(`
      SELECT cp.id FROM conversation_participants cp
      WHERE cp.conversation_id = $1 AND cp.user_id = $2 AND cp.is_active = TRUE
    `, [conversationId, user.id]);

    if (participantCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Access denied to this conversation'
      }, { status: 403 });
    }

    // Build where clause for pagination
    let whereConditions = ['m.conversation_id = $1'];
    const queryParams: any[] = [conversationId];
    let paramCount = 1;

    if (beforeMessageId) {
      paramCount++;
      whereConditions.push(`m.created_at < (SELECT created_at FROM messages WHERE id = $${paramCount})`);
      queryParams.push(beforeMessageId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get messages
    const messagesQuery = `
      SELECT
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.message_type,
        m.file_url,
        m.file_name,
        m.file_size,
        m.reply_to,
        m.is_edited,
        m.edited_at,
        m.metadata,
        m.created_at,
        m.updated_at,
        sender.email as sender_email,
        CONCAT(sender.profile_data->>'firstName', ' ', sender.profile_data->>'lastName') as sender_name,
        sender.role as sender_role,
        reply_msg.content as reply_content,
        reply_sender.email as reply_sender_email,
        CONCAT(reply_sender.profile_data->>'firstName', ' ', reply_sender.profile_data->>'lastName') as reply_sender_name,
        COUNT(*) OVER() as total_count
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN messages reply_msg ON m.reply_to = reply_msg.id
      LEFT JOIN users reply_sender ON reply_msg.sender_id = reply_sender.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(messagesQuery, queryParams);

    const messages = result.rows.map(row => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderEmail: row.sender_email,
      senderName: row.sender_name?.trim() || row.sender_email,
      senderRole: row.sender_role,
      content: row.content,
      messageType: row.message_type,
      file: row.file_url ? {
        url: row.file_url,
        name: row.file_name,
        size: row.file_size
      } : null,
      replyTo: row.reply_to ? {
        id: row.reply_to,
        content: row.reply_content,
        senderName: row.reply_sender_name?.trim() || row.reply_sender_email
      } : null,
      isEdited: row.is_edited,
      editedAt: row.edited_at,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    // Update last read timestamp
    await db.query(`
      UPDATE conversation_participants
      SET last_read_at = NOW()
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, user.id]);

    return NextResponse.json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch messages'
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
      conversationId,
      content,
      messageType = 'text',
      replyTo,
      fileUrl,
      fileName,
      fileSize,
      metadata
    } = body;

    // Validate required fields
    if (!conversationId || !content) {
      return NextResponse.json({
        success: false,
        message: 'Conversation ID and content are required'
      }, { status: 400 });
    }

    // Verify user is participant in conversation
    const participantCheck = await db.query(`
      SELECT cp.id FROM conversation_participants cp
      WHERE cp.conversation_id = $1 AND cp.user_id = $2 AND cp.is_active = TRUE
    `, [conversationId, user.id]);

    if (participantCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Access denied to this conversation'
      }, { status: 403 });
    }

    // Create message
    const result = await db.query(`
      INSERT INTO messages (
        conversation_id, sender_id, content, message_type, file_url, file_name,
        file_size, reply_to, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, created_at
    `, [
      conversationId,
      user.id,
      content,
      messageType,
      fileUrl || null,
      fileName || null,
      fileSize || null,
      replyTo || null,
      metadata ? JSON.stringify(metadata) : null
    ]);

    const messageId = result.rows[0].id;
    const createdAt = result.rows[0].created_at;

    // Get conversation participants for broadcasting
    const participantsResult = await db.query(`
      SELECT cp.user_id FROM conversation_participants cp
      WHERE cp.conversation_id = $1 AND cp.is_active = TRUE
    `, [conversationId]);

    const participants = participantsResult.rows.map(row => row.user_id);

    // Broadcast message via WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      const messageData = {
        id: messageId,
        conversationId,
        senderId: user.id,
        senderName: `${user.profile_data?.firstName} ${user.profile_data?.lastName}`.trim() || user.email,
        senderRole: user.role,
        content,
        messageType,
        file: fileUrl ? { url: fileUrl, name: fileName, size: fileSize } : null,
        replyTo,
        timestamp: createdAt,
        participants
      };

      // Emit to all conversation participants
      participants.forEach(participantId => {
        wsManager.io.to(`user:${participantId}`).emit('message:new', messageData);
      });
    }

    // Create notifications for other participants
    const otherParticipants = participants.filter(id => id !== user.id);
    for (const participantId of otherParticipants) {
      await db.query(`
        INSERT INTO notifications (
          user_id, notification_type, title, message, sender_id, related_id, priority, created_at
        ) VALUES ($1, 'message', 'New Message', $2, $3, $4, 'medium', NOW())
      `, [
        participantId,
        `New message from ${user.profile_data?.firstName || user.email}`,
        user.id,
        conversationId
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId,
        createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send message'
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
    const { messageId, content, metadata } = body;

    if (!messageId || !content) {
      return NextResponse.json({
        success: false,
        message: 'Message ID and content are required'
      }, { status: 400 });
    }

    // Verify user owns the message
    const messageCheck = await db.query(`
      SELECT m.id, m.conversation_id FROM messages m
      WHERE m.id = $1 AND m.sender_id = $2
    `, [messageId, user.id]);

    if (messageCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Message not found or access denied'
      }, { status: 404 });
    }

    const conversationId = messageCheck.rows[0].conversation_id;

    // Update message
    await db.query(`
      UPDATE messages
      SET content = $1, metadata = $2, is_edited = TRUE, edited_at = NOW(), updated_at = NOW()
      WHERE id = $3
    `, [content, metadata ? JSON.stringify(metadata) : null, messageId]);

    // Broadcast edit via WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.io.to(`conversation:${conversationId}`).emit('message:edited', {
        messageId,
        content,
        editedAt: new Date(),
        metadata
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update message'
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

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const url = new URL(request.url);
    const messageId = url.searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({
        success: false,
        message: 'Message ID is required'
      }, { status: 400 });
    }

    // Verify user owns the message
    const messageCheck = await db.query(`
      SELECT m.id, m.conversation_id FROM messages m
      WHERE m.id = $1 AND m.sender_id = $2
    `, [messageId, user.id]);

    if (messageCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Message not found or access denied'
      }, { status: 404 });
    }

    const conversationId = messageCheck.rows[0].conversation_id;

    // Soft delete message
    await db.query(`
      UPDATE messages
      SET content = '[Message deleted]', message_type = 'system', updated_at = NOW()
      WHERE id = $1
    `, [messageId]);

    // Broadcast deletion via WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.io.to(`conversation:${conversationId}`).emit('message:deleted', {
        messageId,
        deletedAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete message'
    }, { status: 500 });
  }
}
