import OpenAI from 'openai';
import { CacheService } from '@/lib/database';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds
  maxRetries: 3,
}) : null;

// Models configuration
const MODELS = {
  PRIMARY: process.env.OPENAI_MODEL_PRIMARY || 'gpt-4',
  FALLBACK: process.env.OPENAI_MODEL_FALLBACK || 'gpt-3.5-turbo',
  VISION: 'gpt-4-vision-preview',
  EMBEDDING: 'text-embedding-3-large',
  WHISPER: 'whisper-1',
  TTS: 'tts-1',
};

// Configuration
const CONFIG = {
  MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
  TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
  CACHE_TTL: 3600, // 1 hour
};

export interface AIAnalysisRequest {
  text: string;
  documentType: string;
  childId?: string;
  options?: {
    extractTimeline?: boolean;
    identifyNeeds?: boolean;
    generateRecommendations?: boolean;
    performSentimentAnalysis?: boolean;
  };
}

export interface AIAnalysisResponse {
  keyInformation: Record<string, any>;
  timeline: Array<{
    date: string;
    event: string;
    importance: 'low' | 'medium' | 'high' | 'critical';
  }>;
  identifiedNeeds: string[];
  recommendations: string[];
  sentiment: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  };
  confidence: number;
  processingTime: number;
}

export interface VoiceCommandRequest {
  audioData: ArrayBuffer;
  userId: string;
  context?: Record<string, any>;
}

export interface VoiceCommandResponse {
  transcription: string;
  intent: string;
  parameters: Record<string, string>;
  confidence: number;
  response: string;
}

export class OpenAIService {
  /**
   * Check if OpenAI client is available
   */
  private static checkOpenAI(): OpenAI {
    if (!openai) {
      throw new Error('OpenAI client not initialized. Please set OPENAI_API_KEY environment variable.');
    }
    return openai;
  }

  /**
   * Analyze document content using GPT-4
   */
  static async analyzeDocument(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    const cacheKey = `ai-analysis:${this.generateCacheKey(request)}`;

    try {
      const client = this.checkOpenAI();

      // Check cache first
      const cached = CacheService.getInstance().get<AIAnalysisResponse>(cacheKey);
      if (cached) {
        console.log('Returning cached AI analysis');
        return cached;
      }

      const prompt = this.buildDocumentAnalysisPrompt(request);

      const completion = await client.chat.completions.create({
        model: MODELS.PRIMARY,
        messages: [
          {
            role: 'system',
            content: 'You are an expert autism support specialist analyzing medical and educational documents. Provide comprehensive, evidence-based analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: CONFIG.TEMPERATURE,
        max_tokens: CONFIG.MAX_TOKENS,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(response);
      const processingTime = Date.now() - startTime;

      const result: AIAnalysisResponse = {
        ...analysis,
        processingTime,
        confidence: this.calculateConfidence(analysis, request.text)
      };

      // Cache the result
      CacheService.getInstance().set(cacheKey, result, CONFIG.CACHE_TTL);

      return result;
    } catch (error) {
      console.error('OpenAI document analysis failed:', error);

      // Try fallback model
      const err = error as any;
      if (err.code === 'insufficient_quota' || err.status === 429) {
        return this.analyzeDocumentWithFallback(request);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`AI analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Process voice commands via WhatsApp
   */
  static async processVoiceCommand(request: VoiceCommandRequest): Promise<VoiceCommandResponse> {
    try {
      const client = this.checkOpenAI();

      // Step 1: Transcribe audio
      const transcription = await this.transcribeAudio(request.audioData);

      // Step 2: Analyze intent and extract parameters
      const intent = await this.analyzeIntent(transcription, request.userId, request.context);

      // Step 3: Generate response
      const response = await this.generateVoiceResponse(intent, transcription);

      return {
        transcription,
        intent: intent.intent,
        parameters: intent.parameters,
        confidence: intent.confidence,
        response
      };
    } catch (error) {
      console.error('Voice command processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Voice processing failed: ${errorMessage}`);
    }
  }

  /**
   * Generate EHC Plan recommendations
   */
  static async generateEHCRecommendations(
    childProfile: any,
    assessmentData: any[]
  ): Promise<string[]> {
    const cacheKey = `ehc-recommendations:${childProfile.id}:${Date.now()}`;

    try {
      const client = this.checkOpenAI();

      const prompt = `
Analyze this child's profile and assessments to generate specific EHC Plan recommendations:

Child Profile:
${JSON.stringify(childProfile, null, 2)}

Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Generate specific, quantified, evidence-based recommendations for:
1. Educational provision (hours, group sizes, specialist teaching)
2. Health provision (therapies, medical support)
3. Social care provision (personal care, social skills)
4. Outcomes and targets (SMART goals)
5. Transition planning

Format as JSON array of detailed recommendations.
`;

      const completion = await client.chat.completions.create({
        model: MODELS.PRIMARY,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in EHC Plan development with deep knowledge of UK SEN law and best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const recommendations = JSON.parse(response).recommendations;

      // Cache for 24 hours
      CacheService.getInstance().set(cacheKey, recommendations, 86400);

      return recommendations;
    } catch (error) {
      console.error('EHC recommendation generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`EHC recommendation failed: ${errorMessage}`);
    }
  }

  /**
   * Analyze assessment results and generate report
   */
  static async generateAssessmentReport(
    assessmentData: any,
    toolUsed: string
  ): Promise<string> {
    try {
      const client = this.checkOpenAI();
      const prompt = `
Generate a comprehensive assessment report based on the following data:

Assessment Tool: ${toolUsed}
Assessment Data:
${JSON.stringify(assessmentData, null, 2)}

Generate a professional report including:
1. Executive Summary
2. Background Information
3. Assessment Results (with scores and interpretations)
4. Behavioral Observations
5. Strengths and Challenges
6. Diagnostic Conclusions (if applicable)
7. Recommendations for Support
8. Next Steps and Follow-up

Format as structured markdown report suitable for professionals and families.
`;

      const completion = await client.chat.completions.create({
        model: MODELS.PRIMARY,
        messages: [
          {
            role: 'system',
            content: 'You are an expert clinical psychologist specializing in autism assessment and report writing.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return response;
    } catch (error) {
      console.error('Assessment report generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Report generation failed: ${errorMessage}`);
    }
  }

  /**
   * Generate legal document for tribunal
   */
  static async generateLegalDocument(
    documentType: 'appeal' | 'witness_statement' | 'evidence_summary',
    caseData: any
  ): Promise<string> {
    try {
      const client = this.checkOpenAI();
      const prompt = this.buildLegalDocumentPrompt(documentType, caseData);

      const completion = await client.chat.completions.create({
        model: MODELS.PRIMARY,
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEN lawyer with extensive experience in tribunal proceedings and UK education law.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return response;
    } catch (error) {
      console.error('Legal document generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Legal document generation failed: ${errorMessage}`);
    }
  }

  /**
   * Generate embeddings for semantic search
   */
  static async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const client = this.checkOpenAI();
      const response = await client.embeddings.create({
        model: MODELS.EMBEDDING,
        input: text.substring(0, 8000), // Limit input length
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Embedding generation failed: ${errorMessage}`);
    }
  }

  /**
   * Transcribe audio using Whisper
   */
  private static async transcribeAudio(audioData: ArrayBuffer): Promise<string> {
    try {
      const client = this.checkOpenAI();

      const audioFile = new File([audioData], 'audio.webm', { type: 'audio/webm' });

      const transcription = await client.audio.transcriptions.create({
        file: audioFile,
        model: MODELS.WHISPER,
        language: 'en',
        response_format: 'text'
      });

      return transcription;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Transcription failed: ${errorMessage}`);
    }
  }

  /**
   * Analyze intent from transcribed text
   */
  private static async analyzeIntent(
    text: string,
    userId: string,
    context?: Record<string, any>
  ): Promise<{
    intent: string;
    parameters: Record<string, string>;
    confidence: number;
  }> {
    const prompt = `
Analyze this voice command and extract the intent and parameters:

Command: "${text}"
User Context: ${JSON.stringify(context || {}, null, 2)}

Available intents:
- schedule_appointment
- generate_report
- send_request
- update_profile
- view_information
- cancel_appointment
- get_status

Extract parameters like:
- child_name
- appointment_type
- date_reference (today, tomorrow, next week, etc.)
- professional_type
- document_type
- urgency_level

Respond with JSON: {"intent": "string", "parameters": {}, "confidence": 0-1}
`;

    const client = this.checkOpenAI();
    const completion = await client.chat.completions.create({
      model: MODELS.PRIMARY,
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in understanding autism support voice commands.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  }

  /**
   * Generate appropriate voice response
   */
  private static async generateVoiceResponse(
    intent: any,
    originalText: string
  ): Promise<string> {
    const prompt = `
Generate a helpful, natural response for this voice command:

Original Command: "${originalText}"
Detected Intent: ${intent.intent}
Parameters: ${JSON.stringify(intent.parameters)}
Confidence: ${intent.confidence}

Response should be:
- Conversational and friendly
- Confirm understanding of the request
- Explain what action will be taken
- Ask for clarification if needed
- Provide next steps

Keep response under 100 words and suitable for text-to-speech.
`;

    const client = this.checkOpenAI();
    const completion = await client.chat.completions.create({
      model: MODELS.PRIMARY,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful autism support assistant providing voice responses to families.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 200
    });

    return completion.choices[0]?.message?.content || 'I understand your request and will help you with that.';
  }

  /**
   * Fallback analysis with simpler model
   */
  private static async analyzeDocumentWithFallback(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();

    try {
      const client = this.checkOpenAI();
      const prompt = this.buildSimpleAnalysisPrompt(request);

      const completion = await client.chat.completions.create({
        model: MODELS.FALLBACK,
        messages: [
          {
            role: 'system',
            content: 'You are analyzing autism support documents. Provide key insights and recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: CONFIG.TEMPERATURE,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from fallback model');
      }

      // Parse response manually if not JSON
      const analysis = this.parseTextAnalysis(response);
      const processingTime = Date.now() - startTime;

      return {
        keyInformation: analysis.keyInformation || {},
        timeline: analysis.timeline || [],
        identifiedNeeds: analysis.identifiedNeeds || [],
        recommendations: analysis.recommendations || [],
        sentiment: analysis.sentiment || { score: 0.5, label: 'neutral' as const },
        processingTime,
        confidence: 0.7 // Lower confidence for fallback
      };
    } catch (error) {
      console.error('Fallback analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Analysis completely failed: ${errorMessage}`);
    }
  }

  /**
   * Build comprehensive document analysis prompt
   */
  private static buildDocumentAnalysisPrompt(request: AIAnalysisRequest): string {
    return `
Analyze this ${request.documentType} document comprehensively:

Document Text:
${request.text}

Provide analysis in JSON format with:
{
  "keyInformation": {
    "documentType": "string",
    "childName": "string",
    "dateOfBirth": "string",
    "assessmentDate": "string",
    "assessor": "string",
    "keyFindings": ["string"],
    "diagnoses": ["string"],
    "testScores": {},
    "recommendations": ["string"]
  },
  "timeline": [
    {
      "date": "YYYY-MM-DD",
      "event": "string",
      "importance": "low|medium|high|critical"
    }
  ],
  "identifiedNeeds": ["string"],
  "recommendations": ["string"],
  "sentiment": {
    "score": 0.5,
    "label": "neutral"
  }
}

Focus on autism-specific information, developmental milestones, support needs, and evidence-based recommendations.
`;
  }

  /**
   * Build legal document prompt
   */
  private static buildLegalDocumentPrompt(documentType: string, caseData: any): string {
    const prompts: Record<string, string> = {
      appeal: `
Draft a comprehensive tribunal appeal document for this SEN case:

Case Data:
${JSON.stringify(caseData, null, 2)}

Include:
1. Appeal grounds with legal citations
2. Evidence summary with specific examples
3. Requested remedies and outcomes
4. Legal arguments based on Children and Families Act 2014
5. Supporting case law references
`,
      witness_statement: `
Draft a witness statement for this SEN tribunal case:

Case Data:
${JSON.stringify(caseData, null, 2)}

Include:
1. Witness background and qualifications
2. Factual observations and evidence
3. Professional opinions and recommendations
4. Supporting documentation references
`,
      evidence_summary: `
Create an evidence summary for this SEN tribunal case:

Case Data:
${JSON.stringify(caseData, null, 2)}

Include:
1. Chronological summary of events
2. Key evidence with page references
3. Expert witness summaries
4. Documentary evidence index
`
    };

    return prompts[documentType] || prompts.evidence_summary;
  }

  /**
   * Build simple analysis prompt for fallback
   */
  private static buildSimpleAnalysisPrompt(request: AIAnalysisRequest): string {
    return `
Analyze this ${request.documentType} and provide:
1. Key information about the child
2. Important findings or diagnoses
3. Recommended support needs
4. Next steps or recommendations

Document:
${request.text.substring(0, 3000)}...

Provide clear, structured analysis.
`;
  }

  /**
   * Parse text analysis response
   */
  private static parseTextAnalysis(text: string): Partial<AIAnalysisResponse> {
    // Simple text parsing for fallback
    return {
      keyInformation: { summary: text.substring(0, 500) },
      timeline: [],
      identifiedNeeds: ['Manual review required'],
      recommendations: ['Professional consultation recommended'],
      sentiment: { score: 0.5, label: 'neutral' as const }
    };
  }

  /**
   * Generate cache key for analysis request
   */
  private static generateCacheKey(request: AIAnalysisRequest): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify(request))
      .digest('hex');
    return hash;
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(analysis: any, originalText: string): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on analysis completeness
    if (analysis.keyInformation && Object.keys(analysis.keyInformation).length > 3) {
      confidence += 0.1;
    }

    if (analysis.recommendations && analysis.recommendations.length > 0) {
      confidence += 0.05;
    }

    if (originalText.length > 1000) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Health check for OpenAI service
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const client = this.checkOpenAI();
      const response = await client.chat.completions.create({
        model: MODELS.FALLBACK,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });

      return !!response.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      return false;
    }
  }
}

export default OpenAIService;
