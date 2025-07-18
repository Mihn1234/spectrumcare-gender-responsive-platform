'use client';

import { useState, useEffect } from 'react';
import { useApiCall } from './useAuth';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  school: string;
  ehcStatus: 'DRAFT' | 'FINAL' | 'REVIEW' | 'ASSESSMENT' | 'PENDING';
  caseNumber?: string;
  nextReview?: string;
  keyWorker: string;
  lastAssessment?: string;
  estimatedBudget?: number;
  actualCost: number;
  nhsNumber?: string;
  upn?: string;
}

interface CaseUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'ASSESSMENT' | 'MEETING' | 'DOCUMENT' | 'REVIEW' | 'PARENT_COMMENT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  childName?: string;
  caseNumber?: string;
  caseStatus?: string;
  createdBy?: string;
  createdByRole?: string;
}

interface Appointment {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration?: number;
  type: 'ASSESSMENT' | 'REVIEW' | 'THERAPY' | 'MEETING';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REQUESTED';
  location?: string;
  locationType?: string;
  notes?: string;
  childName: string;
  professional?: {
    name: string;
    specialization?: string;
    organization?: string;
    email?: string;
    phone?: string;
  };
}

export function useParentData() {
  const { makeApiCall } = useApiCall();
  const [children, setChildren] = useState<Child[]>([]);
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all parent data
  const loadParentData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load children first
      const childrenResponse = await makeApiCall('/api/parent/children');
      if (childrenResponse.ok) {
        const childrenResult = await childrenResponse.json();
        if (childrenResult.success) {
          setChildren(childrenResult.data);

          // Load case updates and appointments in parallel
          const [caseUpdatesResponse, appointmentsResponse] = await Promise.all([
            makeApiCall('/api/parent/case-updates'),
            makeApiCall('/api/parent/appointments?fromDate=' + new Date().toISOString().split('T')[0])
          ]);

          if (caseUpdatesResponse.ok) {
            const caseUpdatesResult = await caseUpdatesResponse.json();
            if (caseUpdatesResult.success) {
              setCaseUpdates(caseUpdatesResult.data);
            }
          }

          if (appointmentsResponse.ok) {
            const appointmentsResult = await appointmentsResponse.json();
            if (appointmentsResult.success) {
              setAppointments(appointmentsResult.data);
            }
          }
        } else {
          setError(childrenResult.message || 'Failed to load children data');
        }
      } else {
        setError('Failed to load parent data');
      }
    } catch (err) {
      console.error('Error loading parent data:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load data for specific child
  const loadChildData = async (childId: string) => {
    try {
      const [caseUpdatesResponse, appointmentsResponse] = await Promise.all([
        makeApiCall(`/api/parent/case-updates?childId=${childId}`),
        makeApiCall(`/api/parent/appointments?childId=${childId}`)
      ]);

      const updates: CaseUpdate[] = [];
      const childAppointments: Appointment[] = [];

      if (caseUpdatesResponse.ok) {
        const result = await caseUpdatesResponse.json();
        if (result.success) {
          updates.push(...result.data);
        }
      }

      if (appointmentsResponse.ok) {
        const result = await appointmentsResponse.json();
        if (result.success) {
          childAppointments.push(...result.data);
        }
      }

      return { updates, appointments: childAppointments };
    } catch (err) {
      console.error('Error loading child data:', err);
      throw err;
    }
  };

  // Add new child
  const addChild = async (childData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nhsNumber?: string;
    upn?: string;
    schoolId?: string;
  }) => {
    try {
      const response = await makeApiCall('/api/parent/children', {
        method: 'POST',
        body: JSON.stringify(childData),
      });

      const result = await response.json();
      if (result.success) {
        // Reload children data
        await loadParentData();
        return true;
      } else {
        setError(result.message || 'Failed to add child');
        return false;
      }
    } catch (err) {
      console.error('Error adding child:', err);
      setError('Failed to add child');
      return false;
    }
  };

  // Add case update/comment
  const addCaseUpdate = async (updateData: {
    caseId: string;
    title: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) => {
    try {
      const response = await makeApiCall('/api/parent/case-updates', {
        method: 'POST',
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (result.success) {
        // Reload case updates
        const caseUpdatesResponse = await makeApiCall('/api/parent/case-updates');
        if (caseUpdatesResponse.ok) {
          const updatesResult = await caseUpdatesResponse.json();
          if (updatesResult.success) {
            setCaseUpdates(updatesResult.data);
          }
        }
        return true;
      } else {
        setError(result.message || 'Failed to add case update');
        return false;
      }
    } catch (err) {
      console.error('Error adding case update:', err);
      setError('Failed to add case update');
      return false;
    }
  };

  // Request appointment
  const requestAppointment = async (appointmentData: {
    childId: string;
    title: string;
    description?: string;
    appointmentType: string;
    preferredDate?: string;
    preferredTime?: string;
    professionalId?: string;
    notes?: string;
  }) => {
    try {
      const response = await makeApiCall('/api/parent/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();
      if (result.success) {
        // Reload appointments
        const appointmentsResponse = await makeApiCall('/api/parent/appointments');
        if (appointmentsResponse.ok) {
          const appointmentsResult = await appointmentsResponse.json();
          if (appointmentsResult.success) {
            setAppointments(appointmentsResult.data);
          }
        }
        return true;
      } else {
        setError(result.message || 'Failed to request appointment');
        return false;
      }
    } catch (err) {
      console.error('Error requesting appointment:', err);
      setError('Failed to request appointment');
      return false;
    }
  };

  // Update appointment
  const updateAppointment = async (appointmentId: string, updates: {
    status?: string;
    notes?: string;
    newDate?: string;
    newTime?: string;
  }) => {
    try {
      const response = await makeApiCall('/api/parent/appointments', {
        method: 'PUT',
        body: JSON.stringify({ appointmentId, ...updates }),
      });

      const result = await response.json();
      if (result.success) {
        // Reload appointments
        const appointmentsResponse = await makeApiCall('/api/parent/appointments');
        if (appointmentsResponse.ok) {
          const appointmentsResult = await appointmentsResponse.json();
          if (appointmentsResult.success) {
            setAppointments(appointmentsResult.data);
          }
        }
        return true;
      } else {
        setError(result.message || 'Failed to update appointment');
        return false;
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment');
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadParentData();
  }, []);

  return {
    children,
    caseUpdates,
    appointments,
    loading,
    error,
    loadParentData,
    loadChildData,
    addChild,
    addCaseUpdate,
    requestAppointment,
    updateAppointment,
    setError,
  };
}
