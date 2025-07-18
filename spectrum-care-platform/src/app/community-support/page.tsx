'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  MessageCircle,
  UserCheck,
  Calendar,
  Shield,
  Heart,
  Search,
  Plus,
  ArrowLeft,
  Settings,
  MapPin,
  Clock,
  Star,
  Award,
  Lock,
  Eye,
  EyeOff,
  Send,
  Filter,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Bell,
  Video,
  Phone,
  Mail,
  Globe,
  Home,
  Activity,
  BookOpen,
  Coffee,
  Smile,
  Zap,
  Target,
  Lightbulb,
  Handshake,
  PieChart,
  TrendingUp,
  UserPlus,
  MessageSquare,
  ThumbsUp,
  Flag,
  MoreHorizontal,
  Edit,
  Share,
  Copy,
  Download
} from 'lucide-react';

interface UserProfile {
  verificationStatus: string;
  helpedFamilies: number;
  groupsMember: number;
}

interface CommunityStats {
  activeFamilies: number;
  supportGroups: number;
}

interface QuickAction {
  action: string;
  icon: string;
  title: string;
  description: string;
}

interface RecentActivity {
  content: string;
  timestamp: string;
  priority: string;
}

interface SuggestedConnection {
  id: string;
  name: string;
  type: string;
  verificationStatus: string;
  matchScore: number;
  commonInterests: string[];
  distance: string;
  lastActive?: string;
}

interface ActiveGroup {
  name: string;
  members: number;
  newMessages: number;
  lastActivity: string;
}

interface UpcomingEvent {
  title: string;
  date: string;
  location: string;
  attendees: number;
  maxAttendees: number;
}

interface CommunityData {
  userProfile: UserProfile;
  communityStats: CommunityStats;
  recentActivity: RecentActivity[];
  suggestedConnections: SuggestedConnection[];
  activeGroups: ActiveGroup[];
  upcomingEvents: UpcomingEvent[];
  safetyFeatures: Record<string, unknown>;
  quickActions: QuickAction[];
}

interface SupportGroup {
  id: string;
  name: string;
  privacy: string;
  description: string;
  members: number;
  messagesPerDay: number;
  location: string;
  tags: string[];
  joinStatus: string;
  matchScore?: number;
}

interface MessageThread {
  type: string;
  groupName?: string;
  participants: Array<{name: string}>;
  lastMessage: {
    content: string;
    isRead: boolean;
    timestamp: string;
  };
  newMessages?: number;
}

interface Event {
  title: string;
  type: string;
  description: string;
  datetime: string;
  duration: number;
  location: { venue: string };
  attendance: { current: number; maximum: number };
  pricing: { cost: number };
  userStatus: string;
  feedback: { rating: number };
  tags: string[];
}

interface MentorshipData {
  currentMentorship?: {
    mentor: {
      name: string;
      title: string;
      background: string;
      specialties: string[];
    };
    progress: {
      goals: Array<{
        goal: string;
        status: string;
        progress: number;
      }>;
    };
    schedule: {
      nextSession: string;
    };
  };
  availableMentors?: Array<{
    name: string;
    rating: number;
    title: string;
    approach: string;
    specialties: string[];
    availability: string;
  }>;
  mentorshipPrograms?: Array<{
    name: string;
    description: string;
    duration: string;
    sessions: string;
    groupSize: string;
    cost: string;
  }>;
}

export default function CommunitySupportPage() {
  const router = useRouter();
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [messages, setMessages] = useState<MessageThread[]>([]);
  const [mentorshipData, setMentorshipData] = useState<MentorshipData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<MessageThread | null>(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      // Load community overview
      const overviewResponse = await fetch('/api/parent-portal/community-support?type=overview', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!overviewResponse.ok) {
        throw new Error('Failed to load community data');
      }

      const overviewData = await overviewResponse.json();
      setCommunityData(overviewData.data);

      // Load additional data in parallel
      const [groupsRes, messagesRes, mentorshipRes, eventsRes] = await Promise.all([
        fetch('/api/parent-portal/community-support?type=groups', {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        }),
        fetch('/api/parent-portal/community-support?type=messages', {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        }),
        fetch('/api/parent-portal/community-support?type=mentorship', {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        }),
        fetch('/api/parent-portal/community-support?type=events', {
          headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
        })
      ]);

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setSupportGroups(groupsData.data.groups || []);
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.data.threads || []);
      }

      if (mentorshipRes.ok) {
        const mentorshipData = await mentorshipRes.json();
        setMentorshipData(mentorshipData.data);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.data.events || []);
      }

    } catch (error) {
      console.error('Error loading community data:', error);
      setError('Failed to load community support data');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWithUser = async (connectionId: string) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/parent-portal/community-support', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'request_matchmaking',
          matchType: 'support-buddy',
          targetUserId: connectionId,
          preferences: {
            communicationStyle: 'text',
            interests: ['general-support']
          },
          privacySettings: {
            shareLocation: false,
            shareContact: false,
            shareChildInfo: false,
            allowDirectMessages: true,
            requireVerification: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send connection request');
      }

      alert('Connection request sent successfully!');
      await loadCommunityData();

    } catch (error) {
      console.error('Error connecting with user:', error);
      setError('Failed to send connection request');
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/parent-portal/community-support', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'join_group',
          groupId,
          message: 'I would like to join this support group.'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join group');
      }

      alert('Group join request submitted!');
      await loadCommunityData();

    } catch (error) {
      console.error('Error joining group:', error);
      setError('Failed to join group');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case 'Verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Professional': return <Award className="h-4 w-4 text-purple-600" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading community support...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Community & Peer Support</h1>
                  <p className="text-sm text-gray-500">Connect, share, and support each other</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Safe Environment
              </Badge>
              <Button variant="outline" onClick={() => setShowNewGroupForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Privacy
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!communityData ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Community Support</h3>
              <p className="text-gray-600 mb-6">Connect with other autism families and build meaningful relationships</p>
              <Button onClick={() => alert('Community setup - Coming soon!')}>
                <Plus className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Community Stats Banner */}
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Welcome back, {communityData.userProfile.verificationStatus}!
                    </h2>
                    <p className="text-gray-600">
                      You've helped {communityData.userProfile.helpedFamilies} families and connected with {communityData.userProfile.groupsMember} support groups
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{communityData.communityStats.activeFamilies.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Active Families</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{communityData.communityStats.supportGroups}</p>
                      <p className="text-sm text-gray-600">Support Groups</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="groups">Support Groups</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
                <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Connect and engage with the community</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {communityData.quickActions.map((action: { action: string; icon: string; title: string; description: string }, index: number) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                              onClick={() => {
                                if (action.action === 'find_support_buddy') {
                                  setSelectedTab('connections');
                                } else if (action.action === 'join_group') {
                                  setSelectedTab('groups');
                                } else if (action.action === 'find_mentor') {
                                  setSelectedTab('mentorship');
                                } else if (action.action === 'create_event') {
                                  setSelectedTab('events');
                                }
                              }}
                            >
                              <div className="h-6 w-6 text-blue-600">
                                {action.icon === 'Users' && <Users className="h-6 w-6" />}
                                {action.icon === 'UserCheck' && <UserCheck className="h-6 w-6" />}
                                {action.icon === 'Calendar' && <Calendar className="h-6 w-6" />}
                              </div>
                              <div className="text-center">
                                <span className="text-xs font-medium">{action.title}</span>
                                <p className="text-xs text-gray-600">{action.description}</p>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Activity className="h-5 w-5 mr-2 text-green-600" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {communityData.recentActivity.map((activity: { content: string; timestamp: string; priority: string }, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                activity.priority === 'high' ? 'bg-red-500' :
                                activity.priority === 'medium' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.content}</p>
                                <p className="text-xs text-gray-500">{activity.timestamp}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Active Groups Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Your Support Groups
                          <Button variant="outline" size="sm" onClick={() => setSelectedTab('groups')}>
                            View All
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {communityData.activeGroups.slice(0, 3).map((group: { name: string; members: number; newMessages: number; lastActivity: string }, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{group.name}</h4>
                                  <p className="text-sm text-gray-600">{group.members} members</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {group.newMessages > 0 && (
                                  <Badge className="bg-blue-100 text-blue-800 mb-1">
                                    {group.newMessages} new
                                  </Badge>
                                )}
                                <p className="text-xs text-gray-500">{group.lastActivity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Suggested Connections */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Heart className="h-5 w-5 mr-2 text-pink-600" />
                          Suggested Connections
                        </CardTitle>
                        <CardDescription>People you might want to connect with</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {communityData.suggestedConnections.slice(0, 3).map((connection: { id: string; name: string; type: string; verificationStatus: string; matchScore: number; commonInterests: string[]; distance: string }, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm">{connection.name}</h4>
                                    <p className="text-xs text-gray-600">{connection.type}</p>
                                  </div>
                                </div>
                                {getVerificationIcon(connection.verificationStatus)}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Match Score</span>
                                  <span className="font-medium text-green-600">{connection.matchScore}%</span>
                                </div>
                                <Progress value={connection.matchScore} className="h-1" />

                                <div className="flex flex-wrap gap-1">
                                  {connection.commonInterests.slice(0, 2).map((interest: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{connection.distance}</span>
                                </div>

                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => connectWithUser(connection.id)}
                                >
                                  <Heart className="h-3 w-3 mr-1" />
                                  Connect
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Safety Features */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-green-600" />
                          Safety & Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">AI Moderation</span>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Background Checks</span>
                            <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">24/7 Support</span>
                            <Badge className="bg-purple-100 text-purple-800">Available</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Privacy Controls</span>
                            <Badge className="bg-orange-100 text-orange-800">Enhanced</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Upcoming Events */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Upcoming Events
                          <Button variant="outline" size="sm" onClick={() => setSelectedTab('events')}>
                            View All
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {communityData.upcomingEvents.slice(0, 2).map((event: { title: string; date: string; location: string; attendees: number; maxAttendees: number }, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                              <div className="flex items-center text-xs text-gray-600 mb-2">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-600 mb-2">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {event.attendees}/{event.maxAttendees} attending
                                </span>
                                <Button size="sm" variant="outline">
                                  Join
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Support Groups Tab */}
              <TabsContent value="groups" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Support Groups</h2>
                  <Button onClick={() => setShowNewGroupForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {supportGroups.map((group: { id: string; name: string; privacy: string; description: string; members: number; messagesPerDay: number; location: string; tags: string[]; joinStatus: string; matchScore?: number }, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold">{group.name}</h3>
                              <Badge className={`text-xs ${
                                group.privacy === 'private' ? 'bg-red-100 text-red-800' :
                                group.privacy === 'public' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {group.privacy}
                              </Badge>
                            </div>
                          </div>
                          {group.matchScore && (
                            <Badge className="bg-purple-100 text-purple-800">
                              {group.matchScore}% match
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{group.description}</p>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Members</span>
                            <span className="font-medium">{group.members}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Daily Messages</span>
                            <span className="font-medium">{group.messagesPerDay}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Location</span>
                            <span className="font-medium">{group.location}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {group.tags.slice(0, 3).map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex space-x-2">
                            {group.joinStatus === 'member' ? (
                              <Button className="flex-1" disabled>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Member
                              </Button>
                            ) : group.joinStatus === 'moderator' ? (
                              <Button className="flex-1" disabled>
                                <Award className="h-3 w-3 mr-1" />
                                Moderator
                              </Button>
                            ) : (
                              <Button
                                className="flex-1"
                                onClick={() => joinGroup(group.id)}
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Join Group
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Secure Messages</h2>
                  <Button onClick={() => setShowMessageForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Conversations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {messages.map((thread: { type: string; groupName?: string; participants: Array<{name: string}>; lastMessage: { content: string; isRead: boolean; timestamp: string }; newMessages?: number }, index: number) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                              onClick={() => setSelectedConnection(thread)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">
                                  {thread.type === 'group' ? thread.groupName : thread.participants[1]?.name}
                                </h4>
                                {thread.type === 'direct' && !thread.lastMessage.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                )}
                                {thread.type === 'group' && thread.newMessages && thread.newMessages > 0 && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {thread.newMessages}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {thread.lastMessage.content}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatDate(thread.lastMessage.timestamp)}
                                </span>
                                <Lock className="h-3 w-3 text-green-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-2">
                    {selectedConnection ? (
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {selectedConnection.type === 'group' ? selectedConnection.groupName : selectedConnection.participants[1]?.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {selectedConnection.type === 'group' ? 'Group Chat' : 'Direct Message'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Video className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4">
                            <div className="text-center text-gray-500 text-sm mb-4">
                              <Lock className="h-4 w-4 mx-auto mb-1" />
                              End-to-end encrypted conversation
                            </div>
                            <div className="space-y-3">
                              <div className="flex">
                                <div className="bg-blue-100 rounded-lg p-3 max-w-xs">
                                  <p className="text-sm">Hi! I saw your post about sensory toys. My daughter has similar preferences.</p>
                                  <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                                  <p className="text-sm">Oh fantastic! What age is your daughter? Emma is 6 and really struggles with texture.</p>
                                  <p className="text-xs text-gray-500 mt-1">2:33 PM</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input placeholder="Type your secure message..." className="flex-1" />
                            <Button>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="text-center py-12">
                          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Conversation</h3>
                          <p className="text-gray-600">Choose a conversation from the list to start messaging securely</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Connections Tab */}
              <TabsContent value="connections" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Find Connections</h2>
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Advanced Search
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {communityData?.suggestedConnections.map((connection: SuggestedConnection, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-bold">{connection.name}</h3>
                              <p className="text-sm text-gray-600">{connection.type}</p>
                            </div>
                          </div>
                          {getVerificationIcon(connection.verificationStatus)}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Match Score</span>
                            <span className="font-medium text-green-600">{connection.matchScore}%</span>
                          </div>
                          <Progress value={connection.matchScore} className="h-2" />

                          <div className="space-y-2">
                            <p className="text-sm font-medium">Common Interests:</p>
                            <div className="flex flex-wrap gap-1">
                              {connection.commonInterests.map((interest: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{connection.distance}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Last active {connection.lastActive}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <Button
                              className="flex-1"
                              onClick={() => connectWithUser(connection.id)}
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              Connect
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Mentorship Tab */}
              <TabsContent value="mentorship" className="space-y-6">
                {mentorshipData ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">Mentorship Program</h2>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Apply as Mentor
                      </Button>
                    </div>

                    {mentorshipData.currentMentorship && (
                      <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                          <CardTitle className="flex items-center text-green-800">
                            <UserCheck className="h-5 w-5 mr-2" />
                            Current Mentorship
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2">Your Mentor</h4>
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Award className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold">{mentorshipData.currentMentorship.mentor.name}</h3>
                                  <p className="text-sm text-gray-600">{mentorshipData.currentMentorship.mentor.title}</p>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 mb-3">
                                {mentorshipData.currentMentorship.mentor.background}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {mentorshipData.currentMentorship.mentor.specialties.map((specialty: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Progress & Goals</h4>
                              <div className="space-y-3">
                                {mentorshipData.currentMentorship.progress.goals.map((goal: { goal: string; status: string; progress: number }, i: number) => (
                                  <div key={i}>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium">{goal.goal}</span>
                                      <Badge className={goal.status === 'on-track' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                        {goal.status}
                                      </Badge>
                                    </div>
                                    <Progress value={goal.progress} className="mb-1" />
                                    <p className="text-xs text-gray-600">{goal.progress}% complete</p>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 p-3 bg-white rounded-lg">
                                <h5 className="font-medium text-sm mb-1">Next Session</h5>
                                <p className="text-sm text-gray-600">
                                  {formatDate(mentorshipData.currentMentorship.schedule.nextSession)}
                                </p>
                                <Button size="sm" className="mt-2">
                                  <Video className="h-3 w-3 mr-1" />
                                  Join Session
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Available Mentors</CardTitle>
                          <CardDescription>Connect with experienced autism parents and professionals</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {mentorshipData.availableMentors?.map((mentor, index: number) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{mentor.name}</h4>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-sm">{mentor.rating}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{mentor.title}</p>
                                <p className="text-xs text-gray-700 mb-2">{mentor.approach}</p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {mentor.specialties.map((specialty: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-green-600">{mentor.availability}</span>
                                  <Button size="sm">Connect</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Mentorship Programs</CardTitle>
                          <CardDescription>Structured support programs for different needs</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {mentorshipData.mentorshipPrograms?.map((program, index: number) => (
                              <div key={index} className="border rounded-lg p-3">
                                <h4 className="font-medium mb-2">{program.name}</h4>
                                <p className="text-sm text-gray-700 mb-3">{program.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Duration:</span>
                                    <p className="font-medium">{program.duration}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Sessions:</span>
                                    <p className="font-medium">{program.sessions}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Group Size:</span>
                                    <p className="font-medium">{program.groupSize}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Cost:</span>
                                    <p className="font-medium text-green-600">{program.cost}</p>
                                  </div>
                                </div>
                                <Button size="sm" className="w-full mt-3">
                                  Apply Now
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">Join the Mentorship Program</h3>
                      <p className="text-gray-600 mb-6">Connect with experienced parents and professionals for personalized support</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Community Events</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event: { title: string; type: string; description: string; datetime: string; duration: number; location: { venue: string }; attendance: { current: number; maximum: number }; pricing: { cost: number }; userStatus: string; feedback: { rating: number }; tags: string[] }, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold mb-1">{event.title}</h3>
                            <Badge className={`text-xs ${
                              event.type === 'workshop' ? 'bg-blue-100 text-blue-800' :
                              event.type === 'social' ? 'bg-green-100 text-green-800' :
                              event.type === 'educational' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm">{event.feedback.rating}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{event.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{formatDate(event.datetime)}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{event.duration} minutes</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{event.location.venue}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Attendees</span>
                            <span>{event.attendance.current}/{event.attendance.maximum}</span>
                          </div>
                          <Progress value={(event.attendance.current / event.attendance.maximum) * 100} className="mb-3" />

                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              {event.pricing.cost === 0 ? 'Free' : `£${event.pricing.cost}`}
                            </span>
                            <Button size="sm">
                              {event.userStatus === 'attending' ? 'Attending' :
                               event.userStatus === 'interested' ? 'Interested' :
                               event.userStatus === 'registered' ? 'Registered' :
                               'Join Event'}
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {event.tags.slice(0, 3).map((tag: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
