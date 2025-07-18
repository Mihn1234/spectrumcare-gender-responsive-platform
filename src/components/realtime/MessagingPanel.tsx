'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, User, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessaging, usePresence } from '@/contexts/WebSocketContext';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

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
  isEdited?: boolean;
  editedAt?: string;
}

interface Conversation {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'case';
  participants: Array<{
    userId: string;
    email: string;
    fullName: string;
    userRole: string;
  }>;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount: number;
}

interface MessagingPanelProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  currentUserId: string;
  className?: string;
}

export function MessagingPanel({
  conversations,
  selectedConversationId,
  onConversationSelect,
  currentUserId,
  className
}: MessagingPanelProps) {
  const { messages, sendMessage, sendTypingIndicator, typingIndicators } = useMessaging();
  const { userPresence } = usePresence();

  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];
  const conversationTyping = selectedConversationId ? typingIndicators[selectedConversationId] || [] : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Handle typing indicator
  const handleInputChange = useCallback((value: string) => {
    setMessageInput(value);

    if (!selectedConversationId) return;

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(selectedConversationId, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(selectedConversationId, false);
      }
    }, 3000);
  }, [selectedConversationId, isTyping, sendTypingIndicator]);

  const handleSendMessage = useCallback(() => {
    if (!selectedConversationId || !messageInput.trim()) return;

    sendMessage(
      selectedConversationId,
      messageInput.trim(),
      'text',
      replyingTo?.id
    );

    setMessageInput('');
    setReplyingTo(null);

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(selectedConversationId, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [selectedConversationId, messageInput, replyingTo, isTyping, sendMessage, sendTypingIndicator]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const getPresenceStatus = (userId: string) => {
    const presence = userPresence[userId];
    if (!presence) return 'offline';
    return presence.status;
  };

  const getPresenceColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Conversations List */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => {
              const otherParticipants = conversation.participants.filter(p => p.userId !== currentUserId);
              const displayName = conversation.name || otherParticipants.map(p => p.fullName).join(', ');
              const isSelected = conversation.id === selectedConversationId;

              return (
                <div
                  key={conversation.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => onConversationSelect(conversation.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.type === 'direct' && otherParticipants.length === 1 && (
                        <div className={`
                          absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
                          ${getPresenceColor(getPresenceStatus(otherParticipants[0].userId))}
                        `} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{displayName}</h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.lastMessage.content}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      )}

                      {otherParticipants.length > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          {otherParticipants.slice(0, 3).map(participant => (
                            <Badge key={participant.userId} variant="outline" className="text-xs">
                              {participant.userRole}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {getInitials(selectedConversation.name || selectedConversation.participants
                        .filter(p => p.userId !== currentUserId)
                        .map(p => p.fullName)
                        .join(', '))}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {selectedConversation.name || selectedConversation.participants
                        .filter(p => p.userId !== currentUserId)
                        .map(p => p.fullName)
                        .join(', ')}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {selectedConversation.type === 'direct' && selectedConversation.participants.length === 2 && (
                        <>
                          <Circle className={`h-2 w-2 ${getPresenceColor(getPresenceStatus(
                            selectedConversation.participants.find(p => p.userId !== currentUserId)?.userId || ''
                          ))}`} />
                          <span className="capitalize">
                            {getPresenceStatus(selectedConversation.participants.find(p => p.userId !== currentUserId)?.userId || '')}
                          </span>
                        </>
                      )}
                      {selectedConversation.participants.length > 2 && (
                        <span>{selectedConversation.participants.length} participants</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start">
                          View Profile
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          Search Messages
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-red-600">
                          Block User
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversationMessages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const showAvatar = !isOwn && (
                    index === 0 ||
                    conversationMessages[index - 1].senderId !== message.senderId
                  );

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {showAvatar && !isOwn && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(message.senderName)}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`space-y-1 ${showAvatar || isOwn ? '' : 'ml-8'}`}>
                          {message.replyTo && (
                            <div className="text-xs text-gray-600 border-l-2 border-gray-300 pl-2 mb-1">
                              <span className="font-medium">{message.replyTo.senderName}:</span>
                              <p className="truncate">{message.replyTo.content}</p>
                            </div>
                          )}

                          <div
                            className={`
                              px-3 py-2 rounded-lg
                              ${isOwn
                                ? 'bg-blue-600 text-white'
                                : message.messageType === 'system'
                                  ? 'bg-gray-100 text-gray-600 italic'
                                  : 'bg-gray-100 text-gray-900'
                              }
                            `}
                          >
                            {!isOwn && showAvatar && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {message.senderName}
                              </p>
                            )}

                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                            {message.file && (
                              <div className="mt-2 p-2 bg-white bg-opacity-20 rounded">
                                <div className="flex items-center space-x-2">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm">{message.file.name}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className={`flex items-center space-x-2 text-xs text-gray-500 ${isOwn ? 'justify-end' : ''}`}>
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {message.isEdited && <span>(edited)</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicators */}
                {conversationTyping.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>
                      {conversationTyping.map(t => t.userName).join(', ')}
                      {conversationTyping.length === 1 ? ' is' : ' are'} typing...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Replying to</span>
                    <span className="font-medium">{replyingTo.senderName}:</span>
                    <span className="text-gray-600 truncate">{replyingTo.content}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-end space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>

                <div className="flex-1">
                  <Input
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="min-h-[2.5rem] resize-none"
                  />
                </div>

                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
