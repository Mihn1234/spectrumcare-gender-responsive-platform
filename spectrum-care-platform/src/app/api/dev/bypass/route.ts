import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth-helpers';
import { memoryDatabase } from '@/lib/memory-database';

// Dev bypass user profiles for testing different portals
const DEV_USERS = {
  parent: {
    id: 'dev-parent-001',
    email: 'parent@dev.test',
    role: 'parent',
    firstName: 'Sarah',
    lastName: 'Johnson',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  professional: {
    id: 'dev-professional-001',
    email: 'professional@dev.test',
    role: 'professional',
    firstName: 'Dr. Emily',
    lastName: 'Smith',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  admin: {
    id: 'dev-admin-001',
    email: 'admin@dev.test',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  la_officer: {
    id: 'dev-la-001',
    email: 'la.officer@dev.test',
    role: 'la-officer',
    firstName: 'Local',
    lastName: 'Authority',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  parent_premium: {
    id: 'dev-parent-premium-001',
    email: 'premium.parent@dev.test',
    role: 'parent',
    firstName: 'Premium',
    lastName: 'Parent',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  therapist: {
    id: 'dev-therapist-001',
    email: 'therapist@dev.test',
    role: 'professional',
    firstName: 'Speech',
    lastName: 'Therapist',
    isActive: true,
    createdAt: new Date().toISOString()
  }
};

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Dev bypass only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userType, action } = body;

    switch (action) {
      case 'login':
        return handleDevLogin(userType);

      case 'list_users':
        return handleListUsers();

      case 'switch_user':
        return handleSwitchUser(userType);

      case 'create_test_data':
        return handleCreateTestData(userType);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Dev bypass error:', error);
    return NextResponse.json(
      { error: 'Dev bypass failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Dev bypass only available in development mode' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';

  switch (action) {
    case 'status':
      return NextResponse.json({
        success: true,
        available: true,
        users: Object.keys(DEV_USERS),
        environment: process.env.NODE_ENV
      });

    case 'users':
      return handleListUsers();

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

async function handleDevLogin(userType: string) {
  if (!DEV_USERS[userType as keyof typeof DEV_USERS]) {
    return NextResponse.json(
      { error: `Invalid user type: ${userType}. Available: ${Object.keys(DEV_USERS).join(', ')}` },
      { status: 400 }
    );
  }

  const user = DEV_USERS[userType as keyof typeof DEV_USERS];

  // Ensure user exists in memory database
  await ensureUserInDatabase(user);

  // Create test data for the user
  await createTestDataForUser(user);

  // Generate JWT token
  const token = generateToken(user.id, user.role);

  // Set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: false, // Set to false for development
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60, // 1 day
    path: '/'
  };

  const response = NextResponse.json({
    success: true,
    message: `Successfully logged in as ${userType}`,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    },
    redirectTo: getPortalRedirect(user.role),
    availableFeatures: getAvailableFeatures(user.role)
  });

  // Set the auth token cookie
  response.cookies.set('authToken', token, cookieOptions);

  return response;
}

async function handleListUsers() {
  const userList = Object.entries(DEV_USERS).map(([key, user]) => ({
    type: key,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    portal: getPortalRedirect(user.role),
    description: getUserDescription(key)
  }));

  return NextResponse.json({
    success: true,
    users: userList,
    total: userList.length
  });
}

async function handleSwitchUser(userType: string) {
  return handleDevLogin(userType);
}

async function handleCreateTestData(userType: string) {
  if (!DEV_USERS[userType as keyof typeof DEV_USERS]) {
    return NextResponse.json(
      { error: `Invalid user type: ${userType}` },
      { status: 400 }
    );
  }

  const user = DEV_USERS[userType as keyof typeof DEV_USERS];
  await createTestDataForUser(user);

  return NextResponse.json({
    success: true,
    message: `Test data created for ${userType}`,
    data: 'Sample children, documents, and assessments created'
  });
}

async function ensureUserInDatabase(user: any) {
  try {
    const existingUser = await memoryDatabase.getUserByEmail(user.email);
    if (!existingUser) {
      await memoryDatabase.createUser(user);
    }
  } catch (error) {
    console.log('User creation skipped:', error);
  }
}

async function createTestDataForUser(user: any) {
  try {
    if (user.role === 'parent') {
      // Create test child
      await memoryDatabase.createChild({
        parentUserId: user.id,
        firstName: 'Alex',
        lastName: 'Test',
        dateOfBirth: '2015-05-15',
        diagnosis: 'Autism Spectrum Disorder',
        needs: ['Communication support', 'Sensory processing', 'Social skills'],
        schoolName: 'Test Primary School',
        yearGroup: 'Year 4'
      });

      // Create test document
      await memoryDatabase.createDocument({
        uploadedBy: user.id,
        childId: 'demo-child-id',
        fileName: 'test-assessment.pdf',
        fileType: 'application/pdf',
        documentType: 'assessment',
        hasAiAnalysis: true,
        aiAnalysis: {
          confidence: 92,
          keyPoints: ['Communication needs identified', 'Sensory processing differences'],
          recommendations: ['Speech therapy', 'Occupational therapy']
        }
      });
    }

    if (user.role === 'professional') {
      // Create professional profile (skip if already exists)
      console.log('Professional profile already configured');
    }

  } catch (error) {
    console.log('Test data creation skipped:', error);
  }
}

function getPortalRedirect(role: string): string {
  switch (role) {
    case 'parent':
      return '/dashboard';
    case 'professional':
      return '/professional/white-label';
    case 'admin':
      return '/dashboard'; // Admin has access to everything
    case 'la-officer':
      return '/guest-access/manage';
    default:
      return '/dashboard';
  }
}

function getAvailableFeatures(role: string): string[] {
  switch (role) {
    case 'parent':
      return [
        'Dashboard Overview',
        'Child Profiles',
        'Document Upload & AI Analysis',
        'Assessment Booking',
        'EHC Plan Comparison',
        'Crisis Management',
        'Financial Management',
        'Health & Therapy Coordination',
        'Education Coordination',
        'Daily Living Management',
        'Professional Marketplace',
        'Community Support',
        'Voice Assistant'
      ];
    case 'professional':
      return [
        'Professional Dashboard',
        'White Label Management',
        'Client Management',
        'Assessment Tools',
        'Document Analysis',
        'Professional Network'
      ];
    case 'admin':
      return [
        'All Features',
        'User Management',
        'System Monitoring',
        'Analytics Dashboard',
        'Content Management',
        'Security Settings'
      ];
    case 'la-officer':
      return [
        'Guest Access Management',
        'EHC Plan Reviews',
        'Compliance Monitoring',
        'Authority Dashboard',
        'Resource Allocation'
      ];
    default:
      return ['Basic Access'];
  }
}

function getUserDescription(userType: string): string {
  const descriptions = {
    parent: 'Standard parent with full access to family portal features',
    professional: 'Healthcare professional with practice management tools',
    admin: 'System administrator with full platform access',
    la_officer: 'Local Authority officer with compliance and review tools',
    parent_premium: 'Premium parent with advanced features and priority support',
    therapist: 'Specialist therapist with assessment and intervention tools'
  };

  return descriptions[userType as keyof typeof descriptions] || 'Test user';
}
