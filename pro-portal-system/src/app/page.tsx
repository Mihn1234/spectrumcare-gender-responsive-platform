import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Brain,
  Users,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  CreditCard,
  Shield,
  Stethoscope,
  GraduationCap,
  HeartHandshake,
  Building2,
  Zap,
  Database,
  Globe,
  Lock
} from "lucide-react"

export default function SystemOverview() {
  const portalAccess = [
    {
      id: "professional-guest",
      title: "Professional Portal - Guest",
      description: "Limited access for invited professionals",
      icon: <Users className="h-6 w-6" />,
      tier: "FREE",
      features: ["Read-only access", "Basic assessments", "Email support"],
      path: "/portal/professional/guest",
      color: "bg-slate-500"
    },
    {
      id: "professional-hybrid",
      title: "Professional Portal - Hybrid",
      description: "Enhanced features for growing practices",
      icon: <Stethoscope className="h-6 w-6" />,
      tier: "£75-150/mo",
      features: ["Advanced assessments", "Team collaboration", "Limited branding"],
      path: "/portal/professional/hybrid",
      color: "bg-blue-500"
    },
    {
      id: "professional-premium",
      title: "Professional Portal - Premium",
      description: "Full-featured platform with white-label capabilities",
      icon: <GraduationCap className="h-6 w-6" />,
      tier: "£200-500/mo",
      features: ["White-label branding", "AI features", "Custom domain"],
      path: "/portal/professional/premium",
      color: "bg-purple-500"
    },
    {
      id: "professional-enterprise",
      title: "Professional Portal - Enterprise",
      description: "Multi-user enterprise solution",
      icon: <Building2 className="h-6 w-6" />,
      tier: "£1K-5K/mo",
      features: ["Multi-user accounts", "Custom integrations", "Dedicated support"],
      path: "/portal/professional/enterprise",
      color: "bg-emerald-500"
    },
    {
      id: "family-portal",
      title: "Family Portal",
      description: "Client and family member interface",
      icon: <HeartHandshake className="h-6 w-6" />,
      tier: "Client Access",
      features: ["Child profiles", "Progress tracking", "Communication"],
      path: "/portal/family",
      color: "bg-pink-500"
    },
    {
      id: "admin-portal",
      title: "Admin Dashboard",
      description: "System administration and oversight",
      icon: <Settings className="h-6 w-6" />,
      tier: "Admin Only",
      features: ["User management", "System monitoring", "Configuration"],
      path: "/portal/admin",
      color: "bg-red-500"
    }
  ]

  const systemModules = [
    {
      title: "Assessment Tools",
      description: "AI-powered assessment suite for multiple domains",
      icon: <Brain className="h-8 w-8" />,
      path: "/modules/assessments",
      domains: ["Speech Therapy", "Occupational Therapy", "Psychology", "Education"]
    },
    {
      title: "Matching Engine",
      description: "AI-driven professional-client matching system",
      icon: <Zap className="h-8 w-8" />,
      path: "/modules/matching",
      domains: ["Algorithm Demo", "Matching Criteria", "Success Metrics"]
    },
    {
      title: "Practice Management",
      description: "Complete practice workflow management",
      icon: <Calendar className="h-8 w-8" />,
      path: "/modules/practice-management",
      domains: ["Appointments", "Client Records", "Documentation", "Billing"]
    },
    {
      title: "Analytics & Reporting",
      description: "Advanced analytics and outcome tracking",
      icon: <BarChart3 className="h-8 w-8" />,
      path: "/modules/analytics",
      domains: ["Performance Metrics", "Outcome Tracking", "Business Intelligence"]
    },
    {
      title: "Communication Hub",
      description: "Secure messaging and video consultation",
      icon: <FileText className="h-8 w-8" />,
      path: "/modules/communication",
      domains: ["Secure Messaging", "Video Calls", "Document Sharing"]
    },
    {
      title: "Billing & Subscriptions",
      description: "Financial management and payment processing",
      icon: <CreditCard className="h-8 w-8" />,
      path: "/modules/billing",
      domains: ["Subscription Management", "Invoicing", "Payment Processing"]
    }
  ]

  const architectureComponents = [
    {
      title: "Microservices Architecture",
      description: "Scalable service-oriented architecture",
      icon: <Database className="h-6 w-6" />,
      path: "/architecture/microservices"
    },
    {
      title: "API Gateway & Security",
      description: "Authentication and access control systems",
      icon: <Shield className="h-6 w-6" />,
      path: "/architecture/security"
    },
    {
      title: "Multi-Tenant Infrastructure",
      description: "White-label and tenant isolation",
      icon: <Globe className="h-6 w-6" />,
      path: "/architecture/multi-tenant"
    },
    {
      title: "Data Layer & Storage",
      description: "Database design and data management",
      icon: <Lock className="h-6 w-6" />,
      path: "/architecture/data-layer"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🏗️ Professional Portal System
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Enterprise-Level Professional Portal for Special Needs Children & Families
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="text-sm">Login Bypass Enabled</Badge>
            <Badge variant="outline" className="text-sm">Demo Environment</Badge>
            <Badge variant="outline" className="text-sm">All Features Unlocked</Badge>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="portals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portals">Portal Access</TabsTrigger>
            <TabsTrigger value="modules">System Modules</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
          </TabsList>

          {/* Portal Access Tab */}
          <TabsContent value="portals" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Direct Portal Access</h2>
              <p className="text-slate-600">Choose any portal to explore - no login required in demo mode</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portalAccess.map((portal) => (
                <Card key={portal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${portal.color} text-white`}>
                        {portal.icon}
                      </div>
                      <Badge variant="secondary">{portal.tier}</Badge>
                    </div>
                    <CardTitle className="text-lg">{portal.title}</CardTitle>
                    <CardDescription>{portal.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {portal.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Link href={portal.path}>
                      <Button className="w-full">Access Portal</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Core System Modules</h2>
              <p className="text-slate-600">Explore the key functional components of the platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemModules.map((module, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {module.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {module.domains.map((domain, domainIdx) => (
                        <Badge key={domainIdx} variant="outline" className="text-xs">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                    <Link href={module.path}>
                      <Button variant="outline" className="w-full">Explore Module</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">System Architecture</h2>
              <p className="text-slate-600">Technical implementation and infrastructure components</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {architectureComponents.map((component, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        {component.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{component.title}</CardTitle>
                        <CardDescription>{component.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={component.path}>
                      <Button variant="outline" className="w-full">View Architecture</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                  <CardDescription>Core technologies powering the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-slate-600">Frontend</h4>
                      <div className="space-y-1">
                        <Badge variant="outline">React 18</Badge>
                        <Badge variant="outline">Next.js 14</Badge>
                        <Badge variant="outline">TypeScript</Badge>
                        <Badge variant="outline">Tailwind CSS</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-slate-600">Backend</h4>
                      <div className="space-y-1">
                        <Badge variant="outline">Node.js</Badge>
                        <Badge variant="outline">PostgreSQL</Badge>
                        <Badge variant="outline">Redis</Badge>
                        <Badge variant="outline">Docker</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                  <CardDescription>Platform capabilities and integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    AI-Powered Professional Matching
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Multi-Tenant White-Label Solutions
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Comprehensive Assessment Tools
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Practice Management Suite
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Secure Communication Platform
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Advanced Analytics & Reporting
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
                <CardDescription>Current development progress across all modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">6</div>
                    <div className="text-sm text-green-600">Active Portals</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">15+</div>
                    <div className="text-sm text-blue-600">Assessment Domains</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">4</div>
                    <div className="text-sm text-purple-600">Subscription Tiers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Explore?</h3>
              <p className="opacity-90">
                This demo environment provides full access to all portals and features without authentication.
                Perfect for testing, development, and showcasing capabilities.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/portal/professional/premium">
                  <Button variant="secondary">Try Premium Portal</Button>
                </Link>
                <Link href="/modules/assessments">
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
                    View Assessments
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
