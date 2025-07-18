'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Search,
  MapPin,
  Star,
  Brain,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Target,
  Zap,
  Eye,
  BarChart3,
  Filter,
  Map,
  Calendar,
  Award,
  Heart,
  CheckCircle2,
  AlertCircle,
  School,
  Sparkles,
  Globe,
  Database,
  Cpu,
  Activity,
  PieChart,
  LineChart,
  Settings
} from 'lucide-react';

export default function SchoolIntelligencePage() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchRadius, setSearchRadius] = useState([10]);
  const [selectedSchool, setSelectedSchool] = useState(null);

  // Mock data for the revolutionary platform
  const nationalStats = {
    totalSchools: 24372,
    localAuthorities: 152,
    totalSendStudents: 2100000,
    aiMatches: 847632,
    successRate: 94.7,
    averageMatchAccuracy: 96.3
  };

  const schoolMatches = [
    {
      id: 1,
      name: 'Oakwood Academy',
      type: 'Academy',
      distance: 1.2,
      matchScore: 98,
      autismSpecialism: true,
      sencoRating: 4.9,
      ofstedRating: 'Outstanding',
      sendRegister: 45,
      capacity: 420,
      availability: 'Available',
      waitingList: 0,
      transport: 'Direct bus route',
      strengths: ['ASD provision', 'Sensory room', 'Specialist staff'],
      outcomes: {
        progress8: 0.7,
        sendProgress: 0.9,
        parentSatisfaction: 4.8
      },
      virtualTour: true,
      nextOpenDay: '2025-01-15'
    },
    {
      id: 2,
      name: 'Riverside Primary School',
      type: 'Community School',
      distance: 2.1,
      matchScore: 94,
      autismSpecialism: false,
      sencoRating: 4.6,
      ofstedRating: 'Good',
      sendRegister: 28,
      capacity: 350,
      availability: 'Waiting List',
      waitingList: 3,
      transport: '15 min walk',
      strengths: ['Inclusive culture', 'Small classes', 'Family support'],
      outcomes: {
        progress8: 0.4,
        sendProgress: 0.7,
        parentSatisfaction: 4.5
      },
      virtualTour: true,
      nextOpenDay: '2025-01-22'
    },
    {
      id: 3,
      name: 'St. Mary\'s Special School',
      type: 'Special School',
      distance: 4.8,
      matchScore: 96,
      autismSpecialism: true,
      sencoRating: 4.8,
      ofstedRating: 'Outstanding',
      sendRegister: 120,
      capacity: 125,
      availability: 'Limited',
      waitingList: 8,
      transport: 'School transport',
      strengths: ['ASD expertise', 'Therapeutic support', 'Transition planning'],
      outcomes: {
        progress8: null,
        sendProgress: 0.95,
        parentSatisfaction: 4.9
      },
      virtualTour: true,
      nextOpenDay: '2025-02-05'
    }
  ];

  const laData = [
    {
      name: 'Birmingham',
      schools: 892,
      sendStudents: 14200,
      capacity: 89,
      performance: 'Good',
      trend: 'improving'
    },
    {
      name: 'Manchester',
      schools: 567,
      sendStudents: 8900,
      capacity: 94,
      performance: 'Outstanding',
      trend: 'stable'
    },
    {
      name: 'Leeds',
      schools: 445,
      sendStudents: 9800,
      capacity: 87,
      performance: 'Good',
      trend: 'improving'
    }
  ];

  const aiInsights = [
    {
      type: 'prediction',
      title: 'Optimal School Match Found',
      content: 'Based on your child\'s EHC plan, Oakwood Academy shows 98% compatibility with 94% predicted success rate.',
      confidence: 98,
      action: 'Schedule visit'
    },
    {
      type: 'capacity',
      title: 'Limited Availability Alert',
      content: '3 of your top matches have limited places. Early application recommended for September 2025.',
      confidence: 92,
      action: 'Apply now'
    },
    {
      type: 'transport',
      title: 'Transport Optimization',
      content: 'Alternative route via Meadowbrook saves 15 minutes daily and reduces annual cost by £450.',
      confidence: 87,
      action: 'View options'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Database className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">School Intelligence Platform</h1>
                <p className="text-sm text-gray-600">Revolutionary AI-Powered School Selection & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <Globe className="h-3 w-3 mr-1" />
                £2.5B Market
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <Cpu className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* National Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Schools</p>
                  <p className="text-2xl font-bold">{nationalStats.totalSchools.toLocaleString()}</p>
                </div>
                <School className="h-6 w-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Local Authorities</p>
                  <p className="text-2xl font-bold">{nationalStats.localAuthorities}</p>
                </div>
                <Building2 className="h-6 w-6 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">SEND Students</p>
                  <p className="text-2xl font-bold">{(nationalStats.totalSendStudents / 1000000).toFixed(1)}M</p>
                </div>
                <Users className="h-6 w-6 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">AI Matches</p>
                  <p className="text-2xl font-bold">{(nationalStats.aiMatches / 1000).toFixed(0)}K</p>
                </div>
                <Brain className="h-6 w-6 text-amber-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold">{nationalStats.successRate}%</p>
                </div>
                <Target className="h-6 w-6 text-rose-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Match Accuracy</p>
                  <p className="text-2xl font-bold">{nationalStats.averageMatchAccuracy}%</p>
                </div>
                <Zap className="h-6 w-6 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="search">AI School Search</TabsTrigger>
            <TabsTrigger value="analytics">LA Analytics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
            <TabsTrigger value="government">Government Intelligence</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="space-y-6">
              {/* Search Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <span>AI-Powered School Matching</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Revolutionary
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Find the perfect school for your child using our AI analysis of 24,372 schools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Enter your postcode or area..."
                          className="pl-10"
                        />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Search Radius: {searchRadius[0]} miles</label>
                          <Slider
                            value={searchRadius}
                            onValueChange={setSearchRadius}
                            max={25}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Child's Age</label>
                            <Input placeholder="e.g. 7" />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Primary Need</label>
                            <Input placeholder="e.g. Autism" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-purple-600" />
                        AI Matching Power
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          EHC plan analysis & matching
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Real-time capacity tracking
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Success outcome prediction
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Transport optimization
                        </li>
                      </ul>
                      <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600">
                        <Brain className="h-4 w-4 mr-2" />
                        Start AI Search
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search Results */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {schoolMatches.map((school) => (
                  <Card key={school.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{school.name}</CardTitle>
                          <CardDescription>{school.type} • {school.distance} miles</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded text-sm font-bold">
                            {school.matchScore}% Match
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{school.ofstedRating}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">SEND Register:</span>
                            <span className="ml-2 font-medium">{school.sendRegister}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Capacity:</span>
                            <span className="ml-2 font-medium">{school.capacity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">SENCO Rating:</span>
                            <div className="flex items-center ml-2">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="ml-1 font-medium">{school.sencoRating}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Availability:</span>
                            <Badge
                              variant={school.availability === 'Available' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {school.availability}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Strengths:</p>
                          <div className="flex flex-wrap gap-1">
                            {school.strengths.map((strength, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Outcomes:</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>SEND Progress:</span>
                              <span className="font-medium">{(school.outcomes.sendProgress * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={school.outcomes.sendProgress * 100} className="h-1" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Virtual Tour
                          </Button>
                          <Button size="sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            Book Visit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <span>Local Authority Intelligence Dashboard</span>
                  </CardTitle>
                  <CardDescription>
                    Strategic planning and performance analytics across all 152 Local Authorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {laData.map((la, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-3">{la.name} City Council</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Schools:</span>
                              <span className="font-medium">{la.schools}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">SEND Students:</span>
                              <span className="font-medium">{la.sendStudents.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Capacity Utilization:</span>
                              <span className="font-medium">{la.capacity}%</span>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-600">Performance:</span>
                                <Badge variant={la.performance === 'Outstanding' ? 'default' : 'secondary'}>
                                  {la.performance}
                                </Badge>
                              </div>
                              <Progress value={la.capacity} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Trend:</span>
                              <div className="flex items-center">
                                <TrendingUp className={`h-4 w-4 mr-1 ${la.trend === 'improving' ? 'text-green-600' : 'text-blue-600'}`} />
                                <span className="text-sm font-medium capitalize">{la.trend}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">National Capacity Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Mainstream Schools</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={87} className="h-2 w-24" />
                          <span className="text-sm font-medium">87%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Special Schools</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={94} className="h-2 w-24" />
                          <span className="text-sm font-medium">94%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Alternative Provision</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={78} className="h-2 w-24" />
                          <span className="text-sm font-medium">78%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Regional Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>London</span>
                        <Badge className="bg-green-100 text-green-800">Outstanding</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>North West</span>
                        <Badge variant="secondary">Good</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Yorkshire</span>
                        <Badge variant="secondary">Good</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>West Midlands</span>
                        <Badge className="bg-green-100 text-green-800">Outstanding</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <span>AI-Powered Intelligence Insights</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Real-time
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Advanced AI analysis providing actionable insights for optimal decision making
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant={insight.type === 'prediction' ? 'default' : 'secondary'}>
                            {insight.type}
                          </Badge>
                          <span className="text-sm text-gray-600">{insight.confidence}% confidence</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
                        <p className="text-sm text-gray-700 mb-3">{insight.content}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          {insight.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Predictive Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Demand Forecasting</h4>
                        <p className="text-sm text-blue-700">15% increase in SEND applications predicted for September 2025</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-1">Capacity Optimization</h4>
                        <p className="text-sm text-green-700">3 schools identified for expansion to meet growing demand</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <h4 className="font-medium text-amber-900 mb-1">Transport Efficiency</h4>
                        <p className="text-sm text-amber-700">Route optimization could save £2.3M annually across region</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Success Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Match Accuracy</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={96} className="h-2 w-24" />
                          <span className="text-sm font-medium">96.3%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Parent Satisfaction</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={94} className="h-2 w-24" />
                          <span className="text-sm font-medium">94.7%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Placement Success</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={91} className="h-2 w-24" />
                          <span className="text-sm font-medium">91.2%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="capacity">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-6 w-6 text-green-600" />
                    <span>Real-Time Capacity Planning</span>
                  </CardTitle>
                  <CardDescription>
                    Live capacity tracking and predictive planning across all school types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-green-800 mb-2">Available Now</h3>
                        <p className="text-2xl font-bold text-green-600">2,847</p>
                        <p className="text-sm text-gray-600">SEND places across all schools</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-amber-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-amber-800 mb-2">Limited Availability</h3>
                        <p className="text-2xl font-bold text-amber-600">1,234</p>
                        <p className="text-sm text-gray-600">Places with waiting lists</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-red-800 mb-2">High Demand</h3>
                        <p className="text-2xl font-bold text-red-600">456</p>
                        <p className="text-sm text-gray-600">Schools at full capacity</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-900 mb-3">Regional Capacity Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">87%</p>
                        <p className="text-xs text-gray-600">London Average</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">76%</p>
                        <p className="text-xs text-gray-600">North West</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-600">91%</p>
                        <p className="text-xs text-gray-600">South East</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">83%</p>
                        <p className="text-xs text-gray-600">National Average</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="government">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-6 w-6 text-indigo-600" />
                    <span>Government Intelligence Platform</span>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      <Award className="h-3 w-3 mr-1" />
                      National Level
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    National trends analysis and policy support for strategic planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 text-center bg-indigo-50">
                      <PieChart className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                      <h3 className="font-semibold">Policy Impact</h3>
                      <p className="text-2xl font-bold text-indigo-600">94%</p>
                      <p className="text-xs text-gray-600">Compliance tracking</p>
                    </Card>
                    <Card className="p-4 text-center bg-green-50">
                      <LineChart className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">National Trends</h3>
                      <p className="text-2xl font-bold text-green-600">+12%</p>
                      <p className="text-xs text-gray-600">SEND identification</p>
                    </Card>
                    <Card className="p-4 text-center bg-purple-50">
                      <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-semibold">Resource Planning</h3>
                      <p className="text-2xl font-bold text-purple-600">£2.3B</p>
                      <p className="text-xs text-gray-600">Optimization potential</p>
                    </Card>
                    <Card className="p-4 text-center bg-amber-50">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                      <h3 className="font-semibold">Performance</h3>
                      <p className="text-2xl font-bold text-amber-600">89%</p>
                      <p className="text-xs text-gray-600">Improvement rate</p>
                    </Card>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-900 mb-3">National Strategic Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-indigo-900 mb-2">Infrastructure Planning</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• 15 new special schools recommended by 2027</li>
                          <li>• Resource base expansion in 45 LAs needed</li>
                          <li>• Transport network optimization saves £180M</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-900 mb-2">Policy Recommendations</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>• Early intervention funding increase by 25%</li>
                          <li>• Mainstream inclusion support enhancement</li>
                          <li>• Professional development investment priority</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
