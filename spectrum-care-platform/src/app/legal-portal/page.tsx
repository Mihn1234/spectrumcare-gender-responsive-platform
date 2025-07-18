'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Scale,
  FileText,
  Users,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Gavel,
  Search,
  Book,
  Award,
  BarChart3,
  MessageSquare
} from 'lucide-react'

export default function LegalAdvocatePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const bypassData = localStorage.getItem('dev_bypass_user')
    if (bypassData) {
      setCurrentUser(JSON.parse(bypassData))
    }
  }, [])

  const legalStats = {
    activeCases: 23,
    tribunalsWon: 47,
    successRate: "92%",
    averageTime: "4.2 months",
    clientSatisfaction: "96%"
  }

  const activeCases = [
    {
      client: "Johnson Family",
      child: "Emma Johnson, 12",
      type: "EHC Plan Appeal",
      status: "Preparation",
      hearingDate: "March 15, 2025",
      priority: "high",
      daysRemaining: 42,
      stage: "Evidence Gathering"
    },
    {
      client: "Wilson Family",
      child: "James Wilson, 8",
      type: "School Placement",
      status: "Submitted",
      hearingDate: "April 3, 2025",
      priority: "medium",
      daysRemaining: 61,
      stage: "Awaiting Response"
    },
    {
      client: "Chen Family",
      child: "Sophie Chen, 15",
      type: "Transport Appeal",
      status: "Initial Review",
      hearingDate: "May 20, 2025",
      priority: "low",
      daysRemaining: 108,
      stage: "Case Assessment"
    }
  ]

  const recentActivity = [
    {
      type: "evidence",
      title: "Expert Report Received",
      description: "Educational Psychology report for Emma Johnson case",
      time: "2 hours ago",
      case: "Johnson Family"
    },
    {
      type: "hearing",
      title: "Tribunal Hearing Scheduled",
      description: "Wilson family placement appeal confirmed for April 3rd",
      time: "4 hours ago",
      case: "Wilson Family"
    },
    {
      type: "document",
      title: "Case Bundle Submitted",
      description: "Complete evidence bundle filed for Chen transport appeal",
      time: "1 day ago",
      case: "Chen Family"
    }
  ]

  const upcomingDeadlines = [
    {
      task: "Evidence Bundle Deadline",
      case: "Johnson Family",
      deadline: "Feb 28, 2025",
      daysLeft: 14,
      priority: "urgent"
    },
    {
      task: "Witness Statement Due",
      case: "Wilson Family",
      deadline: "March 10, 2025",
      daysLeft: 24,
      priority: "high"
    },
    {
      task: "Response to LA Counter",
      case: "Chen Family",
      deadline: "March 20, 2025",
      daysLeft: 34,
      priority: "medium"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Preparation':
        return 'bg-blue-100 text-blue-800'
      case 'Submitted':
        return 'bg-purple-100 text-purple-800'
      case 'Initial Review':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gray-700 rounded-xl text-white">
              <Scale className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Legal Advocacy Center</h1>
              <p className="text-gray-600">Comprehensive legal support, tribunal preparation, and case management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
              Legal Access
            </Badge>
            <div className="text-right">
              <p className="font-semibold text-gray-900">Robert Harrison</p>
              <p className="text-sm text-gray-600">SEND Legal Advocate</p>
            </div>
          </div>
        </div>

        {/* Legal Success Value Banner */}
        <Card className="bg-gradient-to-r from-gray-700 to-slate-700 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">⚖️ Expert SEND Legal Advocacy</h2>
              <p className="text-gray-100 mb-4">
                Comprehensive tribunal preparation, evidence compilation, and legal documentation
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{legalStats.successRate}</div>
                  <div className="text-sm">Tribunal Success Rate</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{legalStats.tribunalsWon}</div>
                  <div className="text-sm">Cases Won</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{legalStats.averageTime}</div>
                  <div className="text-sm">Average Case Time</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{legalStats.clientSatisfaction}</div>
                  <div className="text-sm">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Practice Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{legalStats.activeCases}</div>
              <div className="text-sm text-gray-600">Active Cases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Gavel className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{legalStats.tribunalsWon}</div>
              <div className="text-sm text-gray-600">Tribunals Won</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{legalStats.successRate}</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{legalStats.averageTime}</div>
              <div className="text-sm text-gray-600">Average Duration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{legalStats.clientSatisfaction}</div>
              <div className="text-sm text-gray-600">Client Satisfaction</div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Deadlines Alert */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">Urgent Deadlines & Actions</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="text-red-700 border-red-300">
                View Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-800">{deadline.task}</h4>
                      <p className="text-sm text-red-600">{deadline.case} - Due: {deadline.deadline}</p>
                    </div>
                    <Badge className={getPriorityColor(deadline.priority)}>
                      {deadline.daysLeft} days left
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Legal Tabs */}
        <Tabs defaultValue="cases" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit">
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="preparation">Preparation</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="tribunal">Tribunal</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scale className="h-5 w-5 mr-2" />
                    Active Cases
                  </CardTitle>
                  <CardDescription>Current legal proceedings and appeals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeCases.map((case_, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{case_.client}</h4>
                            <p className="text-sm text-gray-600">{case_.child}</p>
                          </div>
                          <Badge className={getPriorityColor(case_.priority)}>
                            {case_.priority}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <div className="font-medium">{case_.type}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Hearing:</span>
                            <div>{case_.hearingDate}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Stage:</span>
                            <div>{case_.stage}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Days Remaining:</span>
                            <div className="font-semibold">{case_.daysRemaining}</div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(case_.status)} variant="outline">
                          {case_.status}
                        </Badge>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">Case Details</Button>
                          <Button size="sm" variant="outline">Update Status</Button>
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
                  <CardDescription>Latest case updates and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="mt-1">
                          {activity.type === 'evidence' && <FileText className="h-5 w-5 text-blue-600" />}
                          {activity.type === 'hearing' && <Calendar className="h-5 w-5 text-green-600" />}
                          {activity.type === 'document' && <Book className="h-5 w-5 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{activity.title}</h4>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">{activity.time}</span>
                            <Badge variant="outline" className="text-xs">{activity.case}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preparation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tribunal Preparation</CardTitle>
                <CardDescription>Comprehensive preparation tools and checklists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 cursor-pointer">
                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Case Research</h3>
                    <p className="text-sm text-gray-600 mb-4">Research relevant case law and precedents</p>
                    <Button size="sm">Start Research</Button>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 cursor-pointer">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Evidence Bundle</h3>
                    <p className="text-sm text-gray-600 mb-4">Compile and organize evidence</p>
                    <Button size="sm">Create Bundle</Button>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 cursor-pointer">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Witness Statements</h3>
                    <p className="text-sm text-gray-600 mb-4">Prepare witness statements and testimony</p>
                    <Button size="sm">Draft Statements</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Management</CardTitle>
                <CardDescription>Organize and compile case evidence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Evidence Compilation System</h3>
                  <p className="text-gray-600 mb-4">Secure document management with automated organization</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                    <Button size="sm">Upload Evidence</Button>
                    <Button size="sm" variant="outline">Organize Files</Button>
                    <Button size="sm" variant="outline">Generate Bundle</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tribunal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gavel className="h-5 w-5 mr-2" />
                  Tribunal Management
                </CardTitle>
                <CardDescription>Hearing preparation and tribunal coordination</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Tribunal Tools</h3>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Hearing
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Case Bundle
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Prepare Witnesses
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Review Procedure
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Success Statistics</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Cases Won:</span>
                        <span className="font-semibold">47/51 (92%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Hearing Time:</span>
                        <span className="font-semibold">2.5 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Settlement Rate:</span>
                        <span className="font-semibold">35%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Documentation</CardTitle>
                <CardDescription>Generate and manage legal documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Book className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Automated Document Generation</h3>
                  <p className="text-gray-600 mb-4">AI-powered legal document creation and template management</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button>Generate Appeal</Button>
                    <Button variant="outline">Create Contract</Button>
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
                  Legal Practice Analytics
                </CardTitle>
                <CardDescription>Performance insights and case outcome analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-700">92%</div>
                    <div className="text-sm text-green-600">Win Rate</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-700">4.2</div>
                    <div className="text-sm text-blue-600">Avg Months per Case</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-purple-700">96%</div>
                    <div className="text-sm text-purple-600">Client Satisfaction</div>
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
