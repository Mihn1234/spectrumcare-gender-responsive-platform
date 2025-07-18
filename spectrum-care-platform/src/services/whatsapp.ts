import { OpenAI } from 'openai';

// WhatsApp Business API configuration
interface WhatsAppConfig {
  baseUrl: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
}

interface WhatsAppMessage {
  from: string;
  to: string;
  type: 'text' | 'audio' | 'document' | 'template';
  content: string;
  timestamp: Date;
}

interface VoiceCommand {
  command: string;
  intent: string;
  parameters: Record<string, string>;
  confidence: number;
}

interface AutomatedMessageTemplate {
  name: string;
  content: string;
  triggers: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private openai: OpenAI;

  constructor(config: WhatsAppConfig, openaiApiKey: string) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
    });
  }

  /**
   * Send a text message via WhatsApp Business API
   */
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Send a template message with automation
   */
  async sendTemplateMessage(to: string, templateName: string, parameters: Record<string, string>): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en_GB'
            },
            components: [
              {
                type: 'body',
                parameters: Object.entries(parameters).map(([key, value]) => ({
                  type: 'text',
                  text: value
                }))
              }
            ]
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      return false;
    }
  }

  /**
   * Process voice command using OpenAI Whisper and GPT-4
   */
  async processVoiceCommand(audioData: ArrayBuffer, userId: string): Promise<VoiceCommand | null> {
    try {
      // Convert audio to text using Whisper
      const transcription = await this.transcribeAudio(audioData);

      if (!transcription) {
        return null;
      }

      // Process command using GPT-4
      const command = await this.interpretCommand(transcription, userId);

      return command;
    } catch (error) {
      console.error('Error processing voice command:', error);
      return null;
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  private async transcribeAudio(audioData: ArrayBuffer): Promise<string | null> {
    try {
      // Convert ArrayBuffer to File object for OpenAI API
      const audioFile = new File([audioData], 'audio.webm', { type: 'audio/webm' });

      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text'
      });

      return transcription;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return null;
    }
  }

  /**
   * Interpret command using GPT-4 with context
   */
  private async interpretCommand(text: string, userId: string): Promise<VoiceCommand> {
    const systemPrompt = `
You are a voice assistant for SpectrumCare Platform, an autism support system.
Analyze voice commands and extract:
1. Intent (schedule, update, generate, send, view, etc.)
2. Entity (assessment, appointment, report, plan, etc.)
3. Parameters (child name, date, type, etc.)

Available commands:
- Schedule assessments/appointments
- Generate reports and documents
- Send requests to local authorities
- Update child profiles
- View progress and timelines
- Create tribunal evidence

Respond with JSON: {"intent": "string", "parameters": {}, "confidence": 0-1}
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User ${userId} said: "${text}"` }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from GPT-4');
      }

      const parsed = JSON.parse(response);

      return {
        command: text,
        intent: parsed.intent,
        parameters: parsed.parameters || {},
        confidence: parsed.confidence || 0.5
      };
    } catch (error) {
      console.error('Error interpreting command:', error);

      // Fallback to basic keyword matching
      return this.basicCommandInterpretation(text);
    }
  }

  /**
   * Basic fallback command interpretation
   */
  private basicCommandInterpretation(text: string): VoiceCommand {
    const lowerText = text.toLowerCase();
    let intent = 'unknown';
    const parameters: Record<string, string> = {};

    // Basic intent detection
    if (lowerText.includes('schedule') || lowerText.includes('book') || lowerText.includes('appointment')) {
      intent = 'schedule_appointment';
    } else if (lowerText.includes('generate') || lowerText.includes('create') || lowerText.includes('report')) {
      intent = 'generate_report';
    } else if (lowerText.includes('send') || lowerText.includes('request')) {
      intent = 'send_request';
    } else if (lowerText.includes('update') || lowerText.includes('change')) {
      intent = 'update_profile';
    } else if (lowerText.includes('view') || lowerText.includes('show') || lowerText.includes('display')) {
      intent = 'view_information';
    }

    // Extract child names (common autism-related names)
    const childNames = ['abdul', 'jibril', 'ahmed', 'fatima', 'omar', 'aisha'];
    for (const name of childNames) {
      if (lowerText.includes(name)) {
        parameters.childName = name.charAt(0).toUpperCase() + name.slice(1);
        break;
      }
    }

    // Extract assessment types
    const assessmentTypes = ['autism', 'speech', 'occupational', 'educational', 'psychological'];
    for (const type of assessmentTypes) {
      if (lowerText.includes(type)) {
        parameters.assessmentType = type;
        break;
      }
    }

    // Extract time references
    if (lowerText.includes('next week')) {
      parameters.timeframe = 'next_week';
    } else if (lowerText.includes('tomorrow')) {
      parameters.timeframe = 'tomorrow';
    } else if (lowerText.includes('today')) {
      parameters.timeframe = 'today';
    }

    return {
      command: text,
      intent,
      parameters,
      confidence: 0.6
    };
  }

  /**
   * Execute a processed voice command
   */
  async executeCommand(command: VoiceCommand, userId: string): Promise<string> {
    try {
      switch (command.intent) {
        case 'schedule_appointment':
          return await this.handleScheduleAppointment(command.parameters, userId);

        case 'generate_report':
          return await this.handleGenerateReport(command.parameters, userId);

        case 'send_request':
          return await this.handleSendRequest(command.parameters, userId);

        case 'update_profile':
          return await this.handleUpdateProfile(command.parameters, userId);

        case 'view_information':
          return await this.handleViewInformation(command.parameters, userId);

        default:
          return "I didn't understand that command. You can ask me to schedule appointments, generate reports, send requests, update profiles, or view information.";
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return "Sorry, I encountered an error while processing your request. Please try again.";
    }
  }

  /**
   * Handle appointment scheduling
   */
  private async handleScheduleAppointment(parameters: Record<string, string>, userId: string): Promise<string> {
    const { childName, assessmentType, timeframe } = parameters;

    if (!childName) {
      return "Which child would you like to schedule an appointment for?";
    }

    // Here you would integrate with your scheduling system
    // For now, returning a confirmation message

    let response = `I'll help you schedule a${assessmentType ? ` ${assessmentType}` : 'n'} assessment for ${childName}`;

    if (timeframe) {
      response += ` ${timeframe.replace('_', ' ')}`;
    }

    response += ". I'm checking available slots and will send you options shortly.";

    // Trigger actual scheduling process here
    // await this.scheduleAssessment(childName, assessmentType, timeframe, userId);

    return response;
  }

  /**
   * Handle report generation
   */
  private async handleGenerateReport(parameters: Record<string, string>, userId: string): Promise<string> {
    const { childName, reportType } = parameters;

    if (!childName) {
      return "Which child would you like to generate a report for?";
    }

    let response = `I'm generating a${reportType ? ` ${reportType}` : ''} report for ${childName}`;
    response += ". This may take a few minutes. I'll notify you when it's ready.";

    // Trigger actual report generation here
    // await this.generateReport(childName, reportType, userId);

    return response;
  }

  /**
   * Handle sending requests to authorities
   */
  private async handleSendRequest(parameters: Record<string, string>, userId: string): Promise<string> {
    const { childName, requestType, authority } = parameters;

    if (!childName) {
      return "Which child is this request for?";
    }

    let response = `I'm preparing a${requestType ? ` ${requestType}` : ''} request for ${childName}`;

    if (authority) {
      response += ` to ${authority}`;
    }

    response += ". I'll draft the request and send it for your review before submission.";

    // Trigger actual request generation here
    // await this.generateRequest(childName, requestType, authority, userId);

    return response;
  }

  /**
   * Handle profile updates
   */
  private async handleUpdateProfile(parameters: Record<string, string>, userId: string): Promise<string> {
    const { childName, field, value } = parameters;

    if (!childName) {
      return "Which child's profile would you like to update?";
    }

    let response = `I'll update ${childName}'s profile`;

    if (field && value) {
      response += ` to set ${field} to ${value}`;
    }

    response += ". Please confirm this change.";

    // Trigger actual profile update here
    // await this.updateChildProfile(childName, field, value, userId);

    return response;
  }

  /**
   * Handle information viewing
   */
  private async handleViewInformation(parameters: Record<string, string>, userId: string): Promise<string> {
    const { childName, informationType } = parameters;

    if (!childName) {
      return "Which child's information would you like to view?";
    }

    let response = `Here's the latest information for ${childName}`;

    if (informationType) {
      response += ` regarding ${informationType}`;
    }

    response += ". I'll send you a detailed summary.";

    // Retrieve and send actual information here
    // await this.retrieveInformation(childName, informationType, userId);

    return response;
  }

  /**
   * Automated messaging templates
   */
  getAutomatedTemplates(): AutomatedMessageTemplate[] {
    return [
      {
        name: 'assessment_reminder',
        content: 'Reminder: {{childName}} has an {{assessmentType}} assessment scheduled for {{date}} at {{time}}. Please arrive 15 minutes early.',
        triggers: ['assessment_scheduled', 'assessment_tomorrow'],
        priority: 'high'
      },
      {
        name: 'ehc_plan_update',
        content: 'Important update: {{childName}}\'s EHC plan has been updated. Review the changes and provide feedback by {{deadline}}.',
        triggers: ['ehc_plan_changed', 'review_required'],
        priority: 'urgent'
      },
      {
        name: 'assessment_results',
        content: '{{assessmentType}} assessment results for {{childName}} are now available. Access them securely through your SpectrumCare dashboard.',
        triggers: ['assessment_completed', 'results_ready'],
        priority: 'high'
      },
      {
        name: 'appointment_confirmation',
        content: 'Confirmed: {{professionalName}} appointment for {{childName}} on {{date}} at {{time}}. Location: {{venue}}.',
        triggers: ['appointment_booked'],
        priority: 'medium'
      },
      {
        name: 'deadline_warning',
        content: 'Action required: {{deadline}} deadline approaching for {{childName}}\'s {{processType}}. {{daysRemaining}} days remaining.',
        triggers: ['deadline_approaching'],
        priority: 'urgent'
      },
      {
        name: 'progress_update',
        content: 'Weekly progress update for {{childName}}: {{progressSummary}}. Next milestone: {{nextMilestone}}.',
        triggers: ['weekly_progress'],
        priority: 'low'
      }
    ];
  }

  /**
   * Send automated message based on trigger
   */
  async sendAutomatedMessage(
    to: string,
    trigger: string,
    parameters: Record<string, string>
  ): Promise<boolean> {
    const templates = this.getAutomatedTemplates();
    const template = templates.find(t => t.triggers.includes(trigger));

    if (!template) {
      console.warn(`No template found for trigger: ${trigger}`);
      return false;
    }

    // Replace template variables
    let message = template.content;
    for (const [key, value] of Object.entries(parameters)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return await this.sendTextMessage(to, message);
  }

  /**
   * Webhook handler for incoming WhatsApp messages
   */
  async handleWebhook(body: any): Promise<any> {
    try {
      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          if (change.field === 'messages') {
            const messages = change.value.messages || [];

            for (const message of messages) {
              await this.processIncomingMessage(message);
            }
          }
        }
      }

      return { status: 'success' };
    } catch (error) {
      console.error('Error handling webhook:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { status: 'error', message: errorMessage };
    }
  }

  /**
   * Process incoming WhatsApp message
   */
  private async processIncomingMessage(message: any): Promise<void> {
    const { from, type, timestamp } = message;

    try {
      if (type === 'audio') {
        // Handle voice message
        const audioId = message.audio.id;
        const audioData = await this.downloadWhatsAppMedia(audioId);

        if (audioData) {
          const command = await this.processVoiceCommand(audioData, from);

          if (command && command.confidence > 0.5) {
            const response = await this.executeCommand(command, from);
            await this.sendTextMessage(from, response);
          } else {
            await this.sendTextMessage(from, "I didn't understand that voice command. Please try again or send a text message.");
          }
        }
      } else if (type === 'text') {
        // Handle text message
        const text = message.text.body;
        const command = await this.interpretCommand(text, from);

        if (command.confidence > 0.5) {
          const response = await this.executeCommand(command, from);
          await this.sendTextMessage(from, response);
        } else {
          await this.sendTextMessage(from, "I can help you with scheduling appointments, generating reports, and managing your child's autism support. What would you like me to do?");
        }
      }
    } catch (error) {
      console.error('Error processing incoming message:', error);
      await this.sendTextMessage(from, "Sorry, I encountered an error. Please try again later.");
    }
  }

  /**
   * Download media from WhatsApp
   */
  private async downloadWhatsAppMedia(mediaId: string): Promise<ArrayBuffer | null> {
    try {
      // Get media URL
      const mediaResponse = await fetch(`${this.config.baseUrl}/${mediaId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
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
          'Authorization': `Bearer ${this.config.accessToken}`,
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
   * Verify webhook signature
   */
  verifyWebhook(signature: string, body: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookVerifyToken)
      .update(body)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }
}

// Export types for use in other modules
export type { WhatsAppMessage, VoiceCommand, AutomatedMessageTemplate };
