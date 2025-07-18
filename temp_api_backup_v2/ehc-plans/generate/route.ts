import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/database';
import { EHCPlanAIService } from '@/lib/services/ehc-plan-ai';
import { z } from 'zod';

// Validation schema for plan generation request
const GeneratePlanSchema = z.object({
  childId: z.string().uuid(),
  planType: z.enum(['initial', 'annual_review', 'reassessment']),
  urgencyLevel: z.enum(['urgent', 'high', 'standard', 'low']).default('standard'),
  localAuthority: z.string().min(1),
  parentInput: z.object({
    childViews: z.string(),
    parentViews: z.string(),
    homeEnvironment: z.string(),
    familyCircumstances: z.string(),
    aspirations: z.string(),
    concerns: z.string()
  }),
  useTemplate: z.boolean().default(false),
  templateId: z.string().uuid().optional(),
  generateSections: z.array(z.string()).default([
    'child_views', 'parent_views', 'educational_needs', 'outcomes',
    'educational_provision', 'health_provision'
  ])
});

export async function POST(request: NextRequest) {
  try {
    // Authentication
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

    // Validate request body
    const body = await request.json();
    const validatedData = GeneratePlanSchema.parse(body);

    // Check child access permissions
    const childResult = await db.query(`
      SELECT c.*, p.first_name as parent_first_name, p.last_name as parent_last_name
      FROM children c
      JOIN parents p ON c.parent_id = p.id
      WHERE c.id = $1 AND c.parent_id = $2
    `, [validatedData.childId, user.id]);

    if (childResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Child not found or access denied'
      }, { status: 403 });
    }

    const child = childResult.rows[0];

    // Get child's assessments and current data
    const assessmentsResult = await db.query(`
      SELECT
        a.assessment_type,
        a.assessor_name,
        a.assessment_date,
        a.summary,
        a.recommendations,
        a.scores,
        u.first_name || ' ' || u.last_name as professional_name,
        u.specialization
      FROM assessments a
      LEFT JOIN users u ON a.professional_id = u.id
      WHERE a.child_id = $1
      AND a.status = 'completed'
      ORDER BY a.assessment_date DESC
    `, [validatedData.childId]);

    // Get existing EHC plans for this child
    const existingPlansResult = await db.query(`
      SELECT COUNT(*) as plan_count
      FROM ehc_plans
      WHERE child_id = $1 AND status NOT IN ('archived', 'rejected')
    `, [validatedData.childId]);

    const planCount = parseInt(existingPlansResult.rows[0]?.plan_count || '0');

    // Build context for AI generation
    const context = {
      child: {
        id: child.id,
        firstName: child.first_name,
        lastName: child.last_name,
        dateOfBirth: child.date_of_birth,
        gender: child.gender,
        primaryDiagnosis: child.primary_diagnosis || '',
        secondaryDiagnoses: child.secondary_diagnoses || [],
        currentNeeds: child.current_needs || [],
        strengths: child.strengths || [],
        challenges: child.challenges || [],
        currentSupport: child.current_support || [],
        yearGroup: child.year_group,
        schoolType: child.school_type
      },
      assessments: assessmentsResult.rows.map(row => ({
        assessmentType: row.assessment_type,
        assessor: row.professional_name || row.assessor_name,
        assessmentDate: row.assessment_date,
        keyFindings: row.summary ? [row.summary] : [],
        recommendations: row.recommendations || [],
        scores: row.scores || {}
      })),
      parentInput: validatedData.parentInput,
      currentProvision: child.current_support || [],
      localAuthority: validatedData.localAuthority,
      urgencyLevel: validatedData.urgencyLevel,
      planType: validatedData.planType
    };

    // Initialize AI service
    const aiService = new EHCPlanAIService();

    // Generate plan number
    const planNumberResult = await db.query('SELECT generate_plan_number() as plan_number');
    const planNumber = planNumberResult.rows[0].plan_number;

    // Create plan record
    const planResult = await db.query(`
      INSERT INTO ehc_plans (
        tenant_id, child_id, created_by, plan_number, plan_title,
        local_authority, plan_start_date, annual_review_date, next_review_date,
        urgency_level, status, ai_model_used, generation_prompt
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING id
    `, [
      user.tenant_id,
      validatedData.childId,
      user.id,
      planNumber,
      `EHC Plan for ${child.first_name} ${child.last_name}`,
      validatedData.localAuthority,
      new Date(),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      validatedData.urgencyLevel,
      'draft',
      'gpt-4-turbo',
      JSON.stringify(context)
    ]);

    const planId = planResult.rows[0].id;

    // Log generation start
    await db.query(`
      INSERT INTO ehc_plan_generation_log (
        plan_id, generation_type, triggered_by, ai_model,
        model_version, input_data, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      planId, 'initial_generation', user.id, 'gpt-4-turbo',
      '2024-01', JSON.stringify(context), 'processing'
    ]);

    try {
      // Generate plan using AI
      const generationResult = await aiService.generateCompletePlan(context);

      // Save generated sections
      const sectionPromises = Object.entries(generationResult.sections).map(async ([sectionType, content]) => {
        return db.query(`
          INSERT INTO ehc_plan_sections (
            plan_id, section_type, section_title, content,
            ai_generated_content, ai_confidence, ai_model_version,
            generation_timestamp, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          planId,
          sectionType,
          this.getSectionTitle(sectionType),
          content,
          content,
          generationResult.metadata.confidenceScore / 100,
          'gpt-4-turbo',
          new Date(),
          'ai_generated'
        ]);
      });

      await Promise.all(sectionPromises);

      // Save generated outcomes
      const outcomePromises = generationResult.outcomes.map(async (outcome) => {
        return db.query(`
          INSERT INTO ehc_plan_outcomes (
            plan_id, outcome_category, outcome_title, outcome_description,
            specific_detail, measurable_criteria, achievable_rationale,
            relevant_justification, time_bound_deadline, success_criteria,
            milestones, baseline_measurement, ai_generated, ai_confidence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          planId,
          outcome.category,
          outcome.title,
          outcome.description,
          outcome.specific_detail,
          outcome.measurable_criteria,
          outcome.achievable_rationale,
          outcome.relevant_justification,
          outcome.time_bound_deadline,
          JSON.stringify(outcome.success_criteria),
          JSON.stringify(outcome.milestones),
          outcome.baseline_measurement,
          true,
          0.85
        ]);
      });

      await Promise.all(outcomePromises);

      // Save generated provision
      const provisionPromises = generationResult.provision.map(async (provision) => {
        return db.query(`
          INSERT INTO ehc_plan_provision (
            plan_id, provision_type, provision_title, provision_description,
            service_provider, delivery_method, frequency_description,
            hours_per_week, weeks_per_year, group_size,
            staff_qualifications_required, expected_impact, start_date,
            review_frequency, statutory_requirement, annual_cost
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
          planId,
          provision.provision_type,
          provision.provision_title,
          provision.provision_description,
          provision.service_provider,
          provision.delivery_method,
          provision.frequency_description,
          provision.hours_per_week,
          provision.weeks_per_year,
          provision.group_size,
          provision.staff_qualifications_required,
          provision.expected_impact,
          provision.start_date,
          provision.review_frequency,
          provision.statutory_requirement,
          provision.annual_cost
        ]);
      });

      await Promise.all(provisionPromises);

      // Update plan completion and compliance
      await db.query('SELECT calculate_plan_completion($1)', [planId]);
      const complianceResult = await aiService.checkLegalCompliance({
        sections: generationResult.sections,
        outcomes: generationResult.outcomes,
        provision: generationResult.provision
      });

      await db.query(`
        UPDATE ehc_plans SET
          legal_compliance_score = $1,
          compliance_issues = $2,
          ai_confidence_score = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [
        complianceResult.complianceScore / 100,
        JSON.stringify(complianceResult.issues),
        generationResult.metadata.confidenceScore / 100,
        planId
      ]);

      // Update generation log
      await db.query(`
        UPDATE ehc_plan_generation_log SET
          status = 'completed',
          generated_content = $1,
          confidence_score = $2,
          processing_time_ms = $3,
          tokens_used = $4
        WHERE plan_id = $5 AND generation_type = 'initial_generation'
      `, [
        JSON.stringify({ sections: Object.keys(generationResult.sections), outcomes: generationResult.outcomes.length, provision: generationResult.provision.length }),
        generationResult.metadata.confidenceScore / 100,
        generationResult.metadata.generationTime,
        generationResult.metadata.tokensUsed,
        planId
      ]);

      // Get complete plan data for response
      const completePlanResult = await db.query(`
        SELECT
          p.*,
          COUNT(s.id) as sections_count,
          COUNT(o.id) as outcomes_count,
          COUNT(pr.id) as provision_count
        FROM ehc_plans p
        LEFT JOIN ehc_plan_sections s ON p.id = s.plan_id
        LEFT JOIN ehc_plan_outcomes o ON p.id = o.plan_id
        LEFT JOIN ehc_plan_provision pr ON p.id = pr.plan_id
        WHERE p.id = $1
        GROUP BY p.id
      `, [planId]);

      const planData = completePlanResult.rows[0];

      return NextResponse.json({
        success: true,
        message: 'EHC plan generated successfully',
        data: {
          planId: planId,
          planNumber: planNumber,
          status: planData.status,
          sectionsCount: parseInt(planData.sections_count),
          outcomesCount: parseInt(planData.outcomes_count),
          provisionCount: parseInt(planData.provision_count),
          completionPercentage: planData.completion_percentage,
          complianceScore: parseFloat(planData.legal_compliance_score || '0') * 100,
          confidenceScore: parseFloat(planData.ai_confidence_score || '0') * 100,
          complianceIssues: complianceResult.issues,
          recommendations: complianceResult.recommendations,
          metadata: generationResult.metadata
        }
      });

    } catch (generationError) {
      console.error('Plan generation error:', generationError);

      // Update generation log with error
      await db.query(`
        UPDATE ehc_plan_generation_log SET
          status = 'failed',
          error_message = $1
        WHERE plan_id = $2 AND generation_type = 'initial_generation'
      `, [
        generationError.message,
        planId
      ]);

      // Update plan status
      await db.query(`
        UPDATE ehc_plans SET status = 'draft', updated_at = NOW()
        WHERE id = $1
      `, [planId]);

      return NextResponse.json({
        success: false,
        message: 'Plan generation failed',
        error: generationError.message,
        planId: planId // Return plan ID so user can try regenerating
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in EHC plan generation:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to generate EHC plan'
    }, { status: 500 });
  }
}

// Helper function to get section titles
function getSectionTitle(sectionType: string): string {
  const titles = {
    'child_views': 'Section A: Views of the Child',
    'parent_views': 'Section A: Views of the Parent/Carer',
    'educational_needs': 'Section B: Educational Needs',
    'health_needs': 'Section C: Health Needs',
    'social_care_needs': 'Section D: Social Care Needs',
    'outcomes': 'Section E: Outcomes',
    'educational_provision': 'Section F: Educational Provision',
    'health_provision': 'Section G: Health Provision',
    'social_care_provision': 'Section H: Social Care Provision',
    'placement': 'Section I: Placement',
    'personal_budget': 'Section J: Personal Budget',
    'advice_information': 'Section K: Advice and Information'
  };

  return titles[sectionType] || sectionType.replace('_', ' ').toUpperCase();
}
