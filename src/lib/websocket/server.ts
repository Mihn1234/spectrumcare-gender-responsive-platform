import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/database';

interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: string;
  userTenantId: string;
  userData: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    tenantId: string;
  };
}

interface PresenceData {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentPage?: string;
}

interface NotificationData {
  id: string;
  type: 'case_update' | 'appointment' | 'message' | 'assessment' | 'system';
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  relatedId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
}

interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  messageType: 'text' | 'file' | 'system';
  timestamp: Date;
  participants: string[];
}

class WebSocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<string, AuthenticatedSocket[]> = new Map();
  private userPresence: Map<string, PresenceData> = new Map();
  private activeTyping: Map<string, Set<string>> = new Map(); // conversationId -> Set of userIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupAuthentication();
    this.setupEventHandlers();
    this.startPresenceCleanup();
  }

  private setupAuthentication() {
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = AuthService.verifyToken(token);
        const user = await AuthService.getUserById(decoded.userId);

        if (!user) {
          return next(new Error('User not found'));
        }

        // Add user data to socket
        const authSocket = socket as AuthenticatedSocket;
        authSocket.userId = user.id;
        authSocket.userRole = user.role;
        authSocket.userTenantId = user.tenant_id;
        authSocket.userData = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.profile_data?.firstName,
          lastName: user.profile_data?.lastName,
          tenantId: user.tenant_id
        };

        next();
      } catch (error) {
        console.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userData.email} connected`);

      // Add to connected users
      this.addConnectedUser(socket);

      // Update presence
      this.updateUserPresence(socket.userId, 'online');

      // Join user to their rooms
      this.joinUserRooms(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userData.email} disconnected`);
        this.removeConnectedUser(socket);
        this.updateUserPresence(socket.userId, 'offline');
      });

      // Handle presence updates
      socket.on('presence:update', (data: { status: string; currentPage?: string }) => {
        this.updateUserPresence(socket.userId, data.status as any, data.currentPage);
        this.broadcastPresenceUpdate(socket.userId);
      });

      // Handle messaging
      socket.on('message:send', (data: Omit<MessageData, 'id' | 'timestamp'>) => {
        this.handleSendMessage(socket, data);
      });

      socket.on('message:typing', (data: { conversationId: string; isTyping: boolean }) => {
        this.handleTypingIndicator(socket, data);
      });

      // Handle notifications
      socket.on('notification:mark_read', (notificationId: string) => {
        this.markNotificationAsRead(socket.userId, notificationId);
      });

      // Handle case updates
      socket.on('case:join', (caseId: string) => {
        this.joinCaseRoom(socket, caseId);
      });

      socket.on('case:leave', (caseId: string) => {
        this.leaveCaseRoom(socket, caseId);
      });

      // Handle activity feeds
      socket.on('activity:subscribe', (params: { type: 'case' | 'user' | 'global'; id?: string }) => {
        this.subscribeToActivity(socket, params);
      });
    });
  }

  private addConnectedUser(socket: AuthenticatedSocket) {
    const userId = socket.userId;
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, []);
    }
    this.connectedUsers.get(userId)!.push(socket);
  }

  private removeConnectedUser(socket: AuthenticatedSocket) {
    const userId = socket.userId;
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      const index = userSockets.indexOf(socket);
      if (index > -1) {
        userSockets.splice(index, 1);
      }
      if (userSockets.length === 0) {
        this.connectedUsers.delete(userId);
      }
    }
  }

  private async joinUserRooms(socket: AuthenticatedSocket) {
    const { userId, userRole, userTenantId } = socket;

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Join tenant room
    socket.join(`tenant:${userTenantId}`);

    // Join role-based rooms
    socket.join(`role:${userRole}`);

    // Join case-specific rooms based on user role
    try {
      if (userRole === 'PARENT') {
        // Join rooms for children's cases
        const childCases = await db.query(`
          SELECT DISTINCT ec.id as case_id
          FROM ehc_cases ec
          JOIN children c ON ec.child_id = c.id
          WHERE c.parent_id = $1
        `, [userId]);

        childCases.rows.forEach(row => {
          socket.join(`case:${row.case_id}`);
        });

      } else if (userRole === 'PROFESSIONAL') {
        // Join rooms for professional's clients and appointments
        const professionalCases = await db.query(`
          SELECT DISTINCT a.client_id
          FROM appointments a
          WHERE a.professional_id = $1
        `, [userId]);

        professionalCases.rows.forEach(row => {
          socket.join(`client:${row.client_id}`);
        });

      } else if (['LA_OFFICER', 'LA_MANAGER', 'LA_EXECUTIVE'].includes(userRole)) {
        // Join rooms for LA cases
        const laCases = await db.query(`
          SELECT id FROM ehc_cases WHERE tenant_id = $1
        `, [userTenantId]);

        laCases.rows.forEach(row => {
          socket.join(`case:${row.id}`);
        });
      }
    } catch (error) {
      console.error('Error joining user rooms:', error);
    }
  }

  private updateUserPresence(userId: string, status: PresenceData['status'], currentPage?: string) {
    this.userPresence.set(userId, {
      userId,
      status,
      lastSeen: new Date(),
      currentPage
    });

    // Persist to database
    this.savePresenceToDatabase(userId, status);
  }

  private async savePresenceToDatabase(userId: string, status: string) {
    try {
      await db.query(`
        INSERT INTO user_presence (user_id, status, last_seen, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET status = $2, last_seen = NOW(), updated_at = NOW()
      `, [userId, status]);
    } catch (error) {
      console.error('Error saving presence to database:', error);
    }
  }

  private broadcastPresenceUpdate(userId: string) {
    const presence = this.userPresence.get(userId);
    if (presence) {
      // Broadcast to users who should see this presence update
      this.io.emit('presence:update', {
        userId,
        status: presence.status,
        lastSeen: presence.lastSeen
      });
    }
  }

  private async handleSendMessage(socket: AuthenticatedSocket, messageData: Omit<MessageData, 'id' | 'timestamp'>) {
    try {
      // Save message to database
      const result = await db.query(`
        INSERT INTO messages (
          conversation_id, sender_id, content, message_type, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, created_at
      `, [
        messageData.conversationId,
        socket.userId,
        messageData.content,
        messageData.messageType
      ]);

      const message: MessageData = {
        id: result.rows[0].id,
        ...messageData,
        senderId: socket.userId,
        senderName: `${socket.userData.firstName} ${socket.userData.lastName}`.trim() || socket.userData.email,
        senderRole: socket.userData.role,
        timestamp: result.rows[0].created_at
      };

      // Broadcast to conversation participants
      messageData.participants.forEach(participantId => {
        this.io.to(`user:${participantId}`).emit('message:new', message);
      });

      // Create notifications for other participants
      const otherParticipants = messageData.participants.filter(id => id !== socket.userId);
      for (const participantId of otherParticipants) {
        await this.createNotification({
          type: 'message',
          title: 'New Message',
          message: `New message from ${message.senderName}`,
          recipientId: participantId,
          senderId: socket.userId,
          relatedId: messageData.conversationId,
          priority: 'medium'
        });
      }

    } catch (error) {
      console.error('Error handling send message:', error);
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  }

  private handleTypingIndicator(socket: AuthenticatedSocket, data: { conversationId: string; isTyping: boolean }) {
    const { conversationId, isTyping } = data;

    if (!this.activeTyping.has(conversationId)) {
      this.activeTyping.set(conversationId, new Set());
    }

    const typingUsers = this.activeTyping.get(conversationId)!;

    if (isTyping) {
      typingUsers.add(socket.userId);
    } else {
      typingUsers.delete(socket.userId);
    }

    // Broadcast typing status to conversation participants
    socket.to(`conversation:${conversationId}`).emit('message:typing', {
      conversationId,
      userId: socket.userId,
      userName: `${socket.userData.firstName} ${socket.userData.lastName}`.trim() || socket.userData.email,
      isTyping
    });

    // Clear typing after 3 seconds of inactivity
    if (isTyping) {
      setTimeout(() => {
        typingUsers.delete(socket.userId);
        socket.to(`conversation:${conversationId}`).emit('message:typing', {
          conversationId,
          userId: socket.userId,
          isTyping: false
        });
      }, 3000);
    }
  }

  private async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      await db.query(`
        UPDATE notifications
        SET is_read = true, read_at = NOW()
        WHERE id = $1 AND user_id = $2
      `, [notificationId, userId]);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  private joinCaseRoom(socket: AuthenticatedSocket, caseId: string) {
    socket.join(`case:${caseId}`);
  }

  private leaveCaseRoom(socket: AuthenticatedSocket, caseId: string) {
    socket.leave(`case:${caseId}`);
  }

  private subscribeToActivity(socket: AuthenticatedSocket, params: { type: 'case' | 'user' | 'global'; id?: string }) {
    const { type, id } = params;

    if (type === 'case' && id) {
      socket.join(`activity:case:${id}`);
    } else if (type === 'user' && id) {
      socket.join(`activity:user:${id}`);
    } else if (type === 'global') {
      socket.join(`activity:global:${socket.userTenantId}`);
    }
  }

  // Public methods for broadcasting events
  public async broadcastNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>) {
    const createdNotification = await this.createNotification(notification);
    this.io.to(`user:${notification.recipientId}`).emit('notification:new', createdNotification);
    return createdNotification;
  }

  public broadcastCaseUpdate(caseId: string, update: any) {
    this.io.to(`case:${caseId}`).emit('case:update', {
      caseId,
      ...update,
      timestamp: new Date()
    });
  }

  public broadcastActivityUpdate(activity: {
    type: 'case' | 'user' | 'global';
    id?: string;
    tenantId: string;
    data: any;
  }) {
    const { type, id, tenantId, data } = activity;

    if (type === 'case' && id) {
      this.io.to(`activity:case:${id}`).emit('activity:new', data);
    } else if (type === 'user' && id) {
      this.io.to(`activity:user:${id}`).emit('activity:new', data);
    } else if (type === 'global') {
      this.io.to(`activity:global:${tenantId}`).emit('activity:new', data);
    }
  }

  private async createNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<NotificationData> {
    try {
      const result = await db.query(`
        INSERT INTO notifications (
          user_id, notification_type, title, message, sender_id, related_id, priority, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, created_at
      `, [
        notification.recipientId,
        notification.type,
        notification.title,
        notification.message,
        notification.senderId || null,
        notification.relatedId || null,
        notification.priority
      ]);

      return {
        id: result.rows[0].id,
        ...notification,
        createdAt: result.rows[0].created_at
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  private startPresenceCleanup() {
    // Clean up offline users every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [userId, presence] of this.userPresence) {
        const timeDiff = now.getTime() - presence.lastSeen.getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (timeDiff > fiveMinutes && presence.status !== 'offline') {
          this.updateUserPresence(userId, 'offline');
          this.broadcastPresenceUpdate(userId);
        }
      }
    }, 5 * 60 * 1000);
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public getUserPresence(userId: string): PresenceData | undefined {
    return this.userPresence.get(userId);
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer);
    console.log('WebSocket server initialized');
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}
