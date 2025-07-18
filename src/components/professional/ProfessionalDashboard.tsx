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
  Users,
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  TrendingDown,
  Star,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Plus,
  Eye,
  Edit,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Briefcase,
  User,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  activeAppointments: number;
  monthlyRevenue: number;
  monthlySessions: number;
  pendingAssessments: number;
  appointmentTypes: Record<string, number>;
  revenueTrend: Array<{
    month: string;
    revenue: number;
    sessions: number;
  }>;
  avgSatisfaction: number;
  totalRatings: number;
  assessmentCompletionRate: number;
  completedAssessments: number;
  totalAssessments: number;
  todayAppointments: Array<{
    id: string;
    time: string;
    duration: number;
    type: string;
    status: string;
    clientName: string;
    clientAge: number;
  }>;
  recentClients: Array<{
    id: string;
    name: string;
    conditionType: string;
    lastSession: string | null;
    totalSessions: number;
  }>;
}

interface ProfessionalDashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function ProfessionalDashboard({
  stats,
  loading,
  error,
  onRefresh
}: ProfessionalDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'assessment': return 'bg-blue-100 text-blue-800';
      case 'therapy': return 'bg-green-100 text-green-800';
      case 'consultation': return 'bg-purple-100 text-purple-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'autism': return 'bg-blue-100 text-blue-800';
      case 'adhd': return 'bg-orange-100 text-orange-800';
      case 'dyslexia': return 'bg-green-100 text-green-800';
      case 'anxiety': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateRevenueGrowth = () => {
    if (!stats?.revenueTrend || stats.revenueTrend.length < 2) return 0;

    const currentMonth = stats.revenueTrend[stats.revenueTrend.length - 1];
    const previousMonth = stats.revenueTrend[stats.revenueTrend.length - 2];

    if (previousMonth.revenue === 0) return 0;

    return ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeAppointments || 0}</p>
                <p className="text-xs text-gray-500">appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {calculateRevenueGrowth() >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${calculateRevenueGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(calculateRevenueGrowth()).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingAssessments || 0}</p>
                <p className="text-xs text-gray-500">assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.avgSatisfaction?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-gray-500">/ 5.0 rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.todayAppointments && stats.todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {stats.todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="font-medium text-sm">
                            {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">{appointment.duration}min</p>
                        </div>
                        <div>
                          <h4 className="font-medium">{appointment.clientName}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getAppointmentTypeColor(appointment.type)}>
                              {appointment.type}
                            </Badge>
                            <span className="text-sm text-gray-500">Age {appointment.clientAge}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments scheduled for today</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revenue Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Practice income and growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.monthlyRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.monthlySessions || 0}
                  </p>
                  <p className="text-sm text-gray-600">Sessions Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {stats?.monthlyRevenue && stats?.monthlySessions
                      ? formatCurrency(Math.round(stats.monthlyRevenue / stats.monthlySessions))
                      : '£0'
                    }
                  </p>
                  <p className="text-sm text-gray-600">Avg per Session</p>
                </div>
              </div>

              {/* Revenue Trend Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <p>Revenue trend chart</p>
                  <p className="text-sm">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Distribution</CardTitle>
              <CardDescription>Session types breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.appointmentTypes && Object.entries(stats.appointmentTypes).map(([type, count]) => {
                  const total = Object.values(stats.appointmentTypes).reduce((sum, c) => sum + c, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Badge className={getAppointmentTypeColor(type)}>{type}</Badge>
                          <span className="text-sm text-gray-600">{count} sessions</span>
                        </div>
                        <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
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
                New Client
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Start Assessment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Assessment Completion</span>
                  <span>{stats?.assessmentCompletionRate?.toFixed(1) || 0}%</span>
                </div>
                <Progress value={stats?.assessmentCompletionRate || 0} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Client Satisfaction</span>
                  <span>{((stats?.avgSatisfaction || 0) / 5 * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats?.avgSatisfaction || 0) / 5 * 100} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{stats?.completedAssessments || 0}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-600">{stats?.totalRatings || 0}</p>
                    <p className="text-xs text-gray-600">Reviews</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Clients</CardTitle>
              <CardDescription>Latest client activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentClients && stats.recentClients.length > 0 ? (
                  stats.recentClients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{client.name}</p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getConditionTypeColor(client.conditionType)} size="sm">
                              {client.conditionType}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {client.totalSessions} sessions
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No clients yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Practice Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Revenue Target</span>
                  <span>{formatCurrency(5000)}</span>
                </div>
                <Progress value={(stats?.monthlyRevenue || 0) / 5000 * 100} className="h-2" />
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats?.monthlyRevenue || 0)} of {formatCurrency(5000)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Client Growth Target</span>
                  <span>50 clients</span>
                </div>
                <Progress value={(stats?.totalClients || 0) / 50 * 100} className="h-2" />
                <p className="text-xs text-gray-500">
                  {stats?.totalClients || 0} of 50 clients
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
