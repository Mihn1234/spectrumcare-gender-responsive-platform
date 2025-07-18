'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Loader2, Calendar, Clock, MapPin, ArrowLeft, Save, User, Star } from 'lucide-react';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
}

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specializations: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  serviceTypes: string[];
}

export default function BookAssessmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  const [formData, setFormData] = useState({
    childId: '',
    professionalId: '',
    assessmentType: 'autism_diagnostic',
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: '180',
    location: '',
    notes: '',
    fundingSource: ''
  });

  const loadChildren = useCallback(async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/children', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  }, [router]);

  const loadProfessionals = useCallback(async () => {
    try {
      const response = await fetch('/api/professionals');

      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load professionals:', error);
    }
  }, []);

  useEffect(() => {
    loadChildren();
    loadProfessionals();
  }, [loadChildren, loadProfessionals]);

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

      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ...formData,
          scheduledDate: scheduledDateTime,
          durationMinutes: parseInt(formData.durationMinutes)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book assessment');
      }

      setSuccess('Assessment booked successfully!');
      setTimeout(() => {
        router.push('/dashboard?tab=assessments');
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book assessment');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProfessional = professionals.find(p => p.id === formData.professionalId);
  const estimatedCost = selectedProfessional ? selectedProfessional.hourlyRate * (parseInt(formData.durationMinutes) / 60) : 0;

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
          <h1 className="text-3xl font-bold text-gray-900">Book Assessment</h1>
          <p className="text-gray-600">Schedule a professional assessment with our network of specialists</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Child</CardTitle>
              <CardDescription>
                Choose which child this assessment is for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="childId">Child *</Label>
                <Select
                  value={formData.childId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, childId: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.firstName} {child.lastName} (Age {child.age})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {children.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No children found. <Link href="/children/add" className="text-blue-600 hover:underline">Add a child profile first</Link>.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Type */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>
                Specify the type and details of the assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assessmentType">Assessment Type *</Label>
                  <Select
                    value={formData.assessmentType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assessmentType: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autism_diagnostic">Autism Diagnostic Assessment</SelectItem>
                      <SelectItem value="cognitive">Cognitive Assessment</SelectItem>
                      <SelectItem value="educational">Educational Assessment</SelectItem>
                      <SelectItem value="speech_language">Speech & Language Assessment</SelectItem>
                      <SelectItem value="occupational_therapy">Occupational Therapy Assessment</SelectItem>
                      <SelectItem value="behavioural">Behavioural Assessment</SelectItem>
                      <SelectItem value="social_communication">Social Communication Assessment</SelectItem>
                      <SelectItem value="sensory_processing">Sensory Processing Assessment</SelectItem>
                      <SelectItem value="adaptive_behavior">Adaptive Behavior Assessment</SelectItem>
                      <SelectItem value="mental_health">Mental Health Assessment</SelectItem>
                      <SelectItem value="developmental">Developmental Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="durationMinutes">Duration *</Label>
                  <Select
                    value={formData.durationMinutes}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, durationMinutes: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="360">6 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fundingSource">Funding Source</Label>
                <Select
                  value={formData.fundingSource}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, fundingSource: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select funding source (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Self-funded</SelectItem>
                    <SelectItem value="nhs">NHS</SelectItem>
                    <SelectItem value="local_authority">Local Authority</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="private_insurance">Private Insurance</SelectItem>
                    <SelectItem value="charity">Charity/Grant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Professional Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Professional</CardTitle>
              <CardDescription>
                Choose from our network of qualified specialists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="professionalId">Professional *</Label>
                  <Select
                    value={formData.professionalId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, professionalId: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a professional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={professional.id}>
                          {professional.fullName} - £{professional.hourlyRate}/hour
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProfessional && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <User className="h-8 w-8 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">{selectedProfessional.fullName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-blue-700">
                            {selectedProfessional.rating?.toFixed(1) || 'New'} ({selectedProfessional.reviewCount || 0} reviews)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedProfessional.specializations?.map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-blue-700 mt-2">
                          Rate: £{selectedProfessional.hourlyRate}/hour
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {professionals.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No professionals available. Our network is currently being built.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Choose your preferred date and time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    required
                    disabled={isLoading}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="scheduledTime">Time *</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Birmingham Children's Hospital, Professional's Clinic"
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Any special requirements or notes for the assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special requirements, concerns, or information the professional should know..."
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          {selectedProfessional && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">Cost Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Professional rate:</span>
                    <span>£{selectedProfessional.hourlyRate}/hour</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{parseInt(formData.durationMinutes) / 60} hours</span>
                  </div>
                  <div className="flex justify-between font-medium text-green-900 border-t pt-2">
                    <span>Estimated total:</span>
                    <span>£{estimatedCost.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    * Final cost may vary based on actual session duration and additional services
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading || children.length === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Calendar className="mr-2 h-4 w-4" />
              Book Assessment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
