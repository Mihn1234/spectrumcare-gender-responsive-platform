'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Target,
  TrendingUp,
  User,
  CalendarDays,
  Stethoscope,
  PieChart,
  Award,
  DollarSign
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useProfessionalData } from '@/hooks/useProfessionalData';
import { ProfessionalDashboard } from '@/components/professional/ProfessionalDashboard';

export default function ProfessionalPortalPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['PROFESSIONAL']);
  const {
    dashboardStats,
    appointments,
    clients,
    assessments,
    loading,
    error,
    loadAllData,
    loadAppointments,
    loadClients,
    loadAssessments,
    getAppointmentStatusColor,
    getAssessmentStatusColor,
    formatCurrency,
    setError
  } = useProfessionalData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle search and filter changes for clients
  useEffect(() => {
    if (activeTab === 'clients') {
      const delayedSearch = setTimeout(() => {
        loadClients({
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          conditionType: filterCondition !== 'all' ? filterCondition : undefined
        });
      }, 300);

      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm, filterStatus, filterCondition, activeTab, loadClients]);

  // Handle appointments filter changes
  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments({
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
    }
  }, [filterStatus, activeTab, loadAppointments]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Professional Portal</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.profile_data?.firstName || 'Professional'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {dashboardStats?.totalClients || 0} Active Clients
              </Badge>
              <Button variant="outline" size="sm" onClick={loadAllData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Quick Actions
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Clients</span>
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Assessments</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ProfessionalDashboard
              stats={dashboardStats}
              loading={loading}
              error={error}
              onRefresh={loadAllData}
            />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            {/* Appointment Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appointments List */}
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{appointment.client.fullName}</h3>
                          <Badge className={getAppointmentStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <Badge variant="outline">
                            Session #{appointment.sessionNumber}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p className="font-medium">Date & Time</p>
                            <p>{new Date(appointment.date).toLocaleDateString()}</p>
                            <p>{new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                          <div>
                            <p className="font-medium">Type & Duration</p>
                            <p>{appointment.type}</p>
                            <p>{appointment.duration} minutes</p>
                          </div>
                          <div>
                            <p className="font-medium">Client Info</p>
                            <p>Age {appointment.client.age}</p>
                            <p>{appointment.client.conditionType}</p>
                          </div>
                          <div>
                            <p className="font-medium">Fee</p>
                            <p>{formatCurrency(appointment.feeAmount)}</p>
                            <p className="text-xs">{appointment.paymentStatus}</p>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mb-4">
                            <p className="font-medium text-sm text-gray-600 mb-1">Notes:</p>
                            <p className="text-sm text-gray-800">{appointment.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{appointment.client.email}</span>
                            <span>{appointment.client.phone}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            {/* Client Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCondition} onValueChange={setFilterCondition}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="autism">Autism</SelectItem>
                      <SelectItem value="adhd">ADHD</SelectItem>
                      <SelectItem value="dyslexia">Dyslexia</SelectItem>
                      <SelectItem value="anxiety">Anxiety</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Client
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Clients List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{client.fullName}</h3>
                          <p className="text-sm text-gray-600">Age {client.age}</p>
                        </div>
                      </div>
                      <Badge className={`${client.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-600">Condition</p>
                        <Badge variant="outline">{client.conditionType}</Badge>
                      </div>

                      <div>
                        <p className="font-medium text-gray-600">Contact</p>
                        <p>{client.email}</p>
                        <p>{client.phone}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                        <div className="text-center">
                          <p className="font-bold text-blue-600">{client.sessionStats.total}</p>
                          <p className="text-xs text-gray-600">Total Sessions</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-600">{client.assessmentStats.completed}</p>
                          <p className="text-xs text-gray-600">Assessments</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-purple-600">{formatCurrency(client.financial.totalPaid)}</p>
                          <p className="text-xs text-gray-600">Total Paid</p>
                        </div>
                      </div>

                      {client.sessionStats.lastDate && (
                        <div>
                          <p className="font-medium text-gray-600">Last Session</p>
                          <p>{new Date(client.sessionStats.lastDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            {/* Assessment Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search assessments..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assessments List */}
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{assessment.title}</h3>
                          <Badge className={getAssessmentStatusColor(assessment.status)}>
                            {assessment.status}
                          </Badge>
                          <Badge variant="outline">{assessment.assessmentType}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p className="font-medium">Client</p>
                            <p>{assessment.client.fullName}</p>
                            <p>Age {assessment.client.age}</p>
                          </div>
                          <div>
                            <p className="font-medium">Type</p>
                            <p>{assessment.client.conditionType}</p>
                          </div>
                          <div>
                            <p className="font-medium">Created</p>
                            <p>{new Date(assessment.createdAt).toLocaleDateString()}</p>
                            {assessment.completionDate && (
                              <p>Completed: {new Date(assessment.completionDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>

                        {assessment.description && (
                          <div className="mb-4">
                            <p className="font-medium text-sm text-gray-600 mb-1">Description:</p>
                            <p className="text-sm text-gray-800">{assessment.description}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Updated: {new Date(assessment.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {assessment.status !== 'completed' && (
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Continue
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Reports</CardTitle>
                <CardDescription>Generate and download comprehensive practice reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">Revenue Report</h3>
                        <p className="text-sm text-gray-600">Monthly income analysis</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-medium">Client Report</h3>
                        <p className="text-sm text-gray-600">Client progress and outcomes</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-medium">Assessment Report</h3>
                        <p className="text-sm text-gray-600">Assessment completions and results</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
