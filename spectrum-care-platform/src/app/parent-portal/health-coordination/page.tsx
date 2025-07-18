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
  Heart,
  Calendar,
  Pill,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Phone,
  MapPin,
  Plus,
  Download,
  Share,
  TrendingUp,
  TrendingDown,
  Star,
  Bell,
  Settings,
  Home,
  ArrowLeft,
  Stethoscope,
  Brain,
  Zap,
  Target,
  BarChart3,
  FileText,
  Users,
  Shield,
  Edit,
  Eye,
  MessageSquare,
  Lightbulb,
  Award,
  Timer,
  PieChart
} from 'lucide-react';

interface HealthData {
  childId: string;
  lastUpdated: string;
  overallHealthScore: number;
  appointments: any[];
  medications: any[];
  therapySessions: any[];
  emergencyInfo: any;
  vitalSigns: any;
  healthMetrics: any;
  analytics: any;
  insights: any;
}

export default function HealthCoordinationPage() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState('demo-child-id');
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [showNewMedicationForm, setShowNewMedicationForm] = useState(false);
  const [showTherapySessionForm, setShowTherapySessionForm] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    providerId: '',
    providerName: '',
    appointmentType: '',
    scheduledDate: '',
    duration: 60,
    notes: ''
  });

  const [newMedication, setNewMedication] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    prescribedBy: '',
    purpose: ''
  });

  const [newTherapySession, setNewTherapySession] = useState({
    therapyType: '',
    providerId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    duration: 45,
    goals: [] as string[],
    progressRating: 3,
    progressNotes: ''
  });

  useEffect(() => {
    loadHealthData();
  }, [selectedChild]);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `/api/parent-portal/health-management?childId=${selectedChild}&type=overview`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load health data');
      }

      const data = await response.json();
      setHealthData(data.data);

    } catch (error) {
      console.error('Error loading health data:', error);
      setError('Failed to load health coordination data');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleAppointment = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/health-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'schedule_appointment',
          childId: selectedChild,
          ...newAppointment,
          scheduledDate: new Date(newAppointment.scheduledDate).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule appointment');
      }

      await loadHealthData();
      setShowNewAppointmentForm(false);

      // Reset form
      setNewAppointment({
        providerId: '',
        providerName: '',
        appointmentType: '',
        scheduledDate: '',
        duration: 60,
        notes: ''
      });

    } catch (error) {
      console.error('Error scheduling appointment:', error);
      setError('Failed to schedule appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const addMedication = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/health-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'add_medication',
          childId: selectedChild,
          ...newMedication,
          startDate: new Date(newMedication.startDate).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add medication');
      }

      await loadHealthData();
      setShowNewMedicationForm(false);

      // Reset form
      setNewMedication({
        medicationName: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().split('T')[0],
        prescribedBy: '',
        purpose: ''
      });

    } catch (error) {
      console.error('Error adding medication:', error);
      setError('Failed to add medication');
    } finally {
      setIsLoading(false);
    }
  };

  const recordTherapySession = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/health-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'record_therapy_session',
          childId: selectedChild,
          ...newTherapySession,
          sessionDate: new Date(newTherapySession.sessionDate).toISOString(),
          progress: {
            rating: newTherapySession.progressRating,
            notes: newTherapySession.progressNotes,
            milestones: []
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record therapy session');
      }

      await loadHealthData();
      setShowTherapySessionForm(false);

      // Reset form
      setNewTherapySession({
        therapyType: '',
        providerId: '',
        sessionDate: new Date().toISOString().split('T')[0],
        duration: 45,
        goals: [],
        progressRating: 3,
        progressNotes: ''
      });

    } catch (error) {
      console.error('Error recording therapy session:', error);
      setError('Failed to record therapy session');
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'rescheduled': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading health coordination data...</p>
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
                <Heart className="h-6 w-6 text-red-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Health & Therapy Coordination</h1>
                  <p className="text-sm text-gray-500">Comprehensive medical & therapy management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowNewAppointmentForm(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Records
              </Button>
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Alerts
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

        {!healthData ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Health Data Available</h3>
              <p className="text-gray-600 mb-6">Set up health coordination to manage medical appointments, medications, and therapy progress</p>
              <Button onClick={() => alert('Health setup wizard - Coming soon!')}>
                <Plus className="h-4 w-4 mr-2" />
                Setup Health Coordination
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Health Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall Health</p>
                      <p className={`text-3xl font-bold ${getHealthScoreColor(healthData.overallHealthScore).split(' ')[0]}`}>
                        {healthData.overallHealthScore}%
                      </p>
                      <p className="text-sm text-green-600">Excellent</p>
                    </div>
                    <Heart className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Next Appointment</p>
                      <p className="text-lg font-bold text-blue-600">
                        {healthData.analytics?.appointmentTrends?.nextAppointment ?
                          formatDate(healthData.analytics.appointmentTrends.nextAppointment.scheduledDate).split(',')[0] :
                          'None scheduled'}
                      </p>
                      <p className="text-sm text-blue-600">
                        {healthData.analytics?.appointmentTrends?.nextAppointment?.providerName || 'No upcoming appointments'}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Medications</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {healthData.medications.length}
                      </p>
                      <p className="text-sm text-purple-600">
                        {healthData.analytics?.medicationAnalysis?.adherenceRate || 95}% adherence
                      </p>
                    </div>
                    <Pill className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Therapy Progress</p>
                      <p className="text-3xl font-bold text-green-600">
                        {healthData.analytics?.therapyProgress?.averageProgressRating || 4.5}/5
                      </p>
                      <p className="text-sm text-green-600">
                        {healthData.analytics?.therapyProgress?.milestonesAchieved || 4} milestones
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Insights Alert */}
            {healthData.insights?.alertsAndFlags?.length > 0 && (
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <Bell className="h-4 w-4 text-orange-600" />
                <div className="ml-2">
                  <h4 className="font-medium text-orange-800">Health Alerts</h4>
                  <AlertDescription className="text-orange-700">
                    {healthData.insights.alertsAndFlags[0].message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="therapy">Therapy</TabsTrigger>
                <TabsTrigger value="emergency">Emergency Info</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Health Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                        Health Metrics
                      </CardTitle>
                      <CardDescription>
                        Key health indicators and progress tracking
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Sleep Quality</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={healthData.healthMetrics.sleepQuality * 20} className="w-24" />
                            <span className="text-sm font-bold">{healthData.healthMetrics.sleepQuality}/5</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Appetite Rating</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={healthData.healthMetrics.appetiteRating * 20} className="w-24" />
                            <span className="text-sm font-bold">{healthData.healthMetrics.appetiteRating}/5</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Behavior Stability</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={healthData.healthMetrics.behaviorStability * 20} className="w-24" />
                            <span className="text-sm font-bold">{healthData.healthMetrics.behaviorStability}/5</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Parent Satisfaction</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={healthData.healthMetrics.parentSatisfaction * 20} className="w-24" />
                            <span className="text-sm font-bold">{healthData.healthMetrics.parentSatisfaction}/5</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-green-600" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription>
                        Latest health-related activities and updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {healthData.therapySessions.slice(0, 3).map((session: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Brain className="h-5 w-5 text-purple-600" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{session.therapyType}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(session.sessionDate)} • {session.providerName}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_: any, i: number) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < session.progress.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                      Key Health Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {healthData.insights?.keyInsights?.map((insight: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-orange-600 mt-1" />
                          <p className="text-sm text-gray-700 flex-1">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowNewAppointmentForm(true)}>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="font-medium mb-2">Schedule Appointment</h3>
                      <p className="text-sm text-gray-600">Book medical or therapy appointments</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowNewMedicationForm(true)}>
                    <CardContent className="p-6 text-center">
                      <Pill className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                      <h3 className="font-medium mb-2">Add Medication</h3>
                      <p className="text-sm text-gray-600">Track new medications and dosages</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowTherapySessionForm(true)}>
                    <CardContent className="p-6 text-center">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-medium mb-2">Record Session</h3>
                      <p className="text-sm text-gray-600">Log therapy progress and outcomes</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Medical Appointments</h2>
                  <Button onClick={() => setShowNewAppointmentForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{healthData.appointments.length}</p>
                      <p className="text-sm text-gray-600">Total Appointments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">{healthData.analytics?.appointmentTrends?.attendanceRate || 95}%</p>
                      <p className="text-sm text-gray-600">Attendance Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Timer className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">{healthData.analytics?.appointmentTrends?.averageDuration || 53}min</p>
                      <p className="text-sm text-gray-600">Average Duration</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Schedule</CardTitle>
                    <CardDescription>
                      Manage all medical and therapy appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {healthData.appointments.map((appointment: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                appointment.specialty === 'Speech Therapy' ? 'bg-blue-100' :
                                appointment.specialty === 'Occupational Therapy' ? 'bg-green-100' :
                                appointment.specialty === 'Pediatric Neurology' ? 'bg-purple-100' :
                                'bg-gray-100'
                              }`}>
                                {appointment.specialty === 'Speech Therapy' ? <MessageSquare className="h-6 w-6 text-blue-600" /> :
                                 appointment.specialty === 'Occupational Therapy' ? <Activity className="h-6 w-6 text-green-600" /> :
                                 appointment.specialty === 'Pediatric Neurology' ? <Brain className="h-6 w-6 text-purple-600" /> :
                                 <Stethoscope className="h-6 w-6 text-gray-600" />}
                              </div>
                              <div>
                                <h4 className="font-medium">{appointment.appointmentType}</h4>
                                <p className="text-sm text-gray-600">{appointment.providerName} • {appointment.specialty}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(appointment.scheduledDate)} • {appointment.duration} minutes
                                </p>
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {appointment.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getAppointmentStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              <div className="flex space-x-1 mt-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">{appointment.notes}</p>
                            </div>
                          )}
                          {appointment.outcomes && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <h5 className="font-medium text-green-800 mb-1">Outcomes:</h5>
                              <ul className="text-sm text-green-700">
                                {appointment.outcomes.map((outcome: any, i: number) => (
                                  <li key={i}>• {outcome}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Medication Management</h2>
                  <Button onClick={() => setShowNewMedicationForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Pill className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">{healthData.medications.length}</p>
                      <p className="text-sm text-gray-600">Active Medications</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">{healthData.analytics?.medicationAnalysis?.adherenceRate || 95}%</p>
                      <p className="text-sm text-gray-600">Adherence Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold">{healthData.analytics?.medicationAnalysis?.effectivenessScore || 4.2}/5</p>
                      <p className="text-sm text-gray-600">Effectiveness</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-2xl font-bold">{healthData.analytics?.medicationAnalysis?.sideEffectFrequency || 'Low'}</p>
                      <p className="text-sm text-gray-600">Side Effects</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Current Medications</CardTitle>
                    <CardDescription>
                      Track dosages, adherence, and effectiveness
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {healthData.medications.map((medication: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Pill className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{medication.medicationName}</h4>
                                <p className="text-sm text-gray-600">{medication.dosage} • {medication.frequency}</p>
                                <p className="text-xs text-gray-500">Prescribed by {medication.prescribedBy}</p>
                                <p className="text-xs text-gray-500">Started: {formatDate(medication.startDate)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm">Effectiveness:</span>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_: any, i: number) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < (medication.effectiveness || 4) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">Adherence:</span>
                                <Progress value={medication.adherence || 95} className="w-16" />
                                <span className="text-xs">{medication.adherence || 95}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-800 mb-1">Purpose</h5>
                              <p className="text-sm text-blue-700">{medication.purpose}</p>
                            </div>
                            {medication.sideEffects && medication.sideEffects.length > 0 && (
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <h5 className="font-medium text-orange-800 mb-1">Side Effects</h5>
                                <div className="text-sm text-orange-700">
                                  {medication.sideEffects.map((effect: any, i: number) => (
                                    <p key={i}>• {effect}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {medication.nextReview && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-sm text-yellow-800">
                                <Bell className="h-3 w-3 inline mr-1" />
                                Next review scheduled: {formatDate(medication.nextReview)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Therapy Tab */}
              <TabsContent value="therapy" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Therapy Progress</h2>
                  <Button onClick={() => setShowTherapySessionForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Session
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">{healthData.therapySessions.length}</p>
                      <p className="text-sm text-gray-600">Total Sessions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{healthData.analytics?.therapyProgress?.averageProgressRating || 4.5}/5</p>
                      <p className="text-sm text-gray-600">Average Progress</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold">{healthData.analytics?.therapyProgress?.milestonesAchieved || 4}</p>
                      <p className="text-sm text-gray-600">Milestones Achieved</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">{healthData.analytics?.therapyProgress?.consistencyScore || 98}%</p>
                      <p className="text-sm text-gray-600">Attendance</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Therapy Sessions</CardTitle>
                    <CardDescription>
                      Track progress across all therapy types
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {healthData.therapySessions.map((session: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                session.therapyType.includes('Speech') ? 'bg-blue-100' :
                                session.therapyType.includes('Occupational') ? 'bg-green-100' :
                                'bg-purple-100'
                              }`}>
                                {session.therapyType.includes('Speech') ? <MessageSquare className="h-6 w-6 text-blue-600" /> :
                                 session.therapyType.includes('Occupational') ? <Activity className="h-6 w-6 text-green-600" /> :
                                 <Brain className="h-6 w-6 text-purple-600" />}
                              </div>
                              <div>
                                <h4 className="font-medium">{session.therapyType}</h4>
                                <p className="text-sm text-gray-600">{session.providerName}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(session.sessionDate)} • {session.duration} minutes
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 mb-2">
                                <span className="text-sm">Progress:</span>
                                {[...Array(5)].map((_: any, i: number) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < session.progress.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-500">Next: {formatDate(session.nextSession)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-800 mb-2">Session Goals</h5>
                              <div className="text-sm text-blue-700">
                                {session.goals.map((goal: any, i: number) => (
                                  <p key={i}>• {goal}</p>
                                ))}
                              </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <h5 className="font-medium text-green-800 mb-2">Milestones Achieved</h5>
                              <div className="text-sm text-green-700">
                                {session.progress.milestones.map((milestone: any, i: number) => (
                                  <p key={i}>✓ {milestone}</p>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-800 mb-1">Progress Notes</h5>
                            <p className="text-sm text-gray-700">{session.progress.notes}</p>
                          </div>

                          {session.homeActivities && (
                            <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                              <h5 className="font-medium text-purple-800 mb-1">Home Activities</h5>
                              <div className="text-sm text-purple-700">
                                {session.homeActivities.map((activity: any, i: number) => (
                                  <p key={i}>• {activity}</p>
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

              {/* Emergency Info Tab */}
              <TabsContent value="emergency" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Emergency Medical Information</h2>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Information
                  </Button>
                </div>

                <Alert className="border-red-200 bg-red-50">
                  <Shield className="h-4 w-4 text-red-600" />
                  <div className="ml-2">
                    <h4 className="font-medium text-red-800">Critical Medical Information</h4>
                    <AlertDescription className="text-red-700">
                      This information is available to emergency responders and healthcare providers
                    </AlertDescription>
                  </div>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-600">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Medical Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {healthData.emergencyInfo.medicalConditions.map((condition: any, index: number) => (
                          <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="font-medium text-red-800">{condition}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-orange-600">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Allergies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {healthData.emergencyInfo.allergies.map((allergy: any, index: number) => (
                          <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <p className="font-medium text-orange-800">{allergy}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-purple-600">
                        <Pill className="h-5 w-5 mr-2" />
                        Current Medications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {healthData.emergencyInfo.currentMedications.map((medication: any, index: number) => (
                          <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="font-medium text-purple-800">{medication}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-600">
                        <Phone className="h-5 w-5 mr-2" />
                        Emergency Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {healthData.emergencyInfo.emergencyContacts.map((contact: any, index: number) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-green-800">{contact.name}</p>
                                <p className="text-sm text-green-700">{contact.relationship}</p>
                                <p className="text-sm text-green-600">{contact.phone}</p>
                              </div>
                              {contact.isPrimary && (
                                <Badge className="bg-green-100 text-green-800">Primary</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-600">
                      <FileText className="h-5 w-5 mr-2" />
                      Medical Notes & Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Special Instructions</h4>
                        <p className="text-blue-700">{healthData.emergencyInfo.medicalNotes}</p>
                      </div>
                      {healthData.emergencyInfo.hospitalPreferences && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-800 mb-2">Hospital Preferences</h4>
                          <p className="text-green-700">{healthData.emergencyInfo.hospitalPreferences}</p>
                        </div>
                      )}
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
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Health Improvement Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <p className="text-3xl font-bold text-green-600">
                            +{healthData.analytics?.healthTrends?.overallImprovement || 15}%
                          </p>
                          <p className="text-sm text-gray-600">Overall Health Improvement</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg font-bold text-blue-600">4.5/5</p>
                            <p className="text-xs text-gray-600">Therapy Progress</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-lg font-bold text-purple-600">95%</p>
                            <p className="text-xs text-gray-600">Medication Adherence</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-blue-600" />
                        Predictive Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-800">Next Review Recommendation</h4>
                          <p className="text-sm text-blue-700">
                            {formatDate(healthData.analytics?.healthTrends?.predictiveInsights?.nextReviewRecommendation || '2024-03-15')}
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800">Risk Assessment</h4>
                          <p className="text-sm text-green-700">
                            {healthData.analytics?.healthTrends?.predictiveInsights?.riskAssessment || 'Low'} Risk Level
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {healthData.analytics?.healthTrends?.recommendations?.map((recommendation: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-orange-600 mt-1" />
                          <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Modal Forms */}

        {/* New Appointment Form */}
        {showNewAppointmentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Schedule New Appointment</CardTitle>
                <CardDescription>Book a medical or therapy appointment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Provider Name</label>
                  <Input
                    value={newAppointment.providerName}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, providerName: e.target.value }))}
                    placeholder="e.g., Dr. Sarah Williams"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Appointment Type</label>
                  <Select value={newAppointment.appointmentType} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, appointmentType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="therapy">Therapy Session</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newAppointment.scheduledDate}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={newAppointment.duration}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or special instructions..."
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowNewAppointmentForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={scheduleAppointment}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Medication Form */}
        {showNewMedicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Add New Medication</CardTitle>
                <CardDescription>Track a new medication and dosage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Medication Name</label>
                  <Input
                    value={newMedication.medicationName}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, medicationName: e.target.value }))}
                    placeholder="e.g., Risperidone"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dosage</label>
                  <Input
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 0.5mg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Frequency</label>
                  <Select value={newMedication.frequency} onValueChange={(value) => setNewMedication(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once-daily">Once daily</SelectItem>
                      <SelectItem value="twice-daily">Twice daily</SelectItem>
                      <SelectItem value="three-times-daily">Three times daily</SelectItem>
                      <SelectItem value="as-needed">As needed</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newMedication.startDate}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prescribed By</label>
                  <Input
                    value={newMedication.prescribedBy}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, prescribedBy: e.target.value }))}
                    placeholder="e.g., Dr. Sarah Williams"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Purpose</label>
                  <Textarea
                    value={newMedication.purpose}
                    onChange={(e) => setNewMedication(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="What is this medication for?"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowNewMedicationForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addMedication}>
                    <Pill className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Therapy Session Form */}
        {showTherapySessionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Record Therapy Session</CardTitle>
                <CardDescription>Log therapy progress and outcomes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Therapy Type</label>
                  <Select value={newTherapySession.therapyType} onValueChange={(value) => setNewTherapySession(prev => ({ ...prev, therapyType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select therapy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="speech-therapy">Speech and Language Therapy</SelectItem>
                      <SelectItem value="occupational-therapy">Occupational Therapy</SelectItem>
                      <SelectItem value="physical-therapy">Physical Therapy</SelectItem>
                      <SelectItem value="behavioral-therapy">Behavioral Therapy</SelectItem>
                      <SelectItem value="play-therapy">Play Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Session Date</label>
                  <Input
                    type="date"
                    value={newTherapySession.sessionDate}
                    onChange={(e) => setNewTherapySession(prev => ({ ...prev, sessionDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={newTherapySession.duration}
                    onChange={(e) => setNewTherapySession(prev => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
                    placeholder="45"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Progress Rating (1-5)</label>
                  <Select value={newTherapySession.progressRating.toString()} onValueChange={(value) => setNewTherapySession(prev => ({ ...prev, progressRating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - No progress</SelectItem>
                      <SelectItem value="2">2 - Minimal progress</SelectItem>
                      <SelectItem value="3">3 - Some progress</SelectItem>
                      <SelectItem value="4">4 - Good progress</SelectItem>
                      <SelectItem value="5">5 - Excellent progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Progress Notes</label>
                  <Textarea
                    value={newTherapySession.progressNotes}
                    onChange={(e) => setNewTherapySession(prev => ({ ...prev, progressNotes: e.target.value }))}
                    placeholder="Describe the progress made during this session..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowTherapySessionForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={recordTherapySession}>
                    <Brain className="h-4 w-4 mr-2" />
                    Record Session
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
