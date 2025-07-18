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
  GraduationCap,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  School,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Target,
  BookOpen,
  UserCheck,
  ClipboardList,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useSencoData } from '@/hooks/useSencoData';

export default function SencoPortalPage() {
  const { user, isLoading: authLoading } = useRequireAuth(['SCHOOL_SENCO']);
  const {
    dashboardStats,
    students,
    educationPlans,
    loading,
    error,
    loadAllData,
    loadStudents,
    loadEducationPlans,
    getSendStatusColor,
    getPlanStatusColor,
    getUrgencyColor,
    formatDate,
    calculateAge,
    setError
  } = useSencoData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterYearGroup, setFilterYearGroup] = useState<string>('all');
  const [filterSendStatus, setFilterSendStatus] = useState<string>('all');
  const [filterPlanType, setFilterPlanType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle search and filter changes for students
  useEffect(() => {
    if (activeTab === 'students') {
      const delayedSearch = setTimeout(() => {
        loadStudents({
          search: searchTerm || undefined,
          yearGroup: filterYearGroup !== 'all' ? filterYearGroup : undefined,
          sendStatus: filterSendStatus !== 'all' ? filterSendStatus : undefined
        });
      }, 300);

      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm, filterYearGroup, filterSendStatus, activeTab, loadStudents]);

  // Handle filters for education plans
  useEffect(() => {
    if (activeTab === 'education-plans') {
      loadEducationPlans({
        planType: filterPlanType !== 'all' ? filterPlanType : undefined,
        search: searchTerm || undefined
      });
    }
  }, [filterPlanType, searchTerm, activeTab, loadEducationPlans]);

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
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SENCO Portal</h1>
                <p className="text-sm text-gray-600">
                  {dashboardStats?.school?.name || 'School SEND Management'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {dashboardStats?.summary?.sendStudents || 0} SEND Students
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="education-plans" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Education Plans</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center space-x-2">
              <ClipboardList className="h-4 w-4" />
              <span>Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Staff</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            {/* Dashboard Overview */}
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardStats?.summary?.totalStudents || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Target className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">SEND Students</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardStats?.summary?.sendStudents || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dashboardStats?.summary?.sendPercentage?.toFixed(1) || 0}% of total
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">EHC Plans</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardStats?.summary?.ehcpStudents || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">SEND Support</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardStats?.summary?.sendSupportStudents || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Overdue Reviews</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dashboardStats?.deadlinesSummary?.overdue || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Compliance Deadlines */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Compliance Deadlines</CardTitle>
                          <CardDescription>Upcoming reviews and statutory deadlines</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Review
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {dashboardStats?.complianceDeadlines && dashboardStats.complianceDeadlines.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardStats.complianceDeadlines.slice(0, 10).map((deadline) => (
                            <div key={deadline.planId} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-full ${getUrgencyColor(deadline.urgency)}`}>
                                  <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{deadline.studentName}</h4>
                                  <p className="text-sm text-gray-600">
                                    {deadline.planType.toUpperCase()} Review - Year {deadline.yearGroup}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Due: {formatDate(deadline.reviewDate)}
                                    ({deadline.daysUntilDue > 0 ? `${deadline.daysUntilDue} days` : 'Overdue'})
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm">Schedule</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <p className="text-gray-600">All reviews are up to date</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Activities */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activities</CardTitle>
                      <CardDescription>Latest updates and progress entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardStats?.recentActivities && dashboardStats.recentActivities.length > 0 ? (
                          dashboardStats.recentActivities.slice(0, 8).map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="p-1 bg-blue-100 rounded-full">
                                {activity.type === 'progress_update' && <TrendingUp className="h-3 w-3 text-blue-600" />}
                                {activity.type === 'assessment_completed' && <FileText className="h-3 w-3 text-green-600" />}
                                {activity.type === 'intervention_started' && <Target className="h-3 w-3 text-purple-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">{activity.studentName}</span> - {activity.description}
                                </p>
                                <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 text-center py-4">No recent activities</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Student
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Create Education Plan
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Review
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Primary Needs Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Primary Needs</CardTitle>
                      <CardDescription>Distribution of SEND needs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardStats?.primaryNeeds && dashboardStats.primaryNeeds.length > 0 ? (
                          dashboardStats.primaryNeeds.map((need) => (
                            <div key={need.need} className="flex items-center justify-between">
                              <span className="text-sm font-medium capitalize">
                                {need.need?.replace('_', ' ') || 'Unknown'}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">{need.count}</span>
                                <span className="text-xs text-gray-500">({need.percentage}%)</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 text-center py-4">No SEND students</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Year Group Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Year Groups</CardTitle>
                      <CardDescription>SEND distribution by year</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboardStats?.yearGroups && dashboardStats.yearGroups.length > 0 ? (
                          dashboardStats.yearGroups.map((year) => (
                            <div key={year.yearGroup} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Year {year.yearGroup}</span>
                                <span>{year.sendStudents} / {year.totalStudents}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${year.sendPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 text-center py-4">No year group data</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Staff Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Staff Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Teaching Staff</span>
                          <span className="font-medium">{dashboardStats?.staffSummary?.teachers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Teaching Assistants</span>
                          <span className="font-medium">{dashboardStats?.staffSummary?.teachingAssistants || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total TA Hours/Week</span>
                          <span className="font-medium">{dashboardStats?.staffSummary?.totalTAHours?.toFixed(1) || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Student Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterYearGroup} onValueChange={setFilterYearGroup}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Year Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="R">Reception</SelectItem>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                      <SelectItem value="4">Year 4</SelectItem>
                      <SelectItem value="5">Year 5</SelectItem>
                      <SelectItem value="6">Year 6</SelectItem>
                      <SelectItem value="7">Year 7</SelectItem>
                      <SelectItem value="8">Year 8</SelectItem>
                      <SelectItem value="9">Year 9</SelectItem>
                      <SelectItem value="10">Year 10</SelectItem>
                      <SelectItem value="11">Year 11</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSendStatus} onValueChange={setFilterSendStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="SEND Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ehc_plan">EHC Plan</SelectItem>
                      <SelectItem value="send_support">SEND Support</SelectItem>
                      <SelectItem value="no_send">No SEND</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <Card key={student.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{student.fullName}</h3>
                          <p className="text-sm text-gray-600">Year {student.yearGroup} • Age {student.age}</p>
                        </div>
                      </div>
                      <Badge className={getSendStatusColor(student.sendStatus)}>
                        {student.sendStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      {student.primaryNeed && (
                        <div>
                          <p className="font-medium text-gray-600">Primary Need</p>
                          <p className="capitalize">{student.primaryNeed.replace('_', ' ')}</p>
                        </div>
                      )}

                      {student.currentPlan && (
                        <div>
                          <p className="font-medium text-gray-600">Current Plan</p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPlanStatusColor(student.currentPlan.status)}>
                              {student.currentPlan.type.toUpperCase()}
                            </Badge>
                            {student.currentPlan.nextReviewDate && (
                              <span className="text-xs text-gray-500">
                                Review due: {formatDate(student.currentPlan.nextReviewDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {student.teachingAssistantHours > 0 && (
                        <div>
                          <p className="font-medium text-gray-600">TA Support</p>
                          <p>{student.teachingAssistantHours} hours/week</p>
                        </div>
                      )}

                      {student.contacts.parent1.name && (
                        <div>
                          <p className="font-medium text-gray-600">Parent Contact</p>
                          <p>{student.contacts.parent1.name}</p>
                          <p className="text-xs">{student.contacts.parent1.email}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="education-plans" className="space-y-6">
            {/* Education Plans Content */}
            <Card>
              <CardHeader>
                <CardTitle>Education Plans Management</CardTitle>
                <CardDescription>Manage IEPs, EHCPs, and support plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Education plans management interface</p>
                  <p className="text-sm text-gray-500">Coming soon in this implementation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            {/* Compliance Content */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Reporting</CardTitle>
                <CardDescription>Statutory requirements and deadline tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Compliance monitoring interface</p>
                  <p className="text-sm text-gray-500">Coming soon in this implementation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            {/* Staff Content */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Management</CardTitle>
                <CardDescription>SEND staff coordination and training</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Staff management interface</p>
                  <p className="text-sm text-gray-500">Coming soon in this implementation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Reports Content */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>SEND outcomes and effectiveness analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analytics and reporting interface</p>
                  <p className="text-sm text-gray-500">Coming soon in this implementation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
