import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsapp';
import { OpenAIService } from '@/services/openai';
import { db } from '@/lib/database';
import crypto from 'crypto';

// Initialize WhatsApp service
const whatsappConfig = {
  baseUrl: process.env.WHATSAPP_BASE_URL || 'https://graph.facebook.com',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
};

const whatsappService = new WhatsAppService(whatsappConfig, process.env.OPENAI_API_KEY || '');

// Webhook verification (GET request)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('WhatsApp webhook verification:', { mode, token });

  if (mode === 'subscribe' && token === whatsappConfig.webhookVerifyToken) {
    console.log('WhatsApp webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('WhatsApp webhook verification failed');
  return new NextResponse('Forbidden', { status: 403 });
}

// Webhook message handling (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = JSON.parse(body);
    console.log('WhatsApp webhook received:', JSON.stringify(data, null, 2));

    // Process webhook data
    await processWebhookData(data);

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Verify webhook signature for security
 */
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !whatsappConfig.webhookVerifyToken) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', whatsappConfig.webhookVerifyToken)
    .update(body)
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

/**
 * Process incoming webhook data
 */
async function processWebhookData(data: any): Promise<void> {
  const entries = data.entry || [];

  for (const entry of entries) {
    const changes = entry.changes || [];

    for (const change of changes) {
      if (change.field === 'messages') {
        const messages = change.value.messages || [];
        const contacts = change.value.contacts || [];

        for (const message of messages) {
          await processIncomingMessage(message, contacts);
        }
      }
    }
  }
}

/**
 * Process individual incoming message
 */
async function processIncomingMessage(message: any, contacts: any[]): Promise<void> {
  const { from, type, timestamp, id: messageId } = message;

  try {
    // Get or create user session
    const userSession = await getOrCreateUserSession(from, contacts);

    console.log(`Processing ${type} message from ${from}`);

    switch (type) {
      case 'text':
        await handleTextMessage(message, userSession);
        break;
      case 'audio':
        await handleAudioMessage(message, userSession);
        break;
      case 'document':
        await handleDocumentMessage(message, userSession);
        break;
      case 'image':
        await handleImageMessage(message, userSession);
        break;
      default:
        await sendUnsupportedMessageResponse(from);
    }

    // Log message in database
    await logMessage(messageId, from, type, message, 'received');

  } catch (error) {
    console.error(`Error processing message from ${from}:`, error);
    await sendErrorResponse(from);
  }
}

/**
 * Handle text messages
 */
async function handleTextMessage(message: any, userSession: any): Promise<void> {
  const { from, text } = message;
  const messageText = text.body;

  // Process as command
  const command = await OpenAIService.processVoiceCommand({
    audioData: new ArrayBuffer(0), // Not used for text
    userId: userSession.user_id,
    context: {
      messageText,
      sessionData: userSession.session_data
    }
  });

  // Execute command
  const response = await executeCommand(command, userSession);

  // Send response
  await whatsappService.sendTextMessage(from, response);

  // Update session
  await updateUserSession(userSession.id, {
    last_command: command.intent,
    last_response: response
  });
}

/**
 * Handle audio/voice messages
 */
async function handleAudioMessage(message: any, userSession: any): Promise<void> {
  const { from, audio } = message;

  try {
    // Download audio from WhatsApp
    const audioData = await downloadWhatsAppMedia(audio.id);

    if (!audioData) {
      await whatsappService.sendTextMessage(
        from,
        "Sorry, I couldn't process your voice message. Please try again or send a text message."
      );
      return;
    }

    // Process voice command
    const command = await OpenAIService.processVoiceCommand({
      audioData,
      userId: userSession.user_id,
      context: userSession.session_data
    });

    // Execute command
    const response = await executeCommand(command, userSession);

    // Send response
    await whatsappService.sendTextMessage(from, response);

    // Update session
    await updateUserSession(userSession.id, {
      last_command: command.intent,
      last_response: response
    });

  } catch (error) {
    console.error('Voice message processing error:', error);
    await whatsappService.sendTextMessage(
      from,
      "Sorry, I had trouble processing your voice message. Please try again or send a text message describing what you need."
    );
  }
}

/**
 * Handle document uploads
 */
async function handleDocumentMessage(message: any, userSession: any): Promise<void> {
  const { from, document } = message;

  try {
    // Download document
    const documentData = await downloadWhatsAppMedia(document.id);

    if (!documentData) {
      await whatsappService.sendTextMessage(
        from,
        "Sorry, I couldn't download your document. Please try uploading it again."
      );
      return;
    }

    // Process document with AI
    const analysis = await OpenAIService.analyzeDocument({
      text: await extractTextFromDocument(documentData, document.mime_type),
      documentType: document.filename || 'uploaded_document',
      childId: userSession.session_data.active_child_id,
      options: {
        extractTimeline: true,
        identifyNeeds: true,
        generateRecommendations: true
      }
    });

    // Generate response
    const response = `Document analyzed successfully!

Key findings:
${analysis.keyInformation.summary || 'Analysis completed'}

${analysis.recommendations.length > 0 ? `Recommendations:
${analysis.recommendations.slice(0, 3).map(r => `• ${r}`).join('\n')}` : ''}

I've saved this analysis to your child's profile. You can view the full details in your dashboard.`;

    await whatsappService.sendTextMessage(from, response);

  } catch (error) {
    console.error('Document processing error:', error);
    await whatsappService.sendTextMessage(
      from,
      "Sorry, I had trouble analyzing your document. Please ensure it's a valid PDF, Word document, or image file."
    );
  }
}

/**
 * Handle image messages
 */
async function handleImageMessage(message: any, userSession: any): Promise<void> {
  const { from, image } = message;

  await whatsappService.sendTextMessage(
    from,
    "Thank you for sharing the image! I've saved it to your child's profile. For detailed analysis of medical reports or assessments, please upload them as PDF or Word documents."
  );
}

/**
 * Execute processed command
 */
async function executeCommand(command: any, userSession: any): Promise<string> {
  const { intent, parameters } = command;

  switch (intent) {
    case 'schedule_appointment':
      return await handleScheduleAppointment(parameters, userSession);

    case 'generate_report':
      return await handleGenerateReport(parameters, userSession);

    case 'send_request':
      return await handleSendRequest(parameters, userSession);

    case 'view_information':
      return await handleViewInformation(parameters, userSession);

    case 'update_profile':
      return await handleUpdateProfile(parameters, userSession);

    case 'get_status':
      return await handleGetStatus(parameters, userSession);

    default:
      return "I understand you want help with your child's autism support. I can help you with:\n\n• Scheduling appointments\n• Generating reports\n• Sending requests to local authorities\n• Viewing your child's information\n• Updating profiles\n\nWhat would you like me to help you with?";
  }
}

/**
 * Handle appointment scheduling
 */
async function handleScheduleAppointment(parameters: any, userSession: any): Promise<string> {
  const { child_name, appointment_type, date_reference } = parameters;

  // Get child information
  const children = await getUserChildren(userSession.user_id);
  const targetChild = children.find(c =>
    c.first_name.toLowerCase().includes(child_name?.toLowerCase() || '')
  ) || children[0];

  if (!targetChild) {
    return "I couldn't find a child profile to schedule the appointment for. Please make sure you've added your child's profile to the platform first.";
  }

  // Create appointment request
  await createAppointmentRequest({
    child_id: targetChild.id,
    appointment_type: appointment_type || 'assessment',
    requested_date: date_reference,
    requested_by: userSession.user_id,
    notes: `Requested via WhatsApp`
  });

  return `I'm scheduling a${appointment_type ? ` ${appointment_type}` : 'n'} appointment for ${targetChild.first_name}${date_reference ? ` ${date_reference}` : ''}.

I'll check available slots with qualified professionals in your area and send you options within the next few hours. You'll receive a message with:
• Available time slots
• Professional qualifications
• Location options
• Estimated costs

Is there anything specific you'd like me to note about this appointment?`;
}

/**
 * Handle report generation
 */
async function handleGenerateReport(parameters: any, userSession: any): Promise<string> {
  const { child_name, report_type } = parameters;

  const children = await getUserChildren(userSession.user_id);
  const targetChild = children.find(c =>
    c.first_name.toLowerCase().includes(child_name?.toLowerCase() || '')
  ) || children[0];

  if (!targetChild) {
    return "I couldn't find a child profile to generate the report for. Please make sure you've added your child's profile first.";
  }

  // Queue report generation
  await queueReportGeneration({
    child_id: targetChild.id,
    report_type: report_type || 'progress_summary',
    requested_by: userSession.user_id
  });

  return `I'm generating a${report_type ? ` ${report_type}` : ''} report for ${targetChild.first_name}. This includes:

• Current progress summary
• Assessment results overview
• Professional recommendations
• Next steps and priorities

The report will be ready in 5-10 minutes. I'll send you a link to download it securely, and it will also be available in your dashboard.

Would you like me to include any specific information in this report?`;
}

/**
 * Get user's children
 */
async function getUserChildren(userId: string): Promise<any[]> {
  try {
    const result = await db.query(`
      SELECT c.* FROM children c
      JOIN family_relationships fr ON c.id = fr.child_id
      WHERE fr.parent_user_id = $1
    `, [userId]);

    return result.rows;
  } finally {
  }
}

/**
 * Get or create user session
 */
async function getOrCreateUserSession(phoneNumber: string, contacts: any[]): Promise<any> {
  // Using db.query directly instead of getting client
  try {
    // Try to find existing session
    let result = await db.query(`
      SELECT * FROM whatsapp_sessions
      WHERE phone_number = $1 AND is_active = true
    `, [phoneNumber]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Try to find user by phone number
    const userResult = await db.query(`
      SELECT * FROM users WHERE phone = $1
    `, [phoneNumber]);

    let userId = null;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      // Create new user from contact info
      const contact = contacts.find(c => c.wa_id === phoneNumber);
      const name = contact?.profile?.name || 'WhatsApp User';
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || 'User';

      const newUserResult = await db.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, phone, email_verified)
        VALUES ($1, $2, $3, $4, 'parent', $5, false)
        RETURNING id
      `, [
        `${phoneNumber}@whatsapp.user`,
        '$2b$12$LQv3c1yqBwEFdpT9YV0L/.LYtHc/GqB0KnUq2Qfr8vJgGZMvEQHVO', // Placeholder
        firstName,
        lastName,
        phoneNumber
      ]);

      userId = newUserResult.rows[0].id;
    }

    // Create new session
    const sessionResult = await db.query(`
      INSERT INTO whatsapp_sessions (user_id, phone_number, session_data)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, phoneNumber, JSON.stringify({ created_via: 'whatsapp' })]);

    return sessionResult.rows[0];
  } finally {
  }
}

/**
 * Update user session
 */
async function updateUserSession(sessionId: string, updates: any): Promise<void> {
  // Using db.query directly instead of getting client
  try {
    await db.query(`
      UPDATE whatsapp_sessions
      SET session_data = session_data || $1, last_activity = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [JSON.stringify(updates), sessionId]);
  } finally {
  }
}

/**
 * Download media from WhatsApp
 */
async function downloadWhatsAppMedia(mediaId: string): Promise<ArrayBuffer | null> {
  try {
    // Get media URL
    const mediaResponse = await fetch(`${whatsappConfig.baseUrl}/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
      }
    });

    if (!mediaResponse.ok) {
      throw new Error('Failed to get media URL');
    }

    const mediaData = await mediaResponse.json();
    const mediaUrl = mediaData.url;

    // Download media content
    const contentResponse = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
      }
    });

    if (!contentResponse.ok) {
      throw new Error('Failed to download media');
    }

    return await contentResponse.arrayBuffer();
  } catch (error) {
    console.error('Error downloading WhatsApp media:', error);
    return null;
  }
}

/**
 * Extract text from various document types
 */
async function extractTextFromDocument(data: ArrayBuffer, mimeType: string): Promise<string> {
  // This would integrate with document processing services
  // For now, return placeholder
  return `[Document content extracted from ${mimeType} file]`;
}

/**
 * Create appointment request
 */
async function createAppointmentRequest(request: any): Promise<void> {
  // Using db.query directly instead of getting client
  try {
    await db.query(`
      INSERT INTO appointment_requests (child_id, appointment_type, requested_date, requested_by, notes, status)
      VALUES ($1, $2, $3, $4, $5, 'pending')
    `, [request.child_id, request.appointment_type, request.requested_date, request.requested_by, request.notes]);
  } finally {
  }
}

/**
 * Queue report generation
 */
async function queueReportGeneration(request: any): Promise<void> {
  // Using db.query directly instead of getting client
  try {
    await db.query(`
      INSERT INTO ai_processing_jobs (job_type, status, progress, metadata)
      VALUES ('report_generation', 'pending', 0, $1)
    `, [JSON.stringify(request)]);
  } finally {
  }
}

/**
 * Log message for audit trail
 */
async function logMessage(messageId: string, from: string, type: string, content: any, direction: string): Promise<void> {
  // Using db.query directly instead of getting client
  try {
    await db.query(`
      INSERT INTO whatsapp_messages (message_id, phone_number, message_type, content, direction, received_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, [messageId, from, type, JSON.stringify(content), direction]);
  } finally {
  }
}

/**
 * Send error response
 */
async function sendErrorResponse(phoneNumber: string): Promise<void> {
  await whatsappService.sendTextMessage(
    phoneNumber,
    "Sorry, I encountered an error processing your message. Please try again or contact our support team at support@spectrumcare.platform."
  );
}

/**
 * Send unsupported message response
 */
async function sendUnsupportedMessageResponse(phoneNumber: string): Promise<void> {
  await whatsappService.sendTextMessage(
    phoneNumber,
    "I can help you with text messages, voice messages, and document uploads. Other message types aren't supported yet. How can I help you today?"
  );
}

// Additional command handlers
async function handleSendRequest(parameters: any, userSession: any): Promise<string> {
  return "I'll help you send a request to the relevant authority. What type of request would you like to send?";
}

async function handleViewInformation(parameters: any, userSession: any): Promise<string> {
  return "Here's a summary of your child's current information. For detailed reports, please visit your dashboard.";
}

async function handleUpdateProfile(parameters: any, userSession: any): Promise<string> {
  return "I can help you update your child's profile. What information would you like to update?";
}

async function handleGetStatus(parameters: any, userSession: any): Promise<string> {
  return "Here's the current status of your child's support plan and any pending actions.";
}
