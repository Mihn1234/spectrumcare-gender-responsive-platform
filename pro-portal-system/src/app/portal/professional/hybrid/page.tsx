"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  Users,
  FileText,
  Mail,
  Eye,
  ArrowLeft,
  BookOpen,
  Clock,
  BarChart3,
  Plus,
  Calendar,
  Settings,
  Brain,
  TrendingUp,
  Award,
  Target,
  MessageSquare,
  Phone,
  Video,
  PieChart,
  Shield,
  Zap,
  Star,
  AlertCircle,
  CheckCircle,
  Lock,
  Unlock
} from "lucide-react"

export default function HybridProfessionalPortal() {
  const hybridFeatures = [
    {
      title: "Advanced Assessments",
      description: "Create and customize assessment protocols with AI assistance",
      icon: <Brain className="h-6 w-6" />,
      status: "available",
      limit: "10 custom assessments/month"
    },
    {
      title: "Client Analytics",
      description: "Detailed progress tracking and outcome prediction",
      icon: <BarChart3 className="h-6 w-6" />,
      status: "available",
      limit: "25 active cases"
    },
    {
      title: "Team Collaboration",
      description: "Secure professional networking and case sharing",
      icon: <Users className="h-6 w-6" />,
      status: "available",
      limit: "5 team members"
    },
    {
      title: "Appointment Scheduling",
      description: "Integrated calendar with automated reminders",
      icon: <Calendar className="h-6 w-6" />,
      status: "available",
      limit: "Unlimited bookings"
    },
    {
      title: "Document Generation",
      description: "AI-powered report and documentation creation",
      icon: <FileText className="h-6 w-6" />,
      status: "available",
      limit: "50 documents/month"
    },
    {
      title: "White-Label Portal",
      description: "Branded portal with custom domain and design",
      icon: <Award className="h-6 w-6" />,
      status: "limited",
      upgrade: "Basic branding available - Full customization in Premium"
    },
    {
      title: "Advanced Analytics",
      description: "Practice performance metrics and insights",
      icon: <TrendingUp className="h-6 w-6" />,
      status: "limited",
      upgrade: "Basic reports - Advanced insights in Premium"
    },
    {
      title: "API Access",
      description: "Integration with third-party systems",
      icon: <Settings className="h-6 w-6" />,
      status: "locked",
      upgrade: "Available in Enterprise tier"
    }
  ]

  const clientData = [
    {
      name: "Emma Thompson",
      age: 8,
      diagnosis: "ASD Level 2",
      lastSession: "2 days ago",
      progress: 78,
      nextAppointment: "Tomorrow, 2:00 PM",
      status: "on-track"
    },
    {
      name: "James Wilson",
      age: 6,
      diagnosis: "ASD Level 1",
      lastSession: "1 week ago",
      progress: 65,
      nextAppointment: "Friday, 10:00 AM",
      status: "review-needed"
    },
    {
      name: "Sophie Chen",
      age: 10,
      diagnosis: "ASD Level 2",
      lastSession: "3 days ago",
      progress: 85,
      nextAppointment: "Next Tuesday",
      status: "excellent"
    }
  ]

  const recentActivity = [
    {
      type: "assessment",
      title: "ADOS-2 Assessment Completed",
      client: "Emma Thompson",
      time: "2 hours ago",
      priority: "normal"
    },
    {
      type: "appointment",
      title: "Session Scheduled",
      client: "New referral: Alex Johnson",
      time: "4 hours ago",
      priority: "high"
    },
    {
      type: "document",
      title: "Progress Report Generated",
      client: "Sophie Chen",
      time: "1 day ago",
      priority: "normal"
    },
    {
      type: "team",
      title: "Team Consultation Request",
      client: "James Wilson case",
      time: "2 days ago",
      priority: "medium"
    }
  ]

  const monthlyStats = {
    totalSessions: 47,
    newAssessments: 8,
    documentsGenerated: 23,
    teamCollaborations: 5
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Hybrid Portal</h1>
                <p className="text-sm text-slate-600">Dr. Sarah Martinez - Hybrid Access</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-600">
                <Star className="h-3 w-3 mr-1" />
                Hybrid Access
              </Badge>
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">This Month</p>
                      <p className="text-2xl font-bold text-blue-600">{monthlyStats.totalSessions}</p>
                      <p className="text-xs text-slate-500">Sessions Completed</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">New</p>
                      <p className="text-2xl font-bold text-green-600">{monthlyStats.newAssessments}</p>
                      <p className="text-xs text-slate-500">Assessments</p>
                    </div>
                    <Brain className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Generated</p>
                      <p className="text-2xl font-bold text-purple-600">{monthlyStats.documentsGenerated}</p>
                      <p className="text-xs text-slate-500">Documents</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Team</p>
                      <p className="text-2xl font-bold text-orange-600">{monthlyStats.teamCollaborations}</p>
                      <p className="text-xs text-slate-500">Collaborations</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Clients */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Active Clients
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientData.map((client, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {client.name[0]}
                            </div>
                            <div>
                              <h4 className="font-medium">{client.name}</h4>
                              <p className="text-sm text-slate-600">{client.diagnosis} • Age {client.age}</p>
                              <p className="text-xs text-slate-500">Last session: {client.lastSession}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <Progress value={client.progress} className="w-16 h-2" />
                              <span className="text-sm font-medium">{client.progress}%</span>
                            </div>
                            <p className="text-xs text-slate-600">{client.nextAppointment}</p>
                            <Badge className={
                              client.status === 'excellent' ? 'bg-green-100 text-green-800' :
                              client.status === 'on-track' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {client.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.priority === 'high' ? 'bg-red-500' :
                            activity.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-sm text-slate-600">{activity.client}</p>
                            <p className="text-xs text-slate-500">{activity.time}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      New Assessment
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Team Consult
                    </Button>
                  </CardContent>
                </Card>

                {/* Usage Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Custom Assessments</span>
                        <span>7 / 10</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Document Generation</span>
                        <span>23 / 50</span>
                      </div>
                      <Progress value={46} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Team Members</span>
                        <span>3 / 5</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>

                    <div className="pt-3 border-t">
                      <Button className="w-full" size="sm">
                        View Usage Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Premium Upgrade */}
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <Zap className="h-8 w-8 mx-auto text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Unlock Premium Features</h3>
                      <p className="text-sm text-purple-700">
                        Get unlimited assessments, advanced analytics, and full white-label customization.
                      </p>
                      <Button className="w-full">
                        Upgrade Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Manage your active caseload with advanced tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientData.map((client, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {client.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold">{client.name}</h4>
                            <p className="text-sm text-slate-600">{client.diagnosis} • Age {client.age}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Video className="h-3 w-3 mr-1" />
                            Video Call
                          </Button>
                          <Button size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View Profile
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Progress</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={client.progress} className="flex-1 h-2" />
                            <span className="font-medium">{client.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-600">Last Session</p>
                          <p className="font-medium">{client.lastSession}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Next Appointment</p>
                          <p className="font-medium">{client.nextAppointment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Suite</CardTitle>
                <CardDescription>Advanced assessment tools with AI assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "ADOS-2", description: "Autism Diagnostic Observation Schedule", available: true },
                    { name: "CARS-2", description: "Childhood Autism Rating Scale", available: true },
                    { name: "Custom Assessment", description: "Build your own assessment protocol", available: true },
                    { name: "AI Behavioral Analysis", description: "Automated behavior pattern recognition", available: true },
                    { name: "Progress Tracking", description: "Longitudinal development monitoring", available: true },
                    { name: "Advanced Analytics", description: "Predictive outcome modeling", available: false }
                  ].map((assessment, idx) => (
                    <div key={idx} className={`p-4 border rounded-lg ${assessment.available ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{assessment.name}</h4>
                        {assessment.available ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{assessment.description}</p>
                      <Button size="sm" disabled={!assessment.available} className="w-full">
                        {assessment.available ? 'Start Assessment' : 'Premium Only'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Management</CardTitle>
                <CardDescription>Streamline your professional practice operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Scheduling & Calendar</h4>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Today's Sessions</span>
                        <Badge>4 scheduled</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>9:00 AM - Emma Thompson</span>
                          <span className="text-green-600">Confirmed</span>
                        </div>
                        <div className="flex justify-between">
                          <span>11:00 AM - James Wilson</span>
                          <span className="text-yellow-600">Pending</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2:00 PM - Sophie Chen</span>
                          <span className="text-green-600">Confirmed</span>
                        </div>
                        <div className="flex justify-between">
                          <span>4:00 PM - New Consultation</span>
                          <span className="text-blue-600">Assessment</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Team Collaboration</h4>
                    <div className="space-y-2">
                      {[
                        { name: "Dr. Emily Parker", role: "Speech Therapist", status: "online" },
                        { name: "Lisa Rodriguez", role: "Occupational Therapist", status: "busy" },
                        { name: "Mike Chen", role: "Behavioral Analyst", status: "offline" }
                      ].map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              member.status === 'online' ? 'bg-green-500' :
                              member.status === 'busy' ? 'bg-yellow-500' : 'bg-slate-300'
                            }`} />
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <p className="text-xs text-slate-600">{member.role}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Analytics</CardTitle>
                <CardDescription>Track your practice performance and client outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Client Outcomes</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Positive Progress</span>
                        <span className="font-medium text-green-600">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Goal Achievement</span>
                        <span className="font-medium text-blue-600">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Family Satisfaction</span>
                        <span className="font-medium text-purple-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Practice Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">25</p>
                        <p className="text-sm text-slate-600">Active Cases</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">47</p>
                        <p className="text-sm text-slate-600">Sessions/Month</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">8</p>
                        <p className="text-sm text-slate-600">New Assessments</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">96%</p>
                        <p className="text-sm text-slate-600">Attendance Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hybrid Features Overview</CardTitle>
                <CardDescription>Your current access level and available features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hybridFeatures.map((feature, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${
                      feature.status === 'available' ? 'border-green-200 bg-green-50' :
                      feature.status === 'limited' ? 'border-yellow-200 bg-yellow-50' :
                      'border-slate-200 bg-slate-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          feature.status === 'available' ? 'bg-green-100 text-green-600' :
                          feature.status === 'limited' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{feature.title}</h4>
                            {feature.status === 'available' ? (
                              <Badge className="bg-green-100 text-green-600">
                                <Unlock className="h-3 w-3 mr-1" />
                                Available
                              </Badge>
                            ) : feature.status === 'limited' ? (
                              <Badge className="bg-yellow-100 text-yellow-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Limited
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                          {feature.limit && (
                            <p className="text-xs text-slate-500">{feature.limit}</p>
                          )}
                          {feature.upgrade && (
                            <p className="text-xs text-blue-600">{feature.upgrade}</p>
                          )}
                        </div>
                        <div>
                          {feature.status === 'available' ? (
                            <Button size="sm">Use Feature</Button>
                          ) : (
                            <Button size="sm" variant="outline">Upgrade</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
