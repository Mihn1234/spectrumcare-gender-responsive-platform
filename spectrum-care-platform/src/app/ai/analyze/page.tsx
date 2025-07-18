'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  FileText,
  Upload,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Search,
  BookOpen,
  MessageSquare,
  Award,
  Clock,
  Users,
  Settings
} from 'lucide-react'

export default function AIAnalysisPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const bypassData = localStorage.getItem('dev_bypass_user')
    if (bypassData) {
      setCurrentUser(JSON.parse(bypassData))
    }
  }, [])

  const aiStats = {
    documentsAnalyzed: 12847,
    accuracyRate: "95.7%",
    avgProcessingTime: "2.3 seconds",
    insightsGenerated: 45123,
    complianceIssues: 234
  }

  const recentAnalyses = [
    {
      document: "EHC Plan - Emma Johnson",
      type: "Plan Analysis",
      confidence: 94,
      status: "complete",
      findings: 8,
      recommendations: 5,
      time: "2 minutes ago"
    },
    {
      document: "Educational Psychology Report - James Wilson",
      type: "Assessment Analysis",
      confidence: 97,
      status: "complete",
      findings: 12,
      recommendations: 7,
      time: "15 minutes ago"
    },
    {
      document: "Speech Therapy Report - Sophie Chen",
      type: "Progress Analysis",
      confidence: 91,
      status: "complete",
      findings: 6,
      recommendations: 4,
      time: "1 hour ago"
    }
  ]

  const simulateAnalysis = async () => {
    setIsAnalyzing(true)

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000))

    const mockResults = {
      confidence: 95,
      analysisType: "EHC Plan Comprehensive Analysis",
      document: "Emma Johnson - Annual Review 2025",
      findings: [
        {
          category: "Needs Assessment",
          severity: "medium",
          finding: "Communication goals lack specific measurable outcomes",
          recommendation: "Add SMART objectives with clear success criteria",
          section: "Section B - Special Educational Needs"
        },
        {
          category: "Provision Gaps",
          severity: "high",
          finding: "No transition planning for post-16 education identified",
          recommendation: "Include detailed transition plan with timeline and objectives",
          section: "Section F - Special Educational Provision"
        },
        {
          category: "Compliance",
          severity: "low",
          finding: "Annual review date alignment with statutory requirements",
          recommendation: "Ensure review is scheduled within 12 months",
          section: "Administrative"
        },
        {
          category: "Quality Assurance",
          severity: "medium",
          finding: "Limited evidence of child and parent voice",
          recommendation: "Include more detailed consultation records",
          section: "Section A - Views and Aspirations"
        }
      ],
      strengths: [
        "Clear identification of primary needs",
        "Well-structured provision mapping",
        "Regular review process documented"
      ],
      complianceScore: 87,
      qualityScore: 92,
      completenessScore: 84
    }

    setAnalysisResults(mockResults)
    setIsAnalyzing(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600 rounded-xl text-white">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Analysis Hub</h1>
              <p className="text-gray-600">Advanced AI-powered document analysis and automated assessment pipeline</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
              AI-Powered Analysis
            </Badge>
            <div className="text-right">
              <p className="font-semibold text-gray-900">AI Analysis Engine v3.2</p>
              <p className="text-sm text-gray-600">Enterprise Grade Processing</p>
            </div>
          </div>
        </div>

        {/* AI Market Value Banner */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🤖 Revolutionary AI-Powered Analysis</h2>
              <p className="text-purple-100 mb-4">
                World-first AI system with 95.7% accuracy - transforming SEND document analysis and advocacy
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{aiStats.accuracyRate}</div>
                  <div className="text-sm">Analysis Accuracy</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{aiStats.avgProcessingTime}</div>
                  <div className="text-sm">Processing Speed</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{aiStats.documentsAnalyzed.toLocaleString()}</div>
                  <div className="text-sm">Documents Analyzed</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{aiStats.insightsGenerated.toLocaleString()}</div>
                  <div className="text-sm">Insights Generated</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{aiStats.documentsAnalyzed.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Documents Processed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{aiStats.accuracyRate}</div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{aiStats.avgProcessingTime}</div>
              <div className="text-sm text-gray-600">Avg Processing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{aiStats.insightsGenerated.toLocaleString()}</div>
              <div className="text-sm text-gray-600">AI Insights</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{aiStats.complianceIssues}</div>
              <div className="text-sm text-gray-600">Issues Identified</div>
            </CardContent>
          </Card>
        </div>

        {/* Main AI Analysis Tabs */}
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 lg:w-fit">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="results">Analysis Results</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="quality">Quality Assurance</TabsTrigger>
            <TabsTrigger value="reports">Reporting</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Document Upload & Analysis
                  </CardTitle>
                  <CardDescription>Upload SEND documents for AI-powered analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Drop files here or click to upload</h3>
                      <p className="text-gray-600 mb-4">Supports PDF, DOCX, TXT - Max 10MB per file</p>
                      <Button
                        onClick={simulateAnalysis}
                        disabled={isAnalyzing}
                        className="mb-2"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Demo: Analyze Sample EHC Plan'}
                      </Button>
                      {isAnalyzing && (
                        <div className="flex items-center justify-center mt-4">
                          <Brain className="h-5 w-5 animate-pulse text-purple-600 mr-2" />
                          <span className="text-purple-600">AI analyzing document...</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        EHC Plan Analysis
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Assessment Review
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Compliance Check
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Analyses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Analyses
                  </CardTitle>
                  <CardDescription>Latest AI-powered document analyses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAnalyses.map((analysis, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{analysis.document}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            {analysis.confidence}% confidence
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>Type: {analysis.type}</div>
                          <div>Findings: {analysis.findings}</div>
                          <div>Recommendations: {analysis.recommendations}</div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{analysis.time}</span>
                          <Button size="sm" variant="outline">View Results</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {analysisResults ? (
              <div className="space-y-6">
                {/* Analysis Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      AI Analysis Results
                    </CardTitle>
                    <CardDescription>{analysisResults.document} - {analysisResults.analysisType}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{analysisResults.confidence}%</div>
                        <div className="text-sm text-green-600">AI Confidence</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">{analysisResults.complianceScore}%</div>
                        <div className="text-sm text-blue-600">Compliance Score</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">{analysisResults.qualityScore}%</div>
                        <div className="text-sm text-purple-600">Quality Score</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-700">{analysisResults.completenessScore}%</div>
                        <div className="text-sm text-orange-600">Completeness</div>
                      </div>
                    </div>

                    {/* Key Findings */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Key Findings & Recommendations</h3>
                      {analysisResults.findings.map((finding: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{finding.category}</h4>
                            <Badge className={getSeverityColor(finding.severity)}>
                              {finding.severity} priority
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{finding.finding}</p>
                          <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                            <p className="font-medium text-blue-800">Recommendation:</p>
                            <p className="text-blue-700">{finding.recommendation}</p>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Section: {finding.section}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Strengths */}
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-3">Document Strengths</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {analysisResults.strengths.map((strength: string, index: number) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />
                            <span className="text-green-800">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analysis Results Yet</h3>
                  <p className="text-gray-600 mb-4">Upload a document to see AI-powered analysis results</p>
                  <Button onClick={() => window.location.hash = 'upload'}>
                    Start Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
                <CardDescription>Advanced pattern recognition and trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced AI Insights Engine</h3>
                  <p className="text-gray-600 mb-4">Pattern recognition across thousands of SEND documents</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                    <Button size="sm">Trend Analysis</Button>
                    <Button size="sm" variant="outline">Pattern Recognition</Button>
                    <Button size="sm" variant="outline">Predictive Modeling</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Assessment Pipeline</CardTitle>
                <CardDescription>End-to-end automation of assessment processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 border rounded-lg text-center">
                    <Zap className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                    <h3 className="font-semibold mb-2">Auto-Processing</h3>
                    <p className="text-sm text-gray-600 mb-4">Automatic document ingestion and analysis</p>
                    <Button size="sm">Configure</Button>
                  </div>
                  <div className="p-6 border rounded-lg text-center">
                    <Target className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                    <h3 className="font-semibold mb-2">Smart Routing</h3>
                    <p className="text-sm text-gray-600 mb-4">Intelligent case assignment and prioritization</p>
                    <Button size="sm">Setup Rules</Button>
                  </div>
                  <div className="p-6 border rounded-lg text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="font-semibold mb-2">Auto-Reporting</h3>
                    <p className="text-sm text-gray-600 mb-4">Automated report generation and distribution</p>
                    <Button size="sm">Enable</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Quality Assurance
                </CardTitle>
                <CardDescription>AI-powered quality control and validation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Quality Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Analysis Accuracy</span>
                        <span className="font-semibold text-green-600">95.7%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>False Positive Rate</span>
                        <span className="font-semibold text-blue-600">2.1%</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Processing Speed</span>
                        <span className="font-semibold text-purple-600">2.3s avg</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">AI Model Performance</h3>
                    <div className="space-y-2 text-sm text-purple-700">
                      <div className="flex justify-between">
                        <span>Model Version:</span>
                        <span className="font-semibold">v3.2 Enterprise</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Training Data:</span>
                        <span className="font-semibold">50K+ documents</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span className="font-semibold">Jan 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Reporting</CardTitle>
                <CardDescription>Comprehensive reporting and analytics dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Reporting Suite</h3>
                  <p className="text-gray-600 mb-4">Generate comprehensive AI analysis reports for stakeholders</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button>Generate Report</Button>
                    <Button variant="outline">Export Data</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation back */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dev/bypass'}
            className="mr-4"
          >
            Back to Bypass Portal
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  )
}
