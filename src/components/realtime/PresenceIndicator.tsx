'use client';

import React, { useState, useEffect } from 'react';
import { Circle, User, Clock, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePresence } from '@/contexts/WebSocketContext';
import { formatDistanceToNow } from 'date-fns';

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentPage?: string;
  isOnline: boolean;
}

interface PresenceIndicatorProps {
  userId: string;
  showStatus?: boolean;
  showName?: boolean;
  showLastSeen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PresenceIndicator({
  userId,
  showStatus = true,
  showName = false,
  showLastSeen = false,
  size = 'md',
  className
}: PresenceIndicatorProps) {
  const { userPresence } = usePresence();
  const presence = userPresence[userId];

  if (!presence) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      case 'md':
      default:
        return 'w-3 h-3';
    }
  };

  const getBorderSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'border-1';
      case 'lg':
        return 'border-2';
      case 'md':
      default:
        return 'border-2';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center space-x-2 ${className}`}>
            <div className="relative">
              <Circle
                className={`
                  ${getSizeClass(size)}
                  ${getStatusColor(presence.status)}
                  border-white ${getBorderSize(size)} rounded-full
                `}
                fill="currentColor"
              />
            </div>

            {showStatus && (
              <span className="text-sm text-gray-600">
                {getStatusText(presence.status)}
              </span>
            )}

            {showName && (
              <span className="text-sm font-medium">
                {presence.fullName || presence.email}
              </span>
            )}

            {showLastSeen && presence.status === 'offline' && (
              <span className="text-xs text-gray-500">
                Last seen {formatDistanceToNow(new Date(presence.lastSeen), { addSuffix: true })}
              </span>
            )}
          </div>
        </TooltipTrigger>

        <TooltipContent>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Circle
                className={`w-2 h-2 ${getStatusColor(presence.status)}`}
                fill="currentColor"
              />
              <span className="font-medium">{getStatusText(presence.status)}</span>
            </div>

            {presence.currentPage && presence.status !== 'offline' && (
              <div className="flex items-center space-x-2 text-xs">
                <MapPin className="w-3 h-3" />
                <span>Currently on {presence.currentPage}</span>
              </div>
            )}

            {presence.status === 'offline' && (
              <div className="flex items-center space-x-2 text-xs">
                <Clock className="w-3 h-3" />
                <span>
                  Last seen {formatDistanceToNow(new Date(presence.lastSeen), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// User card with presence
export function UserPresenceCard({
  user,
  presence,
  showRole = true,
  onClick
}: {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  presence?: UserPresence;
  showRole?: boolean;
  onClick?: () => void;
}) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PARENT':
        return 'bg-blue-100 text-blue-800';
      case 'PROFESSIONAL':
        return 'bg-green-100 text-green-800';
      case 'LA_OFFICER':
      case 'LA_MANAGER':
      case 'LA_EXECUTIVE':
        return 'bg-purple-100 text-purple-800';
      case 'SCHOOL_SENCO':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-gray-50 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            {presence && (
              <div className="absolute -bottom-1 -right-1">
                <PresenceIndicator userId={user.id} size="sm" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{user.fullName}</h3>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>

            <div className="flex items-center space-x-2 mt-1">
              {showRole && (
                <Badge
                  variant="outline"
                  className={`text-xs ${getRoleColor(user.role)}`}
                >
                  {user.role.replace('_', ' ')}
                </Badge>
              )}

              {presence && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  {presence.status === 'online' ? (
                    <span className="text-green-600">Online</span>
                  ) : presence.status === 'offline' ? (
                    <span>
                      Last seen {formatDistanceToNow(new Date(presence.lastSeen), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="capitalize">{presence.status}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Presence dashboard for admins
export function PresenceDashboard({
  userPresenceData = [],
  className
}: {
  userPresenceData: Array<{
    user: {
      id: string;
      email: string;
      fullName: string;
      role: string;
    };
    presence: UserPresence;
  }>;
  className?: string;
}) {
  const [filter, setFilter] = useState<string>('all');

  const filteredUsers = filter === 'all'
    ? userPresenceData
    : userPresenceData.filter(({ presence }) => presence.status === filter);

  const onlineCount = userPresenceData.filter(({ presence }) => presence.status === 'online').length;
  const awayCount = userPresenceData.filter(({ presence }) => presence.status === 'away').length;
  const busyCount = userPresenceData.filter(({ presence }) => presence.status === 'busy').length;
  const offlineCount = userPresenceData.filter(({ presence }) => presence.status === 'offline').length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Team Presence</span>
        </CardTitle>
        <CardDescription>
          Current online status of team members
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div
            className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${
              filter === 'online' ? 'bg-green-100' : 'hover:bg-gray-50'
            }`}
            onClick={() => setFilter(filter === 'online' ? 'all' : 'online')}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Circle className="w-3 h-3 bg-green-500" fill="currentColor" />
              <span className="text-sm font-medium">Online</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
          </div>

          <div
            className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${
              filter === 'away' ? 'bg-yellow-100' : 'hover:bg-gray-50'
            }`}
            onClick={() => setFilter(filter === 'away' ? 'all' : 'away')}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Circle className="w-3 h-3 bg-yellow-500" fill="currentColor" />
              <span className="text-sm font-medium">Away</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{awayCount}</p>
          </div>

          <div
            className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${
              filter === 'busy' ? 'bg-red-100' : 'hover:bg-gray-50'
            }`}
            onClick={() => setFilter(filter === 'busy' ? 'all' : 'busy')}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Circle className="w-3 h-3 bg-red-500" fill="currentColor" />
              <span className="text-sm font-medium">Busy</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{busyCount}</p>
          </div>

          <div
            className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${
              filter === 'offline' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
            onClick={() => setFilter(filter === 'offline' ? 'all' : 'offline')}
          >
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Circle className="w-3 h-3 bg-gray-400" fill="currentColor" />
              <span className="text-sm font-medium">Offline</span>
            </div>
            <p className="text-2xl font-bold text-gray-600">{offlineCount}</p>
          </div>
        </div>

        {/* User List */}
        <div className="space-y-2">
          {filteredUsers.map(({ user, presence }) => (
            <UserPresenceCard
              key={user.id}
              user={user}
              presence={presence}
              onClick={() => {
                // Navigate to user profile or start conversation
                window.location.href = `/users/${user.id}`;
              }}
            />
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              No users with {filter === 'all' ? 'any' : filter} status
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
