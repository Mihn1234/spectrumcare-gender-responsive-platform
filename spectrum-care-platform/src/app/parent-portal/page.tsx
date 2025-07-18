'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  FileText,
  Users,
  MessageSquare,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  Upload,
  Phone,
  Video,
  Mail,
  MapPin,
  GraduationCap,
  Heart,
  Stethoscope,
  Scale,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useAuth';
import { useParentData } from '@/hooks/useParentData';

export default function ParentPortalPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['PARENT']);
  const {
    children,
    caseUpdates,
    appointments,
    loading: dataLoading,
    error,
    loadParentData,
    setError
  } = useParentData();

  const [selectedChild, setSelectedChild] = useState<string>('');

  const loading = authLoading || dataLoading;

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINAL': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW': return 'bg-blue-100 text-blue-800';
      case 'ASSESSMENT': return 'bg-purple-100 text-purple-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ASSESSMENT': return <Stethoscope className="h-4 w-4" />;
      case 'REVIEW': return <FileText className="h-4 w-4" />;
      case 'MEETING': return <Users className="h-4 w-4" />;
      case 'THERAPY': return <Heart className="h-4 w-4" />;
      case 'PARENT_COMMENT': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedChildData = children.find(child => child.id === selectedChild);

  // Handle loading states
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useRequireAuth will handle redirect
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Parent Portal</h1>
              <Badge variant="secondary">
                {children.length} {children.length === 1 ? 'Child' : 'Children'}
              </Badge>
              {user.profile_data?.firstName && (
                <span className="text-gray-600">
                  Welcome, {user.profile_data.firstName}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="link"
                className="p-0 ml-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* No Children Message */}
        {children.length === 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Children Added</h3>
              <p className="text-gray-600 mb-4">
                Add your child's profile to start managing their autism support journey.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Child Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mb-6">
            <div className="flex space-x-2">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChild === child.id ? "default" : "outline"}
                  onClick={() => setSelectedChild(child.id)}
                  className="flex items-center space-x-2"
                >
                  <span>{child.firstName} {child.lastName}</span>
                  <Badge className={getStatusColor(child.ehcStatus)}>
                    {child.ehcStatus}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        {children.length > 0 && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Upload Documents</p>
                      <p className="text-sm text-gray-600">Add reports or evidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Book Appointment</p>
                      <p className="text-sm text-gray-600">Schedule with professionals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Send Message</p>
                      <p className="text-sm text-gray-600">Contact your team</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Scale className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Legal Support</p>
                      <p className="text-sm text-gray-600">Get advocacy help</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ehc-plan">EHC Plan</TabsTrigger>
                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="health">Health</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Child Profile Summary */}
                    {selectedChildData && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>{selectedChildData.firstName} {selectedChildData.lastName}</span>
                          </CardTitle>
                          <CardDescription>
                            Born {new Date(selectedChildData.dateOfBirth).toLocaleDateString()} •
                            Age {Math.floor((Date.now() - new Date(selectedChildData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">School</p>
                              <p className="mt-1">{selectedChildData.school}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">EHC Status</p>
                              <Badge className={`mt-1 ${getStatusColor(selectedChildData.ehcStatus)}`}>
                                {selectedChildData.ehcStatus}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Key Worker</p>
                              <p className="mt-1">{selectedChildData.keyWorker}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Next Review</p>
                              <p className="mt-1">
                                {selectedChildData.nextReview
                                  ? new Date(selectedChildData.nextReview).toLocaleDateString()
                                  : 'Not scheduled'
                                }
                              </p>
                            </div>
                            {selectedChildData.caseNumber && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Case Number</p>
                                <p className="mt-1 font-mono text-sm">{selectedChildData.caseNumber}</p>
                              </div>
                            )}
                            {(selectedChildData.estimatedBudget || selectedChildData.actualCost > 0) && (
                              <div>
                                <p className="text-sm font-medium text-gray-500">Budget</p>
                                <div className="mt-1">
                                  {selectedChildData.estimatedBudget && (
                                    <p className="text-sm">Estimated: £{selectedChildData.estimatedBudget.toLocaleString()}</p>
                                  )}
                                  {selectedChildData.actualCost > 0 && (
                                    <p className="text-sm">Actual: £{selectedChildData.actualCost.toLocaleString()}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Updates */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Bell className="h-5 w-5" />
                          <span>Recent Updates</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {caseUpdates.length === 0 ? (
                          <div className="text-center py-6">
                            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600">No recent updates</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {caseUpdates.slice(0, 3).map((update) => (
                              <div key={update.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="p-1 bg-white rounded">
                                  {getTypeIcon(update.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium">{update.title}</p>
                                    <Badge className={getPriorityColor(update.priority)}>
                                      {update.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <p className="text-xs text-gray-500">
                                      {new Date(update.date).toLocaleDateString()}
                                    </p>
                                    {update.createdBy && (
                                      <p className="text-xs text-gray-500">
                                        by {update.createdBy} ({update.createdByRole})
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-4">
                          <Button variant="outline" className="w-full" onClick={loadParentData}>
                            <Bell className="h-4 w-4 mr-2" />
                            View All Updates
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Progress Tracking - Using placeholder data */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Progress Overview</CardTitle>
                        <CardDescription>Based on recent assessments and goals</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Communication Goals</span>
                              <span>75%</span>
                            </div>
                            <Progress value={75} className="mt-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Social Skills Development</span>
                              <span>60%</span>
                            </div>
                            <Progress value={60} className="mt-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Academic Support</span>
                              <span>85%</span>
                            </div>
                            <Progress value={85} className="mt-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ehc-plan" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>EHC Plan Management</CardTitle>
                        <CardDescription>
                          View and manage your child's Education, Health and Care plan
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedChildData?.ehcStatus === 'PENDING' ? (
                          <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                              EHC Plan assessment is in progress. You'll be notified when updates are available.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                              <div>
                                <h3 className="font-medium">Current EHC Plan</h3>
                                <p className="text-sm text-gray-600">
                                  Last updated: {selectedChildData?.lastAssessment
                                    ? new Date(selectedChildData.lastAssessment).toLocaleDateString()
                                    : 'Not available'
                                  }
                                </p>
                              </div>
                              <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Education Provision</h4>
                                <ul className="text-sm space-y-1 text-gray-600">
                                  <li>• 1:1 teaching assistant support</li>
                                  <li>• Speech and language therapy</li>
                                  <li>• Sensory breaks every 2 hours</li>
                                </ul>
                              </div>

                              <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">Health Provision</h4>
                                <ul className="text-sm space-y-1 text-gray-600">
                                  <li>• Occupational therapy sessions</li>
                                  <li>• Annual health review</li>
                                  <li>• Access to school nurse</li>
                                </ul>
                              </div>
                            </div>

                            {selectedChildData?.nextReview && (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Your child's EHC plan is due for review on {new Date(selectedChildData.nextReview).toLocaleDateString()}.
                                  You'll receive a meeting invitation 4 weeks before the review date.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="assessments">
                    <Card>
                      <CardHeader>
                        <CardTitle>Assessments & Reports</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">Assessment management coming soon...</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="education">
                    <Card>
                      <CardHeader>
                        <CardTitle>Education Support</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">Education coordination tools coming soon...</p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="health">
                    <Card>
                      <CardHeader>
                        <CardTitle>Health Coordination</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">Health management tools coming soon...</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Upcoming Appointments</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {appointments.length === 0 ? (
                      <div className="text-center py-4">
                        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">No upcoming appointments</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {appointments.slice(0, 3).map((appointment) => (
                          <div key={appointment.id} className="p-3 border rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(appointment.type)}
                              <h4 className="font-medium text-sm">{appointment.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                            {appointment.professional?.name && (
                              <p className="text-xs text-gray-600 mb-1">{appointment.professional.name}</p>
                            )}
                            {appointment.location && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                            <Badge
                              className={`mt-2 text-xs ${getAppointmentStatusColor(appointment.status)}`}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Book New Appointment
                    </Button>
                  </CardContent>
                </Card>

                {/* Support Team */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Your Support Team</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedChildData?.keyWorker && selectedChildData.keyWorker !== 'Not assigned' && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {selectedChildData.keyWorker.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{selectedChildData.keyWorker}</p>
                            <p className="text-xs text-gray-600">Key Worker</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {appointments.length > 0 && appointments[0].professional?.name && (
                        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {appointments[0].professional.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{appointments[0].professional.name}</p>
                            <p className="text-xs text-gray-600">
                              {appointments[0].professional.specialization || 'Professional'}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Video className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Link href="/parent-portal/crisis-management" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Crisis Support
                        </Button>
                      </Link>
                      <Link href="/parent-portal/financial-management" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Financial Support
                        </Button>
                      </Link>
                      <Link href="/parent-portal/education-coordination" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Education Support
                        </Button>
                      </Link>
                      <Link href="/legal" className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Scale className="h-4 w-4 mr-2" />
                          Legal Advocacy
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
