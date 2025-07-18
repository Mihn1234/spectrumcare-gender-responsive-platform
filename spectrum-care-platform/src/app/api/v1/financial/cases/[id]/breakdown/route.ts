import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { z } from 'zod';

interface FinancialBreakdownItem {
  description: string;
  amount: number;
  vendor: string;
  transaction_date: string;
  status: string;
}

interface FinancialCategoryBreakdown {
  amount: number;
  percentage: number;
  items: FinancialBreakdownItem[];
}

interface MonthlyBreakdown {
  month: string;
  amount: number;
  variance: number;
}

interface FinancialBreakdownResponse {
  case_id: string;
  total_cost: number;
  budget_allocated: number;
  variance_amount: number;
  variance_percentage: number;
  breakdown: {
    educational_provision: FinancialCategoryBreakdown;
    professional_services: FinancialCategoryBreakdown;
    health_services: FinancialCategoryBreakdown;
    transport: FinancialCategoryBreakdown;
    equipment: FinancialCategoryBreakdown;
    legal_costs: FinancialCategoryBreakdown;
  };
  monthly_breakdown: MonthlyBreakdown[];
  budget_forecasting: {
    projected_total: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    completion_forecast: string;
  };
}

// Financial service (mocked for now - would use actual PostgreSQL in production)
class FinancialService {
  static async getCaseFinancialBreakdown(
    caseId: string,
    tenantId: string
  ): Promise<FinancialBreakdownResponse | null> {
    // Mock data - in production this would query the financial_transactions table
    const mockBreakdown: FinancialBreakdownResponse = {
      case_id: caseId,
      total_cost: 94237.50,
      budget_allocated: 79500.00,
      variance_amount: 14737.50,
      variance_percentage: 18.5,
      breakdown: {
        educational_provision: {
          amount: 42847.00,
          percentage: 45.5,
          items: [
            {
              description: "Independent School Placement - Bright Futures Academy",
              amount: 35000.00,
              vendor: "Bright Futures Academy",
              transaction_date: "2025-01-15",
              status: "APPROVED"
            },
            {
              description: "1:1 Teaching Assistant Support",
              amount: 7847.00,
              vendor: "Educational Support Services Ltd",
              transaction_date: "2025-02-01",
              status: "APPROVED"
            }
          ]
        },
        professional_services: {
          amount: 18450.00,
          percentage: 19.6,
          items: [
            {
              description: "Educational Psychology Assessment",
              amount: 3200.00,
              vendor: "Dr. Sarah Mitchell Psychology Services",
              transaction_date: "2025-01-20",
              status: "APPROVED"
            },
            {
              description: "Speech and Language Therapy (12 sessions)",
              amount: 4800.00,
              vendor: "Communication Plus Therapy",
              transaction_date: "2025-02-01",
              status: "APPROVED"
            },
            {
              description: "Occupational Therapy Assessment & Equipment",
              amount: 2850.00,
              vendor: "OT Solutions Ltd",
              transaction_date: "2025-02-05",
              status: "APPROVED"
            },
            {
              description: "Specialist SEND Tutoring (ongoing)",
              amount: 7600.00,
              vendor: "Specialist Learning Support",
              transaction_date: "2025-02-10",
              status: "PENDING"
            }
          ]
        },
        health_services: {
          amount: 15240.00,
          percentage: 16.2,
          items: [
            {
              description: "CAMHS Assessment & Initial Treatment",
              amount: 5240.00,
              vendor: "NHS Foundation Trust",
              transaction_date: "2025-01-25",
              status: "APPROVED"
            },
            {
              description: "Paediatric Neurology Consultation",
              amount: 2800.00,
              vendor: "Specialist Neuro Services",
              transaction_date: "2025-02-03",
              status: "APPROVED"
            },
            {
              description: "Sensory Integration Therapy",
              amount: 4200.00,
              vendor: "Sensory Solutions Clinic",
              transaction_date: "2025-02-08",
              status: "APPROVED"
            },
            {
              description: "Annual Health Review & Monitoring",
              amount: 3000.00,
              vendor: "Community Health Services",
              transaction_date: "2025-03-01",
              status: "SCHEDULED"
            }
          ]
        },
        transport: {
          amount: 8900.00,
          percentage: 9.4,
          items: [
            {
              description: "Specialized Transport to School (Annual)",
              amount: 7200.00,
              vendor: "Safe Journeys Transport Ltd",
              transaction_date: "2025-01-10",
              status: "APPROVED"
            },
            {
              description: "Transport for Medical Appointments",
              amount: 1700.00,
              vendor: "Medical Transport Services",
              transaction_date: "2025-02-01",
              status: "APPROVED"
            }
          ]
        },
        equipment: {
          amount: 5850.00,
          percentage: 6.2,
          items: [
            {
              description: "Assistive Technology Package",
              amount: 3200.00,
              vendor: "TechAccess Solutions",
              transaction_date: "2025-01-30",
              status: "APPROVED"
            },
            {
              description: "Sensory Equipment & Tools",
              amount: 1450.00,
              vendor: "Sensory World",
              transaction_date: "2025-02-05",
              status: "APPROVED"
            },
            {
              description: "Communication Device & Software",
              amount: 1200.00,
              vendor: "Communication Aid Centre",
              transaction_date: "2025-02-12",
              status: "PENDING"
            }
          ]
        },
        legal_costs: {
          amount: 2950.00,
          percentage: 3.1,
          items: [
            {
              description: "Legal Review of EHC Plan",
              amount: 1800.00,
              vendor: "SEND Legal Advisors LLP",
              transaction_date: "2025-02-01",
              status: "APPROVED"
            },
            {
              description: "Tribunal Preparation Support",
              amount: 1150.00,
              vendor: "Education Law Specialists",
              transaction_date: "2025-02-15",
              status: "PENDING"
            }
          ]
        }
      },
      monthly_breakdown: [
        { month: "2025-01", amount: 47240.00, variance: 12.5 },
        { month: "2025-02", amount: 28650.00, variance: 15.2 },
        { month: "2025-03", amount: 12500.00, variance: 8.1 },
        { month: "2025-04", amount: 5847.50, variance: -2.3 }
      ],
      budget_forecasting: {
        projected_total: 98450.00,
        risk_level: 'MEDIUM',
        completion_forecast: "2025-08-15"
      }
    };

    return mockBreakdown;
  }

  static async getTransactionHistory(
    caseId: string,
    tenantId: string,
    limit: number = 50
  ): Promise<FinancialBreakdownItem[]> {
    // In production, this would query financial_transactions table
    const mockTransactions: FinancialBreakdownItem[] = [
      {
        description: "Independent School Placement - Monthly Fee",
        amount: 3500.00,
        vendor: "Bright Futures Academy",
        transaction_date: "2025-07-01",
        status: "APPROVED"
      },
      {
        description: "Speech Therapy Session Block",
        amount: 480.00,
        vendor: "Communication Plus Therapy",
        transaction_date: "2025-06-28",
        status: "APPROVED"
      },
      {
        description: "Transport Services - Weekly",
        amount: 180.00,
        vendor: "Safe Journeys Transport Ltd",
        transaction_date: "2025-06-25",
        status: "APPROVED"
      }
    ];

    return mockTransactions.slice(0, limit);
  }

  static async getBudgetVarianceAnalysis(
    caseId: string,
    tenantId: string
  ): Promise<{
    categories: Array<{
      category: string;
      budgeted: number;
      actual: number;
      variance: number;
      variance_percentage: number;
      risk_factors: string[];
    }>;
    recommendations: string[];
  }> {
    return {
      categories: [
        {
          category: "Educational Provision",
          budgeted: 35000.00,
          actual: 42847.00,
          variance: 7847.00,
          variance_percentage: 22.4,
          risk_factors: [
            "Higher than expected placement costs",
            "Additional 1:1 support requirements",
            "Specialized curriculum needs"
          ]
        },
        {
          category: "Professional Services",
          budgeted: 15000.00,
          actual: 18450.00,
          variance: 3450.00,
          variance_percentage: 23.0,
          risk_factors: [
            "Extended therapy requirements",
            "Additional specialist assessments"
          ]
        }
      ],
      recommendations: [
        "Consider reviewing placement options for cost optimization",
        "Implement regular budget review meetings",
        "Explore shared service arrangements for professional services",
        "Negotiate annual rates with frequent service providers"
      ]
    };
  }
}

// Audit logging for financial operations
class FinancialAuditService {
  static async logFinancialAccess(
    tenantId: string,
    userId: string,
    caseId: string,
    action: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // In production, this would insert into audit_logs table with financial sensitivity flag
    console.log('FINANCIAL AUDIT LOG:', {
      tenantId,
      userId,
      action,
      resourceType: 'FINANCIAL_DATA',
      resourceId: caseId,
      timestamp: new Date().toISOString(),
      sensitive: true,
      ipAddress,
      userAgent
    });
  }
}

// Error handling
function handleError(error: unknown): NextResponse {
  console.error('Financial API Error:', error);

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

// GET /api/v1/financial/cases/{id}/breakdown - Get detailed financial breakdown for specific case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    // Check permissions - financial data requires specific roles
    if (!['LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'LA_EXECUTIVE', 'ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access financial data' },
        { status: 403 }
      );
    }

    // Validate case ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(caseId)) {
      return NextResponse.json(
        { error: 'Invalid case ID format' },
        { status: 400 }
      );
    }

    // Get financial breakdown
    const breakdown = await FinancialService.getCaseFinancialBreakdown(caseId, tenantId);
    if (!breakdown) {
      return NextResponse.json(
        { error: 'Case financial data not found' },
        { status: 404 }
      );
    }

    // Log financial data access for audit compliance
    await FinancialAuditService.logFinancialAccess(
      tenantId,
      user.id,
      caseId,
      'READ_FINANCIAL_BREAKDOWN',
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    // Add security headers for financial data
    const response = NextResponse.json(breakdown);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;

  } catch (error) {
    return handleError(error);
  }
}

// GET /api/v1/financial/cases/{id}/transactions - Get transaction history
export async function GETTransactions(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: caseId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

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
    if (!['LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'LA_EXECUTIVE', 'ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access transaction history' },
        { status: 403 }
      );
    }

    // Get transaction history
    const transactions = await FinancialService.getTransactionHistory(caseId, tenantId, limit);

    // Log access
    await FinancialAuditService.logFinancialAccess(
      tenantId,
      user.id,
      caseId,
      'READ_TRANSACTION_HISTORY',
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      case_id: caseId,
      transactions,
      total_count: transactions.length,
      limit
    });

  } catch (error) {
    return handleError(error);
  }
}

// GET /api/v1/financial/cases/{id}/variance-analysis - Get budget variance analysis
export async function GETVarianceAnalysis(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    // Check permissions - variance analysis requires manager level access
    if (!['LA_MANAGER', 'LA_EXECUTIVE', 'ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to access variance analysis' },
        { status: 403 }
      );
    }

    // Get variance analysis
    const analysis = await FinancialService.getBudgetVarianceAnalysis(caseId, tenantId);

    // Log access
    await FinancialAuditService.logFinancialAccess(
      tenantId,
      user.id,
      caseId,
      'READ_VARIANCE_ANALYSIS',
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      case_id: caseId,
      ...analysis,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return handleError(error);
  }
}
