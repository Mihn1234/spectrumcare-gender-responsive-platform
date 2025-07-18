'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Brain,
  User,
  FileText,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Zap,
  Heart,
  BookOpen
} from 'lucide-react';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  primaryDiagnosis: string;
  currentNeeds: string[];
  strengths: string[];
  challenges: string[];
}

interface PlanGenerationWizardProps {
  children: Child[];
  onClose: () => void;
  onPlanGenerated: (plan: any) => void;
}

interface GenerationForm {
  // Step 1: Child Selection
  childId: string;

  // Step 2: Plan Details
  planType: 'initial' | 'annual_review' | 'reassessment';
  urgencyLevel: 'urgent' | 'high' | 'standard' | 'low';
  localAuthority: string;
  caseOfficerName: string;
  caseOfficerEmail: string;
  tribunalDeadline?: string;

  // Step 3: Parent Input
  parentInput: {
    childViews: string;
    parentViews: string;
    homeEnvironment: string;
    familyCircumstances: string;
    aspirations: string;
    concerns: string;
  };

  // Step 4: Generation Options
  generateSections: string[];
  useTemplate: boolean;
  templateId?: string;
}

const INITIAL_FORM: GenerationForm = {
  childId: '',
  planType: 'initial',
  urgencyLevel: 'standard',
  localAuthority: '',
  caseOfficerName: '',
  caseOfficerEmail: '',
  parentInput: {
    childViews: '',
    parentViews: '',
    homeEnvironment: '',
    familyCircumstances: '',
    aspirations: '',
    concerns: ''
  },
  generateSections: [
    'child_views',
    'parent_views',
    'educational_needs',
    'outcomes',
    'educational_provision',
    'health_provision'
  ],
  useTemplate: false
};

const SECTIONS_INFO = {
  'child_views': {
    title: 'Child Views (Section A)',
    description: 'The child\'s own perspective on their needs, strengths, and aspirations',
    icon: User,
    essential: true
  },
  'parent_views': {
    title: 'Parent/Carer Views (Section A)',
    description: 'Parent and family perspectives on the child\'s needs and circumstances',
    icon: Heart,
    essential: true
  },
  'educational_needs': {
    title: 'Educational Needs (Section B)',
    description: 'Specific educational needs arising from the child\'s SEND',
    icon: BookOpen,
    essential: true
  },
  'health_needs': {
    title: 'Health Needs (Section C)',
    description: 'Health-related needs and medical requirements',
    icon: Heart,
    essential: false
  },
  'social_care_needs': {
    title: 'Social Care Needs (Section D)',
    description: 'Social care and family support needs',
    icon: User,
    essential: false
  },
  'outcomes': {
    title: 'Outcomes (Section E)',
    description: 'SMART goals and targets for the child to achieve',
    icon: Target,
    essential: true
  },
  'educational_provision': {
    title: 'Educational Provision (Section F)',
    description: 'Specific educational support and interventions to be provided',
    icon: BookOpen,
    essential: true
  },
  'health_provision': {
    title: 'Health Provision (Section G)',
    description: 'Health services, therapies, and medical support',
    icon: Heart,
    essential: false
  }
};

export default function PlanGenerationWizard({ children, onClose, onPlanGenerated }: PlanGenerationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<GenerationForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const totalSteps = 5;
  const selectedChild = children.find(c => c.id === form.childId);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!form.childId) errors.childId = 'Please select a child';
        break;

      case 2:
        if (!form.localAuthority) errors.localAuthority = 'Local authority is required';
        if (!form.caseOfficerName) errors.caseOfficerName = 'Case officer name is required';
        if (!form.caseOfficerEmail) errors.caseOfficerEmail = 'Case officer email is required';
        if (form.caseOfficerEmail && !/\S+@\S+\.\S+/.test(form.caseOfficerEmail)) {
          errors.caseOfficerEmail = 'Please enter a valid email';
        }
        break;

      case 3:
        if (!form.parentInput.childViews) errors.childViews = 'Child views are required';
        if (!form.parentInput.parentViews) errors.parentViews = 'Parent views are required';
        if (!form.parentInput.aspirations) errors.aspirations = 'Aspirations are required';
        break;

      case 4:
        if (form.generateSections.length === 0) {
          errors.generateSections = 'Please select at least one section to generate';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const updateForm = (updates: Partial<GenerationForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
    // Clear validation errors for updated fields
    const errorKeys = Object.keys(updates);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      errorKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  };

  const updateParentInput = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      parentInput: {
        ...prev.parentInput,
        [field]: value
      }
    }));

    // Clear validation error
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleGenerate = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    setCurrentStep(5);
    setGenerationProgress(0);
    setGenerationStatus('Initializing AI generation...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + Math.random() * 15;

          if (newProgress > 20 && newProgress < 40) {
            setGenerationStatus('Analyzing child profile and assessments...');
          } else if (newProgress > 40 && newProgress < 60) {
            setGenerationStatus('Generating section content with AI...');
          } else if (newProgress > 60 && newProgress < 80) {
            setGenerationStatus('Creating SMART outcomes and provision...');
          } else if (newProgress > 80) {
            setGenerationStatus('Checking legal compliance...');
          }

          return Math.min(newProgress, 90);
        });
      }, 500);

      const response = await fetch('/api/ehc-plans/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        setGenerationProgress(100);
        setGenerationStatus('Plan generated successfully!');

        setTimeout(() => {
          onPlanGenerated(data.data);
        }, 1000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate plan');
      }

    } catch (error) {
      console.error('Generation error:', error);
      setGenerationStatus(`Error: ${error.message}`);

      setTimeout(() => {
        setCurrentStep(4);
        setLoading(false);
      }, 2000);
    }
  };

  const toggleSection = (sectionType: string) => {
    const isSelected = form.generateSections.includes(sectionType);
    const sectionInfo = SECTIONS_INFO[sectionType];

    // Don't allow deselecting essential sections
    if (isSelected && sectionInfo.essential) return;

    if (isSelected) {
      updateForm({
        generateSections: form.generateSections.filter(s => s !== sectionType)
      });
    } else {
      updateForm({
        generateSections: [...form.generateSections, sectionType]
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Child</h3>
              <p className="text-gray-600 mb-4">
                Choose which child you want to create an EHC plan for.
              </p>
            </div>

            {children.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No children found. Please add a child profile first.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {children.map((child) => (
                  <Card
                    key={child.id}
                    className={`cursor-pointer border-2 transition-colors ${
                      form.childId === child.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => updateForm({ childId: child.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {child.firstName} {child.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Primary Diagnosis: {child.primaryDiagnosis}
                          </p>
                        </div>
                        {form.childId === child.id && (
                          <CheckCircle2 className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {validationErrors.childId && (
              <p className="text-red-500 text-sm">{validationErrors.childId}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Plan Details</h3>
              <p className="text-gray-600 mb-4">
                Provide administrative details for the EHC plan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planType">Plan Type</Label>
                <Select value={form.planType} onValueChange={(value: any) => updateForm({ planType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial Assessment</SelectItem>
                    <SelectItem value="annual_review">Annual Review</SelectItem>
                    <SelectItem value="reassessment">Reassessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgencyLevel">Urgency Level</Label>
                <Select value={form.urgencyLevel} onValueChange={(value: any) => updateForm({ urgencyLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="localAuthority">Local Authority *</Label>
              <Input
                id="localAuthority"
                value={form.localAuthority}
                onChange={(e) => updateForm({ localAuthority: e.target.value })}
                placeholder="e.g., Birmingham City Council"
                className={validationErrors.localAuthority ? 'border-red-500' : ''}
              />
              {validationErrors.localAuthority && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.localAuthority}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="caseOfficerName">Case Officer Name *</Label>
                <Input
                  id="caseOfficerName"
                  value={form.caseOfficerName}
                  onChange={(e) => updateForm({ caseOfficerName: e.target.value })}
                  placeholder="Case officer's full name"
                  className={validationErrors.caseOfficerName ? 'border-red-500' : ''}
                />
                {validationErrors.caseOfficerName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.caseOfficerName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="caseOfficerEmail">Case Officer Email *</Label>
                <Input
                  id="caseOfficerEmail"
                  type="email"
                  value={form.caseOfficerEmail}
                  onChange={(e) => updateForm({ caseOfficerEmail: e.target.value })}
                  placeholder="officer@localauthority.gov.uk"
                  className={validationErrors.caseOfficerEmail ? 'border-red-500' : ''}
                />
                {validationErrors.caseOfficerEmail && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.caseOfficerEmail}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="tribunalDeadline">Tribunal Deadline (if applicable)</Label>
              <Input
                id="tribunalDeadline"
                type="date"
                value={form.tribunalDeadline || ''}
                onChange={(e) => updateForm({ tribunalDeadline: e.target.value })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Parent and Child Input</h3>
              <p className="text-gray-600 mb-4">
                This information helps the AI generate authentic and personalized content.
              </p>
            </div>

            {selectedChild && (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  Creating plan for: <strong>{selectedChild.firstName} {selectedChild.lastName}</strong>
                  <br />
                  Known strengths: {selectedChild.strengths.join(', ') || 'None listed'}
                  <br />
                  Current challenges: {selectedChild.challenges.join(', ') || 'None listed'}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="childViews">Child's Views and Feelings *</Label>
                <Textarea
                  id="childViews"
                  value={form.parentInput.childViews}
                  onChange={(e) => updateParentInput('childViews', e.target.value)}
                  placeholder="How does your child feel about school, friends, activities? What do they enjoy? What worries them? What are their hopes for the future?"
                  rows={4}
                  className={validationErrors.childViews ? 'border-red-500' : ''}
                />
                {validationErrors.childViews && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.childViews}</p>
                )}
              </div>

              <div>
                <Label htmlFor="parentViews">Your Views as Parent/Carer *</Label>
                <Textarea
                  id="parentViews"
                  value={form.parentInput.parentViews}
                  onChange={(e) => updateParentInput('parentViews', e.target.value)}
                  placeholder="Your perspective on your child's needs, strengths, and challenges. How does their SEND affect daily life? What support do you think they need?"
                  rows={4}
                  className={validationErrors.parentViews ? 'border-red-500' : ''}
                />
                {validationErrors.parentViews && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.parentViews}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aspirations">Aspirations and Goals *</Label>
                <Textarea
                  id="aspirations"
                  value={form.parentInput.aspirations}
                  onChange={(e) => updateParentInput('aspirations', e.target.value)}
                  placeholder="What do you and your child hope to achieve? What are your long-term goals for their education, independence, and future?"
                  rows={3}
                  className={validationErrors.aspirations ? 'border-red-500' : ''}
                />
                {validationErrors.aspirations && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.aspirations}</p>
                )}
              </div>

              <div>
                <Label htmlFor="concerns">Main Concerns</Label>
                <Textarea
                  id="concerns"
                  value={form.parentInput.concerns}
                  onChange={(e) => updateParentInput('concerns', e.target.value)}
                  placeholder="What are your biggest concerns or worries about your child's needs and support?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="homeEnvironment">Home Environment</Label>
                <Textarea
                  id="homeEnvironment"
                  value={form.parentInput.homeEnvironment}
                  onChange={(e) => updateParentInput('homeEnvironment', e.target.value)}
                  placeholder="Describe your home situation, family dynamics, and any factors that might affect your child's development or support needs."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="familyCircumstances">Family Circumstances</Label>
                <Textarea
                  id="familyCircumstances"
                  value={form.parentInput.familyCircumstances}
                  onChange={(e) => updateParentInput('familyCircumstances', e.target.value)}
                  placeholder="Any special family circumstances, cultural considerations, or important background information."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Generation Options</h3>
              <p className="text-gray-600 mb-4">
                Select which sections you want the AI to generate. Essential sections are pre-selected.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(SECTIONS_INFO).map(([sectionType, info]) => {
                const isSelected = form.generateSections.includes(sectionType);
                const Icon = info.icon;

                return (
                  <Card
                    key={sectionType}
                    className={`cursor-pointer border-2 transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${info.essential ? 'opacity-100' : ''}`}
                    onClick={() => toggleSection(sectionType)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{info.title}</h4>
                              {info.essential && (
                                <Badge variant="secondary" className="text-xs">
                                  Essential
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{info.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Checkbox
                            checked={isSelected}
                            disabled={info.essential}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {validationErrors.generateSections && (
              <p className="text-red-500 text-sm">{validationErrors.generateSections}</p>
            )}

            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                The AI will analyze your child's profile, assessment data, and your input to generate
                professional-quality, legally compliant content for each selected section.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                {generationProgress === 100 ? (
                  <CheckCircle2 className="h-12 w-12 text-white" />
                ) : (
                  <Sparkles className="h-12 w-12 text-white animate-pulse" />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">
                {generationProgress === 100 ? 'Plan Generated!' : 'Generating Your EHC Plan'}
              </h3>
              <p className="text-gray-600 mb-4">{generationStatus}</p>
            </div>

            <div className="max-w-md mx-auto">
              <Progress value={generationProgress} className="h-3" />
              <p className="text-sm text-gray-500 mt-2">{Math.round(generationProgress)}% complete</p>
            </div>

            {generationProgress === 100 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-green-600 mx-auto mb-1" />
                    <p className="text-sm">Sections Created</p>
                  </div>
                  <div className="text-center">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm">Outcomes Generated</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle2 className="h-8 w-8 text-purple-600 mx-auto mb-1" />
                    <p className="text-sm">Compliance Checked</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
            AI-Powered EHC Plan Generator
          </DialogTitle>
          <DialogDescription>
            Create a professional, legally compliant EHC plan using advanced AI technology
          </DialogDescription>
        </DialogHeader>

        {/* Progress Header */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <Badge variant="outline">{Math.round((currentStep / totalSteps) * 100)}% Complete</Badge>
            </div>
            {currentStep < 5 && (
              <div className="text-sm text-gray-500">
                Estimated time: {5 - currentStep} minutes remaining
              </div>
            )}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="py-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === 4 ? (
              <Button
                onClick={handleGenerate}
                disabled={loading || !validateStep(currentStep)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Plan with AI
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
