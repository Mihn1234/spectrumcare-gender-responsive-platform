"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Receipt,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Plus,
  Eye,
  Edit,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Building,
  Star,
  Crown,
  Zap,
  Shield,
  BarChart3,
  FileText,
  Mail,
  Settings,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart
} from "lucide-react"

export default function BillingPage() {
  const billingStats = {
    monthlyRevenue: 47250,
    revenueGrowth: 12.5,
    activeSubscriptions: 186,
    pendingInvoices: 8,
    averageRevenuePerUser: 254,
    collectionRate: 94.2
  }

  const subscriptionTiers = [
    {
      name: "Guest",
      price: 0,
      period: "Forever",
      users: 45,
      features: ["Basic access", "Read-only assessments", "Email support"],
      color: "slate",
      growth: "+5"
    },
    {
      name: "Hybrid",
      price: 150,
      period: "month",
      users: 78,
      features: ["Advanced assessments", "Team collaboration", "Practice tools"],
      color: "blue",
      growth: "+12"
    },
    {
      name: "Premium",
      price: 350,
      period: "month",
      users: 52,
      features: ["White-label portal", "AI features", "Custom domain"],
      color: "purple",
      growth: "+8"
    },
    {
      name: "Enterprise",
      price: 2500,
      period: "month",
      users: 11,
      features: ["Multi-site management", "API access", "Dedicated support"],
      color: "emerald",
      growth: "+3"
    }
  ]

  const recentInvoices = [
    {
      id: "INV-2024-001",
      client: "Dr. Sarah Martinez",
      plan: "Premium",
      amount: 350,
      status: "paid",
      date: "2024-01-15",
      dueDate: "2024-01-30"
    },
    {
      id: "INV-2024-002",
      client: "Manchester Autism Center",
      plan: "Enterprise",
      amount: 2500,
      status: "pending",
      date: "2024-01-18",
      dueDate: "2024-02-02"
    },
    {
      id: "INV-2024-003",
      client: "Lisa Rodriguez Practice",
      plan: "Hybrid",
      amount: 150,
      status: "overdue",
      date: "2024-01-20",
      dueDate: "2024-02-05"
    },
    {
      id: "INV-2024-004",
      client: "Birmingham Therapy Group",
      plan: "Premium",
      amount: 350,
      status: "draft",
      date: "2024-01-22",
      dueDate: "2024-02-07"
    }
  ]

  const paymentMethods = [
    {
      id: 1,
      type: "credit_card",
      last4: "4242",
      brand: "Visa",
      expires: "12/25",
      isDefault: true
    },
    {
      id: 2,
      type: "bank_account",
      last4: "8901",
      bank: "HSBC",
      type_detail: "Checking",
      isDefault: false
    }
  ]

  const revenueData = [
    { month: "Aug", amount: 32450, subscriptions: 142 },
    { month: "Sep", amount: 35200, subscriptions: 156 },
    { month: "Oct", amount: 38900, subscriptions: 168 },
    { month: "Nov", amount: 42100, subscriptions: 175 },
    { month: "Dec", amount: 47250, subscriptions: 186 }
  ]

  const upcomingRenewals = [
    {
      client: "Dr. Emily Parker",
      plan: "Premium",
      amount: 350,
      renewDate: "2024-02-01",
      autoRenew: true
    },
    {
      client: "Spectrum Care Leeds",
      plan: "Enterprise",
      amount: 2500,
      renewDate: "2024-02-03",
      autoRenew: false
    },
    {
      client: "Mike Chen Practice",
      plan: "Hybrid",
      amount: 150,
      renewDate: "2024-02-05",
      autoRenew: true
    }
  ]

  const dunningCampaigns = [
    {
      name: "7-Day Reminder",
      triggerDays: 7,
      emailTemplate: "friendly_reminder",
      status: "active",
      successRate: 23
    },
    {
      name: "Final Notice",
      triggerDays: 30,
      emailTemplate: "final_notice",
      status: "active",
      successRate: 45
    },
    {
      name: "Account Suspension",
      triggerDays: 45,
      emailTemplate: "suspension_notice",
      status: "active",
      successRate: 67
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-green-600">Billing & Subscriptions</h1>
                <p className="text-sm text-slate-600">Financial management and subscription billing platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {billingStats.collectionRate}% Collection Rate
              </Badge>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Revenue</p>
                  <p className="text-xl font-bold text-green-600">£{billingStats.monthlyRevenue.toLocaleString()}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{billingStats.revenueGrowth}%
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Subscriptions</p>
                  <p className="text-xl font-bold text-blue-600">{billingStats.activeSubscriptions}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">ARPU</p>
                  <p className="text-xl font-bold text-purple-600">£{billingStats.averageRevenuePerUser}</p>
                  <p className="text-xs text-slate-500">Per user</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-xl font-bold text-orange-600">{billingStats.pendingInvoices}</p>
                  <p className="text-xs text-slate-500">Invoices</p>
                </div>
                <Receipt className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Collection</p>
                  <p className="text-xl font-bold text-cyan-600">{billingStats.collectionRate}%</p>
                  <p className="text-xs text-slate-500">Rate</p>
                </div>
                <CheckCircle className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Growth</p>
                  <p className="text-xl font-bold text-pink-600">+{billingStats.revenueGrowth}%</p>
                  <p className="text-xs text-slate-500">Monthly</p>
                </div>
                <TrendingUp className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="dunning">Dunning</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Growth</CardTitle>
                    <CardDescription>Monthly recurring revenue and subscription growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueData.map((month, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 text-center">
                              <p className="font-medium">{month.month}</p>
                            </div>
                            <div>
                              <p className="font-bold text-green-600">£{month.amount.toLocaleString()}</p>
                              <p className="text-sm text-slate-600">{month.subscriptions} subscriptions</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={(month.amount / 50000) * 100} className="w-24 h-2" />
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Invoices */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Invoices
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Invoice
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentInvoices.map((invoice, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                          <div>
                            <h4 className="font-medium">{invoice.id}</h4>
                            <p className="text-sm text-slate-600">{invoice.client} • {invoice.plan}</p>
                            <p className="text-xs text-slate-500">Due: {invoice.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">£{invoice.amount}</p>
                            <Badge className={
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                  </CardContent>
                </Card>

                {/* Upcoming Renewals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Renewals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingRenewals.map((renewal, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{renewal.client}</h4>
                            <Badge className={renewal.autoRenew ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {renewal.autoRenew ? 'Auto' : 'Manual'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{renewal.plan} • £{renewal.amount}</p>
                          <p className="text-xs text-slate-500">{renewal.renewDate}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Health */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-medium text-green-600">94.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Failed Payments</span>
                        <span className="font-medium text-red-600">3.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Declined Cards</span>
                        <span className="font-medium text-orange-600">2.7%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Tiers Overview</CardTitle>
                <CardDescription>Manage pricing plans and subscription tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {subscriptionTiers.map((tier, idx) => (
                    <Card key={idx} className={`border-l-4 border-l-${tier.color}-500`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg">{tier.name}</h3>
                          {tier.name === 'Enterprise' && (
                            <Crown className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>

                        <div className="mb-4">
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold">£{tier.price}</span>
                            {tier.price > 0 && (
                              <span className="text-slate-600 ml-1">/{tier.period}</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {tier.features.map((feature, featureIdx) => (
                            <div key={featureIdx} className="flex items-center text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{tier.users}</p>
                            <p className="text-sm text-slate-600">Active users</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-green-600">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              <span className="text-sm">{tier.growth}</span>
                            </div>
                            <p className="text-xs text-slate-500">This month</p>
                          </div>
                        </div>

                        <Button className="w-full mt-4" variant="outline">
                          <Settings className="h-3 w-3 mr-2" />
                          Manage Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Invoice Management
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search invoices..." className="w-64" />
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInvoices.map((invoice, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold">{invoice.id}</h4>
                          <p className="text-sm text-slate-600">{invoice.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">£{invoice.amount}</p>
                          <Badge className={
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-slate-600">Plan</p>
                          <p className="font-medium">{invoice.plan}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Issue Date</p>
                          <p className="font-medium">{invoice.date}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Due Date</p>
                          <p className="font-medium">{invoice.dueDate}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                        {invoice.status !== 'paid' && (
                          <Button size="sm">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Collect Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage customer payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {method.type === 'credit_card' ? method.brand : method.bank} •••• {method.last4}
                              </p>
                              <p className="text-sm text-slate-600">
                                {method.type === 'credit_card' ? `Expires ${method.expires}` : method.type_detail}
                              </p>
                            </div>
                          </div>
                          {method.isDefault && (
                            <Badge className="bg-green-100 text-green-800">Default</Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          {!method.isDefault && (
                            <Button size="sm" variant="outline">
                              Set Default
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Processing</CardTitle>
                  <CardDescription>Process manual payments and refunds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Customer</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-martinez">Dr. Sarah Martinez</SelectItem>
                        <SelectItem value="manchester-center">Manchester Autism Center</SelectItem>
                        <SelectItem value="lisa-practice">Lisa Rodriguez Practice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <Input placeholder="£0.00" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Payment Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subscription">Subscription Payment</SelectItem>
                        <SelectItem value="one-time">One-time Payment</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refund
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed financial performance insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Revenue Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Monthly Recurring</span>
                        <span className="font-medium">£42,850</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">One-time Payments</span>
                        <span className="font-medium">£4,400</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Setup Fees</span>
                        <span className="font-medium">£850</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Customer Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Customer LTV</span>
                        <span className="font-medium">£3,240</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Churn Rate</span>
                        <span className="font-medium">2.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Upgrade Rate</span>
                        <span className="font-medium">8.4%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Collection Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">First Attempt</span>
                        <span className="font-medium">89.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Retry Success</span>
                        <span className="font-medium">5.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Dunning Recovery</span>
                        <span className="font-medium">3.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dunning Tab */}
          <TabsContent value="dunning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dunning Management</CardTitle>
                <CardDescription>Automated payment recovery and retry logic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dunningCampaigns.map((campaign, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-slate-600">Triggered {campaign.triggerDays} days after failed payment</p>
                        </div>
                        <Badge className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                          {campaign.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-slate-600">Email Template</p>
                          <p className="font-medium">{campaign.emailTemplate}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Success Rate</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={campaign.successRate} className="flex-1 h-2" />
                            <span className="font-medium">{campaign.successRate}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-600">Action</p>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Currency</label>
                    <Select defaultValue="gbp">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Billing Cycle</label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Payment Terms</label>
                    <Select defaultValue="net30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due-on-receipt">Due on Receipt</SelectItem>
                        <SelectItem value="net15">Net 15</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">VAT Rate</label>
                    <Input defaultValue="20%" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tax ID</label>
                    <Input defaultValue="GB123456789" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tax Reporting</label>
                    <Select defaultValue="uk-vat">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk-vat">UK VAT</SelectItem>
                        <SelectItem value="eu-vat">EU VAT</SelectItem>
                        <SelectItem value="us-sales-tax">US Sales Tax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
