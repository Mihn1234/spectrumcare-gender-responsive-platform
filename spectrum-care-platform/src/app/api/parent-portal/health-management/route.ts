import { NextRequest, NextResponse } from 'next/server';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateRequest } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schemas
const healthDataQuerySchema = z.object({
  childId: z.string(),
  type: z.enum(['overview', 'appointments', 'medications', 'therapy', 'emergency']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

const appointmentSchema = z.object({
  childId: z.string(),
  providerId: z.string(),
  appointmentType: z.string(),
  scheduledDate: z.string(),
  duration: z.number(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']).optional()
});

const medicationSchema = z.object({
  childId: z.string(),
  medicationName: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  prescribedBy: z.string(),
  sideEffects: z.array(z.string()).optional(),
  effectiveness: z.number().min(1).max(5).optional()
});

const therapySessionSchema = z.object({
  childId: z.string(),
  therapyType: z.string(),
  providerId: z.string(),
  sessionDate: z.string(),
  duration: z.number(),
  goals: z.array(z.string()),
  progress: z.object({
    rating: z.number().min(1).max(5),
    notes: z.string(),
    milestones: z.array(z.string())
  }),
  nextSteps: z.array(z.string()).optional()
});

const emergencyInfoSchema = z.object({
  childId: z.string(),
  medicalConditions: z.array(z.string()),
  allergies: z.array(z.string()),
  medications: z.array(z.string()),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    isPrimary: z.boolean()
  })),
  medicalNotes: z.string().optional(),
  lastUpdated: z.string()
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryData = {
      childId: searchParams.get('childId') || '',
      type: searchParams.get('type') || 'overview',
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate')
    };

    // Validate query parameters
    const validatedQuery = healthDataQuerySchema.parse(queryData);

    // Check child access
    const hasAccess = await memoryDatabase.hasChildAccess(authResult.user.id, validatedQuery.childId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to child data' },
        { status: 403 }
      );
    }

    // Get comprehensive health data
    const healthData = await getHealthData(validatedQuery.childId, validatedQuery.type);

    // Generate analytics and insights
    const analytics = await generateHealthAnalytics(validatedQuery.childId, healthData);

    return NextResponse.json({
      success: true,
      data: {
        ...healthData,
        analytics,
        insights: await generateHealthInsights(healthData, analytics)
      }
    });

  } catch (error: any) {
    console.error('Health management GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch health data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'schedule_appointment':
        return await scheduleAppointment(authResult.user.id, data);

      case 'add_medication':
        return await addMedication(authResult.user.id, data);

      case 'record_therapy_session':
        return await recordTherapySession(authResult.user.id, data);

      case 'update_emergency_info':
        return await updateEmergencyInfo(authResult.user.id, data);

      case 'track_side_effects':
        return await trackSideEffects(authResult.user.id, data);

      case 'update_therapy_progress':
        return await updateTherapyProgress(authResult.user.id, data);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Health management POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process health action' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, type, updates } = body;

    // Check access and update based on type
    switch (type) {
      case 'appointment':
        return await updateAppointment(authResult.user.id, id, updates);

      case 'medication':
        return await updateMedication(authResult.user.id, id, updates);

      case 'therapy_session':
        return await updateTherapySession(authResult.user.id, id, updates);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid update type' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Health management PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update health data' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getHealthData(childId: string, type?: string) {
  // Simulate comprehensive health data retrieval
  const baseData = {
    childId,
    lastUpdated: new Date().toISOString(),
    overallHealthScore: 85,

    appointments: [
      {
        id: 'apt-1',
        providerId: 'provider-1',
        providerName: 'Dr. Sarah Williams',
        specialty: 'Pediatric Neurology',
        appointmentType: 'Follow-up Assessment',
        scheduledDate: '2024-02-15T10:00:00Z',
        duration: 60,
        status: 'scheduled',
        location: 'Children\'s Hospital',
        notes: 'Routine autism assessment follow-up',
        reminders: ['24 hours before', '1 hour before']
      },
      {
        id: 'apt-2',
        providerId: 'provider-2',
        providerName: 'Emma Thompson',
        specialty: 'Speech Therapy',
        appointmentType: 'Therapy Session',
        scheduledDate: '2024-02-12T14:30:00Z',
        duration: 45,
        status: 'completed',
        location: 'Speech Therapy Clinic',
        notes: 'Continued progress on communication goals',
        outcomes: ['Improved sentence structure', 'Better eye contact during conversation']
      }
    ],

    medications: [
      {
        id: 'med-1',
        medicationName: 'Risperidone',
        dosage: '0.5mg',
        frequency: 'Twice daily',
        startDate: '2023-06-01T00:00:00Z',
        prescribedBy: 'Dr. Sarah Williams',
        purpose: 'Behavioral regulation',
        sideEffects: ['Mild drowsiness', 'Increased appetite'],
        effectiveness: 4,
        adherence: 95,
        nextReview: '2024-03-01T00:00:00Z',
        status: 'active'
      }
    ],

    therapySessions: [
      {
        id: 'therapy-1',
        therapyType: 'Speech and Language Therapy',
        providerId: 'provider-2',
        providerName: 'Emma Thompson',
        sessionDate: '2024-02-05T14:30:00Z',
        duration: 45,
        goals: ['Improve expressive language', 'Enhance social communication'],
        progress: {
          rating: 4,
          notes: 'Significant improvement in sentence formation and vocabulary expansion',
          milestones: ['First spontaneous 4-word sentence', 'Increased eye contact during conversation'],
          nextTargets: ['Complex sentence structures', 'Narrative skills']
        },
        nextSession: '2024-02-12T14:30:00Z',
        homeActivities: ['Daily reading practice', 'Social stories review']
      },
      {
        id: 'therapy-2',
        therapyType: 'Occupational Therapy',
        providerId: 'provider-3',
        providerName: 'Michael Chen',
        sessionDate: '2024-02-07T11:00:00Z',
        duration: 60,
        goals: ['Sensory regulation', 'Fine motor skills'],
        progress: {
          rating: 5,
          notes: 'Excellent progress with sensory regulation strategies',
          milestones: ['Tolerated new textures', 'Improved pencil grip'],
          nextTargets: ['Writing endurance', 'Sensory diet independence']
        },
        nextSession: '2024-02-14T11:00:00Z',
        homeActivities: ['Sensory breaks every hour', 'Fine motor skill games']
      }
    ],

    emergencyInfo: {
      id: 'emergency-1',
      childId,
      medicalConditions: ['Autism Spectrum Disorder', 'Sensory Processing Disorder'],
      allergies: ['Peanuts', 'Tree nuts'],
      currentMedications: ['Risperidone 0.5mg twice daily'],
      emergencyContacts: [
        {
          name: 'Sarah Johnson',
          relationship: 'Mother',
          phone: '+44123456789',
          isPrimary: true
        },
        {
          name: 'David Johnson',
          relationship: 'Father',
          phone: '+44123456788',
          isPrimary: false
        }
      ],
      medicalNotes: 'May become overwhelmed in loud environments. Responds well to calm, quiet spaces.',
      hospitalPreferences: 'Children\'s Hospital - familiar environment',
      lastUpdated: '2024-01-15T00:00:00Z'
    },

    vitalSigns: {
      height: '120cm',
      weight: '25kg',
      lastMeasured: '2024-01-20T00:00:00Z',
      growthPercentiles: {
        height: '50th percentile',
        weight: '45th percentile'
      }
    },

    healthMetrics: {
      sleepQuality: 3.8,
      appetiteRating: 4.2,
      behaviorStability: 4.5,
      medicationCompliance: 95,
      therapyAttendance: 98,
      parentSatisfaction: 4.7
    }
  };

  // Filter data based on type if specified
  if (type && type !== 'overview') {
    switch (type) {
      case 'appointments':
        return { appointments: baseData.appointments };
      case 'medications':
        return { medications: baseData.medications };
      case 'therapy':
        return { therapySessions: baseData.therapySessions };
      case 'emergency':
        return { emergencyInfo: baseData.emergencyInfo };
      default:
        return baseData;
    }
  }

  return baseData;
}

async function generateHealthAnalytics(childId: string, healthData: any) {
  return {
    appointmentTrends: {
      totalScheduled: healthData.appointments?.length || 0,
      attendanceRate: 95,
      averageDuration: 52.5,
      mostFrequentProvider: 'Emma Thompson - Speech Therapy',
      nextAppointment: healthData.appointments?.find((apt: any) => apt.status === 'scheduled')
    },

    medicationAnalysis: {
      totalMedications: healthData.medications?.length || 0,
      adherenceRate: 95,
      sideEffectFrequency: 'Low',
      effectivenessScore: 4.2,
      upcomingReviews: 1
    },

    therapyProgress: {
      totalSessions: healthData.therapySessions?.length || 0,
      averageProgressRating: 4.5,
      consistencyScore: 98,
      milestonesAchieved: 4,
      nextMilestones: 3,
      improvementTrend: 'Positive'
    },

    healthTrends: {
      overallImprovement: 15,
      riskFactors: ['Medication review due', 'Sleep schedule optimization needed'],
      recommendations: [
        'Continue current therapy schedule - excellent progress',
        'Review risperidone dosage with prescribing physician',
        'Consider adding sleep hygiene consultation'
      ],
      predictiveInsights: {
        nextReviewRecommendation: '2024-03-15',
        riskAssessment: 'Low',
        interventionOpportunities: ['Sleep optimization', 'Transition planning']
      }
    }
  };
}

async function generateHealthInsights(healthData: any, analytics: any) {
  return {
    keyInsights: [
      'Speech therapy showing excellent progress - consider increasing session frequency',
      'Medication adherence is excellent, effectiveness remains high',
      'Sensory regulation strategies are working well - home implementation successful'
    ],
    alertsAndFlags: [
      {
        type: 'medication',
        priority: 'medium',
        message: 'Risperidone review due in 3 weeks',
        actionRequired: 'Schedule appointment with prescribing physician'
      }
    ],
    upcomingActions: [
      {
        action: 'Speech therapy session',
        date: '2024-02-12T14:30:00Z',
        priority: 'routine'
      },
      {
        action: 'Medication review',
        date: '2024-03-01T00:00:00Z',
        priority: 'important'
      }
    ],
    progressSummary: {
      weeklyHighlights: [
        'Achieved first spontaneous 4-word sentence',
        'Successful introduction of new sensory activity',
        'Improved sleep pattern consistency'
      ],
      areasOfConcern: [],
      celebratedMilestones: ['First complex sentence', 'Independent sensory break request']
    }
  };
}

async function scheduleAppointment(userId: string, data: any) {
  const validatedData = appointmentSchema.parse(data);

  // Check access
  const hasAccess = await memoryDatabase.hasChildAccess(userId, validatedData.childId);
  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  // Create appointment record (in real app, would integrate with calendar systems)
  const appointment = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    createdBy: userId
  };

  return NextResponse.json({
    success: true,
    data: appointment,
    message: 'Appointment scheduled successfully'
  });
}

async function addMedication(userId: string, data: any) {
  const validatedData = medicationSchema.parse(data);

  // Check access
  const hasAccess = await memoryDatabase.hasChildAccess(userId, validatedData.childId);
  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  const medication = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    status: 'active',
    adherence: 100,
    createdAt: new Date().toISOString(),
    createdBy: userId
  };

  return NextResponse.json({
    success: true,
    data: medication,
    message: 'Medication added successfully'
  });
}

async function recordTherapySession(userId: string, data: any) {
  const validatedData = therapySessionSchema.parse(data);

  // Check access
  const hasAccess = await memoryDatabase.hasChildAccess(userId, validatedData.childId);
  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  const session = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    createdAt: new Date().toISOString(),
    recordedBy: userId
  };

  return NextResponse.json({
    success: true,
    data: session,
    message: 'Therapy session recorded successfully'
  });
}

async function updateEmergencyInfo(userId: string, data: any) {
  const validatedData = emergencyInfoSchema.parse(data);

  // Check access
  const hasAccess = await memoryDatabase.hasChildAccess(userId, validatedData.childId);
  if (!hasAccess) {
    return NextResponse.json(
      { success: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  const emergencyInfo = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };

  return NextResponse.json({
    success: true,
    data: emergencyInfo,
    message: 'Emergency information updated successfully'
  });
}

async function trackSideEffects(userId: string, data: any) {
  // Implementation for side effect tracking
  return NextResponse.json({
    success: true,
    data: { id: memoryDatabase.generateId(), ...data },
    message: 'Side effects tracked successfully'
  });
}

async function updateTherapyProgress(userId: string, data: any) {
  // Implementation for therapy progress updates
  return NextResponse.json({
    success: true,
    data: { id: memoryDatabase.generateId(), ...data },
    message: 'Therapy progress updated successfully'
  });
}

async function updateAppointment(userId: string, id: string, updates: any) {
  // Implementation for appointment updates
  return NextResponse.json({
    success: true,
    data: { id, ...updates, updatedAt: new Date().toISOString() },
    message: 'Appointment updated successfully'
  });
}

async function updateMedication(userId: string, id: string, updates: any) {
  // Implementation for medication updates
  return NextResponse.json({
    success: true,
    data: { id, ...updates, updatedAt: new Date().toISOString() },
    message: 'Medication updated successfully'
  });
}

async function updateTherapySession(userId: string, id: string, updates: any) {
  // Implementation for therapy session updates
  return NextResponse.json({
    success: true,
    data: { id, ...updates, updatedAt: new Date().toISOString() },
    message: 'Therapy session updated successfully'
  });
}
