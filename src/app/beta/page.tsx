'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Users,
  Heart,
  CheckCircle2,
  ArrowRight,
  Star,
  Gift,
  Clock,
  Shield,
  Target,
  Lightbulb,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const BETA_BENEFITS = [
  {
    icon: Gift,
    title: 'Free Premium Access',
    description: '£500+ worth of platform credits plus lifetime 50% discount'
  },
  {
    icon: Brain,
    title: 'AI EHC Plan Builder Early Access',
    description: 'First access to revolutionary AI-powered EHC plan generation'
  },
  {
    icon: Users,
    title: 'Direct Product Influence',
    description: 'Your feedback directly shapes the platform development'
  },
  {
    icon: Star,
    title: 'Beta Tester Recognition',
    description: 'Special recognition as founding beta tester community'
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Direct access to our development team for support'
  },
  {
    icon: Heart,
    title: 'Community Impact',
    description: 'Help shape the future of SEND support for 638,745+ families'
  }
];

const TESTING_SCENARIOS = [
  'AI-Powered EHC Plan Generation for your child\'s specific needs',
  'Demographic Analytics to understand local SEND patterns',
  'Multi-Diagnostic Pathway workflows (ASD, SLCN, SEMH)',
  'Age-Appropriate Content for Early Years, Primary, Secondary, Post-16',
  'Professional Network Integration and specialist connections',
  'Medical Practice Integration for autism assessments',
  'Voice Command Interface via WhatsApp',
  'Document Management and Progress Tracking'
];

export default function BetaPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childAge: '',
    diagnosis: '',
    localAuthority: '',
    currentChallenges: '',
    expectations: '',
    availability: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto text-center p-8">
          <CardContent>
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-green-900 mb-4">
              Welcome to the SpectrumCare Beta Program!
            </h1>
            <p className="text-lg text-green-700 mb-6">
              Thank you for joining our exclusive beta testing community. We'll be in touch within 48 hours with your access credentials and onboarding information.
            </p>
            <div className="bg-green-100 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-2">What happens next?</h3>
              <div className="text-green-800 text-sm space-y-1">
                <div>✅ Account setup and platform access within 48 hours</div>
                <div>✅ Personal onboarding call with our team</div>
                <div>✅ £500+ platform credits activated</div>
                <div>✅ Beta tester community access</div>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Mail className="h-4 w-4 mr-2" />
              Check Your Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Badge className="bg-orange-500 text-white mb-6 text-lg px-4 py-2">
            🔥 LIMITED SPOTS AVAILABLE - 20 FAMILIES ONLY
          </Badge>

          <h1 className="text-5xl font-bold mb-6">
            Join the SpectrumCare
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Beta Testing Program
            </span>
          </h1>

          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Be among the first 20 families to experience our revolutionary AI-powered SEND platform.
            Help shape the future of autism support while getting exclusive access and benefits.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">638,745+</div>
              <div className="text-sm opacity-75">EHCPs We'll Manage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">£500+</div>
              <div className="text-sm opacity-75">Free Platform Credits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">50%</div>
              <div className="text-sm opacity-75">Lifetime Discount</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Beta Tester Exclusive Benefits</h2>
            <p className="text-xl text-gray-600">
              Get premium access, influence development, and receive significant rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BETA_BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testing Scenarios */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What You'll Be Testing</h2>
            <p className="text-xl text-gray-600">
              Comprehensive testing scenarios covering all aspects of the platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TESTING_SCENARIOS.map((scenario, index) => (
              <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-800">{scenario}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Apply for Beta Access</h2>
            <p className="text-xl text-gray-600">
              Tell us about your family's needs and join our exclusive testing community
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Beta Application Form</CardTitle>
              <p className="text-gray-600">
                Please provide detailed information to help us match you with the most relevant testing scenarios.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Parent/Carer Name *</label>
                    <Input
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+44 7xxx xxx xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Child's Age Group *</label>
                    <select
                      name="childAge"
                      value={formData.childAge}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select age group</option>
                      <option value="early-years">Early Years (4-5)</option>
                      <option value="primary">Primary (5-11)</option>
                      <option value="secondary">Secondary (11-16)</option>
                      <option value="post-16">Post-16 (16-25)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Diagnosis/Need *</label>
                    <select
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select primary need</option>
                      <option value="asd">Autism Spectrum Disorder (ASD)</option>
                      <option value="slcn">Speech, Language & Communication Needs</option>
                      <option value="semh">Social, Emotional & Mental Health</option>
                      <option value="learning">Learning Difficulties</option>
                      <option value="physical">Physical Disability</option>
                      <option value="sensory">Sensory Impairment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Local Authority *</label>
                    <Input
                      name="localAuthority"
                      value={formData.localAuthority}
                      onChange={handleInputChange}
                      placeholder="e.g., Birmingham, Manchester, Leeds"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Challenges with SEND Support *
                  </label>
                  <textarea
                    name="currentChallenges"
                    value={formData.currentChallenges}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md h-24"
                    placeholder="Describe your main challenges with current SEND support, EHC planning, or finding specialists..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What do you hope to achieve with SpectrumCare? *
                  </label>
                  <textarea
                    name="expectations"
                    value={formData.expectations}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md h-24"
                    placeholder="What specific outcomes are you hoping for? How could our platform help your family?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Testing Availability *
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select your availability</option>
                    <option value="high">High - Can test daily/weekly</option>
                    <option value="medium">Medium - Can test 2-3 times per week</option>
                    <option value="low">Low - Can test weekly</option>
                    <option value="feedback-only">Feedback only - Monthly check-ins</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Beta Testing Commitment</h4>
                  <div className="text-blue-800 text-sm space-y-1">
                    <div>• 8-week testing period with weekly feedback sessions</div>
                    <div>• 2-4 hours per week testing various platform features</div>
                    <div>• Participate in video calls and provide detailed feedback</div>
                    <div>• Help us refine the platform for the wider SEND community</div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-3"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5 mr-2" />
                      Submit Beta Application
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions About Beta Testing?</h2>
          <p className="text-gray-300 mb-8">
            Our team is here to help. Get in touch if you have any questions about the beta program.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Mail className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Email</h4>
              <p className="text-gray-400 text-sm">beta@spectrumcare.platform</p>
            </div>
            <div className="text-center">
              <Phone className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Phone</h4>
              <p className="text-gray-400 text-sm">+44 20 7xxx xxxx</p>
            </div>
            <div className="text-center">
              <MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Location</h4>
              <p className="text-gray-400 text-sm">London, UK</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
