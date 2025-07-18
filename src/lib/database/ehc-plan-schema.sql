-- EHC Plan Builder Database Schema
-- Core system for AI-powered Education, Health and Care plan generation

-- EHC Plans table - Main plan records
CREATE TABLE IF NOT EXISTS ehc_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),

    -- Plan Identification
    plan_number VARCHAR(50) UNIQUE,
    plan_title VARCHAR(255),
    plan_version INTEGER DEFAULT 1,
    parent_plan_id UUID REFERENCES ehc_plans(id), -- For versioning

    -- Plan Status and Workflow
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_review', 'professional_review', 'parent_review',
        'la_review', 'finalised', 'submitted', 'approved', 'rejected', 'archived'
    )),

    -- Legal and Administrative
    local_authority VARCHAR(255),
    case_officer_name VARCHAR(255),
    case_officer_email VARCHAR(255),
    statutory_assessment_date DATE,
    plan_start_date DATE,
    annual_review_date DATE,
    next_review_date DATE,

    -- Plan Metadata
    urgency_level VARCHAR(20) DEFAULT 'standard' CHECK (urgency_level IN ('urgent', 'high', 'standard', 'low')),
    complexity_level VARCHAR(20) DEFAULT 'standard' CHECK (complexity_level IN ('complex', 'high', 'standard', 'simple')),
    tribunal_deadline DATE,

    -- AI Generation Settings
    ai_model_used VARCHAR(50),
    generation_prompt TEXT,
    ai_confidence_score DECIMAL(3,2),
    human_review_required BOOLEAN DEFAULT true,

    -- Progress and Completion
    completion_percentage INTEGER DEFAULT 0,
    sections_completed INTEGER DEFAULT 0,
    total_sections INTEGER DEFAULT 12,
    estimated_completion_date DATE,

    -- Legal Compliance
    legal_compliance_score DECIMAL(3,2),
    statutory_requirements_met JSONB DEFAULT '{}',
    compliance_issues JSONB DEFAULT '[]',

    -- Collaboration
    shared_with JSONB DEFAULT '[]', -- Array of user/professional IDs with access
    edit_permissions JSONB DEFAULT '{}',
    comment_count INTEGER DEFAULT 0,

    -- Metadata
    tags TEXT[],
    priority_score INTEGER DEFAULT 50,
    export_formats_available TEXT[] DEFAULT ARRAY['pdf', 'docx', 'html'],

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finalised_at TIMESTAMP,
    submitted_at TIMESTAMP
);

-- EHC Plan Sections - Individual sections of the plan
CREATE TABLE IF NOT EXISTS ehc_plan_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES ehc_plans(id) ON DELETE CASCADE,

    -- Section Identity
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN (
        'child_views', 'parent_views', 'educational_needs', 'health_needs',
        'social_care_needs', 'outcomes', 'educational_provision',
        'health_provision', 'social_care_provision', 'placement',
        'personal_budget', 'advice_information'
    )),
    section_number INTEGER,
    section_title VARCHAR(255),

    -- Content
    content TEXT,
    ai_generated_content TEXT,
    human_reviewed_content TEXT,
    final_content TEXT,

    -- AI Generation
    ai_prompt_used TEXT,
    ai_model_version VARCHAR(50),
    ai_confidence DECIMAL(3,2),
    generation_timestamp TIMESTAMP,

    -- Review and Approval
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'ai_generated', 'under_review', 'reviewed', 'approved', 'needs_revision'
    )),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    reviewed_at TIMESTAMP,

    -- Legal Requirements
    statutory_requirements TEXT[],
    compliance_checked BOOLEAN DEFAULT false,
    compliance_score DECIMAL(3,2),

    -- Version Control
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES ehc_plan_sections(id),
    change_summary TEXT,

    -- Metadata
    word_count INTEGER,
    estimated_reading_time INTEGER, -- in minutes
    complexity_score DECIMAL(3,2),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- EHC Plan Outcomes - SMART goals and targets
CREATE TABLE IF NOT EXISTS ehc_plan_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES ehc_plans(id) ON DELETE CASCADE,

    -- Outcome Details
    outcome_category VARCHAR(50) CHECK (outcome_category IN (
        'educational', 'health', 'social_care', 'independence',
        'community_participation', 'employment', 'accommodation'
    )),
    outcome_title VARCHAR(255) NOT NULL,
    outcome_description TEXT NOT NULL,

    -- SMART Goals Framework
    specific_detail TEXT,
    measurable_criteria TEXT,
    achievable_rationale TEXT,
    relevant_justification TEXT,
    time_bound_deadline DATE,

    -- Progress Tracking
    baseline_measurement TEXT,
    current_progress DECIMAL(5,2) DEFAULT 0, -- Percentage
    progress_notes TEXT,
    last_reviewed_date DATE,

    -- Success Criteria
    success_criteria JSONB, -- Array of criteria objects
    milestones JSONB, -- Array of milestone objects
    evidence_required TEXT[],

    -- Provision Links
    linked_educational_provision UUID[],
    linked_health_provision UUID[],
    linked_social_care_provision UUID[],

    -- Review and Assessment
    achieved BOOLEAN DEFAULT false,
    achievement_date DATE,
    achievement_evidence TEXT,
    continuation_required BOOLEAN,

    -- AI Generation
    ai_generated BOOLEAN DEFAULT false,
    ai_confidence DECIMAL(3,2),
    human_refined BOOLEAN DEFAULT false,

    -- Priority and Urgency
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('critical', 'high', 'medium', 'low')),
    urgency_level VARCHAR(20) DEFAULT 'standard',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- EHC Plan Provision - Services and support to be provided
CREATE TABLE IF NOT EXISTS ehc_plan_provision (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES ehc_plans(id) ON DELETE CASCADE,

    -- Provision Details
    provision_type VARCHAR(50) CHECK (provision_type IN (
        'educational', 'health', 'social_care', 'therapy', 'equipment', 'transport'
    )),
    provision_category VARCHAR(100),
    provision_title VARCHAR(255) NOT NULL,
    provision_description TEXT NOT NULL,

    -- Service Specification
    service_provider VARCHAR(255),
    service_location VARCHAR(255),
    delivery_method VARCHAR(100), -- face_to_face, online, hybrid, outreach
    frequency_description TEXT,
    duration_description TEXT,

    -- Quantified Details
    hours_per_week DECIMAL(5,2),
    weeks_per_year INTEGER,
    total_hours_annual DECIMAL(8,2),
    group_size INTEGER,
    staff_ratio VARCHAR(50), -- e.g., "1:1", "1:3"

    -- Professional Requirements
    staff_qualifications_required TEXT[],
    specialist_expertise_required TEXT[],
    training_requirements TEXT[],

    -- Funding and Commissioning
    funding_source VARCHAR(100),
    commissioning_body VARCHAR(255),
    cost_per_hour DECIMAL(10,2),
    annual_cost DECIMAL(12,2),
    funding_agreed BOOLEAN DEFAULT false,

    -- Outcomes Alignment
    linked_outcomes UUID[],
    expected_impact TEXT,
    success_measures TEXT[],

    -- Timing and Review
    start_date DATE,
    end_date DATE,
    review_frequency VARCHAR(50),
    next_review_date DATE,

    -- Statutory Requirements
    statutory_requirement BOOLEAN DEFAULT false,
    legal_obligation TEXT,
    tribunal_ordered BOOLEAN DEFAULT false,

    -- Quality Assurance
    quality_standards TEXT[],
    monitoring_arrangements TEXT,
    reporting_requirements TEXT,

    -- Status and Progress
    status VARCHAR(30) DEFAULT 'planned' CHECK (status IN (
        'planned', 'agreed', 'commissioned', 'active', 'suspended', 'completed', 'cancelled'
    )),
    implementation_notes TEXT,
    barriers_identified TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Plan Templates - Reusable templates for different scenarios
CREATE TABLE IF NOT EXISTS ehc_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Template Details
    template_name VARCHAR(255) NOT NULL,
    template_description TEXT,
    template_category VARCHAR(100), -- autism, adhd, learning_difficulties, etc.
    age_range VARCHAR(50),
    complexity_level VARCHAR(20),

    -- Template Content
    sections_template JSONB, -- Template structure for all sections
    outcomes_template JSONB, -- Common outcomes for this category
    provision_template JSONB, -- Typical provision patterns

    -- AI Prompts
    ai_generation_prompts JSONB, -- Section-specific prompts
    content_guidelines TEXT,

    -- Usage and Effectiveness
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    user_rating DECIMAL(3,2),

    -- Legal Compliance
    statutory_compliant BOOLEAN DEFAULT true,
    last_legal_review DATE,
    compliance_notes TEXT,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Plan Comments and Collaboration
CREATE TABLE IF NOT EXISTS ehc_plan_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES ehc_plans(id) ON DELETE CASCADE,
    section_id UUID REFERENCES ehc_plan_sections(id) ON DELETE CASCADE,

    -- Comment Details
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(30) DEFAULT 'general' CHECK (comment_type IN (
        'general', 'suggestion', 'concern', 'approval', 'revision_request', 'legal_note'
    )),

    -- Author Information
    author_id UUID NOT NULL REFERENCES users(id),
    author_role VARCHAR(50),
    author_organisation VARCHAR(255),

    -- Threading
    parent_comment_id UUID REFERENCES ehc_plan_comments(id),
    thread_level INTEGER DEFAULT 0,

    -- Status and Resolution
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'addressed', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,

    -- Importance and Urgency
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal', 'low')),
    requires_response BOOLEAN DEFAULT false,
    response_deadline DATE,

    -- Visibility and Access
    visibility VARCHAR(20) DEFAULT 'all' CHECK (visibility IN ('all', 'professionals', 'parents', 'private')),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Plan Generation History and Audit
CREATE TABLE IF NOT EXISTS ehc_plan_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES ehc_plans(id) ON DELETE CASCADE,

    -- Generation Details
    generation_type VARCHAR(30) CHECK (generation_type IN (
        'initial_generation', 'section_regeneration', 'content_enhancement', 'compliance_check'
    )),
    triggered_by UUID REFERENCES users(id),

    -- AI Model Information
    ai_model VARCHAR(50),
    model_version VARCHAR(20),
    prompt_template TEXT,
    input_data JSONB,

    -- Generation Results
    generated_content TEXT,
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_estimate DECIMAL(8,4),

    -- Quality Metrics
    readability_score DECIMAL(3,2),
    compliance_score DECIMAL(3,2),
    completeness_score DECIMAL(3,2),

    -- Status and Feedback
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    user_feedback_rating INTEGER CHECK (user_feedback_rating BETWEEN 1 AND 5),
    user_feedback_notes TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Plan Export History
CREATE TABLE IF NOT EXISTS ehc_plan_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES ehc_plans(id) ON DELETE CASCADE,
    exported_by UUID NOT NULL REFERENCES users(id),

    -- Export Details
    export_format VARCHAR(20) CHECK (export_format IN ('pdf', 'docx', 'html', 'json')),
    export_purpose VARCHAR(50),
    export_settings JSONB,

    -- File Information
    file_path VARCHAR(500),
    file_size_bytes INTEGER,
    download_count INTEGER DEFAULT 0,

    -- Access Control
    access_level VARCHAR(20) DEFAULT 'private' CHECK (access_level IN ('private', 'shared', 'public')),
    expiry_date DATE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_ehc_plans_child_id ON ehc_plans(child_id);
CREATE INDEX IF NOT EXISTS idx_ehc_plans_status ON ehc_plans(status);
CREATE INDEX IF NOT EXISTS idx_ehc_plans_created_by ON ehc_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_ehc_plans_review_date ON ehc_plans(next_review_date);
CREATE INDEX IF NOT EXISTS idx_ehc_plans_tenant_id ON ehc_plans(tenant_id);

CREATE INDEX IF NOT EXISTS idx_ehc_plan_sections_plan_id ON ehc_plan_sections(plan_id);
CREATE INDEX IF NOT EXISTS idx_ehc_plan_sections_type ON ehc_plan_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_ehc_plan_sections_status ON ehc_plan_sections(status);

CREATE INDEX IF NOT EXISTS idx_ehc_plan_outcomes_plan_id ON ehc_plan_outcomes(plan_id);
CREATE INDEX IF NOT EXISTS idx_ehc_plan_outcomes_category ON ehc_plan_outcomes(outcome_category);

CREATE INDEX IF NOT EXISTS idx_ehc_plan_provision_plan_id ON ehc_plan_provision(plan_id);
CREATE INDEX IF NOT EXISTS idx_ehc_plan_provision_type ON ehc_plan_provision(provision_type);

CREATE INDEX IF NOT EXISTS idx_ehc_plan_comments_plan_id ON ehc_plan_comments(plan_id);
CREATE INDEX IF NOT EXISTS idx_ehc_plan_comments_author ON ehc_plan_comments(author_id);

-- Functions for Plan Generation and Management
CREATE OR REPLACE FUNCTION generate_plan_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Generate plan number in format: EHC-YYYY-XXXXXX
    SELECT COALESCE(MAX(CAST(SUBSTRING(plan_number FROM 9) AS INTEGER)), 0) + 1
    INTO counter
    FROM ehc_plans
    WHERE plan_number LIKE 'EHC-' || EXTRACT(YEAR FROM NOW()) || '-%';

    new_number := 'EHC-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(counter::TEXT, 6, '0');

    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate plan completion percentage
CREATE OR REPLACE FUNCTION calculate_plan_completion(p_plan_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_sections INTEGER;
    completed_sections INTEGER;
    completion_pct INTEGER;
BEGIN
    -- Count total and completed sections
    SELECT COUNT(*) INTO total_sections
    FROM ehc_plan_sections
    WHERE plan_id = p_plan_id;

    SELECT COUNT(*) INTO completed_sections
    FROM ehc_plan_sections
    WHERE plan_id = p_plan_id AND status IN ('reviewed', 'approved');

    IF total_sections = 0 THEN
        completion_pct := 0;
    ELSE
        completion_pct := ROUND((completed_sections::DECIMAL / total_sections) * 100);
    END IF;

    -- Update plan record
    UPDATE ehc_plans
    SET
        completion_percentage = completion_pct,
        sections_completed = completed_sections,
        total_sections = total_sections,
        updated_at = NOW()
    WHERE id = p_plan_id;

    RETURN completion_pct;
END;
$$ LANGUAGE plpgsql;

-- Function to check legal compliance
CREATE OR REPLACE FUNCTION check_plan_compliance(p_plan_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    compliance_score DECIMAL := 100.0;
    missing_sections INTEGER := 0;
    incomplete_outcomes INTEGER := 0;
    unfunded_provision INTEGER := 0;
BEGIN
    -- Check for missing required sections
    SELECT COUNT(*) INTO missing_sections
    FROM (VALUES
        ('child_views'), ('parent_views'), ('educational_needs'),
        ('outcomes'), ('educational_provision')
    ) AS required(section_type)
    WHERE NOT EXISTS (
        SELECT 1 FROM ehc_plan_sections s
        WHERE s.plan_id = p_plan_id AND s.section_type = required.section_type
        AND s.status IN ('reviewed', 'approved')
    );

    -- Check for incomplete outcomes
    SELECT COUNT(*) INTO incomplete_outcomes
    FROM ehc_plan_outcomes
    WHERE plan_id = p_plan_id
    AND (specific_detail IS NULL OR measurable_criteria IS NULL OR time_bound_deadline IS NULL);

    -- Check for unfunded provision
    SELECT COUNT(*) INTO unfunded_provision
    FROM ehc_plan_provision
    WHERE plan_id = p_plan_id
    AND funding_agreed = false
    AND statutory_requirement = true;

    -- Calculate compliance score
    compliance_score := compliance_score - (missing_sections * 15);
    compliance_score := compliance_score - (incomplete_outcomes * 5);
    compliance_score := compliance_score - (unfunded_provision * 10);

    compliance_score := GREATEST(compliance_score, 0);

    -- Update plan record
    UPDATE ehc_plans
    SET
        legal_compliance_score = compliance_score,
        updated_at = NOW()
    WHERE id = p_plan_id;

    RETURN compliance_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update plan completion when sections change
CREATE OR REPLACE FUNCTION update_plan_completion_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_plan_completion(NEW.plan_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_plan_completion
    AFTER INSERT OR UPDATE OF status ON ehc_plan_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_plan_completion_trigger();
