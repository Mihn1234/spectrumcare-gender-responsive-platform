'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  FileText,
  Brain,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Eye,
  Star,
  Target,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface PlanImportWizardProps {
  onComplete?: (importedPlan: any) => void;
  onCancel?: () => void;
}

export default function PlanImportWizard({ onComplete, onCancel }: PlanImportWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    planType: '',
    originalLA: '',
    planDate: '',
    reviewDate: '',
    importedDocuments: [] as string[],
    planContent: {
      sectionA: { title: 'Views, interests and aspirations', content: '', qualityScore: 0 },
      sectionB: { title: 'Special educational needs', content: '', qualityScore: 0 },
      sectionC: { title: 'Health needs', content: '', qualityScore: 0 },
      sectionD: { title: 'Social care needs', content: '', qualityScore: 0 },
      sectionE: { title: 'Outcomes', content: '', qualityScore: 0 },
      sectionF: { title: 'Special educational provision', content: '', qualityScore: 0 },
      sectionG: { title: 'Health provision', content: '', qualityScore: 0 },
      sectionH: { title: 'Social care provision', content: '', qualityScore: 0 },
      sectionI: { title: 'Placement', content: '', qualityScore: 0 },
      sectionJ: { title: 'Personal budget', content: '', qualityScore: 0 }
    }
  });

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const steps = [
    { number: 1, title: 'Plan Details', description: 'Basic information about the plan' },
    { number: 2, title: 'Document Upload', description: 'Upload existing plan documents' },
    { number: 3, title: 'Content Entry', description: 'Enter or review plan content' },
    { number: 4, title: 'AI Analysis', description: 'AI-powered quality assessment' },
    { number: 5, title: 'Review & Import', description: 'Review and complete import' }
  ];

  const planTypeOptions = [
    { value: 'ehc', label: 'Education, Health and Care Plan' },
    { value: 'support_plan', label: 'Support Plan' },
    { value: 'care_plan', label: 'Care Plan' },
    { value: 'transition_plan', label: 'Transition Plan' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);

    // Simulate document processing
    const newDocuments = files.map(file => `/uploads/imported/${file.name}`);
    setFormData(prev => ({
      ...prev,
      importedDocuments: [...prev.importedDocuments, ...newDocuments]
    }));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      importedDocuments: prev.importedDocuments.filter((_, i) => i !== index)
    }));
  };

  const simulateAIExtraction = () => {
    setIsLoading(true);
    // Simulate AI document processing
    setTimeout(() => {
      const extractedContent = {
        sectionA: {
          title: 'Views, interests and aspirations',
          content: 'Ahmed enjoys working with computers and technology. He expresses interest in programming and web development. His aspiration is to work in the IT sector and eventually live independently.',
          qualityScore: 85
        },
        sectionB: {
          title: 'Special educational needs',
          content: 'Ahmed has autism spectrum disorder with specific needs in communication and social interaction. He requires support with sensory processing and executive functioning skills.',
          qualityScore: 90
        },
        sectionC: {
          title: 'Health needs',
          content: 'Regular review with autism specialist. Support for anxiety management and sensory needs.',
          qualityScore: 75
        },
        sectionE: {
          title: 'Outcomes',
          content: 'To develop independent living skills, achieve qualifications in IT, maintain good mental health and wellbeing.',
          qualityScore: 70
        },
        sectionF: {
          title: 'Special educational provision',
          content: 'Specialist teaching support 10 hours per week, small group work, visual supports, structured breaks.',
          qualityScore: 80
        },
        sectionI: {
          title: 'Placement',
          content: 'Specialist school for students with autism, structured environment with specialist staff.',
          qualityScore: 85
        }
      };

      setFormData(prev => ({
        ...prev,
        planContent: { ...prev.planContent, ...extractedContent }
      }));
      setIsLoading(false);
      setSuccess('Document content extracted successfully!');
    }, 3000);
  };

  const performAIAnalysis = async () => {
    setIsLoading(true);
    setError('');

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/plans/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze plan');
      }

      setAnalysisResults(data.data);
      setSuccess('Plan analysis completed successfully!');
      setCurrentStep(5);

    } catch (error) {
      console.error('Error analyzing plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze plan');
    } finally {
      setIsLoading(false);
    }
  };

  const completeImport = () => {
    if (onComplete && analysisResults) {
      onComplete(analysisResults);
    } else {
      router.push('/dashboard?tab=plans');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Plan Information</CardTitle>
              <CardDescription>
                Provide basic details about the plan you're importing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="planType">Plan Type</Label>
                <Select
                  value={formData.planType}
                  onValueChange={(value) => setFormData({...formData, planType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    {planTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="originalLA">Original Local Authority</Label>
                <Input
                  id="originalLA"
                  value={formData.originalLA}
                  onChange={(e) => setFormData({...formData, originalLA: e.target.value})}
                  placeholder="e.g., Birmingham City Council"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planDate">Plan Date</Label>
                  <Input
                    id="planDate"
                    type="date"
                    value={formData.planDate}
                    onChange={(e) => setFormData({...formData, planDate: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="reviewDate">Last Review Date</Label>
                  <Input
                    id="reviewDate"
                    type="date"
                    value={formData.reviewDate}
                    onChange={(e) => setFormData({...formData, reviewDate: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>
                Upload existing plan documents for AI processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Upload Plan Documents
                </p>
                <p className="text-gray-600 mb-4">
                  Drag and drop files or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <Button onClick={simulateAIExtraction} disabled={isLoading}>
                    {isLoading ? (
                      <>Extracting Content...</>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Extract Content with AI
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Content</CardTitle>
                <CardDescription>
                  Review and edit the extracted plan content
                </CardDescription>
              </CardHeader>
            </Card>

            <Tabs defaultValue="sectionA" className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="sectionA">Section A</TabsTrigger>
                <TabsTrigger value="sectionB">Section B</TabsTrigger>
                <TabsTrigger value="sectionE">Section E</TabsTrigger>
                <TabsTrigger value="sectionF">Section F</TabsTrigger>
                <TabsTrigger value="sectionI">Section I</TabsTrigger>
              </TabsList>

              {Object.entries(formData.planContent).slice(0, 5).map(([key, section]) => (
                <TabsContent key={key} value={key}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        {section.qualityScore > 0 && (
                          <Badge variant="outline">
                            Quality: {section.qualityScore}%
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={section.content}
                        onChange={(e) => setFormData({
                          ...formData,
                          planContent: {
                            ...formData.planContent,
                            [key]: { ...section, content: e.target.value }
                          }
                        })}
                        placeholder={`Enter ${section.title.toLowerCase()} content...`}
                        rows={6}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  Comprehensive quality assessment and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!analysisResults ? (
                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Ready for AI Analysis</h3>
                    <p className="text-gray-600 mb-6">
                      Our AI will analyze the plan content for quality, compliance, and areas for improvement
                    </p>
                    <Button onClick={performAIAnalysis} disabled={isLoading}>
                      {isLoading ? (
                        <>Analyzing...</>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Start AI Analysis
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Star className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Overall Quality</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {analysisResults.qualityScore}%
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Compliance</p>
                            <p className="text-2xl font-bold text-green-600">
                              {analysisResults.aiAnalysis.complianceScore}%
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Target className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Improvements</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {analysisResults.recommendations.length}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-green-600">Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResults.aiAnalysis.strengthAreas.map((strength: string, index: number) => (
                              <li key={index} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg text-orange-600">Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResults.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-orange-600" />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Import Complete</CardTitle>
              <CardDescription>
                Review the imported plan and analysis results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysisResults && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-medium text-green-900">
                      Plan Successfully Imported
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Plan Type</p>
                      <p className="font-medium capitalize">{formData.planType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Original LA</p>
                      <p className="font-medium">{formData.originalLA}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quality Score</p>
                      <p className="font-medium">{analysisResults.qualityScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Compliance Score</p>
                      <p className="font-medium">{analysisResults.aiAnalysis.complianceScore}%</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h4 className="font-medium mb-2">Next Steps:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Review detailed analysis and recommendations</li>
                      <li>• Implement suggested improvements</li>
                      <li>• Schedule review meetings with stakeholders</li>
                      <li>• Track progress against identified gaps</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Button onClick={completeImport}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Complete Import
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Analysis Report
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Import Existing Plan
        </h1>
        <p className="text-gray-600">
          Upload and analyze your existing EHC plan with AI-powered insights
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 font-medium
              ${currentStep >= step.number
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-500'}
            `}>
              {currentStep > step.number ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="ml-3 hidden md:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4
                ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            } else if (onCancel) {
              onCancel();
            } else {
              router.back();
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep > 1 ? 'Previous' : 'Cancel'}
        </Button>

        {currentStep < 5 && (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              (currentStep === 1 && (!formData.planType || !formData.originalLA || !formData.planDate)) ||
              (currentStep === 2 && uploadedFiles.length === 0) ||
              (currentStep === 4 && !analysisResults)
            }
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
