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
  Shield,
  Users,
  Server,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Settings,
  BarChart3,
  Globe,
  Lock,
  Eye,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  User,
  CreditCard,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Building2
} from "lucide-react"

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const systemStats = {
    totalUsers: 12847,
    activeProfessionals: 3254,
    activeClients: 8937,
    pendingVerifications: 47,
    systemUptime: "99.9%",
    responseTime: "127ms",
    dataStorage: "2.3TB",
    dailyTransactions: 45672
  }

  const recentAlerts = [
    {
      id: 1,
      type: "security",
      severity: "high",
      message: "Multiple failed login attempts detected from IP 192.168.1.100",
      timestamp: "2025-07-16 09:30 AM",
      status: "active"
    },
    {
      id: 2,
      type: "performance",
      severity: "medium",
      message: "Assessment service response time increased by 15%",
      timestamp: "2025-07-16 08:45 AM",
      status: "investigating"
    },
    {
      id: 3,
      type: "compliance",
      severity: "low",
      message: "Monthly HIPAA compliance review due in 3 days",
      timestamp: "2025-07-16 07:15 AM",
      status: "scheduled"
    }
  ]

  const userActivity = [
    {
      user: "Dr. Sarah Thompson",
      action: "Created assessment",
      details: "ADOS-2 for Emma Johnson",
      timestamp: "2 minutes ago",
      type: "assessment"
    },
    {
      user: "Johnson Family",
      action: "Viewed progress report",
      details: "Emma Johnson's monthly report",
      timestamp: "5 minutes ago",
      type: "view"
    },
    {
      user: "Admin Team",
      action: "Verified professional",
      details: "Dr. Michael Chen - Speech Therapist",
      timestamp: "12 minutes ago",
      type: "verification"
    },
    {
      user: "Lisa Rodriguez",
      action: "Scheduled appointment",
      details: "Liam Smith - Speech therapy session",
      timestamp: "18 minutes ago",
      type: "scheduling"
    }
  ]

  const professionals = [
    {
      id: 1,
      name: "Dr. Sarah Thompson",
      email: "sarah.thompson@example.com",
      specialty: "Child Psychology",
      tier: "Premium",
      status: "Active",
      clients: 47,
      joinDate: "2024-03-15",
      lastLogin: "2025-07-16 09:30"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      email: "michael.chen@example.com",
      specialty: "Speech Therapy",
      tier: "Hybrid",
      status: "Pending Verification",
      clients: 23,
      joinDate: "2025-07-10",
      lastLogin: "2025-07-15 16:45"
    },
    {
      id: 3,
      name: "Lisa Rodriguez",
      email: "lisa.rodriguez@example.com",
      specialty: "Occupational Therapy",
      tier: "Enterprise",
      status: "Active",
      clients: 89,
      joinDate: "2023-11-08",
      lastLogin: "2025-07-16 08:15"
    }
  ]

  const systemHealth = {
    cpu: 23,
    memory: 67,
    storage: 45,
    network: 12
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-red-600">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">System Administration & Oversight</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-100 text-red-600 hover:bg-red-200">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Alerts ({recentAlerts.filter(alert => alert.status === 'active').length})
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
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{systemStats.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-slate-600">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">{systemStats.activeProfessionals.toLocaleString()}</p>
                      <p className="text-sm text-slate-600">Active Professionals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{systemStats.systemUptime}</p>
                      <p className="text-sm text-slate-600">System Uptime</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{systemStats.responseTime}</p>
                      <p className="text-sm text-slate-600">Avg Response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Alerts */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>System Alerts</CardTitle>
                    <CardDescription>Recent system notifications and warnings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentAlerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-600">
                              <span>{alert.timestamp}</span>
                              <Badge variant="outline" className="text-xs">
                                {alert.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time system performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">CPU Usage</span>
                      </div>
                      <span className="text-sm font-medium">{systemHealth.cpu}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${systemHealth.cpu}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Memory Usage</span>
                      </div>
                      <span className="text-sm font-medium">{systemHealth.memory}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${systemHealth.memory}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Storage</span>
                      </div>
                      <span className="text-sm font-medium">{systemHealth.storage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${systemHealth.storage}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-orange-600" />
                        <span className="text-sm">Network I/O</span>
                      </div>
                      <span className="text-sm font-medium">{systemHealth.network}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${systemHealth.network}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'assessment' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'view' ? 'bg-green-100 text-green-600' :
                        activity.type === 'verification' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {activity.type === 'assessment' && <FileText className="h-4 w-4" />}
                        {activity.type === 'view' && <Eye className="h-4 w-4" />}
                        {activity.type === 'verification' && <CheckCircle className="h-4 w-4" />}
                        {activity.type === 'scheduling' && <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.user}</p>
                        <p className="text-xs text-slate-600">{activity.action} • {activity.details}</p>
                      </div>
                      <div className="text-xs text-slate-500">{activity.timestamp}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">User Management</h2>
                <p className="text-slate-600">Manage professionals, clients, and system access</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <Input placeholder="Search users..." className="w-full" />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="professional">Professionals</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Professional Users</CardTitle>
                <CardDescription>Manage professional accounts and verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professionals.map((professional) => (
                    <div key={professional.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{professional.name}</p>
                          <Badge variant={professional.status === 'Active' ? 'default' : 'secondary'}>
                            {professional.status}
                          </Badge>
                          <Badge variant="outline">{professional.tier}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{professional.email}</p>
                        <p className="text-xs text-slate-500">
                          {professional.specialty} • {professional.clients} clients • Joined {professional.joinDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Last login:</p>
                        <p className="text-xs font-medium">{professional.lastLogin}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs with placeholder content */}
          <TabsContent value="system" className="space-y-6">
            <div className="text-center py-12">
              <Server className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">System Management</h3>
              <p className="text-slate-600 mb-4">Server configuration and maintenance tools</p>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure System
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="text-center py-12">
              <Lock className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Security & Compliance</h3>
              <p className="text-slate-600 mb-4">Security monitoring and compliance management</p>
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Security Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Platform Analytics</h3>
              <p className="text-slate-600 mb-4">Usage statistics and performance metrics</p>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Platform Settings</h3>
              <p className="text-slate-600 mb-4">Global configuration and preferences</p>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Configure Platform
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
