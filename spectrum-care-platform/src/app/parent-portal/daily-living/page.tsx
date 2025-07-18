'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Home,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Users,
  Settings,
  Plus,
  Eye,
  Edit,
  Target,
  Activity,
  Heart,
  Star,
  Lightbulb,
  ArrowLeft,
  Timer,
  Zap,
  Award,
  LineChart,
  PieChart,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  Volume2,
  Shield,
  Palette,
  Globe
} from 'lucide-react';

interface DailyLivingData {
  systemStatus: any;
  currentMetrics: any;
  activeRoutines: any[];
  skillProgress: any[];
  recentInsights: any[];
  familyCoordination: any;
  weeklyHighlights: any[];
  environmentalOptimization: any;
  upcomingMilestones: any[];
}

interface RoutineData {
  routines: any[];
  analytics: any;
  recommendations: any[];
}

interface SkillData {
  skillCategories: any[];
  overallProgress: any;
  progressAnalytics: any;
  upcomingMilestones: any[];
}

interface BehaviorData {
  summary: any;
  behaviorCategories: any;
  timePatterns: any;
  environmentalFactors: any[];
  triggerAnalysis: any;
  interventionEffectiveness: any[];
  predictiveInsights: any[];
  weeklyProgress: any[];
}

interface QualityOfLifeData {
  currentAssessment: any;
  historicalTrends: any[];
  familyPerspective: any;
  childPerspective: any;
  professionalAssessment: any;
  impactFactors: any;
  goalOutcomes: any;
}

export default function DailyLivingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [overviewData, setOverviewData] = useState<DailyLivingData | null>(null);
  const [routinesData, setRoutinesData] = useState<RoutineData | null>(null);
  const [skillsData, setSkillsData] = useState<SkillData | null>(null);
  const [behaviorData, setBehaviorData] = useState<BehaviorData | null>(null);
  const [qualityData, setQualityData] = useState<QualityOfLifeData | null>(null);

  // Dialog states
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);
  const [showTrackSkill, setShowTrackSkill] = useState(false);
  const [showLogBehavior, setShowLogBehavior] = useState(false);
  const [showQualityAssessment, setShowQualityAssessment] = useState(false);

  useEffect(() => {
    loadDailyLivingData();
  }, []);

  const loadDailyLivingData = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem('authToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load all data in parallel
      const [overviewRes, routinesRes, skillsRes, behaviorRes, qualityRes] = await Promise.all([
        fetch('/api/parent-portal/daily-living?type=overview', { headers }),
        fetch('/api/parent-portal/daily-living?type=routines', { headers }),
        fetch('/api/parent-portal/daily-living?type=skills', { headers }),
        fetch('/api/parent-portal/daily-living?type=behavior-patterns', { headers }),
        fetch('/api/parent-portal/daily-living?type=quality-of-life', { headers })
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverviewData(data.data);
      }

      if (routinesRes.ok) {
        const data = await routinesRes.json();
        setRoutinesData(data.data);
      }

      if (skillsRes.ok) {
        const data = await skillsRes.json();
        setSkillsData(data.data);
      }

      if (behaviorRes.ok) {
        const data = await behaviorRes.json();
        setBehaviorData(data.data);
      }

      if (qualityRes.ok) {
        const data = await qualityRes.json();
        setQualityData(data.data);
      }

    } catch (error) {
      console.error('Failed to load daily living data:', error);
      setError('Failed to load daily living data');
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800';
      case 'optimizing': return 'bg-blue-100 text-blue-800';
      case 'needs-attention': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading Daily Living Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Daily Living Management</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800">
                Quality Score: {overviewData?.currentMetrics?.qualityOfLife || 'N/A'}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {overviewData?.currentMetrics?.independenceLevel || 'Loading...'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overviewData?.currentMetrics?.overallProgress || 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Routine Consistency</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overviewData?.currentMetrics?.routineConsistency || 0}%
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Skill Mastery</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overviewData?.currentMetrics?.skillMastery || 0}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quality of Life</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {overviewData?.currentMetrics?.qualityOfLife || 0}/10
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="routines">Routines</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="quality">Quality of Life</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Routines */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Active Routines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {overviewData?.activeRoutines?.map((routine: any) => (
                        <div key={routine.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{routine.name}</h4>
                            <Badge className={getStatusBadgeColor(routine.status)}>
                              {routine.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Consistency: {routine.consistency}%</span>
                            <span>{routine.category}</span>
                          </div>
                          <Progress value={routine.consistency} className="mt-2" />
                          <div className="flex flex-wrap gap-1 mt-2">
                            {routine.adaptations?.map((adaptation: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {adaptation}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Highlights */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-600" />
                      Weekly Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {overviewData?.weeklyHighlights?.map((highlight: any, index: number) => (
                        <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-800">{highlight.area}</h5>
                          <p className="text-sm text-green-700 mt-1">{highlight.achievement}</p>
                          <p className="text-xs text-green-600 mt-2">{highlight.impact}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Skill Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-purple-600" />
                  Skill Development Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {overviewData?.skillProgress?.map((skill: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{skill.skillName}</h5>
                        <Badge variant="outline">{skill.category}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Current: {skill.currentLevel}</span>
                          <span>Target: {skill.targetLevel}</span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                        <p className="text-xs text-gray-600">{skill.nextMilestone}</p>
                        <p className="text-xs text-blue-600">Est: {skill.estimatedCompletion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                  AI-Powered Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overviewData?.recentInsights?.map((insight: any, index: number) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {insight.type}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-blue-900 mb-2">{insight.insight}</p>
                          <p className="text-sm text-blue-700">{insight.actionable}</p>
                        </div>
                        <Badge
                          className={
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-green-600" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {overviewData?.upcomingMilestones?.map((milestone: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h5 className="font-medium text-sm mb-2">{milestone.skill}</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Target: {milestone.targetDate}</span>
                          <Badge className={
                            milestone.confidence === 'high' ? 'bg-green-100 text-green-800' :
                            milestone.confidence === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {milestone.confidence}
                          </Badge>
                        </div>
                        <Progress value={milestone.progress} className="h-2" />
                        <p className="text-xs text-gray-600">{milestone.progress}% complete</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routines Tab */}
          <TabsContent value="routines" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Daily Routines</h2>
              <Dialog open={showCreateRoutine} onOpenChange={setShowCreateRoutine}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Routine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Daily Routine</DialogTitle>
                    <DialogDescription>
                      Set up a new routine with activities, timing, and sensory considerations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Routine Name</Label>
                        <Input placeholder="e.g., Morning Independence Routine" />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            <SelectItem value="bedtime">Bedtime</SelectItem>
                            <SelectItem value="meal">Meal</SelectItem>
                            <SelectItem value="therapy">Therapy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Time</Label>
                        <Input type="time" />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input type="time" />
                      </div>
                    </div>
                    <div>
                      <Label>Goals</Label>
                      <Textarea placeholder="Enter routine goals..." />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCreateRoutine(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setShowCreateRoutine(false)}>
                        Create Routine
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {routinesData && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{routinesData.analytics?.totalRoutines || 0}</p>
                    <p className="text-sm text-gray-600">Total Routines</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">{Math.round(routinesData.analytics?.averageConsistency || 0)}%</p>
                    <p className="text-sm text-gray-600">Avg Consistency</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold">{routinesData.analytics?.highPerformingRoutines || 0}</p>
                    <p className="text-sm text-gray-600">High Performing</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold">{routinesData.analytics?.needsAttentionRoutines || 0}</p>
                    <p className="text-sm text-gray-600">Need Attention</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Routine Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {routinesData?.routines?.map((routine: any) => (
                    <div key={routine.id} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium">{routine.name}</h3>
                          <p className="text-sm text-gray-600">{routine.category} • {routine.schedule.startTime} - {routine.schedule.endTime}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusBadgeColor(routine.performance?.consistency > 85 ? 'on-track' : 'needs-attention')}>
                            {routine.performance?.consistency}% consistency
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Independence</p>
                          <p className="text-xl font-bold text-blue-600">{routine.performance?.independenceLevel || 0}%</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Time Efficiency</p>
                          <p className="text-xl font-bold text-green-600">{routine.performance?.timeEfficiency || 0}%</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Stress Level</p>
                          <p className="text-xl font-bold text-orange-600">{routine.performance?.stressLevel || 0}/10</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">Family Satisfaction</p>
                          <p className="text-xl font-bold text-purple-600">{routine.performance?.familySatisfaction || 0}/10</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Activities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {routine.activities?.map((activity: any, index: number) => (
                            <div key={index} className="p-3 border rounded">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-sm">{activity.name}</h5>
                                <span className="text-xs text-gray-500">{activity.duration} min</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-600">Support: {activity.supportLevel}</p>
                                <div className="flex flex-wrap gap-1">
                                  {activity.sensoryConsiderations?.slice(0, 2).map((consideration: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {consideration}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {routine.challenges && routine.challenges.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Current Challenges</h4>
                          <div className="space-y-2">
                            {routine.challenges.map((challenge: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                                <p className="text-sm text-gray-700">{challenge}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {routine.supportStrategies && routine.supportStrategies.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Support Strategies</h4>
                          <div className="space-y-2">
                            {routine.supportStrategies.map((strategy: string, index: number) => (
                              <div key={index} className="flex items-start space-x-2">
                                <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                                <p className="text-sm text-gray-700">{strategy}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Skill Development</h2>
              <Dialog open={showTrackSkill} onOpenChange={setShowTrackSkill}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Track New Skill
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Track New Skill</DialogTitle>
                    <DialogDescription>
                      Add a new skill to track progress and milestones
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Skill Name</Label>
                      <Input placeholder="e.g., Independent Tooth Brushing" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="self-care">Self-care</SelectItem>
                            <SelectItem value="communication">Communication</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="life-skills">Life Skills</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Current Level</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emerging">Emerging</SelectItem>
                            <SelectItem value="developing">Developing</SelectItem>
                            <SelectItem value="proficient">Proficient</SelectItem>
                            <SelectItem value="mastered">Mastered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowTrackSkill(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setShowTrackSkill(false)}>
                        Start Tracking
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {skillsData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold">{skillsData.overallProgress?.totalSkills || 0}</p>
                    <p className="text-sm text-gray-600">Total Skills</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">{skillsData.overallProgress?.masteredSkills || 0}</p>
                    <p className="text-sm text-gray-600">Mastered</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{skillsData.overallProgress?.developingSkills || 0}</p>
                    <p className="text-sm text-gray-600">Developing</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold">{skillsData.overallProgress?.averageProgress || 0}%</p>
                    <p className="text-sm text-gray-600">Avg Progress</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="space-y-6">
              {skillsData?.skillCategories?.map((category: any) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle className="capitalize">{category.category} Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {category.skills?.map((skill: any) => (
                        <div key={skill.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-medium">{skill.skillName}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline">{skill.currentLevel}</Badge>
                                <span className="text-sm text-gray-500">→</span>
                                <Badge>{skill.targetLevel}</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{skill.progress}%</p>
                              <p className="text-xs text-gray-500">Progress</p>
                            </div>
                          </div>

                          <Progress value={skill.progress} className="mb-4" />

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Milestones</h4>
                              <div className="space-y-2">
                                {skill.milestones?.map((milestone: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-3">
                                    {milestone.achieved ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-gray-400" />
                                    )}
                                    <div className="flex-1">
                                      <p className={`text-sm ${milestone.achieved ? 'text-green-700' : 'text-gray-700'}`}>
                                        {milestone.description}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Target: {milestone.targetDate}
                                        {milestone.achieved && milestone.achievedDate && (
                                          <span className="text-green-600 ml-2">
                                            ✓ Achieved: {milestone.achievedDate}
                                          </span>
                                        )}
                                      </p>
                                      {milestone.evidence && (
                                        <p className="text-xs text-blue-600 mt-1">{milestone.evidence}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {skill.supportStrategies && skill.supportStrategies.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Support Strategies</h4>
                                <div className="flex flex-wrap gap-2">
                                  {skill.supportStrategies.map((strategy: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {strategy}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Practice Schedule</h5>
                                <div className="text-sm text-gray-600">
                                  <p>Frequency: {skill.practiceSchedule?.frequency}</p>
                                  <p>Duration: {skill.practiceSchedule?.duration} minutes</p>
                                </div>
                              </div>
                              {skill.progressHistory && skill.progressHistory.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">Recent Progress</h5>
                                  <div className="text-sm text-gray-600">
                                    <p>Latest: {skill.progressHistory[skill.progressHistory.length - 1]?.score}%</p>
                                    <p>Level: {skill.progressHistory[skill.progressHistory.length - 1]?.level}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Behavior Patterns</h2>
              <Dialog open={showLogBehavior} onOpenChange={setShowLogBehavior}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Behavior
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Behavior Observation</DialogTitle>
                    <DialogDescription>
                      Record a behavior observation to help identify patterns
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Behavior Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="challenging">Challenging</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Intensity (1-10)</Label>
                        <Input type="number" min="1" max="10" />
                      </div>
                    </div>
                    <div>
                      <Label>Activity/Context</Label>
                      <Input placeholder="What was happening?" />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea placeholder="Additional observations..." />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowLogBehavior(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setShowLogBehavior(false)}>
                        Log Behavior
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {behaviorData && (
              <>
                {/* Behavior Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{behaviorData.summary?.totalObservations || 0}</p>
                      <p className="text-sm text-gray-600">Total Observations</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <ThumbsUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">{behaviorData.behaviorCategories?.positive?.percentage?.toFixed(1) || 0}%</p>
                      <p className="text-sm text-gray-600">Positive Behaviors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-2xl font-bold">{behaviorData.behaviorCategories?.challenging?.percentage?.toFixed(1) || 0}%</p>
                      <p className="text-sm text-gray-600">Challenging Behaviors</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">{behaviorData.summary?.predictiveAccuracy || 0}%</p>
                      <p className="text-sm text-gray-600">Prediction Accuracy</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Time Patterns */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Time Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3 text-green-700">Best Performance Times</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {behaviorData.timePatterns?.bestTimes?.map((time: any, index: number) => (
                            <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-green-800">{time.time}</span>
                                <Badge className="bg-green-100 text-green-800">{time.positiveRate}%</Badge>
                              </div>
                              <p className="text-sm text-green-700">{time.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 text-orange-700">Challenging Times</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {behaviorData.timePatterns?.challengingTimes?.map((time: any, index: number) => (
                            <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-orange-800">{time.time}</span>
                                <Badge className="bg-orange-100 text-orange-800">{time.challengingRate}%</Badge>
                              </div>
                              <p className="text-sm text-orange-700">{time.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trigger Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Trigger Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {behaviorData.triggerAnalysis?.primaryTriggers?.map((trigger: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{trigger.trigger}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">Frequency: {trigger.frequency}</Badge>
                              <Badge variant="outline">Intensity: {trigger.intensity}/10</Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-sm mb-2">Interventions</h5>
                              <div className="space-y-1">
                                {trigger.interventions?.map((intervention: string, i: number) => (
                                  <div key={i} className="flex items-center space-x-2">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    <span className="text-sm text-gray-700">{intervention}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm mb-2">Effectiveness</h5>
                              <div className="flex items-center space-x-2">
                                <Progress value={trigger.effectiveness} className="flex-1" />
                                <span className="text-sm font-medium">{trigger.effectiveness}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Predictive Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-purple-600" />
                      AI Predictive Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {behaviorData.predictiveInsights?.map((insight: any, index: number) => (
                        <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm text-purple-900 mb-2">{insight.pattern}</p>
                              <p className="text-sm text-purple-700">{insight.recommendation}</p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Quality of Life Tab */}
          <TabsContent value="quality" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Quality of Life Assessment</h2>
              <Dialog open={showQualityAssessment} onOpenChange={setShowQualityAssessment}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Quality of Life Assessment</DialogTitle>
                    <DialogDescription>
                      Evaluate overall wellbeing across key life domains
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Physical Health (1-10)</Label>
                        <Input type="number" min="1" max="10" />
                      </div>
                      <div>
                        <Label>Mental Wellbeing (1-10)</Label>
                        <Input type="number" min="1" max="10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Social Connections (1-10)</Label>
                        <Input type="number" min="1" max="10" />
                      </div>
                      <div>
                        <Label>Independence (1-10)</Label>
                        <Input type="number" min="1" max="10" />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea placeholder="Any additional observations..." />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowQualityAssessment(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setShowQualityAssessment(false)}>
                        Complete Assessment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {qualityData && (
              <>
                {/* Current Assessment Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Current Quality of Life Score</span>
                      <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                        {qualityData.currentAssessment?.overallScore}/10
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(qualityData.currentAssessment?.domains || {}).map(([domain, data]: [string, any]) => (
                        <div key={domain} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{domain.replace(/([A-Z])/g, ' $1')}</h4>
                            <div className="flex items-center space-x-1">
                              <span className="text-lg font-bold">{data.score}</span>
                              <span className="text-sm text-gray-500">/10</span>
                            </div>
                          </div>
                          <Progress value={data.score * 10} className="mb-3" />
                          <div className="space-y-1">
                            {data.factors?.slice(0, 2).map((factor: string, index: number) => (
                              <div key={index} className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-gray-600">{factor}</span>
                              </div>
                            ))}
                          </div>
                          {data.notes && (
                            <p className="text-xs text-blue-600 mt-2">{data.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Historical Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quality of Life Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {qualityData.historicalTrends?.map((trend: any, index: number) => (
                          <div key={index} className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">{trend.date}</p>
                            <p className="text-xl font-bold">{trend.overallScore}</p>
                            <Badge className={
                              trend.trend === 'improving' ? 'bg-green-100 text-green-800' :
                              trend.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                              'bg-orange-100 text-orange-800'
                            }>
                              {trend.trend}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Multiple Perspectives */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        Family Perspective
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Parent Satisfaction</span>
                          <span className="font-medium">{qualityData.familyPerspective?.parentSatisfaction}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Family Stress</span>
                          <span className="font-medium">{qualityData.familyPerspective?.familyStress}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Hope for Future</span>
                          <span className="font-medium">{qualityData.familyPerspective?.hopeForFuture}/10</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Smile className="h-5 w-5 mr-2 text-green-600" />
                        Child Perspective
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Happiness Rating</span>
                          <span className="font-medium">{qualityData.childPerspective?.happinessRating}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">School Enjoyment</span>
                          <span className="font-medium">{qualityData.childPerspective?.schoolEnjoyment}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Confidence Level</span>
                          <span className="font-medium">{qualityData.childPerspective?.confidenceLevel}/10</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-purple-600" />
                        Professional Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Functional Progress</span>
                          <span className="font-medium">{qualityData.professionalAssessment?.functionalProgress}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Goal Attainment</span>
                          <span className="font-medium">{qualityData.professionalAssessment?.goalAttainment}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Outcome Optimism</span>
                          <span className="font-medium">{qualityData.professionalAssessment?.outcomeOptimism}/10</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Improvement Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Improvement Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {qualityData.currentAssessment?.improvementPlan?.map((plan: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{plan.area}</h4>
                            <Badge variant="outline">{plan.timeline}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{plan.strategy}</p>
                          <p className="text-xs text-blue-600">Responsible: {plan.responsible}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Advanced Analytics & Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <LineChart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-sm text-gray-600">Routine Consistency</p>
                  <p className="text-xs text-green-600 mt-1">+3% this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <PieChart className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">67%</p>
                  <p className="text-sm text-gray-600">Skill Mastery</p>
                  <p className="text-xs text-green-600 mt-1">+2% this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">79%</p>
                  <p className="text-sm text-gray-600">Behavior Stability</p>
                  <p className="text-xs text-green-600 mt-1">+5% this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">8.7</p>
                  <p className="text-sm text-gray-600">Family Satisfaction</p>
                  <p className="text-xs text-green-600 mt-1">+0.1 this week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Correlations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Sensory Break Frequency ↔ Positive Behavior Rate</h4>
                      <Badge className="bg-blue-100 text-blue-800">89% correlation</Badge>
                    </div>
                    <p className="text-sm text-blue-700">More frequent sensory breaks strongly predict better behavior</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Visual Schedule Use ↔ Task Completion Rate</h4>
                      <Badge className="bg-green-100 text-green-800">82% correlation</Badge>
                    </div>
                    <p className="text-sm text-green-700">Visual schedules significantly improve task completion</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Sleep Quality ↔ Next Day Performance</h4>
                      <Badge className="bg-purple-100 text-purple-800">76% correlation</Badge>
                    </div>
                    <p className="text-sm text-purple-700">Better sleep strongly predicts better next-day outcomes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-purple-900">Routine Optimization</h4>
                        <p className="text-sm text-gray-700 mt-1">
                          Implement 15-minute buffer time in morning routine
                        </p>
                        <p className="text-sm text-purple-600 mt-2">
                          Expected: Reduce morning stress by 40%
                        </p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">92% confidence</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">Sensory Optimization</h4>
                        <p className="text-sm text-gray-700 mt-1">
                          Increase proactive sensory breaks to every 90 minutes
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          Expected: Prevent 50% of sensory overwhelm incidents
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">94% confidence</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900">Skill Development</h4>
                        <p className="text-sm text-gray-700 mt-1">
                          Focus on turn-taking skills through preferred activities
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          Expected: Accelerate social skill development by 3x
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">87% confidence</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
