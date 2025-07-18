import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/database';
import { OpenAIService } from '@/services/openai';
import formidable from 'formidable';
import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import pdf from 'pdf-parse';

// File upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain'
  ],
  uploadDir: process.env.UPLOAD_DIR || './uploads'
};

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const childId = formData.get('childId') as string;
    const caseId = formData.get('caseId') as string;
    const documentType = formData.get('documentType') as string || 'general';
    const documentCategory = formData.get('documentCategory') as string || 'uploaded';
    const isConfidential = formData.get('isConfidential') === 'true';

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        message: validation.error
      }, { status: 400 });
    }

    // Verify user has access to child/case
    if (childId) {
      const accessCheck = await verifyChildAccess(user.id, childId, user.role);
      if (!accessCheck) {
        return NextResponse.json({
          success: false,
          message: 'Access denied to this child'
        }, { status: 403 });
      }
    }

    if (caseId) {
      const accessCheck = await verifyCaseAccess(user.id, caseId, user.role);
      if (!accessCheck) {
        return NextResponse.json({
          success: false,
          message: 'Access denied to this case'
        }, { status: 403 });
      }
    }

    // Process and store file
    const fileResult = await processAndStoreFile(file, user.id);

    // Extract text content
    const textContent = await extractTextFromFile(fileResult.filePath, file.type);

    // AI analysis if text content available
    let aiAnalysis = null;
    if (textContent && textContent.length > 100) {
      try {
        aiAnalysis = await OpenAIService.analyzeDocument({
          text: textContent,
          documentType,
          childId,
          options: {
            extractTimeline: true,
            identifyNeeds: true,
            generateRecommendations: true,
            performSentimentAnalysis: true
          }
        });
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        // Continue without AI analysis
      }
    }

    // Save to database
    const documentRecord = await db.query(`
      INSERT INTO documents (
        case_id, child_id, uploaded_by_id, file_name, original_file_name,
        file_type, mime_type, file_size, file_path, document_type,
        document_category, is_confidential, ai_extracted_data, ocr_text,
        checksum, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
      RETURNING id
    `, [
      caseId || null,
      childId || null,
      user.id,
      fileResult.fileName,
      file.name,
      getFileExtension(file.name),
      file.type,
      file.size,
      fileResult.filePath,
      documentType,
      documentCategory,
      isConfidential,
      aiAnalysis ? JSON.stringify(aiAnalysis) : null,
      textContent,
      fileResult.checksum
    ]);

    const documentId = documentRecord.rows[0].id;

    // Create activity log
    await logActivity(user.id, 'DOCUMENT_UPLOAD', {
      documentId,
      fileName: file.name,
      fileSize: file.size,
      documentType,
      childId,
      caseId
    });

    // Send notifications to relevant users
    if (childId || caseId) {
      await sendUploadNotifications(documentId, user.id, childId, caseId);
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded and processed successfully',
      data: {
        documentId,
        fileName: fileResult.fileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        hasTextContent: !!textContent,
        hasAiAnalysis: !!aiAnalysis,
        aiAnalysis: aiAnalysis ? {
          keyInformation: aiAnalysis.keyInformation,
          identifiedNeeds: aiAnalysis.identifiedNeeds,
          recommendations: aiAnalysis.recommendations,
          confidence: aiAnalysis.confidence
        } : null
      }
    }, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'File upload failed'
    }, { status: 500 });
  }
}

// GET - Retrieve file or file metadata
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');
    const download = url.searchParams.get('download') === 'true';

    if (!documentId) {
      return NextResponse.json({
        success: false,
        message: 'Document ID required'
      }, { status: 400 });
    }

    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Get document record
    const documentResult = await db.query(`
      SELECT d.*, c.first_name, c.last_name, u.first_name as uploader_first_name, u.last_name as uploader_last_name
      FROM documents d
      LEFT JOIN children c ON d.child_id = c.id
      LEFT JOIN users u ON d.uploaded_by_id = u.id
      WHERE d.id = $1
    `, [documentId]);

    if (documentResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Document not found'
      }, { status: 404 });
    }

    const document = documentResult.rows[0];

    // Verify access permissions
    const hasAccess = await verifyDocumentAccess(user.id, user.role, document);
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        message: 'Access denied'
      }, { status: 403 });
    }

    if (download) {
      // Serve file for download
      try {
        const fileBuffer = await fs.readFile(document.file_path);

        // Log access
        await logDocumentAccess(user.id, documentId, 'download');

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': document.mime_type,
            'Content-Disposition': `attachment; filename="${document.original_file_name}"`,
            'Content-Length': document.file_size.toString()
          }
        });
      } catch (fileError) {
        console.error('File read error:', fileError);
        return NextResponse.json({
          success: false,
          message: 'File not accessible'
        }, { status: 404 });
      }
    } else {
      // Return document metadata
      await logDocumentAccess(user.id, documentId, 'view');

      return NextResponse.json({
        success: true,
        data: {
          id: document.id,
          fileName: document.file_name,
          originalName: document.original_file_name,
          fileType: document.file_type,
          mimeType: document.mime_type,
          fileSize: document.file_size,
          documentType: document.document_type,
          documentCategory: document.document_category,
          isConfidential: document.is_confidential,
          uploadedAt: document.created_at,
          uploadedBy: {
            name: `${document.uploader_first_name} ${document.uploader_last_name}`
          },
          childInfo: document.child_id ? {
            id: document.child_id,
            name: `${document.first_name} ${document.last_name}`
          } : null,
          hasTextContent: !!document.ocr_text,
          hasAiAnalysis: !!document.ai_extracted_data,
          aiAnalysis: document.ai_extracted_data ? JSON.parse(document.ai_extracted_data) : null
        }
      });
    }

  } catch (error) {
    console.error('File retrieval error:', error);
    return NextResponse.json({
      success: false,
      message: 'File retrieval failed'
    }, { status: 500 });
  }
}

// File validation
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds limit of ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`
    };
  }

  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed'
    };
  }

  return { valid: true };
}

// Process and store file securely
async function processAndStoreFile(file: File, userId: string): Promise<{
  fileName: string;
  filePath: string;
  checksum: string;
}> {
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // Generate secure filename
  const fileExtension = getFileExtension(file.name);
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const fileName = `${timestamp}_${randomString}${fileExtension}`;

  // Create directory structure
  const userDir = path.join(UPLOAD_CONFIG.uploadDir, userId);
  await fs.mkdir(userDir, { recursive: true });

  const filePath = path.join(userDir, fileName);

  // Calculate checksum
  const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  // Write file
  await fs.writeFile(filePath, fileBuffer);

  return {
    fileName,
    filePath,
    checksum
  };
}

// Extract text from various file types
async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    switch (mimeType) {
      case 'application/pdf':
        return await extractTextFromPDF(filePath);

      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
      case 'image/webp':
        return await extractTextFromImage(filePath);

      case 'text/plain':
        return await fs.readFile(filePath, 'utf-8');

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        // Would need additional libraries for Word document processing
        return '';

      default:
        return '';
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return '';
  }
}

// Extract text from PDF
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return '';
  }
}

// Extract text from image using OCR
async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {} // Suppress logs
    });
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    return '';
  }
}

// Utility functions
function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

async function verifyChildAccess(userId: string, childId: string, userRole: string): Promise<boolean> {
  if (userRole === 'ADMIN') return true;

  if (userRole === 'PARENT') {
    const result = await db.query(`
      SELECT 1 FROM family_relationships
      WHERE parent_user_id = $1 AND child_id = $2
    `, [userId, childId]);
    return result.rows.length > 0;
  }

  // Add other role checks here
  return false;
}

async function verifyCaseAccess(userId: string, caseId: string, userRole: string): Promise<boolean> {
  if (userRole === 'ADMIN') return true;

  const result = await db.query(`
    SELECT 1 FROM ehc_cases ec
    LEFT JOIN children c ON ec.child_id = c.id
    LEFT JOIN family_relationships fr ON c.id = fr.child_id
    WHERE ec.id = $1 AND (
      ec.assigned_officer_id = $2 OR
      ec.assigned_caseworker_id = $2 OR
      fr.parent_user_id = $2
    )
  `, [caseId, userId]);

  return result.rows.length > 0;
}

async function verifyDocumentAccess(userId: string, userRole: string, document: any): Promise<boolean> {
  if (userRole === 'ADMIN') return true;
  if (document.uploaded_by_id === userId) return true;

  if (document.child_id) {
    return await verifyChildAccess(userId, document.child_id, userRole);
  }

  if (document.case_id) {
    return await verifyCaseAccess(userId, document.case_id, userRole);
  }

  return false;
}

async function logActivity(userId: string, action: string, metadata: any): Promise<void> {
  await db.query(`
    INSERT INTO activity_logs (user_id, action, metadata, created_at)
    VALUES ($1, $2, $3, NOW())
  `, [userId, action, JSON.stringify(metadata)]);
}

async function logDocumentAccess(userId: string, documentId: string, accessType: string): Promise<void> {
  await db.query(`
    INSERT INTO document_access_logs (document_id, user_id, access_type, accessed_at)
    VALUES ($1, $2, $3, NOW())
  `, [documentId, userId, accessType]);
}

async function sendUploadNotifications(documentId: string, uploaderId: string, childId?: string, caseId?: string): Promise<void> {
  // Get relevant users to notify
  const notifyUsers = [];

  if (childId) {
    const childUsers = await db.query(`
      SELECT DISTINCT u.id
      FROM users u
      LEFT JOIN family_relationships fr ON u.id = fr.parent_user_id
      LEFT JOIN ehc_cases ec ON $1 = ec.child_id
      WHERE (fr.child_id = $1 OR ec.assigned_officer_id = u.id OR ec.assigned_caseworker_id = u.id)
        AND u.id != $2
    `, [childId, uploaderId]);
    notifyUsers.push(...childUsers.rows);
  }

  if (caseId) {
    const caseUsers = await db.query(`
      SELECT DISTINCT u.id
      FROM users u
      JOIN ehc_cases ec ON (u.id = ec.assigned_officer_id OR u.id = ec.assigned_caseworker_id)
      WHERE ec.id = $1 AND u.id != $2
    `, [caseId, uploaderId]);
    notifyUsers.push(...caseUsers.rows);
  }

  // Send notifications
  for (const user of notifyUsers) {
    await db.query(`
      INSERT INTO notifications (user_id, title, message, notification_type, related_id, created_at)
      VALUES ($1, $2, $3, 'DOCUMENT_UPLOAD', $4, NOW())
    `, [
      user.id,
      'New Document Uploaded',
      'A new document has been uploaded to a case you are involved with.',
      documentId
    ]);
  }
}
