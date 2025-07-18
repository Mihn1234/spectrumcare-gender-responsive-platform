import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Brain,
  Users,
  FileText,
  MessageSquare,
  Scale,
  Shield,
  Zap,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Target,
  Lightbulb
} from "lucide-react";

// Helper function to get stakeholder icon styling based on color
const getStakeholderIconClass = (color: string) => {
  const classMap: Record<string, string> = {
    blue: "w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
    purple: "w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
    green: "w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
    orange: "w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
    red: "w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
    pink: "w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
  };
  return classMap[color] || classMap.blue;
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
                  SpectrumCare
                </h1>
                <p className="text-xs text-slate-500">Comprehensive Autism Support</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium">Features</a>
              <a href="#stakeholders" className="text-slate-600 hover:text-blue-600 font-medium">For Stakeholders</a>
              <a href="#professionals" className="text-slate-600 hover:text-blue-600 font-medium">Professionals</a>
              <a href="#contact" className="text-slate-600 hover:text-blue-600 font-medium">Contact</a>
              {process.env.NODE_ENV === 'development' && (
                <a href="/dev/bypass" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
                  <span className="mr-1">🔧</span>
                  Dev Access
                </a>
              )}
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enterprise LA System Banner */}
      <section className="relative py-12 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">🏛️ Enterprise LA System - £1B+ Market Opportunity</h2>
          <p className="text-xl mb-6 text-purple-100">
            World's first comprehensive parent-controlled SEND platform capturing the massive market gap
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">576,000</div>
              <div className="text-sm text-purple-200">EHC Plans Market</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">£50-150</div>
              <div className="text-sm text-purple-200">Monthly Revenue/Parent</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">70%</div>
              <div className="text-sm text-purple-200">Processing Efficiency</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-sm text-purple-200">Compliance Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              Revolutionary AI-Powered Platform
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Transforming
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Autism Support </span>
              for Every Family
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
              The world's first comprehensive autism support ecosystem serving families, professionals,
              schools, and local authorities with AI-powered case management, expert services, and legal advocacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-lg px-8 py-4">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4">
                Professional Network
              </Button>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">£68.66B</div>
                <div className="text-sm text-slate-600">Total Market</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">638,745</div>
                <div className="text-sm text-slate-600">Families Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">87%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-slate-600">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              The Crisis in Autism Support
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Families face unprecedented challenges navigating fragmented systems,
              with 87% of complaints against local authorities being upheld.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-red-900">System Delays</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-red-700 space-y-2">
                  <li>• 39-week average assessment delays</li>
                  <li>• 50% exceed statutory 20-week limits</li>
                  <li>• 212,964 patients waiting for diagnosis</li>
                  <li>• 90% wait over 13 weeks for assessment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-900">Financial Crisis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-orange-700 space-y-2">
                  <li>• £4.6B projected deficit by 2026</li>
                  <li>• 43% of local authorities at bankruptcy risk</li>
                  <li>• £1.8B spent on private SEN schools</li>
                  <li>• £32B annual economic cost of autism</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Quality Failures</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-blue-700 space-y-2">
                  <li>• 89% tribunal success rate for parents</li>
                  <li>• 25% of EHC assessment requests refused</li>
                  <li>• 44,000 children lack education placement</li>
                  <li>• Fragmented, incompatible systems</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Overview */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Revolutionary Solution
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A comprehensive AI-powered ecosystem that connects all stakeholders,
              streamlines processes, and puts families in control of their autism support journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete Ecosystem
              </Badge>
              <h3 className="text-3xl font-bold text-slate-900 mb-6">
                Multi-Stakeholder Platform Architecture
              </h3>
              <p className="text-lg text-slate-600 mb-8">
                Our platform serves families, professionals, schools, healthcare providers,
                local authorities, and legal advocates through specialized portals while
                maintaining seamless integration and data flow.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">AI-Powered Intelligence</h4>
                    <p className="text-slate-600">Advanced document processing, predictive analytics, and intelligent recommendations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Professional Network</h4>
                    <p className="text-slate-600">Curated network of certified professionals with quality assurance and performance monitoring</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Scale className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Legal Support</h4>
                    <p className="text-slate-600">Comprehensive legal advocacy with automated tribunal preparation and case management</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl transform rotate-6"></div>
              <Card className="relative bg-white p-8 rounded-2xl shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/api/placeholder/48/48" />
                      <AvatarFallback>FA</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">Family Dashboard</h4>
                      <p className="text-sm text-slate-600">Complete case oversight</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">EHC Plan Progress</span>
                      <Badge className="bg-blue-100 text-blue-700">78%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Assessments Complete</span>
                      <Badge className="bg-green-100 text-green-700">3/4</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Professional Team</span>
                      <Badge className="bg-purple-100 text-purple-700">5 Active</Badge>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp Voice Commands
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Revolutionary Features
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Cutting-edge technology meets real-world expertise to deliver unprecedented support capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle>AI Document Processing</CardTitle>
                <CardDescription>
                  Intelligent analysis of medical reports, assessments, and legal documents with automated timeline creation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Dual EHC Plan System</CardTitle>
                <CardDescription>
                  Official LA plan tracking with parallel shadow plan development for optimal outcomes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle>WhatsApp Voice Control</CardTitle>
                <CardDescription>
                  Natural language voice commands for accessibility and ease of use across all functions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Professional Network</CardTitle>
                <CardDescription>
                  Curated network of certified professionals with AI-powered matching and quality assurance
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Legal Advocacy Suite</CardTitle>
                <CardDescription>
                  Comprehensive tribunal preparation, evidence compilation, and legal document automation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Military-grade security with GDPR compliance, end-to-end encryption, and audit trails
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stakeholder Portals */}
      <section id="stakeholders" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Serving Every Stakeholder
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Specialized portals for each stakeholder type while maintaining seamless integration and collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Parents & Families",
                description: "Complete case management with real-time visibility into all assessments and progress",
                features: ["Document management", "Professional communication", "Timeline tracking", "Advocacy tools"],
                color: "blue",
                icon: Heart
              },
              {
                title: "Local Authorities",
                description: "Enterprise LA Command Center - Strategic oversight with AI-powered case management and £1B market opportunity",
                features: ["Executive Dashboard", "Crisis Management", "AI-Powered Automation", "Financial Management", "70% Efficiency Gains", "£2.8M Cost Savings"],
                color: "purple",
                icon: Users
              },
              {
                title: "Schools & Education",
                description: "Integrated SEND management platform with IEP/EHCP tools and progress tracking",
                features: ["SEND management", "Progress tracking", "Compliance reporting", "Resource allocation"],
                color: "green",
                icon: Award
              },
              {
                title: "Healthcare Providers",
                description: "Clinical workflow optimization with appointment scheduling and outcome tracking",
                features: ["Appointment scheduling", "Assessment tools", "Outcome tracking", "MDT coordination"],
                color: "orange",
                icon: Lightbulb
              },
              {
                title: "Professionals",
                description: "Complete practice management platform with client scheduling and report generation",
                features: ["Client management", "Assessment tools", "Report generation", "Quality assurance"],
                color: "red",
                icon: Star
              },
              {
                title: "Legal & Advocacy",
                description: "Comprehensive legal support system with tribunal preparation and case management",
                features: ["Tribunal preparation", "Evidence compilation", "Case management", "Legal documentation"],
                color: "pink",
                icon: Scale
              }
            ].map((stakeholder, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className={getStakeholderIconClass(stakeholder.color)}>
                    <stakeholder.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{stakeholder.title}</CardTitle>
                  <CardDescription className="text-base">
                    {stakeholder.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {stakeholder.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Network */}
      <section id="professionals" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Join Our Professional Network
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Connect with families who need your expertise while accessing cutting-edge tools and quality assurance support.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">£2,400</div>
                  <div className="text-sm text-slate-600">Average Monthly Income</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                  <div className="text-sm text-slate-600">Client Satisfaction</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">1-2</div>
                  <div className="text-sm text-slate-600">Weeks to Deploy</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-sm text-slate-600">Platform Support</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900">Professional Benefits</h3>
                <ul className="space-y-3">
                  {[
                    "Access to high-quality referrals from verified families",
                    "Complete practice management tools and automation",
                    "AI-assisted report generation and documentation",
                    "Quality assurance and professional development support",
                    "Flexible commission structure (15-20%)",
                    "Comprehensive insurance and regulatory compliance"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Card className="p-8 shadow-2xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl mb-2">Join as a Professional</CardTitle>
                <CardDescription className="text-base">
                  Start serving families and growing your practice today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">First Name</label>
                    <input className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter first name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Last Name</label>
                    <input className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter last name" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Professional Email</label>
                  <input type="email" className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="professional@domain.com" />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Profession</label>
                  <select className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Select your profession</option>
                    <option>Educational Psychologist</option>
                    <option>Speech & Language Therapist</option>
                    <option>Occupational Therapist</option>
                    <option>Autism Specialist</option>
                    <option>Medical Doctor</option>
                    <option>Legal Advocate</option>
                    <option>Other</option>
                  </select>
                </div>

                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-lg py-3">
                  Apply to Join Network
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-slate-500 text-center">
                  All professionals undergo verification and quality assurance processes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Autism Support Journey?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join thousands of families, professionals, and organizations already benefiting from our revolutionary platform.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Phone Support</CardTitle>
                <CardDescription className="text-blue-100">
                  Speak with our autism support specialists
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold mb-2">0800 123 4567</p>
                <p className="text-blue-100">Mon-Fri 8AM-8PM, Sat 9AM-5PM</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription className="text-blue-100">
                  Get detailed support via email
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xl font-bold mb-2">support@spectrumcare.platform</p>
                <p className="text-blue-100">Response within 2 hours</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Book Consultation</CardTitle>
                <CardDescription className="text-blue-100">
                  Schedule a personalized demo
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="bg-green-600 hover:bg-green-700 w-full mb-2">
                  Schedule Demo
                </Button>
                <p className="text-blue-100">Free 30-minute consultation</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-16">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-lg px-12 py-4">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-blue-100 mt-4">No credit card required • 30-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">SpectrumCare</h3>
                  <p className="text-xs text-slate-400">Comprehensive Autism Support</p>
                </div>
              </div>
              <p className="text-slate-400 mb-4">
                Transforming autism support through revolutionary AI-powered technology and comprehensive professional services.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Family Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Professional Network</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Local Authority Suite</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Knowledge Base</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 mt-8 text-center text-slate-400">
            <p>&copy; 2025 SpectrumCare Platform. All rights reserved. Transforming autism support for every family.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
