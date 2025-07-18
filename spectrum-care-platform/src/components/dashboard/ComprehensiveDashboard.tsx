'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Calendar,
  FileText,
  UserCheck,
  Plus,
  Upload,
  MessageSquare,
  Settings,
  Briefcase,
  Home,
  Heart,
  Brain,
  Shield,
  Globe,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Share,
  Star,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Award,
  Workflow
} from 'lucide-react';

interface ComprehensiveDashboardProps {
  userRole: string;
  userData: any;
}

export default function ComprehensiveDashboard({ userRole, userData }: ComprehensiveDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load comprehensive dashboard data
      const [statsRes, activityRes, notificationsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity'),
        fetch('/api/dashboard/notifications')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || {});
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData.data || []);
      }

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.data || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleSpecificGreeting = () => {
    switch (userRole) {
      case 'parent':
        return 'Managing your family\'s autism support journey';
      case 'professional':
        return 'Supporting your clients with expert assessments';
      case 'la_officer':
        return 'Coordinating comprehensive support services';
      case 'admin':
        return 'Overseeing the complete platform ecosystem';
      default:
        return 'Welcome to your autism support platform';
    }
  };

  const renderOverviewStats = () => {
    const baseStats = [
      {
        title: 'Children Profiles',
        value: stats.totalChildren || 1,
        change: '+2 this month',
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'Assessments',
        value: stats.totalAssessments || 3,
        change: '+1 this week',
        icon: FileText,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Documents',
        value: stats.totalDocuments || 5,
        change: 'AI analyzed: 4',
        icon: Brain,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        title: 'Reviews',
        value: stats.upcomingReviews || 1,
        change: 'Due this month',
        icon: Calendar,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    ];

    // Add role-specific stats
    if (userRole === 'professional') {
      baseStats.push(
        {
          title: 'White Label Active',
          value: stats.whiteLabelEnabled ? 'Yes' : 'No',
          change: 'Customize your brand',
          icon: Globe,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100'
        },
        {
          title: 'Client Portal Views',
          value: stats.portalViews || 127,
          change: '+15% this week',
          icon: Eye,
          color: 'text-teal-600',
          bgColor: 'bg-teal-100'
        }
      );
    }

    if (userRole === 'la_officer') {
      baseStats.push(
        {
          title: 'Active Caseload',
          value: stats.activeCases || 24,
          change: '3 new this week',
          icon: Briefcase,
          color: 'text-rose-600',
          bgColor: 'bg-rose-100'
        },
        {
          title: 'Guest Access',
          value: stats.activeGuestAccess || 5,
          change: '2 expiring soon',
          icon: Shield,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100'
        }
      );
    }

    if (userRole === 'admin') {
      baseStats.push(
        {
          title: 'Platform Users',
          value: stats.totalUsers || 1250,
          change: '+45 this month',
          icon: Users,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-100'
        },
        {
          title: 'AI Analyses',
          value: stats.totalAnalyses || 890,
          change: '+67 today',
          icon: Zap,
          color: 'text-pink-600',
          bgColor: 'bg-pink-100'
        }
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {baseStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuickActions = () => {
    const baseActions = [
      {
        title: 'Add Child Profile',
        description: 'Create a new child profile',
        icon: Plus,
        color: 'bg-blue-600',
        action: () => router.push('/children/add')
      },
      {
        title: 'Upload Document',
        description: 'Add documents for AI analysis',
        icon: Upload,
        color: 'bg-green-600',
        action: () => router.push('/documents/upload')
      },
      {
        title: 'Book Assessment',
        description: 'Schedule professional assessment',
        icon: Calendar,
        color: 'bg-purple-600',
        action: () => router.push('/assessments/book')
      }
    ];

    // Add role-specific actions
    if (userRole === 'parent') {
      baseActions.push(
        {
          title: 'Adult Profile',
          description: 'Create adult support profile',
          icon: Briefcase,
          color: 'bg-orange-600',
          action: () => router.push('/adults/profile/create')
        },
        {
          title: 'Import Plan',
          description: 'Import existing EHC plan',
          icon: FileText,
          color: 'bg-indigo-600',
          action: () => router.push('/plans/import')
        }
      );
    }

    if (userRole === 'professional') {
      baseActions.push(
        {
          title: 'White Label Setup',
          description: 'Configure your brand',
          icon: Globe,
          color: 'bg-teal-600',
          action: () => router.push('/professional/white-label')
        },
        {
          title: 'AI Analysis',
          description: 'Analyze documents with AI',
          icon: Brain,
          color: 'bg-pink-600',
          action: () => router.push('/ai/analyze')
        }
      );
    }

    if (userRole === 'la_officer') {
      baseActions.push(
        {
          title: 'Guest Access',
          description: 'Invite external professionals',
          icon: Shield,
          color: 'bg-amber-600',
          action: () => router.push('/guest-access/create')
        },
        {
          title: 'Compliance Check',
          description: 'Run plan compliance analysis',
          icon: CheckCircle,
          color: 'bg-emerald-600',
          action: () => router.push('/compliance/check')
        }
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {baseActions.map((action, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={action.action}
          >
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-3 rounded-full ${action.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRecentActivity = () => {
    const sampleActivity = [
      {
        id: 1,
        type: 'document_analyzed',
        title: 'Educational Psychology Report analyzed',
        description: 'AI analysis completed with 89% confidence',
        timestamp: '2 hours ago',
        icon: Brain,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        id: 2,
        type: 'review_scheduled',
        title: 'Annual Review scheduled',
        description: 'Meeting set for March 15th, 2024',
        timestamp: '5 hours ago',
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        id: 3,
        type: 'plan_imported',
        title: 'EHC Plan imported successfully',
        description: 'Quality score: 82%, 3 recommendations generated',
        timestamp: '1 day ago',
        icon: FileText,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        id: 4,
        type: 'assessment_completed',
        title: 'Speech Therapy Assessment completed',
        description: 'Report available for review',
        timestamp: '2 days ago',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100'
      }
    ];

    return (
      <div className="space-y-4">
        {sampleActivity.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors duration-200">
            <div className={`p-2 rounded-full ${activity.bgColor}`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{activity.title}</h4>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
            </div>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderUpcomingTasks = () => {
    const tasks = [
      {
        id: 1,
        title: 'Review AI Analysis Results',
        description: 'Check document analysis for Ahmed\'s speech therapy report',
        dueDate: 'Today',
        priority: 'high',
        type: 'ai_review'
      },
      {
        id: 2,
        title: 'Prepare for Annual Review',
        description: 'Gather reports and evidence for upcoming meeting',
        dueDate: 'March 10',
        priority: 'medium',
        type: 'review_prep'
      },
      {
        id: 3,
        title: 'Update Adult Profile',
        description: 'Add employment goals and living skills assessment',
        dueDate: 'March 12',
        priority: 'low',
        type: 'profile_update'
      },
      {
        id: 4,
        title: 'Guest Access Expiring',
        description: 'External psychologist access expires in 3 days',
        dueDate: 'March 8',
        priority: 'medium',
        type: 'access_management'
      }
    ];

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'high': return 'text-red-600 bg-red-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        case 'low': return 'text-green-600 bg-green-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{task.description}</p>
              <p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p>
            </div>
            <Button variant="ghost" size="sm">
              <CheckCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderPlatformHealth = () => {
    const healthMetrics = [
      { label: 'System Performance', value: 98, color: 'text-green-600' },
      { label: 'AI Analysis Accuracy', value: 94, color: 'text-blue-600' },
      { label: 'User Satisfaction', value: 96, color: 'text-purple-600' },
      { label: 'Data Security', value: 100, color: 'text-emerald-600' }
    ];

    return (
      <div className="space-y-4">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{metric.label}</span>
              <span className={`text-sm font-bold ${metric.color}`}>{metric.value}%</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {userData?.firstName || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">{getRoleSpecificGreeting()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                All Systems Operational
              </Badge>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-8 space-y-4">
            {notifications.map((notification, index) => (
              <Alert key={index} className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{notification.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Overview Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
          {renderOverviewStats()}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          {renderQuickActions()}
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="tasks">Upcoming Tasks</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="health">Platform Health</TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates across your autism support platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderRecentActivity()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>
                  Important tasks and deadlines to keep track of
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderUpcomingTasks()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">Documents Analyzed</p>
                        <p className="text-sm text-gray-600">Last 30 days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">23</p>
                        <p className="text-sm text-gray-500">+8 this week</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Average Confidence</p>
                        <p className="text-sm text-gray-600">AI analysis accuracy</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">94%</p>
                        <p className="text-sm text-gray-500">+2% improvement</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Progress Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Plan Quality Score</span>
                        <span className="text-sm font-bold text-green-600">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Compliance Rating</span>
                        <span className="text-sm font-bold text-blue-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Support Effectiveness</span>
                        <span className="text-sm font-bold text-purple-600">89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle>Platform Health Metrics</CardTitle>
                <CardDescription>
                  Real-time system performance and reliability indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderPlatformHealth()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600">Intelligent document analysis and recommendations</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">White Label Solutions</h3>
                <p className="text-sm text-gray-600">Customizable professional branding</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Secure Guest Access</h3>
                <p className="text-sm text-gray-600">Controlled external professional access</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Comprehensive Support</h3>
                <p className="text-sm text-gray-600">Complete autism support ecosystem</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
