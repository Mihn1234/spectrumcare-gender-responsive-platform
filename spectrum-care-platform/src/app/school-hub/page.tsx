'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Users,
  AlertCircle,
  Calendar,
  FileText,
  MessageSquare,
  TrendingUp,
  Bell,
  Search,
  Plus,
  Brain,
  Target,
  Clock,
  CheckCircle2,
  UserCheck,
  BarChart3,
  Settings,
  Video,
  Phone,
  Mail,
  Download,
  Upload,
  Sparkles,
  GraduationCap,
  Heart,
  Shield,
  Zap
} from 'lucide-react';

export default function SchoolHubPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock data for demonstration
  const schoolStats = {
    totalStudents: 245,
    ehcPlans: 38,
    pendingReviews: 7,
    compliance: 94,
    activeAssessments: 12,
    pendingReferrals: 5
  };

  const recentAlerts = [
    { id: 1, type: 'overdue', message: '3 EHC reviews overdue', priority: 'high', time: '2 hours ago' },
    { id: 2, type: 'assessment', message: '5 assessments due this week', priority: 'medium', time: '4 hours ago' },
    { id: 3, type: 'message', message: '12 unread parent messages', priority: 'low', time: '6 hours ago' },
    { id: 4, type: 'deadline', message: 'Annual review deadline approaching for Jamie S.', priority: 'medium', time: '1 day ago' }
  ];

  const students = [
    {
      id: 1,
      name: 'Emma Thompson',
      age: 8,
      year: 3,
      ehcStatus: 'Active',
      lastAssessment: '2 weeks ago',
      nextReview: '3 months',
      progress: 78,
      interventions: ['Speech Therapy', 'OT', 'Learning Support'],
      riskLevel: 'low',
      aiInsights: 'Progress exceeding expectations. Consider advancing speech targets.'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      age: 12,
      year: 7,
      ehcStatus: 'Pending Review',
      lastAssessment: '6 months ago',
      nextReview: 'Overdue',
      progress: 45,
      interventions: ['Behavioral Support', 'Social Skills'],
      riskLevel: 'high',
      aiInsights: 'Intervention adjustment recommended. Consider additional support.'
    },
    {
      id: 3,
      name: 'Sophie Chen',
      age: 6,
      year: 1,
      ehcStatus: 'Assessment',
      lastAssessment: 'In progress',
      nextReview: 'Pending',
      progress: 65,
      interventions: ['Educational Psychology'],
      riskLevel: 'medium',
      aiInsights: 'Assessment data suggests autism spectrum. Recommend ADOS-2.'
    }
  ];

  const professionals = [
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      role: 'Educational Psychologist',
      rating: 4.8,
      availability: 'This week',
      specialties: ['Autism Assessment', 'ADHD', 'Learning Difficulties'],
      distance: '2.3 miles'
    },
    {
      id: 2,
      name: 'James Rodriguez',
      role: 'Speech & Language Therapist',
      rating: 4.9,
      availability: 'Next week',
      specialties: ['Communication Disorders', 'Social Communication'],
      distance: '1.8 miles'
    },
    {
      id: 3,
      name: 'Dr. Amanda Foster',
      role: 'Occupational Therapist',
      rating: 4.7,
      availability: 'Available now',
      specialties: ['Sensory Processing', 'Fine Motor Skills'],
      distance: '0.9 miles'
    }
  ];

  const aiInsights = [
    {
      type: 'prediction',
      title: 'Intervention Effectiveness Forecast',
      content: 'Current speech therapy interventions show 89% probability of meeting targets by review date.',
      confidence: 89,
      action: 'Continue current plan'
    },
    {
      type: 'recommendation',
      title: 'Resource Allocation Optimization',
      content: 'AI suggests reallocating 2 hours of learning support from Year 6 to Year 3 based on need analysis.',
      confidence: 76,
      action: 'Review allocation'
    },
    {
      type: 'alert',
      title: 'Early Intervention Opportunity',
      content: '3 students showing early indicators for additional support needs. Preventive intervention recommended.',
      confidence: 92,
      action: 'Schedule assessments'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">School Hub</h1>
                <p className="text-sm text-gray-600">Oakwood Primary School - SENCO Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {recentAlerts.length}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="ehc-plans">EHC Plans</TabsTrigger>
            <TabsTrigger value="professionals">Professionals</TabsTrigger>
            <TabsTrigger value="parents">Parents</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Students</p>
                      <p className="text-3xl font-bold">{schoolStats.totalStudents}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">EHC Plans</p>
                      <p className="text-3xl font-bold">{schoolStats.ehcPlans}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100">Pending Reviews</p>
                      <p className="text-3xl font-bold">{schoolStats.pendingReviews}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Compliance Rate</p>
                      <p className="text-3xl font-bold">{schoolStats.compliance}%</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Alert Center</CardTitle>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                        <div className={`w-2 h-2 rounded-full ${
                          alert.priority === 'high' ? 'bg-red-500' :
                          alert.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                          <p className="text-xs text-gray-500">{alert.time}</p>
                        </div>
                        <Button size="sm" variant="outline">Action</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-20 flex-col bg-gradient-to-r from-blue-500 to-blue-600">
                      <Plus className="h-6 w-6 mb-2" />
                      Add Student
                    </Button>
                    <Button className="h-20 flex-col bg-gradient-to-r from-purple-500 to-purple-600">
                      <FileText className="h-6 w-6 mb-2" />
                      Create EHC Plan
                    </Button>
                    <Button className="h-20 flex-col bg-gradient-to-r from-green-500 to-green-600">
                      <Calendar className="h-6 w-6 mb-2" />
                      Schedule Meeting
                    </Button>
                    <Button className="h-20 flex-col bg-gradient-to-r from-amber-500 to-amber-600">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-xl">AI-Powered Insights</CardTitle>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Beta
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={insight.type === 'alert' ? 'destructive' : 'default'}>
                          {insight.type}
                        </Badge>
                        <span className="text-sm text-gray-600">{insight.confidence}% confidence</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-sm text-gray-700 mb-3">{insight.content}</p>
                      <Button size="sm" variant="outline" className="w-full">
                        {insight.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Emma's OT assessment completed</p>
                      <p className="text-xs text-gray-500">2 hours ago by Dr. Amanda Foster</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Meeting scheduled with Marcus's parents</p>
                      <p className="text-xs text-gray-500">4 hours ago for tomorrow 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">New speech therapist joined network</p>
                      <p className="text-xs text-gray-500">1 day ago - James Rodriguez verified</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <div className="space-y-6">
              {/* Student Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Student List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {students.map((student) => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <Badge variant={
                          student.ehcStatus === 'Active' ? 'default' :
                          student.ehcStatus === 'Pending Review' ? 'destructive' : 'secondary'
                        }>
                          {student.ehcStatus}
                        </Badge>
                      </div>
                      <CardDescription>
                        Age {student.age} • Year {student.year} • Risk: {student.riskLevel}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{student.progress}%</span>
                          </div>
                          <Progress value={student.progress} className="h-2" />
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Active Interventions</p>
                          <div className="flex flex-wrap gap-1">
                            {student.interventions.map((intervention, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {intervention}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-blue-800 mb-1">AI Insight</p>
                              <p className="text-xs text-blue-700">{student.aiInsights}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">View Profile</Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ehc-plans">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-6 w-6" />
                    <span>EHC Plan Management</span>
                    <Badge className="bg-green-100 text-green-800">
                      <Zap className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Create, manage, and review Education, Health and Care plans with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Button className="h-24 flex-col bg-gradient-to-r from-blue-500 to-blue-600">
                      <Plus className="h-6 w-6 mb-2" />
                      Create New EHC Plan
                      <span className="text-xs opacity-80">AI-assisted creation</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      Review Existing Plans
                      <span className="text-xs text-gray-600">7 pending reviews</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col">
                      <Download className="h-6 w-6 mb-2" />
                      Generate Reports
                      <span className="text-xs text-gray-600">Statutory reporting</span>
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-purple-600" />
                      AI Plan Writing Assistant
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Our AI analyzes assessment data and automatically generates section content,
                      SMART targets, and provision recommendations based on best practices.
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm">Try AI Assistant</Button>
                      <Button size="sm" variant="outline">Learn More</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="professionals">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-6 w-6" />
                    <span>Professional Network</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      345 Verified Specialists
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Connect with quality-assured professionals for assessments and interventions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professionals.map((professional) => (
                      <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold">
                              {professional.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{professional.name}</h3>
                              <p className="text-sm text-gray-600">{professional.role}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center">
                                  <span className="text-yellow-400">★</span>
                                  <span className="text-sm ml-1">{professional.rating}/5</span>
                                </div>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{professional.distance}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Specialties</p>
                            <div className="flex flex-wrap gap-1">
                              {professional.specialties.map((specialty, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <Badge variant="secondary" className="text-xs">
                              {professional.availability}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <Phone className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Mail className="h-3 w-3" />
                              </Button>
                              <Button size="sm">Book</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parents">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-6 w-6" />
                    <span>Parent Engagement Hub</span>
                  </CardTitle>
                  <CardDescription>
                    Foster collaboration and transparency with families
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Messages</h3>
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-xs text-gray-600">Unread</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Video className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">Meetings</h3>
                      <p className="text-2xl font-bold text-green-600">3</p>
                      <p className="text-xs text-gray-600">This week</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-semibold">Documents</h3>
                      <p className="text-2xl font-bold text-purple-600">8</p>
                      <p className="text-xs text-gray-600">Shared</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <h3 className="font-semibold">Satisfaction</h3>
                      <p className="text-2xl font-bold text-orange-600">94%</p>
                      <p className="text-xs text-gray-600">Rating</p>
                    </Card>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Parent Portal Features</h3>
                    <ul className="space-y-1 text-sm text-green-700">
                      <li>• Real-time progress updates and reports</li>
                      <li>• Direct messaging with teachers and support staff</li>
                      <li>• Access to all assessment and intervention documents</li>
                      <li>• Meeting scheduling and video conferencing</li>
                      <li>• Educational resources and support materials</li>
                      <li>• Goal tracking and celebration of achievements</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Analytics & Reporting</span>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive insights and statutory reporting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Button className="h-20 flex-col bg-gradient-to-r from-blue-500 to-blue-600">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      Student Progress Report
                    </Button>
                    <Button className="h-20 flex-col bg-gradient-to-r from-green-500 to-green-600">
                      <Shield className="h-6 w-6 mb-2" />
                      Compliance Dashboard
                    </Button>
                    <Button className="h-20 flex-col bg-gradient-to-r from-purple-500 to-purple-600">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      Outcome Analysis
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-900 mb-3">Key Performance Indicators</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">94%</p>
                        <p className="text-xs text-gray-600">Compliance Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">87%</p>
                        <p className="text-xs text-gray-600">Target Achievement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">4.8</p>
                        <p className="text-xs text-gray-600">Parent Satisfaction</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">92%</p>
                        <p className="text-xs text-gray-600">Professional Utilization</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
