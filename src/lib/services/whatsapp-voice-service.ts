import { z } from 'zod';

// Types for WhatsApp Voice Commands
interface VoiceCommandContext {
  userId: string;
  childId?: string;
  sessionId: string;
  phoneNumber: string;
  conversationHistory: VoiceMessage[];
}

interface VoiceMessage {
  id: string;
  timestamp: Date;
  type: 'voice' | 'text' | 'image' | 'document';
  content: string;
  transcription?: string;
  intent?: string;
  confidence: number;
  response?: string;
}

interface CommandIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  action: string;
  parameters: Record<string, any>;
}

interface WhatsAppResponse {
  messageType: 'text' | 'audio' | 'interactive' | 'template';
  content: string;
  audioUrl?: string;
  interactiveElements?: any[];
}

// Command intents and their patterns
const COMMAND_INTENTS = {
  // EHC Plan Commands
  'check_plan_status': {
    patterns: ['check plan status', 'how is my plan', 'plan progress', 'EHC plan update'],
    description: 'Check the status of EHC plan',
    requiresChild: true
  },
  'book_appointment': {
    patterns: ['book appointment', 'schedule meeting', 'book session', 'make appointment'],
    description: 'Book an appointment with a specialist',
    requiresChild: true
  },
  'view_appointments': {
    patterns: ['my appointments', 'upcoming appointments', 'schedule', 'calendar'],
    description: 'View upcoming appointments',
    requiresChild: false
  },
  'assessment_results': {
    patterns: ['assessment results', 'test results', 'evaluation outcome', 'diagnosis'],
    description: 'Get latest assessment results',
    requiresChild: true
  },
  'progress_update': {
    patterns: ['progress update', 'how is progress', 'development update', 'improvements'],
    description: 'Get child progress update',
    requiresChild: true
  },
  'add_note': {
    patterns: ['add note', 'record observation', 'log behavior', 'note something'],
    description: 'Add a note or observation',
    requiresChild: true
  },
  'find_specialist': {
    patterns: ['find specialist', 'book therapy', 'occupational therapist', 'ABA therapist'],
    description: 'Find and book specialists',
    requiresChild: false
  },
  'medication_reminder': {
    patterns: ['medication reminder', 'medicine time', 'supplements', 'pills'],
    description: 'Set medication reminders',
    requiresChild: true
  },
  'crisis_support': {
    patterns: ['help', 'crisis', 'emergency', 'meltdown', 'urgent'],
    description: 'Access crisis support resources',
    requiresChild: false
  },
  'send_report': {
    patterns: ['send report', 'share report', 'email report', 'download report'],
    description: 'Send or download reports',
    requiresChild: true
  }
};

export class WhatsAppVoiceService {
  private apiKey: string;
  private webhookVerifyToken: string;
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || '';
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  }

  /**
   * Process incoming WhatsApp voice message
   */
  async processVoiceMessage(
    phoneNumber: string,
    audioUrl: string,
    messageId: string,
    userId: string
  ): Promise<WhatsAppResponse> {
    try {
      // Download and transcribe audio
      const transcription = await this.transcribeAudio(audioUrl);

      // Get user context
      const context = await this.getUserContext(userId, phoneNumber);

      // Process command intent
      const intent = await this.processIntent(transcription, context);

      // Execute command
      const response = await this.executeCommand(intent, context);

      // Log interaction
      await this.logVoiceInteraction({
        userId,
        phoneNumber,
        messageId,
        transcription,
        intent: intent.intent,
        confidence: intent.confidence,
        response: response.content
      });

      return response;

    } catch (error) {
      console.error('Error processing voice message:', error);
      return {
        messageType: 'text',
        content: 'Sorry, I had trouble understanding that. Could you try again or type your request?'
      };
    }
  }

  /**
   * Transcribe audio using speech recognition
   */
  private async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      // Download audio file
      const audioResponse = await fetch(audioUrl);
      const audioBuffer = await audioResponse.arrayBuffer();

      // Use OpenAI Whisper for transcription
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer]), 'audio.ogg');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      return result.text;

    } catch (error) {
      console.error('Audio transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Process user intent from transcribed text
   */
  private async processIntent(text: string, context: VoiceCommandContext): Promise<CommandIntent> {
    try {
      const prompt = `
        Analyze this voice command and determine the user's intent.

        Text: "${text}"

        Available intents:
        ${Object.entries(COMMAND_INTENTS).map(([intent, data]) =>
          `- ${intent}: ${data.description} (patterns: ${data.patterns.join(', ')})`
        ).join('\n')}

        User context:
        - Has children: ${context.childId ? 'yes' : 'no'}
        - Recent conversation: ${context.conversationHistory.slice(-3).map(m => m.content).join('; ')}

        Return JSON with:
        {
          "intent": "most_likely_intent",
          "confidence": 0.0-1.0,
          "entities": {"extracted_entities": "values"},
          "action": "specific_action_to_take",
          "parameters": {"param_name": "param_value"}
        }
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at understanding voice commands for a SEND support platform. Return valid JSON only.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error('Intent processing failed');
      }

      const result = await response.json();
      return JSON.parse(result.choices[0].message.content);

    } catch (error) {
      console.error('Intent processing error:', error);
      // Fallback to simple pattern matching
      return this.fallbackIntentDetection(text);
    }
  }

  /**
   * Fallback intent detection using pattern matching
   */
  private fallbackIntentDetection(text: string): CommandIntent {
    const lowercaseText = text.toLowerCase();

    for (const [intent, data] of Object.entries(COMMAND_INTENTS)) {
      for (const pattern of data.patterns) {
        if (lowercaseText.includes(pattern.toLowerCase())) {
          return {
            intent,
            confidence: 0.8,
            entities: {},
            action: intent,
            parameters: {}
          };
        }
      }
    }

    return {
      intent: 'unknown',
      confidence: 0.1,
      entities: {},
      action: 'help',
      parameters: {}
    };
  }

  /**
   * Execute the detected command
   */
  private async executeCommand(intent: CommandIntent, context: VoiceCommandContext): Promise<WhatsAppResponse> {
    try {
      switch (intent.intent) {
        case 'check_plan_status':
          return await this.handlePlanStatusCommand(context);

        case 'book_appointment':
          return await this.handleBookAppointmentCommand(intent, context);

        case 'view_appointments':
          return await this.handleViewAppointmentsCommand(context);

        case 'assessment_results':
          return await this.handleAssessmentResultsCommand(context);

        case 'progress_update':
          return await this.handleProgressUpdateCommand(context);

        case 'add_note':
          return await this.handleAddNoteCommand(intent, context);

        case 'find_specialist':
          return await this.handleFindSpecialistCommand(intent, context);

        case 'medication_reminder':
          return await this.handleMedicationReminderCommand(intent, context);

        case 'crisis_support':
          return await this.handleCrisisSupportCommand(context);

        case 'send_report':
          return await this.handleSendReportCommand(intent, context);

        default:
          return await this.handleUnknownCommand(context);
      }
    } catch (error) {
      console.error('Command execution error:', error);
      return {
        messageType: 'text',
        content: 'I encountered an error processing your request. Please try again or contact support.'
      };
    }
  }

  /**
   * Handle plan status command
   */
  private async handlePlanStatusCommand(context: VoiceCommandContext): Promise<WhatsAppResponse> {
    // Fetch plan status from database
    const planData = await this.fetchPlanData(context.userId, context.childId);

    if (!planData) {
      return {
        messageType: 'text',
        content: "You don't have any active EHC plans yet. Would you like help creating one?"
      };
    }

    const response = `
📋 *EHC Plan Status Update*

*Plan:* ${planData.planTitle}
*Status:* ${planData.status}
*Completion:* ${planData.completionPercentage}%
*Next Review:* ${new Date(planData.nextReviewDate).toLocaleDateString()}

*Recent Progress:*
${planData.recentUpdates.slice(0, 3).map(update => `• ${update}`).join('\n')}

Would you like more details on any specific section?
    `.trim();

    return {
      messageType: 'text',
      content: response
    };
  }

  /**
   * Handle book appointment command
   */
  private async handleBookAppointmentCommand(intent: CommandIntent, context: VoiceCommandContext): Promise<WhatsAppResponse> {
    const specialistType = intent.entities.specialistType || 'any specialist';

    return {
      messageType: 'interactive',
      content: `I'll help you book an appointment with ${specialistType}. What type of appointment do you need?`,
      interactiveElements: [
        {
          type: 'button',
          title: 'Medical Assessment',
          payload: 'book_medical_assessment'
        },
        {
          type: 'button',
          title: 'Therapy Session',
          payload: 'book_therapy_session'
        },
        {
          type: 'button',
          title: 'Specialist Consultation',
          payload: 'book_specialist_consultation'
        }
      ]
    };
  }

  /**
   * Handle view appointments command
   */
  private async handleViewAppointmentsCommand(context: VoiceCommandContext): Promise<WhatsAppResponse> {
    const appointments = await this.fetchUpcomingAppointments(context.userId);

    if (appointments.length === 0) {
      return {
        messageType: 'text',
        content: "You don't have any upcoming appointments. Would you like to book one?"
      };
    }

    const appointmentsList = appointments.map((apt, index) =>
      `${index + 1}. *${apt.type}* with ${apt.practitioner}\n   📅 ${new Date(apt.date).toLocaleDateString()} at ${apt.time}\n   📍 ${apt.location}`
    ).join('\n\n');

    return {
      messageType: 'text',
      content: `📅 *Your Upcoming Appointments*\n\n${appointmentsList}\n\nWould you like to modify any of these?`
    };
  }

  /**
   * Handle crisis support command
   */
  private async handleCrisisSupportCommand(context: VoiceCommandContext): Promise<WhatsAppResponse> {
    return {
      messageType: 'text',
      content: `🚨 *Crisis Support Available*

I'm here to help. Here are immediate resources:

*Immediate Support:*
📞 Crisis Helpline: 0800 123 4567
💬 Text CRISIS to 85258

*Autism-Specific Support:*
📞 National Autistic Society: 0808 800 4104
💬 Online support: autism.org.uk/help

*Breathing Exercise:*
Try the 4-7-8 technique:
• Breathe in for 4 seconds
• Hold for 7 seconds
• Breathe out for 8 seconds
• Repeat 4 times

*Emergency:*
If this is a medical emergency, call 999 immediately.

Would you like me to connect you with a crisis counselor or send calming techniques?`
    };
  }

  /**
   * Handle add note command
   */
  private async handleAddNoteCommand(intent: CommandIntent, context: VoiceCommandContext): Promise<WhatsAppResponse> {
    const noteContent = intent.entities.noteContent || intent.parameters.content;

    if (!noteContent) {
      return {
        messageType: 'text',
        content: "What would you like to note? I'll record it for you."
      };
    }

    // Save the note to database
    await this.saveUserNote(context.userId, context.childId, noteContent);

    return {
      messageType: 'text',
      content: `✅ Note recorded successfully!\n\n"${noteContent}"\n\nI've added this to ${context.childId ? "your child's" : "your"} profile. Would you like to add anything else?`
    };
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(text: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'nova',
          input: text,
          response_format: 'mp3'
        })
      });

      if (!response.ok) {
        throw new Error('Speech generation failed');
      }

      const audioBuffer = await response.arrayBuffer();

      // Upload to cloud storage and return URL
      const audioUrl = await this.uploadAudioToStorage(audioBuffer);
      return audioUrl;

    } catch (error) {
      console.error('Speech generation error:', error);
      throw error;
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsAppMessage(phoneNumber: string, response: WhatsAppResponse): Promise<void> {
    try {
      const messageData: any = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: response.messageType
      };

      switch (response.messageType) {
        case 'text':
          messageData.text = { body: response.content };
          break;

        case 'audio':
          messageData.audio = {
            link: response.audioUrl,
            caption: 'Voice response'
          };
          break;

        case 'interactive':
          messageData.interactive = {
            type: 'button',
            body: { text: response.content },
            action: {
              buttons: response.interactiveElements?.map((element, index) => ({
                type: 'reply',
                reply: {
                  id: element.payload,
                  title: element.title
                }
              })) || []
            }
          };
          break;
      }

      const apiResponse = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
      }

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Setup WhatsApp webhook
   */
  async setupWebhook(webhookUrl: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/webhooks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            object: 'whatsapp_business_account',
            callback_url: webhookUrl,
            verify_token: this.webhookVerifyToken,
            fields: ['messages']
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Webhook setup failed: ${JSON.stringify(errorData)}`);
      }

      console.log('WhatsApp webhook configured successfully');

    } catch (error) {
      console.error('Webhook setup error:', error);
      throw error;
    }
  }

  // Helper methods (simplified implementations)
  private async getUserContext(userId: string, phoneNumber: string): Promise<VoiceCommandContext> {
    // Implementation would fetch from database
    return {
      userId,
      sessionId: `session_${Date.now()}`,
      phoneNumber,
      conversationHistory: []
    };
  }

  private async fetchPlanData(userId: string, childId?: string): Promise<any> {
    // Implementation would fetch from database
    return null;
  }

  private async fetchUpcomingAppointments(userId: string): Promise<any[]> {
    // Implementation would fetch from database
    return [];
  }

  private async saveUserNote(userId: string, childId: string | undefined, content: string): Promise<void> {
    // Implementation would save to database
  }

  private async uploadAudioToStorage(audioBuffer: ArrayBuffer): Promise<string> {
    // Implementation would upload to cloud storage
    return 'https://example.com/audio.mp3';
  }

  private async logVoiceInteraction(interaction: any): Promise<void> {
    // Implementation would log to database
  }

  private async handleUnknownCommand(context: VoiceCommandContext): Promise<WhatsAppResponse> {
    return {
      messageType: 'text',
      content: `I didn't quite understand that. Here's what I can help you with:

📋 *EHC Plans:* "Check my plan status" or "Update my plan"
📅 *Appointments:* "Book appointment" or "My appointments"
📊 *Progress:* "Progress update" or "Assessment results"
📝 *Notes:* "Add note" or "Record observation"
🔍 *Specialists:* "Find therapist" or "Book therapy"
🚨 *Support:* "Help" or "Crisis support"

Try saying one of these phrases!`
    };
  }
}

export default WhatsAppVoiceService;
