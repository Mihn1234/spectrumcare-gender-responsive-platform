'use client';

import React, { useState, useEffect } from 'react';
import { Activity, User, FileText, Calendar, MessageSquare, Bell, Clock, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useActivityFeed } from '@/contexts/WebSocketContext';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

interface ActivityItem {
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

interface ActivityFeedProps {
  feedType?: 'global' | 'case' | 'user';
  targetId?: string;
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

export function ActivityFeed({
  feedType = 'global',
  targetId,
  className,
  showHeader = true,
  maxHeight = 'h-96'
}: ActivityFeedProps) {
  const { activities, subscribeToActivity } = useActivityFeed();
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Subscribe to activity updates
  useEffect(() => {
    subscribeToActivity(feedType, targetId);
  }, [feedType, targetId, subscribeToActivity]);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'case_created':
      case 'case_updated':
      case 'case_completed':
        return <FileText className="h-4 w-4 text-blue-600" />;

      case 'appointment_scheduled':
      case 'appointment_completed':
      case 'appointment_cancelled':
        return <Calendar className="h-4 w-4 text-green-600" />;

      case 'message_sent':
      case 'conversation_created':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;

      case 'assessment_created':
      case 'assessment_completed':
      case 'assessment_updated':
        return <FileText className="h-4 w-4 text-orange-600" />;

      case 'user_login':
      case 'user_updated':
      case 'user_assigned':
        return <User className="h-4 w-4 text-gray-600" />;

      case 'notification_sent':
      case 'system_alert':
        return <Bell className="h-4 w-4 text-red-600" />;

      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'case_created':
      case 'appointment_scheduled':
      case 'assessment_created':
        return 'border-l-green-500 bg-green-50';

      case 'case_completed':
      case 'appointment_completed':
      case 'assessment_completed':
        return 'border-l-blue-500 bg-blue-50';

      case 'case_updated':
      case 'appointment_cancelled':
      case 'assessment_updated':
        return 'border-l-yellow-500 bg-yellow-50';

      case 'system_alert':
      case 'notification_sent':
        return 'border-l-red-500 bg-red-50';

      default:
        return 'border-l-gray-300 bg-gray-50';
    }
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(activity => activity.activityType.includes(filter));

  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = format(new Date(activity.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  const handleRefresh = () => {
    setLoading(true);
    // Re-subscribe to get latest activities
    subscribeToActivity(feedType, targetId);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Activity Feed</span>
              </CardTitle>
              <CardDescription>
                {feedType === 'case' ? 'Case updates and progress' :
                 feedType === 'user' ? 'User activity timeline' :
                 'Recent platform activity'}
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="case">Cases</SelectItem>
                  <SelectItem value="appointment">Appointments</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="assessment">Assessments</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <ScrollArea className={maxHeight}>
          {Object.keys(groupedActivities).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {Object.entries(groupedActivities)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, dateActivities]) => (
                <div key={date} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center space-x-2">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-xs font-medium text-gray-500 bg-white px-2">
                      {isToday(new Date(date)) ? 'Today' :
                       isYesterday(new Date(date)) ? 'Yesterday' :
                       format(new Date(date), 'MMMM d, yyyy')}
                    </span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>

                  {/* Activities for this date */}
                  <div className="space-y-3">
                    {dateActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`
                          flex items-start space-x-3 p-3 rounded-lg border-l-4 transition-colors hover:bg-gray-50
                          ${getActivityColor(activity.activityType)}
                        `}
                      >
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(activity.actorName)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Actor and Role */}
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm text-gray-900">
                                  {activity.actorName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getRoleColor(activity.actorRole)}`}
                                >
                                  {activity.actorRole.replace('_', ' ')}
                                </Badge>
                              </div>

                              {/* Activity Description */}
                              <p className="text-sm text-gray-700 mb-2">
                                {activity.description}
                              </p>

                              {/* Target Information */}
                              {activity.targetName && (
                                <div className="flex items-center space-x-2 mb-2">
                                  {getActivityIcon(activity.activityType)}
                                  <span className="text-sm font-medium text-gray-600">
                                    {activity.targetName}
                                  </span>
                                  {activity.targetType && (
                                    <Badge variant="outline" className="text-xs">
                                      {activity.targetType}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Context Information */}
                              {activity.context && (
                                <div className="text-xs text-gray-500 bg-white bg-opacity-50 rounded p-2 mt-2">
                                  {typeof activity.context === 'string' ? (
                                    <span>{activity.context}</span>
                                  ) : (
                                    <pre className="whitespace-pre-wrap">
                                      {JSON.stringify(activity.context, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Time and Icon */}
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatActivityTime(activity.createdAt)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {activity.targetId && (
                            <div className="flex items-center space-x-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => {
                                  // Navigate to related item
                                  if (activity.targetType === 'case') {
                                    window.location.href = `/cases/${activity.targetId}`;
                                  } else if (activity.targetType === 'appointment') {
                                    window.location.href = `/appointments/${activity.targetId}`;
                                  }
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Compact version for sidebars
export function CompactActivityFeed({
  feedType = 'global',
  targetId,
  maxItems = 5
}: {
  feedType?: 'global' | 'case' | 'user';
  targetId?: string;
  maxItems?: number;
}) {
  const { activities } = useActivityFeed();

  const recentActivities = activities.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {recentActivities.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <Activity className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No recent activity</p>
        </div>
      ) : (
        recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {activity.actorName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 line-clamp-2">
                <span className="font-medium">{activity.actorName}</span> {activity.description}
              </p>
              <p className="text-xs text-gray-500">{activity.timeAgo}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
