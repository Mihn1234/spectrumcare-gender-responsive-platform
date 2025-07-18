'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Award,
  TrendingUp,
  Calendar,
  Pounds,
  CheckCircle2,
  Star,
  Clock,
  Shield,
  Brain,
  Activity,
  Volume2,
  MessageCircle,
  Zap,
  Eye,
  Palette,
  Heart,
  GraduationCap,
  FileText,
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  Target,
  CreditCard,
  ArrowRight,
  Sparkles,
  Crown,
  TrendingDown
} from 'lucide-react';

interface SpecialistApplication {
  // Personal Information
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Professional Information
  primaryCategory: string;
  secondaryCategories: string[];
  professionalRegistration: string;
  regulatoryBody: string;
  yearsExperience: number;
  qualifications: string[];

  // Practice Information
  practiceType: string;
  practiceLocation: string;
  serviceRadius: number;

  // Service Delivery
  inPersonSessions: boolean;
  onlineSessions: boolean;
  homeVisits: boolean;
  groupSessions: boolean;

  // Pricing
  hourlyRate: number;
  assessmentRate: number;

  // Availability
  hoursPerWeek: number;
  acceptingNewClients: boolean;

  // Platform Interest
  monthlyIncomeGoal: number;
  platformExperience: string;
  referralSource: string;

  // Documents (would be file uploads in real implementation)
  qualificationCertificates: string[];
  insuranceCertificate: string;
  dbsCheck: string;

  // Agreement
  termsAccepted: boolean;
  commissionAccepted: boolean;
}

const INITIAL_APPLICATION: SpecialistApplication = {
  title: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  primaryCategory: '',
  secondaryCategories: [],
  professionalRegistration: '',
  regulatoryBody: '',
  yearsExperience: 0,
  qualifications: [],
  practiceType: '',
  practiceLocation: '',
  serviceRadius: 25,
  inPersonSessions: true,
  onlineSessions: false,
  homeVisits: false,
  groupSessions: false,
  hourlyRate: 0,
  assessmentRate: 0,
  hoursPerWeek: 20,
  acceptingNewClients: true,
  monthlyIncomeGoal: 2400,
  platformExperience: '',
  referralSource: '',
  qualificationCertificates: [],
  insuranceCertificate: '',
  dbsCheck: '',
  termsAccepted: false,
  commissionAccepted: false
};

const SPECIALIST_CATEGORIES = [
  { id: 'OT', name: 'Occupational Therapy', icon: Activity, demand: 'Very High', avgRate: '£75-95' },
  { id: 'EP', name: 'Educational Psychology', icon: Brain, demand: 'High', avgRate: '£85-110' },
  { id: 'AIT', name: 'Auditory Integration Training', icon: Volume2, demand: 'Growing', avgRate: '£60-80' },
  { id: 'ABA', name: 'Applied Behavior Analysis', icon: Users, demand: 'Very High', avgRate: '£65-85' },
  { id: 'SALT', name: 'Speech & Language Therapy', icon: MessageCircle, demand: 'High', avgRate: '£70-90' },
  { id: 'PHYSIO', name: 'Physiotherapy', icon: Zap, demand: 'Medium', avgRate: '£60-80' },
  { id: 'CREATIVE', name: 'Art & Music Therapy', icon: Palette, demand: 'Growing', avgRate: '£55-75' },
  { id: 'NUTRITION', name: 'Nutritional Therapy', icon: Heart, demand: 'High', avgRate: '£50-70' }
];

const PLATFORM_BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Guaranteed Income Growth',
    description: 'Average 40% income increase within 6 months',
    value: '+40% income'
  },
  {
    icon: Users,
    title: 'Pre-Qualified Clients',
    description: 'Access families already committed to SEND support',
    value: '500+ families'
  },
  {
    icon: Shield,
    title: 'Complete Business Support',
    description: 'Insurance, payments, scheduling all handled',
    value: '100% managed'
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Work when you want, how you want',
    value: 'Your schedule'
  },
  {
    icon: CreditCard,
    title: 'Instant Payments',
    description: 'Weekly payouts with no payment delays',
    value: 'Weekly pay'
  },
  {
    icon: Star,
    title: 'Professional Growth',
    description: 'Continuous training and certification support',
    value: 'Free CPD'
  }
];

const SUCCESS_STORIES = [
  {
    name: 'Dr. Emma Thompson',
    category: 'Occupational Therapy',
    location: 'Birmingham',
    monthlyEarnings: 4800,
    sessionsPerWeek: 18,
    rating: 4.9,
    testimonial: 'Joining SpectrumCare doubled my income and connected me with families who truly value my expertise.'
  },
  {
    name: 'Sarah Mitchell',
    category: 'Applied Behavior Analysis',
    location: 'Manchester',
    monthlyEarnings: 3600,
    sessionsPerWeek: 15,
    rating: 4.8,
    testimonial: 'The platform handles everything - payments, scheduling, admin. I can focus purely on helping children.'
  },
  {
    name: 'Dr. James Wilson',
    category: 'Educational Psychology',
    location: 'London',
    monthlyEarnings: 5200,
    sessionsPerWeek: 12,
    rating: 4.7,
    testimonial: 'The AI-powered matching system connects me with families whose children truly benefit from my approach.'
  }
];

export default function JoinSpecialistsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [application, setApplication] = useState<SpecialistApplication>(INITIAL_APPLICATION);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalSteps = 5;

  const updateApplication = (updates: Partial<SpecialistApplication>) => {
    setApplication(prev => ({ ...prev, ...updates }));
  };

  const calculatePotentialEarnings = () => {
    const sessionsPerWeek = application.hoursPerWeek;
    const rate = application.hourlyRate;
    const platformFee = 0.15; // 15% commission

    const grossWeekly = sessionsPerWeek * rate;
    const netWeekly = grossWeekly * (1 - platformFee);
    const netMonthly = netWeekly * 4.33; // Average weeks per month

    return {
      grossMonthly: grossWeekly * 4.33,
      netMonthly,
      platformFee: grossWeekly * platformFee * 4.33
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/specialists/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Application submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>

              <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for applying to join our specialist network. We'll review your application and get back to you within 24 hours.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold mb-3">Your Application Journey</h3>
                <div className="space-y-3 text-sm text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                    <span>Application Review (24 hours)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                    <span>Video Interview & Demo (30 minutes)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</div>
                    <span>Document Verification (2-3 days)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</div>
                    <span>Platform Onboarding & Training</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">5</div>
                    <span>Go Live & Start Earning!</span>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Application ID: SPEC-{Date.now().toString().slice(-6)}. You'll receive a confirmation email shortly.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Join the UK's Leading SEND Specialist Network
          </h1>
          <p className="text-xl mb-6 opacity-90">
            Connect with committed families, grow your practice, and make a real impact in the SEND community
          </p>
          <div className="flex items-center justify-center gap-8 text-lg">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" />
              <span>£2,400+ average monthly earnings</span>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 mr-2" />
              <span>500+ families seeking support</span>
            </div>
            <div className="flex items-center">
              <Star className="h-6 w-6 mr-2" />
              <span>4.8+ average rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Platform Benefits */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose SpectrumCare?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 mb-3">{benefit.description}</p>
                    <Badge className="bg-blue-100 text-blue-800">{benefit.value}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Specialist Categories */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Specialist Categories We Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPECIALIST_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">{category.name}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Demand:</span>
                        <Badge variant={category.demand === 'Very High' ? 'default' : 'outline'}>
                          {category.demand}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span className="font-medium">{category.avgRate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Success Stories */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUCCESS_STORIES.map((story, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold">{story.name}</h4>
                      <p className="text-sm text-gray-600">{story.category}</p>
                      <p className="text-xs text-gray-500">{story.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-600">£{story.monthlyEarnings}</div>
                      <div className="text-gray-600">Monthly</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-bold text-blue-600">{story.sessionsPerWeek}</div>
                      <div className="text-gray-600">Sessions/week</div>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(story.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{story.rating}</span>
                  </div>

                  <blockquote className="text-sm italic text-gray-600">
                    "{story.testimonial}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Earnings Calculator */}
        <div className="py-12">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Calculate Your Potential Earnings</CardTitle>
              <CardDescription className="text-center">
                See how much you could earn on the SpectrumCare platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <Label>Sessions per week</Label>
                  <Select value={application.hoursPerWeek.toString()} onValueChange={(value) => updateApplication({ hoursPerWeek: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 sessions</SelectItem>
                      <SelectItem value="15">15 sessions</SelectItem>
                      <SelectItem value="20">20 sessions</SelectItem>
                      <SelectItem value="25">25 sessions</SelectItem>
                      <SelectItem value="30">30 sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Hourly rate (£)</Label>
                  <Select value={application.hourlyRate.toString()} onValueChange={(value) => updateApplication({ hourlyRate: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">£50/hour</SelectItem>
                      <SelectItem value="60">£60/hour</SelectItem>
                      <SelectItem value="70">£70/hour</SelectItem>
                      <SelectItem value="80">£80/hour</SelectItem>
                      <SelectItem value="90">£90/hour</SelectItem>
                      <SelectItem value="100">£100/hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Specialist category</Label>
                  <Select value={application.primaryCategory} onValueChange={(value) => updateApplication({ primaryCategory: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIST_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {application.hoursPerWeek > 0 && application.hourlyRate > 0 && (
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="text-lg font-semibold mb-4 text-center">Your Potential Monthly Earnings</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-gray-600">£{Math.round(calculatePotentialEarnings().grossMonthly)}</div>
                      <div className="text-sm text-gray-500">Gross Income</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded">
                      <div className="text-2xl font-bold text-red-600">-£{Math.round(calculatePotentialEarnings().platformFee)}</div>
                      <div className="text-sm text-gray-500">Platform Fee (15%)</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">£{Math.round(calculatePotentialEarnings().netMonthly)}</div>
                      <div className="text-sm text-gray-500">Net Income</div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    *Estimates based on current platform averages. Actual earnings may vary.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Application CTA */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join 500+ specialists already growing their income and impact on SpectrumCare
          </p>
          <Button
            onClick={() => setCurrentStep(2)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg"
          >
            Start Your Application
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {/* Application Form (Steps 2+) */}
        {currentStep > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Specialist Application</CardTitle>
              <CardDescription>
                Step {currentStep - 1} of {totalSteps - 1}
              </CardDescription>
              <Progress value={((currentStep - 1) / (totalSteps - 1)) * 100} className="h-2" />
            </CardHeader>
            <CardContent>
              {/* Application form steps would be implemented here */}
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Application form implementation in progress...</p>
                <Button onClick={() => setSubmitted(true)}>
                  Submit Test Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
