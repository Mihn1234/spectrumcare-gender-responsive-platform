'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Video,
  User,
  Heart,
  Brain,
  CheckCircle2,
  Star,
  Award,
  BookOpen,
  FileText,
  CreditCard,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
  MessageSquare
} from 'lucide-react';

interface Practitioner {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  specializations: string[];
  yearsExperience: number;
  qualifications: string[];
  bio: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  consultationFee: number;
  assessmentFee: number;
}

interface AssessmentProtocol {
  id: string;
  name: string;
  description: string;
  ageRangeMin: number;
  ageRangeMax: number;
  duration: number;
  components: string[];
  cost: number;
  includes: string[];
}

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  primaryDiagnosis?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  type: 'standard' | 'urgent';
  fee: number;
}

const SAMPLE_PRACTITIONERS: Practitioner[] = [
  {
    id: '1',
    title: 'Dr',
    firstName: 'Sarah',
    lastName: 'Chen',
    specializations: ['Autism Assessment', 'Functional Medicine', 'Pediatric Development'],
    yearsExperience: 12,
    qualifications: ['MBBS', 'DCH', 'Autism Diagnostic Observation Schedule (ADOS-2)', 'Functional Medicine Certified'],
    bio: 'Dr. Sarah Chen is a leading specialist in autism assessment and functional medicine approaches to neurodevelopmental conditions. She combines traditional diagnostic methods with cutting-edge biomarker analysis.',
    profileImage: '/images/dr-sarah-chen.jpg',
    rating: 4.9,
    reviewCount: 127,
    nextAvailable: '2025-01-20',
    consultationFee: 250,
    assessmentFee: 750
  },
  {
    id: '2',
    title: 'Dr',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    specializations: ['Child Psychology', 'ADHD Assessment', 'Autism Spectrum Disorders'],
    yearsExperience: 8,
    qualifications: ['PhD Clinical Psychology', 'ADOS-2 Certified', 'ADI-R Certified'],
    bio: 'Dr. Rodriguez specializes in comprehensive autism and ADHD assessments for children and adolescents, with expertise in differential diagnosis and comorbid conditions.',
    profileImage: '/images/dr-michael-rodriguez.jpg',
    rating: 4.8,
    reviewCount: 89,
    nextAvailable: '2025-01-22',
    consultationFee: 200,
    assessmentFee: 650
  }
];

const ASSESSMENT_PROTOCOLS: AssessmentProtocol[] = [
  {
    id: '1',
    name: 'Comprehensive Autism Assessment',
    description: 'Gold-standard diagnostic assessment using ADOS-2 and ADI-R',
    ageRangeMin: 2,
    ageRangeMax: 18,
    duration: 180,
    components: ['ADOS-2', 'ADI-R', 'Cognitive Assessment', 'Developmental History', 'School Observation'],
    cost: 750,
    includes: ['Detailed diagnostic report', 'Treatment recommendations', 'School liaison', '3-month follow-up']
  },
  {
    id: '2',
    name: 'Functional Medicine Assessment',
    description: 'Comprehensive biomarker analysis and nutritional assessment',
    ageRangeMin: 3,
    ageRangeMax: 18,
    duration: 120,
    components: ['Biomarker Analysis', 'Microbiome Testing', 'Nutritional Assessment', 'Metabolic Profile'],
    cost: 450,
    includes: ['Lab results interpretation', 'Personalized nutrition plan', 'Supplement recommendations', 'Monthly monitoring']
  },
  {
    id: '3',
    name: 'Initial Screening Consultation',
    description: 'Preliminary assessment to determine next steps',
    ageRangeMin: 18,
    ageRangeMax: 99,
    duration: 60,
    components: ['Developmental screening', 'Parent interview', 'Behavioral observations'],
    cost: 250,
    includes: ['Assessment summary', 'Referral recommendations', 'Resource guidance']
  }
];

export default function BookAssessmentPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>('');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentMethod, setAppointmentMethod] = useState<string>('in_person');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [children, setChildren] = useState<Child[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedPractitionerData = SAMPLE_PRACTITIONERS.find(p => p.id === selectedPractitioner);
  const selectedProtocolData = ASSESSMENT_PROTOCOLS.find(p => p.id === selectedProtocol);
  const selectedChildData = children.find(c => c.id === selectedChild);

  useEffect(() => {
    // Fetch user's children
    if (user) {
      fetchChildren();
    }
  }, [user]);

  useEffect(() => {
    // Fetch available slots when practitioner and date are selected
    if (selectedPractitioner && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedPractitioner, selectedDate]);

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(data.data);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      // Simulate API call - in real implementation, call your availability API
      const mockSlots: TimeSlot[] = [
        { time: '09:00', available: true, type: 'standard', fee: selectedPractitionerData?.assessmentFee || 0 },
        { time: '10:30', available: true, type: 'standard', fee: selectedPractitionerData?.assessmentFee || 0 },
        { time: '14:00', available: false, type: 'standard', fee: selectedPractitionerData?.assessmentFee || 0 },
        { time: '15:30', available: true, type: 'urgent', fee: (selectedPractitionerData?.assessmentFee || 0) * 1.2 },
      ];

      setTimeout(() => {
        setAvailableSlots(mockSlots);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedChild || !selectedPractitioner || !selectedProtocol || !selectedDate || !selectedTime) {
      alert('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        practitionerId: selectedPractitioner,
        childId: selectedChild,
        protocolId: selectedProtocol,
        appointmentType: 'diagnostic_assessment',
        scheduledDateTime: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(),
                                   parseInt(selectedTime.split(':')[0]), parseInt(selectedTime.split(':')[1])).toISOString(),
        durationMinutes: selectedProtocolData?.duration || 120,
        appointmentMethod,
        notes: specialRequests
      };

      const response = await fetch('/api/medical-practice/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Appointment booked successfully!');
        // Redirect to confirmation page or appointments list
      } else {
        const error = await response.json();
        alert(`Booking failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const getEligibleProtocols = (): AssessmentProtocol[] => {
    if (!selectedChildData) return ASSESSMENT_PROTOCOLS;

    const childAge = calculateAge(selectedChildData.dateOfBirth);
    return ASSESSMENT_PROTOCOLS.filter(protocol =>
      childAge >= protocol.ageRangeMin && childAge <= protocol.ageRangeMax
    );
  };

  const getTotalCost = (): number => {
    const protocolCost = selectedProtocolData?.cost || 0;
    const timeSlot = availableSlots.find(slot => slot.time === selectedTime);
    const urgentFee = timeSlot?.type === 'urgent' ? protocolCost * 0.2 : 0;
    return protocolCost + urgentFee;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧠 Book Autism Assessment
          </h1>
          <p className="text-lg text-gray-600">
            Professional autism assessments with Dr. Sarah's integrated practice
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mt-2 text-sm text-gray-600">
            <span>Select Child</span>
            <span>Choose Practitioner</span>
            <span>Assessment Type</span>
            <span>Date & Time</span>
            <span>Confirm & Pay</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Select Child */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Select Child for Assessment
                  </CardTitle>
                  <CardDescription>
                    Choose which child needs the autism assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {children.length === 0 ? (
                    <Alert>
                      <User className="h-4 w-4" />
                      <AlertDescription>
                        No children found. Please add a child profile first.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {children.map((child) => (
                        <Card
                          key={child.id}
                          className={`cursor-pointer border-2 transition-colors ${
                            selectedChild === child.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedChild(child.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">
                                  {child.firstName} {child.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Age: {calculateAge(child.dateOfBirth)} years
                                </p>
                                <p className="text-sm text-gray-600">
                                  Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                                </p>
                                {child.primaryDiagnosis && (
                                  <Badge variant="outline" className="mt-1">
                                    {child.primaryDiagnosis}
                                  </Badge>
                                )}
                              </div>
                              {selectedChild === child.id && (
                                <CheckCircle2 className="h-6 w-6 text-blue-500" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedChild}
                    >
                      Next: Choose Practitioner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Choose Practitioner */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2" />
                    Choose Your Practitioner
                  </CardTitle>
                  <CardDescription>
                    Select from our qualified autism assessment specialists
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {SAMPLE_PRACTITIONERS.map((practitioner) => (
                      <Card
                        key={practitioner.id}
                        className={`cursor-pointer border-2 transition-colors ${
                          selectedPractitioner === practitioner.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPractitioner(practitioner.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex space-x-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={practitioner.profileImage} />
                                <AvatarFallback>
                                  {practitioner.firstName[0]}{practitioner.lastName[0]}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <h4 className="text-xl font-semibold">
                                  {practitioner.title} {practitioner.firstName} {practitioner.lastName}
                                </h4>

                                <div className="flex items-center mt-1 mb-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(practitioner.rating)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">
                                      {practitioner.rating} ({practitioner.reviewCount} reviews)
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3">
                                  {practitioner.specializations.map((spec, index) => (
                                    <Badge key={index} variant="outline">{spec}</Badge>
                                  ))}
                                </div>

                                <p className="text-sm text-gray-600 mb-3">
                                  {practitioner.bio}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Experience:</span> {practitioner.yearsExperience} years
                                  </div>
                                  <div>
                                    <span className="font-medium">Next Available:</span> {new Date(practitioner.nextAvailable).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Consultation:</span> £{practitioner.consultationFee}
                                  </div>
                                  <div>
                                    <span className="font-medium">Assessment:</span> £{practitioner.assessmentFee}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {selectedPractitioner === practitioner.id && (
                              <CheckCircle2 className="h-6 w-6 text-blue-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={!selectedPractitioner}
                    >
                      Next: Assessment Type
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Assessment Type */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Choose Assessment Protocol
                  </CardTitle>
                  <CardDescription>
                    Select the most appropriate assessment for {selectedChildData?.firstName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getEligibleProtocols().map((protocol) => (
                      <Card
                        key={protocol.id}
                        className={`cursor-pointer border-2 transition-colors ${
                          selectedProtocol === protocol.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedProtocol(protocol.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{protocol.name}</h4>
                              <p className="text-gray-600 mt-1">{protocol.description}</p>

                              <div className="mt-3 space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {protocol.duration} minutes
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="h-4 w-4 mr-2" />
                                  Ages {protocol.ageRangeMin}-{protocol.ageRangeMax}
                                </div>
                              </div>

                              <div className="mt-3">
                                <h5 className="font-medium text-sm">Includes:</h5>
                                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                  {protocol.includes.map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold">£{protocol.cost}</div>
                              {selectedProtocol === protocol.id && (
                                <CheckCircle2 className="h-6 w-6 text-blue-500 mt-2" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(4)}
                      disabled={!selectedProtocol}
                    >
                      Next: Date & Time
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Date & Time */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Select Date & Time
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred appointment date and time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calendar */}
                    <div>
                      <Label className="text-base font-medium">Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date < new Date(selectedPractitionerData?.nextAvailable || '')}
                        className="rounded-md border mt-2"
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <Label className="text-base font-medium">Available Times</Label>
                      {selectedDate ? (
                        <div className="mt-2 space-y-2">
                          {loading ? (
                            <div className="text-center py-4">Loading available slots...</div>
                          ) : (
                            availableSlots.map((slot) => (
                              <Button
                                key={slot.time}
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                className={`w-full justify-between ${
                                  !slot.available ? 'opacity-50 cursor-not-allowed' : ''
                                } ${slot.type === 'urgent' ? 'border-orange-300' : ''}`}
                                disabled={!slot.available}
                                onClick={() => setSelectedTime(slot.time)}
                              >
                                <span>{slot.time}</span>
                                <div className="flex items-center gap-2">
                                  {slot.type === 'urgent' && (
                                    <Badge variant="outline" className="text-orange-600">
                                      Urgent
                                    </Badge>
                                  )}
                                  <span>£{slot.fee}</span>
                                </div>
                              </Button>
                            ))
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 text-gray-500 text-center py-8">
                          Please select a date to see available times
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Method */}
                  <div className="mt-6">
                    <Label className="text-base font-medium">Appointment Method</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {[
                        { value: 'in_person', label: 'In Person', icon: MapPin },
                        { value: 'video_call', label: 'Video Call', icon: Video },
                        { value: 'phone', label: 'Phone', icon: Phone },
                        { value: 'home_visit', label: 'Home Visit', icon: User }
                      ].map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={appointmentMethod === value ? "default" : "outline"}
                          className="h-auto p-4 flex flex-col items-center"
                          onClick={() => setAppointmentMethod(value)}
                        >
                          <Icon className="h-5 w-5 mb-2" />
                          <span className="text-sm">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="mt-6">
                    <Label htmlFor="special-requests" className="text-base font-medium">
                      Special Requests or Notes
                    </Label>
                    <Textarea
                      id="special-requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any specific requirements, accessibility needs, or questions..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(5)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Next: Confirm & Pay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Confirm Booking & Payment
                  </CardTitle>
                  <CardDescription>
                    Review your appointment details and complete payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Appointment Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Appointment Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Child:</span>
                          <span>{selectedChildData?.firstName} {selectedChildData?.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Practitioner:</span>
                          <span>{selectedPractitionerData?.title} {selectedPractitionerData?.firstName} {selectedPractitionerData?.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Assessment:</span>
                          <span>{selectedProtocolData?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date & Time:</span>
                          <span>{selectedDate?.toLocaleDateString()} at {selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{selectedProtocolData?.duration} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Method:</span>
                          <span className="capitalize">{appointmentMethod.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Cost Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Assessment Fee:</span>
                          <span>£{selectedProtocolData?.cost}</span>
                        </div>
                        {availableSlots.find(s => s.time === selectedTime)?.type === 'urgent' && (
                          <div className="flex justify-between text-orange-600">
                            <span>Urgent Booking Fee (20%):</span>
                            <span>£{((selectedProtocolData?.cost || 0) * 0.2).toFixed(2)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span>£{getTotalCost()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h4 className="font-semibold mb-3">Payment Method</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button variant="outline" className="h-auto p-4 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 mr-2" />
                          Credit/Debit Card
                        </Button>
                        <Button variant="outline" className="h-auto p-4 flex items-center justify-center">
                          <Shield className="h-5 w-5 mr-2" />
                          PayPal
                        </Button>
                      </div>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your payment is secure and encrypted. You'll receive a confirmation email with appointment details.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(4)}>
                        Back
                      </Button>
                      <Button
                        onClick={handleBooking}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {loading ? 'Processing...' : `Confirm & Pay £${getTotalCost()}`}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Practice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Dr. Sarah's Practice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Harley Street, London W1G 9PF</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>020 7123 4567</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Mon-Fri: 8:00-18:00</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-gray-500" />
                    <span>CQC Registered • GMC Certified</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h5 className="font-medium">Specializations:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Autism Spectrum Assessments</li>
                    <li>• Functional Medicine</li>
                    <li>• Biomarker Analysis</li>
                    <li>• Nutritional Therapy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  What to Expect
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div>
                  <h5 className="font-medium">Before Your Appointment:</h5>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Complete pre-assessment forms</li>
                    <li>• Gather school reports</li>
                    <li>• Prepare developmental history</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium">During Assessment:</h5>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Comprehensive evaluation</li>
                    <li>• Parent/child interviews</li>
                    <li>• Standardized assessments</li>
                    <li>• Biomarker testing (if selected)</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium">After Assessment:</h5>
                  <ul className="text-gray-600 mt-1 space-y-1">
                    <li>• Detailed diagnostic report</li>
                    <li>• Treatment recommendations</li>
                    <li>• Follow-up consultation</li>
                    <li>• EHC plan integration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-gray-600 mb-3">
                  Our support team is here to help with any questions about booking or assessments.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
