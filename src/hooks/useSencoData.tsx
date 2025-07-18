'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApiCall } from '@/hooks/useAuth';

interface DashboardStats {
  school: {
    id: string;
    name: string;
    sencoName: string;
    currentEnrollment: number;
    pupilCapacity: number;
  };
  summary: {
    totalStudents: number;
    sendStudents: number;
    ehcpStudents: number;
    sendSupportStudents: number;
    sendPercentage: number;
    schoolCapacity: number;
    currentEnrollment: number;
  };
  primaryNeeds: Array<{
    need: string;
    count: number;
    percentage: number;
  }>;
  yearGroups: Array<{
    yearGroup: string;
    totalStudents: number;
    sendStudents: number;
    sendPercentage: number;
  }>;
  complianceDeadlines: Array<{
    planId: string;
    studentName: string;
    yearGroup: string;
    planType: string;
    reviewDate: string;
    daysUntilDue: number;
    urgency: 'OVERDUE' | 'URGENT' | 'DUE_SOON' | 'FUTURE';
  }>;
  recentActivities: Array<{
    type: string;
    studentName: string;
    subject: string;
    status: string;
    date: string;
    description: string;
  }>;
  staffSummary: {
    totalStaff: number;
    teachers: number;
    teachingAssistants: number;
    sencos: number;
    totalTAHours: number;
    avgTAHours: number;
  };
  activeInterventions: Array<{
    name: string;
    type: string;
    activeStudents: number;
    avgFrequency: number;
    successfulOutcomes: number;
  }>;
  progressTrends: Array<{
    month: string;
    totalMeasurements: number;
    exceeded: number;
    met: number;
    progressing: number;
    concern: number;
    successRate: number;
  }>;
  communications: {
    total: number;
    meetings: number;
    phoneCalls: number;
    emails: number;
    recentCommunications: number;
    avgSatisfaction: number;
    pendingFollowUps: number;
  };
  deadlinesSummary: {
    overdue: number;
    urgent: number;
    dueSoon: number;
    future: number;
  };
}

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  yearGroup: string;
  className: string;
  gender: string;
  sendStatus: 'no_send' | 'send_support' | 'ehc_plan' | 'statement';
  primaryNeed: string;
  secondaryNeeds: string[];
  dateIdentified: string;
  sendRegisterEntryDate: string;
  contacts: {
    parent1: {
      name: string;
      email: string;
      phone: string;
    };
    parent2: {
      name: string;
      email: string;
      phone: string;
    };
  };
  medicalConditions: string[];
  currentInterventions: string[];
  teachingAssistantHours: number;
  activeInterventionsCount: number;
  currentPlan?: {
    id: string;
    type: string;
    status: string;
    title: string;
    nextReviewDate: string;
    daysUntilReview: number;
  };
  recentProgress?: {
    date: string;
    rating: string;
    subject: string;
  };
  recentAssessment?: {
    date: string;
    name: string;
    type: string;
  };
  progressSummary?: Array<{
    subject: string;
    avgScore: number;
    totalMeasurements: number;
    latestMeasurement: string;
  }>;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface EducationPlan {
  id: string;
  planType: 'iep' | 'ehcp' | 'statement' | 'support_plan';
  planNumber: string;
  status: 'draft' | 'active' | 'under_review' | 'completed' | 'ceased';
  title: string;
  startDate: string;
  endDate: string;
  reviewDate: string;
  nextReviewDate: string;
  annualReviewDue: string;
  reviewUrgency: 'OVERDUE' | 'URGENT' | 'DUE_SOON' | 'FUTURE';
  daysUntilReview: number;
  student: {
    id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
    yearGroup: string;
    className: string;
    primaryNeed: string;
    sendStatus: string;
  };
  currentProvision: string;
  outcomes: any[];
  targets: any[];
  strategies: any[];
  resourcesRequired: string[];
  staffingRequirements: any;
  strengths: string;
  difficulties: string;
  barriersToLearning: string;
  views: {
    student: string;
    parent: string;
    professional: string;
  };
  transitionPlanning: string;
  review: {
    notes: string;
    parentAttendance: boolean;
    studentAttendance: boolean;
  };
  progressSummary: {
    entriesCount: number;
    avgRating: number;
  };
  participants: Array<{
    type: string;
    name: string;
    role: string;
    email: string;
    organization: string;
    contribution: string;
    attendanceRequired: boolean;
    attendedReview: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface StudentFilters {
  search?: string;
  yearGroup?: string;
  sendStatus?: string;
  primaryNeed?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeProgress?: boolean;
}

interface EducationPlanFilters {
  studentId?: string;
  planType?: string;
  status?: string;
  reviewDue?: 'overdue' | 'this_month' | 'next_month';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export function useSencoData() {
  const { makeApiCall } = useApiCall();

  // State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [educationPlans, setEducationPlans] = useState<EducationPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    students: { total: 0, limit: 50, offset: 0, hasMore: false },
    educationPlans: { total: 0, limit: 50, offset: 0, hasMore: false }
  });

  // Load dashboard statistics
  const loadDashboardStats = useCallback(async () => {
    try {
      setError(null);
      const response = await makeApiCall('/api/senco/dashboard');

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

  // Load students with filters
  const loadStudents = useCallback(async (filters: StudentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      const response = await makeApiCall(`/api/senco/students?${searchParams.toString()}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudents(result.data);
          setPagination(prev => ({
            ...prev,
            students: result.pagination
          }));
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load students');
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setError(error instanceof Error ? error.message : 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [makeApiCall]);

  // Load education plans with filters
  const loadEducationPlans = useCallback(async (filters: EducationPlanFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      const response = await makeApiCall(`/api/senco/education-plans?${searchParams.toString()}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEducationPlans(result.data);
          setPagination(prev => ({
            ...prev,
            educationPlans: result.pagination
          }));
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load education plans');
      }
    } catch (error) {
      console.error('Error loading education plans:', error);
      setError(error instanceof Error ? error.message : 'Failed to load education plans');
      setEducationPlans([]);
    } finally {
      setLoading(false);
    }
  }, [makeApiCall]);

  // Create student
  const createStudent = useCallback(async (studentData: {
    studentId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    yearGroup: string;
    className?: string;
    gender?: string;
    ethnicity?: string;
    primaryLanguage?: string;
    sendStatus: string;
    primaryNeed?: string;
    secondaryNeeds?: string[];
    dateIdentified?: string;
    parent1?: any;
    parent2?: any;
    emergencyContact?: any;
    medicalConditions?: string[];
    allergies?: string[];
    medications?: any;
    currentInterventions?: string[];
    teachingAssistantHours?: number;
    notes?: string;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/senco/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadStudents();
          await loadDashboardStats();
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create student';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadStudents, loadDashboardStats]);

  // Update student
  const updateStudent = useCallback(async (studentData: { id: string; [key: string]: any }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/senco/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadStudents();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update student';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadStudents, loadDashboardStats]);

  // Create education plan
  const createEducationPlan = useCallback(async (planData: {
    studentId: string;
    planType: string;
    planNumber?: string;
    title: string;
    startDate: string;
    endDate?: string;
    reviewDate: string;
    nextReviewDate?: string;
    currentProvision?: string;
    outcomes?: any[];
    targets?: any[];
    strategies?: any[];
    resourcesRequired?: string[];
    staffingRequirements?: any;
    strengths?: string;
    difficulties?: string;
    barriersToLearning?: string;
    studentViews?: string;
    parentViews?: string;
    professionalViews?: string;
    transitionPlanning?: string;
    participants?: any[];
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/senco/education-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadEducationPlans();
          await loadDashboardStats();
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to create education plan');
      }
    } catch (error) {
      console.error('Error creating education plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create education plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadEducationPlans, loadDashboardStats]);

  // Update education plan
  const updateEducationPlan = useCallback(async (planData: { planId: string; [key: string]: any }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/senco/education-plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadEducationPlans();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update education plan');
      }
    } catch (error) {
      console.error('Error updating education plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update education plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadEducationPlans, loadDashboardStats]);

  // Complete plan review
  const completeReview = useCallback(async (reviewData: {
    planId: string;
    reviewDate?: string;
    nextReviewDate?: string;
    reviewNotes?: string;
    attendees?: {
      parentAttended: boolean;
      studentAttended: boolean;
      participants?: Array<{ name: string; attended: boolean }>;
    };
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/senco/education-plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewData,
          action: 'complete_review'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadEducationPlans();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to complete review');
      }
    } catch (error) {
      console.error('Error completing review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete review';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadEducationPlans, loadDashboardStats]);

  // Update plan status
  const updatePlanStatus = useCallback(async (planId: string, action: 'activate' | 'complete' | 'schedule_review', additionalData?: any) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/senco/education-plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          action,
          ...additionalData
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadEducationPlans();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update plan status');
      }
    } catch (error) {
      console.error('Error updating plan status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update plan status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadEducationPlans, loadDashboardStats]);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadStudents(),
        loadEducationPlans()
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadDashboardStats, loadStudents, loadEducationPlans]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Utility functions
  const getSendStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'ehc_plan': return 'bg-red-100 text-red-800';
      case 'send_support': return 'bg-yellow-100 text-yellow-800';
      case 'statement': return 'bg-purple-100 text-purple-800';
      case 'no_send': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getPlanStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'ceased': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getUrgencyColor = useCallback((urgency: string) => {
    switch (urgency) {
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'URGENT': return 'bg-orange-100 text-orange-800';
      case 'DUE_SOON': return 'bg-yellow-100 text-yellow-800';
      case 'FUTURE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  }, []);

  const calculateAge = useCallback((dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, []);

  return {
    // Data
    dashboardStats,
    students,
    educationPlans,
    pagination,

    // State
    loading,
    error,

    // Actions
    loadDashboardStats,
    loadStudents,
    loadEducationPlans,
    loadAllData,
    createStudent,
    updateStudent,
    createEducationPlan,
    updateEducationPlan,
    completeReview,
    updatePlanStatus,
    setError,

    // Utilities
    getSendStatusColor,
    getPlanStatusColor,
    getUrgencyColor,
    formatDate,
    calculateAge
  };
}
