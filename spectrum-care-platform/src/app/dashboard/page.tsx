'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Calendar,
  FileText,
  UserCheck,
  Plus,
  Download,
  Upload,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Briefcase,
  Home,
  Heart,
  ArrowRight,
  Shield,
  TrendingUp,
  GraduationCap,
  Mic,
  MapPin,
  Activity,
  Brain
} from 'lucide-react';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  stats: {
    assessmentCount: number;
    documentCount: number;
    ehcPlanCount: number;
  };
}

interface Assessment {
  id: string;
  childName: string;
  professionalName: string;
  assessmentType: string;
  scheduledDate: string;
  status: string;
  cost?: number;
}

interface Document {
  id: string;
  title: string;
  documentType: string;
  uploadedDate: string;
  hasAiAnalysis: boolean;
  childName?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get user from localStorage
      const storedUser = localStorage.getItem('userData');
      const authToken = localStorage.getItem('authToken');

      if (!storedUser || !authToken) {
        router.push('/auth/login');
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Create headers with authentication
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };

      // Load children, assessments, and documents in parallel
      const [childrenRes, assessmentsRes, documentsRes] = await Promise.all([
        fetch('/api/children', { headers }),
        fetch('/api/assessments', { headers }),
        fetch('/api/documents', { headers })
      ]);

      if (childrenRes.ok) {
        const childrenData = await childrenRes.json();
        setChildren(childrenData.data || []);
      }

      if (assessmentsRes.ok) {
        const assessmentsData = await assessmentsRes.json();
        setAssessments(assessmentsData.data || []);
      }

      if (documentsRes.ok) {
        const documentsData = await documentsRes.json();
        setDocuments(documentsData.data || []);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    router.push('/');
  };

  const getUpcomingAssessments = () => {
    return assessments
      .filter(assessment =>
        new Date(assessment.scheduledDate) > new Date() &&
        assessment.status === 'scheduled'
      )
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);
  };

  const getRecentDocuments = () => {
    return documents
      .sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime())
      .slice(0, 5);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <span className="text-xl font-bold text-gray-900">SpectrumCare</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Button variant="ghost" className="text-blue-600">Dashboard</Button>
                <Button variant="ghost" onClick={() => router.push('/ai/analyze')}>AI Analysis</Button>
                {user?.role === 'professional' && (
                  <Button variant="ghost" onClick={() => router.push('/professional/white-label')}>White Label</Button>
                )}
                {(user?.role === 'la_officer' || user?.role === 'admin') && (
                  <Button variant="ghost" onClick={() => router.push('/guest-access/manage')}>Guest Access</Button>
                )}
                <Button variant="ghost" onClick={() => router.push('/adults/profile/create')}>Adult Services</Button>
                <Button variant="ghost" onClick={() => router.push('/plans/import')}>Plan Import</Button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/voice-assistant')}>
                <Mic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2 pl-4 border-l">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your autism support journey today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Children</p>
                  <p className="text-3xl font-bold text-gray-900">{children.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assessments</p>
                  <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Analyses</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {documents.filter(d => d.hasAiAnalysis).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="children">Children</TabsTrigger>
            <TabsTrigger value="adults">Adults</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="content">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome to SpectrumCare, {user?.firstName}!
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Your comprehensive autism support ecosystem - revolutionizing care through AI-powered tools
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{children.length}</p>
                    <p className="text-sm text-gray-600">Children</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{documents.filter(d => d.hasAiAnalysis).length}</p>
                    <p className="text-sm text-gray-600">AI Analyses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{assessments.length}</p>
                    <p className="text-sm text-gray-600">Assessments</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Dashboard Cards */}
              <div className="lg:col-span-2 space-y-6">
                {/* EHC Plan Status */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        EHC Plan Management
                      </span>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">85%</p>
                        <p className="text-sm text-gray-600">Plan Quality Score</p>
                        <p className="text-xs text-gray-500 mt-1">Above average</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">Mar 15</p>
                        <p className="text-sm text-gray-600">Next Review</p>
                        <p className="text-xs text-gray-500 mt-1">2 months away</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">3</p>
                        <p className="text-sm text-gray-600">Recommendations</p>
                        <p className="text-xs text-gray-500 mt-1">AI suggested</p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" onClick={() => alert('EHC Plan comparison - Coming soon!')}>
                        Compare Plans
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => alert('Shadow plan - Coming soon!')}>
                        View Shadow Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Crisis Management Status */}
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-green-600" />
                        Crisis Management
                      </span>
                      <Badge className="bg-green-100 text-green-800">All Clear</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">0</p>
                        <p className="text-sm text-gray-600">Active Crises</p>
                        <p className="text-xs text-gray-500 mt-1">Stable period</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">7</p>
                        <p className="text-sm text-gray-600">Days Since Last</p>
                        <p className="text-xs text-gray-500 mt-1">Minor incident</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">4</p>
                        <p className="text-sm text-gray-600">Prevention Plans</p>
                        <p className="text-xs text-gray-500 mt-1">Active strategies</p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" onClick={() => alert('Crisis plan - Coming soon!')}>
                        View Crisis Plan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => alert('Emergency contacts - Coming soon!')}>
                        Emergency Contacts
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Management */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                        Financial Management
                      </span>
                      <Badge className="bg-orange-100 text-orange-800">On Track</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">£6,800</p>
                        <p className="text-sm text-gray-600">Budget Remaining</p>
                        <p className="text-xs text-gray-500 mt-1">37% of total</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">£1,200</p>
                        <p className="text-sm text-gray-600">Monthly Spend</p>
                        <p className="text-xs text-gray-500 mt-1">Average rate</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">2</p>
                        <p className="text-sm text-gray-600">Outcomes Achieved</p>
                        <p className="text-xs text-gray-500 mt-1">This month</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Budget Utilization</span>
                        <span className="text-sm font-medium">63%</span>
                      </div>
                      <Progress value={63} className="h-2" />
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" onClick={() => alert('Budget details - Coming soon!')}>
                        View Budget
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => alert('Add expense - Coming soon!')}>
                        Add Expense
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          size="sm"
                          className="h-16 flex-col space-y-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          onClick={() => router.push('/voice-assistant')}
                        >
                          <Mic className="h-5 w-5" />
                          <span className="text-xs">Voice Assistant</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-16 flex-col space-y-1"
                          onClick={() => router.push('/ai/analyze')}
                        >
                          <UserCheck className="h-5 w-5" />
                          <span className="text-xs">AI Analysis</span>
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-12 flex-col space-y-1"
                          onClick={() => alert('Crisis report - Coming soon!')}
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs">Crisis</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-12 flex-col space-y-1"
                          onClick={() => router.push('/documents/upload')}
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-xs">Upload</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-12 flex-col space-y-1"
                          onClick={() => router.push('/assessments/book')}
                        >
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">Book</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getUpcomingAssessments().length > 0 ? (
                      <div className="space-y-3">
                        {getUpcomingAssessments().slice(0, 3).map((assessment) => (
                          <div key={assessment.id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-sm">{assessment.assessmentType}</p>
                            <p className="text-xs text-gray-600">{formatDate(assessment.scheduledDate)}</p>
                            <p className="text-xs text-gray-500">{assessment.professionalName}</p>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push('/assessments')}
                        >
                          View All Events
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">No upcoming events</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => router.push('/assessments/book')}
                        >
                          Schedule Event
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">AI analysis completed</p>
                          <p className="text-xs text-gray-500">School report analyzed - 92% confidence</p>
                          <p className="text-xs text-gray-400">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Assessment scheduled</p>
                          <p className="text-xs text-gray-500">Cognitive assessment with Dr. Wilson</p>
                          <p className="text-xs text-gray-400">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Budget updated</p>
                          <p className="text-xs text-gray-500">Speech therapy payment processed</p>
                          <p className="text-xs text-gray-400">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Comprehensive Features Banner */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Comprehensive Parent Portal Features
                </CardTitle>
                <CardDescription>
                  Access the world's most comprehensive autism support toolkit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                    onClick={() => router.push('/parent-portal/ehc-comparison')}
                  >
                    <FileText className="h-6 w-6 text-purple-600" />
                    <span className="text-xs">Plan Comparison</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                    onClick={() => router.push('/parent-portal/crisis-management')}
                  >
                    <Shield className="h-6 w-6 text-green-600" />
                    <span className="text-xs">Crisis Management</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-orange-200 hover:bg-orange-50"
                    onClick={() => router.push('/parent-portal/financial-management')}
                  >
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    <span className="text-xs">Budget Tracking</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                    onClick={() => router.push('/parent-portal/health-coordination')}
                  >
                    <Heart className="h-6 w-6 text-blue-600" />
                    <span className="text-xs">Health Tracking</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-teal-200 hover:bg-teal-50"
                    onClick={() => router.push('/parent-portal/education-coordination')}
                  >
                    <GraduationCap className="h-6 w-6 text-teal-600" />
                    <span className="text-xs">Education Hub</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-pink-200 hover:bg-pink-50"
                    onClick={() => router.push('/parent-portal/daily-living')}
                  >
                    <Home className="h-6 w-6 text-pink-600" />
                    <span className="text-xs">Daily Living</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-red-200 hover:bg-red-50"
                    onClick={() => alert('Legal Support - Coming soon!')}
                  >
                    <MessageSquare className="h-6 w-6 text-red-600" />
                    <span className="text-xs">Legal Support</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-yellow-200 hover:bg-yellow-50"
                    onClick={() => router.push('/professional-marketplace')}
                  >
                    <Users className="h-6 w-6 text-yellow-600" />
                    <span className="text-xs">Marketplace</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                    onClick={() => router.push('/voice-assistant')}
                  >
                    <Mic className="h-6 w-6 text-purple-600" />
                    <span className="text-xs">Voice Assistant</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-indigo-200 hover:bg-indigo-50"
                    onClick={() => router.push('/community-support')}
                  >
                    <Users className="h-6 w-6 text-indigo-600" />
                    <span className="text-xs">Community</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Children Tab */}
          <TabsContent value="children" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Children Profiles</h2>
              <Button onClick={() => router.push('/children/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </div>

            {children.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                  <Card key={child.id}>
                    <CardHeader>
                      <CardTitle>{child.firstName} {child.lastName}</CardTitle>
                      <CardDescription>Age: {child.age} years old</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Assessments</span>
                          <Badge variant="secondary">{child.stats.assessmentCount}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Documents</span>
                          <Badge variant="secondary">{child.stats.documentCount}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">EHC Plans</span>
                          <Badge variant="secondary">{child.stats.ehcPlanCount}</Badge>
                        </div>
                        <Button
                          className="w-full mt-4"
                          variant="outline"
                          onClick={() => alert('Feature coming soon!')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No children profiles yet</h3>
                  <p className="text-gray-600 mb-6">Get started by adding your first child profile</p>
                  <Button onClick={() => router.push('/children/add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Child Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Assessments</h2>
              <Button onClick={() => router.push('/assessments/book')}>
                <Plus className="h-4 w-4 mr-2" />
                Book Assessment
              </Button>
            </div>

            {assessments.length > 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {assessments.map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{assessment.assessmentType}</p>
                            <p className="text-sm text-gray-600">{assessment.childName}</p>
                            <p className="text-sm text-gray-500">with {assessment.professionalName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatDate(assessment.scheduledDate)}</p>
                          <Badge className={getStatusColor(assessment.status)}>
                            {assessment.status}
                          </Badge>
                          {assessment.cost && (
                            <p className="text-sm text-gray-500 mt-1">£{assessment.cost}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No assessments scheduled</h3>
                  <p className="text-gray-600 mb-6">Book your first assessment with a qualified professional</p>
                  <Button onClick={() => router.push('/assessments/book')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Documents</h2>
              <Button onClick={() => router.push('/documents/upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {documents.length > 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-10 w-10 text-blue-600" />
                          <div>
                            <p className="font-medium">{document.title}</p>
                            <p className="text-sm text-gray-600">{document.documentType}</p>
                            {document.childName && (
                              <p className="text-sm text-gray-500">for {document.childName}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(document.uploadedDate)}</p>
                          {document.hasAiAnalysis ? (
                            <Badge className="bg-green-100 text-green-800 mt-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              AI Analyzed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              Processing
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No documents uploaded</h3>
                  <p className="text-gray-600 mb-6">Upload your first document for AI-powered analysis</p>
                  <Button onClick={() => router.push('/documents/upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Adults Tab */}
          <TabsContent value="adults" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Adult Support Services</h2>
              <Button onClick={() => router.push('/adults/profile/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Adult Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                    Employment Support
                  </CardTitle>
                  <CardDescription>
                    Career development and workplace support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Profiles</span>
                      <Badge variant="secondary">1</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Employment Rate</span>
                      <Badge className="bg-green-100 text-green-800">75%</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Programs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-green-600" />
                    Independent Living
                  </CardTitle>
                  <CardDescription>
                    Daily living skills and independence support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Skills Assessed</span>
                      <Badge variant="secondary">4</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Independence Score</span>
                      <Badge className="bg-blue-100 text-blue-800">68%</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      View Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-purple-600" />
                    Transition Planning
                  </CardTitle>
                  <CardDescription>
                    Child to adult services transition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Plans</span>
                      <Badge variant="secondary">2</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <Badge className="bg-orange-100 text-orange-800">45%</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for adult autism support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => router.push('/adults/profile/create')}
                  >
                    <Plus className="h-6 w-6" />
                    <span>Create Adult Profile</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => router.push('/ai/analyze')}
                  >
                    <Briefcase className="h-6 w-6" />
                    <span>AI Assessment</span>
                  </Button>
                  {user?.role === 'professional' && (
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                      onClick={() => router.push('/professional/white-label')}
                    >
                      <Home className="h-6 w-6" />
                      <span>White Label</span>
                    </Button>
                  )}
                  {(user?.role === 'la_officer' || user?.role === 'admin') && (
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                      onClick={() => router.push('/guest-access/manage')}
                    >
                      <Heart className="h-6 w-6" />
                      <span>Guest Access</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Plan Management</h2>
              <Button onClick={() => router.push('/plans/import')}>
                <Upload className="h-4 w-4 mr-2" />
                Import Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Imported Plans
                  </CardTitle>
                  <CardDescription>
                    Plans imported from other authorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Imported</span>
                      <Badge variant="secondary">1</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Quality</span>
                      <Badge className="bg-green-100 text-green-800">82%</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Reviews Scheduled
                  </CardTitle>
                  <CardDescription>
                    Upcoming plan reviews and meetings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Upcoming</span>
                      <Badge variant="secondary">1</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Next Review</span>
                      <Badge className="bg-blue-100 text-blue-800">Mar 15</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-purple-600" />
                    AI Analysis
                  </CardTitle>
                  <CardDescription>
                    Plan quality and compliance scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Analyzed</span>
                      <Badge variant="secondary">1</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Compliance</span>
                      <Badge className="bg-green-100 text-green-800">88%</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      View Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Plan Import Wizard</CardTitle>
                <CardDescription>
                  Import existing plans from other authorities with AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        Import Your Existing Plans
                      </h3>
                      <p className="text-sm text-gray-600">
                        Upload documents, extract content with AI, and get quality assessments
                      </p>
                    </div>
                    <Button onClick={() => router.push('/plans/import')}>
                      Start Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Coordination Tab */}
          <TabsContent value="education" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Education Coordination</h2>
              <Button onClick={() => router.push('/parent-portal/education-coordination')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Full Education Hub
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                    School Communication
                  </CardTitle>
                  <CardDescription>
                    Stay connected with teachers and staff
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recent Messages</span>
                      <Badge>5 new</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Rate</span>
                      <span className="text-sm font-medium text-green-600">95%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="text-sm font-medium">4.2 hours</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => router.push('/parent-portal/education-coordination')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Messages
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-green-600" />
                    Behavior Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor patterns across environments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Positive Behaviors</span>
                      <span className="text-sm font-medium text-green-600">70%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weekly Improvement</span>
                      <span className="text-sm font-medium text-blue-600">+15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Intervention Success</span>
                      <span className="text-sm font-medium text-purple-600">85%</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => router.push('/parent-portal/education-coordination')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Track Behavior
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-yellow-600" />
                    Achievement Celebrations
                  </CardTitle>
                  <CardDescription>
                    Recent milestones and successes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="text-sm font-medium text-yellow-600">8 achievements</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Major Milestones</span>
                      <span className="text-sm font-medium text-green-600">3 completed</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progress Velocity</span>
                      <span className="text-sm font-medium text-blue-600">Accelerating</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => router.push('/parent-portal/education-coordination')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    View Achievements
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
                  IEP Progress & School Integration
                </CardTitle>
                <CardDescription>
                  Educational goals and transition planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Current IEP Objectives</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Communication Goals</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={82} className="w-16" />
                          <span className="text-sm font-medium">82%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Social Skills</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={73} className="w-16" />
                          <span className="text-sm font-medium">73%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Academic Independence</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={89} className="w-16" />
                          <span className="text-sm font-medium">89%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Upcoming Transitions</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800">Year 4 Transition</h5>
                        <p className="text-sm text-blue-700">
                          Preparation: 75% complete
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Meet new teacher scheduled for July 15th
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-800">IEP Annual Review</h5>
                        <p className="text-sm text-purple-700">
                          Scheduled: March 15th, 2024
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          All reports and assessments ready
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button onClick={() => router.push('/parent-portal/education-coordination')}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Open Full Education Hub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Professional Marketplace</h2>
              <Button onClick={() => router.push('/professional-marketplace')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Full Marketplace
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-gray-600">Total Providers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">892</p>
                  <p className="text-sm text-gray-600">Verified Providers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-2xl font-bold">4.6</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">15,678</p>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Featured Providers
                </CardTitle>
                <CardDescription>
                  Top-rated autism support professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Dr. Sarah Williams",
                      title: "Pediatric Speech & Language Therapist",
                      rating: 4.9,
                      reviews: 156,
                      specialties: ["Speech Therapy", "Autism Support", "Communication"],
                      location: "Central London",
                      available: "Available this week"
                    },
                    {
                      name: "Emma Thompson, OT",
                      title: "Senior Occupational Therapist",
                      rating: 4.8,
                      reviews: 203,
                      specialties: ["Occupational Therapy", "Sensory Integration"],
                      location: "North London",
                      available: "Available next week"
                    },
                    {
                      name: "Dr. Michael Chen",
                      title: "Board Certified Behavior Analyst",
                      rating: 4.7,
                      reviews: 98,
                      specialties: ["ABA Therapy", "Behavior Analysis", "Parent Training"],
                      location: "South London",
                      available: "Limited availability"
                    }
                  ].map((provider, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{provider.name}</h4>
                              <p className="text-xs text-gray-600">{provider.title}</p>
                            </div>
                          </div>
                          <UserCheck className="h-4 w-4 text-green-600" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm font-medium">{provider.rating}</span>
                              <span className="text-xs text-gray-500">({provider.reviews})</span>
                            </div>
                            <span className="text-xs text-green-600">{provider.available}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{provider.location}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {provider.specialties.slice(0, 2).map((specialty, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => router.push('/professional-marketplace')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Book
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Provider Search
                </CardTitle>
                <CardDescription>
                  Find the right professional support quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-16 flex-col space-y-1 border-blue-200 hover:bg-blue-50"
                    onClick={() => router.push('/professional-marketplace')}
                  >
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span className="text-xs">Speech Therapists</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col space-y-1 border-green-200 hover:bg-green-50"
                    onClick={() => router.push('/professional-marketplace')}
                  >
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="text-xs">Occupational Therapists</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col space-y-1 border-purple-200 hover:bg-purple-50"
                    onClick={() => router.push('/professional-marketplace')}
                  >
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="text-xs">Behavior Analysts</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 flex-col space-y-1 border-orange-200 hover:bg-orange-50"
                    onClick={() => router.push('/professional-marketplace')}
                  >
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="text-xs">All Specialists</span>
                  </Button>
                </div>

                <div className="flex justify-center mt-6">
                  <Button onClick={() => router.push('/professional-marketplace')}>
                    <Search className="h-4 w-4 mr-2" />
                    Open Professional Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content/Resources Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Educational Resources</h2>
              <Button variant="outline" onClick={() => alert('Feature coming soon!')}>
                <Search className="h-4 w-4 mr-2" />
                Advanced Search
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    EHC Plan Guidance
                  </CardTitle>
                  <CardDescription>
                    Complete guides for Education, Health and Care plans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Articles</span>
                      <Badge variant="secondary">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rating</span>
                      <Badge className="bg-yellow-100 text-yellow-800">★ 4.8</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Browse Content
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                    Tribunal Support
                  </CardTitle>
                  <CardDescription>
                    SEND tribunal preparation and legal guidance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Resources</span>
                      <Badge variant="secondary">8</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <Badge className="bg-green-100 text-green-800">94%</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Get Support
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    Community & Peer Support
                  </CardTitle>
                  <CardDescription>
                    Connect with other families and professionals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Members</span>
                      <Badge variant="secondary">2.4k</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Posts</span>
                      <Badge className="bg-blue-100 text-blue-800">45</Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                      <Users className="h-4 w-4 mr-2" />
                      Join Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Featured Resources</CardTitle>
                <CardDescription>
                  Most popular and highly-rated content for families
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          Complete Guide to EHC Plans for Parents
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Everything you need to know about Education, Health and Care plans
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">★ 4.8</Badge>
                          <Badge variant="outline">45 min read</Badge>
                          <Badge variant="outline">Beginner</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          SEND Tribunal Preparation Checklist
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Step-by-step guide for preparing for SEND tribunal
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">★ 4.9</Badge>
                          <Badge variant="outline">30 min read</Badge>
                          <Badge variant="outline">Intermediate</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          Transition to Adult Services: What You Need to Know
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Comprehensive guide for transitioning from children to adult services
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline">★ 4.7</Badge>
                          <Badge variant="outline">60 min video</Badge>
                          <Badge variant="outline">Intermediate</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
