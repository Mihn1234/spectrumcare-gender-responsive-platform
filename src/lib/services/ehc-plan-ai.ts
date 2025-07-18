import OpenAI from 'openai';
import { z } from 'zod';

// Types for EHC Plan Generation
interface ChildProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  currentNeeds: string[];
  strengths: string[];
  challenges: string[];
  currentSupport: string[];
  yearGroup?: string;
  schoolType?: string;
}

interface AssessmentData {
  assessmentType: string;
  assessor: string;
  assessmentDate: string;
  keyFindings: string[];
  recommendations: string[];
  scores?: Record<string, any>;
  fullReport?: string;
}

interface ParentInput {
  childViews: string;
  parentViews: string;
  homeEnvironment: string;
  familyCircumstances: string;
  aspirations: string;
  concerns: string;
}

interface PlanGenerationContext {
  child: ChildProfile;
  assessments: AssessmentData[];
  parentInput: ParentInput;
  currentProvision: string[];
  localAuthority: string;
  urgencyLevel: 'urgent' | 'high' | 'standard' | 'low';
  planType: 'initial' | 'annual_review' | 'reassessment';
}

// AI prompts for different sections
const SECTION_PROMPTS = {
  child_views: `
    You are an expert EHC plan writer. Generate the "Views of the Child" section based on the provided information.

    Requirements:
    - Use the child's own voice and perspective where possible
    - Age-appropriate language and understanding
    - Include their feelings about school, home, friendships, and activities
    - Mention their strengths, interests, and what makes them happy
    - Include any concerns or worries they have expressed
    - Reference their hopes and aspirations for the future
    - Ensure dignity and respect in language used

    Child Information: {childProfile}
    Parent/Carer Input: {parentInput}
    Assessment Findings: {assessmentSummary}

    Generate a comprehensive "Views of the Child" section that:
    1. Captures the child's authentic voice
    2. Shows understanding of their perspective
    3. Includes both positive aspects and challenges
    4. Is written in first person where appropriate
    5. Meets statutory requirements for EHC plans

    Word count: 300-500 words
  `,

  parent_views: `
    You are an expert EHC plan writer. Generate the "Views of the Parent/Carer" section.

    Requirements:
    - Capture parent/carer perspectives on their child's needs
    - Include family circumstances and home environment
    - Reference the impact on family life and siblings
    - Include aspirations and concerns for the future
    - Mention current support systems and their effectiveness
    - Address any specific cultural or religious considerations

    Parent Input: {parentInput}
    Child Profile: {childProfile}
    Assessment Findings: {assessmentSummary}

    Generate a section that:
    1. Authentically represents parent/carer views
    2. Balances positive aspects with concerns
    3. Shows family strengths and resilience
    4. Identifies support needs and preferences
    5. Addresses future planning and aspirations

    Word count: 400-600 words
  `,

  educational_needs: `
    You are an expert EHC plan writer with extensive knowledge of SEND legislation and educational needs.

    Generate the "Educational Needs" section (Section B) based on assessment findings and child profile.

    Requirements:
    - Clearly identify specific educational needs arising from the child's SEND
    - Reference assessment evidence and professional opinions
    - Distinguish between primary and secondary needs
    - Include cognitive, learning, communication, and social/emotional needs
    - Address barriers to learning and achievement
    - Use precise, measurable language
    - Ensure statutory compliance with SEND Code of Practice

    Child Profile: {childProfile}
    Assessment Data: {assessmentData}
    Current Educational Setting: {currentSetting}

    Structure the response with:
    1. Learning and Cognition needs
    2. Communication and Interaction needs
    3. Social, Emotional and Mental Health needs
    4. Sensory and/or Physical needs
    5. Impact on educational progress and achievement

    Word count: 500-800 words
  `,

  outcomes: `
    You are an expert EHC plan writer specializing in SMART outcomes and goal setting.

    Generate comprehensive outcomes for this EHC plan based on the child's needs and aspirations.

    Requirements:
    - All outcomes must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
    - Cover education, health, care, independence, and community participation
    - Link to identified needs and assessment recommendations
    - Be aspirational yet realistic
    - Include both short-term (6-12 months) and longer-term (2-3 years) outcomes
    - Specify success criteria and measurement methods

    Child Profile: {childProfile}
    Identified Needs: {identifiedNeeds}
    Parent Aspirations: {parentAspirations}
    Assessment Recommendations: {assessmentRecommendations}

    Generate 6-8 outcomes covering:
    1. Educational achievement and progress
    2. Independence skills and life skills
    3. Communication and social interaction
    4. Health and wellbeing
    5. Community participation and inclusion
    6. Preparation for adulthood (if age-appropriate)

    For each outcome, provide:
    - Clear statement of what will be achieved
    - Specific success criteria
    - Measurement methods and frequency
    - Target timeline
    - Links to relevant provision

    Word count: 600-1000 words
  `,

  educational_provision: `
    You are an expert EHC plan writer with deep knowledge of educational provision and SEND support services.

    Generate the "Educational Provision" section (Section F) that specifies exactly what educational support will be provided.

    Requirements:
    - Be specific and quantified (hours, frequency, duration)
    - Link directly to identified needs and outcomes
    - Include specialist teaching, therapies, and support
    - Specify staff qualifications and training requirements
    - Include equipment, resources, and environmental modifications
    - Ensure provision is evidence-based and appropriate
    - Consider both specialist and inclusive approaches

    Child's Educational Needs: {educationalNeeds}
    Linked Outcomes: {outcomes}
    Assessment Recommendations: {assessmentRecommendations}
    Current Setting: {currentSetting}
    Local Authority: {localAuthority}

    Structure the provision to include:
    1. Specialist teaching support (hours, qualifications, approach)
    2. Therapeutic provision (type, frequency, provider)
    3. Support staff provision (ratio, training, supervision)
    4. Environmental modifications and adjustments
    5. Equipment and resources
    6. Training requirements for staff
    7. Monitoring and review arrangements

    Use format: "The child will receive [specific provision] for [frequency/duration] delivered by [qualified professional] to achieve [linked outcome]"

    Word count: 600-1000 words
  `,

  health_provision: `
    You are an expert EHC plan writer with expertise in health and therapeutic provision for children with SEND.

    Generate the "Health Provision" section (Section G) detailing all health-related support and interventions.

    Requirements:
    - Be specific about type, frequency, and duration of interventions
    - Include both NHS and private/independent provision
    - Specify professional qualifications and expertise required
    - Link to health needs and desired outcomes
    - Include therapy, medical monitoring, and health maintenance
    - Consider whole-child approach including mental health

    Child's Health Needs: {healthNeeds}
    Current Health Support: {currentHealthSupport}
    Assessment Recommendations: {healthRecommendations}
    Linked Outcomes: {healthOutcomes}

    Include provision for:
    1. Therapeutic interventions (OT, SALT, physio)
    2. Medical monitoring and management
    3. Mental health and emotional wellbeing support
    4. Specialist equipment and aids
    5. Health education and self-management
    6. Transition planning for adult services

    Word count: 400-700 words
  `
};

export class EHCPlanAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Generate a complete EHC plan using AI
   */
  async generateCompletePlan(context: PlanGenerationContext): Promise<{
    sections: Record<string, string>;
    outcomes: any[];
    provision: any[];
    metadata: {
      aiModel: string;
      generationTime: number;
      confidenceScore: number;
      tokensUsed: number;
    };
  }> {
    const startTime = Date.now();
    const sections: Record<string, string> = {};
    const outcomes: any[] = [];
    const provision: any[] = [];
    let totalTokens = 0;

    try {
      // Generate each section in parallel for efficiency
      const sectionPromises = Object.entries(SECTION_PROMPTS).map(async ([sectionType, prompt]) => {
        const content = await this.generateSection(sectionType, prompt, context);
        return { sectionType, content };
      });

      const sectionResults = await Promise.all(sectionPromises);

      for (const { sectionType, content } of sectionResults) {
        sections[sectionType] = content.text;
        totalTokens += content.tokensUsed;
      }

      // Generate outcomes separately with more detailed prompting
      const outcomesResult = await this.generateOutcomes(context);
      outcomes.push(...outcomesResult.outcomes);
      totalTokens += outcomesResult.tokensUsed;

      // Generate provision specifications
      const provisionResult = await this.generateProvision(context, outcomes);
      provision.push(...provisionResult.provision);
      totalTokens += provisionResult.tokensUsed;

      const generationTime = Date.now() - startTime;
      const confidenceScore = this.calculateConfidenceScore(context, sections);

      return {
        sections,
        outcomes,
        provision,
        metadata: {
          aiModel: 'gpt-4-turbo',
          generationTime,
          confidenceScore,
          tokensUsed: totalTokens
        }
      };

    } catch (error) {
      console.error('Error generating EHC plan:', error);
      throw new Error('Failed to generate EHC plan');
    }
  }

  /**
   * Generate a specific section of an EHC plan
   */
  async generateSection(
    sectionType: string,
    promptTemplate: string,
    context: PlanGenerationContext
  ): Promise<{ text: string; tokensUsed: number; confidence: number }> {

    const prompt = this.formatPrompt(promptTemplate, context);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert EHC plan writer with 15+ years experience in SEND law and practice.
                     You have deep knowledge of the SEND Code of Practice 2015, Children and Families Act 2014,
                     and best practices in person-centred planning. You write clear, professional, and legally
                     compliant EHC plans that focus on the child's strengths and aspirations while addressing
                     their specific needs.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;
      const confidence = this.calculateSectionConfidence(sectionType, content, context);

      return {
        text: content,
        tokensUsed,
        confidence
      };

    } catch (error) {
      console.error(`Error generating section ${sectionType}:`, error);
      throw new Error(`Failed to generate ${sectionType} section`);
    }
  }

  /**
   * Generate SMART outcomes for the plan
   */
  async generateOutcomes(context: PlanGenerationContext): Promise<{
    outcomes: any[];
    tokensUsed: number;
  }> {
    const prompt = `
      Generate 6-8 SMART outcomes for this child's EHC plan. Each outcome must be:
      - Specific: Clearly defined and precise
      - Measurable: With quantifiable success criteria
      - Achievable: Realistic given the child's current level
      - Relevant: Directly related to identified needs
      - Time-bound: With clear timescales

      Child: ${context.child.firstName} ${context.child.lastName}
      Age: ${this.calculateAge(context.child.dateOfBirth)} years
      Primary Diagnosis: ${context.child.primaryDiagnosis}
      Key Needs: ${context.child.currentNeeds.join(', ')}
      Strengths: ${context.child.strengths.join(', ')}
      Parent Aspirations: ${context.parentInput.aspirations}

      For each outcome, provide:
      {
        "category": "educational|independence|communication|health|community|employment",
        "title": "Brief outcome title",
        "description": "Detailed description of what will be achieved",
        "specific_detail": "Specific skills or behaviors to develop",
        "measurable_criteria": "How progress will be measured",
        "achievable_rationale": "Why this is achievable for this child",
        "relevant_justification": "How this relates to their needs/aspirations",
        "time_bound_deadline": "Target date (YYYY-MM-DD)",
        "success_criteria": ["criterion 1", "criterion 2", "criterion 3"],
        "baseline_measurement": "Current level or starting point",
        "milestones": [
          {"milestone": "description", "target_date": "YYYY-MM-DD"},
          {"milestone": "description", "target_date": "YYYY-MM-DD"}
        ]
      }

      Return as JSON array of outcome objects.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in SEND outcome planning. Generate comprehensive, SMART outcomes that are aspirational yet achievable. Return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{}';
      const tokensUsed = response.usage?.total_tokens || 0;

      try {
        const parsed = JSON.parse(content);
        const outcomes = parsed.outcomes || [];

        return { outcomes, tokensUsed };
      } catch (parseError) {
        console.error('Error parsing outcomes JSON:', parseError);
        return { outcomes: [], tokensUsed };
      }

    } catch (error) {
      console.error('Error generating outcomes:', error);
      throw new Error('Failed to generate outcomes');
    }
  }

  /**
   * Generate provision specifications
   */
  async generateProvision(
    context: PlanGenerationContext,
    outcomes: any[]
  ): Promise<{ provision: any[]; tokensUsed: number }> {
    const prompt = `
      Generate specific provision to meet the outcomes and needs for this child's EHC plan.

      Child Profile: ${JSON.stringify(context.child)}
      Outcomes to Address: ${JSON.stringify(outcomes)}
      Assessment Recommendations: ${JSON.stringify(context.assessments)}

      For each piece of provision, specify:
      {
        "provision_type": "educational|health|social_care|therapy|equipment|transport",
        "provision_title": "Brief title",
        "provision_description": "Detailed description",
        "service_provider": "Who will provide this",
        "delivery_method": "face_to_face|online|hybrid|outreach",
        "frequency_description": "How often (e.g., '2 hours weekly')",
        "hours_per_week": numeric_value,
        "weeks_per_year": numeric_value,
        "group_size": number_or_null,
        "staff_qualifications_required": ["qualification 1", "qualification 2"],
        "linked_outcomes": ["outcome_id_1", "outcome_id_2"],
        "expected_impact": "What this provision will achieve",
        "start_date": "YYYY-MM-DD",
        "review_frequency": "weekly|monthly|termly|annually",
        "statutory_requirement": true_or_false,
        "annual_cost": estimated_cost_in_pounds
      }

      Include provision for:
      1. Specialist teaching support
      2. Therapeutic interventions (OT, SALT, etc.)
      3. Support staff (TAs, learning mentors)
      4. Equipment and resources
      5. Environmental modifications
      6. Training for staff
      7. Health interventions
      8. Social care support (if needed)

      Return as JSON array of provision objects.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in SEND provision planning with knowledge of current costs and service delivery models. Generate comprehensive, specific provision. Return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{}';
      const tokensUsed = response.usage?.total_tokens || 0;

      try {
        const parsed = JSON.parse(content);
        const provision = parsed.provision || [];

        return { provision, tokensUsed };
      } catch (parseError) {
        console.error('Error parsing provision JSON:', parseError);
        return { provision: [], tokensUsed };
      }

    } catch (error) {
      console.error('Error generating provision:', error);
      throw new Error('Failed to generate provision');
    }
  }

  /**
   * Check legal compliance of generated content
   */
  async checkLegalCompliance(planContent: any): Promise<{
    complianceScore: number;
    issues: string[];
    recommendations: string[];
  }> {
    const prompt = `
      Review this EHC plan content for legal compliance with the SEND Code of Practice 2015
      and Children and Families Act 2014.

      Plan Content: ${JSON.stringify(planContent)}

      Check for:
      1. Required sections are present and complete
      2. Outcomes are SMART and measurable
      3. Provision is specific and quantified
      4. Language is person-centred and strengths-based
      5. Statutory requirements are met
      6. Timescales and review arrangements are specified
      7. Evidence base is referenced
      8. Child and parent voice is captured

      Return:
      {
        "compliance_score": number_0_to_100,
        "issues": ["issue 1", "issue 2"],
        "recommendations": ["recommendation 1", "recommendation 2"],
        "statutory_requirements_met": {
          "section_a_child_views": true_or_false,
          "section_b_educational_needs": true_or_false,
          "section_e_outcomes": true_or_false,
          "section_f_educational_provision": true_or_false,
          "section_g_health_provision": true_or_false
        }
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a SEND legal expert with deep knowledge of EHC plan compliance requirements. Provide thorough compliance review.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      return {
        complianceScore: parsed.compliance_score || 0,
        issues: parsed.issues || [],
        recommendations: parsed.recommendations || []
      };

    } catch (error) {
      console.error('Error checking legal compliance:', error);
      return {
        complianceScore: 0,
        issues: ['Unable to complete compliance check'],
        recommendations: ['Manual review required']
      };
    }
  }

  /**
   * Helper: Format prompt template with context data
   */
  private formatPrompt(template: string, context: PlanGenerationContext): string {
    const replacements = {
      '{childProfile}': JSON.stringify(context.child),
      '{parentInput}': JSON.stringify(context.parentInput),
      '{assessmentData}': JSON.stringify(context.assessments),
      '{assessmentSummary}': context.assessments.map(a =>
        `${a.assessmentType} by ${a.assessor}: ${a.keyFindings.join(', ')}`
      ).join('\n'),
      '{currentSetting}': context.child.schoolType || 'Not specified',
      '{localAuthority}': context.localAuthority,
      '{identifiedNeeds}': context.child.currentNeeds.join(', '),
      '{parentAspirations}': context.parentInput.aspirations,
      '{assessmentRecommendations}': context.assessments.flatMap(a => a.recommendations).join(', ')
    };

    let formattedPrompt = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      formattedPrompt = formattedPrompt.replace(new RegExp(placeholder, 'g'), value);
    }

    return formattedPrompt;
  }

  /**
   * Calculate confidence score for generated content
   */
  private calculateConfidenceScore(context: PlanGenerationContext, sections: Record<string, string>): number {
    let score = 100;

    // Reduce score based on missing context
    if (!context.child.primaryDiagnosis) score -= 10;
    if (context.assessments.length === 0) score -= 15;
    if (!context.parentInput.childViews) score -= 10;
    if (!context.parentInput.parentViews) score -= 10;

    // Reduce score for short sections
    for (const [sectionType, content] of Object.entries(sections)) {
      if (content.length < 200) score -= 5;
    }

    return Math.max(Math.min(score, 100), 0);
  }

  /**
   * Calculate confidence for individual section
   */
  private calculateSectionConfidence(sectionType: string, content: string, context: PlanGenerationContext): number {
    let confidence = 80;

    // Adjust based on content length and quality
    if (content.length > 300) confidence += 10;
    if (content.length < 150) confidence -= 20;

    // Adjust based on available context
    if (context.assessments.length > 0) confidence += 5;
    if (context.child.primaryDiagnosis) confidence += 5;

    return Math.max(Math.min(confidence, 100), 0);
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}

export default EHCPlanAIService;
