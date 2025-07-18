'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApiCall } from '@/hooks/useAuth';

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

interface Appointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  feeAmount: number;
  paymentStatus: string;
  notes: string;
  sessionNumber: number;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    age: number;
    conditionType: string;
    emergencyContact: {
      name: string;
      phone: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  conditionType: string;
  diagnosisDate: string;
  referralSource: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo: {
    conditions: string[];
    medications: string[];
    specialRequirements: string;
  };
  goals: string[];
  notes: string;
  isActive: boolean;
  sessionStats: {
    total: number;
    completed: number;
    upcoming: number;
    lastDate: string | null;
    nextDate: string | null;
  };
  financial: {
    totalPaid: number;
    outstandingBalance: number;
  };
  assessmentStats: {
    total: number;
    completed: number;
    lastDate: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface Assessment {
  id: string;
  assessmentType: string;
  title: string;
  description: string;
  status: string;
  assessmentData: any;
  scores: any;
  recommendations: string[];
  completionDate: string | null;
  client: {
    firstName: string;
    lastName: string;
    fullName: string;
    age: number;
    conditionType: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  clientId?: string;
  view?: 'calendar' | 'list';
  limit?: number;
  offset?: number;
}

interface ClientFilters {
  search?: string;
  conditionType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface AssessmentFilters {
  clientId?: string;
  assessmentType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export function useProfessionalData() {
  const { makeApiCall } = useApiCall();

  // State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    appointments: { total: 0, limit: 50, offset: 0, hasMore: false },
    clients: { total: 0, limit: 50, offset: 0, hasMore: false },
    assessments: { total: 0, limit: 50, offset: 0, hasMore: false }
  });

  // Load dashboard statistics
  const loadDashboardStats = useCallback(async () => {
    try {
      setError(null);
      const response = await makeApiCall('/api/professional/dashboard');

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardStats(result.data);
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load dashboard statistics');
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard statistics');
    }
  }, [makeApiCall]);

  // Load appointments with filters
  const loadAppointments = useCallback(async (filters: AppointmentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      const response = await makeApiCall(`/api/professional/appointments?${searchParams.toString()}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAppointments(result.data);
          setPagination(prev => ({
            ...prev,
            appointments: result.pagination
          }));
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [makeApiCall]);

  // Load clients with filters
  const loadClients = useCallback(async (filters: ClientFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      const response = await makeApiCall(`/api/professional/clients?${searchParams.toString()}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClients(result.data);
          setPagination(prev => ({
            ...prev,
            clients: result.pagination
          }));
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load clients');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setError(error instanceof Error ? error.message : 'Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [makeApiCall]);

  // Load assessments with filters
  const loadAssessments = useCallback(async (filters: AssessmentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      const response = await makeApiCall(`/api/professional/assessments?${searchParams.toString()}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAssessments(result.data);
          setPagination(prev => ({
            ...prev,
            assessments: result.pagination
          }));
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load assessments');
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  }, [makeApiCall]);

  // Create appointment
  const createAppointment = useCallback(async (appointmentData: {
    clientId: string;
    appointmentDate: string;
    appointmentTime: string;
    durationMinutes?: number;
    appointmentType?: string;
    feeAmount?: number;
    notes?: string;
    sendReminder?: boolean;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/professional/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadAppointments();
          await loadDashboardStats();
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadAppointments, loadDashboardStats]);

  // Update appointment
  const updateAppointment = useCallback(async (appointmentData: {
    appointmentId: string;
    status?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    durationMinutes?: number;
    feeAmount?: number;
    notes?: string;
    paymentStatus?: string;
    sessionNotes?: string;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/professional/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadAppointments();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadAppointments, loadDashboardStats]);

  // Cancel appointment
  const cancelAppointment = useCallback(async (appointmentId: string) => {
    try {
      setError(null);
      const response = await makeApiCall(`/api/professional/appointments?id=${appointmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadAppointments();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadAppointments, loadDashboardStats]);

  // Create client
  const createClient = useCallback(async (clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    conditionType: string;
    diagnosisDate?: string;
    referralSource?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    medicalConditions?: string[];
    medications?: string[];
    specialRequirements?: string;
    goals?: string[];
    notes?: string;
    parentEmail?: string;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/professional/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadClients();
          await loadDashboardStats();
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadClients, loadDashboardStats]);

  // Update client
  const updateClient = useCallback(async (clientData: {
    clientId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    conditionType?: string;
    diagnosisDate?: string;
    referralSource?: string;
    emergencyContact?: {
      name?: string;
      phone?: string;
      relationship?: string;
    };
    medicalConditions?: string[];
    medications?: string[];
    specialRequirements?: string;
    goals?: string[];
    notes?: string;
    isActive?: boolean;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/professional/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadClients();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadClients, loadDashboardStats]);

  // Create assessment
  const createAssessment = useCallback(async (assessmentData: {
    clientId: string;
    assessmentType: string;
    title: string;
    description?: string;
    assessmentData?: any;
    templateId?: string;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/professional/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadAssessments();
          await loadDashboardStats();
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to create assessment');
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create assessment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadAssessments, loadDashboardStats]);

  // Update assessment
  const updateAssessment = useCallback(async (assessmentData: {
    assessmentId: string;
    assessmentData?: any;
    scores?: any;
    recommendations?: string[];
    status?: string;
    completionDate?: string;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/professional/assessments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadAssessments();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update assessment');
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update assessment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadAssessments, loadDashboardStats]);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadAppointments(),
        loadClients(),
        loadAssessments()
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadDashboardStats, loadAppointments, loadClients, loadAssessments]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Utility functions
  const getAppointmentStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getAssessmentStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100);
  }, []);

  return {
    // Data
    dashboardStats,
    appointments,
    clients,
    assessments,
    pagination,

    // State
    loading,
    error,

    // Actions
    loadDashboardStats,
    loadAppointments,
    loadClients,
    loadAssessments,
    loadAllData,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    createClient,
    updateClient,
    createAssessment,
    updateAssessment,
    setError,

    // Utilities
    getAppointmentStatusColor,
    getAssessmentStatusColor,
    formatCurrency
  };
}
