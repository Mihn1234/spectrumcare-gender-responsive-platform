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

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Get user's conversations
    const conversationsResult = await db.query(`
      SELECT * FROM get_user_conversations($1)
    `, [user.id]);

    const conversations = await Promise.all(conversationsResult.rows.map(async (row) => {
      // Get participants for each conversation
      const participantsResult = await db.query(`
        SELECT
          cp.user_id,
          cp.role as participant_role,
          cp.joined_at,
          u.email,
          u.role as user_role,
          CONCAT(u.profile_data->>'firstName', ' ', u.profile_data->>'lastName') as full_name
        FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = $1 AND cp.is_active = TRUE
        ORDER BY cp.joined_at
      `, [row.conversation_id]);

      const participants = participantsResult.rows.map(p => ({
        userId: p.user_id,
        email: p.email,
        fullName: p.full_name?.trim() || p.email,
        userRole: p.user_role,
        participantRole: p.participant_role,
        joinedAt: p.joined_at
      }));

      return {
        id: row.conversation_id,
        name: row.conversation_name,
        type: row.conversation_type,
        participants,
        lastMessage: {
          content: row.last_message_content,
          timestamp: row.last_message_at
        },
        unreadCount: parseInt(row.unread_count || '0'),
        participantCount: parseInt(row.participant_count || '0')
      };
    }));

    return NextResponse.json({
      success: true,
      data: conversations
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch conversations'
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
      participantIds,
      name,
      type = 'direct',
      relatedId,
      metadata
    } = body;

    // Validate required fields
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Participant IDs array is required'
      }, { status: 400 });
    }

    // Add creator to participants if not already included
    const allParticipants = [...new Set([user.id, ...participantIds])];

    // Verify all participants exist
    const participantCheck = await db.query(`
      SELECT id FROM users WHERE id = ANY($1::uuid[])
    `, [allParticipants]);

    if (participantCheck.rows.length !== allParticipants.length) {
      return NextResponse.json({
        success: false,
        message: 'One or more participants not found'
      }, { status: 404 });
    }

    // For direct conversations, check if one already exists
    if (type === 'direct' && allParticipants.length === 2) {
      const existingConversation = await db.query(`
        SELECT c.id
        FROM conversations c
        WHERE c.conversation_type = 'direct'
        AND (
          SELECT COUNT(DISTINCT cp.user_id)
          FROM conversation_participants cp
          WHERE cp.conversation_id = c.id
          AND cp.is_active = TRUE
          AND cp.user_id = ANY($1::uuid[])
        ) = 2
        AND (
          SELECT COUNT(*)
          FROM conversation_participants cp
          WHERE cp.conversation_id = c.id
          AND cp.is_active = TRUE
        ) = 2
        LIMIT 1
      `, [allParticipants]);

      if (existingConversation.rows.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'Conversation already exists',
          data: {
            conversationId: existingConversation.rows[0].id,
            isExisting: true
          }
        });
      }
    }

    // Create conversation
    const conversationResult = await db.query(`
      INSERT INTO conversations (
        name, conversation_type, related_id, created_by, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id
    `, [
      name || (type === 'direct' ? null : `Group Chat`),
      type,
      relatedId || null,
      user.id,
      metadata ? JSON.stringify(metadata) : null
    ]);

    const conversationId = conversationResult.rows[0].id;

    // Add participants
    for (const participantId of allParticipants) {
      const role = participantId === user.id ? 'admin' : 'participant';
      await db.query(`
        INSERT INTO conversation_participants (
          conversation_id, user_id, role, joined_at
        ) VALUES ($1, $2, $3, NOW())
      `, [conversationId, participantId, role]);
    }

    // Send system message
    await db.query(`
      INSERT INTO messages (
        conversation_id, sender_id, content, message_type, created_at, updated_at
      ) VALUES ($1, $2, $3, 'system', NOW(), NOW())
    `, [
      conversationId,
      user.id,
      `${user.profile_data?.firstName || user.email} created this conversation`
    ]);

    // Create notifications for other participants
    const otherParticipants = participantIds.filter((id: string) => id !== user.id);
    for (const participantId of otherParticipants) {
      await db.query(`
        INSERT INTO notifications (
          user_id, notification_type, title, message, sender_id, related_id, priority, created_at
        ) VALUES ($1, 'message', 'New Conversation', $2, $3, $4, 'medium', NOW())
      `, [
        participantId,
        `You've been added to a conversation by ${user.profile_data?.firstName || user.email}`,
        user.id,
        conversationId
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation created successfully',
      data: {
        conversationId,
        isExisting: false
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create conversation'
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
    const { conversationId, action, name, participantIds } = body;

    if (!conversationId || !action) {
      return NextResponse.json({
        success: false,
        message: 'Conversation ID and action are required'
      }, { status: 400 });
    }

    // Verify user is admin of conversation
    const adminCheck = await db.query(`
      SELECT cp.id FROM conversation_participants cp
      WHERE cp.conversation_id = $1 AND cp.user_id = $2 AND cp.role = 'admin' AND cp.is_active = TRUE
    `, [conversationId, user.id]);

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    switch (action) {
      case 'update_name':
        if (!name) {
          return NextResponse.json({
            success: false,
            message: 'Name is required'
          }, { status: 400 });
        }

        await db.query(`
          UPDATE conversations
          SET name = $1, updated_at = NOW()
          WHERE id = $2
        `, [name, conversationId]);

        // Send system message
        await db.query(`
          INSERT INTO messages (
            conversation_id, sender_id, content, message_type, created_at, updated_at
          ) VALUES ($1, $2, $3, 'system', NOW(), NOW())
        `, [
          conversationId,
          user.id,
          `${user.profile_data?.firstName || user.email} changed the conversation name to "${name}"`
        ]);

        break;

      case 'add_participants':
        if (!participantIds || !Array.isArray(participantIds)) {
          return NextResponse.json({
            success: false,
            message: 'Participant IDs array is required'
          }, { status: 400 });
        }

        // Verify participants exist
        const participantCheck = await db.query(`
          SELECT id FROM users WHERE id = ANY($1::uuid[])
        `, [participantIds]);

        if (participantCheck.rows.length !== participantIds.length) {
          return NextResponse.json({
            success: false,
            message: 'One or more participants not found'
          }, { status: 404 });
        }

        // Add participants
        for (const participantId of participantIds) {
          await db.query(`
            INSERT INTO conversation_participants (
              conversation_id, user_id, role, joined_at
            ) VALUES ($1, $2, 'participant', NOW())
            ON CONFLICT (conversation_id, user_id)
            DO UPDATE SET is_active = TRUE, joined_at = NOW()
          `, [conversationId, participantId]);
        }

        // Send system message
        await db.query(`
          INSERT INTO messages (
            conversation_id, sender_id, content, message_type, created_at, updated_at
          ) VALUES ($1, $2, $3, 'system', NOW(), NOW())
        `, [
          conversationId,
          user.id,
          `${user.profile_data?.firstName || user.email} added ${participantIds.length} participant(s) to the conversation`
        ]);

        break;

      case 'remove_participant':
        const { participantId } = body;
        if (!participantId) {
          return NextResponse.json({
            success: false,
            message: 'Participant ID is required'
          }, { status: 400 });
        }

        await db.query(`
          UPDATE conversation_participants
          SET is_active = FALSE, left_at = NOW()
          WHERE conversation_id = $1 AND user_id = $2
        `, [conversationId, participantId]);

        // Send system message
        const removedUser = await db.query(`
          SELECT email, profile_data FROM users WHERE id = $1
        `, [participantId]);

        if (removedUser.rows.length > 0) {
          const removedUserName = removedUser.rows[0].profile_data?.firstName || removedUser.rows[0].email;
          await db.query(`
            INSERT INTO messages (
              conversation_id, sender_id, content, message_type, created_at, updated_at
            ) VALUES ($1, $2, $3, 'system', NOW(), NOW())
          `, [
            conversationId,
            user.id,
            `${user.profile_data?.firstName || user.email} removed ${removedUserName} from the conversation`
          ]);
        }

        break;

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation updated successfully'
    });

  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update conversation'
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
    const conversationId = url.searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        message: 'Conversation ID is required'
      }, { status: 400 });
    }

    // Verify user is admin of conversation
    const adminCheck = await db.query(`
      SELECT cp.id FROM conversation_participants cp
      WHERE cp.conversation_id = $1 AND cp.user_id = $2 AND cp.role = 'admin' AND cp.is_active = TRUE
    `, [conversationId, user.id]);

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 });
    }

    // Mark conversation as inactive
    await db.query(`
      UPDATE conversations
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = $1
    `, [conversationId]);

    // Mark all participants as inactive
    await db.query(`
      UPDATE conversation_participants
      SET is_active = FALSE, left_at = NOW()
      WHERE conversation_id = $1
    `, [conversationId]);

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete conversation'
    }, { status: 500 });
  }
}
