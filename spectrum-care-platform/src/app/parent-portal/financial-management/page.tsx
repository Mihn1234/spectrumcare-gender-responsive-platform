'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  BarChart3,
  Plus,
  Download,
  Upload,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt,
  CreditCard,
  Wallet,
  Settings,
  Home,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Edit,
  Star,
  Award,
  Users,
  Building,
  Phone,
  Mail,
  Globe,
  Calculator,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface FinancialData {
  id: string;
  userId: string;
  childId: string;
  budgetType: string;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  budgetPeriod: string;
  expenditures: any[];
  outcomes: any[];
  providerPayments: any[];
  grantApplications: any[];
  calculatedMetrics?: any;
  createdAt: string;
  updatedAt: string;
}

interface FinancialAnalytics {
  spendingTrends: any;
  outcomeAnalysis: any;
  costEffectiveness: any;
  budgetForecasting: any;
  riskAssessment: any;
  recommendations: string[];
  comparativeBenchmarks: any;
}

export default function FinancialManagementPage() {
  const router = useRouter();
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState('demo-child-id');
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);
  const [showNewOutcomeForm, setShowNewOutcomeForm] = useState(false);
  const [showGrantApplicationForm, setShowGrantApplicationForm] = useState(false);

  const [newExpense, setNewExpense] = useState({
    provider: '',
    amount: 0,
    category: 'therapy' as const,
    outcome: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newOutcome, setNewOutcome] = useState({
    description: '',
    measurement: '',
    costPerOutcome: 0,
    qualityRating: 5,
    achievedDate: new Date().toISOString().split('T')[0]
  });

  const [newGrantApplication, setNewGrantApplication] = useState({
    grantName: '',
    amount: 0,
    purpose: '',
    applicationDate: new Date().toISOString().split('T')[0],
    expectedDecisionDate: ''
  });

  useEffect(() => {
    loadFinancialData();
  }, [selectedChild]);

  const loadFinancialData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `/api/parent-portal/financial-management?childId=${selectedChild}&analytics=true`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load financial management data');
      }

      const data = await response.json();
      setFinancialData(data.data);
      setAnalytics(data.data.analytics);

    } catch (error) {
      console.error('Error loading financial data:', error);
      setError('Failed to load financial management data');
    } finally {
      setIsLoading(false);
    }
  };

  const addExpenditure = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/financial-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'add_expenditure',
          childId: selectedChild,
          ...newExpense,
          date: new Date(newExpense.date).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add expenditure');
      }

      await loadFinancialData(); // Reload data
      setShowNewExpenseForm(false);

      // Reset form
      setNewExpense({
        provider: '',
        amount: 0,
        category: 'therapy',
        outcome: '',
        date: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Error adding expenditure:', error);
      setError('Failed to add expenditure');
    } finally {
      setIsLoading(false);
    }
  };

  const addOutcome = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/financial-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'add_outcome',
          childId: selectedChild,
          ...newOutcome,
          achievedDate: new Date(newOutcome.achievedDate).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add outcome');
      }

      await loadFinancialData(); // Reload data
      setShowNewOutcomeForm(false);

      // Reset form
      setNewOutcome({
        description: '',
        measurement: '',
        costPerOutcome: 0,
        qualityRating: 5,
        achievedDate: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Error adding outcome:', error);
      setError('Failed to add outcome');
    } finally {
      setIsLoading(false);
    }
  };

  const applyForGrant = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/financial-management', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'apply_grant',
          childId: selectedChild,
          ...newGrantApplication,
          applicationDate: new Date(newGrantApplication.applicationDate).toISOString(),
          expectedDecisionDate: newGrantApplication.expectedDecisionDate ?
            new Date(newGrantApplication.expectedDecisionDate).toISOString() : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit grant application');
      }

      await loadFinancialData(); // Reload data
      setShowGrantApplicationForm(false);

      // Reset form
      setNewGrantApplication({
        grantName: '',
        amount: 0,
        purpose: '',
        applicationDate: new Date().toISOString().split('T')[0],
        expectedDecisionDate: ''
      });

    } catch (error) {
      console.error('Error applying for grant:', error);
      setError('Failed to submit grant application');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBudgetRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Wallet className="h-6 w-6 text-green-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Financial Management</h1>
                  <p className="text-sm text-gray-500">Personal budget optimization & tracking</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowNewExpenseForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Budget Calculator
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!financialData ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Financial Management Setup</h3>
              <p className="text-gray-600 mb-6">Set up your personal budget tracking to optimize outcomes and monitor spending</p>
              <Button onClick={() => alert('Budget setup wizard - Coming soon!')}>
                <Plus className="h-4 w-4 mr-2" />
                Setup Budget Management
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Budget Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Budget</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(financialData.totalBudget)}
                      </p>
                      <p className="text-sm text-blue-600">{financialData.budgetPeriod}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Spent</p>
                      <p className="text-3xl font-bold text-red-600">
                        {formatCurrency(financialData.spentBudget)}
                      </p>
                      <p className={`text-sm ${getUtilizationColor(financialData.calculatedMetrics?.budgetUtilization || 0)}`}>
                        {financialData.calculatedMetrics?.budgetUtilization || 0}% utilized
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Remaining</p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(financialData.remainingBudget)}
                      </p>
                      <p className="text-sm text-green-600">Available to spend</p>
                    </div>
                    <Wallet className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Outcomes</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {financialData.outcomes.length}
                      </p>
                      <p className="text-sm text-purple-600">Achieved</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Utilization Progress */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Budget Utilization
                  </span>
                  <Badge className={getBudgetRiskColor(analytics?.budgetForecasting?.budgetRisk)}>
                    {analytics?.budgetForecasting?.budgetRisk || 'Low'} Risk
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Budget Progress</span>
                    <span className="text-sm">
                      {formatCurrency(financialData.spentBudget)} / {formatCurrency(financialData.totalBudget)}
                    </span>
                  </div>
                  <Progress
                    value={financialData.calculatedMetrics?.budgetUtilization || 0}
                    className="h-3"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(financialData.calculatedMetrics?.averageMonthlySpend || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Monthly Average</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(analytics?.budgetForecasting?.projectedUnderspend || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Projected Savings</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-lg font-bold text-purple-600">
                        {financialData.calculatedMetrics?.remainingMonths || 0}
                      </p>
                      <p className="text-sm text-gray-600">Months Remaining</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                <TabsTrigger value="grants">Grants</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Spending Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                        Spending by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {financialData.calculatedMetrics?.categoryBreakdown?.map((category: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'purple', 'orange', 'red'][index % 5]}-500`}></div>
                              <span className="text-sm capitalize">{category.category}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(category.amount)}</p>
                              <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Value for Money */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2 text-yellow-600" />
                        Value for Money Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-3xl font-bold text-green-600">
                            {analytics?.costEffectiveness?.score || 75}%
                          </p>
                          <p className="text-sm text-gray-600">Cost Effectiveness Score</p>
                          <p className="text-xs text-green-600 mt-1">
                            {analytics?.costEffectiveness?.rating || 'Good'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg font-bold text-blue-600">
                              {financialData.outcomes.length}
                            </p>
                            <p className="text-xs text-gray-600">Outcomes per £1k</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-lg font-bold text-purple-600">
                              {(financialData.outcomes.reduce((sum, o) => sum + (o.qualityRating || 3), 0) / Math.max(financialData.outcomes.length, 1)).toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-600">Avg Quality</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-600" />
                      Recent Financial Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {financialData.expenditures.slice(-5).map((expense, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Receipt className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{expense.provider}</p>
                              <p className="text-xs text-gray-500 capitalize">{expense.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(expense.amount)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                      AI-Powered Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(analytics?.recommendations || []).slice(0, 4).map((recommendation: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-orange-600 mt-1" />
                          <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
                          <Button size="sm" variant="outline">
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Expenses Tab */}
              <TabsContent value="expenses" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Expense Management</h2>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button onClick={() => setShowNewExpenseForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>All Expenses</CardTitle>
                    <CardDescription>
                      Track and manage all your autism support expenses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {financialData.expenditures.map((expense, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              expense.category === 'therapy' ? 'bg-blue-100' :
                              expense.category === 'equipment' ? 'bg-green-100' :
                              expense.category === 'assessment' ? 'bg-purple-100' :
                              expense.category === 'transport' ? 'bg-orange-100' :
                              'bg-gray-100'
                            }`}>
                              {expense.category === 'therapy' ? <Users className="h-6 w-6 text-blue-600" /> :
                               expense.category === 'equipment' ? <Settings className="h-6 w-6 text-green-600" /> :
                               expense.category === 'assessment' ? <FileText className="h-6 w-6 text-purple-600" /> :
                               expense.category === 'transport' ? <Calendar className="h-6 w-6 text-orange-600" /> :
                               <Receipt className="h-6 w-6 text-gray-600" />}
                            </div>
                            <div>
                              <h4 className="font-medium">{expense.provider}</h4>
                              <p className="text-sm text-gray-600 capitalize">{expense.category}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
                            {expense.outcome && (
                              <p className="text-sm text-green-600">✓ Outcome achieved</p>
                            )}
                            <div className="flex space-x-1 mt-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Outcomes Tab */}
              <TabsContent value="outcomes" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Outcome Tracking</h2>
                  <Button onClick={() => setShowNewOutcomeForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Outcome
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <p className="text-2xl font-bold">{financialData.outcomes.length}</p>
                      <p className="text-sm text-gray-600">Total Outcomes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">
                        {(financialData.outcomes.reduce((sum, o) => sum + (o.qualityRating || 3), 0) / Math.max(financialData.outcomes.length, 1)).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Avg Quality Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">
                        {formatCurrency(financialData.outcomes.reduce((sum, o) => sum + o.costPerOutcome, 0) / Math.max(financialData.outcomes.length, 1))}
                      </p>
                      <p className="text-sm text-gray-600">Avg Cost per Outcome</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Achieved Outcomes</CardTitle>
                    <CardDescription>
                      Track progress and measure success of interventions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {financialData.outcomes.map((outcome, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{outcome.description}</h4>
                              <p className="text-sm text-gray-600 mb-2">{outcome.measurement}</p>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < (outcome.qualityRating || 3) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  Quality: {outcome.qualityRating || 3}/5
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{formatCurrency(outcome.costPerOutcome)}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(outcome.achievedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Grants Tab */}
              <TabsContent value="grants" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Grant Applications</h2>
                  <Button onClick={() => setShowGrantApplicationForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Apply for Grant
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold">{financialData.grantApplications.length}</p>
                      <p className="text-sm text-gray-600">Applications Submitted</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold">
                        {financialData.grantApplications.filter(g => g.status === 'approved').length}
                      </p>
                      <p className="text-sm text-gray-600">Approved</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold">
                        {formatCurrency(financialData.grantApplications.reduce((sum, g) => sum + g.amount, 0))}
                      </p>
                      <p className="text-sm text-gray-600">Total Applied For</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Grant Application Status</CardTitle>
                    <CardDescription>
                      Track your applications for additional funding
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {financialData.grantApplications.length > 0 ? (
                      <div className="space-y-4">
                        {financialData.grantApplications.map((grant, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{grant.grantName}</h4>
                                <p className="text-sm text-gray-600">{grant.purpose}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Applied: {new Date(grant.applicationDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{formatCurrency(grant.amount)}</p>
                                <Badge className={
                                  grant.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  grant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {grant.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600 mb-4">No grant applications yet</p>
                        <Button onClick={() => setShowGrantApplicationForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Apply for First Grant
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        Spending Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Monthly Trend</span>
                          <div className="flex items-center space-x-1">
                            {analytics?.spendingTrends?.trend === 'increasing' ?
                              <TrendingUp className="h-4 w-4 text-red-600" /> :
                              analytics?.spendingTrends?.trend === 'decreasing' ?
                              <TrendingDown className="h-4 w-4 text-green-600" /> :
                              <ArrowUpRight className="h-4 w-4 text-gray-600" />
                            }
                            <span className={`text-sm ${
                              analytics?.spendingTrends?.trend === 'increasing' ? 'text-red-600' :
                              analytics?.spendingTrends?.trend === 'decreasing' ? 'text-green-600' :
                              'text-gray-600'
                            }`}>
                              {analytics?.spendingTrends?.trend || 'stable'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Projected Next Month</span>
                          <span className="font-medium">
                            {formatCurrency(analytics?.spendingTrends?.projectedNextMonth || 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-purple-600" />
                        Budget Forecast
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Projected Total Spend</span>
                          <span className="font-medium">
                            {formatCurrency(analytics?.budgetForecasting?.projectedTotalSpend || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Budget Risk Level</span>
                          <Badge className={getBudgetRiskColor(analytics?.budgetForecasting?.budgetRisk)}>
                            {analytics?.budgetForecasting?.budgetRisk || 'Low'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Recommended Monthly Spend</span>
                          <span className="font-medium">
                            {formatCurrency(analytics?.budgetForecasting?.recommendedMonthlySpend || 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Comparative Benchmarks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                      Comparative Benchmarks
                    </CardTitle>
                    <CardDescription>
                      How your spending compares to similar families
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Budget Size</p>
                        <p className="text-lg font-bold">
                          {analytics?.comparativeBenchmarks?.benchmarkComparison?.budgetSize || 'Average'}
                        </p>
                        <p className="text-xs text-gray-500">vs. £{analytics?.comparativeBenchmarks?.averageBudgetSize || 15000} avg</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Utilization Rate</p>
                        <p className="text-lg font-bold">
                          {analytics?.comparativeBenchmarks?.benchmarkComparison?.utilization || 'Average'}
                        </p>
                        <p className="text-xs text-gray-500">vs. {analytics?.comparativeBenchmarks?.averageUtilization || 78}% avg</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Outcome Efficiency</p>
                        <p className="text-lg font-bold">
                          {analytics?.comparativeBenchmarks?.benchmarkComparison?.efficiency || 'Average'}
                        </p>
                        <p className="text-xs text-gray-500">vs. {analytics?.comparativeBenchmarks?.averageOutcomesPerPound || 0.12} avg</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="font-medium mb-2">Budget Summary Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Complete overview of spending and budget utilization</p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Award className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                      <h3 className="font-medium mb-2">Outcome Analysis</h3>
                      <p className="text-sm text-gray-600 mb-4">Detailed analysis of achieved outcomes and ROI</p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Building className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-medium mb-2">Grant Status Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Status of all grant applications and funding</p>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Modal Forms */}

        {/* New Expense Form */}
        {showNewExpenseForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
                <CardDescription>Record a new autism support expense</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Provider/Service</label>
                  <Input
                    value={newExpense.provider}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g., Speech Therapy Clinic"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Amount (£)</label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newExpense.category} onValueChange={(value: any) => setNewExpense(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="therapy">Therapy</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="respite">Respite</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Outcome</label>
                  <Textarea
                    value={newExpense.outcome}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, outcome: e.target.value }))}
                    placeholder="What outcome do you expect from this expense?"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowNewExpenseForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addExpenditure}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Outcome Form */}
        {showNewOutcomeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Record New Outcome</CardTitle>
                <CardDescription>Document an achieved outcome from your investments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Outcome Description</label>
                  <Input
                    value={newOutcome.description}
                    onChange={(e) => setNewOutcome(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Improved verbal communication"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Measurement</label>
                  <Textarea
                    value={newOutcome.measurement}
                    onChange={(e) => setNewOutcome(prev => ({ ...prev, measurement: e.target.value }))}
                    placeholder="How was this outcome measured? Include specific metrics."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cost of Achievement (£)</label>
                  <Input
                    type="number"
                    value={newOutcome.costPerOutcome}
                    onChange={(e) => setNewOutcome(prev => ({ ...prev, costPerOutcome: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Quality Rating (1-5 stars)</label>
                  <Select value={newOutcome.qualityRating.toString()} onValueChange={(value) => setNewOutcome(prev => ({ ...prev, qualityRating: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star - Minimal impact</SelectItem>
                      <SelectItem value="2">2 Stars - Some improvement</SelectItem>
                      <SelectItem value="3">3 Stars - Moderate improvement</SelectItem>
                      <SelectItem value="4">4 Stars - Significant improvement</SelectItem>
                      <SelectItem value="5">5 Stars - Exceptional improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date Achieved</label>
                  <Input
                    type="date"
                    value={newOutcome.achievedDate}
                    onChange={(e) => setNewOutcome(prev => ({ ...prev, achievedDate: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowNewOutcomeForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addOutcome}>
                    <Award className="h-4 w-4 mr-2" />
                    Record Outcome
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grant Application Form */}
        {showGrantApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Apply for Grant</CardTitle>
                <CardDescription>Submit a new grant application for additional funding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Grant Name</label>
                  <Input
                    value={newGrantApplication.grantName}
                    onChange={(e) => setNewGrantApplication(prev => ({ ...prev, grantName: e.target.value }))}
                    placeholder="e.g., Family Fund Grant"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Amount Requested (£)</label>
                  <Input
                    type="number"
                    value={newGrantApplication.amount}
                    onChange={(e) => setNewGrantApplication(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Purpose</label>
                  <Textarea
                    value={newGrantApplication.purpose}
                    onChange={(e) => setNewGrantApplication(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="What will this grant funding be used for?"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Application Date</label>
                  <Input
                    type="date"
                    value={newGrantApplication.applicationDate}
                    onChange={(e) => setNewGrantApplication(prev => ({ ...prev, applicationDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Expected Decision Date (Optional)</label>
                  <Input
                    type="date"
                    value={newGrantApplication.expectedDecisionDate}
                    onChange={(e) => setNewGrantApplication(prev => ({ ...prev, expectedDecisionDate: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowGrantApplicationForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={applyForGrant}>
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
