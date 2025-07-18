'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApiCall } from '@/hooks/useAuth';

interface Subscription {
  id: string;
  planType: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  monthlyPrice: number;
  cancelAtPeriodEnd: boolean;
  lastPayment?: {
    amount: number;
    date: string;
    status: string;
  };
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface UsageStats {
  totalSpent: number;
  currentPeriodSpent: number;
  invoiceCount: number;
  subscriptionCount: number;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  formattedPrice: string;
}

interface SubscriptionData {
  subscription: Subscription | null;
  paymentMethods: PaymentMethod[];
  usageStats: UsageStats | null;
  availablePlans: Plan[];
  isEligibleForTrial: boolean;
}

export function useSubscription() {
  const { makeApiCall } = useApiCall();

  const [data, setData] = useState<SubscriptionData>({
    subscription: null,
    paymentMethods: [],
    usageStats: null,
    availablePlans: [],
    isEligibleForTrial: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeApiCall('/api/payments/subscriptions');

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData({
            subscription: result.data.subscription,
            paymentMethods: result.data.paymentMethods || [],
            usageStats: result.data.usageStats,
            availablePlans: result.data.availablePlans || [],
            isEligibleForTrial: result.data.isEligibleForTrial
          });
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load subscription data');
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [makeApiCall]);

  // Create subscription
  const createSubscription = useCallback(async (planId: string, paymentMethodId?: string, trialDays = 14) => {
    try {
      setError(null);

      const response = await makeApiCall('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          paymentMethodId,
          trialDays
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadSubscriptionData(); // Reload data
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadSubscriptionData]);

  // Update subscription (cancel, reactivate, change plan)
  const updateSubscription = useCallback(async (action: string, planId?: string) => {
    try {
      setError(null);

      const response = await makeApiCall('/api/payments/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, planId })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadSubscriptionData(); // Reload data
          return result.data;
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error(`Failed to ${action} subscription`);
      }
    } catch (error) {
      console.error(`Error ${action} subscription:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} subscription`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeApiCall, loadSubscriptionData]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (cancelAtPeriodEnd = true) => {
    return updateSubscription('cancel', undefined);
  }, [updateSubscription]);

  // Reactivate subscription
  const reactivateSubscription = useCallback(async () => {
    return updateSubscription('reactivate', undefined);
  }, [updateSubscription]);

  // Change plan
  const changePlan = useCallback(async (planId: string) => {
    return updateSubscription('change_plan', planId);
  }, [updateSubscription]);

  // Get subscription status
  const getSubscriptionStatus = useCallback(() => {
    if (!data.subscription) return 'none';

    const { status, trialEnd, cancelAtPeriodEnd } = data.subscription;

    if (cancelAtPeriodEnd) return 'cancelled';
    if (trialEnd && new Date(trialEnd) > new Date()) return 'trial';
    return status.toLowerCase();
  }, [data.subscription]);

  // Check if subscription is active
  const isSubscriptionActive = useCallback(() => {
    const status = getSubscriptionStatus();
    return ['active', 'trial'].includes(status);
  }, [getSubscriptionStatus]);

  // Check if trial is active
  const isTrialActive = useCallback(() => {
    return getSubscriptionStatus() === 'trial';
  }, [getSubscriptionStatus]);

  // Get days until renewal/trial end
  const getDaysUntilRenewal = useCallback(() => {
    if (!data.subscription) return null;

    const targetDate = isTrialActive()
      ? data.subscription.trialEnd
      : data.subscription.currentPeriodEnd;

    if (!targetDate) return null;

    const endDate = new Date(targetDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }, [data.subscription, isTrialActive]);

  // Get current plan details
  const getCurrentPlan = useCallback(() => {
    if (!data.subscription) return null;
    return data.availablePlans.find(plan => plan.id === data.subscription?.planType) || null;
  }, [data.subscription, data.availablePlans]);

  // Format amount for display
  const formatAmount = useCallback((amount: number, currency = 'gbp') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount / 100);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  return {
    // Data
    subscription: data.subscription,
    paymentMethods: data.paymentMethods,
    usageStats: data.usageStats,
    availablePlans: data.availablePlans,
    isEligibleForTrial: data.isEligibleForTrial,

    // State
    loading,
    error,

    // Actions
    loadSubscriptionData,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    changePlan,
    setError,

    // Helpers
    getSubscriptionStatus,
    isSubscriptionActive,
    isTrialActive,
    getDaysUntilRenewal,
    getCurrentPlan,
    formatAmount
  };
}
