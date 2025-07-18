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
  Zap,
  Users,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Brain,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  Search,
  Filter,
  BarChart3,
  User,
  Calendar,
  Award,
  MessageSquare,
  Sparkles
} from "lucide-react"

export default function MatchingEngine() {
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [searchCriteria, setSearchCriteria] = useState({
    location: "",
    specialty: "",
    availability: "",
    budget: ""
  })

  const matchingResults = [
    {
      id: 1,
      professional: {
        name: "Dr. Sarah Thompson",
        specialty: "Child Psychology",
        experience: "15 years",
        location: "London, UK",
        rating: 4.9,
        photo: "/api/placeholder/60/60",
        hourlyRate: 120,
        nextAvailable: "2025-07-18",
        specializations: ["ASD", "ADHD", "Anxiety"]
      },
      matchScore: 95,
      matchFactors: {
        expertise: 98,
        location: 85,
        availability: 95,
        cost: 90,
        outcomes: 97
      },
      confidence: 92,
      reasoningPoints: [
        "Specialized expertise in Autism Spectrum Disorders",
        "Excellent location match within 5 miles",
        "Available for immediate consultation",
        "Strong historical outcomes for similar cases",
        "Cost within specified budget range"
      ]
    },
    {
      id: 2,
      professional: {
        name: "Dr. Michael Chen",
        specialty: "Speech Therapy",
        experience: "12 years",
        location: "Birmingham, UK",
        rating: 4.7,
        photo: "/api/placeholder/60/60",
        hourlyRate: 85,
        nextAvailable: "2025-07-20",
        specializations: ["Speech Delay", "Language Disorders"]
      },
      matchScore: 88,
      matchFactors: {
        expertise: 92,
        location: 75,
        availability: 88,
        cost: 95,
        outcomes: 89
      },
      confidence: 87,
      reasoningPoints: [
        "Strong speech therapy expertise",
        "Moderate distance, still accessible",
        "Available within preferred timeframe",
        "Excellent value for cost",
        "Good outcomes for communication goals"
      ]
    },
    {
      id: 3,
      professional: {
        name: "Lisa Rodriguez",
        specialty: "Occupational Therapy",
        experience: "10 years",
        location: "Manchester, UK",
        rating: 4.8,
        photo: "/api/placeholder/60/60",
        hourlyRate: 95,
        nextAvailable: "2025-07-19",
        specializations: ["Motor Skills", "Sensory Integration"]
      },
      matchScore: 82,
      matchFactors: {
        expertise: 88,
        location: 70,
        availability: 90,
        cost: 85,
        outcomes: 85
      },
      confidence: 80,
      reasoningPoints: [
        "Relevant occupational therapy skills",
        "Longer distance but manageable",
        "Good availability window",
        "Reasonable cost structure",
        "Solid track record for motor skills"
      ]
    }
  ]

  const algorithmSteps = [
    {
      step: 1,
      title: "Needs Assessment Analysis",
      description: "AI analyzes child's profile, assessment results, and family requirements",
      details: [
        "Child age and developmental stage",
        "Specific conditions and diagnoses",
        "Previous intervention history",
        "Family preferences and constraints",
        "Urgency and priority factors"
      ]
    },
    {
      step: 2,
      title: "Professional Pool Filtering",
      description: "Filter available professionals based on core criteria",
      details: [
        "Specialty alignment with needs",
        "Geographic accessibility",
        "Current availability",
        "Budget compatibility",
        "Qualification requirements"
      ]
    },
    {
      step: 3,
      title: "Multi-Factor Scoring",
      description: "Advanced scoring across multiple weighted dimensions",
      details: [
        "Expertise Match (30%)",
        "Geographic Proximity (20%)",
        "Availability Alignment (20%)",
        "Cost Compatibility (10%)",
        "Historical Outcomes (20%)"
      ]
    },
    {
      step: 4,
      title: "AI Optimization",
      description: "Machine learning refinement based on successful matches",
      details: [
        "Pattern recognition from past successes",
        "Outcome prediction modeling",
        "Preference learning from feedback",
        "Continuous algorithm improvement",
        "Bias detection and correction"
      ]
    }
  ]

  const successMetrics = [
    {
      metric: "Match Success Rate",
      value: "94%",
      description: "Percentage of matches leading to successful long-term partnerships",
      trend: "+5.2%"
    },
    {
      metric: "Average Match Quality",
      value: "4.7/5",
      description: "Average satisfaction rating from families and professionals",
      trend: "+0.3"
    },
    {
      metric: "Time to First Session",
      value: "3.2 days",
      description: "Average time from matching to first appointment",
      trend: "-0.8 days"
    },
    {
      metric: "Long-term Retention",
      value: "87%",
      description: "Percentage of matches continuing beyond 6 months",
      trend: "+7.1%"
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
                <h1 className="text-2xl font-bold text-purple-600">AI Matching Engine</h1>
                <p className="text-sm text-slate-600">Professional-Client Matching System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-600">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                New Match Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="results">Match Results</TabsTrigger>
            <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
            <TabsTrigger value="metrics">Success Metrics</TabsTrigger>
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
          </TabsList>

          {/* Match Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {/* Search Criteria */}
            <Card>
              <CardHeader>
                <CardTitle>Match Request: Emma Johnson</CardTitle>
                <CardDescription>8-year-old with Autism Spectrum Disorder seeking professional support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Primary Need</label>
                    <Badge variant="outline">Autism Support</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Badge variant="outline">London, UK</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Budget Range</label>
                    <Badge variant="outline">£80-150/hour</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Urgency</label>
                    <Badge variant="outline">High Priority</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Processing Status */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-800">AI Analysis Complete</h3>
                    <p className="text-purple-700 text-sm">
                      Processed 247 professionals • Applied 15 filters • Generated 3 optimal matches
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Match Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recommended Matches</h3>
              {matchingResults.map((match, idx) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold">{match.professional.name}</h4>
                          <Badge className="bg-purple-100 text-purple-600">
                            {match.matchScore}% Match
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{match.professional.rating}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600">Specialty</p>
                            <p className="font-medium">{match.professional.specialty}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Experience</p>
                            <p className="font-medium">{match.professional.experience}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Location</p>
                            <p className="font-medium">{match.professional.location}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-600 mb-2">Match Factors</p>
                            <div className="space-y-1">
                              {Object.entries(match.matchFactors).map(([factor, score]) => (
                                <div key={factor} className="flex items-center space-x-2">
                                  <span className="text-xs capitalize w-20">{factor}</span>
                                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                                    <div
                                      className="bg-purple-600 h-1.5 rounded-full"
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                  <span className="text-xs w-8">{score}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600 mb-2">AI Reasoning</p>
                            <div className="space-y-1">
                              {match.reasoningPoints.slice(0, 3).map((point, pointIdx) => (
                                <div key={pointIdx} className="flex items-start space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-xs text-slate-600">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>£{match.professional.hourlyRate}/hour</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Available {match.professional.nextAvailable}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{match.confidence}% Confidence</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button size="sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Algorithm Tab */}
          <TabsContent value="algorithm" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Matching Algorithm</CardTitle>
                <CardDescription>How our intelligent matching system works</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {algorithmSteps.map((step, idx) => (
                    <div key={step.step} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{step.title}</h4>
                        <p className="text-slate-600 mb-3">{step.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {step.details.map((detail, detailIdx) => (
                            <div key={detailIdx} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span className="text-sm text-slate-600">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Success Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {successMetrics.map((metric, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{metric.value}</p>
                        <p className="text-sm font-medium">{metric.metric}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        metric.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {metric.trend}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{metric.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Matching Performance Over Time</CardTitle>
                <CardDescription>System improvement and learning metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <p className="text-slate-600">Interactive performance charts coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Matching Demo</CardTitle>
                <CardDescription>Try the matching system with sample data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Child Profile</h4>
                    <div className="space-y-3">
                      <Input placeholder="Child's name" />
                      <Input placeholder="Age" type="number" />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Primary condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asd">Autism Spectrum Disorder</SelectItem>
                          <SelectItem value="adhd">ADHD</SelectItem>
                          <SelectItem value="speech">Speech Delay</SelectItem>
                          <SelectItem value="anxiety">Anxiety</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Preferences</h4>
                    <div className="space-y-3">
                      <Input placeholder="Location" />
                      <Input placeholder="Budget range" />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Urgency level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - Flexible timing</SelectItem>
                          <SelectItem value="medium">Medium - Within 2 weeks</SelectItem>
                          <SelectItem value="high">High - ASAP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button size="lg">
                    <Zap className="h-5 w-5 mr-2" />
                    Run AI Matching
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
