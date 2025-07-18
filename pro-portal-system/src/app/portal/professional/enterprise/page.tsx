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
  Unlock,
  Building,
  Globe,
  Database,
  Cpu,
  CloudLightning,
  Network,
  Workflow,
  GitBranch,
  Activity,
  Briefcase,
  UserCheck,
  Crown,
  Sparkles,
  Code,
  Key,
  Server,
  MonitorSpeaker
} from "lucide-react"

export default function EnterpriseProfessionalPortal() {
  const enterpriseFeatures = [
    {
      title: "Unlimited Everything",
      description: "No limits on assessments, clients, storage, or team members",
      icon: <Crown className="h-6 w-6" />,
      status: "available",
      category: "capacity"
    },
    {
      title: "Advanced AI Suite",
      description: "Predictive analytics, custom AI models, and machine learning insights",
      icon: <Brain className="h-6 w-6" />,
      status: "available",
      category: "ai"
    },
    {
      title: "API & Integrations",
      description: "Full REST API, webhooks, and 100+ third-party integrations",
      icon: <Code className="h-6 w-6" />,
      status: "available",
      category: "technical"
    },
    {
      title: "Multi-Site Management",
      description: "Manage multiple locations, departments, and practice groups",
      icon: <Building className="h-6 w-6" />,
      status: "available",
      category: "organization"
    },
    {
      title: "Custom Workflows",
      description: "Build automated workflows and approval processes",
      icon: <Workflow className="h-6 w-6" />,
      status: "available",
      category: "automation"
    },
    {
      title: "Advanced Security",
      description: "SSO, audit logs, compliance reporting, and data governance",
      icon: <Shield className="h-6 w-6" />,
      status: "available",
      category: "security"
    },
    {
      title: "White-Label Platform",
      description: "Complete platform customization with your branding",
      icon: <Sparkles className="h-6 w-6" />,
      status: "available",
      category: "branding"
    },
    {
      title: "Enterprise Analytics",
      description: "Advanced reporting, dashboards, and business intelligence",
      icon: <TrendingUp className="h-6 w-6" />,
      status: "available",
      category: "analytics"
    }
  ]

  const organizationStats = {
    totalProfessionals: 127,
    activeSites: 8,
    monthlyAssessments: 1247,
    clientsSeen: 3890,
    teamCollaborations: 892,
    documentsGenerated: 2156
  }

  const siteData = [
    {
      name: "Central London Clinic",
      professionals: 25,
      activeClients: 340,
      monthlyRevenue: "£47,250",
      performance: 94,
      status: "excellent"
    },
    {
      name: "Manchester Branch",
      professionals: 18,
      activeClients: 285,
      monthlyRevenue: "£38,900",
      performance: 91,
      status: "excellent"
    },
    {
      name: "Birmingham Center",
      professionals: 15,
      activeClients: 220,
      monthlyRevenue: "£31,400",
      performance: 87,
      status: "good"
    },
    {
      name: "Leeds Practice",
      professionals: 12,
      activeClients: 180,
      monthlyRevenue: "£24,800",
      performance: 89,
      status: "good"
    }
  ]

  const systemMetrics = [
    { label: "System Uptime", value: "99.97%", color: "text-green-600" },
    { label: "API Response Time", value: "< 200ms", color: "text-blue-600" },
    { label: "Data Processing", value: "Real-time", color: "text-purple-600" },
    { label: "Security Score", value: "A+", color: "text-orange-600" }
  ]

  const recentAlerts = [
    {
      type: "system",
      title: "Scheduled Maintenance Complete",
      message: "All systems updated successfully",
      time: "2 hours ago",
      severity: "info"
    },
    {
      type: "security",
      title: "Security Scan Completed",
      message: "No vulnerabilities detected",
      time: "6 hours ago",
      severity: "success"
    },
    {
      type: "performance",
      title: "High Usage Alert",
      message: "Manchester site experiencing high traffic",
      time: "1 day ago",
      severity: "warning"
    }
  ]

  const integrations = [
    { name: "NHS SystmOne", status: "active", type: "Healthcare" },
    { name: "EMIS Web", status: "active", type: "Healthcare" },
    { name: "Microsoft Teams", status: "active", type: "Communication" },
    { name: "Zoom", status: "active", type: "Video" },
    { name: "Salesforce", status: "configured", type: "CRM" },
    { name: "QuickBooks", status: "configured", type: "Finance" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-purple-600">Enterprise Portal</h1>
                <p className="text-sm text-slate-600">SpectrumCare Enterprise - Organization Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-600">
                <Crown className="h-3 w-3 mr-1" />
                Enterprise Access
              </Badge>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Admin Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Enterprise Stats */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{organizationStats.totalProfessionals}</p>
                    <p className="text-sm text-slate-600">Professionals</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{organizationStats.activeSites}</p>
                    <p className="text-sm text-slate-600">Active Sites</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{organizationStats.monthlyAssessments.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Assessments/Month</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{organizationStats.clientsSeen.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Clients Served</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">{organizationStats.teamCollaborations}</p>
                    <p className="text-sm text-slate-600">Collaborations</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cyan-600">{organizationStats.documentsGenerated.toLocaleString()}</p>
                    <p className="text-sm text-slate-600">Documents</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Site Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Multi-Site Performance
                      <Button variant="outline" size="sm">
                        <Building className="h-4 w-4 mr-2" />
                        Manage Sites
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {siteData.map((site, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {site.name[0]}
                            </div>
                            <div>
                              <h4 className="font-medium">{site.name}</h4>
                              <p className="text-sm text-slate-600">{site.professionals} professionals • {site.activeClients} active clients</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{site.monthlyRevenue}</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={site.performance} className="w-16 h-2" />
                              <span className="text-sm">{site.performance}%</span>
                            </div>
                            <Badge className={
                              site.status === 'excellent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }>
                              {site.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Health & Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {systemMetrics.map((metric, idx) => (
                        <div key={idx} className="text-center p-3 border rounded-lg">
                          <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
                          <p className="text-sm text-slate-600">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Enterprise Workflow */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "New Client Onboarding", status: "Active", instances: 23 },
                        { name: "Assessment Review Process", status: "Active", instances: 45 },
                        { name: "Inter-site Referrals", status: "Active", instances: 12 },
                        { name: "Quality Assurance Checks", status: "Scheduled", instances: 8 }
                      ].map((workflow, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Workflow className="h-5 w-5 text-purple-600" />
                            <div>
                              <h4 className="font-medium text-sm">{workflow.name}</h4>
                              <p className="text-xs text-slate-600">{workflow.instances} active instances</p>
                            </div>
                          </div>
                          <Badge className={workflow.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {workflow.status}
                          </Badge>
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
                    <CardTitle>Enterprise Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workflow
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Building className="h-4 w-4 mr-2" />
                      Add New Site
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                {/* System Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentAlerts.map((alert, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              alert.severity === 'success' ? 'bg-green-500' :
                              alert.severity === 'warning' ? 'bg-yellow-500' :
                              alert.severity === 'error' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`} />
                            <p className="font-medium text-xs">{alert.title}</p>
                          </div>
                          <p className="text-xs text-slate-600">{alert.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Integration Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {integrations.slice(0, 4).map((integration, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{integration.name}</span>
                          <Badge className={integration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {integration.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-3" size="sm" variant="outline">
                      View All Integrations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sites Tab */}
          <TabsContent value="sites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Site Management</CardTitle>
                <CardDescription>Manage all practice locations from a central dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {siteData.map((site, idx) => (
                    <Card key={idx} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold">{site.name}</h3>
                          <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Professionals</p>
                            <p className="text-xl font-bold">{site.professionals}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Active Clients</p>
                            <p className="text-xl font-bold">{site.activeClients}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Monthly Revenue</p>
                            <p className="text-xl font-bold text-green-600">{site.monthlyRevenue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Performance</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={site.performance} className="flex-1 h-2" />
                              <span className="text-sm font-medium">{site.performance}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Team Management</CardTitle>
                <CardDescription>Manage {organizationStats.totalProfessionals} professionals across {organizationStats.activeSites} sites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Team Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Psychologists</span>
                        <span className="font-medium">45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Speech Therapists</span>
                        <span className="font-medium">28</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Occupational Therapists</span>
                        <span className="font-medium">32</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Behavioral Analysts</span>
                        <span className="font-medium">22</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <p className="font-medium">Dr. Emily Parker</p>
                        <p className="text-slate-600">Completed ADOS-2 training</p>
                        <p className="text-xs text-slate-500">2 hours ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Lisa Rodriguez</p>
                        <p className="text-slate-600">Started at Birmingham Center</p>
                        <p className="text-xs text-slate-500">1 day ago</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Mike Chen</p>
                        <p className="text-slate-600">Achieved certification milestone</p>
                        <p className="text-xs text-slate-500">3 days ago</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Average Utilization</span>
                          <span>87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Training Completion</span>
                          <span>94%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Client Satisfaction</span>
                          <span>96%</span>
                        </div>
                        <Progress value={96} className="h-2" />
                      </div>
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
                <CardTitle>Enterprise Analytics & Business Intelligence</CardTitle>
                <CardDescription>Advanced reporting and insights across your organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">£1.2M</p>
                    <p className="text-sm text-slate-600">Annual Revenue</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">15,000+</p>
                    <p className="text-sm text-slate-600">Assessments Completed</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">98.5%</p>
                    <p className="text-sm text-slate-600">Client Retention</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">4.9/5</p>
                    <p className="text-sm text-slate-600">Average Rating</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Performance Trends</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Client Growth (YoY)</span>
                        <span className="font-medium text-green-600">+23%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue Growth (YoY)</span>
                        <span className="font-medium text-green-600">+18%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Efficiency Improvement</span>
                        <span className="font-medium text-blue-600">+12%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Cost Reduction</span>
                        <span className="font-medium text-purple-600">-8%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Predictive Insights</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Revenue Forecast</p>
                        <p className="text-xs text-green-600">On track to exceed targets by 15%</p>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Capacity Planning</p>
                        <p className="text-xs text-blue-600">Recommend 3 new hires in Q2</p>
                      </div>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">Market Expansion</p>
                        <p className="text-xs text-purple-600">Sheffield identified as optimal location</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Integrations</CardTitle>
                <CardDescription>Connect with 100+ third-party systems and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations.map((integration, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{integration.name}</h4>
                        <Badge className={integration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{integration.type}</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Security & Compliance</CardTitle>
                <CardDescription>Advanced security controls and compliance monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Security Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SSL Certificate</span>
                        <Badge className="bg-green-100 text-green-800">Valid</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Encryption</span>
                        <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Backup Status</span>
                        <Badge className="bg-green-100 text-green-800">Current</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Compliance Score</span>
                        <Badge className="bg-green-100 text-green-800">A+</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Audit Log</h4>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <p className="font-medium">User Access Review</p>
                        <p className="text-slate-600">Monthly audit completed</p>
                        <p className="text-xs text-slate-500">Today</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Security Scan</p>
                        <p className="text-slate-600">No vulnerabilities found</p>
                        <p className="text-xs text-slate-500">Yesterday</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Backup Verification</p>
                        <p className="text-slate-600">All systems backed up successfully</p>
                        <p className="text-xs text-slate-500">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Automation</CardTitle>
                <CardDescription>Custom workflows and automated processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Automated Client Onboarding",
                      description: "New client registration, document collection, and initial assessment scheduling",
                      trigger: "New client registration",
                      actions: 7,
                      status: "Active"
                    },
                    {
                      name: "Assessment Review Workflow",
                      description: "Multi-stage assessment review with approvals and quality checks",
                      trigger: "Assessment completion",
                      actions: 5,
                      status: "Active"
                    },
                    {
                      name: "Inter-site Referral Process",
                      description: "Automated referral routing based on expertise and availability",
                      trigger: "Referral request",
                      actions: 4,
                      status: "Active"
                    },
                    {
                      name: "Compliance Monitoring",
                      description: "Automated compliance checks and reporting",
                      trigger: "Schedule-based",
                      actions: 3,
                      status: "Scheduled"
                    }
                  ].map((workflow, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{workflow.name}</h4>
                        <Badge className={workflow.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{workflow.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Trigger: {workflow.trigger}</span>
                        <span>{workflow.actions} actions configured</span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-3 w-3 mr-1" />
                          View Activity
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Features Overview</CardTitle>
                <CardDescription>Complete feature suite for large organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enterpriseFeatures.map((feature, idx) => (
                    <div key={idx} className="p-4 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{feature.title}</h4>
                            <Badge className="bg-green-100 text-green-600">
                              <Unlock className="h-3 w-3 mr-1" />
                              Unlimited
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {feature.category}
                          </Badge>
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
