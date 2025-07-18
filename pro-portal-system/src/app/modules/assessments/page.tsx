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
  Stethoscope,
  GraduationCap,
  Heart,
  Eye,
  Ear,
  Activity,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Sparkles,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Play,
  Pause,
  FileText,
  Settings,
  Zap,
  Target,
  TrendingUp
} from "lucide-react"

export default function AssessmentTools() {
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const assessmentDomains = [
    {
      id: "speech",
      name: "Speech & Language Therapy",
      icon: <Ear className="h-6 w-6" />,
      color: "bg-blue-500",
      count: 12,
      description: "Communication and language development assessments"
    },
    {
      id: "occupational",
      name: "Occupational Therapy",
      icon: <Activity className="h-6 w-6" />,
      color: "bg-green-500",
      count: 8,
      description: "Motor skills and daily living assessments"
    },
    {
      id: "psychology",
      name: "Psychology",
      icon: <Brain className="h-6 w-6" />,
      color: "bg-purple-500",
      count: 15,
      description: "Cognitive and behavioral assessments"
    },
    {
      id: "education",
      name: "Educational",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "bg-yellow-500",
      count: 10,
      description: "Learning and academic skill assessments"
    },
    {
      id: "behavioral",
      name: "Behavioral Health",
      icon: <Heart className="h-6 w-6" />,
      color: "bg-red-500",
      count: 7,
      description: "Social and emotional development"
    },
    {
      id: "medical",
      name: "Medical & Physical",
      icon: <Stethoscope className="h-6 w-6" />,
      color: "bg-indigo-500",
      count: 6,
      description: "Physical health and development"
    }
  ]

  const featuredAssessments = [
    {
      id: "ados-2",
      name: "ADOS-2 (Autism Diagnostic Observation Schedule)",
      domain: "Psychology",
      type: "Diagnostic",
      duration: "45-60 minutes",
      ageRange: "12 months - Adult",
      aiFeatures: ["Automated scoring", "Video analysis", "Pattern recognition"],
      description: "Gold standard diagnostic tool for autism spectrum disorders",
      completions: 1247,
      rating: 4.8,
      status: "active",
      lastUsed: "2025-07-14"
    },
    {
      id: "wisc-v",
      name: "WISC-V (Wechsler Intelligence Scale)",
      domain: "Psychology",
      type: "Cognitive",
      duration: "65-80 minutes",
      ageRange: "6-16 years",
      aiFeatures: ["Adaptive testing", "Real-time analysis", "Performance prediction"],
      description: "Comprehensive cognitive ability assessment",
      completions: 892,
      rating: 4.9,
      status: "active",
      lastUsed: "2025-07-13"
    },
    {
      id: "peabody",
      name: "Peabody Picture Vocabulary Test",
      domain: "Speech & Language",
      type: "Language",
      duration: "10-15 minutes",
      ageRange: "2.5 - 90+ years",
      aiFeatures: ["Voice recognition", "Response analysis", "Progress tracking"],
      description: "Receptive vocabulary assessment",
      completions: 2156,
      rating: 4.6,
      status: "active",
      lastUsed: "2025-07-12"
    },
    {
      id: "beery-vmi",
      name: "Beery VMI (Visual-Motor Integration)",
      domain: "Occupational Therapy",
      type: "Motor Skills",
      duration: "15-20 minutes",
      ageRange: "2-100 years",
      aiFeatures: ["Drawing analysis", "Motor pattern detection", "Skill progression"],
      description: "Visual-motor integration assessment",
      completions: 654,
      rating: 4.7,
      status: "active",
      lastUsed: "2025-07-11"
    }
  ]

  const aiInsights = [
    {
      type: "recommendation",
      title: "Assessment Recommendation",
      message: "Based on recent client profiles, ADOS-2 assessments show 23% higher completion rates on Tuesday mornings.",
      priority: "medium"
    },
    {
      type: "pattern",
      title: "Pattern Detected",
      message: "Clients with similar profiles to Emma J. typically benefit from combined WISC-V and Beery VMI assessments.",
      priority: "high"
    },
    {
      type: "optimization",
      title: "Schedule Optimization",
      message: "Consider grouping shorter assessments (PPVT, Beery VMI) for maximum efficiency.",
      priority: "low"
    }
  ]

  const recentActivity = [
    {
      assessment: "ADOS-2",
      client: "Emma Johnson",
      professional: "Dr. Sarah Thompson",
      status: "completed",
      score: 4.2,
      date: "2025-07-14",
      aiInsights: 3
    },
    {
      assessment: "WISC-V",
      client: "Liam Smith",
      professional: "Dr. Michael Chen",
      status: "in-progress",
      score: null,
      date: "2025-07-14",
      aiInsights: 1
    },
    {
      assessment: "Peabody PPVT",
      client: "Sophie Chen",
      professional: "Lisa Rodriguez",
      status: "completed",
      score: 4.6,
      date: "2025-07-13",
      aiInsights: 2
    }
  ]

  const filteredAssessments = featuredAssessments.filter(assessment => {
    const matchesDomain = selectedDomain === "all" || assessment.domain.toLowerCase().includes(selectedDomain)
    const matchesSearch = assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesDomain && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Assessment Tools</h1>
                <p className="text-sm text-slate-600">AI-Powered Assessment Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assessments">All Assessments</TabsTrigger>
            <TabsTrigger value="ai-builder">AI Builder</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">58</p>
                      <p className="text-sm text-slate-600">Available Tools</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">1,247</p>
                      <p className="text-sm text-slate-600">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">23</p>
                      <p className="text-sm text-slate-600">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">4.7</p>
                      <p className="text-sm text-slate-600">Avg Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assessment Domains */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Domains</CardTitle>
                <CardDescription>Comprehensive tools across all therapeutic areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assessmentDomains.map((domain) => (
                    <div key={domain.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${domain.color} text-white`}>
                          {domain.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{domain.name}</h3>
                          <p className="text-xs text-slate-600">{domain.description}</p>
                          <p className="text-xs text-slate-500 mt-1">{domain.count} tools available</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-purple-600">AI Insights</CardTitle>
                </div>
                <CardDescription>Intelligent recommendations for your assessment practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded-full ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-600' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{insight.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Assessment Activity</CardTitle>
                <CardDescription>Latest assessments and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                        activity.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {activity.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm">{activity.assessment}</p>
                          <Badge variant="outline" className="text-xs">{activity.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-600">
                          {activity.client} • {activity.professional} • {activity.date}
                        </p>
                      </div>
                      <div className="text-right">
                        {activity.score && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{activity.score}</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-500">{activity.aiInsights} AI insights</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="psychology">Psychology</SelectItem>
                  <SelectItem value="speech">Speech & Language</SelectItem>
                  <SelectItem value="occupational">Occupational Therapy</SelectItem>
                  <SelectItem value="education">Educational</SelectItem>
                  <SelectItem value="behavioral">Behavioral Health</SelectItem>
                  <SelectItem value="medical">Medical & Physical</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{assessment.name}</CardTitle>
                        <CardDescription>{assessment.domain} • {assessment.type}</CardDescription>
                      </div>
                      <Badge variant={assessment.status === 'active' ? 'default' : 'secondary'}>
                        {assessment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-700">{assessment.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Duration</p>
                        <p className="font-medium">{assessment.duration}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Age Range</p>
                        <p className="font-medium">{assessment.ageRange}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-600 text-sm mb-2">AI Features</p>
                      <div className="flex flex-wrap gap-1">
                        {assessment.aiFeatures.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{assessment.rating}</span>
                        <span className="text-slate-500">({assessment.completions})</span>
                      </div>
                      <span className="text-slate-500">Last used: {assessment.lastUsed}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Start Assessment
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Builder Tab */}
          <TabsContent value="ai-builder" className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-purple-600">AI Assessment Builder</CardTitle>
                </div>
                <CardDescription>Create custom assessments powered by artificial intelligence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Build Custom Assessments with AI</h3>
                  <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                    Our AI assistant can help you create tailored assessments based on client needs,
                    research-backed methodologies, and your professional expertise. Simply describe
                    your requirements and let AI generate a comprehensive assessment framework.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button size="lg">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Start AI Builder
                    </Button>
                    <Button variant="outline" size="lg">
                      <FileText className="h-5 w-5 mr-2" />
                      View Templates
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center p-6 bg-slate-50 rounded-lg">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Define Objectives</h4>
                    <p className="text-sm text-slate-600">Specify assessment goals and target skills</p>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-lg">
                    <Brain className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">AI Generation</h4>
                    <p className="text-sm text-slate-600">AI creates questions and scoring criteria</p>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Review & Deploy</h4>
                    <p className="text-sm text-slate-600">Customize and activate your assessment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Performance</CardTitle>
                  <CardDescription>Usage statistics and trends</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Interactive analytics dashboard coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outcome Tracking</CardTitle>
                  <CardDescription>Client progress and success metrics</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-slate-600">Outcome analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Library</CardTitle>
                <CardDescription>Browse and download assessment resources</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <p className="text-slate-600">Resource library coming soon</p>
                  <Button className="mt-4">
                    <Download className="h-4 w-4 mr-2" />
                    Browse Resources
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
