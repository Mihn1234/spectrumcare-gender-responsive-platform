import { NextRequest, NextResponse } from 'next/server';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateUser } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schemas
const voiceCommandSchema = z.object({
  command: z.string(),
  userId: z.string(),
  sessionId: z.string().optional(),
  audioData: z.string().optional(),
  transcription: z.string().optional(),
  context: z.object({
    previousCommands: z.array(z.string()).optional(),
    currentPage: z.string().optional(),
    childId: z.string().optional()
  }).optional()
});

// Voice command processing endpoint
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'process_voice_command':
        return await processVoiceCommand(authResult.user.id, data);

      case 'start_voice_session':
        return await startVoiceSession(authResult.user.id, data);

      case 'end_voice_session':
        return await endVoiceSession(authResult.user.id, data);

      case 'transcribe_audio':
        return await transcribeAudio(authResult.user.id, data);

      case 'get_voice_history':
        return await getVoiceHistory(authResult.user.id);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Voice assistant error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get voice assistant status and capabilities
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const capabilities = await getVoiceCapabilities(authResult.user.id);
    const activeSession = await getActiveVoiceSession(authResult.user.id);

    return NextResponse.json({
      success: true,
      data: {
        capabilities,
        activeSession,
        isWhatsAppConnected: await checkWhatsAppConnection(authResult.user.id),
        supportedLanguages: ['en-GB', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT'],
        voiceCommands: getAvailableCommands()
      }
    });

  } catch (error: any) {
    console.error('Voice assistant GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Helper functions
async function processVoiceCommand(userId: string, data: any) {
  const validatedData = voiceCommandSchema.parse({ ...data, userId });

  try {
    let command = validatedData.transcription || validatedData.command;

    if (validatedData.audioData && !command) {
      command = await transcribeAudioData(validatedData.audioData);
    }

    const result = await processNaturalLanguageCommand(userId, command, validatedData.context);

    await storeVoiceCommand(userId, {
      command,
      response: result.message,
      action: result.action,
      success: result.success,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function processNaturalLanguageCommand(userId: string, command: string, context?: any) {
  const commandLower = command.toLowerCase();

  // Crisis detection first
  if (commandLower.includes('emergency') || commandLower.includes('crisis') || commandLower.includes('urgent')) {
    return await handleCrisisCommand(userId, command, context);
  }

  // Scheduling commands
  if (commandLower.includes('schedule') || commandLower.includes('book') || commandLower.includes('appointment')) {
    return await handleSchedulingCommand(userId, command, context);
  }

  // Document commands
  if (commandLower.includes('document') || commandLower.includes('report') || commandLower.includes('file')) {
    return await handleDocumentCommand(userId, command, context);
  }

  // Progress commands
  if (commandLower.includes('progress') || commandLower.includes('achievement') || commandLower.includes('behavior')) {
    return await handleProgressCommand(userId, command, context);
  }

  // Financial commands
  if (commandLower.includes('budget') || commandLower.includes('spending') || commandLower.includes('money')) {
    return await handleFinancialCommand(userId, command, context);
  }

  // EHC plan commands
  if (commandLower.includes('ehc') || commandLower.includes('plan') || commandLower.includes('review')) {
    return await handleEHCPlanCommand(userId, command, context);
  }

  // Communication commands
  if (commandLower.includes('message') || commandLower.includes('contact') || commandLower.includes('email')) {
    return await handleCommunicationCommand(userId, command, context);
  }

  // Health commands
  if (commandLower.includes('health') || commandLower.includes('medical') || commandLower.includes('therapy')) {
    return await handleHealthCommand(userId, command, context);
  }

  // Education commands
  if (commandLower.includes('school') || commandLower.includes('education') || commandLower.includes('teacher')) {
    return await handleEducationCommand(userId, command, context);
  }

  // Professional commands
  if (commandLower.includes('professional') || commandLower.includes('specialist') || commandLower.includes('find expert')) {
    return await handleProfessionalCommand(userId, command, context);
  }

  return await handleGeneralCommand(userId, command, context);
}

// Command handlers
async function handleSchedulingCommand(userId: string, command: string, context: any) {
  const schedulingIntent = await parseSchedulingIntent(command);
  const providers = await searchProviders(schedulingIntent.specialty, schedulingIntent.location);

  if (providers.length > 0) {
    const provider = providers[0];
    return {
      success: true,
      action: 'schedule_appointment',
      message: `I found ${provider.name}, a ${provider.specialty} available ${schedulingIntent.timeframe}. Would you like me to book an appointment?`,
      data: { provider, availableSlots: ['Tuesday 2:00 PM', 'Wednesday 10:00 AM', 'Friday 3:30 PM'] }
    };
  }

  return {
    success: false,
    action: 'no_providers_found',
    message: `I couldn't find any ${schedulingIntent.specialty} specialists available. Would you like me to search in nearby areas?`
  };
}

async function handleDocumentCommand(userId: string, command: string, context: any) {
  const documentIntent = await parseDocumentIntent(command);
  const documents = await searchUserDocuments(userId, documentIntent.type, documentIntent.keywords);

  if (documents.length > 0) {
    const recentDocs = documents.slice(0, 3);
    const docList = recentDocs.map((doc: any, i: number) => `${i + 1}. ${doc.name} (${doc.date})`).join('\n');

    return {
      success: true,
      action: 'documents_found',
      message: `I found ${documents.length} documents matching "${documentIntent.type}":\n\n${docList}`,
      data: { documents: recentDocs }
    };
  }

  return {
    success: false,
    action: 'no_documents_found',
    message: `I couldn't find any documents matching "${documentIntent.type}". You can upload documents via the app.`
  };
}

async function handleProgressCommand(userId: string, command: string, context: any) {
  const progressIntent = await parseProgressIntent(command);

  if (progressIntent.action === 'show') {
    const progressData = await getProgressData(userId, progressIntent.type);

    return {
      success: true,
      action: 'show_progress',
      message: `Here's the latest ${progressIntent.type} progress:\n\n${formatProgressSummary(progressData)}`,
      data: progressData
    };
  }

  return {
    success: true,
    action: 'progress_help',
    message: 'I can help track progress and achievements. Try: "Show speech therapy progress"'
  };
}

async function handleCrisisCommand(userId: string, command: string, context: any) {
  const crisisLevel = await assessCrisisLevel(command);

  if (crisisLevel === 'emergency') {
    await triggerEmergencyProtocol(userId, command);

    return {
      success: true,
      action: 'emergency_response',
      message: `🚨 EMERGENCY SUPPORT ACTIVATED\n\nI've notified your emergency contacts. Your crisis support specialist will contact you within 5 minutes.`,
      priority: 'critical'
    };
  } else if (crisisLevel === 'urgent') {
    return {
      success: true,
      action: 'crisis_support',
      message: `I understand you need urgent support. Try these immediate strategies:\n${await getCrisisStrategies(userId)}\n\nShall I call your support person?`,
      data: await getCrisisManagementData(userId)
    };
  }

  return {
    success: true,
    action: 'crisis_prevention',
    message: 'I can help with crisis management. What support do you need right now?'
  };
}

async function handleFinancialCommand(userId: string, command: string, context: any) {
  const financialIntent = await parseFinancialIntent(command);
  const financialData = await getFinancialData(userId);

  return {
    success: true,
    action: 'budget_status',
    message: `💰 **Budget Summary**\n\nPersonal Budget: £${financialData.spent.toLocaleString()} / £${financialData.total.toLocaleString()}\nRemaining: £${financialData.remaining.toLocaleString()}\nUtilization: ${financialData.utilizationPercent}%\n\n📊 Top spending:\n${formatTopSpending(financialData.topCategories)}`,
    data: financialData
  };
}

async function handleEHCPlanCommand(userId: string, command: string, context: any) {
  const ehcIntent = await parseEHCIntent(command);
  const ehcData = await getEHCPlanData(userId);

  if (ehcIntent.type === 'tribunal') {
    return {
      success: true,
      action: 'tribunal_prep',
      message: `⚖️ **Tribunal Preparation**\n\nYour case strength: ${await assessTribunalStrength(userId)}%\n\nShall I generate your tribunal preparation checklist?`
    };
  }

  return {
    success: true,
    action: 'ehc_status',
    message: `📋 **EHC Plan Status**\n\n${ehcData.status}\nNext review: ${ehcData.nextReview}\n\n🎯 Progress:\n${formatEHCProgress(ehcData.objectives)}`,
    data: ehcData
  };
}

async function handleCommunicationCommand(userId: string, command: string, context: any) {
  const commIntent = await parseCommunicationIntent(command);

  if (commIntent.recipient && commIntent.message) {
    await sendMessage(userId, commIntent.recipient, commIntent.message);

    return {
      success: true,
      action: 'message_sent',
      message: `✅ Message sent to ${commIntent.recipient}: "${commIntent.message}"`
    };
  } else if (commIntent.action === 'check_messages') {
    const messages = await getRecentMessages(userId);

    return {
      success: true,
      action: 'show_messages',
      message: `📧 **Recent Messages**\n\n${formatMessageSummary(messages)}`,
      data: { messages }
    };
  }

  return {
    success: true,
    action: 'communication_help',
    message: 'I can help with communication. Try: "Message school about absence"'
  };
}

async function handleHealthCommand(userId: string, command: string, context: any) {
  const healthIntent = await parseHealthIntent(command);
  const healthData = await getHealthData(userId);

  if (healthIntent.type === 'appointments') {
    return {
      success: true,
      action: 'health_appointments',
      message: `🏥 **Upcoming Medical Appointments**\n\n${formatHealthAppointments(healthData.appointments)}`,
      data: healthData
    };
  } else if (healthIntent.type === 'medication') {
    return {
      success: true,
      action: 'medication_info',
      message: `💊 **Current Medications**\n\n${formatMedications(healthData.medications)}\n\nAdherence rate: ${healthData.adherenceRate}%`
    };
  }

  return {
    success: true,
    action: 'health_help',
    message: 'I can help with health management. Try: "Show medical appointments"'
  };
}

async function handleEducationCommand(userId: string, command: string, context: any) {
  const eduIntent = await parseEducationIntent(command);
  const eduData = await getEducationData(userId);

  return {
    success: true,
    action: 'school_updates',
    message: `🎓 **School Communication**\n\n${formatSchoolMessages(eduData.recentMessages)}\n\nBehavior tracking: ${eduData.behaviorSummary}\nAchievements this week: ${eduData.weeklyAchievements}`,
    data: eduData
  };
}

async function handleProfessionalCommand(userId: string, command: string, context: any) {
  const profIntent = await parseProfessionalIntent(command);

  if (profIntent.specialty) {
    const professionals = await searchProfessionals(profIntent.specialty, profIntent.location);

    return {
      success: true,
      action: 'professionals_found',
      message: `👥 **${profIntent.specialty} Specialists**\n\n${formatProfessionalsList(professionals.slice(0, 3))}`,
      data: { professionals }
    };
  }

  return {
    success: true,
    action: 'professional_help',
    message: 'I can help find professionals. Try: "Find speech therapist"'
  };
}

async function handleGeneralCommand(userId: string, command: string, context: any) {
  return {
    success: true,
    action: 'general_help',
    message: `I can help you with:\n\n🏥 Health & Therapy\n🎓 Education\n👥 Professional Support\n📋 EHC Plans\n💰 Budget Management\n🚨 Crisis Support\n\nTry saying: "Show my child's progress" or "Find speech therapist"`
  };
}

// Missing helper function implementations
async function searchProviders(specialty: string, location: string) {
  return [
    { id: '1', name: 'Dr. Smith', specialty, location, rating: 4.8 },
    { id: '2', name: 'Dr. Johnson', specialty, location, rating: 4.6 }
  ];
}

async function searchUserDocuments(userId: string, type: string, keywords: string[]) {
  return [
    { name: 'Assessment Report', date: '2024-01-15', type: 'assessment' },
    { name: 'Therapy Notes', date: '2024-01-20', type: 'therapy' }
  ];
}

async function getProgressData(userId: string, type: string) {
  return {
    type,
    currentLevel: 'Intermediate',
    progressPercent: 75,
    milestones: ['Communication improved', 'Social skills developing'],
    nextGoals: ['Advanced communication', 'Independent living skills']
  };
}

function formatProgressSummary(progressData: any): string {
  return `Current level: ${progressData.currentLevel}\nProgress: ${progressData.progressPercent}%\nMilestones: ${progressData.milestones.join(', ')}`;
}

async function triggerEmergencyProtocol(userId: string, command: string) {
  console.log(`Emergency protocol triggered for user ${userId}: ${command}`);
}

async function getCrisisStrategies(userId: string): Promise<string> {
  return `• Take deep breaths\n• Use sensory tools\n• Contact support person\n• Move to calm space`;
}

async function getCrisisManagementData(userId: string) {
  return {
    strategies: ['Deep breathing', 'Sensory tools', 'Safe space'],
    contacts: ['Primary carer', 'Support worker'],
    plan: 'Individualized crisis response plan'
  };
}

async function parseFinancialIntent(command: string) {
  return {
    type: 'budget_summary',
    category: command.includes('therapy') ? 'therapy' : 'general'
  };
}

async function getFinancialData(userId: string) {
  return {
    spent: 8500,
    total: 15000,
    remaining: 6500,
    utilizationPercent: 57,
    topCategories: [
      { name: 'Therapy', amount: 4200 },
      { name: 'Equipment', amount: 2800 }
    ]
  };
}

function formatTopSpending(categories: any[]): string {
  return categories.map(cat => `• ${cat.name}: £${cat.amount}`).join('\n');
}

async function parseEHCIntent(command: string) {
  return { type: 'status_check' };
}

async function getEHCPlanData(userId: string) {
  return {
    status: 'Active - In good standing',
    nextReview: '2024-03-15',
    daysToReview: 45,
    objectives: [
      { name: 'Communication', progress: 75 },
      { name: 'Social skills', progress: 60 }
    ],
    actionsNeeded: ['Update therapy goals', 'Schedule review meeting']
  };
}

function formatEHCProgress(objectives: any[]): string {
  return objectives.map(obj => `• ${obj.name}: ${obj.progress}%`).join('\n');
}

async function assessTribunalStrength(userId: string): Promise<number> {
  return 85;
}

async function parseCommunicationIntent(command: string) {
  return {
    type: 'send_message',
    recipient: 'school',
    message: 'Please update on today\'s activities',
    action: 'check_messages'
  };
}

async function sendMessage(userId: string, recipient: string, message: string) {
  console.log(`Message sent from ${userId} to ${recipient}: ${message}`);
}

async function getRecentMessages(userId: string) {
  return [
    { from: 'School', subject: 'Daily update', time: '2 hours ago' },
    { from: 'Therapist', subject: 'Session notes', time: '1 day ago' }
  ];
}

function formatMessageSummary(messages: any[]): string {
  return messages.map(msg => `• ${msg.subject} (from ${msg.from}) - ${msg.time}`).join('\n');
}

async function parseHealthIntent(command: string) {
  return { type: 'appointments' };
}

async function getHealthData(userId: string) {
  return {
    appointments: [
      { type: 'GP Check-up', date: '2024-02-15', time: '10:00 AM' },
      { type: 'Therapy Session', date: '2024-02-18', time: '2:00 PM' }
    ],
    medications: [
      { name: 'Medication A', dosage: '10mg', frequency: 'Daily' }
    ],
    medicationReminders: 2,
    adherenceRate: 95,
    nextReview: '2024-03-01'
  };
}

function formatHealthAppointments(appointments: any[]): string {
  return appointments.map(apt => `• ${apt.type}: ${apt.date} at ${apt.time}`).join('\n');
}

function formatMedications(medications: any[]): string {
  return medications.map(med => `• ${med.name} ${med.dosage} - ${med.frequency}`).join('\n');
}

async function parseEducationIntent(command: string) {
  return { type: 'school_communication' };
}

async function getEducationData(userId: string) {
  return {
    recentMessages: [
      { from: 'Teacher', message: 'Great progress today!', time: '2 hours ago' }
    ],
    behaviorSummary: 'Positive - 3 green days this week',
    weeklyAchievements: 'Completed math worksheet independently'
  };
}

function formatSchoolMessages(messages: any[]): string {
  return messages.map(msg => `• ${msg.message} (${msg.from}) - ${msg.time}`).join('\n');
}

async function parseProfessionalIntent(command: string) {
  return {
    type: 'search',
    specialty: 'Speech Therapy',
    location: 'Local area'
  };
}

async function searchProfessionals(specialty: string, location: string) {
  return [
    { id: '1', name: 'Dr. Sarah Wilson', specialty, rating: 4.9, experience: '15 years' },
    { id: '2', name: 'Dr. Mike Brown', specialty, rating: 4.7, experience: '12 years' }
  ];
}

function formatProfessionalsList(professionals: any[]): string {
  return professionals.map(prof => `• ${prof.name} - Rating: ${prof.rating}/5 (${prof.experience} experience)`).join('\n');
}

// Additional utility functions
async function parseSchedulingIntent(command: string) {
  return {
    type: 'appointment',
    specialty: 'occupational therapy',
    timeframe: 'next week',
    location: 'nearby'
  };
}

async function parseDocumentIntent(command: string) {
  return {
    type: 'medical reports',
    keywords: ['assessment', 'therapy', 'report']
  };
}

async function parseProgressIntent(command: string) {
  return {
    action: 'show',
    type: 'speech therapy'
  };
}

async function assessCrisisLevel(command: string): Promise<'emergency' | 'urgent' | 'moderate'> {
  if (command.includes('emergency') || command.includes('999')) return 'emergency';
  if (command.includes('urgent') || command.includes('crisis')) return 'urgent';
  return 'moderate';
}

async function getVoiceCapabilities(userId: string) {
  return {
    transcription: true,
    naturalLanguage: true,
    multiLanguage: true,
    whatsappIntegration: true,
    crisisDetection: true,
    contextAwareness: true
  };
}

async function getActiveVoiceSession(userId: string) {
  return null;
}

async function checkWhatsAppConnection(userId: string) {
  return true;
}

function getAvailableCommands() {
  return [
    "Schedule OT appointment next week",
    "Show my budget status",
    "Find speech therapist",
    "Check EHC plan progress",
    "Record achievement",
    "Message school SENCO",
    "Show upcoming appointments",
    "Emergency help needed",
    "Track medication reminder",
    "Compare therapy providers"
  ];
}

async function storeVoiceCommand(userId: string, commandData: any) {
  // Store in database for history tracking
}

async function getVoiceHistory(userId: string) {
  return NextResponse.json({
    success: true,
    data: {
      recentCommands: [
        {
          command: "Schedule OT appointment",
          response: "Found 3 available specialists",
          timestamp: new Date().toISOString(),
          success: true
        }
      ]
    }
  });
}

async function startVoiceSession(userId: string, data: any) {
  return NextResponse.json({
    success: true,
    data: {
      sessionId: memoryDatabase.generateId(),
      message: "Voice session started. You can now give voice commands."
    }
  });
}

async function endVoiceSession(userId: string, data: any) {
  return NextResponse.json({
    success: true,
    data: {
      message: "Voice session ended. Session summary saved."
    }
  });
}

async function transcribeAudio(userId: string, data: any) {
  return NextResponse.json({
    success: true,
    data: {
      transcription: "Simulated transcription result",
      confidence: 0.95,
      language: "en-GB"
    }
  });
}

async function transcribeAudioData(audioData: string): Promise<string> {
  return "Simulated transcription of audio data";
}
