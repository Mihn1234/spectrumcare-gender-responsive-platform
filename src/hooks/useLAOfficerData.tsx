'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApiCall } from '@/hooks/useAuth';

interface DashboardStats {
  totalCases: number;
  pendingCases: number;
  overdueDeadlines: number;
  completedThisMonth: number;
  averageProcessingTime: number;
  budgetUtilization: number;
  casesByStatus: Record<string, number>;
  casesByPriority: Record<string, number>;
  teamWorkload: {
    caseworker: string;
    activeCases: number;
    completedCases: number;
    averageTime: number;
  }[];
}

interface CaseData {
  id: string;
  caseNumber: string;
  childName: string;
  childAge: number;
  status: string;
  priority: string;
  caseType: string;
  assignedCaseworker: string;
  caseworkerEmail?: string;
  nextDeadline: string | null;
  daysRemaining: number | null;
  school: string;
  lastUpdate: string;
  completionPercentage: number;
  estimatedBudget: number;
  actualCost: number;
  recentUpdatesCount: number;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  isActive: boolean;
  lastLogin: string | null;
  joinedDate: string;
  specializations: string[];
  workload: {
    activeCases: number;
    completedCases30d: number;
    completedCases90d: number;
    overdueCases: number;
    urgentCases: number;
    highPriorityCases: number;
    avgCompletionDays: number;
    complianceScore: number;
    budgetEfficiency: number;
  };
  caseDistribution: Record<string, number>;
  recentActivity: {
    title: string;
    type: string;
    date: string;
    caseNumber: string;
  }[];
  performance: {
    workloadStatus: 'light' | 'normal' | 'overloaded';
    complianceRating: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    efficiencyRating: 'excellent' | 'good' | 'average' | 'poor';
  };
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalActiveCases: number;
  totalOverdueCases: number;
  avgComplianceScore: number;
  avgBudgetEfficiency: number;
  workloadDistribution: {
    overloaded: number;
    normal: number;
    light: number;
  };
}

interface CaseFilters {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export function useLAOfficerData() {
  const { makeApiCall } = useApiCall();

  // State
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  // Load dashboard statistics
  const loadDashboardStats = useCallback(async () => {
    try {
      setError(null);
      const response = await makeApiCall('/api/la-officer/dashboard');

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

  // Load cases with filters
  const loadCases = useCallback(async (filters: CaseFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, value.toString());
        }
      });

      const response = await makeApiCall(`/api/la-officer/cases?${searchParams.toString()}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCases(result.data);
          setPagination(result.pagination);
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load cases');
      }
    } catch (error) {
      console.error('Error loading cases:', error);
      setError(error instanceof Error ? error.message : 'Failed to load cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [makeApiCall]);

  // Load team data
  const loadTeamData = useCallback(async (includeInactive = false) => {
    try {
      setError(null);
      const response = await makeApiCall(`/api/la-officer/team?includeInactive=${includeInactive}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTeamMembers(result.data.teamMembers);
          setTeamStats(result.data.teamStats);
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load team data');
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load team data');
    }
  }, [makeApiCall]);

  // Create new case
  const createCase = useCallback(async (caseData: {
    childId: string;
    caseType?: string;
    priority?: string;
    assignedCaseworkerId?: string;
    estimatedBudget?: number;
    notes?: string;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/la-officer/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload cases to include the new one
          await loadCases();
          await loadDashboardStats();
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to create case');
      }
    } catch (error) {
      console.error('Error creating case:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create case';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadCases, loadDashboardStats]);

  // Update case
  const updateCase = useCallback(async (caseData: {
    caseId: string;
    status?: string;
    priority?: string;
    assignedCaseworkerId?: string;
    estimatedBudget?: number;
    actualCost?: number;
    notes?: string;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/la-officer/cases', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload data to reflect changes
          await loadCases();
          await loadDashboardStats();
          await loadTeamData();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update case');
      }
    } catch (error) {
      console.error('Error updating case:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update case';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadCases, loadDashboardStats, loadTeamData]);

  // Reassign cases
  const reassignCases = useCallback(async (data: {
    caseIds: string[];
    newAssigneeId: string;
    notes?: string;
  }) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/la-officer/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reassign_cases',
          ...data
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload data to reflect changes
          await loadCases();
          await loadTeamData();
          await loadDashboardStats();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to reassign cases');
      }
    } catch (error) {
      console.error('Error reassigning cases:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reassign cases';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadCases, loadTeamData, loadDashboardStats]);

  // Update team member status
  const updateTeamMemberStatus = useCallback(async (memberId: string, isActive: boolean) => {
    try {
      setError(null);
      const response = await makeApiCall('/api/la-officer/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_member_status',
          memberId,
          isActive
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload team data
          await loadTeamData();
          return result;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to update team member status');
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update team member';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadTeamData]);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadCases(),
        loadTeamData()
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadDashboardStats, loadCases, loadTeamData]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Utility functions
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'FINAL': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW': return 'bg-blue-100 text-blue-800';
      case 'ASSESSMENT': return 'bg-purple-100 text-purple-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'APPEAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getWorkloadStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'overloaded': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'light': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  return {
    // Data
    dashboardStats,
    cases,
    teamMembers,
    teamStats,
    pagination,

    // State
    loading,
    error,

    // Actions
    loadDashboardStats,
    loadCases,
    loadTeamData,
    loadAllData,
    createCase,
    updateCase,
    reassignCases,
    updateTeamMemberStatus,
    setError,

    // Utilities
    getStatusColor,
    getPriorityColor,
    getWorkloadStatusColor
  };
}
