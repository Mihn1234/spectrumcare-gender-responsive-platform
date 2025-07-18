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
  Building2,
  Globe,
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
  MapPinned,
  Cog,
  Hash,
  Layers,
  Map,
  Satellite,
  TreePine,
  Mountain,
  Waves,
  Sun,
  Cloud,
  Snowflake,
  Compass,
  Navigation,
  Route,
  MapPin as MapPinIcon,
  Radar,
  Signal
} from 'lucide-react';

interface Authority {
  id: string;
  name: string;
  region: string;
  population: number;
  totalCases: number;
  activeStaff: number;
  performanceScore: number;
  budgetUtilization: number;
  complianceScore: number;
  coordinates: { lat: number; lng: number };
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
  lastUpdated: string;
}

interface CrossAuthorityMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  benchmark: number;
  authorities: Array<{
    name: string;
    value: number;
    rank: number;
  }>;
}

interface ResourceSharing {
  resourceType: string;
  fromAuthority: string;
  toAuthority: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'completed';
  costSaving: number;
}

interface EnterpriseInitiative {
  id: string;
  name: string;
  description: string;
  scope: string[];
  progress: number;
  budget: number;
  spent: number;
  roiProjected: number;
  roiActual?: number;
  startDate: string;
  endDate: string;
  status: string;
  owner: string;
}

interface EnterpriseData {
  overview: {
    totalAuthorities: number;
    totalPopulation: number;
    totalCases: number;
    totalStaff: number;
    aggregatePerformance: number;
    totalBudget: number;
    costSavings: number;
  };
  authorities: Authority[];
  crossAuthorityMetrics: CrossAuthorityMetric[];
  resourceSharing: ResourceSharing[];
  enterpriseInitiatives: EnterpriseInitiative[];
  benchmarks: {
    national: {
      averageProcessingTime: number;
      completionRate: number;
      qualityScore: number;
      costPerCase: number;
    };
    regional: {
      averageProcessingTime: number;
      completionRate: number;
      qualityScore: number;
      costPerCase: number;
    };
  };
  alerts: Array<{
    type: string;
    title: string;
    description: string;
    authority?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }>;
}

export default function EnterprisePortalPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedAuthority, setSelectedAuthority] = useState<Authority | null>(null);
  const [mapView, setMapView] = useState<'performance' | 'caseload' | 'budget'>('performance');

  useEffect(() => {
    loadEnterpriseData();
  }, []);

  const loadEnterpriseData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Simulate enterprise data for multiple authorities
      const mockData: EnterpriseData = {
        overview: {
          totalAuthorities: 8,
          totalPopulation: 2840000,
          totalCases: 18947,
          totalStaff: 267,
          aggregatePerformance: 91,
          totalBudget: 47800000,
          costSavings: 8900000
        },
        authorities: [
          {
            id: 'auth-001',
            name: 'Hertfordshire County Council',
            region: 'East of England',
            population: 1198000,
            totalCases: 4847,
            activeStaff: 67,
            performanceScore: 89,
            budgetUtilization: 92,
            complianceScore: 94,
            coordinates: { lat: 51.7520, lng: -0.3367 },
            status: 'good',
            lastUpdated: '2024-01-30T15:30:00Z'
          },
          {
            id: 'auth-002',
            name: 'Essex County Council',
            region: 'East of England',
            population: 1493000,
            totalCases: 6234,
            activeStaff: 89,
            performanceScore: 94,
            budgetUtilization: 87,
            complianceScore: 96,
            coordinates: { lat: 51.5714, lng: 0.4909 },
            status: 'excellent',
            lastUpdated: '2024-01-30T15:30:00Z'
          },
          {
            id: 'auth-003',
            name: 'Surrey County Council',
            region: 'South East',
            population: 1203000,
            totalCases: 3891,
            activeStaff: 52,
            performanceScore: 96,
            budgetUtilization: 91,
            complianceScore: 98,
            coordinates: { lat: 51.2362, lng: -0.5704 },
            status: 'excellent',
            lastUpdated: '2024-01-30T15:30:00Z'
          },
          {
            id: 'auth-004',
            name: 'Kent County Council',
            region: 'South East',
            population: 1589000,
            totalCases: 4567,
            activeStaff: 63,
            performanceScore: 88,
            budgetUtilization: 95,
            complianceScore: 89,
            coordinates: { lat: 51.2787, lng: 0.5217 },
            status: 'good',
            lastUpdated: '2024-01-30T15:30:00Z'
          },
          {
            id: 'auth-005',
            name: 'Birmingham City Council',
            region: 'West Midlands',
            population: 1141000,
            totalCases: 5789,
            activeStaff: 78,
            performanceScore: 82,
            budgetUtilization: 98,
            complianceScore: 85,
            coordinates: { lat: 52.4862, lng: -1.8904 },
            status: 'needs_attention',
            lastUpdated: '2024-01-30T15:30:00Z'
          },
          {
            id: 'auth-006',
            name: 'Manchester City Council',
            region: 'North West',
            population: 547000,
            totalCases: 2134,
            activeStaff: 28,
            performanceScore: 93,
            budgetUtilization: 89,
            complianceScore: 95,
            coordinates: { lat: 53.4808, lng: -2.2426 },
            status: 'excellent',
            lastUpdated: '2024-01-30T15:30:00Z'
          },
          {
            id: 'auth-007',
            name: 'Leeds City Council',
            region: 'Yorkshire',
            population: 793000,
            totalCases: 3456,
            activeStaff: 47,
            performanceScore: 87,
            budgetUtilization: 93,
            complianceScore: 91,
            coordinates: { lat: 53.8008, lng: -1.5491 },
            status: 'good',
            lastUpdated: '2024-01-30T15:30:00Z'
          },
          {
            id: 'auth-008',
            name: 'Newcastle City Council',
            region: 'North East',
            population: 302000,
            totalCases: 1029,
            activeStaff: 14,
            performanceScore: 91,
            budgetUtilization: 86,
            complianceScore: 93,
            coordinates: { lat: 54.9783, lng: -1.6178 },
            status: 'good',
            lastUpdated: '2024-01-30T15:30:00Z'
          }
        ],
        crossAuthorityMetrics: [
          {
            name: 'Average Case Processing Time',
            value: 15.7,
            unit: 'weeks',
            change: -8.2,
            trend: 'down',
            benchmark: 18.0,
            authorities: [
              { name: 'Surrey', value: 14.2, rank: 1 },
              { name: 'Manchester', value: 14.8, rank: 2 },
              { name: 'Essex', value: 15.1, rank: 3 },
              { name: 'Hertfordshire', value: 16.2, rank: 4 }
            ]
          },
          {
            name: 'Compliance Score',
            value: 92.6,
            unit: '%',
            change: +5.1,
            trend: 'up',
            benchmark: 90.0,
            authorities: [
              { name: 'Surrey', value: 98, rank: 1 },
              { name: 'Essex', value: 96, rank: 2 },
              { name: 'Manchester', value: 95, rank: 3 },
              { name: 'Hertfordshire', value: 94, rank: 4 }
            ]
          },
          {
            name: 'Cost Per Case',
            value: 2520,
            unit: '£',
            change: -12.8,
            trend: 'down',
            benchmark: 2800,
            authorities: [
              { name: 'Newcastle', value: 2180, rank: 1 },
              { name: 'Leeds', value: 2340, rank: 2 },
              { name: 'Manchester', value: 2410, rank: 3 },
              { name: 'Surrey', value: 2580, rank: 4 }
            ]
          }
        ],
        resourceSharing: [
          {
            resourceType: 'Educational Psychologists',
            fromAuthority: 'Surrey County Council',
            toAuthority: 'Kent County Council',
            quantity: 3,
            startDate: '2024-02-01',
            endDate: '2024-05-31',
            status: 'active',
            costSaving: 145000
          },
          {
            resourceType: 'SEND Officers',
            fromAuthority: 'Essex County Council',
            toAuthority: 'Hertfordshire County Council',
            quantity: 2,
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            status: 'active',
            costSaving: 89000
          },
          {
            resourceType: 'Health Coordinators',
            fromAuthority: 'Manchester City Council',
            toAuthority: 'Leeds City Council',
            quantity: 1,
            startDate: '2024-02-15',
            endDate: '2024-06-15',
            status: 'pending',
            costSaving: 67000
          }
        ],
        enterpriseInitiatives: [
          {
            id: 'ent-001',
            name: 'Cross-Authority AI Implementation',
            description: 'Deployment of unified AI-powered case management across all authorities',
            scope: ['auth-001', 'auth-002', 'auth-003', 'auth-004'],
            progress: 73,
            budget: 2800000,
            spent: 1950000,
            roiProjected: 420,
            roiActual: 380,
            startDate: '2023-06-01',
            endDate: '2024-08-31',
            status: 'On Track',
            owner: 'Dr. Sarah Mitchell'
          },
          {
            id: 'ent-002',
            name: 'Regional Resource Sharing Network',
            description: 'Standardized resource sharing protocols and optimization system',
            scope: ['auth-001', 'auth-002', 'auth-003', 'auth-004', 'auth-005'],
            progress: 56,
            budget: 1200000,
            spent: 720000,
            roiProjected: 280,
            startDate: '2023-09-01',
            endDate: '2024-12-31',
            status: 'On Track',
            owner: 'Mark Thompson'
          },
          {
            id: 'ent-003',
            name: 'Unified Compliance Framework',
            description: 'Standardized compliance monitoring and reporting across all authorities',
            scope: ['auth-001', 'auth-002', 'auth-003', 'auth-004', 'auth-005', 'auth-006', 'auth-007', 'auth-008'],
            progress: 89,
            budget: 950000,
            spent: 834000,
            roiProjected: 190,
            roiActual: 210,
            startDate: '2023-03-01',
            endDate: '2024-06-30',
            status: 'Ahead',
            owner: 'Rachel Martinez'
          }
        ],
        benchmarks: {
          national: {
            averageProcessingTime: 19.2,
            completionRate: 84,
            qualityScore: 87,
            costPerCase: 3100
          },
          regional: {
            averageProcessingTime: 17.8,
            completionRate: 88,
            qualityScore: 89,
            costPerCase: 2850
          }
        },
        alerts: [
          {
            type: 'performance',
            title: 'Birmingham Performance Decline',
            description: 'Performance score dropped below 85% threshold',
            authority: 'Birmingham City Council',
            severity: 'high',
            timestamp: '2024-01-30T09:00:00Z'
          },
          {
            type: 'resource',
            title: 'Kent Resource Shortage',
            description: 'Educational psychologist capacity at 98%',
            authority: 'Kent County Council',
            severity: 'medium',
            timestamp: '2024-01-30T11:30:00Z'
          },
          {
            type: 'initiative',
            title: 'AI Implementation Milestone',
            description: 'Phase 2 deployment completed ahead of schedule',
            severity: 'low',
            timestamp: '2024-01-30T14:15:00Z'
          }
        ]
      };

      setEnterpriseData(mockData);
    } catch (error) {
      console.error('Error loading enterprise data:', error);
      setError('Failed to load enterprise data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
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
    if (amount >= 1000000) return `£${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `£${(amount / 1000).toFixed(0)}k`;
    return `£${amount}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleAuthorityAction = async (authorityId: string, action: string) => {
    try {
      alert(`${action} action for authority ${authorityId} - Implementation needed`);
    } catch (error) {
      setError(`Failed to ${action.toLowerCase()} authority`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600">Loading Enterprise Portal...</p>
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
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Enterprise Portal</h1>
                  <p className="text-sm text-gray-500">Multi-Authority Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className="bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                Enterprise Admin
              </Badge>
              <div className="text-right">
                <p className="font-semibold text-gray-900">Dr. Sarah Mitchell</p>
                <p className="text-sm text-gray-600">Chief Technology Officer</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/la-portal/executive')}>
                <Building className="h-4 w-4 mr-2" />
                Authority View
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

        {!enterpriseData ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Enterprise Portal</h3>
              <p className="text-gray-600 mb-6">Loading multi-authority enterprise management system</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Enterprise System Banner */}
            <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">🏛️ Enterprise LA Management System</h2>
                  <p className="text-purple-100 mb-4">
                    Unified coordination and optimization across {enterpriseData.overview.totalAuthorities} local authorities capturing the £1B+ SEND market
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-3xl font-bold">{enterpriseData.overview.totalAuthorities}</div>
                      <div className="text-sm">Authorities</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-3xl font-bold">{(enterpriseData.overview.totalPopulation / 1000000).toFixed(1)}M</div>
                      <div className="text-sm">Population Served</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-3xl font-bold">{enterpriseData.overview.totalCases.toLocaleString()}</div>
                      <div className="text-sm">Active Cases</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-3xl font-bold">{formatCurrency(enterpriseData.overview.costSavings)}</div>
                      <div className="text-sm">Annual Savings</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critical Enterprise Alerts */}
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <Alert className="h-5 w-5 mr-2" />
                  Enterprise-Wide Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {enterpriseData.alerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} bg-white`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {alert.type === 'performance' && <Target className="h-4 w-4" />}
                          {alert.type === 'resource' && <Users className="h-4 w-4" />}
                          {alert.type === 'initiative' && <Zap className="h-4 w-4" />}
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <span className="text-xs">{formatDate(alert.timestamp)}</span>
                      </div>
                      <h4 className="font-medium mb-1">{alert.title}</h4>
                      <p className="text-sm mb-3">{alert.description}</p>
                      {alert.authority && (
                        <p className="text-xs font-medium mb-3">Authority: {alert.authority}</p>
                      )}
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
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="authorities">Authorities</TabsTrigger>
                <TabsTrigger value="metrics">Cross-Authority</TabsTrigger>
                <TabsTrigger value="resources">Resource Sharing</TabsTrigger>
                <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
                <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Enterprise Performance Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise Performance Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-3xl font-bold text-green-900">{enterpriseData.overview.aggregatePerformance}%</div>
                        <p className="text-green-700">Aggregate Performance</p>
                        <p className="text-xs text-green-600 mt-1">+7% vs National Average</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-3xl font-bold text-blue-900">{formatCurrency(enterpriseData.overview.totalBudget)}</div>
                        <p className="text-blue-700">Total Budget</p>
                        <p className="text-xs text-blue-600 mt-1">Across all authorities</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-3xl font-bold text-purple-900">{enterpriseData.overview.totalStaff}</div>
                        <p className="text-purple-700">Total Staff</p>
                        <p className="text-xs text-purple-600 mt-1">SEND professionals</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-3xl font-bold text-orange-900">{formatCurrency(enterpriseData.overview.costSavings)}</div>
                        <p className="text-orange-700">Cost Savings</p>
                        <p className="text-xs text-orange-600 mt-1">Through optimization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Authority Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Authority Performance Overview
                      <Select value={mapView} onValueChange={(value: 'performance' | 'caseload' | 'budget') => setMapView(value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performance">Performance View</SelectItem>
                          <SelectItem value="caseload">Caseload View</SelectItem>
                          <SelectItem value="budget">Budget View</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {enterpriseData.authorities.map((authority, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${getStatusColor(authority.status)} cursor-pointer hover:shadow-md transition-shadow`}
                             onClick={() => setSelectedAuthority(authority)}>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-sm">{authority.name}</h4>
                              <p className="text-xs opacity-80">{authority.region}</p>
                            </div>
                            <Badge className={getStatusColor(authority.status)}>
                              {authority.status.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Performance:</span>
                              <span className="font-medium">{authority.performanceScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cases:</span>
                              <span className="font-medium">{authority.totalCases.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Staff:</span>
                              <span className="font-medium">{authority.activeStaff}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Budget:</span>
                              <span className="font-medium">{authority.budgetUtilization}%</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <Progress value={authority.performanceScore} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Enterprise Initiatives Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Enterprise Initiatives Summary
                      <Button variant="outline" size="sm" onClick={() => setSelectedTab('initiatives')}>
                        Manage All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {enterpriseData.enterpriseInitiatives.slice(0, 3).map((initiative, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium">{initiative.name}</h4>
                            <Badge className={
                              initiative.status === 'On Track' ? 'bg-green-100 text-green-800' :
                              initiative.status === 'Ahead' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {initiative.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{initiative.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress:</span>
                              <span className="font-medium">{initiative.progress}%</span>
                            </div>
                            <Progress value={initiative.progress} className="h-2" />
                            <div className="flex justify-between text-sm">
                              <span>Budget:</span>
                              <span className="font-medium">{formatCurrency(initiative.budget)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>ROI:</span>
                              <span className="font-medium text-green-600">{initiative.roiActual || initiative.roiProjected}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Authorities Tab */}
              <TabsContent value="authorities" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Authority Management</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Authority
                  </Button>
                </div>

                {/* Authority Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enterpriseData.authorities.map((authority, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{authority.name}</CardTitle>
                            <CardDescription>
                              {authority.region} • Population: {(authority.population / 1000).toFixed(0)}k
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(authority.status)}>
                            {authority.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Key Metrics */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Performance Score</span>
                                <span className="font-medium">{authority.performanceScore}%</span>
                              </div>
                              <Progress value={authority.performanceScore} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Compliance Score</span>
                                <span className="font-medium">{authority.complianceScore}%</span>
                              </div>
                              <Progress value={authority.complianceScore} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Budget Utilization</span>
                                <span className="font-medium">{authority.budgetUtilization}%</span>
                              </div>
                              <Progress value={authority.budgetUtilization} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Staff Efficiency</span>
                                <span className="font-medium">{Math.round(authority.totalCases / authority.activeStaff)}</span>
                              </div>
                              <p className="text-xs text-gray-600">cases per staff</p>
                            </div>
                          </div>

                          {/* Statistics */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <p className="font-bold text-blue-900">{authority.totalCases.toLocaleString()}</p>
                              <p className="text-blue-700">Active Cases</p>
                            </div>
                            <div className="text-center p-2 bg-green-50 rounded">
                              <p className="font-bold text-green-900">{authority.activeStaff}</p>
                              <p className="text-green-700">Staff Members</p>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded">
                              <p className="font-bold text-purple-900">{(authority.population / 1000).toFixed(0)}k</p>
                              <p className="text-purple-700">Population</p>
                            </div>
                          </div>

                          {/* Last Updated */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Last updated: {formatDate(authority.lastUpdated)}</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Live</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" onClick={() => setSelectedAuthority(authority)}>
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAuthorityAction(authority.id, 'Manage')}>
                              <Settings className="h-3 w-3 mr-1" />
                              Manage
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAuthorityAction(authority.id, 'Report')}>
                              <FileText className="h-3 w-3 mr-1" />
                              Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Cross-Authority Metrics Tab */}
              <TabsContent value="metrics" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Cross-Authority Analytics</h2>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {enterpriseData.crossAuthorityMetrics.map((metric, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{metric.name}</CardTitle>
                            <CardDescription>Enterprise-wide performance</CardDescription>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(metric.trend)}
                            <Badge className={
                              metric.change > 0 && metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                              metric.change < 0 && metric.trend === 'down' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {metric.change > 0 ? '+' : ''}{metric.change}%
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Current Value */}
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">
                              {metric.value}{metric.unit}
                            </div>
                            <div className="text-sm text-gray-600">
                              Benchmark: {metric.benchmark}{metric.unit}
                            </div>
                          </div>

                          {/* Progress to Benchmark */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>vs Benchmark</span>
                              <span className="font-medium">
                                {Math.round((metric.value / metric.benchmark) * 100)}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min((metric.value / metric.benchmark) * 100, 100)}
                              className="h-3"
                            />
                          </div>

                          {/* Top Performers */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">Top Performers:</h4>
                            <div className="space-y-1">
                              {metric.authorities.slice(0, 3).map((auth, authIndex) => (
                                <div key={authIndex} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-4 h-4 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                      {auth.rank}
                                    </span>
                                    <span>{auth.name}</span>
                                  </div>
                                  <span className="font-medium">{auth.value}{metric.unit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Cross-Authority Comparison Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Authority Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Cross-Authority Comparison Chart</p>
                        <p className="text-sm text-gray-400">Interactive performance visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resource Sharing Tab */}
              <TabsContent value="resources" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Resource Sharing Network</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sharing Agreement
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enterpriseData.resourceSharing.map((sharing, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold">{sharing.resourceType}</h3>
                            <p className="text-sm text-gray-600">
                              {sharing.quantity} professional{sharing.quantity > 1 ? 's' : ''} sharing
                            </p>
                          </div>
                          <Badge className={
                            sharing.status === 'active' ? 'bg-green-100 text-green-800' :
                            sharing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {sharing.status}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">From:</span>
                            <span className="font-medium text-sm">{sharing.fromAuthority}</span>
                          </div>
                          <div className="text-center">
                            <ArrowRight className="h-4 w-4 mx-auto text-gray-400" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">To:</span>
                            <span className="font-medium text-sm">{sharing.toAuthority}</span>
                          </div>

                          <Separator />

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Start Date:</span>
                              <p className="font-medium">{formatDate(sharing.startDate)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">End Date:</span>
                              <p className="font-medium">{formatDate(sharing.endDate)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-gray-600">Cost Saving:</span>
                            <span className="font-bold text-green-600">{formatCurrency(sharing.costSaving)}</span>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Resource Optimization Opportunities */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-800">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      AI-Powered Resource Optimization Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Cross-Regional Sharing</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Kent could share 2 Educational Psychologists with Birmingham for 6 months, saving £180k
                        </p>
                        <Button size="sm" className="w-full">Propose Sharing</Button>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Capacity Optimization</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Surrey has 15% spare capacity that could support Essex's peak demand periods
                        </p>
                        <Button size="sm" className="w-full">Create Agreement</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enterprise Initiatives Tab */}
              <TabsContent value="initiatives" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Enterprise Initiatives</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Initiative
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enterpriseData.enterpriseInitiatives.map((initiative, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{initiative.name}</CardTitle>
                            <CardDescription>{initiative.description}</CardDescription>
                          </div>
                          <Badge className={
                            initiative.status === 'On Track' ? 'bg-green-100 text-green-800' :
                            initiative.status === 'Ahead' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {initiative.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Progress */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span className="font-medium">{initiative.progress}%</span>
                            </div>
                            <Progress value={initiative.progress} className="h-3" />
                          </div>

                          {/* Scope */}
                          <div>
                            <p className="text-sm font-medium mb-2">Scope ({initiative.scope.length} authorities):</p>
                            <div className="text-xs text-gray-600">
                              {initiative.scope.map(authId =>
                                enterpriseData.authorities.find(a => a.id === authId)?.name
                              ).join(', ')}
                            </div>
                          </div>

                          {/* Financial Metrics */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Budget:</span>
                              <p className="font-medium">{formatCurrency(initiative.budget)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Spent:</span>
                              <p className="font-medium">{formatCurrency(initiative.spent)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">ROI Projected:</span>
                              <p className="font-medium text-green-600">{initiative.roiProjected}%</p>
                            </div>
                            <div>
                              <span className="text-gray-600">ROI Actual:</span>
                              <p className="font-medium text-green-600">
                                {initiative.roiActual ? `${initiative.roiActual}%` : 'TBD'}
                              </p>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Start Date:</span>
                              <p className="font-medium">{formatDate(initiative.startDate)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">End Date:</span>
                              <p className="font-medium">{formatDate(initiative.endDate)}</p>
                            </div>
                          </div>

                          {/* Owner */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-gray-600">Initiative Owner:</span>
                            <span className="font-medium">{initiative.owner}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1" />
                              Update
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Benchmarks Tab */}
              <TabsContent value="benchmarks" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Performance Benchmarks</h2>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Benchmark Report
                  </Button>
                </div>

                {/* Benchmark Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>National Benchmark Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Processing Time</span>
                            <span>15.7 wks vs 19.2 wks (National)</span>
                          </div>
                          <Progress value={(15.7 / 19.2) * 100} className="h-3" />
                          <p className="text-xs text-green-600 mt-1">18% better than national average</p>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion Rate</span>
                            <span>91% vs 84% (National)</span>
                          </div>
                          <Progress value={91} className="h-3" />
                          <p className="text-xs text-green-600 mt-1">7% above national average</p>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Quality Score</span>
                            <span>92.6% vs 87% (National)</span>
                          </div>
                          <Progress value={92.6} className="h-3" />
                          <p className="text-xs text-green-600 mt-1">5.6% above national average</p>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Cost Per Case</span>
                            <span>£2,520 vs £3,100 (National)</span>
                          </div>
                          <Progress value={(2520 / 3100) * 100} className="h-3" />
                          <p className="text-xs text-green-600 mt-1">19% more cost effective</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Regional Benchmark Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Processing Time</span>
                            <span>15.7 wks vs 17.8 wks (Regional)</span>
                          </div>
                          <Progress value={(15.7 / 17.8) * 100} className="h-3" />
                          <p className="text-xs text-green-600 mt-1">12% better than regional average</p>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion Rate</span>
                            <span>91% vs 88% (Regional)</span>
                          </div>
                          <Progress value={91} className="h-3" />
                          <p className="text-xs text-green-600 mt-1">3% above regional average</p>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Quality Score</span>
                            <span>92.6% vs 89% (Regional)</span>
                          </div>
                          <Progress value={92.6} className="h-3" />
                          <p className="text-xs text-green-600 mt-1">3.6% above regional average</p>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Cost Per Case</span>
                            <span>£2,520 vs £2,850 (Regional)</span>
                          </div>
                          <Progress value={(2520 / 2850) * 100} className="h-3" />
                          <p className="text-xs text-green-600 mt-1">12% more cost effective</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Benchmark Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <LineChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Enterprise Performance Trends</p>
                        <p className="text-sm text-gray-400">12-month comparative analysis vs benchmarks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Authority Detail Modal */}
        {selectedAuthority && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{selectedAuthority.name}</span>
                      <Badge className={getStatusColor(selectedAuthority.status)}>
                        {selectedAuthority.status.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedAuthority.region} • Population: {(selectedAuthority.population / 1000).toFixed(0)}k • {selectedAuthority.totalCases} cases
                    </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedAuthority(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Performance Overview</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Performance Score</span>
                          <span className="font-medium">{selectedAuthority.performanceScore}%</span>
                        </div>
                        <Progress value={selectedAuthority.performanceScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Compliance Score</span>
                          <span className="font-medium">{selectedAuthority.complianceScore}%</span>
                        </div>
                        <Progress value={selectedAuthority.complianceScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Budget Utilization</span>
                          <span className="font-medium">{selectedAuthority.budgetUtilization}%</span>
                        </div>
                        <Progress value={selectedAuthority.budgetUtilization} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Key Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="font-bold text-blue-900">{selectedAuthority.totalCases.toLocaleString()}</p>
                        <p className="text-blue-700">Active Cases</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="font-bold text-green-900">{selectedAuthority.activeStaff}</p>
                        <p className="text-green-700">Staff Members</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="font-bold text-purple-900">{(selectedAuthority.population / 1000).toFixed(0)}k</p>
                        <p className="text-purple-700">Population</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="font-bold text-orange-900">{Math.round(selectedAuthority.totalCases / selectedAuthority.activeStaff)}</p>
                        <p className="text-orange-700">Cases/Staff</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6 pt-6 border-t">
                  <Button onClick={() => handleAuthorityAction(selectedAuthority.id, 'Manage')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Authority
                  </Button>
                  <Button variant="outline" onClick={() => handleAuthorityAction(selectedAuthority.id, 'Analyze')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Deep Analysis
                  </Button>
                  <Button variant="outline" onClick={() => handleAuthorityAction(selectedAuthority.id, 'Report')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" onClick={() => handleAuthorityAction(selectedAuthority.id, 'Resources')}>
                    <Users className="h-4 w-4 mr-2" />
                    Resource Planning
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
