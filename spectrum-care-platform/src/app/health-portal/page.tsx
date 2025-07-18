'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Stethoscope,
  Calendar,
  Users,
  FileText,
  Heart,
  Activity,
  Clock,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Phone,
  Shield,
  BarChart3
} from 'lucide-react'

export default function HealthProfessionalPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const bypassData = localStorage.getItem('dev_bypass_user')
    if (bypassData) {
      setCurrentUser(JSON.parse(bypassData))
    }
  }, [])

  const clinicalStats = {
    activePatients: 156,
    appointmentsToday: 8,
    weeklyCapacity: 40,
    averageWaitTime: "2.3 weeks",
    outcomeScore: "94%"
  }

  const todaySchedule = [
    {
      time: "09:00",
      patient: "Emma Johnson",
      type: "Speech Therapy Session",
      location: "Clinic Room 2",
      status: "scheduled",
      notes: "Progress review - communication goals"
    },
    {
      time: "10:30",
      patient: "James Wilson",
      type: "Occupational Therapy",
      location: "Sensory Room",
      status: "in-progress",
      notes: "Sensory integration assessment"
    },
    {
      time: "14:00",
      patient: "Sophie Chen",
      type: "Initial Assessment",
      location: "Assessment Suite",
      status: "scheduled",
      notes: "Autism diagnostic assessment"
    }
  ]

  const patientProgress = [
    {
      name: "Emma Johnson",
      age: 12,
      condition: "Speech & Language Delay",
      sessions: 24,
      progress: 85,
      nextGoal: "Conversational speech",
      lastSession: "2 days ago",
      priority: "medium"
    },
    {
      name: "James Wilson",
      age: 8,
      condition: "Sensory Processing",
      sessions: 16,
      progress: 70,
      nextGoal: "Sensory regulation",
      lastSession: "1 week ago",
      priority: "high"
    },
    {
      name: "Sophie Chen",
      age: 15,
      condition: "Autism Spectrum",
      sessions: 8,
      progress: 45,
      nextGoal: "Social communication",
      lastSession: "3 days ago",
      priority: "low"
    }
  ]

  const urgentAlerts = [
    {
      type: "urgent",
      title: "Missed Appointment Follow-up",
      description: "3 patients require rescheduling from yesterday",
      time: "2 hours ago"
    },
    {
      type: "reminder",
      title: "Assessment Reports Due",
      description: "5 reports need completion by end of week",
      time: "4 hours ago"
    },
    {
      type: "update",
      title: "New Referral Received",
      description: "Priority referral from LA - Emma Thompson, Age 7",
      time: "6 hours ago"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-600 rounded-xl text-white">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clinical Care Hub</h1>
              <p className="text-gray-600">Clinical workflows, appointment management, and care coordination</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
              Clinical Access
            </Badge>
            <div className="text-right">
              <p className="font-semibold text-gray-900">Dr. Angela Smith</p>
              <p className="text-sm text-gray-600">Paediatric Occupational Therapist</p>
            </div>
          </div>
        </div>

        {/* NHS Integration Value Banner */}
        <Card className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🏥 NHS Integration & Clinical Excellence</h2>
              <p className="text-red-100 mb-4">
                Seamless NHS integration with advanced clinical workflows and outcome tracking
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{clinicalStats.activePatients}</div>
                  <div className="text-sm">Active Patients</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{clinicalStats.outcomeScore}</div>
                  <div className="text-sm">Positive Outcomes</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{clinicalStats.averageWaitTime}</div>
                  <div className="text-sm">Average Wait Time</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">NHS</div>
                  <div className="text-sm">Fully Integrated</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{clinicalStats.activePatients}</div>
              <div className="text-sm text-gray-600">Active Patients</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{clinicalStats.appointmentsToday}</div>
              <div className="text-sm text-gray-600">Today's Appointments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{clinicalStats.weeklyCapacity}</div>
              <div className="text-sm text-gray-600">Weekly Capacity</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{clinicalStats.outcomeScore}</div>
              <div className="text-sm text-gray-600">Outcome Success</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{clinicalStats.averageWaitTime}</div>
              <div className="text-sm text-gray-600">Average Wait</div>
            </CardContent>
          </Card>
        </div>

        {/* Clinical Alerts */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-800">Clinical Alerts & Priorities</CardTitle>
              </div>
              <Button variant="outline" size="sm" className="text-red-700 border-red-300">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentAlerts.map((alert, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-red-800">{alert.title}</h4>
                      <p className="text-sm text-red-600">{alert.description}</p>
                    </div>
                    <span className="text-xs text-red-500">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Clinical Tabs */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit">
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            <TabsTrigger value="coordination">MDT</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>Appointments and clinical sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaySchedule.map((appointment, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-lg">{appointment.time}</div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{appointment.patient}</h4>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        <p className="text-sm text-gray-500">{appointment.location}</p>
                        <p className="text-xs text-gray-400 mt-2">{appointment.notes}</p>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">Start Session</Button>
                          <Button size="sm" variant="outline">Patient Notes</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Quick Actions</CardTitle>
                  <CardDescription>Common clinical tasks and workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <Button className="justify-start h-12" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Emergency Appointment
                    </Button>
                    <Button className="justify-start h-12" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Complete Assessment Report
                    </Button>
                    <Button className="justify-start h-12" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact MDT Team
                    </Button>
                    <Button className="justify-start h-12" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Parent Consultation Call
                    </Button>
                    <Button className="justify-start h-12" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Update Care Plan
                    </Button>
                    <Button className="justify-start h-12" variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Safeguarding Concern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Patient Caseload
                </CardTitle>
                <CardDescription>Active patients and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientProgress.map((patient, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{patient.name}, {patient.age}</h4>
                          <p className="text-sm text-gray-600">{patient.condition}</p>
                        </div>
                        <Badge className={getPriorityColor(patient.priority)}>
                          {patient.priority} priority
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Sessions:</span>
                          <div className="font-semibold">{patient.sessions}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Progress:</span>
                          <div className="font-semibold">{patient.progress}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Next Goal:</span>
                          <div>{patient.nextGoal}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Session:</span>
                          <div>{patient.lastSession}</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{width: `${patient.progress}%`}}
                        ></div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Clinical Notes</Button>
                        <Button size="sm" variant="outline">Update Progress</Button>
                        <Button size="sm" variant="outline">Contact Family</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Assessments</CardTitle>
                <CardDescription>Standardized assessment tools and protocols</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-red-500 cursor-pointer">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Sensory Processing</h3>
                    <p className="text-sm text-gray-600 mb-4">SPM-2 and clinical observation</p>
                    <Button size="sm">Start Assessment</Button>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-red-500 cursor-pointer">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Motor Skills</h3>
                    <p className="text-sm text-gray-600 mb-4">MABC-2 and developmental assessment</p>
                    <Button size="sm">Start Assessment</Button>
                  </div>
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-red-500 cursor-pointer">
                    <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">Adaptive Behavior</h3>
                    <p className="text-sm text-gray-600 mb-4">ABAS-3 and functional assessment</p>
                    <Button size="sm">Start Assessment</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcomes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Clinical Outcomes
                </CardTitle>
                <CardDescription>Track intervention effectiveness and patient progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-700">94%</div>
                    <div className="text-sm text-green-600">Goals Achieved</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-700">156</div>
                    <div className="text-sm text-blue-600">Patients Treated</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Heart className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-purple-700">98%</div>
                    <div className="text-sm text-purple-600">Family Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coordination" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Disciplinary Team</CardTitle>
                <CardDescription>Coordinate care with other professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-16 w-16 mx-auto text-red-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">MDT Coordination Platform</h3>
                  <p className="text-gray-600 mb-4">Seamless communication with speech therapists, psychologists, and education teams</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button>Start MDT Meeting</Button>
                    <Button variant="outline">View Team Messages</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Clinical Analytics
                </CardTitle>
                <CardDescription>Performance insights and outcome tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-red-600 mb-2" />
                    <div className="text-2xl font-bold text-red-700">+15%</div>
                    <div className="text-sm text-red-600">Caseload Growth</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-700">2.3 wks</div>
                    <div className="text-sm text-green-600">Average Wait Time</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-700">8.2</div>
                    <div className="text-sm text-blue-600">Sessions per Goal</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation back */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dev/bypass'}
            className="mr-4"
          >
            Back to Bypass Portal
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  )
}
