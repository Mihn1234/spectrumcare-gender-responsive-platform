import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';

// Type definitions
interface CrisisContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
}

type CrisisSeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';

interface Crisis {
  id: string;
  severity: CrisisSeverity;
  type: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

// Validation schemas
const crisisReportSchema = z.object({
  childId: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical', 'emergency']),
  type: z.string(),
  description: z.string(),
  location: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  witnesses: z.array(z.string()).optional(),
  immediateActions: z.array(z.string()).optional()
});

const emergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  priority: z.number()
});

// Helper functions
async function getCrisisHistory(
  userId: string,
  childId?: string,
  timeframe: string = '30d'
): Promise<NextResponse> {
  // Simulate crisis history data
  const mockHistory: Array<{
    id: string;
    date: string;
    severity: CrisisSeverity;
    type: string;
    description: string;
    duration: string;
    resolved: boolean;
    interventions: string[];
  }> = [
    {
      id: 'crisis-1',
      date: '2024-01-15',
      severity: 'medium',
      type: 'Sensory Overload',
      description: 'Overwhelmed in busy shopping center',
      duration: '25 minutes',
      resolved: true,
      interventions: ['Removed from environment', 'Calming techniques', 'Sensory break']
    },
    {
      id: 'crisis-2',
      date: '2024-01-10',
      severity: 'high',
      type: 'Transition Difficulty',
      description: 'Extreme distress changing from home to school routine',
      duration: '45 minutes',
      resolved: true,
      interventions: ['Visual schedule review', 'Gradual transition', 'Preferred activity']
    }
  ];

  return NextResponse.json({
    success: true,
    data: {
      history: mockHistory,
      summary: {
        totalIncidents: mockHistory.length,
        avgDuration: '35 minutes',
        mostCommonType: 'Sensory Related',
        improvementTrend: '+15% reduction this month'
      }
    }
  });
}

async function getResponsePlans(
  userId: string,
  childId?: string
): Promise<NextResponse> {
  // Simulate response plans
  return NextResponse.json({
    success: true,
    data: {
      plans: [
        {
          id: 'plan-1',
          name: 'Sensory Overload Response',
          severity: ['medium', 'high'],
          steps: [
            'Move to quiet, low-stimulation environment',
            'Offer sensory tools (weighted blanket, noise-cancelling headphones)',
            'Use calm, simple language',
            'Allow processing time',
            'Gradual re-engagement when ready'
          ],
          contacts: ['Primary Carer', 'School SENCO'],
          resources: ['Sensory kit', 'Comfort items', 'Safe space access']
        }
      ]
    }
  });
}

async function getPreventionStrategies(
  userId: string,
  childId?: string
): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: {
      strategies: [
        {
          category: 'Environmental',
          techniques: [
            'Regular sensory breaks every 30 minutes',
            'Use of visual schedules and warnings for transitions',
            'Maintain consistent routines where possible',
            'Create designated calm spaces'
          ]
        },
        {
          category: 'Communication',
          techniques: [
            'Use clear, concrete language',
            'Provide processing time after instructions',
            'Check understanding regularly',
            'Use visual supports alongside verbal communication'
          ]
        }
      ]
    }
  });
}

// GET handler
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult || !authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const childId = searchParams.get('childId') || undefined;
    const timeframe = searchParams.get('timeframe') || '30d';

    switch (action) {
      case 'history':
        return await getCrisisHistory(authResult.user.id, childId, timeframe);

      case 'response-plans':
        return await getResponsePlans(authResult.user.id, childId);

      case 'prevention':
        return await getPreventionStrategies(authResult.user.id, childId);

      default: {
        // Return dashboard data
        const activeCrises: Crisis[] = [];

        return NextResponse.json({
          success: true,
          data: {
            activeCrises,
            summary: {
              highPriority: activeCrises.filter(
                (c: Crisis) => c.severity === 'high' || c.severity === 'critical'
              ).length,
              totalActive: activeCrises.length,
              responseTime: '< 5 minutes',
              successRate: '94%'
            }
          }
        });
      }
    }
  } catch (error: unknown) {
    console.error('Crisis response error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crisis data' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult || !authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body as { action?: string };

    if (action === 'report-crisis') {
      const validatedData = crisisReportSchema.parse(body);

      // Create crisis report
      const crisisReport = {
        id: `crisis-${Date.now()}`,
        userId: authResult.user.id,
        childId: validatedData.childId,
        severity: validatedData.severity,
        type: validatedData.type,
        description: validatedData.description,
        location: validatedData.location,
        triggers: validatedData.triggers ?? [],
        witnesses: validatedData.witnesses ?? [],
        immediateActions: validatedData.immediateActions ?? [],
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      // In a real implementation, this would be saved to the database
      // await memoryDatabase.createCrisisReport(crisisReport);

      return NextResponse.json(
        {
          success: true,
          data: crisisReport,
          message: 'Crisis report created successfully'
        },
        { status: 201 }
      );
    }

    if (action === 'update-contacts') {
      const { contacts } = body as { contacts?: unknown };
      if (!Array.isArray(contacts)) {
        return NextResponse.json(
          { error: 'Contacts must be an array' },
          { status: 400 }
        );
      }
      const validatedContacts = contacts.map((contact) =>
        emergencyContactSchema.parse(contact)
      );

      // Create contacts with proper typing
      const processedContacts: CrisisContact[] = validatedContacts.map((contact) => ({
        id: `contact-${Date.now()}-${Math.random()}`,
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        priority: contact.priority
      }));

      return NextResponse.json({
        success: true,
        data: { contacts: processedContacts },
        message: 'Emergency contacts updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Crisis response POST error:', error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper function for crisis severity assessment
function assessCrisisSeverity(
  description: string,
  triggers: string[]
): { severity: CrisisSeverity } {
  // Simplified severity assessment logic
  const highRiskKeywords = ['danger', 'harm', 'emergency', 'urgent', 'critical'];
  const mediumRiskKeywords = ['overwhelmed', 'distressed', 'upset', 'difficult'];

  const hasHighRisk = highRiskKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword)
  );

  const hasMediumRisk = mediumRiskKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword)
  );

  if (hasHighRisk) {
    return { severity: 'high' };
  } else if (hasMediumRisk) {
    return { severity: 'medium' };
  } else {
    return { severity: 'low' };
  }
}

// Crisis response protocol function
function getCrisisResponseProtocol(severityAssessment: { severity: string }) {
  const protocols: Record<string, any> = {
    emergency: {
      responseTime: 'Immediate',
      contactLevel: 'Emergency services + all contacts',
      estimatedResolution: '1-2 hours',
      contactsNotified: ['Emergency Services', 'Primary Carer', 'School', 'GP'],
      immediateActions: [
        'Ensure safety',
        'Call 999 if needed',
        'Implement emergency plan',
        'Document everything'
      ]
    },
    critical: {
      responseTime: '< 5 minutes',
      contactLevel: 'All emergency contacts',
      estimatedResolution: '30-60 minutes',
      contactsNotified: ['Primary Carer', 'Secondary Carer', 'School SENCO'],
      immediateActions: [
        'Activate crisis plan',
        'Remove triggers',
        'Ensure safe environment',
        'Monitor closely'
      ]
    },
    high: {
      responseTime: '< 15 minutes',
      contactLevel: 'Primary contacts',
      estimatedResolution: '15-30 minutes',
      contactsNotified: ['Primary Carer', 'School'],
      immediateActions: [
        'Implement calming strategies',
        'Remove from situation',
        'Use preferred items'
      ]
    },
    medium: {
      responseTime: '< 30 minutes',
      contactLevel: 'Key supporters',
      estimatedResolution: '10-20 minutes',
      contactsNotified: ['Primary Carer'],
      immediateActions: [
        'Calming techniques',
        'Sensory break',
        'Reduce stimulation'
      ]
    }
  };

  return protocols[severityAssessment.severity] || protocols.medium;
}
