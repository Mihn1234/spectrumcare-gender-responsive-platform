'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Calendar,
  MapPin,
  Heart,
  Brain,
  FileText,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  School,
  Stethoscope
} from 'lucide-react';
import { Child, Diagnosis, Need, NeedCategory } from '@/types';

interface ChildProfileFormProps {
  child?: Child;
  onSave?: (child: Child) => void;
  onCancel?: () => void;
}

export function ChildProfileForm({ child, onSave, onCancel }: ChildProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: child?.firstName || '',
    lastName: child?.lastName || '',
    dateOfBirth: child?.dateOfBirth ? child.dateOfBirth.toISOString().split('T')[0] : '',
    schoolName: '',
    schoolType: '',
    currentYear: '',
    medicalConditions: child?.diagnoses || [],
    currentNeeds: child?.currentNeeds || [],
    allergies: '',
    medications: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    gp: {
      name: '',
      practice: '',
      phone: ''
    },
    localAuthority: '',
    ehcPlanStatus: '',
    additionalNotes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const needCategories: { value: NeedCategory; label: string; description: string }[] = [
    { value: 'communication', label: 'Communication', description: 'Speech, language, and communication needs' },
    { value: 'social_emotional', label: 'Social & Emotional', description: 'Social skills and emotional regulation' },
    { value: 'sensory', label: 'Sensory', description: 'Sensory processing and integration needs' },
    { value: 'behavioral', label: 'Behavioral', description: 'Behavior management and support' },
    { value: 'academic', label: 'Academic', description: 'Learning and educational support' },
    { value: 'physical', label: 'Physical', description: 'Motor skills and physical development' },
    { value: 'medical', label: 'Medical', description: 'Health and medical needs' },
    { value: 'daily_living', label: 'Daily Living', description: 'Self-care and independence skills' },
    { value: 'independence', label: 'Independence', description: 'Life skills and autonomy development' }
  ];

  const addDiagnosis = () => {
    const newDiagnosis: Diagnosis = {
      id: Date.now().toString(),
      condition: '',
      diagnosedBy: '',
      diagnosedDate: new Date(),
      notes: '',
      supportingDocuments: []
    };
    setFormData(prev => ({
      ...prev,
      medicalConditions: [...prev.medicalConditions, newDiagnosis]
    }));
  };

  const updateDiagnosis = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.map((diagnosis, i) =>
        i === index ? { ...diagnosis, [field]: value } : diagnosis
      )
    }));
  };

  const removeDiagnosis = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
    }));
  };

  const addNeed = () => {
    const newNeed: Need = {
      id: Date.now().toString(),
      category: 'communication',
      description: '',
      priority: 'medium',
      identifiedBy: '',
      identifiedDate: new Date(),
      status: 'identified'
    };
    setFormData(prev => ({
      ...prev,
      currentNeeds: [...prev.currentNeeds, newNeed]
    }));
  };

  const updateNeed = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      currentNeeds: prev.currentNeeds.map((need, i) =>
        i === index ? { ...need, [field]: value } : need
      )
    }));
  };

  const removeNeed = (index: number) => {
    setFormData(prev => ({
      ...prev,
      currentNeeds: prev.currentNeeds.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form
      const newErrors: Record<string, string> = {};

      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Create child object
      const childData: Child = {
        id: child?.id || Date.now().toString(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: new Date(formData.dateOfBirth),
        parentIds: child?.parentIds || [],
        diagnoses: formData.medicalConditions,
        assessments: child?.assessments || [],
        interventions: child?.interventions || [],
        documents: child?.documents || [],
        timeline: child?.timeline || [],
        currentNeeds: formData.currentNeeds,
        supportNetwork: child?.supportNetwork || [],
        createdAt: child?.createdAt || new Date(),
        updatedAt: new Date()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      onSave?.(childData);
    } catch (error) {
      setErrors({ general: 'Failed to save child profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {child ? 'Edit Child Profile' : 'Add New Child Profile'}
              </CardTitle>
              <CardDescription>
                Complete information about the child to enable comprehensive support planning
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {errors.general && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="needs">Current Needs</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                      className={errors.firstName ? 'border-red-300' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                      className={errors.lastName ? 'border-red-300' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className={`pl-10 ${errors.dateOfBirth ? 'border-red-300' : ''}`}
                      />
                    </div>
                    {errors.dateOfBirth && <p className="text-sm text-red-600">{errors.dateOfBirth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="localAuthority">Local Authority</Label>
                    <Select value={formData.localAuthority} onValueChange={(value) => setFormData(prev => ({ ...prev, localAuthority: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select local authority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birmingham">Birmingham City Council</SelectItem>
                        <SelectItem value="walsall">Walsall Council</SelectItem>
                        <SelectItem value="sandwell">Sandwell Council</SelectItem>
                        <SelectItem value="wolverhampton">City of Wolverhampton Council</SelectItem>
                        <SelectItem value="dudley">Dudley Council</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    placeholder="Any additional information about the child that might be helpful for support planning..."
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Medical Conditions & Diagnoses</h3>
                    <p className="text-sm text-slate-600">Add all relevant medical conditions and diagnoses</p>
                  </div>
                  <Button type="button" onClick={addDiagnosis} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Diagnosis
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.medicalConditions.map((diagnosis, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium text-slate-900">Diagnosis {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDiagnosis(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Condition/Diagnosis</Label>
                          <Input
                            value={diagnosis.condition}
                            onChange={(e) => updateDiagnosis(index, 'condition', e.target.value)}
                            placeholder="e.g., Autism Spectrum Disorder"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Diagnosed By</Label>
                          <Input
                            value={diagnosis.diagnosedBy}
                            onChange={(e) => updateDiagnosis(index, 'diagnosedBy', e.target.value)}
                            placeholder="e.g., Dr. Smith, Pediatrician"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Date of Diagnosis</Label>
                          <Input
                            type="date"
                            value={diagnosis.diagnosedDate.toISOString().split('T')[0]}
                            onChange={(e) => updateDiagnosis(index, 'diagnosedDate', new Date(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Severity (if applicable)</Label>
                          <Select
                            value={diagnosis.severity || ''}
                            onValueChange={(value) => updateDiagnosis(index, 'severity', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mild">Mild</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="severe">Severe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Notes</Label>
                          <Textarea
                            value={diagnosis.notes}
                            onChange={(e) => updateDiagnosis(index, 'notes', e.target.value)}
                            placeholder="Additional notes about this diagnosis..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {formData.medicalConditions.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No medical conditions added yet</p>
                      <p className="text-sm">Click "Add Diagnosis" to get started</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="needs" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Current Support Needs</h3>
                    <p className="text-sm text-slate-600">Identify areas where the child requires support</p>
                  </div>
                  <Button type="button" onClick={addNeed} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Need
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.currentNeeds.map((need, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-slate-900">Need {index + 1}</h4>
                          <Badge className={getPriorityColor(need.priority)}>
                            {need.priority}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNeed(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={need.category}
                            onValueChange={(value: NeedCategory) => updateNeed(index, 'category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {needCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  <div>
                                    <div className="font-medium">{category.label}</div>
                                    <div className="text-xs text-slate-500">{category.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={need.priority}
                            onValueChange={(value) => updateNeed(index, 'priority', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Description</Label>
                          <Textarea
                            value={need.description}
                            onChange={(e) => updateNeed(index, 'description', e.target.value)}
                            placeholder="Describe the specific support need..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Identified By</Label>
                          <Input
                            value={need.identifiedBy}
                            onChange={(e) => updateNeed(index, 'identifiedBy', e.target.value)}
                            placeholder="Who identified this need?"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Date Identified</Label>
                          <Input
                            type="date"
                            value={need.identifiedDate.toISOString().split('T')[0]}
                            onChange={(e) => updateNeed(index, 'identifiedDate', new Date(e.target.value))}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {formData.currentNeeds.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No support needs identified yet</p>
                      <p className="text-sm">Click "Add Need" to get started</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="schoolName"
                        value={formData.schoolName}
                        onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                        placeholder="Enter school name"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolType">School Type</Label>
                    <Select value={formData.schoolType} onValueChange={(value) => setFormData(prev => ({ ...prev, schoolType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mainstream">Mainstream School</SelectItem>
                        <SelectItem value="special">Special School</SelectItem>
                        <SelectItem value="independent">Independent School</SelectItem>
                        <SelectItem value="alternative">Alternative Provision</SelectItem>
                        <SelectItem value="homeschool">Home Education</SelectItem>
                        <SelectItem value="none">Not in Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentYear">Current Year Group</Label>
                    <Select value={formData.currentYear} onValueChange={(value) => setFormData(prev => ({ ...prev, currentYear: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nursery">Nursery</SelectItem>
                        <SelectItem value="reception">Reception</SelectItem>
                        <SelectItem value="year1">Year 1</SelectItem>
                        <SelectItem value="year2">Year 2</SelectItem>
                        <SelectItem value="year3">Year 3</SelectItem>
                        <SelectItem value="year4">Year 4</SelectItem>
                        <SelectItem value="year5">Year 5</SelectItem>
                        <SelectItem value="year6">Year 6</SelectItem>
                        <SelectItem value="year7">Year 7</SelectItem>
                        <SelectItem value="year8">Year 8</SelectItem>
                        <SelectItem value="year9">Year 9</SelectItem>
                        <SelectItem value="year10">Year 10</SelectItem>
                        <SelectItem value="year11">Year 11</SelectItem>
                        <SelectItem value="year12">Year 12</SelectItem>
                        <SelectItem value="year13">Year 13</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ehcPlanStatus">EHC Plan Status</Label>
                    <Select value={formData.ehcPlanStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, ehcPlanStatus: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select EHC plan status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No EHC Plan</SelectItem>
                        <SelectItem value="considering">Considering Request</SelectItem>
                        <SelectItem value="requested">Assessment Requested</SelectItem>
                        <SelectItem value="assessment">Under Assessment</SelectItem>
                        <SelectItem value="draft">Draft Plan Received</SelectItem>
                        <SelectItem value="active">Active Plan</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                        <SelectItem value="appeal">Under Appeal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Emergency Contact</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={formData.emergencyContact.name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                          }))}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Relationship</Label>
                        <Input
                          value={formData.emergencyContact.relationship}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                          }))}
                          placeholder="e.g., Mother, Father, Guardian"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={formData.emergencyContact.phone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                          }))}
                          placeholder="Mobile number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={formData.emergencyContact.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, email: e.target.value }
                          }))}
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">GP Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>GP Name</Label>
                        <Input
                          value={formData.gp.name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            gp: { ...prev.gp, name: e.target.value }
                          }))}
                          placeholder="Dr. name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Practice Name</Label>
                        <Input
                          value={formData.gp.practice}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            gp: { ...prev.gp, practice: e.target.value }
                          }))}
                          placeholder="Medical practice name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Practice Phone</Label>
                        <Input
                          value={formData.gp.phone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            gp: { ...prev.gp, phone: e.target.value }
                          }))}
                          placeholder="Practice phone number"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{child ? 'Update Profile' : 'Create Profile'}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
