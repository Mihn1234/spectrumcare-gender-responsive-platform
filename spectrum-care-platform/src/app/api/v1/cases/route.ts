import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schemas
const createCaseSchema = z.object({
  child_id: z.string().uuid(),
  request_type: z.enum(['INITIAL_ASSESSMENT', 'REVIEW', 'AMENDMENT', 'TRANSFER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  requesting_party: z.enum(['PARENT', 'SCHOOL', 'HEALTH', 'LA', 'OTHER']),
  description: z.string().min(10).max(1000),
  supporting_documents: z.array(z.string().uuid()).optional(),
  estimated_budget: z.number().positive().optional()
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ASSESSMENT', 'DRAFT', 'FINAL', 'REVIEW', 'APPEAL', 'CLOSED']),
  notes: z.string().optional(),
  assigned_officer: z.string().uuid().optional(),
  workflow_data: z.object({
    assessment_team: z.array(z.string().uuid()).optional(),
    estimated_completion: z.string().optional()
  }).optional()
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigned_officer: z.string().uuid().optional(),
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  search: z.string().optional()
});

interface CaseResponse {
  id: string;
  case_number: string;
  child_name: string;
  status: string;
  priority: string;
  statutory_deadline: string;
  assigned_officer: string | null;
  created_at: string;
  updated_at: string;
  total_cost: number;
  budget_variance: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Database service (mocked for now - would use actual PostgreSQL in production)
class CaseService {
  private static mockCases: CaseResponse[] = [
    {
      id: 'case-uuid-1',
      case_number: 'EHC-2025-0847',
      child_name: 'Jamie Thompson',
      status: 'ASSESSMENT',
      priority: 'HIGH',
      statutory_deadline: '2025-08-15',
      assigned_officer: 'officer-uuid-1',
      created_at: '2025-07-01T00:00:00Z',
      updated_at: '2025-07-15T14:30:00Z',
      total_cost: 94237.50,
      budget_variance: 18.5
    },
    {
      id: 'case-uuid-2',
      case_number: 'EHC-2025-0848',
      child_name: 'Sarah Williams',
      status: 'DRAFT',
      priority: 'MEDIUM',
      statutory_deadline: '2025-09-20',
      assigned_officer: 'officer-uuid-2',
      created_at: '2025-07-05T00:00:00Z',
      updated_at: '2025-07-20T16:45:00Z',
      total_cost: 67429.30,
      budget_variance: -5.2
    },
    {
      id: 'case-uuid-3',
      case_number: 'EHC-2025-0849',
      child_name: 'Michael Chen',
      status: 'PENDING',
      priority: 'HIGH',
      statutory_deadline: '2025-10-15',
      assigned_officer: null,
      created_at: '2025-07-10T00:00:00Z',
      updated_at: '2025-07-10T00:00:00Z',
      total_cost: 0,
      budget_variance: 0
    }
  ];

  static async getCases(
    tenantId: string,
    filters: {
      page: number;
      limit: number;
      status?: string;
      priority?: string;
      assigned_officer?: string;
      created_after?: string;
      created_before?: string;
      search?: string;
    }
  ): Promise<PaginatedResponse<CaseResponse>> {
    let filteredCases = [...this.mockCases];

    // Apply filters
    if (filters.status) {
      filteredCases = filteredCases.filter(c => c.status === filters.status);
    }
    if (filters.priority) {
      filteredCases = filteredCases.filter(c => c.priority === filters.priority);
    }
    if (filters.assigned_officer) {
      filteredCases = filteredCases.filter(c => c.assigned_officer === filters.assigned_officer);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCases = filteredCases.filter(c =>
        c.child_name.toLowerCase().includes(searchLower) ||
        c.case_number.toLowerCase().includes(searchLower)
      );
    }
    if (filters.created_after) {
      filteredCases = filteredCases.filter(c => c.created_at >= filters.created_after!);
    }
    if (filters.created_before) {
      filteredCases = filteredCases.filter(c => c.created_at <= filters.created_before!);
    }

    // Apply pagination
    const total = filteredCases.length;
    const pages = Math.ceil(total / filters.limit);
    const offset = (filters.page - 1) * filters.limit;
    const paginatedCases = filteredCases.slice(offset, offset + filters.limit);

    return {
      data: paginatedCases,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages
      }
    };
  }

  static async createCase(
    tenantId: string,
    userId: string,
    caseData: z.infer<typeof createCaseSchema>
  ): Promise<{ id: string; case_number: string; status: string; statutory_deadline: string; workflow_state: string; created_at: string }> {
    // Generate case number
    const year = new Date().getFullYear();
    const sequence = String(this.mockCases.length + 1).padStart(4, '0');
    const case_number = `EHC-${year}-${sequence}`;

    // Calculate statutory deadline (20 weeks from now)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (20 * 7));

    const newCase = {
      id: `case-uuid-${this.mockCases.length + 1}`,
      case_number,
      status: 'PENDING',
      statutory_deadline: deadline.toISOString().split('T')[0],
      workflow_state: 'INITIAL_REVIEW',
      created_at: new Date().toISOString()
    };

    // In production, this would insert into PostgreSQL
    // await db.query('INSERT INTO ehc_cases ...');

    return newCase;
  }

  static async updateCaseStatus(
    caseId: string,
    tenantId: string,
    userId: string,
    statusData: z.infer<typeof updateStatusSchema>
  ): Promise<{ success: boolean; message: string }> {
    // In production, this would update PostgreSQL
    // await db.query('UPDATE ehc_cases SET status = $1 WHERE id = $2 AND tenant_id = $3');

    return {
      success: true,
      message: 'Case status updated successfully'
    };
  }

  static async getCaseById(
    caseId: string,
    tenantId: string
  ): Promise<CaseResponse | null> {
    return this.mockCases.find(c => c.id === caseId) || null;
  }
}

// Audit logging service
class AuditService {
  static async logAction(
    tenantId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // In production, this would insert into audit_logs table
    console.log('AUDIT LOG:', {
      tenantId,
      userId,
      action,
      resourceType,
      resourceId,
      oldValues,
      newValues,
      timestamp: new Date().toISOString()
    });
  }
}

// Error handling utility
function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.issues
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// GET /api/v1/cases - Retrieve paginated list of EHC cases
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const user = authResult.user!;
    const tenantId = user.tenant_id;

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      assigned_officer: searchParams.get('assigned_officer'),
      created_after: searchParams.get('created_after'),
      created_before: searchParams.get('created_before'),
      search: searchParams.get('search')
    };

    // Remove null values
    const cleanParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== null)
    );

    const validatedQuery = querySchema.parse(cleanParams);

    // Check permissions
    if (!['LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'LA_EXECUTIVE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get cases with filtering and pagination
    const result = await CaseService.getCases(tenantId, validatedQuery);

    // Log audit trail
    await AuditService.logAction(
      tenantId,
      user.id,
      'READ',
      'CASES',
      'COLLECTION',
      null,
      { filters: validatedQuery },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json(result);

  } catch (error) {
    return handleError(error);
  }
}

// POST /api/v1/cases - Create new EHC case
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const user = authResult.user!;
    const tenantId = user.tenant_id;

    // Check permissions
    if (!['LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create cases' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCaseSchema.parse(body);

    // Create new case
    const newCase = await CaseService.createCase(tenantId, user.id, validatedData);

    // Log audit trail
    await AuditService.logAction(
      tenantId,
      user.id,
      'CREATE',
      'EHC_CASE',
      newCase.id,
      null,
      newCase,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json(newCase, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/v1/cases/{id}/status - Update case status
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract case ID from URL
    const urlParts = request.url.split('/');
    const caseId = urlParts[urlParts.length - 2]; // Get ID before 'status'

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const user = authResult.user!;
    const tenantId = user.tenant_id;

    // Check permissions
    if (!['LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update cases' },
        { status: 403 }
      );
    }

    // Verify case exists and belongs to tenant
    const existingCase = await CaseService.getCaseById(caseId, tenantId);
    if (!existingCase) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Update case status
    const result = await CaseService.updateCaseStatus(caseId, tenantId, user.id, validatedData);

    // Log audit trail
    await AuditService.logAction(
      tenantId,
      user.id,
      'UPDATE',
      'EHC_CASE',
      caseId,
      { status: existingCase.status },
      validatedData,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json(result);

  } catch (error) {
    return handleError(error);
  }
}

// GET /api/v1/cases/{id} - Get specific case details
export async function GETById(request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id: caseId } = await params;

    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const user = authResult.user!;
    const tenantId = user.tenant_id;

    // Check permissions
    if (!['LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'LA_EXECUTIVE', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get case details
    const caseDetails = await CaseService.getCaseById(caseId, tenantId);
    if (!caseDetails) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Log audit trail
    await AuditService.logAction(
      tenantId,
      user.id,
      'READ',
      'EHC_CASE',
      caseId,
      null,
      null,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json(caseDetails);

  } catch (error) {
    return handleError(error);
  }
}

// Health check endpoint
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 });
}
