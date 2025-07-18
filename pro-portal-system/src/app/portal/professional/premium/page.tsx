"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  Brain,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  Palette,
  Globe,
  Sparkles,
  MessageSquare,
  Video,
  Clock,
  TrendingUp,
  Star,
  Shield,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  User,
  ChevronDown
} from "lucide-react"

export default function PremiumProfessionalPortal() {
  const [selectedClient, setSelectedClient] = useState(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  const clientData = [
    {
      id: 1,
      name: "Emma Johnson",
      age: 8,
      condition: "Autism Spectrum Disorder",
      lastSession: "2025-07-14",
      progress: 85,
      nextAppointment: "2025-07-18 10:00 AM",
      status: "Active"
    },
    {
      id: 2,
      name: "Liam Smith",
      age: 6,
      condition: "Speech Delay",
      lastSession: "2025-07-13",
      progress: 72,
      nextAppointment: "2025-07-17 2:00 PM",
      status: "Active"
    },
    {
      id: 3,
      name: "Sophie Chen",
      age: 10,
      condition: "ADHD",
      lastSession: "2025-07-12",
      progress: 68,
      nextAppointment: "2025-07-19 11:30 AM",
      status: "Active"
    }
  ]

  const assessmentTools = [
    {
      name: "ADOS-2 Assessment",
      domain: "Autism Diagnosis",
      lastUsed: "2025-07-14",
      completions: 127,
      avgScore: 4.2
    },
    {
      name: "WISC-V Intelligence Scale",
      domain: "Cognitive Assessment",
      lastUsed: "2025-07-13",
      completions: 89,
      avgScore: 4.5
    },
    {
      name: "GARS-3 Rating Scale",
      domain: "Autism Rating",
      lastUsed: "2025-07-11",
      completions: 156,
      avgScore: 4.1
    }
  ]

  const recentActivities = [
    {
      type: "session",
      client: "Emma Johnson",
      action: "Completed therapy session",
      time: "2 hours ago",
      icon: <Video className="h-4 w-4" />
    },
    {
      type: "assessment",
      client: "Liam Smith",
      action: "ADOS-2 assessment completed",
      time: "4 hours ago",
      icon: <Brain className="h-4 w-4" />
    },
    {
      type: "report",
      client: "Sophie Chen",
      action: "Progress report generated",
      time: "6 hours ago",
      icon: <FileText className="h-4 w-4" />
    },
    {
      type: "appointment",
      client: "New Client",
      action: "Appointment scheduled",
      time: "1 day ago",
      icon: <Calendar className="h-4 w-4" />
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-purple-600">Premium Portal</h1>
                <p className="text-sm text-slate-600">Dr. Sarah Thompson - Child Psychology</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enabled
              </Badge>
              <Badge className="bg-green-100 text-green-600 hover:bg-green-200">
                <Globe className="h-3 w-3 mr-1" />
                White-Label Active
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-1" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
            <TabsTrigger value="white-label">White-Label</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">47</p>
                      <p className="text-sm text-slate-600">Active Clients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">12</p>
                      <p className="text-sm text-slate-600">Today's Sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">156</p>
                      <p className="text-sm text-slate-600">Assessments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">94%</p>
                      <p className="text-sm text-slate-600">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activities */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest updates from your practice</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className="p-2 bg-white rounded-full">
                          {activity.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.client}</p>
                          <p className="text-xs text-slate-600">{activity.action}</p>
                        </div>
                        <div className="text-xs text-slate-500">{activity.time}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Upcoming appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="font-medium text-sm">Emma Johnson</p>
                      <p className="text-xs text-slate-600">10:00 AM - Therapy Session</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="font-medium text-sm">Liam Smith</p>
                      <p className="text-xs text-slate-600">2:00 PM - Assessment</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="font-medium text-sm">Sophie Chen</p>
                      <p className="text-xs text-slate-600">4:00 PM - Progress Review</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Appointment
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-purple-600">AI Insights</CardTitle>
                </div>
                <CardDescription>Personalized recommendations from our AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm font-medium">Client Progress Alert</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Emma Johnson shows 15% improvement in social interaction metrics. Consider advancing to next intervention level.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm font-medium">Schedule Optimization</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Optimal time slots for new client consultations: Tuesday 2-4 PM, Thursday 10 AM-12 PM.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm font-medium">Assessment Recommendation</p>
                  <p className="text-xs text-slate-600 mt-1">
                    3 clients would benefit from WISC-V assessment based on current progress patterns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">Client Management</h2>
                <p className="text-slate-600">Manage your client caseload and progress</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </div>

            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <Input placeholder="Search clients..." className="w-full" />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientData.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <CardDescription>Age: {client.age} • {client.condition}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {client.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{client.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Last Session:</span>
                        <span>{client.lastSession}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Next Appointment:</span>
                        <span>{client.nextAppointment}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <FileText className="h-3 w-3 mr-1" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Continue with other tabs... */}
          <TabsContent value="assessments" className="space-y-6">
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Assessment Tools</h3>
              <p className="text-slate-600 mb-4">Advanced assessment interface coming soon</p>
              <Link href="/modules/assessments">
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  Explore Assessment Tools
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Practice Management</h3>
              <p className="text-slate-600 mb-4">Comprehensive practice tools interface coming soon</p>
              <Link href="/modules/practice">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Explore Practice Tools
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Tools</h3>
              <p className="text-slate-600 mb-4">Advanced AI features interface coming soon</p>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Explore AI Tools
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="white-label" className="space-y-6">
            <div className="text-center py-12">
              <Palette className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">White-Label Configuration</h3>
              <p className="text-slate-600 mb-4">Brand customization interface coming soon</p>
              <Button>
                <Palette className="h-4 w-4 mr-2" />
                Configure Branding
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
