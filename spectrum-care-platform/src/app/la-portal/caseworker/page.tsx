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
  Workflow,
  Users,
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
  Target,
  TrendingUp,
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
  BarChart3,
  PieChart,
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
  Smartphone
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending' | 'blocked';
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
}

interface CaseWorkflow {
  id: string;
  caseId: string;
  workflowType: string;
  status: string;
  progress: number;
  startDate: string;
  estimatedCompletion: string;
  steps: WorkflowStep[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  availability: string;
  workload: number;
  skills: string[];
  location: string;
}

interface CaseworkerData {
  profile: {
    name: string;
    id: string;
    role: string;
    team: string;
    certifications: string[];
    experience: string;
    specializations: string[];
  };
  teamMetrics: {
    totalMembers: number;
    activeWorkflows: number;
    completedThisMonth: number;
    averageEfficiency: number;
  };
  workflows: CaseWorkflow[];
  teamMembers: TeamMember[];
  aiInsights: Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    action?: string;
  }>;
  collaborationTools: Array<{
    name: string;
    description: string;
    active: boolean;
    lastUsed: string;
  }>;
}

export default function LACaseworkerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [caseworkerData, setCaseworkerData] = useState<CaseworkerData | null>(null);
  const [selectedTab, setSelectedTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState<CaseWorkflow | null>(null);

  useEffect(() => {
    loadCaseworkerData();
  }, []);

  const loadCaseworkerData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Simulate caseworker data
      const mockData: CaseworkerData = {
        profile: {
          name: 'David Chen',
          id: 'LA-CW-003',
          role: 'Senior Caseworker',
          team: 'North District Team Alpha',
          certifications: ['Advanced SEND', 'Workflow Management', 'Team Leadership'],
          experience: '7 years',
          specializations: ['Complex Cases', 'Multi-Agency Coordination', 'Tribunal Support']
        },
        teamMetrics: {
          totalMembers: 8,
          activeWorkflows: 47,
          completedThisMonth: 23,
          averageEfficiency: 94
        },
        workflows: [
          {
            id: 'WF-2024-001',
            caseId: 'EHC-2024-0847',
            workflowType: 'EHC Assessment - Complex',
            status: 'In Progress',
            progress: 65,
            startDate: '2024-01-15',
            estimatedCompletion: '2024-02-15',
            steps: [
              {
                id: 'step-1',
                name: 'Initial Request Processing',
                status: 'completed',
                assignedTo: 'Sarah Williams',
                dueDate: '2024-01-18',
                estimatedHours: 4,
                actualHours: 3.5,
                dependencies: []
              },
              {
                id: 'step-2',
                name: 'Educational Assessment Coordination',
                status: 'completed',
                assignedTo: 'Michael Brown',
                dueDate: '2024-01-25',
                estimatedHours: 6,
                actualHours: 7,
                dependencies: ['step-1']
              },
              {
                id: 'step-3',
                name: 'Health Assessment Coordination',
                status: 'active',
                assignedTo: 'Emma Davis',
                dueDate: '2024-02-01',
                estimatedHours: 8,
                dependencies: ['step-1']
              },
              {
                id: 'step-4',
                name: 'Social Care Assessment',
                status: 'pending',
                assignedTo: 'James Wilson',
                dueDate: '2024-02-05',
                estimatedHours: 5,
                dependencies: ['step-1']
              },
              {
                id: 'step-5',
                name: 'Draft Plan Creation',
                status: 'pending',
                assignedTo: 'David Chen',
                dueDate: '2024-02-10',
                estimatedHours: 12,
                dependencies: ['step-2', 'step-3', 'step-4']
              }
            ]
          },
          {
            id: 'WF-2024-002',
            caseId: 'EHC-2024-0923',
            workflowType: 'Annual Review - Standard',
            status: 'Starting',
            progress: 15,
            startDate: '2024-01-28',
            estimatedCompletion: '2024-03-15',
            steps: [
              {
                id: 'step-1',
                name: 'Review Notification',
                status: 'completed',
                assignedTo: 'Sarah Williams',
                dueDate: '2024-01-30',
                estimatedHours: 2,
                actualHours: 1.5,
                dependencies: []
              },
              {
                id: 'step-2',
                name: 'Stakeholder Coordination',
                status: 'active',
                assignedTo: 'Michael Brown',
                dueDate: '2024-02-05',
                estimatedHours: 4,
                dependencies: ['step-1']
              }
            ]
          }
        ],
        teamMembers: [
          {
            id: 'tm-001',
            name: 'Sarah Williams',
            role: 'SEND Officer',
            availability: 'Available',
            workload: 85,
            skills: ['Assessment', 'Parent Communication', 'Documentation'],
            location: 'Main Office'
          },
          {
            id: 'tm-002',
            name: 'Michael Brown',
            role: 'Educational Psychologist',
            availability: 'Busy',
            workload: 95,
            skills: ['Psychological Assessment', 'Report Writing', 'Intervention Planning'],
            location: 'Field Work'
          },
          {
            id: 'tm-003',
            name: 'Emma Davis',
            role: 'Health Coordinator',
            availability: 'Available',
            workload: 70,
            skills: ['Health Assessment', 'Multi-agency Coordination', 'Specialist Services'],
            location: 'Remote'
          },
          {
            id: 'tm-004',
            name: 'James Wilson',
            role: 'Social Worker',
            availability: 'On Leave',
            workload: 0,
            skills: ['Social Assessment', 'Family Support', 'Crisis Management'],
            location: 'N/A'
          }
        ],
        aiInsights: [
          {
            type: 'efficiency',
            title: 'Workflow Optimization Opportunity',
            description: 'Health assessments could be started 3 days earlier to reduce bottlenecks',
            confidence: 92,
            action: 'Update workflow template'
          },
          {
            type: 'resource',
            title: 'Team Capacity Alert',
            description: 'Michael Brown is at 95% capacity - consider redistributing tasks',
            confidence: 88,
            action: 'Reassign workload'
          },
          {
            type: 'quality',
            title: 'Quality Improvement Suggestion',
            description: 'Cases with parent engagement score >80% complete 15% faster',
            confidence: 85,
            action: 'Enhance engagement protocols'
          }
        ],
        collaborationTools: [
          {
            name: 'Workflow Automation Engine',
            description: 'AI-powered case routing and task assignment',
            active: true,
            lastUsed: '2024-01-30T14:30:00Z'
          },
          {
            name: 'Team Communication Hub',
            description: 'Secure messaging and video conferencing',
            active: true,
            lastUsed: '2024-01-30T11:15:00Z'
          },
          {
            name: 'Document Collaboration Suite',
            description: 'Real-time document editing and version control',
            active: true,
            lastUsed: '2024-01-30T09:45:00Z'
          },
          {
            name: 'Performance Analytics Dashboard',
            description: 'Real-time team and workflow performance metrics',
            active: true,
            lastUsed: '2024-01-30T16:20:00Z'
          }
        ]
      };

      setCaseworkerData(mockData);
    } catch (error) {
      console.error('Error loading caseworker data:', error);
      setError('Failed to load caseworker data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'on leave': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleWorkflowAction = async (workflowId: string, action: string) => {
    try {
      alert(`${action} action for workflow ${workflowId} - Implementation needed`);
    } catch (error) {
      setError(`Failed to ${action.toLowerCase()} workflow`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">Loading Caseworker Portal...</p>
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
                className="text-purple-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dev Portal
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Workflow className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Caseworker Portal</h1>
                  <p className="text-sm text-gray-500">Advanced Workflow Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-800">
                <Workflow className="h-3 w-3 mr-1" />
                Senior Caseworker
              </Badge>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{caseworkerData?.profile.name}</p>
                <p className="text-sm text-gray-600">{caseworkerData?.profile.team}</p>
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

        {!caseworkerData ? (
          <Card>
            <CardContent className="text-center py-12">
              <Workflow className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Caseworker Portal</h3>
              <p className="text-gray-600 mb-6">Loading workflow management and team collaboration tools</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Enterprise LA System Banner */}
            <Card className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">🏛️ Enterprise LA System - Workflow Management</h2>
                  <p className="text-purple-100 mb-4">
                    Advanced case management with AI-powered workflow optimization for maximum efficiency
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{caseworkerData.teamMetrics.totalMembers}</div>
                      <div className="text-sm">Team Members</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{caseworkerData.teamMetrics.activeWorkflows}</div>
                      <div className="text-sm">Active Workflows</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{caseworkerData.teamMetrics.averageEfficiency}%</div>
                      <div className="text-sm">Team Efficiency</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">{caseworkerData.teamMetrics.completedThisMonth}</div>
                      <div className="text-sm">Completed This Month</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Panel */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <Brain className="h-5 w-5 mr-2" />
                  AI-Powered Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {caseworkerData.aiInsights.map((insight, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <Badge className="bg-blue-100 text-blue-800">{insight.type}</Badge>
                        </div>
                        <span className="text-xs text-blue-600">{insight.confidence}% confidence</span>
                      </div>
                      <h4 className="font-medium text-blue-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-blue-700 mb-3">{insight.description}</p>
                      {insight.action && (
                        <Button size="sm" className="w-full">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="team">Team Management</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                <TabsTrigger value="enterprise">Enterprise Tools</TabsTrigger>
              </TabsList>

              {/* Workflows Tab */}
              <TabsContent value="workflows" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Active Workflows</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {caseworkerData.workflows.map((workflow, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{workflow.workflowType}</CardTitle>
                            <CardDescription>Case: {workflow.caseId}</CardDescription>
                          </div>
                          <Badge className={
                            workflow.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            workflow.status === 'Starting' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {workflow.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span className="font-medium">{workflow.progress}%</span>
                            </div>
                            <Progress value={workflow.progress} className="h-3" />
                          </div>

                          {/* Timeline */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Started:</span>
                              <p className="font-medium">{formatDate(workflow.startDate)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Est. Completion:</span>
                              <p className="font-medium">{formatDate(workflow.estimatedCompletion)}</p>
                            </div>
                          </div>

                          {/* Current Steps */}
                          <div>
                            <h4 className="font-medium mb-2">Current Steps:</h4>
                            <div className="space-y-2">
                              {workflow.steps.filter(step => step.status === 'active' || step.status === 'blocked').map((step, stepIndex) => (
                                <div key={stepIndex} className={`p-3 rounded-lg border ${getStepStatusColor(step.status)}`}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-medium">{step.name}</h5>
                                      <p className="text-sm opacity-80">Assigned to: {step.assignedTo}</p>
                                    </div>
                                    <span className="text-xs">Due: {formatDate(step.dueDate)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" onClick={() => setSelectedWorkflow(workflow)}>
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleWorkflowAction(workflow.id, 'Edit')}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleWorkflowAction(workflow.id, 'Share')}>
                              <Share className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Team Management Tab */}
              <TabsContent value="team" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Team Management</h2>
                  <Button>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Manage Assignments
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {caseworkerData.teamMembers.map((member, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="font-bold mb-1">{member.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                          <Badge className={getAvailabilityColor(member.availability)}>
                            {member.availability}
                          </Badge>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Workload</span>
                              <span className="font-medium">{member.workload}%</span>
                            </div>
                            <Progress value={member.workload} className="h-2" />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-2">Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.slice(0, 2).map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {member.skills.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{member.location}</span>
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" className="flex-1">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <Video className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Team Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{caseworkerData.teamMetrics.averageEfficiency}%</div>
                        <p className="text-sm text-gray-600">Average Efficiency</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{caseworkerData.teamMetrics.activeWorkflows}</div>
                        <p className="text-sm text-gray-600">Active Workflows</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{caseworkerData.teamMetrics.completedThisMonth}</div>
                        <p className="text-sm text-gray-600">Completed This Month</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600">87%</div>
                        <p className="text-sm text-gray-600">Team Satisfaction</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Automation Tab */}
              <TabsContent value="automation" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Workflow Automation</h2>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Rules
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <PlayCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="font-bold text-green-800">Auto-Assignment</h3>
                          <p className="text-sm text-green-700">AI-powered case routing</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cases Routed Today</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Accuracy</span>
                          <span className="font-medium">94%</span>
                        </div>
                        <Button size="sm" className="w-full">Configure Rules</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Clock className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-bold text-blue-800">Deadline Monitoring</h3>
                          <p className="text-sm text-blue-700">Automated alerts & escalation</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status</span>
                          <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Alerts Sent Today</span>
                          <span className="font-medium">8</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Escalations</span>
                          <span className="font-medium">2</span>
                        </div>
                        <Button size="sm" className="w-full">View Alerts</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <FileText className="h-8 w-8 text-purple-600" />
                        <div>
                          <h3 className="font-bold text-purple-800">Document Generation</h3>
                          <p className="text-sm text-purple-700">Auto-create reports & letters</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status</span>
                          <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Documents Created</span>
                          <span className="font-medium">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Time Saved</span>
                          <span className="font-medium">14 hours</span>
                        </div>
                        <Button size="sm" className="w-full">Manage Templates</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Network className="h-8 w-8 text-orange-600" />
                        <div>
                          <h3 className="font-bold text-orange-800">Multi-Agency Sync</h3>
                          <p className="text-sm text-orange-700">External system integration</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status</span>
                          <Badge className="bg-orange-100 text-orange-800">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Synced Today</span>
                          <span className="font-medium">156</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Connected Systems</span>
                          <span className="font-medium">8</span>
                        </div>
                        <Button size="sm" className="w-full">View Connections</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                        <div>
                          <h3 className="font-bold text-red-800">Crisis Detection</h3>
                          <p className="text-sm text-red-700">AI-powered risk assessment</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status</span>
                          <Badge className="bg-red-100 text-red-800">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Alerts Today</span>
                          <span className="font-medium">3</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Response Time</span>
                          <span className="font-medium">&lt; 1 hour</span>
                        </div>
                        <Button size="sm" className="w-full">Emergency Protocols</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-indigo-200 bg-indigo-50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <BarChart3 className="h-8 w-8 text-indigo-600" />
                        <div>
                          <h3 className="font-bold text-indigo-800">Performance Analytics</h3>
                          <p className="text-sm text-indigo-700">Real-time insights & reporting</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Status</span>
                          <Badge className="bg-indigo-100 text-indigo-800">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Reports Generated</span>
                          <span className="font-medium">7</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Data Points</span>
                          <span className="font-medium">2.3M</span>
                        </div>
                        <Button size="sm" className="w-full">View Analytics</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Advanced Analytics</h2>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Workflow Efficiency</p>
                          <p className="text-3xl font-bold text-blue-900">94%</p>
                          <p className="text-sm text-blue-700">+8% this month</p>
                        </div>
                        <TrendingUp className="h-12 w-12 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">On-Time Completion</p>
                          <p className="text-3xl font-bold text-green-900">91%</p>
                          <p className="text-sm text-green-700">Above target</p>
                        </div>
                        <Target className="h-12 w-12 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Average Case Time</p>
                          <p className="text-3xl font-bold text-purple-900">14.2</p>
                          <p className="text-sm text-purple-700">weeks</p>
                        </div>
                        <Timer className="h-12 w-12 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-medium">Quality Score</p>
                          <p className="text-3xl font-bold text-orange-900">96%</p>
                          <p className="text-sm text-orange-700">Excellent</p>
                        </div>
                        <Star className="h-12 w-12 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Workflow Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">Performance Trend Chart</p>
                          <p className="text-sm text-gray-400">Real-time analytics implementation</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Team Workload Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500">Workload Distribution Chart</p>
                          <p className="text-sm text-gray-400">Team capacity visualization</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Collaboration Tab */}
              <TabsContent value="collaboration" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Collaboration Tools</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Collaboration
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {caseworkerData.collaborationTools.map((tool, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              tool.active ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {tool.name.includes('Workflow') && <Workflow className="h-6 w-6 text-green-600" />}
                              {tool.name.includes('Communication') && <MessageCircle className="h-6 w-6 text-blue-600" />}
                              {tool.name.includes('Document') && <FileText className="h-6 w-6 text-purple-600" />}
                              {tool.name.includes('Analytics') && <BarChart3 className="h-6 w-6 text-orange-600" />}
                            </div>
                            <div>
                              <h3 className="font-bold">{tool.name}</h3>
                              <p className="text-sm text-gray-600">{tool.description}</p>
                            </div>
                          </div>
                          <Badge className={tool.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {tool.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Last Used:</span>
                            <span className="font-medium">{formatDate(tool.lastUsed)}</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Link className="h-3 w-3 mr-1" />
                              Launch
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Collaboration Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Collaboration Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button className="h-16 bg-blue-600 hover:bg-blue-700 text-white">
                        <div className="text-center">
                          <Video className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Start Team Meeting</div>
                        </div>
                      </Button>
                      <Button className="h-16 bg-green-600 hover:bg-green-700 text-white">
                        <div className="text-center">
                          <Share className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Share Workflow</div>
                        </div>
                      </Button>
                      <Button className="h-16 bg-purple-600 hover:bg-purple-700 text-white">
                        <div className="text-center">
                          <FileText className="h-6 w-6 mx-auto mb-1" />
                          <div className="text-sm">Collaborative Document</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enterprise Tools Tab */}
              <TabsContent value="enterprise" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Enterprise LA Tools</h2>
                  <Badge className="bg-purple-100 text-purple-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Enterprise Edition
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Globe className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                      <h3 className="font-bold mb-2">Multi-Site Management</h3>
                      <p className="text-sm text-gray-600 mb-4">Coordinate across multiple LA sites and districts</p>
                      <Button className="w-full">Manage Sites</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-indigo-200 bg-indigo-50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 text-indigo-600" />
                      <h3 className="font-bold mb-2">Enterprise Data Hub</h3>
                      <p className="text-sm text-gray-600 mb-4">Centralized data management and analytics</p>
                      <Button className="w-full">Access Data Hub</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-bold mb-2">Compliance Monitoring</h3>
                      <p className="text-sm text-gray-600 mb-4">Real-time statutory compliance tracking</p>
                      <Button className="w-full">View Compliance</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                      <h3 className="font-bold mb-2">AI Decision Support</h3>
                      <p className="text-sm text-gray-600 mb-4">Machine learning powered recommendations</p>
                      <Button className="w-full">AI Assistant</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Monitor className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="font-bold mb-2">Executive Dashboard</h3>
                      <p className="text-sm text-gray-600 mb-4">Real-time KPI monitoring and reporting</p>
                      <Button className="w-full">Launch Dashboard</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                      <h3 className="font-bold mb-2">Crisis Management</h3>
                      <p className="text-sm text-gray-600 mb-4">Emergency response and escalation</p>
                      <Button className="w-full">Crisis Center</Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Enterprise Features Summary */}
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-800">
                      <Crown className="h-5 w-5 mr-2" />
                      Enterprise LA System Capabilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Operational Excellence</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Multi-authority deployment</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /> 70% efficiency improvement</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Real-time compliance monitoring</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Automated workflow optimization</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Technology Integration</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /> AI-powered decision support</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Enterprise-grade security</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Third-party system integration</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /> Mobile-first responsive design</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Workflow Detail Modal */}
        {selectedWorkflow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{selectedWorkflow.workflowType}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {selectedWorkflow.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Workflow ID: {selectedWorkflow.id} | Case: {selectedWorkflow.caseId}</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedWorkflow(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Overview */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span className="font-medium">{selectedWorkflow.progress}%</span>
                    </div>
                    <Progress value={selectedWorkflow.progress} className="h-3" />
                  </div>

                  {/* Workflow Steps */}
                  <div>
                    <h4 className="font-medium mb-4">Workflow Steps</h4>
                    <div className="space-y-4">
                      {selectedWorkflow.steps.map((step, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getStepStatusColor(step.status)}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h5 className="font-medium">{step.name}</h5>
                                <Badge className={getStepStatusColor(step.status)}>
                                  {step.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Assigned to:</span>
                                  <p className="font-medium">{step.assignedTo}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Due Date:</span>
                                  <p className="font-medium">{formatDate(step.dueDate)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Estimated Hours:</span>
                                  <p className="font-medium">{step.estimatedHours}h {step.actualHours ? `(${step.actualHours}h actual)` : ''}</p>
                                </div>
                              </div>
                              {step.dependencies.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-600">Dependencies: {step.dependencies.join(', ')}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <Button onClick={() => handleWorkflowAction(selectedWorkflow.id, 'Update')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Workflow
                    </Button>
                    <Button variant="outline" onClick={() => handleWorkflowAction(selectedWorkflow.id, 'Share')}>
                      <Share className="h-4 w-4 mr-2" />
                      Share with Team
                    </Button>
                    <Button variant="outline" onClick={() => handleWorkflowAction(selectedWorkflow.id, 'Export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline" onClick={() => handleWorkflowAction(selectedWorkflow.id, 'Automate')}>
                      <Zap className="h-4 w-4 mr-2" />
                      Automate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
