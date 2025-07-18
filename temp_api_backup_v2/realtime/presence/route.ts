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
    const userIds = url.searchParams.get('userIds')?.split(',') || [];
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

    // Build where clause
    let whereConditions = ['u.tenant_id = $1'];
    const queryParams: any[] = [user.tenant_id];
    let paramCount = 1;

    // Filter by specific user IDs
    if (userIds.length > 0) {
      paramCount++;
      whereConditions.push(`u.id = ANY($${paramCount}::uuid[])`);
      queryParams.push(userIds);
    }

    // Filter by role
    if (role) {
      paramCount++;
      whereConditions.push(`u.role = $${paramCount}`);
      queryParams.push(role);
    }

    // Filter by presence status
    if (status) {
      paramCount++;
      whereConditions.push(`COALESCE(up.status, 'offline') = $${paramCount}`);
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get user presence data
    const presenceQuery = `
      SELECT
        u.id,
        u.email,
        u.role,
        CONCAT(u.profile_data->>'firstName', ' ', u.profile_data->>'lastName') as full_name,
        COALESCE(up.status, 'offline') as status,
        up.last_seen,
        up.current_page,
        up.updated_at as presence_updated_at,
        CASE
          WHEN up.last_seen IS NULL THEN NULL
          WHEN up.last_seen < NOW() - INTERVAL '5 minutes' THEN 'offline'
          ELSE up.status
        END as computed_status
      FROM users u
      LEFT JOIN user_presence up ON u.id = up.user_id
      ${whereClause}
      ORDER BY
        CASE
          WHEN COALESCE(up.status, 'offline') = 'online' THEN 1
          WHEN COALESCE(up.status, 'offline') = 'away' THEN 2
          WHEN COALESCE(up.status, 'offline') = 'busy' THEN 3
          ELSE 4
        END,
        up.last_seen DESC NULLS LAST,
        u.email
    `;

    const result = await db.query(presenceQuery, queryParams);

    // Get WebSocket manager to check real-time status
    const wsManager = getWebSocketManager();

    const presenceData = result.rows.map(row => {
      const isOnlineWS = wsManager?.isUserOnline(row.id) || false;
      const lastSeen = row.last_seen ? new Date(row.last_seen) : null;
      const now = new Date();
      const isRecentlyActive = lastSeen && (now.getTime() - lastSeen.getTime()) < 5 * 60 * 1000; // 5 minutes

      return {
        userId: row.id,
        email: row.email,
        fullName: row.full_name?.trim() || row.email,
        role: row.role,
        status: isOnlineWS ? 'online' : (isRecentlyActive ? row.status : 'offline'),
        lastSeen: row.last_seen,
        currentPage: row.current_page,
        isOnline: isOnlineWS,
        presenceUpdatedAt: row.presence_updated_at
      };
    });

    return NextResponse.json({
      success: true,
      data: presenceData
    });

  } catch (error) {
    console.error('Error fetching presence data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch presence data'
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
    const { status, currentPage } = body;

    // Validate status
    const validStatuses = ['online', 'away', 'busy', 'offline'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Valid status is required (online, away, busy, offline)'
      }, { status: 400 });
    }

    // Update user presence
    await db.query(`
      INSERT INTO user_presence (user_id, status, last_seen, current_page, updated_at)
      VALUES ($1, $2, NOW(), $3, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        status = $2,
        last_seen = NOW(),
        current_page = $3,
        updated_at = NOW()
    `, [user.id, status, currentPage || null]);

    // Broadcast presence update via WebSocket
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.io.emit('presence:update', {
        userId: user.id,
        status,
        lastSeen: new Date(),
        currentPage
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Presence updated successfully'
    });

  } catch (error) {
    console.error('Error updating presence:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update presence'
    }, { status: 500 });
  }
}

// GET specific user's presence
export async function getUserPresence(userId: string): Promise<any> {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u.email,
        u.role,
        CONCAT(u.profile_data->>'firstName', ' ', u.profile_data->>'lastName') as full_name,
        COALESCE(up.status, 'offline') as status,
        up.last_seen,
        up.current_page,
        up.updated_at as presence_updated_at
      FROM users u
      LEFT JOIN user_presence up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const wsManager = getWebSocketManager();
    const isOnlineWS = wsManager?.isUserOnline(userId) || false;
    const lastSeen = row.last_seen ? new Date(row.last_seen) : null;
    const now = new Date();
    const isRecentlyActive = lastSeen && (now.getTime() - lastSeen.getTime()) < 5 * 60 * 1000;

    return {
      userId: row.id,
      email: row.email,
      fullName: row.full_name?.trim() || row.email,
      role: row.role,
      status: isOnlineWS ? 'online' : (isRecentlyActive ? row.status : 'offline'),
      lastSeen: row.last_seen,
      currentPage: row.current_page,
      isOnline: isOnlineWS,
      presenceUpdatedAt: row.presence_updated_at
    };

  } catch (error) {
    console.error('Error getting user presence:', error);
    return null;
  }
}

// Get presence for multiple users (for conversations, etc.)
export async function getMultipleUserPresence(userIds: string[]): Promise<any[]> {
  try {
    if (userIds.length === 0) return [];

    const result = await db.query(`
      SELECT
        u.id,
        u.email,
        u.role,
        CONCAT(u.profile_data->>'firstName', ' ', u.profile_data->>'lastName') as full_name,
        COALESCE(up.status, 'offline') as status,
        up.last_seen,
        up.current_page,
        up.updated_at as presence_updated_at
      FROM users u
      LEFT JOIN user_presence up ON u.id = up.user_id
      WHERE u.id = ANY($1::uuid[])
    `, [userIds]);

    const wsManager = getWebSocketManager();
    const now = new Date();

    return result.rows.map(row => {
      const isOnlineWS = wsManager?.isUserOnline(row.id) || false;
      const lastSeen = row.last_seen ? new Date(row.last_seen) : null;
      const isRecentlyActive = lastSeen && (now.getTime() - lastSeen.getTime()) < 5 * 60 * 1000;

      return {
        userId: row.id,
        email: row.email,
        fullName: row.full_name?.trim() || row.email,
        role: row.role,
        status: isOnlineWS ? 'online' : (isRecentlyActive ? row.status : 'offline'),
        lastSeen: row.last_seen,
        currentPage: row.current_page,
        isOnline: isOnlineWS,
        presenceUpdatedAt: row.presence_updated_at
      };
    });

  } catch (error) {
    console.error('Error getting multiple user presence:', error);
    return [];
  }
}

// Helper function to get online users by role
export async function getOnlineUsersByRole(tenantId: string, role?: string): Promise<any[]> {
  try {
    let whereConditions = ['u.tenant_id = $1'];
    const queryParams: any[] = [tenantId];
    let paramCount = 1;

    if (role) {
      paramCount++;
      whereConditions.push(`u.role = $${paramCount}`);
      queryParams.push(role);
    }

    // Only get users who have been active in the last 5 minutes
    whereConditions.push(`up.last_seen > NOW() - INTERVAL '5 minutes'`);
    whereConditions.push(`up.status != 'offline'`);

    const whereClause = whereConditions.join(' AND ');

    const result = await db.query(`
      SELECT
        u.id,
        u.email,
        u.role,
        CONCAT(u.profile_data->>'firstName', ' ', u.profile_data->>'lastName') as full_name,
        up.status,
        up.last_seen,
        up.current_page
      FROM users u
      INNER JOIN user_presence up ON u.id = up.user_id
      WHERE ${whereClause}
      ORDER BY up.last_seen DESC
    `, queryParams);

    const wsManager = getWebSocketManager();

    return result.rows.map(row => ({
      userId: row.id,
      email: row.email,
      fullName: row.full_name?.trim() || row.email,
      role: row.role,
      status: wsManager?.isUserOnline(row.id) ? 'online' : row.status,
      lastSeen: row.last_seen,
      currentPage: row.current_page,
      isOnline: wsManager?.isUserOnline(row.id) || false
    }));

  } catch (error) {
    console.error('Error getting online users by role:', error);
    return [];
  }
}

// Export helper functions
export { getUserPresence, getMultipleUserPresence, getOnlineUsersByRole };
