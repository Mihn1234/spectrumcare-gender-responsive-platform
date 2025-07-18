'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  relatedId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  file?: {
    url: string;
    name: string;
    size: number;
  };
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  timestamp: string;
  participants: string[];
}

interface Activity {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  activityType: string;
  description: string;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  context?: any;
  metadata?: any;
  createdAt: string;
  timeAgo: string;
}

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentPage?: string;
  isOnline: boolean;
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface WebSocketContextType {
  // Connection state
  isConnected: boolean;
  socket: Socket | null;

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;

  // Messaging
  messages: { [conversationId: string]: Message[] };
  sendMessage: (conversationId: string, content: string, messageType?: string, replyTo?: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  typingIndicators: { [conversationId: string]: TypingIndicator[] };

  // Activity Feed
  activities: Activity[];
  subscribeToActivity: (type: 'case' | 'user' | 'global', id?: string) => void;

  // Presence
  userPresence: { [userId: string]: UserPresence };
  updatePresence: (status: 'online' | 'away' | 'busy' | 'offline', currentPage?: string) => void;

  // Case updates
  subscribeToCaseUpdates: (caseId: string) => void;
  unsubscribeFromCaseUpdates: (caseId: string) => void;

  // Event listeners
  addEventListener: (event: string, callback: Function) => void;
  removeEventListener: (event: string, callback: Function) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userPresence, setUserPresence] = useState<{ [userId: string]: UserPresence }>({});
  const [typingIndicators, setTypingIndicators] = useState<{ [conversationId: string]: TypingIndicator[] }>({});

  // Refs for event listeners
  const eventListeners = useRef<{ [event: string]: Function[] }>({});

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      auth: {
        token: token
      },
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      updatePresence('online');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Notification events
    newSocket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadNotificationCount(prev => prev + 1);

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }

      // Trigger custom event listeners
      triggerEventListeners('notification:new', notification);
    });

    // Message events
    newSocket.on('message:new', (message: Message) => {
      setMessages(prev => ({
        ...prev,
        [message.conversationId]: [...(prev[message.conversationId] || []), message]
      }));

      triggerEventListeners('message:new', message);
    });

    newSocket.on('message:edited', (data: { messageId: string; content: string; editedAt: string }) => {
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(conversationId => {
          updated[conversationId] = updated[conversationId].map(msg =>
            msg.id === data.messageId
              ? { ...msg, content: data.content, isEdited: true, editedAt: data.editedAt }
              : msg
          );
        });
        return updated;
      });

      triggerEventListeners('message:edited', data);
    });

    newSocket.on('message:deleted', (data: { messageId: string; deletedAt: string }) => {
      setMessages(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(conversationId => {
          updated[conversationId] = updated[conversationId].map(msg =>
            msg.id === data.messageId
              ? { ...msg, content: '[Message deleted]', messageType: 'system' }
              : msg
          );
        });
        return updated;
      });

      triggerEventListeners('message:deleted', data);
    });

    // Typing indicators
    newSocket.on('message:typing', (data: TypingIndicator) => {
      setTypingIndicators(prev => {
        const conversationTyping = prev[data.conversationId] || [];
        const otherTyping = conversationTyping.filter(t => t.userId !== data.userId);

        return {
          ...prev,
          [data.conversationId]: data.isTyping
            ? [...otherTyping, data]
            : otherTyping
        };
      });
    });

    // Activity events
    newSocket.on('activity:new', (activity: Activity) => {
      setActivities(prev => [activity, ...prev.slice(0, 99)]); // Keep last 100 activities
      triggerEventListeners('activity:new', activity);
    });

    // Presence events
    newSocket.on('presence:update', (presence: UserPresence) => {
      setUserPresence(prev => ({
        ...prev,
        [presence.userId]: presence
      }));

      triggerEventListeners('presence:update', presence);
    });

    // Case update events
    newSocket.on('case:update', (data: any) => {
      triggerEventListeners('case:update', data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  // Helper function to trigger custom event listeners
  const triggerEventListeners = useCallback((event: string, data: any) => {
    const listeners = eventListeners.current[event] || [];
    listeners.forEach(callback => callback(data));
  }, []);

  // Notification functions
  const markNotificationAsRead = useCallback((notificationId: string) => {
    if (!socket) return;

    socket.emit('notification:mark_read', notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadNotificationCount(prev => Math.max(0, prev - 1));
  }, [socket]);

  const markAllNotificationsAsRead = useCallback(() => {
    if (!socket) return;

    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    unreadIds.forEach(id => socket.emit('notification:mark_read', id));

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadNotificationCount(0);
  }, [socket, notifications]);

  // Messaging functions
  const sendMessage = useCallback((
    conversationId: string,
    content: string,
    messageType = 'text',
    replyTo?: string
  ) => {
    if (!socket) return;

    socket.emit('message:send', {
      conversationId,
      content,
      messageType,
      replyTo,
      participants: [] // Will be populated by server
    });
  }, [socket]);

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socket) return;

    socket.emit('message:typing', { conversationId, isTyping });
  }, [socket]);

  // Activity functions
  const subscribeToActivity = useCallback((type: 'case' | 'user' | 'global', id?: string) => {
    if (!socket) return;

    socket.emit('activity:subscribe', { type, id });
  }, [socket]);

  // Presence functions
  const updatePresence = useCallback((status: 'online' | 'away' | 'busy' | 'offline', currentPage?: string) => {
    if (!socket) return;

    socket.emit('presence:update', { status, currentPage });
  }, [socket]);

  // Case update functions
  const subscribeToCaseUpdates = useCallback((caseId: string) => {
    if (!socket) return;

    socket.emit('case:join', caseId);
  }, [socket]);

  const unsubscribeFromCaseUpdates = useCallback((caseId: string) => {
    if (!socket) return;

    socket.emit('case:leave', caseId);
  }, [socket]);

  // Event listener management
  const addEventListener = useCallback((event: string, callback: Function) => {
    if (!eventListeners.current[event]) {
      eventListeners.current[event] = [];
    }
    eventListeners.current[event].push(callback);
  }, []);

  const removeEventListener = useCallback((event: string, callback: Function) => {
    if (eventListeners.current[event]) {
      eventListeners.current[event] = eventListeners.current[event].filter(cb => cb !== callback);
    }
  }, []);

  // Request notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Update presence when page changes
  useEffect(() => {
    if (socket && isConnected) {
      updatePresence('online', window.location.pathname);
    }
  }, [socket, isConnected, updatePresence]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online', window.location.pathname);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updatePresence]);

  const value: WebSocketContextType = {
    isConnected,
    socket,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    messages,
    sendMessage,
    sendTypingIndicator,
    typingIndicators,
    activities,
    subscribeToActivity,
    userPresence,
    updatePresence,
    subscribeToCaseUpdates,
    unsubscribeFromCaseUpdates,
    addEventListener,
    removeEventListener
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Custom hooks for specific features
export function useNotifications() {
  const { notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } = useWebSocket();
  return { notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead };
}

export function useMessaging() {
  const { messages, sendMessage, sendTypingIndicator, typingIndicators } = useWebSocket();
  return { messages, sendMessage, sendTypingIndicator, typingIndicators };
}

export function useActivityFeed() {
  const { activities, subscribeToActivity } = useWebSocket();
  return { activities, subscribeToActivity };
}

export function usePresence() {
  const { userPresence, updatePresence } = useWebSocket();
  return { userPresence, updatePresence };
}

export function useCaseUpdates() {
  const { subscribeToCaseUpdates, unsubscribeFromCaseUpdates } = useWebSocket();
  return { subscribeToCaseUpdates, unsubscribeFromCaseUpdates };
}
