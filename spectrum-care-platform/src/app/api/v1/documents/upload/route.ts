import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-helpers';
import { z } from 'zod';

// AI Document Processing Service
class DocumentAIService {
  static async extractDocumentData(
    fileBuffer: Buffer,
    fileName: string,
    documentType: string
  ): Promise<{
    summary: string;
    key_findings: string[];
    recommendations: string[];
    urgency_score: number;
    compliance_items: string[];
    extracted_dates: Array<{ type: string; date: string }>;
    contacts: Array<{ name: string; role: string; organization: string }>;
    financial_information: Array<{ item: string; amount: number; currency: string }>;
  }> {
    // Simulate AI processing - in production this would use OpenAI, Claude, or similar
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    // Mock AI extraction based on document type
    if (documentType === 'ASSESSMENT_REPORT') {
      return {
        summary: "Educational psychology assessment report identifying significant learning differences and recommending specialized support interventions.",
        key_findings: [
          "Student demonstrates significant challenges in reading comprehension (2 years below chronological age)",
          "Strong visual-spatial processing abilities identified",
          "Attention and concentration difficulties observed in classroom setting",
          "Social communication needs requiring targeted intervention"
        ],
        recommendations: [
          "Implement structured literacy intervention program",
          "Provide visual learning supports and graphic organizers",
          "Consider 1:1 teaching assistant support for core subjects",
          "Refer for speech and language therapy assessment",
          "Implement sensory breaks throughout the school day"
        ],
        urgency_score: 7.5,
        compliance_items: [
          "Assessment completed within statutory 6-week timeframe",
          "Parent consent obtained and documented",
          "School consultation completed as required",
          "Recommendations align with SEND Code of Practice"
        ],
        extracted_dates: [
          { type: "Assessment Date", date: "2025-06-15" },
          { type: "Report Date", date: "2025-07-01" },
          { type: "Review Date", date: "2025-12-01" }
        ],
        contacts: [
          { name: "Dr. Sarah Mitchell", role: "Educational Psychologist", organization: "LA Psychology Service" },
          { name: "Mrs. Jennifer Clarke", role: "SENCO", organization: "Greenfield Primary School" },
          { name: "Ms. Rachel Thompson", role: "Class Teacher", organization: "Greenfield Primary School" }
        ],
        financial_information: [
          { item: "Assessment Fee", amount: 1200.00, currency: "GBP" },
          { item: "Recommended 1:1 Support (Annual)", amount: 18500.00, currency: "GBP" },
          { item: "Specialist Teaching Materials", amount: 450.00, currency: "GBP" }
        ]
      };
    } else if (documentType === 'MEDICAL_REPORT') {
      return {
        summary: "Paediatric neurology assessment identifying autism spectrum condition with recommendations for therapeutic support.",
        key_findings: [
          "Autism spectrum condition diagnosis confirmed",
          "Sensory processing differences identified",
          "Communication delay of approximately 18 months",
          "No associated medical conditions requiring intervention"
        ],
        recommendations: [
          "Referral to specialist autism support team",
          "Occupational therapy for sensory processing",
          "Speech and language therapy - intensive program",
          "Social skills group intervention",
          "Annual medical review recommended"
        ],
        urgency_score: 8.2,
        compliance_items: [
          "NHS assessment completed within referral timeframe",
          "Diagnostic criteria fully documented",
          "Parent feedback incorporated into assessment",
          "Safeguarding considerations reviewed"
        ],
        extracted_dates: [
          { type: "Assessment Date", date: "2025-05-20" },
          { type: "Diagnosis Date", date: "2025-06-10" },
          { type: "Next Review", date: "2026-06-10" }
        ],
        contacts: [
          { name: "Dr. Michael Chen", role: "Consultant Paediatrician", organization: "Regional Children's Hospital" },
          { name: "Ms. Emma Davis", role: "Specialist Nurse", organization: "CAMHS Team" }
        ],
        financial_information: [
          { item: "Diagnostic Assessment", amount: 2400.00, currency: "GBP" },
          { item: "Recommended OT Sessions (12 weeks)", amount: 1800.00, currency: "GBP" },
          { item: "SLT Intensive Program", amount: 3200.00, currency: "GBP" }
        ]
      };
    } else {
      // Generic document processing
      return {
        summary: "Document uploaded and processed successfully. Key information extracted and categorized.",
        key_findings: [
          "Document contains relevant information for EHC assessment",
          "Professional recommendations identified",
          "Contact information extracted"
        ],
        recommendations: [
          "Review document contents with case team",
          "Consider implications for EHC plan development",
          "Follow up on any action items identified"
        ],
        urgency_score: 5.0,
        compliance_items: [
          "Document received and logged",
          "Content reviewed for safeguarding concerns",
          "Information categorized appropriately"
        ],
        extracted_dates: [
          { type: "Document Date", date: new Date().toISOString().split('T')[0] }
        ],
        contacts: [],
        financial_information: []
      };
    }
  }

  static async performOCR(fileBuffer: Buffer, fileName: string): Promise<string> {
    // Simulate OCR processing - in production would use Tesseract, AWS Textract, or similar
    if (fileName.toLowerCase().includes('pdf')) {
      return "This is extracted text from PDF document using OCR technology. The document contains structured information about assessment results, recommendations, and next steps for support.";
    } else if (fileName.toLowerCase().includes('doc')) {
      return "Extracted text from Word document containing detailed assessment information, professional observations, and intervention recommendations.";
    } else {
      return "Text content extracted from uploaded document.";
    }
  }

  static async scanForVirus(fileBuffer: Buffer): Promise<{ status: 'CLEAN' | 'INFECTED' | 'ERROR'; details?: string }> {
    // Simulate virus scanning - in production would integrate with ClamAV or similar
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock virus scan - in real implementation would scan actual file
    if (fileBuffer.length > 0) {
      return { status: 'CLEAN' };
    } else {
      return { status: 'ERROR', details: 'File appears to be empty' };
    }
  }
}

// Document storage service
class DocumentStorageService {
  static async storeDocument(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    tenantId: string
  ): Promise<{ filePath: string; checksum: string }> {
    // Generate unique file path
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `documents/${tenantId}/${timestamp}_${randomId}_${sanitizedFileName}`;

    // Calculate checksum
    const crypto = require('crypto');
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // In production, this would upload to AWS S3, Azure Blob Storage, or similar
    console.log(`Document stored at: ${filePath} (${fileBuffer.length} bytes)`);

    return { filePath, checksum };
  }

  static async getSignedUrl(filePath: string, expirationMinutes: number = 60): Promise<string> {
    // In production, would generate signed URL for secure access
    return `https://secure-storage.example.com/${filePath}?expires=${Date.now() + (expirationMinutes * 60 * 1000)}`;
  }
}

// Document service
class DocumentService {
  private static mockDocuments: any[] = [];

  static async createDocument(
    tenantId: string,
    userId: string,
    caseId: string,
    fileData: {
      fileName: string;
      originalFileName: string;
      mimeType: string;
      fileSize: number;
      filePath: string;
      checksum: string;
    },
    documentData: {
      documentType: string;
      documentCategory: string;
      isConfidential: boolean;
      accessPermissions: any;
      tags: string[];
    },
    aiData: any,
    ocrText: string,
    virusScanResult: any
  ): Promise<any> {
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const document = {
      id: documentId,
      case_id: caseId,
      tenant_id: tenantId,
      uploaded_by_id: userId,
      file_name: fileData.fileName,
      original_file_name: fileData.originalFileName,
      file_type: this.getFileTypeFromMime(fileData.mimeType),
      mime_type: fileData.mimeType,
      file_size: fileData.fileSize,
      file_path: fileData.filePath,
      document_type: documentData.documentType,
      document_category: documentData.documentCategory,
      version: 1,
      is_confidential: documentData.isConfidential,
      access_permissions: documentData.accessPermissions,
      ai_extracted_data: aiData,
      ocr_text: ocrText,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: null,
      checksum: fileData.checksum,
      encryption_key_id: null,
      tags: documentData.tags,
      metadata: {},
      virus_scan_status: virusScanResult.status,
      virus_scan_result: virusScanResult.details || null
    };

    // In production, this would insert into documents table
    this.mockDocuments.push(document);

    return document;
  }

  private static getFileTypeFromMime(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('msword')) return 'WORD';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'EXCEL';
    if (mimeType.includes('image')) return 'IMAGE';
    if (mimeType.includes('text')) return 'TEXT';
    return 'OTHER';
  }
}

// Audit service for documents
class DocumentAuditService {
  static async logDocumentActivity(
    tenantId: string,
    userId: string,
    action: string,
    documentId: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    console.log('DOCUMENT AUDIT LOG:', {
      tenantId,
      userId,
      action,
      resourceType: 'DOCUMENT',
      resourceId: documentId,
      metadata,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      gdpr_relevant: true
    });
  }
}

// Error handling
function handleError(error: unknown): NextResponse {
  console.error('Document Upload API Error:', error);

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

// POST /api/v1/documents/upload - Upload and process documents with AI extraction
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
    if (!['PARENT', 'LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'PROFESSIONAL', 'ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to upload documents' },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('case_id') as string;
    const documentType = formData.get('document_type') as string || 'OTHER';
    const documentCategory = formData.get('document_category') as string || 'GENERAL';
    const isConfidential = formData.get('is_confidential') === 'true';
    const accessPermissions = JSON.parse(formData.get('access_permissions') as string || '{}');
    const tags = JSON.parse(formData.get('tags') as string || '[]');

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Step 1: Virus scan
    const virusScanResult = await DocumentAIService.scanForVirus(fileBuffer);
    if (virusScanResult.status === 'INFECTED') {
      return NextResponse.json(
        { error: 'File failed virus scan. Upload rejected.' },
        { status: 400 }
      );
    }

    // Step 2: Store document
    const { filePath, checksum } = await DocumentStorageService.storeDocument(
      fileBuffer,
      file.name,
      file.type,
      tenantId
    );

    // Step 3: Perform OCR if needed
    let ocrText = '';
    if (['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      ocrText = await DocumentAIService.performOCR(fileBuffer, file.name);
    }

    // Step 4: AI extraction
    const aiExtractedData = await DocumentAIService.extractDocumentData(
      fileBuffer,
      file.name,
      documentType
    );

    // Step 5: Create document record
    const document = await DocumentService.createDocument(
      tenantId,
      user.id,
      caseId,
      {
        fileName: file.name,
        originalFileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        filePath,
        checksum
      },
      {
        documentType,
        documentCategory,
        isConfidential,
        accessPermissions,
        tags
      },
      aiExtractedData,
      ocrText,
      virusScanResult
    );

    // Log audit trail
    await DocumentAuditService.logDocumentActivity(
      tenantId,
      user.id,
      'UPLOAD',
      document.id,
      {
        fileName: file.name,
        fileSize: file.size,
        documentType,
        aiProcessed: true
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    // Return response
    return NextResponse.json({
      id: document.id,
      file_name: document.file_name,
      file_type: document.file_type,
      file_size: document.file_size,
      ai_extracted_data: document.ai_extracted_data,
      processing_status: 'COMPLETED',
      virus_scan_status: document.virus_scan_status,
      created_at: document.created_at,
      download_url: await DocumentStorageService.getSignedUrl(filePath, 60)
    }, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}

// GET /api/v1/documents/upload - Health check for upload endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ready',
    max_file_size: '50MB',
    supported_types: [
      'PDF', 'Word Documents', 'Images (JPEG, PNG, GIF)', 'Text Files'
    ],
    features: [
      'AI Content Extraction',
      'OCR Text Recognition',
      'Virus Scanning',
      'Secure Storage',
      'Audit Logging'
    ]
  });
}
