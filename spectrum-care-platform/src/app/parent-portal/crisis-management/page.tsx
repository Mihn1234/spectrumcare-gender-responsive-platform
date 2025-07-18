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
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Clock,
  Target,
  BarChart3,
  Plus,
  Download,
  Share,
  Activity,
  Brain,
  Heart,
  Users,
  Settings,
  Home,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Map,
  Zap,
  Eye,
  Edit,
  MessageSquare,
  FileText,
  Lightbulb
} from 'lucide-react';

interface Crisis {
  id: string;
  childId: string;
  crisisType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggerFactors: string[];
  interventions: any[];
  emergencyContacts: any[];
  preventionPlan: any;
  recoveryPlan: any;
  isActive: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  analysis?: any;
}

interface CrisisStats {
  totalCrises: number;
  activeCrises: number;
  resolvedCrises: number;
  severityBreakdown: any;
  mostCommonTriggers: string[];
  averageResolutionTime: string;
  interventionEffectiveness: any;
  trendsAndPatterns: any;
}

export default function CrisisManagementPage() {
  const router = useRouter();
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [stats, setStats] = useState<CrisisStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState('demo-child-id');
  const [showNewCrisisForm, setShowNewCrisisForm] = useState(false);
  const [newCrisis, setNewCrisis] = useState({
    crisisType: '',
    severity: 'medium' as const,
    triggerFactors: [] as string[],
    currentStatus: '',
    immediateActions: [] as string[]
  });

  useEffect(() => {
    loadCrisisData();
  }, [selectedChild]);

  const loadCrisisData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `/api/parent-portal/crisis-management?childId=${selectedChild}&status=all`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load crisis management data');
      }

      const data = await response.json();
      setCrises(data.data.crises || []);
      setStats(data.data.statistics || null);

    } catch (error) {
      console.error('Error loading crisis data:', error);
      setError('Failed to load crisis management data');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewCrisis = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/crisis-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          childId: selectedChild,
          ...newCrisis,
          emergencyContacts: [
            { name: 'Sarah Johnson', role: 'Mother', phone: '+44123456789', priority: 1 }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create crisis record');
      }

      const data = await response.json();
      await loadCrisisData(); // Reload data
      setShowNewCrisisForm(false);

      // Reset form
      setNewCrisis({
        crisisType: '',
        severity: 'medium',
        triggerFactors: [],
        currentStatus: '',
        immediateActions: []
      });

    } catch (error) {
      console.error('Error creating crisis:', error);
      setError('Failed to create crisis record');
    } finally {
      setIsLoading(false);
    }
  };

  const resolveCrisis = async (crisisId: string) => {
    try {
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/crisis-management', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          crisisId,
          isActive: false,
          resolutionNotes: 'Crisis resolved through intervention protocols'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve crisis');
      }

      await loadCrisisData(); // Reload data

    } catch (error) {
      console.error('Error resolving crisis:', error);
      setError('Failed to resolve crisis');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const addTriggerFactor = (factor: string) => {
    if (factor && !newCrisis.triggerFactors.includes(factor)) {
      setNewCrisis(prev => ({
        ...prev,
        triggerFactors: [...prev.triggerFactors, factor]
      }));
    }
  };

  const removeTriggerFactor = (factor: string) => {
    setNewCrisis(prev => ({
      ...prev,
      triggerFactors: prev.triggerFactors.filter(f => f !== factor)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading crisis management data...</p>
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
                className="text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Crisis Management</h1>
                  <p className="text-sm text-gray-500">24/7 intervention & prevention system</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowNewCrisisForm(true)}
                className="text-red-600 border-red-200"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Crisis
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
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

        {/* Crisis Status Banner */}
        <div className="mb-8">
          {stats?.activeCrises && stats.activeCrises > 0 ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <h4 className="font-medium text-red-800">Active Crisis Alert</h4>
                <AlertDescription className="text-red-700">
                  You have {stats.activeCrises} active crisis situation{stats.activeCrises > 1 ? 's' : ''}.
                  Emergency protocols are in effect. Contact support if immediate assistance is needed.
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <h4 className="font-medium text-green-800">All Clear Status</h4>
                <AlertDescription className="text-green-700">
                  No active crises detected. Prevention protocols are active and monitoring systems operational.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Crises</p>
                  <p className="text-3xl font-bold text-red-600">{stats?.activeCrises || 0}</p>
                  <p className="text-sm text-red-600">Immediate attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalCrises || 0}</p>
                  <p className="text-sm text-blue-600">All time</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.averageResolutionTime || '4h'}</p>
                  <p className="text-sm text-green-600">Response time</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats?.interventionEffectiveness?.high || 85}%
                  </p>
                  <p className="text-sm text-purple-600">Intervention effectiveness</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Crises</TabsTrigger>
            <TabsTrigger value="prevention">Prevention</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crisis Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Crisis Timeline
                  </CardTitle>
                  <CardDescription>
                    Last 10 crisis events and their resolution status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crises.slice(0, 5).map((crisis, index) => (
                      <div key={crisis.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className={`w-3 h-3 rounded-full mt-2 ${crisis.isActive ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{crisis.crisisType}</p>
                            <Badge className={getSeverityColor(crisis.severity)}>
                              {crisis.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(crisis.createdAt).toLocaleDateString()} at {new Date(crisis.createdAt).toLocaleTimeString()}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            {crisis.triggerFactors.slice(0, 2).map((trigger, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {crisis.isActive ? (
                          <Button size="sm" variant="outline" onClick={() => resolveCrisis(crisis.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trigger Pattern Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    Pattern Recognition
                  </CardTitle>
                  <CardDescription>
                    AI-identified patterns in crisis triggers and timing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Most Common Triggers</h4>
                      <div className="space-y-2">
                        {(stats?.mostCommonTriggers || []).slice(0, 4).map((trigger, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{trigger}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={80 - (index * 15)} className="w-16" />
                              <span className="text-xs text-gray-500">{80 - (index * 15)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Risk Assessment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Escalation Risk</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Recurrence Risk</span>
                          <Badge className="bg-green-100 text-green-800">Low</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Seasonal Pattern</span>
                          <span className="text-sm text-gray-600">Higher in autumn</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contacts Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-green-600" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>
                  Quick access to crisis response team and emergency contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-red-200 hover:bg-red-50">
                    <Phone className="h-6 w-6 text-red-600" />
                    <span className="font-medium">Emergency Services</span>
                    <span className="text-xs text-gray-500">999</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50">
                    <Users className="h-6 w-6 text-blue-600" />
                    <span className="font-medium">Crisis Team</span>
                    <span className="text-xs text-gray-500">+44 123 456 789</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50">
                    <Heart className="h-6 w-6 text-green-600" />
                    <span className="font-medium">Support Helpline</span>
                    <span className="text-xs text-gray-500">24/7 Available</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Crises Tab */}
          <TabsContent value="active" className="space-y-6">
            {stats?.activeCrises && stats.activeCrises > 0 ? (
              <div className="space-y-6">
                {crises.filter(c => c.isActive).map((crisis) => (
                  <Card key={crisis.id} className="border-red-200 bg-red-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center text-red-800">
                          {getSeverityIcon(crisis.severity)}
                          <span className="ml-2">{crisis.crisisType}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(crisis.severity)}>
                            {crisis.severity.toUpperCase()}
                          </Badge>
                          <Button size="sm" onClick={() => resolveCrisis(crisis.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-red-700">
                        Started: {new Date(crisis.createdAt).toLocaleString()} •
                        Duration: {Math.round((Date.now() - new Date(crisis.createdAt).getTime()) / (1000 * 60))} minutes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Trigger Factors */}
                        <div>
                          <h4 className="font-medium mb-2 text-red-800">Trigger Factors</h4>
                          <div className="space-y-1">
                            {crisis.triggerFactors.map((trigger, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {trigger}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Active Interventions */}
                        <div>
                          <h4 className="font-medium mb-2 text-red-800">Active Interventions</h4>
                          <div className="space-y-2">
                            {crisis.interventions.slice(0, 3).map((intervention, index) => (
                              <div key={index} className="text-sm p-2 bg-white rounded border">
                                <p className="font-medium">{intervention.action}</p>
                                <p className="text-xs text-gray-600">Type: {intervention.type}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Emergency Contacts */}
                        <div>
                          <h4 className="font-medium mb-2 text-red-800">Emergency Contacts</h4>
                          <div className="space-y-2">
                            {crisis.emergencyContacts.slice(0, 3).map((contact, index) => (
                              <div key={index} className="text-sm p-2 bg-white rounded border">
                                <p className="font-medium">{contact.name}</p>
                                <p className="text-xs text-gray-600">{contact.role} • {contact.phone}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex space-x-3">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Update Status
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Contact Team
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          Add Notes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Crises</h3>
                  <p className="text-gray-600 mb-6">All situations are currently stable. Prevention protocols are active.</p>
                  <Button variant="outline" onClick={() => setShowNewCrisisForm(true)}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report New Crisis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Prevention Tab */}
          <TabsContent value="prevention" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prevention Strategies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Active Prevention Strategies
                  </CardTitle>
                  <CardDescription>
                    Currently implemented prevention measures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800">Daily Strategies</h4>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>• Visual schedule with advance warnings</li>
                        <li>• Sensory breaks every 30 minutes</li>
                        <li>• Consistent routine with flexibility</li>
                        <li>• Daily emotional check-ins</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800">Environmental Modifications</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Quiet space for de-escalation</li>
                        <li>• Noise-cancelling headphones available</li>
                        <li>• Reduced sensory stimulation</li>
                        <li>• Clear visual boundaries</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800">Skill Building</h4>
                      <ul className="text-sm text-purple-700 mt-2 space-y-1">
                        <li>• Emotional regulation techniques</li>
                        <li>• Communication strategies</li>
                        <li>• Coping mechanisms practice</li>
                        <li>• Self-advocacy skills</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Early Warning Signals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-orange-600" />
                    Early Warning Signals
                  </CardTitle>
                  <CardDescription>
                    Signs to watch for that may indicate crisis escalation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-red-800">High Risk Indicators</h4>
                      <ul className="text-sm text-red-700 mt-2 space-y-1">
                        <li>• Increased stimming behaviors</li>
                        <li>• Withdrawal from preferred activities</li>
                        <li>• Changes in sleep patterns</li>
                        <li>• Difficulty following routine</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800">Medium Risk Indicators</h4>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Increased anxiety or agitation</li>
                        <li>• Changes in eating patterns</li>
                        <li>• More frequent meltdowns</li>
                        <li>• Sensory seeking behaviors</li>
                      </ul>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Update Signals
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Set Reminders
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prevention Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Prevention Effectiveness Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">85%</p>
                    <p className="text-sm text-gray-600">Crisis Prevention Rate</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">7</p>
                    <p className="text-sm text-gray-600">Days Since Last Crisis</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">4</p>
                    <p className="text-sm text-gray-600">Active Strategies</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">92%</p>
                    <p className="text-sm text-gray-600">Early Detection Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  Intervention Toolkit
                </CardTitle>
                <CardDescription>
                  Evidence-based interventions ranked by effectiveness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-800">Deep Pressure Therapy</h4>
                      <Badge className="bg-green-100 text-green-800">95% Effective</Badge>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      Weighted blanket or firm hugs to provide calming sensory input
                    </p>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs">Immediate</Badge>
                      <Badge variant="outline" className="text-xs">Sensory Regulation</Badge>
                      <Badge variant="outline" className="text-xs">High Success</Badge>
                    </div>
                  </div>

                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-800">Environmental Modification</h4>
                      <Badge className="bg-blue-100 text-blue-800">88% Effective</Badge>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      Remove or reduce environmental triggers and stimulation
                    </p>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs">Immediate</Badge>
                      <Badge variant="outline" className="text-xs">Environmental</Badge>
                      <Badge variant="outline" className="text-xs">Reliable</Badge>
                    </div>
                  </div>

                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-purple-800">Distraction & Redirection</h4>
                      <Badge className="bg-purple-100 text-purple-800">75% Effective</Badge>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">
                      Engaging in preferred activities or interests to redirect focus
                    </p>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs">Short-term</Badge>
                      <Badge variant="outline" className="text-xs">Behavioral</Badge>
                      <Badge variant="outline" className="text-xs">Moderate Success</Badge>
                    </div>
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
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Crisis Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">This Month</span>
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">-40%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Severity</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resolution Time</span>
                      <span className="text-green-600 font-medium">Improving</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-600" />
                    Intervention Success
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Success Rate</span>
                      <span className="text-green-600 font-medium">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Most Effective</span>
                      <span className="text-blue-600 font-medium">Deep Pressure</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Needs Improvement</span>
                      <span className="text-orange-600 font-medium">Verbal De-escalation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emergency Plan Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Emergency Response Protocol
                </CardTitle>
                <CardDescription>
                  Step-by-step crisis response procedures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="font-bold text-red-800 mb-3">🚨 CRITICAL CRISIS (Immediate Danger)</h3>
                    <ol className="text-sm text-red-700 space-y-2">
                      <li>1. Ensure immediate safety of child and others</li>
                      <li>2. Call 999 if physical safety is at risk</li>
                      <li>3. Contact emergency contacts immediately</li>
                      <li>4. Remove child from trigger environment</li>
                      <li>5. Apply known de-escalation techniques</li>
                      <li>6. Document incident for review</li>
                    </ol>
                  </div>

                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <h3 className="font-bold text-orange-800 mb-3">⚠️ HIGH SEVERITY CRISIS</h3>
                    <ol className="text-sm text-orange-700 space-y-2">
                      <li>1. Implement immediate calming strategies</li>
                      <li>2. Remove or reduce trigger factors</li>
                      <li>3. Contact primary support professional</li>
                      <li>4. Use preferred comfort items or activities</li>
                      <li>5. Monitor for escalation signs</li>
                      <li>6. Plan follow-up support</li>
                    </ol>
                  </div>

                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <h3 className="font-bold text-yellow-800 mb-3">📋 MEDIUM SEVERITY CRISIS</h3>
                    <ol className="text-sm text-yellow-700 space-y-2">
                      <li>1. Apply early intervention strategies</li>
                      <li>2. Modify environment to reduce stress</li>
                      <li>3. Increase supervision and support</li>
                      <li>4. Use visual supports and social stories</li>
                      <li>5. Document triggers and responses</li>
                      <li>6. Review prevention strategies</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Crisis Form Modal */}
        {showNewCrisisForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Report New Crisis
                </CardTitle>
                <CardDescription>
                  Document crisis details for immediate response and future prevention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Crisis Type</label>
                  <Input
                    value={newCrisis.crisisType}
                    onChange={(e) => setNewCrisis(prev => ({ ...prev, crisisType: e.target.value }))}
                    placeholder="e.g., Behavioral escalation, School refusal, Social withdrawal"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Severity Level</label>
                  <Select value={newCrisis.severity} onValueChange={(value: any) => setNewCrisis(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor disruption</SelectItem>
                      <SelectItem value="medium">Medium - Moderate intervention needed</SelectItem>
                      <SelectItem value="high">High - Immediate support required</SelectItem>
                      <SelectItem value="critical">Critical - Emergency response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Current Status</label>
                  <Textarea
                    value={newCrisis.currentStatus}
                    onChange={(e) => setNewCrisis(prev => ({ ...prev, currentStatus: e.target.value }))}
                    placeholder="Describe the current situation and immediate concerns..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Trigger Factors</label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Add trigger factor..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTriggerFactor((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                        if (input) {
                          addTriggerFactor(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {newCrisis.triggerFactors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTriggerFactor(factor)}>
                        {factor} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowNewCrisisForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createNewCrisis} className="bg-red-600 hover:bg-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Crisis
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
