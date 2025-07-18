"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  ArrowLeft,
  MessageSquare,
  Video,
  Phone,
  Mail,
  Send,
  Paperclip,
  Search,
  Filter,
  Users,
  Clock,
  Shield,
  Bell,
  Settings,
  Plus,
  Eye,
  Download,
  Share,
  Archive,
  Star,
  MoreHorizontal,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ScreenShare,
  Calendar,
  FileText,
  Image,
  Lock,
  CheckCircle,
  AlertCircle,
  Info,
  UserPlus
} from "lucide-react"

export default function CommunicationHubPage() {
  const conversations = [
    {
      id: 1,
      type: "direct",
      participant: "Emma Thompson (Parent)",
      lastMessage: "Thank you for the assessment report. When can we schedule the follow-up?",
      timestamp: "2 hours ago",
      unread: 2,
      priority: "normal",
      encryption: true
    },
    {
      id: 2,
      type: "group",
      participant: "Wilson Case Team",
      lastMessage: "Dr. Martinez: I recommend increasing sensory break frequency",
      timestamp: "4 hours ago",
      unread: 0,
      priority: "high",
      encryption: true
    },
    {
      id: 3,
      type: "direct",
      participant: "Dr. Sarah Martinez",
      lastMessage: "New ADOS-2 protocols are ready for review",
      timestamp: "1 day ago",
      unread: 1,
      priority: "normal",
      encryption: true
    },
    {
      id: 4,
      type: "video_call",
      participant: "Chen Family Consultation",
      lastMessage: "Video call completed - recording available",
      timestamp: "2 days ago",
      unread: 0,
      priority: "normal",
      encryption: true
    }
  ]

  const activeVideoSessions = [
    {
      id: 1,
      title: "Family Consultation - Johnson Family",
      participants: ["Dr. Sarah Martinez", "Mr. & Mrs. Johnson"],
      duration: "00:23:45",
      status: "active",
      type: "family_consultation"
    },
    {
      id: 2,
      title: "Team Meeting - Emma Thompson Case",
      participants: ["Dr. Martinez", "Lisa Rodriguez", "Mike Chen"],
      duration: "00:15:30",
      status: "active",
      type: "team_meeting"
    }
  ]

  const messageTemplates = [
    {
      category: "Appointment",
      templates: [
        "Appointment Confirmation",
        "Appointment Reminder",
        "Reschedule Request",
        "Appointment Follow-up"
      ]
    },
    {
      category: "Assessment",
      templates: [
        "Assessment Results Available",
        "Pre-Assessment Instructions",
        "Post-Assessment Follow-up",
        "Additional Testing Required"
      ]
    },
    {
      category: "General",
      templates: [
        "Welcome Message",
        "Check-in Message",
        "Resource Sharing",
        "Holiday Closure Notice"
      ]
    }
  ]

  const communicationStats = {
    messagesThisWeek: 47,
    videoCallsThisWeek: 12,
    averageResponseTime: "2.3 hours",
    clientSatisfaction: 94
  }

  const recentFiles = [
    {
      name: "ADOS-2_Emma_Thompson_Report.pdf",
      type: "assessment",
      size: "2.4 MB",
      shared: "Emma Thompson",
      timestamp: "2 hours ago"
    },
    {
      name: "Sensory_Processing_Guidelines.docx",
      type: "resource",
      size: "1.1 MB",
      shared: "Team Chat",
      timestamp: "1 day ago"
    },
    {
      name: "Session_Recording_Wilson_Family.mp4",
      type: "video",
      size: "45.2 MB",
      shared: "Wilson Family",
      timestamp: "3 days ago"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Communication Hub</h1>
                <p className="text-sm text-slate-600">Secure messaging, video calls, and file sharing</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-600">
                <Shield className="h-3 w-3 mr-1" />
                End-to-End Encrypted
              </Badge>
              <Button>
                <Video className="h-4 w-4 mr-2" />
                Start Video Call
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Communication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Messages</p>
                  <p className="text-2xl font-bold text-blue-600">{communicationStats.messagesThisWeek}</p>
                  <p className="text-xs text-slate-500">This week</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Video Calls</p>
                  <p className="text-2xl font-bold text-green-600">{communicationStats.videoCallsThisWeek}</p>
                  <p className="text-xs text-slate-500">This week</p>
                </div>
                <Video className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Response Time</p>
                  <p className="text-2xl font-bold text-purple-600">{communicationStats.averageResponseTime}</p>
                  <p className="text-xs text-slate-500">Average</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-orange-600">{communicationStats.clientSatisfaction}%</p>
                  <p className="text-xs text-slate-500">Client rating</p>
                </div>
                <Star className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="video">Video Calls</TabsTrigger>
            <TabsTrigger value="files">File Sharing</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Conversations List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Conversations</CardTitle>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Chat
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Input placeholder="Search conversations..." className="flex-1" />
                      <Button size="sm" variant="outline">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {conversations.map((conversation) => (
                        <div key={conversation.id} className="p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                conversation.type === 'group' ? 'bg-purple-500' :
                                conversation.type === 'video_call' ? 'bg-green-500' :
                                'bg-blue-500'
                              }`} />
                              <h4 className="font-medium text-sm">{conversation.participant}</h4>
                            </div>
                            {conversation.unread > 0 && (
                              <Badge className="bg-blue-100 text-blue-800">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{conversation.lastMessage}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-500">{conversation.timestamp}</span>
                            <div className="flex items-center space-x-1">
                              {conversation.encryption && (
                                <Lock className="h-3 w-3 text-green-600" />
                              )}
                              {conversation.priority === 'high' && (
                                <AlertCircle className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Conversation */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          ET
                        </div>
                        <div>
                          <h3 className="font-medium">Emma Thompson (Parent)</h3>
                          <p className="text-sm text-slate-600">Online • Last seen 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Message Area */}
                    <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-slate-50">
                      <div className="space-y-4">
                        <div className="flex">
                          <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm">Hi Dr. Martinez, I received Emma's assessment report. The results are very helpful.</p>
                            <p className="text-xs text-slate-500 mt-1">10:30 AM</p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
                            <p className="text-sm">Wonderful! I'm glad the report provides clarity. When would you like to schedule the follow-up session?</p>
                            <p className="text-xs text-blue-100 mt-1">10:33 AM</p>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm">Could we do next Tuesday afternoon? Emma is more responsive after school.</p>
                            <p className="text-xs text-slate-500 mt-1">10:45 AM</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center space-x-2 text-xs text-slate-500 bg-green-50 px-3 py-1 rounded-full">
                            <Lock className="h-3 w-3" />
                            <span>Messages are end-to-end encrypted</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input placeholder="Type your secure message..." className="flex-1" />
                        <Button size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          Schedule Follow-up
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Share Resource
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Request Documents
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Video Calls Tab */}
          <TabsContent value="video" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Video Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeVideoSessions.map((session) => (
                        <div key={session.id} className="p-4 border-2 border-dashed border-green-200 rounded-lg bg-green-50">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{session.title}</h4>
                              <p className="text-sm text-slate-600">
                                {session.participants.join(", ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-100 text-green-800 mb-1">
                                {session.status}
                              </Badge>
                              <p className="text-sm font-mono">{session.duration}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm">
                              <Video className="h-3 w-3 mr-1" />
                              Join Call
                            </Button>
                            <Button size="sm" variant="outline">
                              <Mic className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <ScreenShare className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <PhoneOff className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Start New Video Session</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Session Type</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultation">Family Consultation</SelectItem>
                            <SelectItem value="assessment">Assessment Session</SelectItem>
                            <SelectItem value="team-meeting">Team Meeting</SelectItem>
                            <SelectItem value="training">Training Session</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Duration</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Participants</label>
                      <Input placeholder="Add participants (comma separated)" />
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1">
                        <Video className="h-4 w-4 mr-2" />
                        Start Instant Meeting
                      </Button>
                      <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule for Later
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Video className="h-4 w-4 mr-2" />
                      Start Video Call
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Voice Call
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <ScreenShare className="h-4 w-4 mr-2" />
                      Screen Share
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Video Call History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: "Emma Thompson Family", duration: "45:23", date: "Today", recorded: true },
                        { title: "Team Meeting", duration: "62:15", date: "Yesterday", recorded: false },
                        { title: "Wilson Assessment", duration: "90:04", date: "2 days ago", recorded: true }
                      ].map((call, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{call.title}</p>
                            <p className="text-xs text-slate-600">{call.duration} • {call.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {call.recorded && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Recorded</Badge>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* File Sharing Tab */}
          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Shared Files & Documents
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          file.type === 'assessment' ? 'bg-blue-100 text-blue-600' :
                          file.type === 'video' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {file.type === 'video' ? <Video className="h-5 w-5" /> :
                           file.type === 'assessment' ? <FileText className="h-5 w-5" /> :
                           <FileText className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{file.name}</h4>
                          <p className="text-sm text-slate-600">
                            {file.size} • Shared with {file.shared}
                          </p>
                          <p className="text-xs text-slate-500">{file.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Pre-written templates for common communications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {messageTemplates.map((category, idx) => (
                    <div key={idx}>
                      <h4 className="font-medium mb-3">{category.category}</h4>
                      <div className="space-y-2">
                        {category.templates.map((template, templateIdx) => (
                          <Button
                            key={templateIdx}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-sm"
                          >
                            {template}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Analytics</CardTitle>
                <CardDescription>Insights into communication patterns and effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Response Times</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Response</span>
                        <span className="font-medium">2.3 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Fastest Response</span>
                        <span className="font-medium">12 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Response Rate</span>
                        <span className="font-medium">98%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Communication Volume</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Messages this month</span>
                        <span className="font-medium">186</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Video calls this month</span>
                        <span className="font-medium">34</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Files shared</span>
                        <span className="font-medium">67</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Response Time</label>
                    <Select defaultValue="4">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Video Quality</label>
                    <Select defaultValue="hd">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sd">Standard (480p)</SelectItem>
                        <SelectItem value="hd">HD (720p)</SelectItem>
                        <SelectItem value="fhd">Full HD (1080p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">End-to-end encryption</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Message retention</span>
                    <Badge className="bg-blue-100 text-blue-800">30 days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-delete recordings</span>
                    <Badge className="bg-purple-100 text-purple-800">90 days</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
