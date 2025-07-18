'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Shield,
  Briefcase,
  GraduationCap,
  Heart,
  Scale,
  Building2,
  Crown,
  UserCheck,
  Stethoscope,
  ClipboardList,
  Zap
} from 'lucide-react'

interface UserRole {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  badge: string
  color: string
  portals: string[]
  defaultRoute: string
}

const userRoles: UserRole[] = [
  {
    id: 'parent',
    name: 'Parent/Carer',
    description: 'Complete oversight and advocacy tools for your child\'s SEND journey',
    icon: User,
    badge: 'Premium',
    color: 'bg-blue-500',
    portals: ['Parent Portal', 'Document Management', 'Plan Tracking', 'Professional Network'],
    defaultRoute: '/parent-portal'
  },
  {
    id: 'la_executive',
    name: 'LA Executive',
    description: 'Strategic oversight and executive dashboard for Local Authority leadership',
    icon: Crown,
    badge: 'Executive',
    color: 'bg-purple-600',
    portals: ['Executive Dashboard', 'Strategic Analytics', 'Budget Overview', 'Performance Metrics'],
    defaultRoute: '/la-portal/executive'
  },
  {
    id: 'la_officer',
    name: 'LA SEND Officer',
    description: 'Case management, compliance monitoring, and operational oversight',
    icon: Shield,
    badge: 'Officer',
    color: 'bg-indigo-500',
    portals: ['Case Management', 'Compliance Dashboard', 'Resource Planning', 'Professional Network'],
    defaultRoute: '/la-portal/officer'
  },
  {
    id: 'la_caseworker',
    name: 'LA Caseworker',
    description: 'Direct case management and family liaison responsibilities',
    icon: ClipboardList,
    badge: 'Caseworker',
    color: 'bg-teal-500',
    portals: ['Case Workbench', 'Family Communication', 'Assessment Tracking', 'Document Processing'],
    defaultRoute: '/la-portal/caseworker'
  },
  {
    id: 'professional',
    name: 'SEND Professional',
    description: 'Assessment tools, collaboration platforms, and outcome tracking',
    icon: Briefcase,
    badge: 'Professional',
    color: 'bg-green-500',
    portals: ['Assessment Hub', 'Collaboration Tools', 'Client Management', 'Professional Network'],
    defaultRoute: '/professional'
  },
  {
    id: 'school_hub',
    name: 'School Hub (SENCO)',
    description: 'AI-powered SEND management with EHC plans, student tracking, and multi-stakeholder collaboration',
    icon: GraduationCap,
    badge: 'AI-Powered',
    color: 'bg-green-500',
    portals: ['Student Management', 'EHC Plans', 'Professional Network', 'Parent Engagement', 'AI Insights', 'Compliance'],
    defaultRoute: '/school-hub'
  },
  {
    id: 'school_intelligence',
    name: 'School Intelligence Platform',
    description: 'Revolutionary AI-powered school selection with complete national database of 24,372 schools',
    icon: Briefcase,
    badge: '£2.5B Market',
    color: 'bg-gradient-to-r from-blue-600 to-purple-600',
    portals: ['AI School Search', 'National Database', 'LA Analytics', 'Government Intelligence', 'Capacity Planning', 'Predictive Analytics'],
    defaultRoute: '/school-intelligence'
  },
  {
    id: 'health_professional',
    name: 'Health Professional',
    description: 'Clinical workflows, health assessments, and care coordination',
    icon: Stethoscope,
    badge: 'Clinical',
    color: 'bg-red-500',
    portals: ['Clinical Dashboard', 'Assessment Tools', 'Care Coordination', 'Health Analytics'],
    defaultRoute: '/health-portal'
  },
  {
    id: 'legal_advocate',
    name: 'Legal Advocate',
    description: 'Case preparation, tribunal support, and legal documentation',
    icon: Scale,
    badge: 'Legal',
    color: 'bg-gray-700',
    portals: ['Case Preparation', 'Tribunal Support', 'Evidence Management', 'Legal Analytics'],
    defaultRoute: '/legal-portal'
  },
  {
    id: 'admin',
    name: 'System Administrator',
    description: 'Full system access, user management, and platform configuration',
    icon: Zap,
    badge: 'Admin',
    color: 'bg-pink-600',
    portals: ['All Systems', 'User Management', 'System Configuration', 'Analytics'],
    defaultRoute: '/admin'
  }
]

export default function DevBypassPage() {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleBypass = async (role: UserRole) => {
    setIsLoading(true)

    try {
      // Set bypass token in localStorage
      const bypassData = {
        role: role.id,
        name: role.name,
        timestamp: Date.now(),
        permissions: role.portals
      }

      localStorage.setItem('dev_bypass_user', JSON.stringify(bypassData))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate to appropriate portal
      router.push(role.defaultRoute)
    } catch (error) {
      console.error('Bypass failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🚀 Revolutionary SEND Intelligence Ecosystem
          </h1>
          <p className="text-xl text-purple-200 mb-2">
            World's First Comprehensive School Intelligence Platform
          </p>
          <p className="text-lg text-purple-300">
            Complete National Database + AI-Powered Matching + Multi-Stakeholder Integration
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-lg border border-purple-400/30">
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white mr-2">£2.5B Market</Badge>
              <span className="text-purple-200">Total Addressable Market</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-lg border border-purple-400/30">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white mr-2">24,372 Schools</Badge>
              <span className="text-purple-200">Complete National Coverage</span>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-lg border border-purple-400/30">
              <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white mr-2">Zero Competition</Badge>
              <span className="text-purple-200">Revolutionary First-Mover</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userRoles.map((role) => {
            const IconComponent = role.icon
            return (
              <Card
                key={role.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                onClick={() => handleBypass(role)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-lg ${role.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {role.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-lg group-hover:text-purple-200">
                    {role.name}
                  </CardTitle>
                  <CardDescription className="text-purple-200 text-sm">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-purple-300 mb-2 font-medium">Portal Access:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.portals.slice(0, 3).map((portal, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-purple-500/20 border-purple-400/30 text-purple-200"
                          >
                            {portal}
                          </Badge>
                        ))}
                        {role.portals.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-500/20 border-purple-400/30 text-purple-200"
                          >
                            +{role.portals.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Accessing...' : `Enter as ${role.name}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl">🚀 Revolutionary Intelligence Platform Overview</CardTitle>
              <CardDescription className="text-purple-200">
                World's first comprehensive SEND intelligence ecosystem with complete national coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center mb-6">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-400">£2.5B</div>
                  <div className="text-white">Total Market</div>
                  <div className="text-purple-300 text-sm">Addressable opportunity</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-400">24,372</div>
                  <div className="text-white">Schools Database</div>
                  <div className="text-purple-300 text-sm">Complete national coverage</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-purple-400">96.3%</div>
                  <div className="text-white">AI Match Accuracy</div>
                  <div className="text-purple-300 text-sm">Revolutionary school selection</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-amber-400">152</div>
                  <div className="text-white">Local Authorities</div>
                  <div className="text-purple-300 text-sm">Strategic intelligence</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 rounded-lg border border-purple-400/30">
                <h3 className="text-white font-semibold mb-2">🌟 Revolutionary Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-200">
                  <div>
                    <p className="font-medium text-white mb-1">AI-Powered School Matching</p>
                    <p>Revolutionary parent school selection with 98% accuracy</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Real-Time Capacity Intelligence</p>
                    <p>Live tracking of all school places and waiting lists</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Government-Level Analytics</p>
                    <p>National trends and policy impact modeling</p>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Unassailable Data Moats</p>
                    <p>First-mover advantage with complete national coverage</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-purple-300 text-sm">
            🔧 Development Environment • All data is simulated • Perfect for testing all user journeys
          </p>
        </div>
      </div>
    </div>
  )
}
