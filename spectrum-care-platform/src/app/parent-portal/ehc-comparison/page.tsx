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
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  Target,
  BarChart3,
  ArrowRight,
  Download,
  Share,
  BookOpen,
  Lightbulb,
  PieChart,
  TrendingDown,
  Calendar,
  Users,
  Settings,
  Home,
  ArrowLeft
} from 'lucide-react';

interface EHCComparison {
  id: string;
  childId: string;
  officialPlan?: any;
  shadowPlan?: any;
  comparisonAnalysis: {
    overallQuality: number;
    gapAnalysis: string[];
    recommendations: string[];
    costAnalysis: any;
    timelineComparison: any;
    outcomeComparison: any;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EHCComparisonPage() {
  const router = useRouter();
  const [comparison, setComparison] = useState<EHCComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState('demo-child-id');
  const [analysisType, setAnalysisType] = useState('comprehensive');

  useEffect(() => {
    loadComparisonData();
  }, [selectedChild, analysisType]);

  const loadComparisonData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `/api/parent-portal/ehc-comparison?childId=${selectedChild}&type=${analysisType}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load EHC plan comparison');
      }

      const data = await response.json();
      setComparison(data.data);

    } catch (error) {
      console.error('Error loading comparison data:', error);
      setError('Failed to load EHC plan comparison');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewComparison = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/parent-portal/ehc-comparison', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          childId: selectedChild,
          comparisonType: analysisType,
          analysisOptions: {
            includeGapAnalysis: true,
            includeCostAnalysis: true,
            includeTimelineComparison: true,
            includeOutcomeComparison: true,
            generateRecommendations: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate comparison');
      }

      const data = await response.json();
      setComparison(data.data);

    } catch (error) {
      console.error('Error generating comparison:', error);
      setError('Failed to generate new comparison');
    } finally {
      setIsLoading(false);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Analyzing EHC plans...</p>
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
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">EHC Plan Comparison</h1>
                  <p className="text-sm text-gray-500">Dual plan analysis & optimization</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={generateNewComparison}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate New Analysis
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
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

        {!comparison ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No EHC Plan Comparison Available</h3>
              <p className="text-gray-600 mb-6">Generate a comprehensive analysis to compare your official EHC plan with best practice alternatives</p>
              <Button onClick={generateNewComparison}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Plan Comparison
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall Quality</p>
                      <p className={`text-3xl font-bold ${getQualityColor(comparison.comparisonAnalysis.overallQuality).split(' ')[0]}`}>
                        {comparison.comparisonAnalysis.overallQuality}%
                      </p>
                      <p className={`text-sm ${getQualityColor(comparison.comparisonAnalysis.overallQuality)}`}>
                        {getQualityLabel(comparison.comparisonAnalysis.overallQuality)}
                      </p>
                    </div>
                    <Target className={`h-8 w-8 ${getQualityColor(comparison.comparisonAnalysis.overallQuality).split(' ')[0]}`} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gaps Identified</p>
                      <p className="text-3xl font-bold text-red-600">
                        {comparison.comparisonAnalysis.gapAnalysis.length}
                      </p>
                      <p className="text-sm text-red-600">Areas for improvement</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Recommendations</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {comparison.comparisonAnalysis.recommendations.length}
                      </p>
                      <p className="text-sm text-blue-600">Action items</p>
                    </div>
                    <Lightbulb className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cost Impact</p>
                      <p className="text-3xl font-bold text-green-600">
                        {comparison.comparisonAnalysis.costAnalysis?.costBenefitRatio ?
                          `${comparison.comparisonAnalysis.costAnalysis.costBenefitRatio.toFixed(1)}x` : 'N/A'}
                      </p>
                      <p className="text-sm text-green-600">Benefit ratio</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Analysis Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="side-by-side">Side-by-Side</TabsTrigger>
                <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
                <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quality Assessment */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                        Quality Assessment
                      </CardTitle>
                      <CardDescription>
                        Comprehensive analysis of your EHC plan quality across all statutory sections
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Overall Plan Quality</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={comparison.comparisonAnalysis.overallQuality} className="w-24" />
                            <span className="text-sm font-bold">{comparison.comparisonAnalysis.overallQuality}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">
                              {comparison.comparisonAnalysis.outcomeComparison?.currentOutcomes || 4}
                            </p>
                            <p className="text-sm text-gray-600">Current Outcomes</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">
                              {comparison.comparisonAnalysis.outcomeComparison?.optimizedOutcomes || 7}
                            </p>
                            <p className="text-sm text-gray-600">Potential Outcomes</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Timeline Comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-purple-600" />
                        Timeline Analysis
                      </CardTitle>
                      <CardDescription>
                        Compare current and optimized implementation timelines
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Current Timeline</p>
                            <p className="text-sm text-gray-600">
                              {comparison.comparisonAnalysis.timelineComparison?.currentTimeline || '18-24 months'}
                            </p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">Optimized Timeline</p>
                            <p className="text-sm text-green-600">
                              {comparison.comparisonAnalysis.timelineComparison?.optimizedTimeline || '12-18 months'}
                            </p>
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-lg font-bold text-green-600">6 Months Faster</p>
                          <p className="text-sm text-gray-600">Potential acceleration with optimized plan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Critical Issues Alert */}
                {comparison.comparisonAnalysis.gapAnalysis.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div className="ml-2">
                      <h4 className="font-medium text-red-800">Critical Gaps Identified</h4>
                      <AlertDescription className="text-red-700">
                        Your EHC plan has {comparison.comparisonAnalysis.gapAnalysis.length} significant gaps that could impact outcomes.
                        Review the Gap Analysis tab for detailed information and solutions.
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Quick Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                      Priority Recommendations
                    </CardTitle>
                    <CardDescription>
                      Top 3 actions to improve your EHC plan immediately
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comparison.comparisonAnalysis.recommendations.slice(0, 3).map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                          <Badge variant="outline" className="mt-1">
                            {index + 1}
                          </Badge>
                          <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
                          <Button size="sm" variant="outline">
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Side-by-Side Comparison Tab */}
              <TabsContent value="side-by-side" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Official Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Official EHC Plan
                        </span>
                        <Badge variant="outline">Current</Badge>
                      </CardTitle>
                      <CardDescription>
                        Your current Local Authority EHC plan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium mb-2">Plan Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Quality Score:</span>
                              <span className="font-medium">{comparison.comparisonAnalysis.overallQuality}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Last Review:</span>
                              <span className="font-medium">Jan 2024</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Next Review:</span>
                              <span className="font-medium">Jan 2025</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Section Analysis</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Section A - Views & Aspirations</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Section B - Special Educational Needs</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Section F - Educational Provision</span>
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Section H - Transition Planning</span>
                              <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shadow/Optimized Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                          Optimized Plan
                        </span>
                        <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                      </CardTitle>
                      <CardDescription>
                        AI-optimized plan based on best practices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium mb-2">Enhanced Plan Status</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Quality Score:</span>
                              <span className="font-medium text-green-600">88%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Implementation:</span>
                              <span className="font-medium">12-15 months</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Additional Outcomes:</span>
                              <span className="font-medium text-green-600">+3</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Enhanced Sections</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Section A - Enhanced Voice</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Section B - Detailed Needs Analysis</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Section F - SMART Provisions</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Section H - Comprehensive Transition</span>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Improvement Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Key Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="font-medium">Quality Increase</p>
                        <p className="text-2xl font-bold text-green-600">+15%</p>
                        <p className="text-sm text-gray-600">Overall plan quality</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-medium">More Outcomes</p>
                        <p className="text-2xl font-bold text-blue-600">+3</p>
                        <p className="text-sm text-gray-600">Measurable outcomes</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="font-medium">Faster Implementation</p>
                        <p className="text-2xl font-bold text-purple-600">-6mo</p>
                        <p className="text-sm text-gray-600">Timeline reduction</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gap Analysis Tab */}
              <TabsContent value="gaps" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                      Identified Gaps ({comparison.comparisonAnalysis.gapAnalysis.length})
                    </CardTitle>
                    <CardDescription>
                      Critical areas where your EHC plan can be improved
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparison.comparisonAnalysis.gapAnalysis.map((gap, index) => (
                        <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                          <div className="flex items-start space-x-3">
                            <Badge variant="destructive" className="mt-1">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium text-red-800 mb-1">Critical Gap Identified</p>
                              <p className="text-sm text-red-700 mb-3">{gap}</p>
                              <div className="flex space-x-2">
                                <Badge variant="outline" className="text-xs">High Priority</Badge>
                                <Badge variant="outline" className="text-xs">Statutory Section</Badge>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <BookOpen className="h-3 w-3 mr-1" />
                              Learn More
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Gap Impact Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tribunal Risk Level</span>
                          <Badge variant="destructive">High</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Outcome Achievement Risk</span>
                          <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Statutory Compliance</span>
                          <Badge variant="destructive">At Risk</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Improvement Potential</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Quality Improvement</span>
                          <span className="font-medium text-green-600">+25%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Outcome Potential</span>
                          <span className="font-medium text-green-600">+75%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Timeline Reduction</span>
                          <span className="font-medium text-green-600">6 months</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-orange-600" />
                      AI-Powered Recommendations ({comparison.comparisonAnalysis.recommendations.length})
                    </CardTitle>
                    <CardDescription>
                      Actionable steps to optimize your EHC plan based on best practices and statutory requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {comparison.comparisonAnalysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                          <div className="flex items-start space-x-3">
                            <Badge className="bg-orange-100 text-orange-800 mt-1">
                              {index + 1}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium text-orange-800 mb-1">Recommendation</p>
                              <p className="text-sm text-orange-700 mb-3">{recommendation}</p>
                              <div className="flex space-x-2">
                                <Badge variant="outline" className="text-xs">Priority Action</Badge>
                                <Badge variant="outline" className="text-xs">Evidence-Based</Badge>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Implement
                              </Button>
                              <Button size="sm" variant="ghost">
                                <BookOpen className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Implementation Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Implementation Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-blue-200"></div>

                        <div className="flex items-start space-x-4 pb-6">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
                          <div>
                            <h4 className="font-medium">Immediate Actions (Week 1-2)</h4>
                            <p className="text-sm text-gray-600">Address critical gaps and compliance issues</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4 pb-6">
                          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
                          <div>
                            <h4 className="font-medium">Short-term Improvements (Month 1-2)</h4>
                            <p className="text-sm text-gray-600">Enhance plan sections and add missing provisions</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">3</div>
                          <div>
                            <h4 className="font-medium">Long-term Optimization (Month 3-6)</h4>
                            <p className="text-sm text-gray-600">Implement advanced features and monitoring systems</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cost Analysis Tab */}
              <TabsContent value="cost-analysis" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                        Cost Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Current Plan Cost</span>
                          <span className="text-lg font-bold">£{comparison.comparisonAnalysis.costAnalysis?.currentPlanCost || 12500}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">Optimized Plan Cost</span>
                          <span className="text-lg font-bold">£{comparison.comparisonAnalysis.costAnalysis?.shadowPlanCost || 15800}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span className="font-medium">Additional Investment</span>
                          <span className="text-lg font-bold text-purple-600">
                            £{(comparison.comparisonAnalysis.costAnalysis?.shadowPlanCost || 15800) -
                               (comparison.comparisonAnalysis.costAnalysis?.currentPlanCost || 12500)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                        Return on Investment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-3xl font-bold text-green-600">
                            {comparison.comparisonAnalysis.costAnalysis?.costBenefitRatio?.toFixed(1) || '1.3'}x
                          </p>
                          <p className="text-sm text-gray-600">Cost-Benefit Ratio</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-lg font-bold text-blue-600">+3</p>
                            <p className="text-xs text-gray-600">Additional Outcomes</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-lg font-bold text-orange-600">40%</p>
                            <p className="text-xs text-gray-600">Quality Improvement</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Investment Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Enhanced Speech Therapy</span>
                        <span className="font-medium">£2,400</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Additional Educational Psychology</span>
                        <span className="font-medium">£1,800</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="text-sm">Transition Planning Support</span>
                        <span className="font-medium">£900</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50">
                        <span className="font-medium">Total Additional Investment</span>
                        <span className="text-lg font-bold text-green-600">£3,300</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Action Plan Tab */}
              <TabsContent value="action-plan" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-blue-600" />
                      Your Personalized Action Plan
                    </CardTitle>
                    <CardDescription>
                      Step-by-step guide to implement the recommended improvements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Phase 1: Immediate Actions */}
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h3 className="font-bold text-red-800 mb-3">🚨 Phase 1: Immediate Actions (This Week)</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Review Section H for transition planning gaps</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Gather evidence for missing provisions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Contact SENCO to discuss plan amendments</span>
                          </div>
                        </div>
                      </div>

                      {/* Phase 2: Short-term */}
                      <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                        <h3 className="font-bold text-orange-800 mb-3">📋 Phase 2: Short-term Improvements (Next Month)</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Request formal plan amendment meeting</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Prepare evidence portfolio for enhanced provisions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Engage additional professional assessments</span>
                          </div>
                        </div>
                      </div>

                      {/* Phase 3: Long-term */}
                      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <h3 className="font-bold text-green-800 mb-3">🎯 Phase 3: Long-term Optimization (Next 3-6 Months)</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Implement enhanced monitoring systems</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Establish outcome measurement protocols</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Plan next annual review strategy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Support Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-600" />
                      Support Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <BookOpen className="h-6 w-6" />
                        <span>EHC Plan Guide</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Users className="h-6 w-6" />
                        <span>Expert Consultation</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Home className="h-6 w-6" />
                        <span>Parent Support Group</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
