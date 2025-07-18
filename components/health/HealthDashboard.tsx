'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  Heart,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Phone,
  MessageSquare,
  Video,
  Brain,
  Shield,
  Activity,
  Mic,
  Camera,
  FileText,
  Users,
  Clock,
  Stethoscope
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  diagnosis: any[];
  healthMetrics: {
    overallScore: number;
    behaviorScore: number;
    moodScore: number;
    sleepQuality: number;
    trends: {
      behavior: number;
      mood: number;
      sleep: number;
    };
  };
  riskAssessment: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    recommendations: string[];
  };
}

interface HealthDashboardProps {
  patientId?: string;
}

export function HealthDashboard({ patientId }: HealthDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [crisisStatus, setCrisisStatus] = useState<any>(null);
  const [healthTrends, setHealthTrends] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientData(selectedPatient.id);
      // Set up real-time monitoring
      const interval = setInterval(() => {
        checkCrisisStatus(selectedPatient.id);
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/health/patients');
      const data = await response.json();
      setPatients(data);

      if (patientId) {
        const patient = data.find((p: Patient) => p.id === patientId);
        if (patient) setSelectedPatient(patient);
      } else if (data.length > 0) {
        setSelectedPatient(data[0]);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (id: string) => {
    try {
      // Load health trends
      const trendsResponse = await fetch(`/api/health/analytics/${id}?range=30days`);
      const trendsData = await trendsResponse.json();
      setHealthTrends(trendsData.trends || []);

      // Load upcoming appointments
      const appointmentsResponse = await fetch(`/api/health/appointments/${id}?upcoming=true`);
      const appointmentsData = await appointmentsResponse.json();
      setUpcomingAppointments(appointmentsData.slice(0, 3) || []);

      // Load active alerts
      const alertsResponse = await fetch(`/api/health/alerts/${id}?active=true`);
      const alertsData = await alertsResponse.json();
      setActiveAlerts(alertsData || []);

      // Check crisis status
      await checkCrisisStatus(id);
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const checkCrisisStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/health/crisis?patientId=${id}`);
      const status = await response.json();
      setCrisisStatus(status);
    } catch (error) {
      console.error('Error checking crisis status:', error);
    }
  };

  const handleEmergencyAction = async (action: string) => {
    if (!selectedPatient) return;

    try {
      const response = await fetch('/api/health/crisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'emergency_contact',
          patientId: selectedPatient.id,
          data: {
            contactType: action,
            urgency: 'HIGH',
            message: `Emergency action initiated: ${action}`
          }
        })
      });

      if (response.ok) {
        await checkCrisisStatus(selectedPatient.id);
      }
    } catch (error) {
      console.error('Error executing emergency action:', error);
    }
  };

  const triggerCrisisProtocol = async () => {
    if (!selectedPatient) return;

    try {
      const response = await fetch('/api/health/crisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_crisis',
          patientId: selectedPatient.id,
          data: {
            crisisType: 'MANUAL_TRIGGER',
            severity: 'HIGH',
            description: 'Crisis protocol manually triggered from health dashboard'
          }
        })
      });

      if (response.ok) {
        await checkCrisisStatus(selectedPatient.id);
      }
    } catch (error) {
      console.error('Error triggering crisis protocol:', error);
    }
  };

  const startVoiceLogging = async () => {
    setIsRecording(true);

    try {
      // Implementation would use Web Audio API
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Process audio and send to voice API

      setTimeout(() => {
        setIsRecording(false);
        // Process voice command
      }, 5000);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      setIsRecording(false);
    }
  };

  const runAIAnalysis = async (type: string) => {
    if (!selectedPatient) return;

    try {
      const response = await fetch('/api/health/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          patientId: selectedPatient.id,
          data: type === 'health_prediction' ? { timeframe: '30_days' } : {}
        })
      });

      const analysis = await response.json();
      console.log('AI Analysis Result:', analysis);

      // Refresh data after analysis
      await loadPatientData(selectedPatient.id);
    } catch (error) {
      console.error('Error running AI analysis:', error);
    }
  };

  const syncIntegrations = async (integrationType: string) => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/health/integrations?patientId=${selectedPatient.id}&integration=${integrationType}`);
      const result = await response.json();

      setIntegrationStatus(result);

      // Refresh patient data after sync
      await loadPatientData(selectedPatient.id);
    } catch (error) {
      console.error('Error syncing integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateNHSNumber = async (nhsNumber: string) => {
    if (!selectedPatient) return;

    try {
      const response = await fetch('/api/health/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate_nhs_number',
          patientId: selectedPatient.id,
          data: { nhsNumber }
        })
      });

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('Error validating NHS number:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!selectedPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No patients available. Please add a patient to continue.</p>
          <Button className="mt-4">Add Patient</Button>
        </div>
      </div>
    );
  }

  const age = new Date().getFullYear() - selectedPatient.dateOfBirth.getFullYear();
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedPatient.firstName} {selectedPatient.lastName}
          </h1>
          <p className="text-gray-600">
            Age {age} • {selectedPatient.diagnosis[0]?.condition || 'No primary diagnosis'}
          </p>
        </div>
        <div className="flex space-x-2">
          {patients.length > 1 && (
            <select
              value={selectedPatient.id}
              onChange={(e) => {
                const patient = patients.find(p => p.id === e.target.value);
                if (patient) setSelectedPatient(patient);
              }}
              className="px-3 py-2 border rounded-lg"
            >
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Crisis Status Alert */}
      {crisisStatus && crisisStatus.status !== 'NONE' && (
        <Alert className={`border-2 ${
          crisisStatus.status === 'CRITICAL' ? 'border-red-500 bg-red-50' :
          crisisStatus.status === 'ACTIVE' ? 'border-orange-500 bg-orange-50' :
          'border-yellow-500 bg-yellow-50'
        }`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Crisis Status: {crisisStatus.status}</strong>
                <p>Risk Level: {crisisStatus.riskLevel} | Time to Intervention: {crisisStatus.timeToIntervention} min</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleEmergencyAction('CRISIS_TEAM')}
                >
                  Contact Crisis Team
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEmergencyAction('EMERGENCY_SERVICES')}
                >
                  Emergency Services
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts ({criticalAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <Alert key={alert.id} className="border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{alert.title}</strong>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="destructive">
                          Take Action
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overall Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {Math.round(selectedPatient.healthMetrics.overallScore)}%
                </span>
                <Badge variant={
                  selectedPatient.healthMetrics.trends.behavior > 0 ? 'default' : 'secondary'
                }>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {selectedPatient.healthMetrics.trends.behavior > 0 ? '+' : ''}
                  {selectedPatient.healthMetrics.trends.behavior.toFixed(1)}
                </Badge>
              </div>
              <Progress value={selectedPatient.healthMetrics.overallScore} className="h-2" />
              <p className="text-xs text-gray-500">Based on behavior, mood, and sleep</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Behavior Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {selectedPatient.healthMetrics.behaviorScore.toFixed(1)}/10
                </span>
                <Badge variant={
                  selectedPatient.healthMetrics.trends.behavior > 0 ? 'default' : 'destructive'
                }>
                  {selectedPatient.healthMetrics.trends.behavior > 0 ? 'Improving' : 'Stable'}
                </Badge>
              </div>
              <Progress value={selectedPatient.healthMetrics.behaviorScore * 10} className="h-2" />
              <p className="text-xs text-gray-500">7-day average</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mood Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {selectedPatient.healthMetrics.moodScore.toFixed(1)}/10
                </span>
                <Badge variant="outline">
                  {selectedPatient.healthMetrics.trends.mood > 0 ? 'Improving' : 'Stable'}
                </Badge>
              </div>
              <Progress value={selectedPatient.healthMetrics.moodScore * 10} className="h-2" />
              <p className="text-xs text-gray-500">Recent mood tracking</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {selectedPatient.healthMetrics.sleepQuality.toFixed(1)}/10
                </span>
                <Badge variant="secondary">
                  {selectedPatient.healthMetrics.trends.sleep > 0 ? 'Good' : 'Fair'}
                </Badge>
              </div>
              <Progress value={selectedPatient.healthMetrics.sleepQuality * 10} className="h-2" />
              <p className="text-xs text-gray-500">Average sleep rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="crisis">Crisis Management</TabsTrigger>
          <TabsTrigger value="telemedicine">Telemedicine</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="voice">Voice Assistant</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Health Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Health Trends (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="behavior" stroke="#8884d8" strokeWidth={2} name="Behavior" />
                    <Line type="monotone" dataKey="mood" stroke="#82ca9d" strokeWidth={2} name="Mood" />
                    <Line type="monotone" dataKey="sleep" stroke="#ffc658" strokeWidth={2} name="Sleep" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Video className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{appointment.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(appointment.startTime).toLocaleDateString()} at{' '}
                            {new Date(appointment.startTime).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {appointment.professional?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                        <Button size="sm">
                          Join Session
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => runAIAnalysis('health_prediction')}
                  className="h-20 flex-col space-y-2"
                  variant="outline"
                >
                  <Brain className="h-6 w-6" />
                  <span>Health Prediction</span>
                </Button>
                <Button
                  onClick={() => runAIAnalysis('crisis_assessment')}
                  className="h-20 flex-col space-y-2"
                  variant="outline"
                >
                  <Shield className="h-6 w-6" />
                  <span>Crisis Assessment</span>
                </Button>
                <Button
                  onClick={() => runAIAnalysis('behavior_analysis')}
                  className="h-20 flex-col space-y-2"
                  variant="outline"
                >
                  <Activity className="h-6 w-6" />
                  <span>Behavior Analysis</span>
                </Button>
                <Button
                  onClick={() => runAIAnalysis('document')}
                  className="h-20 flex-col space-y-2"
                  variant="outline"
                >
                  <FileText className="h-6 w-6" />
                  <span>Document Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedPatient.riskAssessment.recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crisis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Crisis Management Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {crisisStatus ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                        crisisStatus.riskLevel === 'CRITICAL' ? 'bg-red-500' :
                        crisisStatus.riskLevel === 'HIGH' ? 'bg-orange-500' :
                        crisisStatus.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <p className="text-sm font-medium">Risk Level</p>
                      <p className="text-lg font-bold">{crisisStatus.riskLevel}</p>
                    </div>
                    <div className="text-center">
                      <Clock className="h-4 w-4 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm font-medium">Time to Intervention</p>
                      <p className="text-lg font-bold">{crisisStatus.timeToIntervention} min</p>
                    </div>
                    <div className="text-center">
                      <Users className="h-4 w-4 mx-auto mb-2 text-gray-600" />
                      <p className="text-sm font-medium">Active Protocols</p>
                      <p className="text-lg font-bold">{crisisStatus.activeProtocols?.length || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={triggerCrisisProtocol}
                      className="bg-red-600 hover:bg-red-700 text-white p-6 text-lg"
                      size="lg"
                    >
                      <AlertTriangle className="h-6 w-6 mr-2" />
                      Trigger Crisis Protocol
                    </Button>
                    <Button
                      onClick={() => handleEmergencyAction('EMERGENCY_SERVICES')}
                      className="bg-red-800 hover:bg-red-900 text-white p-6 text-lg"
                      size="lg"
                    >
                      <Phone className="h-6 w-6 mr-2" />
                      Emergency Services
                    </Button>
                  </div>

                  {crisisStatus.activeProtocols?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Crisis Protocols</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {crisisStatus.activeProtocols.map((protocol: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>{protocol}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Loading crisis management status...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telemedicine" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Telemedicine Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Button className="w-full h-16 text-lg" size="lg">
                    <Video className="h-6 w-6 mr-2" />
                    Start Video Consultation
                  </Button>
                  <Button className="w-full h-16 text-lg" variant="outline" size="lg">
                    <Calendar className="h-6 w-6 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button className="w-full h-16 text-lg" variant="outline" size="lg">
                    <Users className="h-6 w-6 mr-2" />
                    Join Group Session
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Recent Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Speech Therapy</p>
                        <p className="text-sm text-gray-600">Dr. Johnson • 45 min</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Recording
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Behavioral Assessment</p>
                        <p className="text-sm text-gray-600">Dr. Smith • 60 min</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Health Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Behavior Patterns</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={healthTrends.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="behavior" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Progress Indicators</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Treatment Adherence</span>
                        <span className="text-sm text-gray-600">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Goal Achievement</span>
                        <span className="text-sm text-gray-600">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Family Satisfaction</span>
                        <span className="text-sm text-gray-600">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Health Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mic className={`h-12 w-12 ${isRecording ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {isRecording ? 'Recording...' : 'Voice Assistant Ready'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isRecording
                      ? 'Speak clearly about your child\'s health status...'
                      : 'Press and hold to record a health update or ask a question'
                    }
                  </p>
                </div>

                <Button
                  onClick={startVoiceLogging}
                  disabled={isRecording}
                  size="lg"
                  className={isRecording ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Mic className="h-5 w-5 mr-2" />
                  {isRecording ? 'Recording...' : 'Start Voice Log'}
                </Button>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Voice Commands</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>"Log behavior score 7 with some anxiety today"</p>
                    <p>"Schedule appointment with speech therapist"</p>
                    <p>"How is Emma's sleep pattern this week?"</p>
                    <p>"Emergency help needed"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                System Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* NHS Integration */}
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      NHS Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>NHS Number:</span>
                        <span className="font-mono">{selectedPatient.nhsNumber || 'Not Set'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Sync:</span>
                        <span>Never</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => syncIntegrations('nhs')}
                        className="w-full"
                        size="sm"
                      >
                        Sync NHS Data
                      </Button>
                      <Button
                        onClick={() => validateNHSNumber(selectedPatient.nhsNumber)}
                        variant="outline"
                        className="w-full"
                        size="sm"
                        disabled={!selectedPatient.nhsNumber}
                      >
                        Validate NHS Number
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>• Medical history sync</p>
                      <p>• Medication records</p>
                      <p>• FHIR compliance</p>
                    </div>
                  </CardContent>
                </Card>

                {/* School Integration */}
                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      School Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>School System:</span>
                        <span>SIMS</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Sync:</span>
                        <span>Never</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => syncIntegrations('school')}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Sync School Data
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        View Academic Progress
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>• Attendance records</p>
                      <p>• Behavioral data</p>
                      <p>• Support plans</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Local Authority Integration */}
                <Card className="border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Local Authority
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>LA Code:</span>
                        <span>Birmingham</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>EHCP Status:</span>
                        <span>Active</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={() => syncIntegrations('local-authority')}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        Sync LA Data
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        Check EHCP Status
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>• EHCP applications</p>
                      <p>• Funding requests</p>
                      <p>• Support services</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Integration Status */}
              {integrationStatus && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Latest Integration Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(integrationStatus, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comprehensive Sync */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Comprehensive Data Sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Synchronize data from all external systems to ensure comprehensive patient records.
                  </p>
                  <Button
                    onClick={() => syncIntegrations('all')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Sync All Systems
                  </Button>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">NHS</div>
                      <div className="text-xs text-gray-500">Medical Records</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">School</div>
                      <div className="text-xs text-gray-500">Academic Data</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">LA</div>
                      <div className="text-xs text-gray-500">EHCP & Funding</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button
              onClick={() => handleEmergencyAction('CRISIS_TEAM')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              size="lg"
            >
              <Phone className="h-4 w-4" />
              Emergency
            </Button>
            <Button
              onClick={startVoiceLogging}
              className="flex items-center gap-2"
              size="lg"
              variant="outline"
            >
              <Mic className="h-4 w-4" />
              Voice Log
            </Button>
            <Button
              className="flex items-center gap-2"
              size="lg"
              variant="outline"
            >
              <MessageSquare className="h-4 w-4" />
              Message Team
            </Button>
            <Button
              className="flex items-center gap-2"
              size="lg"
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            <Button
              className="flex items-center gap-2"
              size="lg"
              variant="outline"
            >
              <Stethoscope className="h-4 w-4" />
              Add Health Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
