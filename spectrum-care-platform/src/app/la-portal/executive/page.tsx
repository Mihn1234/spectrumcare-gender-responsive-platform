'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Crown,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  PoundSterling,
  Target,
  FileText,
  Bell,
  BarChart3,
  CheckCircle,
  Settings
} from 'lucide-react'

export default function LAExecutivePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const bypassData = localStorage.getItem('dev_bypass_user')
    if (bypassData) {
      setCurrentUser(JSON.parse(bypassData))
    }
  }, [])

  const executiveMetrics = [
    {
      title: 'Active EHC Plans',
      value: '4,847',
      change: '+12% from last month',
      status: 'good',
      icon: FileText
    },
    {
      title: 'On-Time Completion',
      value: '89%',
      change: '+47% improvement',
      status: 'good',
      icon: Clock
    },
    {
      title: 'Budget Utilization',
      value: '£42.8M',
      change: '8% over budget',
      status: 'warning',
      icon: PoundSterling
    },
    {
      title: 'Parent Satisfaction',
      value: '76%',
      change: '+8% improvement',
      status: 'good',
      icon: Users
    }
  ]

  const alerts = [
    {
      type: 'critical',
      title: '15 EHC plans approaching 20-week deadline',
      description: 'Immediate action required to avoid statutory breaches',
      time: '2 hours ago'
    },
    {
      type: 'warning',
      title: 'Budget overspend in specialist placements',
      description: '£2.3M overspend in independent school placements',
      time: '4 hours ago'
    },
    {
      type: 'success',
      title: '23 assessments completed today',
      description: 'Ahead of weekly target by 15%',
      time: '6 hours ago'
    }
  ]

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-500 bg-red-50 text-red-800'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800'
      case 'success':
        return 'border-green-500 bg-green-50 text-green-800'
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800'
    }
  }

  const getMetricStyle = (status: string) => {
    switch (status) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-green-200 bg-green-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600 rounded-xl text-white">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LA Executive Command Center</h1>
              <p className="text-gray-600">Strategic oversight for Hertfordshire County Council</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
              Executive Access
            </Badge>
            <div className="text-right">
              <p className="font-semibold text-gray-900">Michael Thompson</p>
              <p className="text-sm text-gray-600">Children's Services Director</p>
            </div>
          </div>
        </div>

        {/* Market Opportunity Banner */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🚀 £1B+ Market Opportunity</h2>
              <p className="text-purple-100 mb-4">
                Leading the transformation of SEND services with the market's only comprehensive parent-controlled platform
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">576,000</div>
                  <div className="text-sm">EHC Plans Market</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">70%</div>
                  <div className="text-sm">Processing Efficiency</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">£50-150</div>
                  <div className="text-sm">Monthly Revenue/Parent</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">£2.8M</div>
                  <div className="text-sm">Annual Cost Savings</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Alerts */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Critical Alerts & Notifications</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="text-orange-700 border-orange-300">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${getAlertStyle(alert.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-sm opacity-80">{alert.description}</p>
                    </div>
                    <span className="text-xs opacity-60">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Executive Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {executiveMetrics.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <Card key={index} className={`${getMetricStyle(metric.status)} hover:shadow-lg transition-shadow`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <IconComponent className="h-8 w-8 text-gray-700" />
                    <Badge
                      variant={metric.status === 'warning' ? 'destructive' : 'default'}
                      className={metric.status === 'good' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">{metric.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Quick Actions</CardTitle>
            <CardDescription>Immediate actions and strategic decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-16 bg-red-600 hover:bg-red-700 text-white">
                <div className="text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm">Emergency Response</div>
                </div>
              </Button>
              <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
                <div className="text-center">
                  <BarChart3 className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm">Generate Report</div>
                </div>
              </Button>
              <Button className="h-16 bg-green-600 hover:bg-green-700 text-white">
                <div className="text-center">
                  <CheckCircle className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm">Approve Budget</div>
                </div>
              </Button>
              <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white">
                <div className="text-center">
                  <Settings className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm">Strategic Planning</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

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
