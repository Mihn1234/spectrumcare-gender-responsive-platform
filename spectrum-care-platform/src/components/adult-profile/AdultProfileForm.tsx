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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Briefcase,
  Home,
  Heart,
  Car,
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Save,
  ArrowLeft
} from 'lucide-react';

interface AdultProfileFormProps {
  initialData?: any;
  mode?: 'create' | 'edit';
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function AdultProfileForm({
  initialData,
  mode = 'create',
  onSubmit,
  onCancel
}: AdultProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // Basic Information
    dateOfBirth: initialData?.dateOfBirth || '',
    employmentStatus: initialData?.employmentStatus || '',
    livingSituation: initialData?.livingSituation || '',
    supportLevel: initialData?.supportLevel || '',
    autismDiagnosisDate: initialData?.autismDiagnosisDate || '',
    currentSupportProviders: initialData?.currentSupportProviders || [],

    // Employment Goals
    employmentGoals: {
      shortTerm: initialData?.employmentGoals?.shortTerm || [],
      longTerm: initialData?.employmentGoals?.longTerm || [],
      currentRole: initialData?.employmentGoals?.currentRole || '',
      workHours: initialData?.employmentGoals?.workHours || 0,
      supportNeeded: initialData?.employmentGoals?.supportNeeded || []
    },

    // Independent Living Skills
    independentLivingSkills: {
      cooking: {
        level: initialData?.independentLivingSkills?.cooking?.level || 'requires_support',
        support: initialData?.independentLivingSkills?.cooking?.support || ''
      },
      budgeting: {
        level: initialData?.independentLivingSkills?.budgeting?.level || 'requires_support',
        support: initialData?.independentLivingSkills?.budgeting?.support || ''
      },
      housekeeping: {
        level: initialData?.independentLivingSkills?.housekeeping?.level || 'requires_support',
        support: initialData?.independentLivingSkills?.housekeeping?.support || ''
      },
      transport: {
        level: initialData?.independentLivingSkills?.transport?.level || 'requires_support',
        support: initialData?.independentLivingSkills?.transport?.support || ''
      }
    },

    // Transport Needs
    transportNeeds: {
      currentMethod: initialData?.transportNeeds?.currentMethod || '',
      goals: initialData?.transportNeeds?.goals || '',
      barriers: initialData?.transportNeeds?.barriers || [],
      support: initialData?.transportNeeds?.support || ''
    },

    // Financial Support
    financialSupport: {
      benefits: initialData?.financialSupport?.benefits || [],
      budgetingSupport: initialData?.financialSupport?.budgetingSupport || false,
      bankingSkills: initialData?.financialSupport?.bankingSkills || '',
      financialGoals: initialData?.financialSupport?.financialGoals || []
    }
  });

  // Predefined options
  const employmentStatusOptions = [
    { value: 'employed', label: 'Employed' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'student', label: 'Student' },
    { value: 'retired', label: 'Retired' },
    { value: 'supported_employment', label: 'Supported Employment' }
  ];

  const livingSituationOptions = [
    { value: 'independent', label: 'Independent Living' },
    { value: 'supported', label: 'Supported Living' },
    { value: 'family', label: 'Living with Family' },
    { value: 'care_home', label: 'Care Home' },
    { value: 'transitional', label: 'Transitional Housing' }
  ];

  const supportLevelOptions = [
    { value: 'minimal', label: 'Minimal Support' },
    { value: 'moderate', label: 'Moderate Support' },
    { value: 'substantial', label: 'Substantial Support' },
    { value: 'critical', label: 'Critical Support' }
  ];

  const skillLevelOptions = [
    { value: 'independent', label: 'Independent' },
    { value: 'developing', label: 'Developing' },
    { value: 'requires_support', label: 'Requires Support' }
  ];

  const benefitsOptions = [
    'Personal Independence Payment (PIP)',
    'Employment and Support Allowance (ESA)',
    'Universal Credit',
    'Disability Living Allowance (DLA)',
    'Attendance Allowance',
    'Housing Benefit'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      const url = mode === 'edit' && initialData?.id
        ? `/api/adults/profiles/${initialData.id}`
        : '/api/adults/profiles';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save adult profile');
      }

      setSuccess(`Adult profile ${mode === 'edit' ? 'updated' : 'created'} successfully!`);

      if (onSubmit) {
        onSubmit(data.data);
      } else {
        // Redirect to adult dashboard or profile view
        setTimeout(() => {
          router.push('/dashboard?tab=adults');
        }, 1500);
      }

    } catch (error) {
      console.error('Error saving adult profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to save adult profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addArrayItem = (path: string, item: string) => {
    const pathParts = path.split('.');
    const newData = { ...formData };
    let current: any = newData;

    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }

    const finalKey = pathParts[pathParts.length - 1];
    if (!current[finalKey]) current[finalKey] = [];
    current[finalKey].push(item);

    setFormData(newData);
  };

  const removeArrayItem = (path: string, index: number) => {
    const pathParts = path.split('.');
    const newData = { ...formData };
    let current: any = newData;

    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }

    const finalKey = pathParts[pathParts.length - 1];
    current[finalKey].splice(index, 1);

    setFormData(newData);
  };

  const calculateIndependenceScore = () => {
    const skills = formData.independentLivingSkills;
    const scores = Object.values(skills).map((skill: any) => {
      switch (skill.level) {
        case 'independent': return 100;
        case 'developing': return 60;
        case 'requires_support': return 20;
        default: return 0;
      }
    });
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onCancel || (() => router.back())}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Adult Profile' : 'Create Adult Profile'}
            </h1>
            <p className="text-gray-600">
              Comprehensive support planning for autistic adults
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-blue-600">
            Adult Services
          </Badge>
          <Badge variant="outline" className="text-green-600">
            Independence Score: {calculateIndependenceScore()}%
          </Badge>
        </div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Employment
            </TabsTrigger>
            <TabsTrigger value="living" className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Living Skills
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex items-center">
              <Car className="h-4 w-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Financial
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential information about the adult's current situation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="autismDiagnosisDate">Autism Diagnosis Date</Label>
                    <Input
                      id="autismDiagnosisDate"
                      type="date"
                      value={formData.autismDiagnosisDate}
                      onChange={(e) => setFormData({...formData, autismDiagnosisDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Select
                      value={formData.employmentStatus}
                      onValueChange={(value) => setFormData({...formData, employmentStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentStatusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="livingSituation">Living Situation</Label>
                    <Select
                      value={formData.livingSituation}
                      onValueChange={(value) => setFormData({...formData, livingSituation: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select living situation" />
                      </SelectTrigger>
                      <SelectContent>
                        {livingSituationOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="supportLevel">Support Level</Label>
                    <Select
                      value={formData.supportLevel}
                      onValueChange={(value) => setFormData({...formData, supportLevel: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select support level" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportLevelOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employment Goals & Support</CardTitle>
                <CardDescription>
                  Career aspirations and workplace support needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentRole">Current Role</Label>
                    <Input
                      id="currentRole"
                      value={formData.employmentGoals.currentRole}
                      onChange={(e) => setFormData({
                        ...formData,
                        employmentGoals: {
                          ...formData.employmentGoals,
                          currentRole: e.target.value
                        }
                      })}
                      placeholder="e.g., Retail Assistant"
                    />
                  </div>

                  <div>
                    <Label htmlFor="workHours">Weekly Work Hours</Label>
                    <Input
                      id="workHours"
                      type="number"
                      min="0"
                      max="40"
                      value={formData.employmentGoals.workHours}
                      onChange={(e) => setFormData({
                        ...formData,
                        employmentGoals: {
                          ...formData.employmentGoals,
                          workHours: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Short-term Goals (next 6-12 months)</Label>
                  <div className="space-y-2">
                    {formData.employmentGoals.shortTerm.map((goal: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input value={goal} readOnly />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('employmentGoals.shortTerm', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add short-term goal"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addArrayItem('employmentGoals.shortTerm', input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add short-term goal"]') as HTMLInputElement;
                          if (input?.value.trim()) {
                            addArrayItem('employmentGoals.shortTerm', input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Living Skills Tab */}
          <TabsContent value="living" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Independent Living Skills</CardTitle>
                <CardDescription>
                  Assessment of daily living capabilities and support needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Independence</span>
                    <span className="text-sm text-gray-600">{calculateIndependenceScore()}%</span>
                  </div>
                  <Progress value={calculateIndependenceScore()} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(formData.independentLivingSkills).map(([skill, data]) => (
                    <Card key={skill} className="p-4">
                      <h4 className="font-medium mb-3 capitalize">{skill}</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`${skill}-level`}>Skill Level</Label>
                          <Select
                            value={data.level}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              independentLivingSkills: {
                                ...formData.independentLivingSkills,
                                [skill]: { ...data, level: value }
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {skillLevelOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`${skill}-support`}>Support Needed</Label>
                          <Input
                            id={`${skill}-support`}
                            value={data.support}
                            onChange={(e) => setFormData({
                              ...formData,
                              independentLivingSkills: {
                                ...formData.independentLivingSkills,
                                [skill]: { ...data, support: e.target.value }
                              }
                            })}
                            placeholder="Describe support needed"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Support Providers</CardTitle>
                <CardDescription>
                  Organizations and services currently providing support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Support Providers</Label>
                  <div className="space-y-2">
                    {formData.currentSupportProviders.map((provider: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input value={provider} readOnly />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArrayItem('currentSupportProviders', index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add support provider"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addArrayItem('currentSupportProviders', input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add support provider"]') as HTMLInputElement;
                          if (input?.value.trim()) {
                            addArrayItem('currentSupportProviders', input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transport & Mobility</CardTitle>
                <CardDescription>
                  Current transport arrangements and mobility goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentMethod">Current Transport Method</Label>
                    <Input
                      id="currentMethod"
                      value={formData.transportNeeds.currentMethod}
                      onChange={(e) => setFormData({
                        ...formData,
                        transportNeeds: {
                          ...formData.transportNeeds,
                          currentMethod: e.target.value
                        }
                      })}
                      placeholder="e.g., Family support, Public transport"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transportGoals">Transport Goals</Label>
                    <Input
                      id="transportGoals"
                      value={formData.transportNeeds.goals}
                      onChange={(e) => setFormData({
                        ...formData,
                        transportNeeds: {
                          ...formData.transportNeeds,
                          goals: e.target.value
                        }
                      })}
                      placeholder="e.g., Independent public transport use"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="transportSupport">Support Programme</Label>
                    <Input
                      id="transportSupport"
                      value={formData.transportNeeds.support}
                      onChange={(e) => setFormData({
                        ...formData,
                        transportNeeds: {
                          ...formData.transportNeeds,
                          support: e.target.value
                        }
                      })}
                      placeholder="e.g., Travel training programme"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Support & Goals</CardTitle>
                <CardDescription>
                  Benefits, financial skills, and money management goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Current Benefits</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {benefitsOptions.map((benefit) => (
                      <div key={benefit} className="flex items-center space-x-2">
                        <Checkbox
                          id={benefit}
                          checked={formData.financialSupport.benefits.includes(benefit)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                financialSupport: {
                                  ...formData.financialSupport,
                                  benefits: [...formData.financialSupport.benefits, benefit]
                                }
                              });
                            } else {
                              setFormData({
                                ...formData,
                                financialSupport: {
                                  ...formData.financialSupport,
                                  benefits: formData.financialSupport.benefits.filter((b: string) => b !== benefit)
                                }
                              });
                            }
                          }}
                        />
                        <Label htmlFor={benefit} className="text-sm">
                          {benefit}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankingSkills">Banking Skills Level</Label>
                    <Select
                      value={formData.financialSupport.bankingSkills}
                      onValueChange={(value) => setFormData({
                        ...formData,
                        financialSupport: {
                          ...formData.financialSupport,
                          bankingSkills: value
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select banking skills level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="independent">Independent</SelectItem>
                        <SelectItem value="developing">Developing</SelectItem>
                        <SelectItem value="requires_support">Requires Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="budgetingSupport"
                      checked={formData.financialSupport.budgetingSupport}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        financialSupport: {
                          ...formData.financialSupport,
                          budgetingSupport: checked === true
                        }
                      })}
                    />
                    <Label htmlFor="budgetingSupport">
                      Receives budgeting support
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'edit' ? 'Update Profile' : 'Create Profile'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
