'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, ArrowLeft, Save } from 'lucide-react';

interface MedicalCondition {
  condition: string;
  diagnosedBy: string;
  diagnosedDate: string;
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

interface CurrentNeed {
  category: 'communication' | 'social_emotional' | 'sensory' | 'behavioral' | 'academic' | 'physical' | 'medical' | 'daily_living' | 'independence';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  identifiedBy?: string;
  identifiedDate: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export default function AddChildPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nhsNumber: '',
    localAuthority: '',
    schoolName: '',
    currentYearGroup: ''
  });

  const [medicalConditions, setMedicalConditions] = useState<MedicalCondition[]>([]);
  const [currentNeeds, setCurrentNeeds] = useState<CurrentNeed[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
          medicalConditions: medicalConditions.map(mc => ({
            ...mc,
            diagnosedDate: new Date(mc.diagnosedDate).toISOString()
          })),
          currentNeeds: currentNeeds.map(cn => ({
            ...cn,
            identifiedDate: new Date(cn.identifiedDate).toISOString()
          })),
          emergencyContacts
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create child profile');
      }

      setSuccess('Child profile created successfully!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create child profile');
    } finally {
      setIsLoading(false);
    }
  };

  const addMedicalCondition = () => {
    setMedicalConditions([...medicalConditions, {
      condition: '',
      diagnosedBy: '',
      diagnosedDate: new Date().toISOString().split('T')[0],
      severity: 'mild',
      notes: ''
    }]);
  };

  const removeMedicalCondition = (index: number) => {
    setMedicalConditions(medicalConditions.filter((_, i) => i !== index));
  };

  const updateMedicalCondition = (index: number, field: keyof MedicalCondition, value: string) => {
    const updated = [...medicalConditions];
    updated[index] = { ...updated[index], [field]: value };
    setMedicalConditions(updated);
  };

  const addCurrentNeed = () => {
    setCurrentNeeds([...currentNeeds, {
      category: 'communication',
      description: '',
      priority: 'medium',
      identifiedBy: '',
      identifiedDate: new Date().toISOString().split('T')[0]
    }]);
  };

  const removeCurrentNeed = (index: number) => {
    setCurrentNeeds(currentNeeds.filter((_, i) => i !== index));
  };

  const updateCurrentNeed = (index: number, field: keyof CurrentNeed, value: string) => {
    const updated = [...currentNeeds];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentNeeds(updated);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }]);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add Child Profile</h1>
          <p className="text-gray-600">Create a comprehensive profile for autism support and case management</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about the child
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="nhsNumber">NHS Number</Label>
                  <Input
                    id="nhsNumber"
                    value={formData.nhsNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, nhsNumber: e.target.value }))}
                    placeholder="e.g., 123 456 7890"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localAuthority">Local Authority</Label>
                  <Input
                    id="localAuthority"
                    value={formData.localAuthority}
                    onChange={(e) => setFormData(prev => ({ ...prev, localAuthority: e.target.value }))}
                    placeholder="e.g., Birmingham City Council"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="currentYearGroup">Current Year Group</Label>
                  <Input
                    id="currentYearGroup"
                    value={formData.currentYearGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentYearGroup: e.target.value }))}
                    placeholder="e.g., Year 5"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="e.g., Greenfield Primary School"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Conditions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical Conditions</CardTitle>
                  <CardDescription>
                    Diagnosed conditions and medical history
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedicalCondition}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {medicalConditions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No medical conditions added yet</p>
              ) : (
                <div className="space-y-4">
                  {medicalConditions.map((condition, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Medical Condition {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedicalCondition(index)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Condition *</Label>
                          <Input
                            value={condition.condition}
                            onChange={(e) => updateMedicalCondition(index, 'condition', e.target.value)}
                            placeholder="e.g., Autism Spectrum Disorder"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label>Diagnosed By *</Label>
                          <Input
                            value={condition.diagnosedBy}
                            onChange={(e) => updateMedicalCondition(index, 'diagnosedBy', e.target.value)}
                            placeholder="e.g., Dr. Smith, Consultant Paediatrician"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Diagnosis Date *</Label>
                          <Input
                            type="date"
                            value={condition.diagnosedDate}
                            onChange={(e) => updateMedicalCondition(index, 'diagnosedDate', e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label>Severity</Label>
                          <Select
                            value={condition.severity}
                            onValueChange={(value) => updateMedicalCondition(index, 'severity', value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mild">Mild</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="severe">Severe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={condition.notes}
                          onChange={(e) => updateMedicalCondition(index, 'notes', e.target.value)}
                          placeholder="Additional information about the condition..."
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Needs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Support Needs</CardTitle>
                  <CardDescription>
                    Identified areas where the child needs support
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCurrentNeed}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Need
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentNeeds.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No support needs added yet</p>
              ) : (
                <div className="space-y-4">
                  {currentNeeds.map((need, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Support Need {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCurrentNeed(index)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Category *</Label>
                          <Select
                            value={need.category}
                            onValueChange={(value) => updateCurrentNeed(index, 'category', value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="communication">Communication</SelectItem>
                              <SelectItem value="social_emotional">Social & Emotional</SelectItem>
                              <SelectItem value="sensory">Sensory</SelectItem>
                              <SelectItem value="behavioral">Behavioral</SelectItem>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="physical">Physical</SelectItem>
                              <SelectItem value="medical">Medical</SelectItem>
                              <SelectItem value="daily_living">Daily Living</SelectItem>
                              <SelectItem value="independence">Independence</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priority *</Label>
                          <Select
                            value={need.priority}
                            onValueChange={(value) => updateCurrentNeed(index, 'priority', value)}
                            disabled={isLoading}
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
                      </div>

                      <div>
                        <Label>Description *</Label>
                        <Textarea
                          value={need.description}
                          onChange={(e) => updateCurrentNeed(index, 'description', e.target.value)}
                          placeholder="Describe the specific support need..."
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Identified By</Label>
                          <Input
                            value={need.identifiedBy}
                            onChange={(e) => updateCurrentNeed(index, 'identifiedBy', e.target.value)}
                            placeholder="e.g., School SENCO"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label>Date Identified *</Label>
                          <Input
                            type="date"
                            value={need.identifiedDate}
                            onChange={(e) => updateCurrentNeed(index, 'identifiedDate', e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Emergency Contacts</CardTitle>
                  <CardDescription>
                    People to contact in case of emergency
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmergencyContact}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {emergencyContacts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No emergency contacts added yet</p>
              ) : (
                <div className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Emergency Contact {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmergencyContact(index)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={contact.name}
                            onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                            placeholder="Full name"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label>Relationship *</Label>
                          <Input
                            value={contact.relationship}
                            onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                            placeholder="e.g., Mother, Father, Guardian"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Phone Number *</Label>
                          <Input
                            value={contact.phone}
                            onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                            placeholder="+44 123 456 7890"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label>Email (Optional)</Label>
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateEmergencyContact(index, 'email', e.target.value)}
                            placeholder="email@example.com"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Create Child Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
