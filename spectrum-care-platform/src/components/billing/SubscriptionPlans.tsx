'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Check,
  Star,
  Zap,
  Crown,
  Building,
  CreditCard,
  Clock,
  Shield,
  Users,
  BarChart3,
  FileText,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  stripePriceId?: string;
  formattedPrice: string;
  popular?: boolean;
  enterprise?: boolean;
}

interface SubscriptionPlansProps {
  plans: Plan[];
  currentPlan?: string;
  userRole: string;
  onPlanSelect: (planId: string) => void;
  loading?: boolean;
  trialDays?: number;
}

const PLAN_ICONS = {
  prof_basic: Star,
  prof_premium: Zap,
  prof_enterprise: Crown,
  la_authority: Building
};

const PLAN_COLORS = {
  prof_basic: 'border-blue-200 bg-blue-50',
  prof_premium: 'border-purple-200 bg-purple-50',
  prof_enterprise: 'border-orange-200 bg-orange-50',
  la_authority: 'border-green-200 bg-green-50'
};

export function SubscriptionPlans({
  plans,
  currentPlan,
  userRole,
  onPlanSelect,
  loading = false,
  trialDays = 14
}: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    onPlanSelect(planId);
  };

  const getPlanIcon = (planId: string) => {
    const IconComponent = PLAN_ICONS[planId as keyof typeof PLAN_ICONS] || Star;
    return <IconComponent className="h-6 w-6" />;
  };

  const getPlanColorClass = (planId: string) => {
    return PLAN_COLORS[planId as keyof typeof PLAN_COLORS] || 'border-gray-200 bg-gray-50';
  };

  // Filter plans by user role
  const availablePlans = plans.filter(plan => {
    if (userRole === 'PROFESSIONAL') {
      return plan.id.startsWith('prof_');
    }
    if (['LA_OFFICER', 'LA_MANAGER', 'LA_EXECUTIVE'].includes(userRole)) {
      return plan.id === 'la_authority';
    }
    return false;
  });

  if (availablePlans.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No subscription plans are available for your account type. Please contact support for assistance.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unlock the full potential of SpectrumCare with our comprehensive subscription plans.
          Start with a {trialDays}-day free trial.
        </p>
      </div>

      {/* Billing Toggle (if multiple intervals available) */}
      <div className="flex justify-center">
        <Tabs value={billingInterval} onValueChange={(value) => setBillingInterval(value as 'monthly' | 'yearly')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {availablePlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isSelected = selectedPlan === plan.id;
          const isPopular = plan.id === 'prof_premium';

          return (
            <Card
              key={plan.id}
              className={`
                relative cursor-pointer transition-all duration-200 hover:shadow-lg
                ${isSelected ? 'ring-2 ring-blue-500 scale-105' : ''}
                ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}
                ${isPopular ? getPlanColorClass(plan.id) : ''}
              `}
              onClick={() => !isCurrentPlan && handlePlanSelect(plan.id)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-600 text-white px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${getPlanColorClass(plan.id)}`}>
                    {getPlanIcon(plan.id)}
                  </div>
                </div>

                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>

                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">{plan.formattedPrice}</span>
                    <span className="text-gray-500 ml-1">/{plan.interval}</span>
                  </div>
                  {trialDays > 0 && !isCurrentPlan && (
                    <p className="text-sm text-green-600 mt-2">
                      {trialDays}-day free trial
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "outline" : isPopular ? "default" : "outline"}
                  disabled={isCurrentPlan || loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCurrentPlan) {
                      handlePlanSelect(plan.id);
                    }
                  }}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    `Start ${trialDays > 0 ? 'Free Trial' : 'Subscription'}`
                  )}
                </Button>

                {/* Additional Info */}
                {plan.enterprise && (
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      Custom pricing and features available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold text-center mb-8">Compare Features</h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-medium">Features</th>
                {availablePlans.map(plan => (
                  <th key={plan.id} className="text-center p-4 font-medium">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">Client Management</td>
                <td className="text-center p-4">Up to 50</td>
                <td className="text-center p-4">Unlimited</td>
                <td className="text-center p-4">Unlimited</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">Appointment Scheduling</td>
                <td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">Report Templates</td>
                <td className="text-center p-4">Standard</td>
                <td className="text-center p-4">Custom</td>
                <td className="text-center p-4">Custom + Branded</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">Support Level</td>
                <td className="text-center p-4">Email</td>
                <td className="text-center p-4">Priority</td>
                <td className="text-center p-4">Dedicated</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-medium">API Access</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                <td className="text-center p-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold mb-6">Why Choose SpectrumCare?</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center">
            <Shield className="h-8 w-8 text-blue-600 mb-3" />
            <h4 className="font-medium mb-2">Enterprise Security</h4>
            <p className="text-sm text-gray-600">GDPR compliant with end-to-end encryption</p>
          </div>

          <div className="flex flex-col items-center">
            <Phone className="h-8 w-8 text-green-600 mb-3" />
            <h4 className="font-medium mb-2">24/7 Support</h4>
            <p className="text-sm text-gray-600">Expert help when you need it most</p>
          </div>

          <div className="flex flex-col items-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mb-3" />
            <h4 className="font-medium mb-2">Advanced Analytics</h4>
            <p className="text-sm text-gray-600">Insights to improve outcomes</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <CreditCard className="h-4 w-4 inline mr-1" />
            Cancel anytime • No setup fees • {trialDays}-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
