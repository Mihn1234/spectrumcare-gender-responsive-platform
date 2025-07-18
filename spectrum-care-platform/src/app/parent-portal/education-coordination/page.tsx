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
  GraduationCap,
  MessageSquare,
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Download,
  Share,
  Bell,
  Settings,
  Home,
  ArrowLeft,
  BookOpen,
  Brain,
  Zap,
  Target,
  BarChart3,
  FileText,
  Shield,
  Edit,
  Eye,
  Send,
  Lightbulb,
  Award,
  Timer,
  PieChart,
  School,
  ChevronRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  AlertCircle,
  PlayCircle,
  RefreshCw,
  UserCheck,
  Clipboard,
  Building,
  ArrowRight,
  Filter,
  Search,
  Calendar as CalendarIcon,
  MessageCircle,
  TrendingDown,
  Activity,
  Bookmark,
  Flag,
  HelpCircle,
  Megaphone,
  Presentation,
  UserPlus
} from 'lucide-react';

interface EducationData {
  childId: string;
  lastUpdated: string;
  overallEducationScore: number;
  schoolProfile: any;
  communications: any[];
  behaviorTracking: any[];
  achievements: any[];
  iepSynchronization: any;
  transitionPlanning: any;
  meetings: any[];
  supportRequests: any[];
  analytics: any;
  insights: any;
}

export default function EducationCoordinationPage() {
  const router = useRouter();
  const [educationData, setEducationData] = useState<EducationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState('demo-child-id');
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [showBehaviorForm, setShowBehaviorForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);

  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    recipientType: 'teacher' as const,
    messageType: 'general' as const,
    subject: '',
    message: '',
    priority: 'medium' as const
  });

  const [newBehavior, setNewBehavior] = useState({
    environment: 'school' as const,
    behaviorType: 'positive' as const,
    behavior: '',
    context: '',
    triggers: [] as string[],
    interventions: [] as string[],
    outcome: '',
    severity: 3,
    duration: 0,
    timestamp: new Date().toISOString()
  });

  const [newAchievement, setNewAchievement] = useState({
    achievementType: 'academic' as const,
    title: '',
    description: '',
    category: '',
    milestone: false,
    celebrationLevel: 'medium' as const,
    environment: 'school' as const,
    witnessedBy: '',
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    loadEducationData();
  }, [selectedChild]);

  const loadEducationData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `/api/parent-portal/education-coordination?childId=${selectedChild}&type=overview`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load education data');
      }

      const data = await response.json();
      setEducationData(data.data);

    } catch (error) {
      console.error('Error loading education data:', error);
      setError('Failed to load education coordination data');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/education-coordination', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'send_message',
          childId: selectedChild,
          ...newMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      await loadEducationData();
      setShowNewMessageForm(false);

      // Reset form
      setNewMessage({
        recipientId: '',
        recipientType: 'teacher',
        messageType: 'general',
        subject: '',
        message: '',
        priority: 'medium'
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const trackBehavior = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/education-coordination', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'track_behavior',
          childId: selectedChild,
          ...newBehavior,
          reportedBy: 'Parent'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to track behavior');
      }

      await loadEducationData();
      setShowBehaviorForm(false);

      // Reset form
      setNewBehavior({
        environment: 'school',
        behaviorType: 'positive',
        behavior: '',
        context: '',
        triggers: [],
        interventions: [],
        outcome: '',
        severity: 3,
        duration: 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error tracking behavior:', error);
      setError('Failed to track behavior');
    } finally {
      setIsLoading(false);
    }
  };

  const recordAchievement = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/education-coordination', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'record_achievement',
          childId: selectedChild,
          ...newAchievement
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record achievement');
      }

      await loadEducationData();
      setShowAchievementForm(false);

      // Reset form
      setNewAchievement({
        achievementType: 'academic',
        title: '',
        description: '',
        category: '',
        milestone: false,
        celebrationLevel: 'medium',
        environment: 'school',
        witnessedBy: '',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error recording achievement:', error);
      setError('Failed to record achievement');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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

  const getBehaviorColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'challenging': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading education coordination data...</p>
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
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Education Coordination</h1>
                  <p className="text-sm text-gray-500">School-home integration & communication</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowNewMessageForm(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Message School
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
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

        {!educationData ? (
          <Card>
            <CardContent className="text-center py-12">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Education Data Available</h3>
              <p className="text-gray-600 mb-6">Set up education coordination to manage school communication and progress tracking</p>
              <Button onClick={() => alert('Education setup wizard - Coming soon!')}>
                <Plus className="h-4 w-4 mr-2" />
                Setup Education Coordination
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* School Profile Card */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <School className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{educationData.schoolProfile.name}</h2>
                      <p className="text-gray-600">{educationData.schoolProfile.type} School • {educationData.schoolProfile.currentYear}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">SENCO: {educationData.schoolProfile.senco.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Teacher: {educationData.schoolProfile.classTeacher.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(educationData.overallEducationScore)}`}>
                      {educationData.overallEducationScore}% Education Score
                    </div>
                    <div className="mt-2 space-y-1">
                      <Badge className="bg-green-100 text-green-800">SEND Support Active</Badge>
                      <Badge className="bg-blue-100 text-blue-800">Provisions in Place</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">School Communication</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {educationData.communications.length}
                      </p>
                      <p className="text-sm text-blue-600">95% response rate</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Behavior Tracking</p>
                      <p className="text-3xl font-bold text-green-600">
                        {educationData.behaviorTracking.filter((b: any) => b.behaviorType === 'positive').length}
                      </p>
                      <p className="text-sm text-green-600">70% positive ratio</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Achievements</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {educationData.achievements.length}
                      </p>
                      <p className="text-sm text-yellow-600">
                        {educationData.achievements.filter((a: any) => a.milestone).length} milestones
                      </p>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">IEP Progress</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {educationData.iepSynchronization.currentObjectives.filter((o: any) => o.status === 'on-track' || o.status === 'ahead').length}
                      </p>
                      <p className="text-sm text-purple-600">On track</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights Alert */}
            {educationData.insights?.alertsAndFlags?.length > 0 && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <Trophy className="h-4 w-4 text-green-600" />
                <div className="ml-2">
                  <h4 className="font-medium text-green-800">Education Highlights</h4>
                  <AlertDescription className="text-green-700">
                    {educationData.insights.alertsAndFlags[0].message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="iep">IEP Progress</TabsTrigger>
                <TabsTrigger value="transitions">Transitions</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Communication Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                        Recent Communications
                      </CardTitle>
                      <CardDescription>
                        Latest messages from school staff
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {educationData.communications.slice(0, 3).map((comm: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-sm">{comm.sender}</span>
                                <Badge className={getPriorityColor(comm.priority)}>{comm.priority}</Badge>
                              </div>
                              <span className="text-xs text-gray-500">{formatDate(comm.timestamp)}</span>
                            </div>
                            <h4 className="font-medium text-sm mb-1">{comm.subject}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{comm.message}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* IEP Progress Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-purple-600" />
                        IEP Objectives Progress
                      </CardTitle>
                      <CardDescription>
                        Current educational goals and progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {educationData.iepSynchronization.currentObjectives.slice(0, 3).map((objective: any, index: number) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">{objective.area}</span>
                              <Badge className={objective.status === 'ahead' ? 'bg-green-100 text-green-800' :
                                             objective.status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                                             'bg-orange-100 text-orange-800'}>
                                {objective.status}
                              </Badge>
                            </div>
                            <Progress value={objective.progress.overall} className="mb-2" />
                            <p className="text-xs text-gray-600">{objective.objective}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                      Recent Achievements & Celebrations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {educationData.achievements.slice(0, 3).map((achievement: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                          <div className="flex items-center justify-between mb-2">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                            {achievement.milestone && (
                              <Badge className="bg-yellow-100 text-yellow-800">Milestone</Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm mb-2">{achievement.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{achievement.environment}</span>
                            <span className="text-xs text-gray-500">{formatDate(achievement.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                      Key Education Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {educationData.insights?.keyInsights?.slice(0, 5).map((insight: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-orange-600 mt-1" />
                          <p className="text-sm text-gray-700 flex-1">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowNewMessageForm(true)}>
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="font-medium mb-2">Message School</h3>
                      <p className="text-sm text-gray-600">Send message to teachers or SENCO</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowBehaviorForm(true)}>
                    <CardContent className="p-6 text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-medium mb-2">Track Behavior</h3>
                      <p className="text-sm text-gray-600">Record behavior patterns and interventions</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowAchievementForm(true)}>
                    <CardContent className="p-6 text-center">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                      <h3 className="font-medium mb-2">Record Achievement</h3>
                      <p className="text-sm text-gray-600">Celebrate successes and milestones</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">School Communication</h2>
                  <Button onClick={() => setShowNewMessageForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{educationData.communications.length}</p>
                      <p className="text-sm text-gray-600">Total Messages</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-sm text-gray-600">Response Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Timer className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">4.2h</p>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Message History</CardTitle>
                    <CardDescription>
                      Communication with school staff and teachers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {educationData.communications.map((comm: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{comm.sender}</h4>
                                <p className="text-sm text-gray-600">{comm.senderRole}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getPriorityColor(comm.priority)}>{comm.priority}</Badge>
                              <p className="text-xs text-gray-500 mt-1">{formatDate(comm.timestamp)}</p>
                            </div>
                          </div>

                          <h3 className="font-medium mb-2">{comm.subject}</h3>
                          <p className="text-sm text-gray-700 mb-3">{comm.message}</p>

                          {comm.attachments && comm.attachments.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">Attachments:</p>
                              <div className="flex flex-wrap gap-2">
                                {comm.attachments.map((attachment: any, i: number) => (
                                  <Badge key={i} variant="outline">{attachment}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {comm.replies && comm.replies.length > 0 && (
                            <div className="border-l-2 border-blue-200 pl-4 mt-3">
                              {comm.replies.map((reply: any, i: number) => (
                                <div key={i} className="mb-2 last:mb-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{reply.sender}</span>
                                    <span className="text-xs text-gray-500">{formatDate(reply.timestamp)}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{reply.message}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex justify-end space-x-2 mt-3">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Behavior Tab */}
              <TabsContent value="behavior" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Behavior Tracking</h2>
                  <Button onClick={() => setShowBehaviorForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Track Behavior
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">70%</p>
                      <p className="text-sm text-gray-600">Positive Behaviors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">+15%</p>
                      <p className="text-sm text-gray-600">Improvement</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-sm text-gray-600">Intervention Success</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-2xl font-bold">78%</p>
                      <p className="text-sm text-gray-600">Consistency Score</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Behavior Records</CardTitle>
                    <CardDescription>
                      Track patterns across home and school environments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {educationData.behaviorTracking.map((behavior: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBehaviorColor(behavior.behaviorType)}`}>
                                {behavior.behaviorType === 'positive' ? <ThumbsUp className="h-5 w-5" /> :
                                 behavior.behaviorType === 'challenging' ? <ThumbsDown className="h-5 w-5" /> :
                                 <Activity className="h-5 w-5" />}
                              </div>
                              <div>
                                <h4 className="font-medium">{behavior.behavior}</h4>
                                <p className="text-sm text-gray-600">{behavior.environment} • {behavior.reportedBy}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getBehaviorColor(behavior.behaviorType)}>
                                {behavior.behaviorType}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">{formatDate(behavior.timestamp)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-800 mb-1">Context</h5>
                              <p className="text-sm text-blue-700">{behavior.context}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <h5 className="font-medium text-green-800 mb-1">Outcome</h5>
                              <p className="text-sm text-green-700">{behavior.outcome}</p>
                            </div>
                          </div>

                          {behavior.triggers && behavior.triggers.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-medium text-gray-800 mb-1">Triggers</h5>
                              <div className="flex flex-wrap gap-2">
                                {behavior.triggers.map((trigger: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-orange-700 border-orange-300">
                                    {trigger}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {behavior.interventions && behavior.interventions.length > 0 && (
                            <div className="mb-3">
                              <h5 className="font-medium text-gray-800 mb-1">Interventions</h5>
                              <div className="flex flex-wrap gap-2">
                                {behavior.interventions.map((intervention: any, i: number) => (
                                  <Badge key={i} variant="outline" className="text-purple-700 border-purple-300">
                                    {intervention}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm">Severity: {behavior.severity}/5</span>
                              <span className="text-sm">Duration: {behavior.duration} min</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Achievements & Celebrations</h2>
                  <Button onClick={() => setShowAchievementForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Achievement
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold">{educationData.achievements.length}</p>
                      <p className="text-sm text-gray-600">Total Achievements</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{educationData.achievements.filter((a: any) => a.milestone).length}</p>
                      <p className="text-sm text-gray-600">Major Milestones</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">Accelerating</p>
                      <p className="text-sm text-gray-600">Progress Velocity</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Smile className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-sm text-gray-600">Family Engagement</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Achievement Gallery</CardTitle>
                    <CardDescription>
                      Celebrate successes and milestone moments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {educationData.achievements.map((achievement: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-6 w-6 text-yellow-600" />
                              <Badge className={`${achievement.achievementType === 'communication' ? 'bg-blue-100 text-blue-800' :
                                               achievement.achievementType === 'social' ? 'bg-green-100 text-green-800' :
                                               achievement.achievementType === 'academic' ? 'bg-purple-100 text-purple-800' :
                                               'bg-gray-100 text-gray-800'}`}>
                                {achievement.achievementType}
                              </Badge>
                            </div>
                            {achievement.milestone && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Milestone
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                          <p className="text-sm text-gray-700 mb-3">{achievement.description}</p>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Environment:</span>
                              <span className="font-medium">{achievement.environment}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Witnessed by:</span>
                              <span className="font-medium">{achievement.witnessedBy}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium">{formatDate(achievement.timestamp)}</span>
                            </div>
                          </div>

                          {achievement.recognitionGiven && (
                            <div className="p-3 bg-white rounded-lg border border-yellow-200">
                              <h5 className="font-medium text-yellow-800 mb-2">Recognition Given</h5>
                              <div className="text-xs space-y-1">
                                {achievement.recognitionGiven.schoolCertificate && (
                                  <p>🏆 School Certificate Awarded</p>
                                )}
                                {achievement.recognitionGiven.homeReward && (
                                  <p>🎁 Home Reward: {achievement.recognitionGiven.homeReward}</p>
                                )}
                                {achievement.recognitionGiven.familyCelebration && (
                                  <p>🎉 Family Celebration: {achievement.recognitionGiven.familyCelebration}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {achievement.progressImpact && (
                            <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                              <p className="text-xs text-green-800">
                                <strong>Impact:</strong> {achievement.progressImpact}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* IEP Progress Tab */}
              <TabsContent value="iep" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">IEP Progress & Synchronization</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync with School
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Review
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">82%</p>
                      <p className="text-sm text-gray-600">Overall Progress</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">
                        {educationData.iepSynchronization.currentObjectives.filter((o: any) => o.status === 'on-track' || o.status === 'ahead').length}
                      </p>
                      <p className="text-sm text-gray-600">On Track Objectives</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">88%</p>
                      <p className="text-sm text-gray-600">Home-School Alignment</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-2xl font-bold">
                        {Math.ceil((new Date(educationData.iepSynchronization.nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                      <p className="text-sm text-gray-600">Days to Review</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Current Objectives Progress</CardTitle>
                    <CardDescription>
                      Track progress on IEP goals across home and school
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {educationData.iepSynchronization.currentObjectives.map((objective: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{objective.area}</h3>
                              <p className="text-sm text-gray-600">Target: {formatDate(objective.targetDate)}</p>
                            </div>
                            <Badge className={objective.status === 'ahead' ? 'bg-green-100 text-green-800' :
                                             objective.status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                                             'bg-orange-100 text-orange-800'}>
                              {objective.status}
                            </Badge>
                          </div>

                          <p className="text-sm mb-4">{objective.objective}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600 mb-1">Home Progress</p>
                              <div className="relative">
                                <Progress value={objective.progress.home} className="mb-1" />
                                <span className="text-sm font-bold">{objective.progress.home}%</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600 mb-1">School Progress</p>
                              <div className="relative">
                                <Progress value={objective.progress.school} className="mb-1" />
                                <span className="text-sm font-bold">{objective.progress.school}%</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-600 mb-1">Overall Progress</p>
                              <div className="relative">
                                <Progress value={objective.progress.overall} className="mb-1" />
                                <span className="text-sm font-bold">{objective.progress.overall}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-800 mb-1">Home Strategy</h5>
                              <p className="text-sm text-blue-700">{objective.homeStrategy}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <h5 className="font-medium text-green-800 mb-1">School Strategy</h5>
                              <p className="text-sm text-green-700">{objective.schoolStrategy}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sync Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                      Synchronization Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Sync Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Last Sync:</span>
                            <span className="font-medium">{formatDate(educationData.iepSynchronization.lastSyncDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className="bg-green-100 text-green-800">{educationData.iepSynchronization.syncStatus}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Auto Sync:</span>
                            <Badge className={educationData.iepSynchronization.autoSyncEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                              {educationData.iepSynchronization.autoSyncEnabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Frequency:</span>
                            <span className="font-medium">{educationData.iepSynchronization.syncFrequency}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Next Review</h4>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="font-medium text-purple-800">
                            {formatDate(educationData.iepSynchronization.nextReview)}
                          </p>
                          <p className="text-sm text-purple-700 mt-1">
                            Participants: {educationData.iepSynchronization.reviewParticipants.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Transitions Tab */}
              <TabsContent value="transitions" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Educational Transitions</h2>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Plan Transition
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Building className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">75%</p>
                      <p className="text-sm text-gray-600">Transition Readiness</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">60%</p>
                      <p className="text-sm text-gray-600">Preparation Progress</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">95%</p>
                      <p className="text-sm text-gray-600">Support System</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Transitions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Transition Planning</CardTitle>
                    <CardDescription>
                      Upcoming educational transitions and preparation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {educationData.transitionPlanning.currentTransitions.map((transition: any, index: number) => (
                      <div key={index} className="border rounded-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{transition.fromYear} → {transition.toYear}</h3>
                            <p className="text-gray-600">
                              Transition Date: {formatDate(transition.transitionDate)}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">{transition.status}</Badge>
                        </div>

                        {/* Preparation Activities */}
                        <div className="mb-6">
                          <h4 className="font-medium mb-3">Preparation Activities</h4>
                          <div className="space-y-3">
                            {transition.preparationActivities.map((activity: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                                    activity.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                                    activity.status === 'scheduled' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {activity.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                                     activity.status === 'in-progress' ? <PlayCircle className="h-4 w-4" /> :
                                     activity.status === 'scheduled' ? <Calendar className="h-4 w-4" /> :
                                     <Clock className="h-4 w-4" />}
                                  </div>
                                  <div>
                                    <p className="font-medium">{activity.activity}</p>
                                    <p className="text-sm text-gray-600">{activity.notes}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge className={activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                   activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                   activity.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                                   'bg-gray-100 text-gray-800'}>
                                    {activity.status}
                                  </Badge>
                                  <p className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Support Strategies */}
                        <div className="mb-6">
                          <h4 className="font-medium mb-3">Support Strategies</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {transition.supportStrategies.map((strategy: any, i: number) => (
                              <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-800">• {strategy}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Contacts */}
                        <div className="mb-6">
                          <h4 className="font-medium mb-3">Key Contacts</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {transition.keyContacts.map((contact: any, i: number) => (
                              <div key={i} className="p-4 border rounded-lg">
                                <h5 className="font-medium">{contact.name}</h5>
                                <p className="text-sm text-gray-600">{contact.role}</p>
                                <p className="text-sm text-gray-600">{contact.school}</p>
                                <p className="text-sm text-blue-600">{contact.contact}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-medium text-orange-800 mb-2">Risk Assessment</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-orange-700 mb-1">Risk Level:</p>
                              <Badge className="bg-orange-100 text-orange-800">{transition.riskAssessment.riskLevel}</Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-orange-700 mb-1">Identified Risks:</p>
                              <ul className="text-sm text-orange-700">
                                {transition.riskAssessment.identifiedRisks.map((risk: any, i: number) => (
                                  <li key={i}>• {risk}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Future Transitions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Future Transition Planning</CardTitle>
                    <CardDescription>
                      Long-term educational transition preparation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {educationData.transitionPlanning.futureTransitions.map((transition: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{transition.type.replace('-', ' to ')}</h4>
                              <p className="text-sm text-gray-600">
                                Estimated: {formatDate(transition.estimatedDate)}
                              </p>
                            </div>
                            <Badge className="bg-gray-100 text-gray-800">{transition.status}</Badge>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Key Considerations:</p>
                            <ul className="text-sm text-gray-600">
                              {transition.considerations.map((consideration: any, i: number) => (
                                <li key={i}>• {consideration}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Modal Forms */}

        {/* New Message Form */}
        {showNewMessageForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Send Message to School</CardTitle>
                <CardDescription>Communicate with teachers and staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Recipient Type</label>
                  <Select value={newMessage.recipientType} onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, recipientType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Class Teacher</SelectItem>
                      <SelectItem value="senco">SENCO</SelectItem>
                      <SelectItem value="headteacher">Head Teacher</SelectItem>
                      <SelectItem value="support-staff">Support Staff</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message Type</label>
                  <Select value={newMessage.messageType} onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, messageType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select message type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Communication</SelectItem>
                      <SelectItem value="behavior">Behavior Update</SelectItem>
                      <SelectItem value="academic">Academic Progress</SelectItem>
                      <SelectItem value="medical">Medical Information</SelectItem>
                      <SelectItem value="urgent">Urgent Matter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Weekly progress update"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write your message here..."
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newMessage.priority} onValueChange={(value: any) => setNewMessage(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowNewMessageForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Behavior Tracking Form */}
        {showBehaviorForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg mx-4">
              <CardHeader>
                <CardTitle>Track Behavior</CardTitle>
                <CardDescription>Record behavior patterns and interventions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Environment</label>
                    <Select value={newBehavior.environment} onValueChange={(value: any) => setNewBehavior(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="therapy">Therapy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Behavior Type</label>
                    <Select value={newBehavior.behaviorType} onValueChange={(value: any) => setNewBehavior(prev => ({ ...prev, behaviorType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="challenging">Challenging</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Behavior Description</label>
                  <Input
                    value={newBehavior.behavior}
                    onChange={(e) => setNewBehavior(prev => ({ ...prev, behavior: e.target.value }))}
                    placeholder="e.g., Asked for help with task"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Context</label>
                  <Textarea
                    value={newBehavior.context}
                    onChange={(e) => setNewBehavior(prev => ({ ...prev, context: e.target.value }))}
                    placeholder="Describe the situation when this behavior occurred..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Outcome</label>
                  <Textarea
                    value={newBehavior.outcome}
                    onChange={(e) => setNewBehavior(prev => ({ ...prev, outcome: e.target.value }))}
                    placeholder="What happened as a result?"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Severity (1-5)</label>
                    <Select value={newBehavior.severity.toString()} onValueChange={(value) => setNewBehavior(prev => ({ ...prev, severity: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very mild</SelectItem>
                        <SelectItem value="2">2 - Mild</SelectItem>
                        <SelectItem value="3">3 - Moderate</SelectItem>
                        <SelectItem value="4">4 - Significant</SelectItem>
                        <SelectItem value="5">5 - Major</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={newBehavior.duration}
                      onChange={(e) => setNewBehavior(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowBehaviorForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={trackBehavior}>
                    <Activity className="h-4 w-4 mr-2" />
                    Track Behavior
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Achievement Recording Form */}
        {showAchievementForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Record Achievement</CardTitle>
                <CardDescription>Celebrate success and milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Achievement Type</label>
                  <Select value={newAchievement.achievementType} onValueChange={(value: any) => setNewAchievement(prev => ({ ...prev, achievementType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="independence">Independence</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Achievement Title</label>
                  <Input
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., First spontaneous question in class"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what happened and why it's significant..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Environment</label>
                    <Select value={newAchievement.environment} onValueChange={(value: any) => setNewAchievement(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="therapy">Therapy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Celebration Level</label>
                    <Select value={newAchievement.celebrationLevel} onValueChange={(value: any) => setNewAchievement(prev => ({ ...prev, celebrationLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Witnessed By</label>
                  <Input
                    value={newAchievement.witnessedBy}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, witnessedBy: e.target.value }))}
                    placeholder="e.g., Miss Johnson, Teaching Assistant"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="milestone"
                    checked={newAchievement.milestone}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, milestone: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="milestone" className="text-sm font-medium">This is a major milestone</label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowAchievementForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={recordAchievement}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Record Achievement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
