'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  FileText,
  Bell,
  Settings
} from 'lucide-react';
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
  formattedPrice: string;
  features: string[];
}

export function BillingDashboard() {
  const { makeApiCall } = useApiCall();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeApiCall('/api/payments/subscriptions');

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSubscription(result.data.subscription);
          setPaymentMethods(result.data.paymentMethods || []);
          setUsageStats(result.data.usageStats);
          setAvailablePlans(result.data.availablePlans || []);
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to load billing data');
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (action: string, planId?: string) => {
    try {
      setActionLoading(action);
      setError(null);

      const response = await makeApiCall('/api/payments/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, planId })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadBillingData(); // Reload data
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error(`Failed to ${action} subscription`);
      }
    } catch (error) {
      console.error(`Error ${action} subscription:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} subscription`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-red-100 text-red-800">Past Due</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (brand: string) => {
    // In a real app, you'd use actual card brand icons
    return <CreditCard className="h-5 w-5" />;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100);
  };

  const getDaysUntilRenewal = () => {
    if (!subscription?.currentPeriodEnd) return null;
    const endDate = new Date(subscription.currentPeriodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isTrialActive = () => {
    if (!subscription?.trialEnd) return false;
    return new Date(subscription.trialEnd) > new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and payment methods</p>
        </div>
        <Button variant="outline" onClick={loadBillingData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Subscription Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Plan</p>
                    <p className="text-2xl font-bold">
                      {subscription ? availablePlans.find(p => p.id === subscription.planType)?.name || subscription.planType : 'No Plan'}
                    </p>
                    {subscription && getStatusBadge(subscription.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
                    <p className="text-2xl font-bold">
                      {subscription ? formatAmount(subscription.monthlyPrice) : '£0'}
                    </p>
                    {isTrialActive() && (
                      <p className="text-sm text-blue-600">Currently in trial</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Billing</p>
                    <p className="text-2xl font-bold">
                      {getDaysUntilRenewal() ? `${getDaysUntilRenewal()} days` : 'N/A'}
                    </p>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-sm text-gray-500">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Statistics */}
          {usageStats && (
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>Your spending and usage overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{formatAmount(usageStats.totalSpent)}</p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatAmount(usageStats.currentPeriodSpent)}</p>
                    <p className="text-sm text-gray-600">This Period</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{usageStats.invoiceCount}</p>
                    <p className="text-sm text-gray-600">Total Invoices</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{usageStats.subscriptionCount}</p>
                    <p className="text-sm text-gray-600">Active Subscriptions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trial Status */}
          {isTrialActive() && subscription?.trialEnd && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your trial expires on {new Date(subscription.trialEnd).toLocaleDateString()}.
                Add a payment method to continue uninterrupted service.
              </AlertDescription>
            </Alert>
          )}

          {/* Cancellation Notice */}
          {subscription?.cancelAtPeriodEnd && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will be cancelled on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                <Button
                  variant="link"
                  className="p-0 ml-2"
                  onClick={() => handleSubscriptionAction('reactivate')}
                  disabled={actionLoading === 'reactivate'}
                >
                  Reactivate subscription
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          {/* Current Subscription Details */}
          {subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Manage your current subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Plan Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plan:</span>
                        <span className="font-medium">
                          {availablePlans.find(p => p.id === subscription.planType)?.name || subscription.planType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Price:</span>
                        <span className="font-medium">{formatAmount(subscription.monthlyPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Billing Cycle</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Current Period:</span>
                        <span>
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} -
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                      {subscription.trialEnd && (
                        <div className="flex justify-between">
                          <span>Trial Ends:</span>
                          <span>{new Date(subscription.trialEnd).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subscription Actions */}
                <div className="flex flex-wrap gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleSubscriptionAction('cancel')}
                    disabled={actionLoading === 'cancel' || subscription.cancelAtPeriodEnd}
                  >
                    {actionLoading === 'cancel' ? 'Processing...' : 'Cancel Subscription'}
                  </Button>

                  {subscription.cancelAtPeriodEnd && (
                    <Button
                      variant="default"
                      onClick={() => handleSubscriptionAction('reactivate')}
                      disabled={actionLoading === 'reactivate'}
                    >
                      {actionLoading === 'reactivate' ? 'Processing...' : 'Reactivate'}
                    </Button>
                  )}

                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                <p className="text-gray-600 mb-6">
                  Choose a subscription plan to access premium features
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Available Plans */}
          {availablePlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>Upgrade or change your subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePlans.map(plan => (
                    <div
                      key={plan.id}
                      className={`
                        p-4 border rounded-lg cursor-pointer transition-colors
                        ${subscription?.planType === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-2xl font-bold mt-2">{plan.formattedPrice}</p>
                      <ul className="mt-3 space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600">• {feature}</li>
                        ))}
                      </ul>
                      {subscription?.planType !== plan.id && (
                        <Button
                          className="w-full mt-4"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubscriptionAction('change_plan', plan.id)}
                          disabled={actionLoading === 'change_plan'}
                        >
                          {actionLoading === 'change_plan' ? 'Processing...' : 'Switch to This Plan'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods and billing information</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getPaymentMethodIcon(method.card?.brand || '')}
                        <div>
                          <p className="font-medium">
                            {method.card?.brand.toUpperCase()} ending in {method.card?.last4}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expires {method.card?.expMonth}/{method.card?.expYear}
                          </p>
                        </div>
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No payment methods added</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View your past invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Billing history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
