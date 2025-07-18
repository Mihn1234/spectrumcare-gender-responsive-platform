'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Briefcase,
  Users,
  Calendar,
  FileText,
  Star,
  Clock,
  Target,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Shield,
  Award,
  DollarSign,
  BarChart3
} from 'lucide-react'

export default function ProfessionalPortalPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const bypassData = localStorage.getItem('dev_bypass_user')
    if (bypassData) {
      setCurrentUser(JSON.parse(bypassData))
    }
  }, [])

  const professionalStats = {
    activeClients: 23,
    completedAssessments: 156,
    averageRating: 4.8,
    monthlyEarnings: "£8,340",
    responseTime: "< 2 hours"
  }

  const activeClients = [
    {
      name: "Emma Johnson",
      age: 12,
      type: "Educational Assessment",
      status: "In Progress",
      nextSession: "Feb 20, 2025",
      progress: 75,
      priority: "high"
    },
    {
      name: "James Wilson",
      age: 8,
      type: "Cognitive Assessment",
      status: "Assessment Complete",
      nextSession: "Feb 25, 2025",
      progress: 100,
      priority: "medium"
    },
    {
      name: "Sophie Chen",
      age: 15,
      type: "Transition Planning",
      status: "Initial Consultation",
      nextSession: "Feb 22, 2025",
      progress: 25,
      priority: "low"
    }
  ]

  const recentActivity = [
    {
      type: "assessment",
      title: "Assessment Report Submitted",
      description: "Emma Johnson - Educational Psychology Assessment completed",
      time: "2 hours ago",
      status: "completed"
    },
    {
      type: "meeting",
      title: "EHC Meeting Scheduled",
      description: "Annual review meeting with James Wilson's family",
      time: "4 hours ago",
      status: "scheduled"
    },
    {
      type: "message",
      title: "New Message from Parent",
      description: "Sarah Johnson has sent a message regarding Emma's progress",
      time: "6 hours ago",
      status: "new"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-600 rounded-xl text-white">
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Professional Practice Hub</h1>
              <p className="text-gray-600">Assessment tools, client management, and quality assurance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              Verified Professional
            </Badge>
            <div className="text-right">
              <p className="font-semibold text-gray-900">Dr. Lisa Carter</p>
              <p className="text-sm text-gray-600">Educational Psychologist</p>
            </div>
          </div>
        </div>

        {/* Professional Network Value Banner */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">💼 Quality-Assured Professional Network</h2>
              <p className="text-green-100 mb-4">
                Join the highest-quality SEND professional network with AI-powered tools and guaranteed referrals
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">£2,400</div>
                  <div className="text-sm">Average Monthly Income</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm">Client Satisfaction</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">1-2 Weeks</div>
                  <div className="text-sm">Average Time to Deploy</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm">Platform Support</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{professionalStats.activeClients}</div>
              <div className="text-sm text-gray-600">Active Clients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{professionalStats.completedAssessments}</div>
              <div className="text-sm text-gray-600">Assessments Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{professionalStats.averageRating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{professionalStats.monthlyEarnings}</div>
              <div className="text-sm text-gray-600">Monthly Earnings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{professionalStats.responseTime}</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Professional Tabs */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Clients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Active Clients
                  </CardTitle>
                  <CardDescription>Current cases and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeClients.map((client, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{client.name}, {client.age}</h4>
                          <Badge className={getPriorityColor(client.priority)}>
                            {client.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{client.type}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Progress: {client.progress}%</span>
                          <span className="text-gray-500">Next: {client.nextSession}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{width: `${client.progress}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="mt-1">
                          {activity.type === 'assessment' && <FileText className="h-5 w-5 text-blue-600" />}
                          {activity.type === 'meeting' && <Calendar className="h-5 w-5 text-green-600" />}
                          {activity.type === 'message' && <MessageSquare className="h-5 w-5 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Hub</CardTitle>
                <CardDescription>AI-powered assessment tools and templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 cursor-pointer">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Educational Assessment</h3>
                    <p className="text-sm text-gray-600 mb-4">Comprehensive educational psychology assessment</p>
                    <Button size="sm">Start Assessment</Button>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 cursor-pointer">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Cognitive Assessment</h3>
                    <p className="text-sm text-gray-600 mb-4">Cognitive abilities and processing assessment</p>
                    <Button size="sm">Start Assessment</Button>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 cursor-pointer">
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Progress Review</h3>
                    <p className="text-sm text-gray-600 mb-4">Annual review and progress assessment</p>
                    <Button size="sm">Start Review</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Report Generation</CardTitle>
                <CardDescription>Automated report writing with quality assurance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Intelligent Report Assistant</h3>
                  <p className="text-gray-600 mb-4">AI-powered report generation with professional templates</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button className="w-full">Generate Assessment Report</Button>
                    <Button variant="outline" className="w-full">View Templates</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Professional Calendar
                </CardTitle>
                <CardDescription>Appointment scheduling and availability management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Integrated Calendar System</h3>
                  <p className="text-gray-600 mb-4">Seamless scheduling with automatic client notifications</p>
                  <Button>Manage Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Professional Network
                </CardTitle>
                <CardDescription>Connect with other SEND professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Network Benefits</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Quality-assured referral network
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Collaborative case management
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Professional development opportunities
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        15-20% commission structure
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Network Stats</h3>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex justify-between">
                        <span>Network Size:</span>
                        <span className="font-semibold">342 Professionals</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Your Rating:</span>
                        <span className="font-semibold">4.8/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed Referrals:</span>
                        <span className="font-semibold">156</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Professional Analytics
                </CardTitle>
                <CardDescription>Performance insights and business intelligence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-700">+23%</div>
                    <div className="text-sm text-blue-600">Client Growth This Month</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Star className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-700">95%</div>
                    <div className="text-sm text-green-600">Client Satisfaction</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-purple-700">£8,340</div>
                    <div className="text-sm text-purple-600">Monthly Revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation back */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dev/bypass'}
            className="mr-4"
          >
            Back to Bypass Portal
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  )
}
