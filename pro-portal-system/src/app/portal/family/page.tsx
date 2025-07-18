"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Heart,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Video,
  TrendingUp,
  Star,
  ArrowLeft,
  Plus,
  Bell,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Activity,
  BookOpen,
  Award
} from "lucide-react"

export default function FamilyPortal() {
  const [activeChild, setActiveChild] = useState("emma")

  const children = [
    {
      id: "emma",
      name: "Emma Johnson",
      age: 8,
      condition: "Autism Spectrum Disorder",
      photo: "/api/placeholder/80/80",
      professionals: [
        { name: "Dr. Sarah Thompson", role: "Child Psychologist", nextSession: "2025-07-18 10:00 AM" },
        { name: "Lisa Chen", role: "Speech Therapist", nextSession: "2025-07-19 2:00 PM" },
        { name: "Mike Rodriguez", role: "Occupational Therapist", nextSession: "2025-07-20 11:00 AM" }
      ],
      progress: {
        overall: 85,
        communication: 78,
        social: 82,
        behavioral: 89,
        cognitive: 87
      },
      recentUpdates: [
        { date: "2025-07-14", professional: "Dr. Sarah Thompson", note: "Great progress in social interaction exercises. Emma initiated conversation 3 times during session." },
        { date: "2025-07-12", professional: "Lisa Chen", note: "Significant improvement in verbal expression. Working on complex sentence structures." },
        { date: "2025-07-10", professional: "Mike Rodriguez", note: "Fine motor skills showing excellent development. Ready for advanced writing exercises." }
      ]
    }
  ]

  const currentChild = children.find(child => child.id === activeChild) || children[0]

  const upcomingAppointments = [
    {
      date: "Today",
      time: "10:00 AM",
      professional: "Dr. Sarah Thompson",
      type: "Therapy Session",
      location: "Online",
      color: "bg-blue-500"
    },
    {
      date: "Tomorrow",
      time: "2:00 PM",
      professional: "Lisa Chen",
      type: "Speech Therapy",
      location: "Clinic",
      color: "bg-green-500"
    },
    {
      date: "Friday",
      time: "11:00 AM",
      professional: "Mike Rodriguez",
      type: "OT Assessment",
      location: "Clinic",
      color: "bg-purple-500"
    }
  ]

  const resources = [
    {
      title: "Understanding Autism Spectrum Disorder",
      type: "Article",
      readTime: "8 min read",
      category: "Education"
    },
    {
      title: "Home Activities for Communication Skills",
      type: "Activity Guide",
      readTime: "15 activities",
      category: "Practice"
    },
    {
      title: "Supporting Your Child's Development",
      type: "Video",
      readTime: "12 min watch",
      category: "Tips"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-pink-600">Family Portal</h1>
                <p className="text-sm text-slate-600">Johnson Family Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-pink-100 text-pink-600 hover:bg-pink-200">
                <Heart className="h-3 w-3 mr-1" />
                Family Access
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Messages
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-1" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Child Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-pink-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{currentChild.name}</h2>
              <p className="text-slate-600">Age {currentChild.age} • {currentChild.condition}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                View Records
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Update
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="professionals">Team</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Overview</CardTitle>
                    <CardDescription>Overall development across key areas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(currentChild.progress).map(([area, score]) => (
                        <div key={area} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{area}</span>
                            <span>{score}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Updates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Updates</CardTitle>
                    <CardDescription>Latest notes from your care team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentChild.recentUpdates.map((update, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg border-l-4 border-pink-500">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{update.professional}</p>
                          <p className="text-xs text-slate-500">{update.date}</p>
                        </div>
                        <p className="text-sm text-slate-700">{update.note}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled sessions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingAppointments.map((appointment, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${appointment.color}`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{appointment.professional}</p>
                            <p className="text-xs text-slate-600">{appointment.type}</p>
                            <p className="text-xs text-slate-500">{appointment.date} at {appointment.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button className="w-full mt-4" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Full Schedule
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Team
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Join Video Call
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress Charts</CardTitle>
                  <CardDescription>Development trends over time</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                    <p className="text-slate-600">Interactive progress charts coming soon</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                  <CardDescription>Achievement tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">First Complex Sentence</p>
                      <p className="text-xs text-slate-600">Achieved on July 12, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Social Interaction Goal</p>
                      <p className="text-xs text-slate-600">Achieved on July 8, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Fine Motor Skills</p>
                      <p className="text-xs text-slate-600">Achieved on July 5, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentChild.professionals.map((professional, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-pink-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{professional.name}</CardTitle>
                        <CardDescription>{professional.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p className="text-slate-600">Next Session:</p>
                      <p className="font-medium">{professional.nextSession}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>Manage appointments and sessions</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                  <p className="text-slate-600">Interactive calendar coming soon</p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Request Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{resource.type}</span>
                      <span>•</span>
                      <span>{resource.readTime}</span>
                    </div>
                    <Button className="w-full">
                      View Resource
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
