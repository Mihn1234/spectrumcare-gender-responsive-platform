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
    const type = url.searchParams.get('type') || 'tenant'; // 'tenant', 'case', 'user'
    const targetId = url.searchParams.get('targetId');
    const activityType = url.searchParams.get('activityType');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    // Build where clause based on type and user permissions
    let whereConditions = ['af.tenant_id = $1'];
    const queryParams: any[] = [user.tenant_id];
    let paramCount = 1;

    // Add visibility conditions based on user role
    if (user.role === 'PARENT') {
      // Parents can see activities related to their children's cases
      paramCount++;
      whereConditions.push(`(
        af.visibility = 'public' OR
        af.visibility = 'tenant' OR
        (af.visibility = 'case' AND af.target_id IN (
          SELECT ec.id FROM ehc_cases ec
          JOIN children c ON ec.child_id = c.id
          WHERE c.parent_id = $${paramCount}
        )) OR
        $${paramCount} = ANY(af.related_users)
      )`);
      queryParams.push(user.id);

    } else if (user.role === 'PROFESSIONAL') {
      // Professionals can see activities related to their clients and appointments
      paramCount++;
      whereConditions.push(`(
        af.visibility IN ('public', 'tenant') OR
        (af.visibility = 'case' AND af.target_id IN (
          SELECT DISTINCT a.client_id FROM appointments a WHERE a.professional_id = $${paramCount}
        )) OR
        $${paramCount} = ANY(af.related_users)
      )`);
      queryParams.push(user.id);

    } else if (['LA_OFFICER', 'LA_MANAGER', 'LA_EXECUTIVE'].includes(user.role)) {
      // LA staff can see all tenant activities
      whereConditions.push(`af.visibility IN ('public', 'tenant', 'case')`);

    } else {
      // Other roles see public and tenant activities
      whereConditions.push(`af.visibility IN ('public', 'tenant')`);
    }

    // Filter by specific type
    if (type === 'case' && targetId) {
      paramCount++;
      whereConditions.push(`af.target_type = 'case' AND af.target_id = $${paramCount}`);
      queryParams.push(targetId);
    } else if (type === 'user' && targetId) {
      paramCount++;
      whereConditions.push(`(af.actor_id = $${paramCount} OR $${paramCount} = ANY(af.related_users))`);
      queryParams.push(targetId);
    }

    // Filter by activity type
    if (activityType) {
      paramCount++;
      whereConditions.push(`af.activity_type = $${paramCount}`);
      queryParams.push(activityType);
    }

    // Date range filters
    if (dateFrom) {
      paramCount++;
      whereConditions.push(`af.created_at >= $${paramCount}`);
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereConditions.push(`af.created_at <= $${paramCount}`);
      queryParams.push(dateTo);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get activity feed
    const activityQuery = `
      SELECT
        af.id,
        af.actor_id,
        af.actor_name,
        af.actor_role,
        af.activity_type,
        af.activity_description,
        af.target_type,
        af.target_id,
        af.target_name,
        af.context,
        af.visibility,
        af.metadata,
        af.created_at,
        COUNT(*) OVER() as total_count
      FROM activity_feed af
      ${whereClause}
      ORDER BY af.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await db.query(activityQuery, queryParams);

    const activities = result.rows.map(row => ({
      id: row.id,
      actorId: row.actor_id,
      actorName: row.actor_name,
      actorRole: row.actor_role,
      activityType: row.activity_type,
      description: row.activity_description,
      targetType: row.target_type,
      targetId: row.target_id,
      targetName: row.target_name,
      context: row.context,
      visibility: row.visibility,
      metadata: row.metadata,
      createdAt: row.created_at,
      timeAgo: getTimeAgo(new Date(row.created_at))
    }));

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch activity feed'
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
      activityType,
      description,
      targetType,
      targetId,
      targetName,
      context,
      visibility = 'tenant',
      relatedUsers = [],
      metadata
    } = body;

    // Validate required fields
    if (!activityType || !description) {
      return NextResponse.json({
        success: false,
        message: 'Activity type and description are required'
      }, { status: 400 });
    }

    // Create activity entry
    const result = await db.query(`
      INSERT INTO activity_feed (
        tenant_id, actor_id, actor_name, actor_role, activity_type, activity_description,
        target_type, target_id, target_name, context, visibility, related_users, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id, created_at
    `, [
      user.tenant_id,
      user.id,
      `${user.profile_data?.firstName} ${user.profile_data?.lastName}`.trim() || user.email,
      user.role,
      activityType,
      description,
      targetType || null,
      targetId || null,
      targetName || null,
      context ? JSON.stringify(context) : null,
      visibility,
      relatedUsers,
      metadata ? JSON.stringify(metadata) : null
    ]);

    const activityId = result.rows[0].id;
    const createdAt = result.rows[0].created_at;

    // Broadcast activity via WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      const activityData = {
        id: activityId,
        actorId: user.id,
        actorName: `${user.profile_data?.firstName} ${user.profile_data?.lastName}`.trim() || user.email,
        actorRole: user.role,
        activityType,
        description,
        targetType,
        targetId,
        targetName,
        context,
        visibility,
        metadata,
        createdAt,
        timeAgo: 'Just now'
      };

      wsManager.broadcastActivityUpdate({
        type: targetType === 'case' ? 'case' : 'global',
        id: targetType === 'case' ? targetId : undefined,
        tenantId: user.tenant_id,
        data: activityData
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Activity created successfully',
      data: {
        activityId,
        createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create activity'
    }, { status: 500 });
  }
}

// Helper function to create common activity types
export async function createStandardActivity(
  userId: string,
  activityType: string,
  description: string,
  targetType?: string,
  targetId?: string,
  context?: any
) {
  try {
    const user = await AuthService.getUserById(userId);
    if (!user) return;

    const visibility = targetType === 'case' ? 'case' : 'tenant';
    const relatedUsers = targetType === 'case' ? [] : [userId];

    await db.query(`
      INSERT INTO activity_feed (
        tenant_id, actor_id, actor_name, actor_role, activity_type, activity_description,
        target_type, target_id, context, visibility, related_users, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `, [
      user.tenant_id,
      user.id,
      `${user.profile_data?.firstName} ${user.profile_data?.lastName}`.trim() || user.email,
      user.role,
      activityType,
      description,
      targetType || null,
      targetId || null,
      context ? JSON.stringify(context) : null,
      visibility,
      relatedUsers
    ]);

    // Broadcast via WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.broadcastActivityUpdate({
        type: targetType === 'case' ? 'case' : 'global',
        id: targetType === 'case' ? targetId : undefined,
        tenantId: user.tenant_id,
        data: {
          actorId: user.id,
          actorName: `${user.profile_data?.firstName} ${user.profile_data?.lastName}`.trim() || user.email,
          actorRole: user.role,
          activityType,
          description,
          targetType,
          targetId,
          context,
          createdAt: new Date(),
          timeAgo: 'Just now'
        }
      });
    }

  } catch (error) {
    console.error('Error creating standard activity:', error);
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Export the helper function for use in other modules
export { createStandardActivity };
