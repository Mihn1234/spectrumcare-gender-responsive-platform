"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Video,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Star,
  Briefcase,
  Building,
  MapPin,
  CreditCard,
  Receipt,
  PieChart,
  Activity,
  Bell,
  Zap,
  Shield,
  RefreshCw
} from "lucide-react"

export default function PracticeManagementPage() {
  const practiceStats = {
    totalRevenue: 47250,
    monthlyGrowth: 12.5,
    activeClients: 186,
    scheduledAppointments: 42,
    pendingInvoices: 8,
    completionRate: 94
  }

  const upcomingAppointments = [
    {
      time: "9:00 AM",
      client: "Emma Thompson",
      type: "ADOS-2 Assessment",
      therapist: "Dr. Sarah Martinez",
      duration: 90,
      status: "confirmed"
    },
    {
      time: "11:00 AM",
      client: "James Wilson",
      type: "Follow-up Session",
      therapist: "Lisa Rodriguez",
      duration: 60,
      status: "confirmed"
    },
    {
      time: "2:00 PM",
      client: "Sophie Chen",
      type: "Family Consultation",
      therapist: "Dr. Sarah Martinez",
      duration: 45,
      status: "pending"
    },
    {
      time: "3:30 PM",
      client: "Alex Johnson",
      type: "Initial Assessment",
      therapist: "Mike Chen",
      duration: 120,
      status: "confirmed"
    }
  ]

  const revenueData = [
    { month: "Jan", amount: 38500, invoices: 47 },
    { month: "Feb", amount: 42200, invoices: 52 },
    { month: "Mar", amount: 39800, invoices: 49 },
    { month: "Apr", amount: 45600, invoices: 56 },
    { month: "May", amount: 47250, invoices: 58 }
  ]

  const teamMembers = [
    {
      name: "Dr. Sarah Martinez",
      role: "Clinical Psychologist",
      specialties: ["ADOS-2", "Autism Assessment"],
      status: "available",
      currentClients: 28,
      thisWeekSessions: 12,
      rating: 4.9
    },
    {
      name: "Lisa Rodriguez",
      role: "Speech Therapist",
      specialties: ["Communication", "Social Skills"],
      status: "busy",
      currentClients: 23,
      thisWeekSessions: 15,
      rating: 4.8
    },
    {
      name: "Mike Chen",
      role: "Behavioral Analyst",
      specialties: ["Behavior Intervention", "ABA"],
      status: "available",
      currentClients: 19,
      thisWeekSessions: 9,
      rating: 4.7
    },
    {
      name: "Dr. Emily Parker",
      role: "Occupational Therapist",
      specialties: ["Sensory Processing", "Motor Skills"],
      status: "on-leave",
      currentClients: 15,
      thisWeekSessions: 0,
      rating: 4.9
    }
  ]

  const invoiceData = [
    {
      id: "INV-2024-001",
      client: "Thompson Family",
      service: "ADOS-2 Assessment",
      amount: 450,
      date: "2024-01-15",
      status: "paid",
      dueDate: "2024-01-30"
    },
    {
      id: "INV-2024-002",
      client: "Wilson Family",
      service: "Therapy Sessions (4x)",
      amount: 320,
      date: "2024-01-18",
      status: "pending",
      dueDate: "2024-02-02"
    },
    {
      id: "INV-2024-003",
      client: "Chen Family",
      service: "Family Consultation",
      amount: 150,
      date: "2024-01-20",
      status: "overdue",
      dueDate: "2024-02-05"
    },
    {
      id: "INV-2024-004",
      client: "Johnson Family",
      service: "Initial Assessment",
      amount: 380,
      date: "2024-01-22",
      status: "draft",
      dueDate: "2024-02-07"
    }
  ]

  const clientProgress = [
    {
      name: "Emma Thompson",
      goals: 4,
      completed: 3,
      progress: 75,
      lastSession: "2 days ago",
      nextSession: "Tomorrow"
    },
    {
      name: "James Wilson",
      goals: 3,
      completed: 2,
      progress: 67,
      lastSession: "1 week ago",
      nextSession: "Friday"
    },
    {
      name: "Sophie Chen",
      goals: 5,
      completed: 4,
      progress: 80,
      lastSession: "3 days ago",
      nextSession: "Next Tuesday"
    }
  ]

  const performanceMetrics = [
    { label: "Client Satisfaction", value: 94, target: 90, trend: "up" },
    { label: "Session Completion Rate", value: 96, target: 95, trend: "up" },
    { label: "On-time Performance", value: 88, target: 90, trend: "down" },
    { label: "Revenue per Client", value: 254, target: 250, trend: "up" }
  ]

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
                <h1 className="text-2xl font-bold text-blue-600">Practice Management</h1>
                <p className="text-sm text-slate-600">Complete practice operations and business intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-600">
                <Activity className="h-3 w-3 mr-1" />
                All Systems Operational
              </Badge>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Practice Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Revenue</p>
                  <p className="text-xl font-bold text-green-600">£{practiceStats.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{practiceStats.monthlyGrowth}%
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Clients</p>
                  <p className="text-xl font-bold text-blue-600">{practiceStats.activeClients}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Today</p>
                  <p className="text-xl font-bold text-purple-600">{practiceStats.scheduledAppointments}</p>
                  <p className="text-xs text-slate-500">Appointments</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-xl font-bold text-orange-600">{practiceStats.pendingInvoices}</p>
                  <p className="text-xs text-slate-500">Invoices</p>
                </div>
                <Receipt className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completion</p>
                  <p className="text-xl font-bold text-cyan-600">{practiceStats.completionRate}%</p>
                  <p className="text-xs text-slate-500">Rate</p>
                </div>
                <Target className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Performance</p>
                  <p className="text-xl font-bold text-pink-600">A+</p>
                  <p className="text-xs text-slate-500">Grade</p>
                </div>
                <Award className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Today's Schedule
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Appointment
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 text-center">
                              <p className="font-bold">{appointment.time}</p>
                              <p className="text-xs text-slate-500">{appointment.duration}min</p>
                            </div>
                            <div>
                              <h4 className="font-medium">{appointment.client}</h4>
                              <p className="text-sm text-slate-600">{appointment.type}</p>
                              <p className="text-xs text-slate-500">with {appointment.therapist}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {appointment.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Add New Client
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Receipt className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Calendar Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Today</span>
                        <span className="font-medium">4 appointments</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tomorrow</span>
                        <span className="font-medium">6 appointments</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">This Week</span>
                        <span className="font-medium">28 appointments</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Next Week</span>
                        <span className="font-medium">31 appointments</span>
                      </div>
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
                <CardTitle className="flex items-center justify-between">
                  Client Management
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search clients..." className="w-64" />
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientProgress.map((client, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-slate-600">
                            {client.completed} of {client.goals} goals completed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <Progress value={client.progress} className="w-20 h-2" />
                            <span className="text-sm font-medium">{client.progress}%</span>
                          </div>
                          <p className="text-xs text-slate-500">Progress</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Last Session</p>
                          <p className="font-medium">{client.lastSession}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Next Session</p>
                          <p className="font-medium">{client.nextSession}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage your professional team and their schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {member.name[0]}
                          </div>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-slate-600">{member.role}</p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          member.status === 'available' ? 'bg-green-500' :
                          member.status === 'busy' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.map((specialty, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-slate-600">Clients</p>
                          <p className="font-medium">{member.currentClients}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">This Week</p>
                          <p className="font-medium">{member.thisWeekSessions}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Rating</p>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{member.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Invoices
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {invoiceData.map((invoice, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{invoice.id}</h4>
                            <p className="text-sm text-slate-600">{invoice.client} • {invoice.service}</p>
                            <p className="text-xs text-slate-500">Due: {invoice.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">£{invoice.amount}</p>
                            <Badge className={
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueData.slice(-3).map((month, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-sm">{month.month}</span>
                          <div className="text-right">
                            <p className="font-medium">£{month.amount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{month.invoices} invoices</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Paid</span>
                        <span className="font-medium text-green-600">£12,480</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pending</span>
                        <span className="font-medium text-yellow-600">£2,850</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Overdue</span>
                        <span className="font-medium text-red-600">£450</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Performance Reports</CardTitle>
                <CardDescription>Comprehensive analytics and business intelligence</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Key Performance Indicators</h4>
                    <div className="space-y-4">
                      {performanceMetrics.map((metric, idx) => (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">{metric.label}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{metric.value}{metric.label.includes('Revenue') ? '' : '%'}</span>
                              {metric.trend === 'up' ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          </div>
                          <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                          <p className="text-xs text-slate-500 mt-1">Target: {metric.target}{metric.label.includes('Revenue') ? '' : '%'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Revenue Analysis</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-800">Monthly Growth</p>
                        <p className="text-2xl font-bold text-green-600">+12.5%</p>
                        <p className="text-sm text-green-600">Above target of 10%</p>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-medium text-blue-800">Average per Client</p>
                        <p className="text-2xl font-bold text-blue-600">£254</p>
                        <p className="text-sm text-blue-600">+£15 from last month</p>
                      </div>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="font-medium text-purple-800">Efficiency Score</p>
                        <p className="text-2xl font-bold text-purple-600">94%</p>
                        <p className="text-sm text-purple-600">Excellent performance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Center</CardTitle>
                <CardDescription>Manage all client and team communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Recent Messages</h4>
                    <div className="space-y-3">
                      {[
                        { from: "Emma Thompson (Parent)", message: "Thank you for today's session report", time: "2 hours ago", unread: true },
                        { from: "Dr. Sarah Martinez", message: "Patient assessment completed", time: "4 hours ago", unread: false },
                        { from: "James Wilson (Parent)", message: "Can we reschedule Friday appointment?", time: "1 day ago", unread: true },
                        { from: "Lisa Rodriguez", message: "New therapy techniques working well", time: "2 days ago", unread: false }
                      ].map((message, idx) => (
                        <div key={idx} className={`p-3 border rounded-lg ${message.unread ? 'bg-blue-50 border-blue-200' : ''}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{message.from}</p>
                            <p className="text-xs text-slate-500">{message.time}</p>
                          </div>
                          <p className="text-sm text-slate-600">{message.message}</p>
                          {message.unread && (
                            <Badge className="bg-blue-100 text-blue-800 mt-2">Unread</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Communication Tools</h4>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Internal Message
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Schedule Video Call
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Bell className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                    </div>

                    <div className="mt-6">
                      <h5 className="font-medium mb-2">Quick Templates</h5>
                      <div className="space-y-2">
                        {["Appointment Reminder", "Session Follow-up", "Assessment Results", "Progress Update"].map((template, idx) => (
                          <Button key={idx} variant="outline" size="sm" className="w-full justify-start text-xs">
                            {template}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Practice Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Practice Name</label>
                    <Input defaultValue="SpectrumCare Professional Services" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input defaultValue="123 Medical Center Drive, London" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input defaultValue="+44 20 7123 4567" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input defaultValue="info@spectrumcare.co.uk" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Session Duration</label>
                    <Select defaultValue="60">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Currency</label>
                    <Select defaultValue="gbp">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time Zone</label>
                    <Select defaultValue="london">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="london">London (GMT)</SelectItem>
                        <SelectItem value="manchester">Manchester (GMT)</SelectItem>
                        <SelectItem value="edinburgh">Edinburgh (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
