/**
 * SpectrumCare Platform - AI Document Processing Service
 *
 * Comprehensive AI-powered document analysis system for autism support
 * Uses OpenAI GPT-4 for intelligent medical report analysis and information extraction
 */

import { OpenAI } from 'openai';
import pdf from 'pdf-parse';
import { Document as DocumentType, AIAnalysis, TimelineEvent, Need } from './src/types';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

interface ProcessingOptions {
  extractTimeline: boolean;
  identifyNeeds: boolean;
  generateRecommendations: boolean;
  performSentimentAnalysis: boolean;
  generateSummary: boolean;
  detectUrgency: boolean;
}

interface DocumentMetadata {
  pageCount?: number;
  wordCount?: number;
  readabilityScore?: number;
  language?: string;
  documentQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  extractionConfidence?: number;
}

interface MedicalEntity {
  type: 'condition' | 'medication' | 'procedure' | 'test' | 'professional' | 'facility';
  text: string;
  confidence: number;
  context: string;
  standardCode?: string; // ICD-10, DSM-5, etc.
}

interface AutismSpecificInsights {
  autismIndicators: string[];
  developmentalMilestones: string[];
  behavioralObservations: string[];
  socialCommunicationNotes: string[];
  sensoryProcessingNotes: string[];
  interventionSuggestions: string[];
  diagnosticCriteria: Record<string, boolean>;
  severityIndicators: 'mild' | 'moderate' | 'severe' | 'unknown';
}

export class AIDocumentProcessor {
  private openai: OpenAI;
  private processingQueue: Map<string, ProcessingJob> = new Map();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Main document processing function
   */
  async processDocument(
    document: File | Buffer,
    documentType: string,
    childId: string,
    options: ProcessingOptions = {
      extractTimeline: true,
      identifyNeeds: true,
      generateRecommendations: true,
      performSentimentAnalysis: true,
      generateSummary: true,
      detectUrgency: true
    }
  ): Promise<AIAnalysis> {
    const jobId = this.generateJobId();

    try {
      // Start processing job
      this.startProcessingJob(jobId, documentType);

      // Step 1: Extract text from document
      const extractedText = await this.extractText(document);
      this.updateJobProgress(jobId, 20, 'Text extraction completed');

      // Step 2: Classify document and extract metadata
      const metadata = await this.analyzeDocumentMetadata(extractedText, documentType);
      this.updateJobProgress(jobId, 30, 'Document classification completed');

      // Step 3: Extract medical entities and terminology
      const medicalEntities = await this.extractMedicalEntities(extractedText);
      this.updateJobProgress(jobId, 40, 'Medical entity extraction completed');

      // Step 4: Perform autism-specific analysis
      const autismInsights = await this.analyzeAutismSpecificContent(extractedText, documentType);
      this.updateJobProgress(jobId, 60, 'Autism-specific analysis completed');

      // Step 5: Extract key information using GPT-4
      const keyInformation = await this.extractKeyInformation(extractedText, documentType, childId);
      this.updateJobProgress(jobId, 70, 'Key information extraction completed');

      // Step 6: Generate timeline if requested
      let timeline: TimelineEvent[] = [];
      if (options.extractTimeline) {
        timeline = await this.extractTimeline(extractedText, documentType);
        this.updateJobProgress(jobId, 80, 'Timeline extraction completed');
      }

      // Step 7: Identify needs if requested
      let identifiedNeeds: string[] = [];
      if (options.identifyNeeds) {
        identifiedNeeds = await this.identifyNeeds(extractedText, autismInsights);
        this.updateJobProgress(jobId, 85, 'Needs identification completed');
      }

      // Step 8: Generate recommendations if requested
      let recommendations: string[] = [];
      if (options.generateRecommendations) {
        recommendations = await this.generateRecommendations(
          extractedText,
          keyInformation,
          autismInsights,
          documentType
        );
        this.updateJobProgress(jobId, 90, 'Recommendations generated');
      }

      // Step 9: Calculate overall confidence and create summary
      const confidence = this.calculateOverallConfidence(metadata, medicalEntities, autismInsights);
      this.updateJobProgress(jobId, 100, 'Processing completed');

      // Complete processing job
      this.completeProcessingJob(jobId);

      return {
        extractedText,
        keyInformation: {
          ...keyInformation,
          medicalEntities,
          autismInsights,
          metadata
        },
        recommendations,
        identifiedNeeds,
        timeline,
        confidence,
        processedDate: new Date()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.failProcessingJob(jobId, errorMessage);
      throw new Error(`Document processing failed: ${errorMessage}`);
    }
  }

  /**
   * Extract text from various document formats
   */
  private async extractText(document: File | Buffer): Promise<string> {
    const buffer = document instanceof File ? await document.arrayBuffer() : document;
    const uint8Array = new Uint8Array(buffer);

    try {
      // Detect file type by magic bytes
      const fileType = this.detectFileType(uint8Array);

      switch (fileType) {
        case 'pdf':
          return await this.extractPDFText(Buffer.from(uint8Array));

        case 'docx':
          return await this.extractWordText(Buffer.from(uint8Array));

        case 'image':
          return await this.extractImageText(uint8Array);

        default:
          // Try as plain text
          return this.extractPlainText(uint8Array);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Text extraction failed: ${errorMessage}`);
    }
  }

  /**
   * Extract text from PDF documents
   */
  private async extractPDFText(buffer: Buffer): Promise<string> {
    try {
      const pdfData = await pdf(buffer);

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        // If no text extracted, it might be a scanned PDF
        console.warn('No text found in PDF, this might be a scanned document');
        return '[This appears to be a scanned PDF. OCR processing would be required for text extraction.]';
      }

      // Clean up the extracted text
      return this.cleanExtractedText(pdfData.text);
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      throw new Error('Failed to extract text from PDF document');
    }
  }

  /**
   * Extract text from Word documents
   */
  private async extractWordText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return this.cleanExtractedText(result.value);
    } catch (error) {
      console.error('Word document text extraction failed:', error);
      throw new Error('Failed to extract text from Word document');
    }
  }

  /**
   * Extract text from images using OCR
   */
  private async extractImageText(buffer: Uint8Array): Promise<string> {
    try {
      const worker = await createWorker('eng');

      // Tesseract.js v4 API - worker is created with language

      const { data: { text } } = await worker.recognize(Buffer.from(buffer));
      await worker.terminate();

      return this.cleanExtractedText(text);
    } catch (error) {
      console.error('OCR text extraction failed:', error);
      return '[OCR text extraction failed. Image may be low quality or contain no readable text.]';
    }
  }

  /**
   * Extract plain text
   */
  private extractPlainText(buffer: Uint8Array): string {
    try {
      const text = new TextDecoder('utf-8').decode(buffer);
      return this.cleanExtractedText(text);
    } catch (error) {
      console.error('Plain text extraction failed:', error);
      return '[Text extraction failed. File format may not be supported.]';
    }
  }

  /**
   * Detect file type by examining magic bytes
   */
  private detectFileType(buffer: Uint8Array): string {
    // PDF magic bytes
    if (buffer.length >= 4 &&
        buffer[0] === 0x25 && buffer[1] === 0x50 &&
        buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'pdf';
    }

    // DOCX magic bytes (ZIP format)
    if (buffer.length >= 4 &&
        buffer[0] === 0x50 && buffer[1] === 0x4B &&
        buffer[2] === 0x03 && buffer[3] === 0x04) {
      return 'docx';
    }

    // JPEG magic bytes
    if (buffer.length >= 2 &&
        buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return 'image';
    }

    // PNG magic bytes
    if (buffer.length >= 8 &&
        buffer[0] === 0x89 && buffer[1] === 0x50 &&
        buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'image';
    }

    return 'unknown';
  }

  /**
   * Clean up extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove non-printable characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove multiple consecutive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  /**
   * Analyze document metadata and quality
   */
  private async analyzeDocumentMetadata(text: string, documentType: string): Promise<DocumentMetadata> {
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const readabilityScore = this.calculateFleschKincaidScore(text);
    const language = await this.detectLanguage(text);

    return {
      wordCount,
      readabilityScore,
      language,
      documentQuality: this.assessDocumentQuality(text, wordCount),
      extractionConfidence: this.calculateExtractionConfidence(text)
    };
  }

  /**
   * Calculate Flesch-Kincaid readability score
   */
  private calculateFleschKincaidScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const syllables = this.countSyllables(text);

    if (sentences === 0 || words === 0) return 0;

    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  }

  /**
   * Count syllables in text (improved algorithm)
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().match(/[a-z]+/g) || [];

    return words.reduce((total, word) => {
      // Count vowel groups
      const vowelGroups = word.match(/[aeiouy]+/g) || [];
      let syllableCount = vowelGroups.length;

      // Subtract silent e
      if (word.endsWith('e') && syllableCount > 1) {
        syllableCount--;
      }

      // Ensure at least one syllable per word
      return total + Math.max(1, syllableCount);
    }, 0);
  }

  /**
   * Detect document language (simplified)
   */
  private async detectLanguage(text: string): Promise<string> {
    // Simple English detection - in production, use a proper language detection library
    const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with', 'for', 'as', 'was', 'on', 'are'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    const englishRatio = englishWordCount / words.length;

    return englishRatio > 0.1 ? 'en' : 'unknown';
  }

  /**
   * Assess document quality based on various factors
   */
  private assessDocumentQuality(text: string, wordCount: number): 'excellent' | 'good' | 'fair' | 'poor' {
    let score = 0;

    // Length factor
    if (wordCount > 2000) score += 3;
    else if (wordCount > 1000) score += 2;
    else if (wordCount > 500) score += 1;

    // Structure indicators
    if (text.includes('assessment') || text.includes('evaluation')) score += 1;
    if (text.includes('recommendation')) score += 1;
    if (text.includes('diagnosis')) score += 1;
    if (/\d{1,2}\/\d{1,2}\/\d{4}/.test(text)) score += 1; // Contains dates
    if (text.match(/[A-Z][a-z]+ [A-Z][a-z]+/)) score += 1; // Contains names

    if (score >= 6) return 'excellent';
    if (score >= 4) return 'good';
    if (score >= 2) return 'fair';
    return 'poor';
  }

  /**
   * Calculate text extraction confidence
   */
  private calculateExtractionConfidence(text: string): number {
    let confidence = 0.5;

    // Text length
    if (text.length > 1000) confidence += 0.2;

    // Has proper sentence structure
    if (text.includes('.') && text.includes(' ')) confidence += 0.1;

    // Contains numbers (likely indicates structured content)
    if (/\d/.test(text)) confidence += 0.1;

    // Contains proper nouns (capitalized words)
    if (/[A-Z][a-z]+/.test(text)) confidence += 0.1;

    // No obvious extraction artifacts
    if (!text.includes('???') && !text.includes('###')) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Extract medical entities using specialized NLP
   */
  private async extractMedicalEntities(text: string): Promise<MedicalEntity[]> {
    const prompt = `
You are a medical AI assistant specializing in autism and developmental disorders.
Analyze the following medical text and extract ALL medical entities including:

1. Medical conditions and diagnoses
2. Medications and treatments
3. Medical procedures and tests
4. Healthcare professionals mentioned
5. Medical facilities or clinics
6. Symptoms and observations
7. Developmental milestones
8. Behavioral indicators

For each entity, provide:
- Type (condition/medication/procedure/test/professional/facility)
- Exact text as it appears
- Confidence level (0-1)
- Surrounding context
- Standard medical code if applicable (ICD-10, DSM-5, etc.)

Text to analyze:
${text}

Respond with a JSON array of medical entities.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from GPT-4');

      return JSON.parse(response);
    } catch (error) {
      console.error('Medical entity extraction failed:', error);
      return [];
    }
  }

  /**
   * Perform autism-specific content analysis
   */
  private async analyzeAutismSpecificContent(text: string, documentType: string): Promise<AutismSpecificInsights> {
    const prompt = `
You are an autism specialist AI analyzing a ${documentType}.
Perform comprehensive autism-specific analysis of the following document:

ANALYZE FOR:
1. Autism indicators and red flags
2. Developmental milestones (met/delayed/concerning)
3. Behavioral observations (repetitive behaviors, sensory issues, etc.)
4. Social communication challenges
5. Sensory processing differences
6. Current interventions and their effectiveness
7. DSM-5 autism diagnostic criteria indicators
8. Severity level indicators (mild/moderate/severe support needs)

EXTRACT:
- Specific quotes indicating autism characteristics
- Developmental milestone information
- Behavioral observations
- Social communication notes
- Sensory processing observations
- Intervention recommendations
- Assessment of diagnostic criteria
- Severity indicators

Text:
${text}

Respond with detailed JSON analysis following the AutismSpecificInsights interface.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from GPT-4');

      return JSON.parse(response);
    } catch (error) {
      console.error('Autism-specific analysis failed:', error);
      return {
        autismIndicators: [],
        developmentalMilestones: [],
        behavioralObservations: [],
        socialCommunicationNotes: [],
        sensoryProcessingNotes: [],
        interventionSuggestions: [],
        diagnosticCriteria: {},
        severityIndicators: 'unknown'
      };
    }
  }

  /**
   * Extract key information using GPT-4
   */
  private async extractKeyInformation(text: string, documentType: string, childId: string): Promise<Record<string, any>> {
    const prompt = `
You are an expert in autism assessment and support documentation.
Analyze this ${documentType} and extract ALL key information systematically.

EXTRACT COMPREHENSIVE INFORMATION:

1. PATIENT/CHILD INFORMATION:
   - Name, age, date of birth
   - School/educational setting
   - Family information
   - Previous assessments/diagnoses

2. ASSESSMENT DETAILS:
   - Assessment type and tools used
   - Assessment date and duration
   - Assessor qualifications
   - Assessment environment

3. FINDINGS & RESULTS:
   - Specific test scores and results
   - Behavioral observations
   - Strengths identified
   - Areas of concern
   - Diagnostic conclusions

4. RECOMMENDATIONS:
   - Immediate actions needed
   - Long-term support recommendations
   - Educational accommodations
   - Therapy recommendations
   - Family support suggestions

5. CLINICAL DETAILS:
   - Medical history relevant points
   - Medications mentioned
   - Developmental history
   - Sensory profile information

6. ADMINISTRATIVE:
   - Report date
   - Author/professional details
   - Distribution list
   - Next review date

Document text:
${text}

Extract information in structured JSON format with clear categorization.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from GPT-4');

      return JSON.parse(response);
    } catch (error) {
      console.error('Key information extraction failed:', error);
      return {};
    }
  }

  /**
   * Extract timeline events from document
   */
  private async extractTimeline(text: string, documentType: string): Promise<TimelineEvent[]> {
    const prompt = `
Extract chronological timeline events from this ${documentType}.
Look for dates, milestones, assessments, interventions, and significant events.

For each event, provide:
- Date (estimate if not exact)
- Title/description
- Importance level (low/medium/high/critical)
- Category (diagnosis/assessment/intervention/milestone/etc.)
- Detailed description

Document:
${text}

Return as JSON array of timeline events, sorted chronologically.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from GPT-4');

      const events = JSON.parse(response);

      return events.map((event: any) => ({
        id: this.generateEventId(),
        date: new Date(event.date),
        title: event.title,
        description: event.description,
        category: event.category,
        importance: event.importance,
        source: documentType,
        relatedDocuments: [],
        relatedPeople: []
      }));
    } catch (error) {
      console.error('Timeline extraction failed:', error);
      return [];
    }
  }

  /**
   * Identify support needs from document
   */
  private async identifyNeeds(text: string, autismInsights: AutismSpecificInsights): Promise<string[]> {
    const prompt = `
Based on this document and autism-specific insights, identify ALL support needs for this child.

Consider:
- Communication needs
- Social-emotional support
- Sensory accommodations
- Behavioral support
- Educational modifications
- Medical/health needs
- Family support needs
- Independence/life skills

Document text:
${text}

Autism insights:
${JSON.stringify(autismInsights, null, 2)}

Return array of specific, actionable support needs.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from GPT-4');

      return JSON.parse(response);
    } catch (error) {
      console.error('Needs identification failed:', error);
      return [];
    }
  }

  /**
   * Generate comprehensive recommendations
   */
  private async generateRecommendations(
    text: string,
    keyInformation: Record<string, any>,
    autismInsights: AutismSpecificInsights,
    documentType: string
  ): Promise<string[]> {
    const prompt = `
You are an autism support specialist. Based on this ${documentType} analysis, generate comprehensive, evidence-based recommendations.

PROVIDE RECOMMENDATIONS FOR:
1. Immediate priority actions
2. Educational accommodations and support
3. Therapeutic interventions
4. Family support and training
5. Long-term planning
6. Professional consultations needed
7. Environmental modifications
8. Assistive technology
9. Social skill development
10. Transition planning

Key Information:
${JSON.stringify(keyInformation, null, 2)}

Autism-Specific Insights:
${JSON.stringify(autismInsights, null, 2)}

Original document excerpt:
${text.substring(0, 2000)}...

Generate specific, actionable, evidence-based recommendations prioritized by importance and urgency.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 2500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from GPT-4');

      return JSON.parse(response);
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return [];
    }
  }

  /**
   * Process document for EHC Plan analysis
   */
  async analyzeEHCPlan(documentText: string): Promise<{
    planQuality: 'excellent' | 'good' | 'adequate' | 'poor';
    missingElements: string[];
    strengthsIdentified: string[];
    improvementSuggestions: string[];
    complianceIssues: string[];
    provisionAnalysis: any;
  }> {
    const prompt = `
Analyze this EHC Plan document for quality, compliance, and effectiveness.

ASSESS:
1. Statutory requirements compliance (Children and Families Act 2014)
2. SMART outcomes and provision specifications
3. Quantified provision (hours, group sizes, qualifications)
4. Evidence base for recommendations
5. Person-centered approach
6. Transition planning
7. Review arrangements
8. Missing elements

EVALUATE:
- Plan quality (excellent/good/adequate/poor)
- Specific compliance issues
- Missing mandatory sections
- Vague or unspecific provisions
- Strengths in current plan
- Improvement recommendations

EHC Plan text:
${documentText}

Provide detailed analysis with specific examples and page references where possible.
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 3000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response from GPT-4');

      return JSON.parse(response);
    } catch (error) {
      console.error('EHC Plan analysis failed:', error);
      return {
        planQuality: 'poor',
        missingElements: ['Analysis failed - manual review required'],
        strengthsIdentified: [],
        improvementSuggestions: ['Professional review recommended'],
        complianceIssues: [],
        provisionAnalysis: {}
      };
    }
  }

  /**
   * Batch process multiple documents
   */
  async batchProcessDocuments(
    documents: Array<{ file: File | Buffer; type: string; childId: string }>,
    options: ProcessingOptions
  ): Promise<Map<string, AIAnalysis>> {
    const results = new Map<string, AIAnalysis>();
    const batchId = this.generateJobId();

    try {
      console.log(`Starting batch processing of ${documents.length} documents`);

      for (let i = 0; i < documents.length; i++) {
        const { file, type, childId } = documents[i];
        const docId = `${batchId}-${i}`;

        try {
          const analysis = await this.processDocument(file, type, childId, options);
          results.set(docId, analysis);

          console.log(`Processed document ${i + 1}/${documents.length}`);
        } catch (error) {
          console.error(`Failed to process document ${i + 1}:`, error);
          // Continue with next document
        }
      }

      return results;
    } catch (error) {
      console.error('Batch processing failed:', error);
      return results;
    }
  }

  private isPDF(buffer: Uint8Array): boolean {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  private calculateOverallConfidence(
    metadata: DocumentMetadata,
    entities: MedicalEntity[],
    insights: AutismSpecificInsights
  ): number {
    const metadataScore = metadata.extractionConfidence || 0.5;
    const entityScore = entities.length > 0 ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length : 0.5;
    const insightScore = insights.autismIndicators.length > 0 ? 0.8 : 0.6;

    return (metadataScore + entityScore + insightScore) / 3;
  }

  // Job management methods
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startProcessingJob(jobId: string, documentType: string): void {
    this.processingQueue.set(jobId, {
      id: jobId,
      status: 'processing',
      progress: 0,
      startTime: new Date(),
      documentType,
      currentStep: 'Starting processing'
    });
  }

  private updateJobProgress(jobId: string, progress: number, step: string): void {
    const job = this.processingQueue.get(jobId);
    if (job) {
      job.progress = progress;
      job.currentStep = step;
      this.processingQueue.set(jobId, job);
    }
  }

  private completeProcessingJob(jobId: string): void {
    const job = this.processingQueue.get(jobId);
    if (job) {
      job.status = 'completed';
      job.progress = 100;
      job.endTime = new Date();
      this.processingQueue.set(jobId, job);
    }
  }

  private failProcessingJob(jobId: string, error: string): void {
    const job = this.processingQueue.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error;
      job.endTime = new Date();
      this.processingQueue.set(jobId, job);
    }
  }

  getJobStatus(jobId: string): ProcessingJob | undefined {
    return this.processingQueue.get(jobId);
  }
}

interface ProcessingJob {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  documentType: string;
  currentStep: string;
  error?: string;
}

// Example usage and configuration
export const createAIProcessor = (apiKey: string) => {
  return new AIDocumentProcessor(apiKey);
};

// Export for use in the platform
export default AIDocumentProcessor;
