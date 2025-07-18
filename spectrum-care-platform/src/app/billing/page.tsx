'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Crown,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionPlans } from '@/components/billing/SubscriptionPlans';
import { BillingDashboard } from '@/components/billing/BillingDashboard';

export default function BillingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const {
    subscription,
    availablePlans,
    isEligibleForTrial,
    loading,
    error,
    createSubscription,
    isSubscriptionActive,
    setError
  } = useSubscription();

  const [view, setView] = useState<'dashboard' | 'plans'>('dashboard');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handlePlanSelect = async (planId: string) => {
    try {
      setProcessingPlan(planId);
      setError(null);

      // For now, create subscription without payment method (trial)
      await createSubscription(planId, undefined, isEligibleForTrial ? 14 : 0);

      // Switch to dashboard view to show the new subscription
      setView('dashboard');

    } catch (error) {
      console.error('Error creating subscription:', error);
      // Error is already set by the hook
    } finally {
      setProcessingPlan(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // useRequireAuth will handle redirect
  }

  // Show plans if user has no subscription
  const shouldShowPlans = !subscription && view === 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="text-sm text-gray-600">
                  Manage your SpectrumCare subscription and payment methods
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {subscription && (
                <Badge
                  className={
                    isSubscriptionActive()
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {isSubscriptionActive() ? 'Active' : subscription.status}
                </Badge>
              )}
              {!subscription && (
                <Button
                  onClick={() => setView('plans')}
                  disabled={view === 'plans'}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Choose Plan
                </Button>
              )}
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

        {/* Content */}
        {shouldShowPlans || view === 'plans' ? (
          // Show subscription plans
          <div className="space-y-8">
            {subscription && (
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Upgrade Your Plan</h2>
                  <p className="text-gray-600">Choose a plan that fits your needs</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setView('dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            )}

            <SubscriptionPlans
              plans={availablePlans}
              currentPlan={subscription?.planType}
              userRole={user.role}
              onPlanSelect={handlePlanSelect}
              loading={!!processingPlan}
              trialDays={isEligibleForTrial ? 14 : 0}
            />

            {/* Success Message for Plan Selection */}
            {processingPlan && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Creating your subscription... This may take a moment.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          // Show billing dashboard
          <div className="space-y-8">
            {!subscription ? (
              // No subscription state
              <Card className="text-center py-12">
                <CardContent>
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-4">Get Started with SpectrumCare</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Choose a subscription plan to unlock the full power of our comprehensive
                    autism support platform.
                  </p>

                  <div className="space-y-4">
                    <Button
                      size="lg"
                      onClick={() => setView('plans')}
                      className="mr-4"
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      View Plans & Pricing
                    </Button>

                    {isEligibleForTrial && (
                      <div className="text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        14-day free trial available
                      </div>
                    )}
                  </div>

                  {/* Feature Highlights */}
                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-medium mb-2">Flexible Billing</h3>
                      <p className="text-sm text-gray-600">Monthly or yearly billing with easy plan changes</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-medium mb-2">Cancel Anytime</h3>
                      <p className="text-sm text-gray-600">No long-term contracts, cancel whenever you need</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Crown className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-medium mb-2">Premium Support</h3>
                      <p className="text-sm text-gray-600">Priority support from autism care experts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Show billing dashboard
              <BillingDashboard />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
