'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Send,
  Archive,
  Flag,
  Bell,
  Settings,
  Download,
  Upload,
  Briefcase,
  ClipboardList,
  Timer,
  BookOpen,
  MessageCircle,
  Video,
  UserCheck,
  AlertCircle,
  CheckSquare,
  ArrowRight,
  Activity,
  Zap,
  ArrowLeft,
  Home,
  RefreshCw,
  Star,
  Database,
  Lock,
  Unlock,
  Crown,
  Shield,
  Brain,
  Lightbulb,
  Network,
  GitBranch,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  FastForward,
  Share,
  Link,
  Globe,
  Monitor,
  Smartphone,
  UserPlus,
  Award,
  Building,
  DollarSign,
  PoundSterling,
  Percent,
  Gauge,
  LineChart,
  Building2,
  MapPinned,
  Calendar as CalendarIcon,
  Cog,
  Hash
} from 'lucide-react';

interface TeamPerformance {
  teamId: string;
  teamName: string;
  manager: string;
  members: number;
  caseload: number;
  efficiency: number;
  completionRate: number;
  qualityScore: number;
  workload: number;
  location: string;
}

interface ResourceAllocation {
  resource: string;
  allocated: number;
  utilized: number;
  available: number;
  efficiency: number;
  cost: number;
}

interface BudgetData {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  variance: number;
  forecast: number;
}

interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

interface ManagerData {
  profile: {
    name: string;
    id: string;
    role: string;
    department: string;
    teamsManaged: number;
    experience: string;
    responsibilities: string[];
  };
  overview: {
    totalStaff: number;
    totalCaseload: number;
    budgetUtilization: number;
    performanceScore: number;
  };
  teams: TeamPerformance[];
  resources: ResourceAllocation[];
  budget: BudgetData[];
  metrics: PerformanceMetric[];
  alerts: Array<{
    type: string;
    title: string;
    description: string;
    team?: string;
    priority: string;
    timestamp: string;
  }>;
  strategicInitiatives: Array<{
    id: string;
    name: string;
    description: string;
    progress: number;
    deadline: string;
    owner: string;
    status: string;
  }>;
}

export default function LAManagerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [managerData, setManagerData] = useState<ManagerData | null>(null);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState<TeamPerformance | null>(null);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Simulate manager data
      const mockData: ManagerData = {
        profile: {
          name: 'Rachel Martinez',
          id: 'LA-MGR-001',
          role: 'Area Manager - SEND Services',
          department: 'Children\'s Services',
          teamsManaged: 4,
          experience: '12 years',
          responsibilities: [
            'Team Leadership & Development',
            'Resource Allocation & Budget Management',
            'Performance Monitoring & Quality Assurance',
            'Strategic Planning & Process Improvement',
            'Stakeholder Relations & Compliance'
          ]
        },
        overview: {
          totalStaff: 32,
          totalCaseload: 847,
          budgetUtilization: 92,
          performanceScore: 89
        },
        teams: [
          {
            teamId: 'team-001',
            teamName: 'North District Team Alpha',
            manager: 'David Chen',
            members: 8,
            caseload: 234,
            efficiency: 94,
            completionRate: 91,
            qualityScore: 96,
            workload: 87,
            location: 'North Office'
          },
          {
            teamId: 'team-002',
            teamName: 'South District Team Beta',
            manager: 'Sarah Williams',
            members: 7,
            caseload: 198,
            efficiency: 89,
            completionRate: 88,
            qualityScore: 92,
            workload: 82,
            location: 'South Office'
          },
          {
            teamId: 'team-003',
            teamName: 'East District Team Gamma',
            manager: 'Michael Brown',
            members: 9,
            caseload: 267,
            efficiency: 91,
            completionRate: 89,
            qualityScore: 94,
            workload: 91,
            location: 'East Office'
          },
          {
            teamId: 'team-004',
            teamName: 'West District Team Delta',
            manager: 'Emma Davis',
            members: 8,
            caseload: 148,
            efficiency: 96,
            completionRate: 93,
            qualityScore: 98,
            workload: 78,
            location: 'West Office'
          }
        ],
        resources: [
          {
            resource: 'Educational Psychologists',
            allocated: 12,
            utilized: 11,
            available: 1,
            efficiency: 92,
            cost: 780000
          },
          {
            resource: 'SEND Officers',
            allocated: 18,
            utilized: 17,
            available: 1,
            efficiency: 94,
            cost: 990000
          },
          {
            resource: 'Health Coordinators',
            allocated: 8,
            utilized: 7,
            available: 1,
            efficiency: 88,
            cost: 560000
          },
          {
            resource: 'Social Workers',
            allocated: 10,
            utilized: 8,
            available: 2,
            efficiency: 80,
            cost: 650000
          }
        ],
        budget: [
          {
            category: 'Staff Costs',
            allocated: 2980000,
            spent: 2745000,
            remaining: 235000,
            variance: -8,
            forecast: 2890000
          },
          {
            category: 'Assessment Services',
            allocated: 450000,
            spent: 467000,
            remaining: -17000,
            variance: 4,
            forecast: 480000
          },
          {
            category: 'Training & Development',
            allocated: 120000,
            spent: 89000,
            remaining: 31000,
            variance: -26,
            forecast: 115000
          },
          {
            category: 'Technology & Systems',
            allocated: 200000,
            spent: 178000,
            remaining: 22000,
            variance: -11,
            forecast: 195000
          }
        ],
        metrics: [
          {
            name: 'Average Case Processing Time',
            current: 16.2,
            target: 18.0,
            previous: 17.1,
            trend: 'down',
            status: 'good'
          },
          {
            name: 'On-Time Completion Rate',
            current: 89,
            target: 85,
            previous: 87,
            trend: 'up',
            status: 'good'
          },
          {
            name: 'Quality Score',
            current: 94,
            target: 90,
            previous: 92,
            trend: 'up',
            status: 'good'
          },
          {
            name: 'Parent Satisfaction',
            current: 76,
            target: 80,
            previous: 74,
            trend: 'up',
            status: 'warning'
          },
          {
            name: 'Staff Utilization',
            current: 87,
            target: 85,
            previous: 89,
            trend: 'down',
            status: 'good'
          },
          {
            name: 'Budget Efficiency',
            current: 92,
            target: 95,
            previous: 88,
            trend: 'up',
            status: 'warning'
          }
        ],
        alerts: [
          {
            type: 'budget',
            title: 'Assessment Services Over Budget',
            description: 'Assessment services category is £17k over allocated budget',
            priority: 'high',
            timestamp: '2024-01-30T09:00:00Z'
          },
          {
            type: 'performance',
            title: 'Team Beta Below Target',
            description: 'South District Team Beta completion rate dropped to 88%',
            team: 'team-002',
            priority: 'medium',
            timestamp: '2024-01-30T11:30:00Z'
          },
          {
            type: 'resource',
            title: 'Social Worker Capacity Low',
            description: 'Only 80% utilization in social worker resources',
            priority: 'medium',
            timestamp: '2024-01-30T14:15:00Z'
          }
        ],
        strategicInitiatives: [
          {
            id: 'init-001',
            name: 'Digital Transformation Phase 2',
            description: 'Implementation of AI-powered workflow automation across all teams',
            progress: 67,
            deadline: '2024-06-30',
            owner: 'Rachel Martinez',
            status: 'On Track'
          },
          {
            id: 'init-002',
            name: 'Staff Development Program',
            description: 'Comprehensive training program for SEND legislation updates',
            progress: 43,
            deadline: '2024-04-15',
            owner: 'David Chen',
            status: 'At Risk'
          },
          {
            id: 'init-003',
            name: 'Parent Engagement Enhancement',
            description: 'New communication channels and feedback systems',
            progress: 78,
            deadline: '2024-03-31',
            owner: 'Sarah Williams',
            status: 'Ahead'
          }
        ]
      };

      setManagerData(mockData);
    } catch (error) {
      console.error('Error loading manager data:', error);
      setError('Failed to load manager data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamStatusColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (efficiency >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <BarChart3 className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${(amount / 1000).toFixed(0)}k`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleTeamAction = async (teamId: string, action: string) => {
    try {
      alert(`${action} action for team ${teamId} - Implementation needed`);
    } catch (error) {
      setError(`Failed to ${action.toLowerCase()} team`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600">Loading Manager Portal...</p>
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
                onClick={() => router.push('/dev')}
                className="text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dev Portal
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Manager Portal</h1>
                  <p className="text-sm text-gray-500">Team & Resource Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-indigo-100 text-indigo-800">
                <Users className="h-3 w-3 mr-1" />
                Area Manager
              </Badge>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{managerData?.profile.name}</p>
                <p className="text-sm text-gray-600">{managerData?.profile.department}</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/la-portal/executive')}>
                <Crown className="h-4 w-4 mr-2" />
                Executive View
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!managerData ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Manager Portal</h3>
              <p className="text-gray-600 mb-6">Loading team management and performance data</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Enterprise Manager System Banner */}
            <Card className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">🏛️ Enterprise LA Manager System</h2>
                  <p className="text-indigo-100 mb-4">
                    Strategic oversight and resource optimization for maximum operational efficiency
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{managerData.overview.totalStaff}</div>
                      <div className="text-sm">Total Staff</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{managerData.overview.totalCaseload}</div>
                      <div className="text-sm">Active Caseload</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{managerData.overview.budgetUtilization}%</div>
                      <div className="text-sm">Budget Utilization</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{managerData.overview.performanceScore}%</div>
                      <div className="text-sm">Performance Score</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Alerts Panel */}
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <Bell className="h-5 w-5 mr-2" />
                  Strategic Alerts & Key Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {managerData.alerts.map((alert, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {alert.type === 'budget' && <PoundSterling className="h-4 w-4 text-orange-600" />}
                          {alert.type === 'performance' && <Target className="h-4 w-4 text-orange-600" />}
                          {alert.type === 'resource' && <Users className="h-4 w-4 text-orange-600" />}
                          <Badge className={`text-xs ${
                            alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                            alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <span className="text-xs text-orange-600">{formatDate(alert.timestamp)}</span>
                      </div>
                      <h4 className="font-medium text-orange-900 mb-1">{alert.title}</h4>
                      <p className="text-sm text-orange-700 mb-3">{alert.description}</p>
                      <Button size="sm" className="w-full">
                        Take Action
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="teams">Team Management</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="budget">Budget</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="strategic">Strategic</TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Key Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Performance Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {managerData.metrics.map((metric, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getMetricStatusColor(metric.status)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{metric.name}</h4>
                            {getTrendIcon(metric.trend)}
                          </div>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold">{metric.current}{metric.name.includes('Time') ? 'wks' : '%'}</span>
                            <span className="text-sm text-gray-600">/ {metric.target}{metric.name.includes('Time') ? 'wks' : '%'}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-600">Previous: {metric.previous}{metric.name.includes('Time') ? 'wks' : '%'}</span>
                            <Badge className={getMetricStatusColor(metric.status)}>
                              {metric.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Team Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Team Performance Overview
                      <Button variant="outline" size="sm" onClick={() => setSelectedTab('teams')}>
                        Manage Teams
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {managerData.teams.map((team, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getTeamStatusColor(team.efficiency)} cursor-pointer hover:shadow-md transition-shadow`}
                             onClick={() => setSelectedTeam(team)}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold">{team.teamName}</h4>
                              <p className="text-sm opacity-80">Manager: {team.manager}</p>
                              <p className="text-sm opacity-80">{team.members} members • {team.caseload} cases</p>
                            </div>
                            <Badge className={getTeamStatusColor(team.efficiency)}>
                              {team.efficiency}% eff
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="opacity-80">Completion</p>
                              <p className="font-medium">{team.completionRate}%</p>
                            </div>
                            <div>
                              <p className="opacity-80">Quality</p>
                              <p className="font-medium">{team.qualityScore}%</p>
                            </div>
                            <div>
                              <p className="opacity-80">Workload</p>
                              <p className="font-medium">{team.workload}%</p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Overall Performance</span>
                              <span>{team.efficiency}%</span>
                            </div>
                            <Progress value={team.efficiency} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Utilization Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Resource Utilization Summary
                      <Button variant="outline" size="sm" onClick={() => setSelectedTab('resources')}>
                        Manage Resources
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {managerData.resources.map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{resource.resource}</h4>
                            <p className="text-sm text-gray-600">
                              {resource.utilized}/{resource.allocated} utilized • {resource.available} available
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{resource.efficiency}%</p>
                              <p className="text-xs text-gray-600">efficiency</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(resource.cost)}</p>
                              <p className="text-xs text-gray-600">annual cost</p>
                            </div>
                            <Progress value={(resource.utilized / resource.allocated) * 100} className="w-16 h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Team Management Tab */}
              <TabsContent value="teams" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Team Management</h2>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {managerData.teams.map((team, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{team.teamName}</CardTitle>
                            <CardDescription>
                              {team.members} members • {team.caseload} active cases
                            </CardDescription>
                          </div>
                          <Badge className={getTeamStatusColor(team.efficiency)}>
                            {team.efficiency}% efficiency
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Team Manager */}
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{team.manager}</h4>
                              <p className="text-sm text-gray-600">Team Manager</p>
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Completion Rate</span>
                                <span className="font-medium">{team.completionRate}%</span>
                              </div>
                              <Progress value={team.completionRate} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Quality Score</span>
                                <span className="font-medium">{team.qualityScore}%</span>
                              </div>
                              <Progress value={team.qualityScore} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Workload</span>
                                <span className="font-medium">{team.workload}%</span>
                              </div>
                              <Progress value={team.workload} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Efficiency</span>
                                <span className="font-medium">{team.efficiency}%</span>
                              </div>
                              <Progress value={team.efficiency} className="h-2" />
                            </div>
                          </div>

                          {/* Location & Details */}
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{team.location}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" onClick={() => setSelectedTeam(team)}>
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleTeamAction(team.teamId, 'Manage')}>
                              <Users className="h-3 w-3 mr-1" />
                              Manage
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleTeamAction(team.teamId, 'Report')}>
                              <FileText className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Team Comparison Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Team Comparison Chart</p>
                        <p className="text-sm text-gray-400">Implementation needed for visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Resource Management</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Allocate Resources
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {managerData.resources.map((resource, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg">{resource.resource}</h3>
                            <p className="text-sm text-gray-600">
                              {resource.utilized} of {resource.allocated} allocated
                            </p>
                          </div>
                          <Badge className={
                            resource.efficiency >= 90 ? 'bg-green-100 text-green-800' :
                            resource.efficiency >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {resource.efficiency}% eff
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Utilization</span>
                              <span className="font-medium">
                                {Math.round((resource.utilized / resource.allocated) * 100)}%
                              </span>
                            </div>
                            <Progress value={(resource.utilized / resource.allocated) * 100} className="h-3" />
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <p className="font-bold text-blue-900">{resource.allocated}</p>
                              <p className="text-blue-700">Allocated</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="font-bold text-green-900">{resource.utilized}</p>
                              <p className="text-green-700">Utilized</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-bold text-gray-900">{resource.available}</p>
                              <p className="text-gray-700">Available</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Annual Cost</span>
                              <span className="font-bold text-lg">{formatCurrency(resource.cost)}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Edit className="h-3 w-3 mr-1" />
                              Reallocate
                            </Button>
                            <Button size="sm" variant="outline">
                              <BarChart3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Resource Optimization Recommendations */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-800">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      AI-Powered Resource Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Efficiency Opportunity</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Redistributing 2 Social Workers to teams with higher caseloads could increase overall efficiency by 8%
                        </p>
                        <Button size="sm" className="w-full">Apply Recommendation</Button>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Cost Optimization</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Cross-training 3 officers in educational psychology could save £45k annually in external assessments
                        </p>
                        <Button size="sm" className="w-full">View Training Plan</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Budget Tab */}
              <TabsContent value="budget" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Budget Management</h2>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Financial Report
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {managerData.budget.map((budget, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold">{budget.category}</h3>
                            <p className="text-sm text-gray-600">Annual Budget</p>
                          </div>
                          <Badge className={
                            budget.variance > 0 ? 'bg-red-100 text-red-800' :
                            budget.variance > -10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {budget.variance > 0 ? '+' : ''}{budget.variance}%
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Spent vs Allocated</span>
                              <span className="font-medium">
                                {Math.round((budget.spent / budget.allocated) * 100)}%
                              </span>
                            </div>
                            <Progress value={(budget.spent / budget.allocated) * 100} className="h-3" />
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Allocated:</span>
                              <span className="font-medium">{formatCurrency(budget.allocated)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Spent:</span>
                              <span className="font-medium">{formatCurrency(budget.spent)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Remaining:</span>
                              <span className={`font-medium ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(budget.remaining)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="text-gray-600">Forecast:</span>
                              <span className="font-medium">{formatCurrency(budget.forecast)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Budget Trend Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Budget Trend Chart</p>
                        <p className="text-sm text-gray-400">Monthly spending patterns and forecasting</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Alerts */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-800">Budget Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-lg border border-red-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-red-900">Assessment Services Over Budget</h4>
                            <p className="text-sm text-red-700">£17k over allocated budget (4% variance)</p>
                          </div>
                          <Badge className="bg-red-100 text-red-800">Critical</Badge>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-yellow-900">Staff Costs Trending High</h4>
                            <p className="text-sm text-yellow-700">Projected to exceed budget by £90k if trend continues</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Performance Analytics</h2>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Performance Report
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {managerData.metrics.map((metric, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold">{metric.name}</h3>
                            <p className="text-sm text-gray-600">Current Performance</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(metric.trend)}
                            <Badge className={getMetricStatusColor(metric.status)}>
                              {metric.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">
                              {metric.current}{metric.name.includes('Time') ? 'wks' : '%'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Target: {metric.target}{metric.name.includes('Time') ? 'wks' : '%'}
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress to Target</span>
                              <span className="font-medium">
                                {Math.round((metric.current / metric.target) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min((metric.current / metric.target) * 100, 100)}
                              className="h-3"
                            />
                          </div>

                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-gray-600">Previous Period:</span>
                            <span className="font-medium">
                              {metric.previous}{metric.name.includes('Time') ? 'wks' : '%'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Performance Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">Performance Trend Analysis</p>
                          <p className="text-sm text-gray-400">6-month performance tracking</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Team Performance Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">Team Performance Distribution</p>
                          <p className="text-sm text-gray-400">Comparative team analysis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Strategic Tab */}
              <TabsContent value="strategic" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Strategic Initiatives</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Initiative
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {managerData.strategicInitiatives.map((initiative, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{initiative.name}</CardTitle>
                            <CardDescription>{initiative.description}</CardDescription>
                          </div>
                          <Badge className={
                            initiative.status === 'On Track' ? 'bg-green-100 text-green-800' :
                            initiative.status === 'At Risk' ? 'bg-yellow-100 text-yellow-800' :
                            initiative.status === 'Ahead' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {initiative.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span className="font-medium">{initiative.progress}%</span>
                            </div>
                            <Progress value={initiative.progress} className="h-3" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Owner:</span>
                              <p className="font-medium">{initiative.owner}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Deadline:</span>
                              <p className="font-medium">{formatDate(initiative.deadline)}</p>
                            </div>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Update
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Strategic Planning Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Planning Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button className="h-20 bg-blue-600 hover:bg-blue-700 text-white">
                        <div className="text-center">
                          <Target className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Goal Setting</div>
                        </div>
                      </Button>
                      <Button className="h-20 bg-green-600 hover:bg-green-700 text-white">
                        <div className="text-center">
                          <BarChart3 className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Impact Analysis</div>
                        </div>
                      </Button>
                      <Button className="h-20 bg-purple-600 hover:bg-purple-700 text-white">
                        <div className="text-center">
                          <FileText className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Strategy Report</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Team Detail Modal */}
        {selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{selectedTeam.teamName}</span>
                      <Badge className={getTeamStatusColor(selectedTeam.efficiency)}>
                        {selectedTeam.efficiency}% efficiency
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Managed by {selectedTeam.manager} • {selectedTeam.members} members • {selectedTeam.caseload} cases
                    </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedTeam(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Performance Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completion Rate</span>
                          <span className="font-medium">{selectedTeam.completionRate}%</span>
                        </div>
                        <Progress value={selectedTeam.completionRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Quality Score</span>
                          <span className="font-medium">{selectedTeam.qualityScore}%</span>
                        </div>
                        <Progress value={selectedTeam.qualityScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Workload</span>
                          <span className="font-medium">{selectedTeam.workload}%</span>
                        </div>
                        <Progress value={selectedTeam.workload} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Efficiency</span>
                          <span className="font-medium">{selectedTeam.efficiency}%</span>
                        </div>
                        <Progress value={selectedTeam.efficiency} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Team Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team Manager:</span>
                        <span className="font-medium">{selectedTeam.manager}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team Size:</span>
                        <span className="font-medium">{selectedTeam.members} members</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Caseload:</span>
                        <span className="font-medium">{selectedTeam.caseload} cases</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedTeam.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cases per Member:</span>
                        <span className="font-medium">{Math.round(selectedTeam.caseload / selectedTeam.members)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 pt-6 border-t">
                  <Button onClick={() => handleTeamAction(selectedTeam.teamId, 'Manage')}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Team
                  </Button>
                  <Button variant="outline" onClick={() => handleTeamAction(selectedTeam.teamId, 'Reallocate')}>
                    <Zap className="h-4 w-4 mr-2" />
                    Reallocate Resources
                  </Button>
                  <Button variant="outline" onClick={() => handleTeamAction(selectedTeam.teamId, 'Report')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" onClick={() => handleTeamAction(selectedTeam.teamId, 'Performance')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
