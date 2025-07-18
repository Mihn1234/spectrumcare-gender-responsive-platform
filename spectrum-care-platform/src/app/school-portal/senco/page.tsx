'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCap,
  Users,
  FileText,
  Target,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  BookOpen,
  ClipboardList,
  Bell,
  Settings,
  BarChart3,
  Award
} from 'lucide-react'

export default function SchoolSENCOPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const bypassData = localStorage.getItem('dev_bypass_user')
    if (bypassData) {
      setCurrentUser(JSON.parse(bypassData))
    }
  }, [])

  const sencoStats = {
    totalStudents: 1200,
    sendStudents: 89,
    ehcPlans: 34,
    sendSupport: 55,
    pendingAssessments: 12
  }

  const sendStudents = [
    {
      name: "Emma Johnson",
      year: "Year 7",
      type: "EHC Plan",
      needs: ["Autism", "Speech & Language"],
      lastReview: "6 months ago",
      nextReview: "March 2025",
      progress: "Good",
      priority: "medium"
    },
    {
      name: "James Wilson",
      year: "Year 3",
      type: "SEN Support",
      needs: ["ADHD", "Learning Difficulties"],
      lastReview: "3 months ago",
      nextReview: "April 2025",
      progress: "Excellent",
      priority: "low"
    },
    {
      name: "Sophie Chen",
      year: "Year 9",
      type: "EHC Plan",
      needs: ["Dyslexia", "Anxiety"],
      lastReview: "8 months ago",
      nextReview: "February 2025",
      progress: "Needs Support",
      priority: "high"
    }
  ]

  const upcomingTasks = [
    {
      task: "Annual Reviews Due",
      count: 8,
      deadline: "Next 30 days",
      type: "review"
    },
    {
      task: "IEP Updates Required",
      count: 15,
      deadline: "Next 2 weeks",
      type: "update"
    },
    {
      task: "Assessment Requests",
      count: 5,
      deadline: "Pending",
      type: "assessment"
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

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'Excellent':
        return 'text-green-600'
      case 'Good':
        return 'text-blue-600'
      case 'Needs Support':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-600 rounded-xl text-white">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SENCO Management Hub</h1>
              <p className="text-gray-600">SEND coordination and educational planning - Oakwood Secondary School</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              SENCO Access
            </Badge>
            <div className="text-right">
              <p className="font-semibold text-gray-900">Rachel Davies</p>
              <p className="text-sm text-gray-600">Special Educational Needs Coordinator</p>
            </div>
          </div>
        </div>

        {/* School SEND Value Banner */}
        <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🎓 Integrated SEND Management Platform</h2>
              <p className="text-yellow-100 mb-4">
                Comprehensive IEP/EHCP tools with progress tracking and resource allocation
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{sencoStats.sendStudents}</div>
                  <div className="text-sm">SEND Students</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{sencoStats.ehcPlans}</div>
                  <div className="text-sm">EHC Plans</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm">Compliance Rate</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm">Platform Access</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEND Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{sencoStats.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{sencoStats.sendStudents}</div>
              <div className="text-sm text-gray-600">SEND Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{sencoStats.ehcPlans}</div>
              <div className="text-sm text-gray-600">EHC Plans</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{sencoStats.sendSupport}</div>
              <div className="text-sm text-gray-600">SEN Support</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <ClipboardList className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{sencoStats.pendingAssessments}</div>
              <div className="text-sm text-gray-600">Pending Assessments</div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Tasks Alert */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Urgent Tasks & Deadlines</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="text-orange-700 border-orange-300">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-semibold text-orange-800">{task.task}</h4>
                  <div className="text-2xl font-bold text-orange-700">{task.count}</div>
                  <p className="text-sm text-orange-600">{task.deadline}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main SENCO Tabs */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="planning">IEP/EHCP</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  SEND Students Overview
                </CardTitle>
                <CardDescription>Current SEND students and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sendStudents.map((student, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{student.name} - {student.year}</h4>
                          <Badge variant="outline" className="text-xs">{student.type}</Badge>
                        </div>
                        <Badge className={getPriorityColor(student.priority)}>
                          {student.priority} priority
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Needs:</span>
                          <div>{student.needs.join(", ")}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Review:</span>
                          <div>{student.lastReview}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Next Review:</span>
                          <div>{student.nextReview}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Progress:</span>
                          <div className={`font-semibold ${getProgressColor(student.progress)}`}>
                            {student.progress}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">View Plan</Button>
                        <Button size="sm" variant="outline">Update Progress</Button>
                        <Button size="sm" variant="outline">Contact Parents</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>IEP/EHCP Management</CardTitle>
                <CardDescription>Individual Education Plans and EHC Plan coordination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-yellow-500 cursor-pointer">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Create IEP</h3>
                    <p className="text-sm text-gray-600 mb-4">Individual Education Plan template</p>
                    <Button size="sm">Create Plan</Button>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-yellow-500 cursor-pointer">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">EHC Plan Review</h3>
                    <p className="text-sm text-gray-600 mb-4">Annual review and updates</p>
                    <Button size="sm">Start Review</Button>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-yellow-500 cursor-pointer">
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Progress Tracking</h3>
                    <p className="text-sm text-gray-600 mb-4">Monitor student outcomes</p>
                    <Button size="sm">View Progress</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Coordination</CardTitle>
                <CardDescription>Manage professional assessments and evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ClipboardList className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Assessment Management System</h3>
                  <p className="text-gray-600 mb-4">Coordinate with external professionals and track assessment progress</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button>Request Assessment</Button>
                    <Button variant="outline">View Pending</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
                <CardDescription>Manage teaching assistants, interventions, and support resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Available Resources</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Teaching Assistants</span>
                        <span className="font-semibold">12 available</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Speech Therapy Sessions</span>
                        <span className="font-semibold">8 hrs/week</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Sensory Room Access</span>
                        <span className="font-semibold">Available</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Intervention Programs</span>
                        <span className="font-semibold">6 active</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Resource Utilization</h3>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <div className="flex justify-between">
                        <span>TA Hours Used:</span>
                        <span className="font-semibold">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Therapy Sessions:</span>
                        <span className="font-semibold">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget Allocated:</span>
                        <span className="font-semibold">£45,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Compliance Monitoring
                </CardTitle>
                <CardDescription>Track statutory requirements and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-700">95%</div>
                    <div className="text-sm text-green-600">EHC Plan Compliance</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-700">100%</div>
                    <div className="text-sm text-blue-600">Reviews On Time</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <BarChart3 className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                    <div className="text-2xl font-bold text-yellow-700">A+</div>
                    <div className="text-sm text-yellow-600">Ofsted SEND Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SENCO Reporting</CardTitle>
                <CardDescription>Generate reports for leadership, governors, and LA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Automated Reporting System</h3>
                  <p className="text-gray-600 mb-4">Generate comprehensive SEND reports for all stakeholders</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                    <Button size="sm">Monthly Report</Button>
                    <Button size="sm" variant="outline">Outcomes Data</Button>
                    <Button size="sm" variant="outline">LA Return</Button>
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
