import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppVoiceService } from '@/lib/services/whatsapp-voice-service';
import { db } from '@/lib/database';

const whatsappService = new WhatsAppVoiceService();

// GET - Webhook verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('WhatsApp webhook verification:', { mode, token });

    // Verify webhook
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      console.log('WhatsApp webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.log('WhatsApp webhook verification failed');
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
    }
  } catch (error) {
    console.error('Webhook verification error:', error);
    return NextResponse.json({ error: 'Verification error' }, { status: 500 });
  }
}

// POST - Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Process each entry in the webhook
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await processMessagesChange(change.value);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}

async function processMessagesChange(value: any) {
  try {
    const messages = value.messages || [];
    const contacts = value.contacts || [];

    for (const message of messages) {
      await processIncomingMessage(message, contacts);
    }
  } catch (error) {
    console.error('Error processing messages change:', error);
  }
}

async function processIncomingMessage(message: any, contacts: any[]) {
  try {
    const phoneNumber = message.from;
    const messageId = message.id;
    const timestamp = message.timestamp;

    // Find contact info
    const contact = contacts.find(c => c.wa_id === phoneNumber);
    const contactName = contact?.profile?.name || 'Unknown';

    console.log(`Processing message from ${contactName} (${phoneNumber}):`, message);

    // Get or create user from phone number
    const user = await getUserByPhoneNumber(phoneNumber);
    if (!user) {
      await sendWelcomeMessage(phoneNumber, contactName);
      return;
    }

    // Process different message types
    if (message.type === 'audio') {
      await handleAudioMessage(message, user);
    } else if (message.type === 'text') {
      await handleTextMessage(message, user);
    } else if (message.type === 'interactive') {
      await handleInteractiveMessage(message, user);
    } else if (message.type === 'button') {
      await handleButtonMessage(message, user);
    } else {
      await sendUnsupportedMessageResponse(phoneNumber);
    }

    // Mark message as read
    await markMessageAsRead(messageId);

  } catch (error) {
    console.error('Error processing individual message:', error);
  }
}

async function handleAudioMessage(message: any, user: any) {
  try {
    const phoneNumber = message.from;
    const audioId = message.audio.id;

    // Download audio from WhatsApp
    const audioUrl = await downloadWhatsAppMedia(audioId);

    // Send typing indicator
    await sendTypingIndicator(phoneNumber, 'typing_on');

    // Process voice command
    const response = await whatsappService.processVoiceMessage(
      phoneNumber,
      audioUrl,
      message.id,
      user.id
    );

    // Send response
    await whatsappService.sendWhatsAppMessage(phoneNumber, response);

    // Stop typing indicator
    await sendTypingIndicator(phoneNumber, 'typing_off');

    // Log interaction
    await logWhatsAppInteraction({
      userId: user.id,
      phoneNumber,
      messageType: 'audio',
      messageContent: 'Voice message',
      responseType: response.messageType,
      responseContent: response.content
    });

  } catch (error) {
    console.error('Error handling audio message:', error);
    await whatsappService.sendWhatsAppMessage(message.from, {
      messageType: 'text',
      content: 'Sorry, I had trouble processing your voice message. Please try again or type your request.'
    });
  }
}

async function handleTextMessage(message: any, user: any) {
  try {
    const phoneNumber = message.from;
    const text = message.text.body.toLowerCase();

    let response;

    // Handle common text commands
    if (text.includes('help') || text.includes('menu')) {
      response = await getHelpMenuResponse();
    } else if (text.includes('plan') && text.includes('status')) {
      response = await getQuickPlanStatus(user.id);
    } else if (text.includes('appointment')) {
      response = await getQuickAppointments(user.id);
    } else if (text.includes('voice') || text.includes('audio')) {
      response = {
        messageType: 'text' as const,
        content: '🎙️ Send me a voice message and I\'ll help you with:\n\n• Check EHC plan status\n• Book appointments\n• View progress updates\n• Find specialists\n• Add notes\n• Crisis support\n\nJust press and hold the microphone button and speak naturally!'
      };
    } else {
      // Process as general query using AI
      response = await processGeneralTextQuery(text, user);
    }

    await whatsappService.sendWhatsAppMessage(phoneNumber, response);

    // Log interaction
    await logWhatsAppInteraction({
      userId: user.id,
      phoneNumber,
      messageType: 'text',
      messageContent: message.text.body,
      responseType: response.messageType,
      responseContent: response.content
    });

  } catch (error) {
    console.error('Error handling text message:', error);
    await whatsappService.sendWhatsAppMessage(message.from, {
      messageType: 'text',
      content: 'Sorry, I encountered an error. Please try again.'
    });
  }
}

async function handleInteractiveMessage(message: any, user: any) {
  try {
    const phoneNumber = message.from;
    const interactive = message.interactive;

    if (interactive.type === 'button_reply') {
      const buttonId = interactive.button_reply.id;
      const response = await handleButtonAction(buttonId, user);
      await whatsappService.sendWhatsAppMessage(phoneNumber, response);
    } else if (interactive.type === 'list_reply') {
      const listId = interactive.list_reply.id;
      const response = await handleListAction(listId, user);
      await whatsappService.sendWhatsAppMessage(phoneNumber, response);
    }

  } catch (error) {
    console.error('Error handling interactive message:', error);
  }
}

async function handleButtonMessage(message: any, user: any) {
  try {
    const phoneNumber = message.from;
    const buttonPayload = message.button.payload;

    const response = await handleButtonAction(buttonPayload, user);
    await whatsappService.sendWhatsAppMessage(phoneNumber, response);

  } catch (error) {
    console.error('Error handling button message:', error);
  }
}

async function handleButtonAction(buttonId: string, user: any) {
  switch (buttonId) {
    case 'book_medical_assessment':
      return {
        messageType: 'text' as const,
        content: '🏥 I\'ll help you book a medical assessment. Let me check available specialists near you...\n\nFor fastest booking, you can also:\n📱 Visit: app.spectrumcare.platform/book-assessment\n📞 Call: 0800 123 4567'
      };

    case 'book_therapy_session':
      return {
        messageType: 'interactive' as const,
        content: 'What type of therapy are you looking for?',
        interactiveElements: [
          { type: 'button', title: 'Occupational Therapy', payload: 'book_ot' },
          { type: 'button', title: 'ABA Therapy', payload: 'book_aba' },
          { type: 'button', title: 'Speech Therapy', payload: 'book_salt' }
        ]
      };

    case 'view_plan_details':
      const planData = await fetchUserPlanData(user.id);
      return {
        messageType: 'text' as const,
        content: planData ? formatPlanDetails(planData) : 'No active EHC plan found. Would you like help creating one?'
      };

    default:
      return {
        messageType: 'text' as const,
        content: 'I didn\'t recognize that option. Please try again or send a voice message for help.'
      };
  }
}

async function sendWelcomeMessage(phoneNumber: string, contactName: string) {
  const welcomeMessage = {
    messageType: 'text' as const,
    content: `👋 Hello ${contactName}! Welcome to SpectrumCare's WhatsApp support.

I'm your AI assistant for SEND support. I can help you with:

🎙️ *Voice Commands* - Just send voice messages!
📋 EHC plan updates and status
📅 Booking appointments
📊 Progress tracking
🔍 Finding specialists
🚨 Crisis support

To get started:
1. Send me a voice message
2. Or type 'help' for the menu
3. Visit app.spectrumcare.platform to link your account

Try saying: "Check my plan status" or "Book an appointment"`
  };

  await whatsappService.sendWhatsAppMessage(phoneNumber, welcomeMessage);
}

async function getHelpMenuResponse() {
  return {
    messageType: 'text' as const,
    content: `🤖 *SpectrumCare Voice Assistant*

🎙️ *Voice Commands* (Recommended):
Send voice messages for natural conversation!

💬 *Text Commands:*
• "plan status" - Check EHC plan
• "appointments" - View upcoming appointments
• "help" - Show this menu
• "voice" - Voice command guide

🔗 *Quick Links:*
📱 App: app.spectrumcare.platform
📞 Support: 0800 123 4567
🌐 Web: spectrumcare.platform

*Pro tip:* Voice messages work best! Just hold the mic button and speak naturally.`
  };
}

async function getQuickPlanStatus(userId: string) {
  try {
    const planData = await fetchUserPlanData(userId);

    if (!planData) {
      return {
        messageType: 'text' as const,
        content: 'No active EHC plan found. Would you like help creating one?\n\n📱 Start here: app.spectrumcare.platform/ehc-plan-builder'
      };
    }

    return {
      messageType: 'text' as const,
      content: `📋 *Quick Plan Status*

*${planData.planTitle}*
Status: ${planData.status}
Progress: ${planData.completionPercentage}%
Next Review: ${new Date(planData.nextReviewDate).toLocaleDateString()}

For full details, visit the app or send a voice message saying "detailed plan status"`
    };
  } catch (error) {
    return {
      messageType: 'text' as const,
      content: 'Unable to fetch plan status right now. Please try again later.'
    };
  }
}

async function getQuickAppointments(userId: string) {
  try {
    const appointments = await fetchUserAppointments(userId);

    if (appointments.length === 0) {
      return {
        messageType: 'text' as const,
        content: 'No upcoming appointments found.\n\n📅 Book now: app.spectrumcare.platform/book-assessment'
      };
    }

    const appointmentsList = appointments.slice(0, 3).map((apt, index) =>
      `${index + 1}. ${apt.type} - ${new Date(apt.date).toLocaleDateString()}`
    ).join('\n');

    return {
      messageType: 'text' as const,
      content: `📅 *Upcoming Appointments*\n\n${appointmentsList}\n\nFor more details, use the app or send voice message.`
    };
  } catch (error) {
    return {
      messageType: 'text' as const,
      content: 'Unable to fetch appointments right now. Please try again later.'
    };
  }
}

// Helper functions (simplified implementations)
async function getUserByPhoneNumber(phoneNumber: string) {
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE phone = $1 LIMIT 1',
      [phoneNumber]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by phone:', error);
    return null;
  }
}

async function downloadWhatsAppMedia(mediaId: string): Promise<string> {
  try {
    // Get media URL from WhatsApp
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
        }
      }
    );

    if (!mediaResponse.ok) {
      throw new Error('Failed to get media URL');
    }

    const mediaData = await mediaResponse.json();
    return mediaData.url;

  } catch (error) {
    console.error('Error downloading WhatsApp media:', error);
    throw error;
  }
}

async function sendTypingIndicator(phoneNumber: string, action: 'typing_on' | 'typing_off') {
  try {
    await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'action',
          action: { type: action }
        })
      }
    );
  } catch (error) {
    console.error('Error sending typing indicator:', error);
  }
}

async function markMessageAsRead(messageId: string) {
  try {
    await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      }
    );
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

async function logWhatsAppInteraction(interaction: any) {
  try {
    await db.query(`
      INSERT INTO whatsapp_interactions (
        user_id, phone_number, message_type, message_content,
        response_type, response_content, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      interaction.userId,
      interaction.phoneNumber,
      interaction.messageType,
      interaction.messageContent,
      interaction.responseType,
      interaction.responseContent
    ]);
  } catch (error) {
    console.error('Error logging WhatsApp interaction:', error);
  }
}

async function processGeneralTextQuery(text: string, user: any) {
  // Use AI to process general queries
  return {
    messageType: 'text' as const,
    content: 'I understand you\'re asking about "' + text + '". For best results, try sending a voice message or visit our app for detailed assistance.\n\n🎙️ Voice messages work best!\n📱 App: app.spectrumcare.platform'
  };
}

async function fetchUserPlanData(userId: string) {
  try {
    const result = await db.query(`
      SELECT p.*, c.first_name as child_first_name, c.last_name as child_last_name
      FROM ehc_plans p
      JOIN children c ON p.child_id = c.id
      WHERE p.created_by = $1 AND p.status != 'archived'
      ORDER BY p.updated_at DESC
      LIMIT 1
    `, [userId]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching plan data:', error);
    return null;
  }
}

async function fetchUserAppointments(userId: string) {
  try {
    const result = await db.query(`
      SELECT appointment_type as type, scheduled_date_time as date
      FROM medical_appointments
      WHERE parent_id = $1 AND scheduled_date_time > NOW()
      ORDER BY scheduled_date_time ASC
      LIMIT 5
    `, [userId]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}

function formatPlanDetails(planData: any): string {
  return `📋 *${planData.plan_title}*

Child: ${planData.child_first_name} ${planData.child_last_name}
Status: ${planData.status}
Progress: ${planData.completion_percentage}%
Compliance: ${Math.round(parseFloat(planData.legal_compliance_score || '0') * 100)}%

Next Review: ${new Date(planData.next_review_date).toLocaleDateString()}

📱 View full plan: app.spectrumcare.platform/ehc-plan-builder`;
}

async function sendUnsupportedMessageResponse(phoneNumber: string) {
  await whatsappService.sendWhatsAppMessage(phoneNumber, {
    messageType: 'text',
    content: 'I can currently handle voice messages and text. Please send a voice message for the best experience, or type "help" for available commands.'
  });
}
