import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schemas
const createTransactionSchema = z.object({
  case_id: z.string().uuid(),
  transaction_type: z.enum(['EDUCATION', 'HEALTH', 'TRANSPORT', 'LEGAL', 'ADMIN', 'PROFESSIONAL_SERVICE', 'PLACEMENT', 'EQUIPMENT']),
  amount: z.number().positive(),
  currency: z.string().length(3).default('GBP'),
  vendor_id: z.string().uuid().optional(),
  vendor_name: z.string().optional(),
  description: z.string().min(5).max(500),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cost_center: z.string().optional(),
  budget_category: z.string().optional(),
  approval_required: z.boolean().default(true),
  supporting_documents: z.array(z.string().uuid()).optional(),
  invoice_number: z.string().optional(),
  purchase_order_number: z.string().optional(),
  vat_rate: z.number().min(0).max(100).default(20),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

const approveTransactionSchema = z.object({
  approval_status: z.enum(['APPROVED', 'REJECTED']),
  approval_notes: z.string().optional(),
  approved_amount: z.number().positive().optional()
});

interface TransactionResponse {
  id: string;
  case_id: string;
  transaction_type: string;
  amount: number;
  net_amount: number;
  vat_amount: number;
  currency: string;
  vendor_name: string;
  description: string;
  transaction_date: string;
  approval_status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  invoice_number: string | null;
  purchase_order_number: string | null;
}

interface TransactionSummary {
  total_transactions: number;
  total_amount: number;
  approved_amount: number;
  pending_amount: number;
  by_category: Array<{
    category: string;
    count: number;
    amount: number;
  }>;
  by_status: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
}

// Financial transaction service
class TransactionService {
  private static mockTransactions: TransactionResponse[] = [
    {
      id: 'txn-uuid-1',
      case_id: 'case-uuid-1',
      transaction_type: 'EDUCATION',
      amount: 3500.00,
      net_amount: 2916.67,
      vat_amount: 583.33,
      currency: 'GBP',
      vendor_name: 'Bright Futures Academy',
      description: 'Independent School Placement - Monthly Fee',
      transaction_date: '2025-07-01',
      approval_status: 'APPROVED',
      approved_by: 'manager-uuid-1',
      approved_at: '2025-07-02T10:30:00Z',
      created_at: '2025-07-01T14:20:00Z',
      invoice_number: 'BFA-2025-0701',
      purchase_order_number: 'PO-2025-EDU-001'
    },
    {
      id: 'txn-uuid-2',
      case_id: 'case-uuid-1',
      transaction_type: 'PROFESSIONAL_SERVICE',
      amount: 480.00,
      net_amount: 400.00,
      vat_amount: 80.00,
      currency: 'GBP',
      vendor_name: 'Communication Plus Therapy',
      description: 'Speech Therapy Session Block (4 sessions)',
      transaction_date: '2025-06-28',
      approval_status: 'PENDING',
      approved_by: null,
      approved_at: null,
      created_at: '2025-06-28T16:45:00Z',
      invoice_number: 'CPT-2025-0628',
      purchase_order_number: null
    }
  ];

  static async createTransaction(
    tenantId: string,
    userId: string,
    transactionData: z.infer<typeof createTransactionSchema>
  ): Promise<TransactionResponse> {
    // Calculate VAT amounts
    const vatRate = transactionData.metadata?.vat_rate || 20;
    const netAmount = transactionData.amount / (1 + vatRate / 100);
    const vatAmount = transactionData.amount - netAmount;

    // Generate transaction ID
    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newTransaction: TransactionResponse = {
      id: transactionId,
      case_id: transactionData.case_id,
      transaction_type: transactionData.transaction_type,
      amount: transactionData.amount,
      net_amount: Number(netAmount.toFixed(2)),
      vat_amount: Number(vatAmount.toFixed(2)),
      currency: transactionData.currency,
      vendor_name: transactionData.vendor_name || 'Unknown Vendor',
      description: transactionData.description,
      transaction_date: transactionData.transaction_date,
      approval_status: transactionData.approval_required ? 'PENDING' : 'AUTO_APPROVED',
      approved_by: transactionData.approval_required ? null : userId,
      approved_at: transactionData.approval_required ? null : new Date().toISOString(),
      created_at: new Date().toISOString(),
      invoice_number: transactionData.invoice_number || null,
      purchase_order_number: transactionData.purchase_order_number || null
    };

    // In production, this would insert into financial_transactions table
    this.mockTransactions.push(newTransaction);

    // Trigger approval workflow if required
    if (transactionData.approval_required) {
      await this.triggerApprovalWorkflow(transactionId, tenantId);
    }

    return newTransaction;
  }

  static async getTransactions(
    tenantId: string,
    filters: {
      case_id?: string;
      transaction_type?: string;
      approval_status?: string;
      start_date?: string;
      end_date?: string;
      page: number;
      limit: number;
    }
  ): Promise<{ transactions: TransactionResponse[]; total: number; summary: TransactionSummary }> {
    let filteredTransactions = [...this.mockTransactions];

    // Apply filters
    if (filters.case_id) {
      filteredTransactions = filteredTransactions.filter(t => t.case_id === filters.case_id);
    }
    if (filters.transaction_type) {
      filteredTransactions = filteredTransactions.filter(t => t.transaction_type === filters.transaction_type);
    }
    if (filters.approval_status) {
      filteredTransactions = filteredTransactions.filter(t => t.approval_status === filters.approval_status);
    }
    if (filters.start_date) {
      filteredTransactions = filteredTransactions.filter(t => t.transaction_date >= filters.start_date!);
    }
    if (filters.end_date) {
      filteredTransactions = filteredTransactions.filter(t => t.transaction_date <= filters.end_date!);
    }

    // Calculate summary
    const summary = this.calculateSummary(filteredTransactions);

    // Apply pagination
    const total = filteredTransactions.length;
    const offset = (filters.page - 1) * filters.limit;
    const paginatedTransactions = filteredTransactions.slice(offset, offset + filters.limit);

    return {
      transactions: paginatedTransactions,
      total,
      summary
    };
  }

  static async approveTransaction(
    transactionId: string,
    tenantId: string,
    userId: string,
    approvalData: z.infer<typeof approveTransactionSchema>
  ): Promise<{ success: boolean; message: string }> {
    // Find transaction
    const transaction = this.mockTransactions.find(t => t.id === transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.approval_status !== 'PENDING') {
      throw new Error('Transaction is not pending approval');
    }

    // Update transaction
    transaction.approval_status = approvalData.approval_status;
    transaction.approved_by = userId;
    transaction.approved_at = new Date().toISOString();

    // If rejected or approved with different amount, update accordingly
    if (approvalData.approved_amount && approvalData.approved_amount !== transaction.amount) {
      transaction.amount = approvalData.approved_amount;
      // Recalculate VAT
      const vatRate = 20; // Default VAT rate
      transaction.net_amount = Number((transaction.amount / (1 + vatRate / 100)).toFixed(2));
      transaction.vat_amount = Number((transaction.amount - transaction.net_amount).toFixed(2));
    }

    // In production, this would update the database and trigger notifications

    return {
      success: true,
      message: `Transaction ${approvalData.approval_status.toLowerCase()} successfully`
    };
  }

  private static calculateSummary(transactions: TransactionResponse[]): TransactionSummary {
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const approvedAmount = transactions
      .filter(t => t.approval_status === 'APPROVED' || t.approval_status === 'AUTO_APPROVED')
      .reduce((sum, t) => sum + t.amount, 0);
    const pendingAmount = transactions
      .filter(t => t.approval_status === 'PENDING')
      .reduce((sum, t) => sum + t.amount, 0);

    // Group by category
    const byCategory = transactions.reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.transaction_type);
      if (existing) {
        existing.count++;
        existing.amount += t.amount;
      } else {
        acc.push({
          category: t.transaction_type,
          count: 1,
          amount: t.amount
        });
      }
      return acc;
    }, [] as Array<{ category: string; count: number; amount: number }>);

    // Group by status
    const byStatus = transactions.reduce((acc, t) => {
      const existing = acc.find(item => item.status === t.approval_status);
      if (existing) {
        existing.count++;
        existing.amount += t.amount;
      } else {
        acc.push({
          status: t.approval_status,
          count: 1,
          amount: t.amount
        });
      }
      return acc;
    }, [] as Array<{ status: string; count: number; amount: number }>);

    return {
      total_transactions: transactions.length,
      total_amount: totalAmount,
      approved_amount: approvedAmount,
      pending_amount: pendingAmount,
      by_category: byCategory,
      by_status: byStatus
    };
  }

  private static async triggerApprovalWorkflow(
    transactionId: string,
    tenantId: string
  ): Promise<void> {
    // In production, this would trigger notification to managers/finance team
    console.log(`Approval workflow triggered for transaction ${transactionId} in tenant ${tenantId}`);
  }
}

// Audit service for financial transactions
class FinancialAuditService {
  static async logTransactionActivity(
    tenantId: string,
    userId: string,
    action: string,
    transactionId: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.log('FINANCIAL TRANSACTION AUDIT:', {
      tenantId,
      userId,
      action,
      resourceType: 'FINANCIAL_TRANSACTION',
      resourceId: transactionId,
      oldValues,
      newValues,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      compliance_required: true
    });
  }
}

// Error handling
function handleError(error: unknown): NextResponse {
  console.error('Financial Transaction API Error:', error);

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

// POST /api/v1/financial/transactions - Record new financial transaction
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
    if (!['LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create financial transactions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // Create transaction
    const newTransaction = await TransactionService.createTransaction(tenantId, user.id, validatedData);

    // Log audit trail
    await FinancialAuditService.logTransactionActivity(
      tenantId,
      user.id,
      'CREATE',
      newTransaction.id,
      null,
      newTransaction,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json(newTransaction, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}

// GET /api/v1/financial/transactions - Get transactions with filtering
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

    // Check permissions
    if (!['LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'LA_EXECUTIVE', 'ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view financial transactions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = {
      case_id: searchParams.get('case_id') || undefined,
      transaction_type: searchParams.get('transaction_type') || undefined,
      approval_status: searchParams.get('approval_status') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      page: Math.max(1, parseInt(searchParams.get('page') || '1')),
      limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    };

    // Get transactions
    const result = await TransactionService.getTransactions(tenantId, filters);

    // Log audit trail
    await FinancialAuditService.logTransactionActivity(
      tenantId,
      user.id,
      'READ',
      'COLLECTION',
      null,
      { filters },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      data: result.transactions,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        pages: Math.ceil(result.total / filters.limit)
      },
      summary: result.summary
    });

  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/v1/financial/transactions/{id}/approve - Approve or reject transaction
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract transaction ID from URL
    const urlParts = request.url.split('/');
    const transactionId = urlParts[urlParts.length - 2]; // Get ID before 'approve'

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
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

    // Check permissions - only managers and finance admins can approve
    if (!['LA_MANAGER', 'LA_EXECUTIVE', 'ADMIN', 'FINANCE_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to approve transactions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = approveTransactionSchema.parse(body);

    // Approve/reject transaction
    const result = await TransactionService.approveTransaction(transactionId, tenantId, user.id, validatedData);

    // Log audit trail
    await FinancialAuditService.logTransactionActivity(
      tenantId,
      user.id,
      'APPROVE',
      transactionId,
      { status: 'PENDING' },
      validatedData,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json(result);

  } catch (error) {
    return handleError(error);
  }
}
