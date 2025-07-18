import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { db } from '@/lib/database';
import { z } from 'zod';

// GET - Get individual EHC Plan with all details
export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
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

    const planId = params.planId;

    // Get plan with access control
    let accessWhere = '';
    let accessParams = [planId];

    if (user.role === 'PARENT') {
      accessWhere = 'AND c.parent_id = $2';
      accessParams.push(user.id);
    } else if (user.role === 'PROFESSIONAL') {
      accessWhere = 'AND (p.created_by = $2 OR p.shared_with ? $2::text)';
      accessParams.push(user.id);
    } else if (user.role === 'LA_OFFICER') {
      accessWhere = 'AND p.local_authority = $2';
      accessParams.push(user.local_authority || 'Unknown');
    }

    // Main plan query
    const planQuery = `
      SELECT
        p.*,
        c.first_name as child_first_name,
        c.last_name as child_last_name,
        c.date_of_birth as child_dob,
        c.gender as child_gender,
        c.primary_diagnosis,
        c.secondary_diagnoses,
        c.current_needs,
        c.strengths,
        c.challenges,
        c.current_support,
        c.year_group,
        c.school_type,

        creator.first_name as created_by_first_name,
        creator.last_name as created_by_last_name,
        creator.role as created_by_role,
        creator.email as created_by_email

      FROM ehc_plans p
      JOIN children c ON p.child_id = c.id
      JOIN users creator ON p.created_by = creator.id
      WHERE p.id = $1 ${accessWhere}
    `;

    const planResult = await db.query(planQuery, accessParams);

    if (planResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Plan not found or access denied'
      }, { status: 404 });
    }

    const plan = planResult.rows[0];

    // Get plan sections
    const sectionsResult = await db.query(`
      SELECT
        id, section_type, section_number, section_title,
        content, ai_generated_content, human_reviewed_content, final_content,
        status, ai_confidence, version, word_count,
        reviewed_by, review_notes, reviewed_at,
        created_at, updated_at
      FROM ehc_plan_sections
      WHERE plan_id = $1
      ORDER BY section_number, section_type
    `, [planId]);

    // Get plan outcomes
    const outcomesResult = await db.query(`
      SELECT
        id, outcome_category, outcome_title, outcome_description,
        specific_detail, measurable_criteria, achievable_rationale,
        relevant_justification, time_bound_deadline, success_criteria,
        milestones, baseline_measurement, current_progress,
        achieved, achievement_date, priority_level,
        created_at, updated_at
      FROM ehc_plan_outcomes
      WHERE plan_id = $1
      ORDER BY priority_level DESC, outcome_category
    `, [planId]);

    // Get plan provision
    const provisionResult = await db.query(`
      SELECT
        id, provision_type, provision_category, provision_title,
        provision_description, service_provider, delivery_method,
        frequency_description, hours_per_week, weeks_per_year,
        total_hours_annual, group_size, staff_ratio,
        staff_qualifications_required, specialist_expertise_required,
        funding_source, annual_cost, funding_agreed,
        start_date, end_date, review_frequency, next_review_date,
        statutory_requirement, status, implementation_notes,
        created_at, updated_at
      FROM ehc_plan_provision
      WHERE plan_id = $1
      ORDER BY provision_type, priority_level DESC
    `, [planId]);

    // Get recent comments
    const commentsResult = await db.query(`
      SELECT
        c.id, c.comment_text, c.comment_type, c.status,
        c.priority, c.requires_response, c.visibility,
        c.created_at, c.updated_at,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.role as author_role,
        c.author_organisation,
        s.section_type as section_type
      FROM ehc_plan_comments c
      JOIN users u ON c.author_id = u.id
      LEFT JOIN ehc_plan_sections s ON c.section_id = s.id
      WHERE c.plan_id = $1
      ORDER BY c.created_at DESC
      LIMIT 50
    `, [planId]);

    // Get generation history
    const generationHistoryResult = await db.query(`
      SELECT
        generation_type, ai_model, confidence_score,
        processing_time_ms, tokens_used, status,
        user_feedback_rating, created_at
      FROM ehc_plan_generation_log
      WHERE plan_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [planId]);

    // Build response object
    const planData = {
      id: plan.id,
      planNumber: plan.plan_number,
      planTitle: plan.plan_title,
      planVersion: plan.plan_version,
      status: plan.status,
      urgencyLevel: plan.urgency_level,
      complexityLevel: plan.complexity_level,
      completionPercentage: plan.completion_percentage || 0,
      sectionsCompleted: plan.sections_completed || 0,
      totalSections: plan.total_sections || 0,

      // Legal and compliance
      localAuthority: plan.local_authority,
      caseOfficerName: plan.case_officer_name,
      caseOfficerEmail: plan.case_officer_email,
      statutoryAssessmentDate: plan.statutory_assessment_date,
      planStartDate: plan.plan_start_date,
      annualReviewDate: plan.annual_review_date,
      nextReviewDate: plan.next_review_date,
      tribunalDeadline: plan.tribunal_deadline,

      // AI and quality metrics
      aiModelUsed: plan.ai_model_used,
      aiConfidenceScore: parseFloat(plan.ai_confidence_score || '0') * 100,
      legalComplianceScore: parseFloat(plan.legal_compliance_score || '0') * 100,
      complianceIssues: plan.compliance_issues || [],
      statutoryRequirementsMet: plan.statutory_requirements_met || {},
      humanReviewRequired: plan.human_review_required,

      // Collaboration
      sharedWith: plan.shared_with || [],
      editPermissions: plan.edit_permissions || {},
      commentCount: plan.comment_count || 0,

      // Child information
      child: {
        firstName: plan.child_first_name,
        lastName: plan.child_last_name,
        dateOfBirth: plan.child_dob,
        gender: plan.child_gender,
        primaryDiagnosis: plan.primary_diagnosis,
        secondaryDiagnoses: plan.secondary_diagnoses || [],
        currentNeeds: plan.current_needs || [],
        strengths: plan.strengths || [],
        challenges: plan.challenges || [],
        currentSupport: plan.current_support || [],
        yearGroup: plan.year_group,
        schoolType: plan.school_type
      },

      // Creator information
      createdBy: {
        firstName: plan.created_by_first_name,
        lastName: plan.created_by_last_name,
        role: plan.created_by_role,
        email: plan.created_by_email
      },

      // Plan content
      sections: sectionsResult.rows.map(section => ({
        id: section.id,
        sectionType: section.section_type,
        sectionNumber: section.section_number,
        sectionTitle: section.section_title,
        content: section.final_content || section.human_reviewed_content || section.content,
        aiGeneratedContent: section.ai_generated_content,
        humanReviewedContent: section.human_reviewed_content,
        status: section.status,
        aiConfidence: parseFloat(section.ai_confidence || '0') * 100,
        version: section.version,
        wordCount: section.word_count,
        reviewedBy: section.reviewed_by,
        reviewNotes: section.review_notes,
        reviewedAt: section.reviewed_at,
        createdAt: section.created_at,
        updatedAt: section.updated_at
      })),

      outcomes: outcomesResult.rows.map(outcome => ({
        id: outcome.id,
        category: outcome.outcome_category,
        title: outcome.outcome_title,
        description: outcome.outcome_description,
        specificDetail: outcome.specific_detail,
        measurableCriteria: outcome.measurable_criteria,
        achievableRationale: outcome.achievable_rationale,
        relevantJustification: outcome.relevant_justification,
        timeBoundDeadline: outcome.time_bound_deadline,
        successCriteria: outcome.success_criteria || [],
        milestones: outcome.milestones || [],
        baselineMeasurement: outcome.baseline_measurement,
        currentProgress: parseFloat(outcome.current_progress || '0'),
        achieved: outcome.achieved,
        achievementDate: outcome.achievement_date,
        priorityLevel: outcome.priority_level,
        createdAt: outcome.created_at,
        updatedAt: outcome.updated_at
      })),

      provision: provisionResult.rows.map(provision => ({
        id: provision.id,
        type: provision.provision_type,
        category: provision.provision_category,
        title: provision.provision_title,
        description: provision.provision_description,
        serviceProvider: provision.service_provider,
        deliveryMethod: provision.delivery_method,
        frequencyDescription: provision.frequency_description,
        hoursPerWeek: parseFloat(provision.hours_per_week || '0'),
        weeksPerYear: provision.weeks_per_year,
        totalHoursAnnual: parseFloat(provision.total_hours_annual || '0'),
        groupSize: provision.group_size,
        staffRatio: provision.staff_ratio,
        staffQualificationsRequired: provision.staff_qualifications_required || [],
        specialistExpertiseRequired: provision.specialist_expertise_required || [],
        fundingSource: provision.funding_source,
        annualCost: parseFloat(provision.annual_cost || '0'),
        fundingAgreed: provision.funding_agreed,
        startDate: provision.start_date,
        endDate: provision.end_date,
        reviewFrequency: provision.review_frequency,
        nextReviewDate: provision.next_review_date,
        statutoryRequirement: provision.statutory_requirement,
        status: provision.status,
        implementationNotes: provision.implementation_notes,
        createdAt: provision.created_at,
        updatedAt: provision.updated_at
      })),

      comments: commentsResult.rows.map(comment => ({
        id: comment.id,
        text: comment.comment_text,
        type: comment.comment_type,
        status: comment.status,
        priority: comment.priority,
        requiresResponse: comment.requires_response,
        visibility: comment.visibility,
        sectionType: comment.section_type,
        author: {
          firstName: comment.author_first_name,
          lastName: comment.author_last_name,
          role: comment.author_role,
          organisation: comment.author_organisation
        },
        createdAt: comment.created_at,
        updatedAt: comment.updated_at
      })),

      generationHistory: generationHistoryResult.rows.map(gen => ({
        type: gen.generation_type,
        aiModel: gen.ai_model,
        confidenceScore: parseFloat(gen.confidence_score || '0') * 100,
        processingTimeMs: gen.processing_time_ms,
        tokensUsed: gen.tokens_used,
        status: gen.status,
        userRating: gen.user_feedback_rating,
        createdAt: gen.created_at
      })),

      // Timestamps
      createdAt: plan.created_at,
      updatedAt: plan.updated_at,
      finalisedAt: plan.finalised_at,
      submittedAt: plan.submitted_at
    };

    return NextResponse.json({
      success: true,
      data: planData
    });

  } catch (error) {
    console.error('Error fetching EHC plan:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch EHC plan'
    }, { status: 500 });
  }
}

// PUT - Update EHC Plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
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

    const planId = params.planId;
    const body = await request.json();

    // Check plan access
    const planResult = await db.query(`
      SELECT p.*, c.parent_id
      FROM ehc_plans p
      JOIN children c ON p.child_id = c.id
      WHERE p.id = $1
    `, [planId]);

    if (planResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Plan not found'
      }, { status: 404 });
    }

    const plan = planResult.rows[0];

    // Check edit permissions
    const canEdit = (
      user.role === 'PARENT' && plan.parent_id === user.id
    ) || (
      user.role === 'PROFESSIONAL' && (
        plan.created_by === user.id ||
        (plan.shared_with && plan.shared_with.includes(user.id))
      )
    ) || (
      user.role === 'LA_OFFICER' && plan.local_authority === user.local_authority
    );

    if (!canEdit) {
      return NextResponse.json({
        success: false,
        message: 'Permission denied'
      }, { status: 403 });
    }

    // Update plan fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    const updatableFields = [
      'plan_title', 'status', 'urgency_level', 'local_authority',
      'case_officer_name', 'case_officer_email', 'annual_review_date',
      'next_review_date', 'tribunal_deadline', 'tags'
    ];

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid updates provided'
      }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(planId);

    await db.query(`
      UPDATE ehc_plans
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values);

    // Recalculate completion if status changed
    if (body.status) {
      await db.query('SELECT calculate_plan_completion($1)', [planId]);
    }

    return NextResponse.json({
      success: true,
      message: 'Plan updated successfully'
    });

  } catch (error) {
    console.error('Error updating EHC plan:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update EHC plan'
    }, { status: 500 });
  }
}

// DELETE - Delete EHC Plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
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

    const planId = params.planId;

    // Check plan access and status
    const planResult = await db.query(`
      SELECT p.*, c.parent_id
      FROM ehc_plans p
      JOIN children c ON p.child_id = c.id
      WHERE p.id = $1
    `, [planId]);

    if (planResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Plan not found'
      }, { status: 404 });
    }

    const plan = planResult.rows[0];

    // Only allow deletion of draft plans by creators
    if (plan.status !== 'draft' || plan.created_by !== user.id) {
      return NextResponse.json({
        success: false,
        message: 'Can only delete draft plans that you created'
      }, { status: 403 });
    }

    // Soft delete by archiving
    await db.query(`
      UPDATE ehc_plans
      SET status = 'archived', updated_at = NOW()
      WHERE id = $1
    `, [planId]);

    return NextResponse.json({
      success: true,
      message: 'Plan archived successfully'
    });

  } catch (error) {
    console.error('Error deleting EHC plan:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete EHC plan'
    }, { status: 500 });
  }
}
