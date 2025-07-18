-- School SENCO Portal Database Schema
-- Comprehensive SEND management system for schools

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    postcode VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    head_teacher VARCHAR(255),
    senco_name VARCHAR(255),
    senco_email VARCHAR(255),
    ofsted_rating VARCHAR(50),
    school_type VARCHAR(100), -- primary, secondary, special, etc.
    pupil_capacity INTEGER,
    current_enrollment INTEGER,
    send_provision_type VARCHAR(100), -- mainstream, special_unit, resourced_provision
    local_authority VARCHAR(255),
    dfes_number VARCHAR(20),
    urn VARCHAR(20), -- Unique Reference Number
    website_url VARCHAR(500),
    established_date DATE,
    age_range VARCHAR(20), -- e.g., "4-11", "11-16"
    gender VARCHAR(20), -- mixed, boys, girls
    religious_character VARCHAR(100),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Students with SEND needs
CREATE TABLE IF NOT EXISTS senco_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL, -- School's internal student ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    year_group VARCHAR(20),
    class_name VARCHAR(100),
    gender VARCHAR(20),
    ethnicity VARCHAR(100),
    primary_language VARCHAR(100),
    pupil_premium BOOLEAN DEFAULT FALSE,
    looked_after_child BOOLEAN DEFAULT FALSE,
    young_carer BOOLEAN DEFAULT FALSE,

    -- SEND Information
    send_status VARCHAR(50) NOT NULL CHECK (send_status IN ('no_send', 'send_support', 'ehc_plan', 'statement')),
    primary_need VARCHAR(100), -- autism, adhd, learning_difficulty, etc.
    secondary_needs TEXT[],
    date_identified DATE,
    send_register_entry_date DATE,

    -- Contact Information
    parent_1_name VARCHAR(255),
    parent_1_email VARCHAR(255),
    parent_1_phone VARCHAR(50),
    parent_1_relationship VARCHAR(50),
    parent_2_name VARCHAR(255),
    parent_2_email VARCHAR(255),
    parent_2_phone VARCHAR(50),
    parent_2_relationship VARCHAR(50),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),

    -- Medical Information
    medical_conditions TEXT[],
    allergies TEXT[],
    medications JSONB,
    dietary_requirements TEXT,
    health_care_plan BOOLEAN DEFAULT FALSE,

    -- Academic Information
    current_attainment JSONB, -- Key stage assessments, etc.
    reading_age DECIMAL(4,2),
    spelling_age DECIMAL(4,2),

    -- Support Information
    current_interventions TEXT[],
    teaching_assistant_hours DECIMAL(5,2),
    specialist_equipment TEXT[],

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(school_id, student_id)
);

-- IEP (Individual Education Plans) and EHCP management
CREATE TABLE IF NOT EXISTS education_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES senco_students(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('iep', 'ehcp', 'statement', 'support_plan')),
    plan_number VARCHAR(100),

    -- Plan Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'under_review', 'completed', 'ceased')),
    start_date DATE NOT NULL,
    end_date DATE,
    review_date DATE NOT NULL,
    next_review_date DATE,

    -- Plan Details
    title VARCHAR(255),
    current_provision TEXT,
    outcomes JSONB, -- Array of outcome objects
    targets JSONB, -- Array of target objects with success criteria
    strategies JSONB, -- Teaching strategies and interventions
    resources_required TEXT[],
    staffing_requirements JSONB,

    -- Assessment Information
    strengths TEXT,
    difficulties TEXT,
    barriers_to_learning TEXT,

    -- Views and Aspirations
    student_views TEXT,
    parent_views TEXT,
    professional_views TEXT,

    -- Transition Planning
    transition_planning TEXT,
    post_16_planning TEXT,

    -- Review Information
    review_notes TEXT,
    review_outcomes TEXT,
    parent_attendance BOOLEAN,
    student_attendance BOOLEAN,

    -- Legal Requirements (for EHCPs)
    annual_review_due DATE,
    statutory_assessment_date DATE,
    plan_issued_date DATE,

    created_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Plan participants and contributions
CREATE TABLE IF NOT EXISTS plan_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES education_plans(id) ON DELETE CASCADE,
    participant_type VARCHAR(50) NOT NULL CHECK (participant_type IN ('parent', 'student', 'teacher', 'senco', 'ta', 'professional', 'la_officer')),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    email VARCHAR(255),
    organization VARCHAR(255),
    contribution TEXT,
    attendance_required BOOLEAN DEFAULT FALSE,
    attended_review BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Staff and their SEND responsibilities
CREATE TABLE IF NOT EXISTS school_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    staff_id VARCHAR(50), -- School's internal staff ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),

    -- Role Information
    job_title VARCHAR(255),
    role_type VARCHAR(50) CHECK (role_type IN ('teacher', 'teaching_assistant', 'senco', 'head_teacher', 'deputy_head', 'support_staff')),
    department VARCHAR(100),

    -- SEND Qualifications and Training
    send_qualifications TEXT[],
    training_completed JSONB, -- Array of training records
    training_needs TEXT[],

    -- Work Schedule
    hours_per_week DECIMAL(5,2),
    contract_type VARCHAR(50), -- permanent, temporary, supply
    start_date DATE,
    end_date DATE,

    -- SEND Responsibilities
    send_responsibilities TEXT[],
    specialist_areas TEXT[],
    allocated_students UUID[], -- Array of student IDs

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(school_id, staff_id)
);

-- Student assessments and progress tracking
CREATE TABLE IF NOT EXISTS student_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES senco_students(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100) NOT NULL,
    assessment_name VARCHAR(255) NOT NULL,
    assessment_date DATE NOT NULL,
    assessor_name VARCHAR(255),
    assessor_organization VARCHAR(255),

    -- Results
    scores JSONB,
    percentiles JSONB,
    age_equivalents JSONB,
    standardized_scores JSONB,

    -- Interpretation
    summary TEXT,
    recommendations TEXT,
    areas_of_strength TEXT,
    areas_of_concern TEXT,

    -- Follow-up
    further_assessment_needed BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,

    -- File attachments
    report_url VARCHAR(500),
    supporting_documents JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Progress monitoring and data tracking
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES senco_students(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES education_plans(id) ON DELETE SET NULL,
    target_id VARCHAR(100), -- Reference to specific target in plan

    -- Progress Data
    measurement_date DATE NOT NULL,
    subject_area VARCHAR(100),
    skill_area VARCHAR(100),
    measurement_type VARCHAR(50), -- observation, test_score, rating_scale, etc.

    -- Scores and Ratings
    raw_score DECIMAL(10,2),
    percentage_score DECIMAL(5,2),
    grade_equivalent VARCHAR(20),
    progress_rating VARCHAR(50), -- exceeded, met, progressing, concern

    -- Qualitative Data
    observation_notes TEXT,
    teaching_notes TEXT,
    next_steps TEXT,

    -- Context
    intervention_used VARCHAR(255),
    support_level VARCHAR(50), -- independent, minimal, moderate, maximum
    environment VARCHAR(100), -- classroom, 1:1, small_group, etc.

    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Interventions and support strategies
CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    intervention_type VARCHAR(100), -- academic, behavioral, social, communication
    category VARCHAR(100), -- tier_1, tier_2, tier_3, specialist

    -- Description
    description TEXT,
    objectives TEXT[],
    target_groups TEXT[], -- Individual, small_group, whole_class
    duration_weeks INTEGER,
    frequency_per_week INTEGER,
    session_duration_minutes INTEGER,

    -- Resources
    resources_required TEXT[],
    staff_requirements JSONB,
    training_required TEXT[],
    cost_per_student DECIMAL(10,2),

    -- Evidence Base
    evidence_base TEXT,
    research_links TEXT[],
    effectiveness_rating VARCHAR(50),

    -- Implementation
    implementation_guide TEXT,
    fidelity_checklist TEXT[],
    progress_monitoring_tools TEXT[],

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Student intervention allocations
CREATE TABLE IF NOT EXISTS student_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES senco_students(id) ON DELETE CASCADE,
    intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES school_staff(id),

    -- Allocation Details
    start_date DATE NOT NULL,
    end_date DATE,
    planned_duration_weeks INTEGER,
    frequency_per_week INTEGER,
    group_size INTEGER DEFAULT 1,

    -- Outcomes
    exit_reason VARCHAR(100), -- completed, discontinued, transferred
    outcome_achieved BOOLEAN,
    impact_rating VARCHAR(50), -- high, medium, low, none
    next_steps TEXT,

    -- Progress Data
    baseline_data JSONB,
    progress_data JSONB,
    exit_data JSONB,

    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SEND provision mapping
CREATE TABLE IF NOT EXISTS provision_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,

    -- Wave of Provision
    wave_1_provision JSONB, -- Universal provision for all
    wave_2_provision JSONB, -- Additional provision for some
    wave_3_provision JSONB, -- Specialist provision for few

    -- Costings
    wave_1_cost DECIMAL(12,2),
    wave_2_cost DECIMAL(12,2),
    wave_3_cost DECIMAL(12,2),
    total_send_budget DECIMAL(12,2),

    -- Staffing
    teaching_staff_fte DECIMAL(5,2),
    ta_staff_fte DECIMAL(5,2),
    specialist_staff_fte DECIMAL(5,2),

    -- Quality Assurance
    quality_measures JSONB,
    impact_data JSONB,
    effectiveness_review TEXT,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE(school_id, academic_year)
);

-- Compliance and statutory reporting
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL, -- census, annual_review, tribunal_response
    academic_year VARCHAR(20) NOT NULL,
    submission_deadline DATE NOT NULL,

    -- Report Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'submitted', 'late')),
    submitted_date DATE,
    submitted_by UUID REFERENCES users(id),

    -- Report Data
    report_data JSONB,
    student_count INTEGER,
    ehcp_count INTEGER,
    send_support_count INTEGER,

    -- Files
    report_url VARCHAR(500),
    supporting_documents JSONB,

    -- Validation
    validation_errors JSONB,
    warnings JSONB,

    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Parent communication log
CREATE TABLE IF NOT EXISTS parent_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES senco_students(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL, -- meeting, phone, email, letter, report

    -- Communication Details
    subject VARCHAR(255),
    date_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    method VARCHAR(50), -- face_to_face, phone, email, video_call

    -- Participants
    school_participants JSONB, -- Array of staff involved
    parent_participants JSONB, -- Array of parents/carers
    student_present BOOLEAN DEFAULT FALSE,

    -- Content
    purpose TEXT,
    key_points JSONB,
    outcomes TEXT,
    actions_agreed JSONB,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,

    -- Attachments
    documents JSONB,
    recording_url VARCHAR(500),

    -- Satisfaction
    parent_satisfaction_rating INTEGER CHECK (parent_satisfaction_rating BETWEEN 1 AND 5),
    parent_feedback TEXT,

    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SEND analytics and reporting
CREATE TABLE IF NOT EXISTS send_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_type VARCHAR(100) NOT NULL,

    -- Student Metrics
    total_students INTEGER,
    send_students INTEGER,
    send_percentage DECIMAL(5,2),
    ehcp_students INTEGER,
    send_support_students INTEGER,

    -- Need Types
    autism_count INTEGER,
    learning_difficulty_count INTEGER,
    physical_disability_count INTEGER,
    sensory_impairment_count INTEGER,
    social_emotional_count INTEGER,
    speech_language_count INTEGER,

    -- Attainment Data
    ks1_attainment JSONB,
    ks2_attainment JSONB,
    ks4_attainment JSONB,
    progress_8_send DECIMAL(5,2),

    -- Provision Data
    teaching_assistant_hours DECIMAL(10,2),
    specialist_provision_hours DECIMAL(10,2),
    intervention_hours DECIMAL(10,2),

    -- Financial Data
    send_budget_allocated DECIMAL(12,2),
    send_budget_spent DECIMAL(12,2),
    cost_per_send_student DECIMAL(10,2),

    -- Outcomes
    targets_met_percentage DECIMAL(5,2),
    parent_satisfaction DECIMAL(5,2),
    staff_confidence_rating DECIMAL(5,2),

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_senco_students_school_id ON senco_students(school_id);
CREATE INDEX IF NOT EXISTS idx_senco_students_send_status ON senco_students(send_status);
CREATE INDEX IF NOT EXISTS idx_senco_students_year_group ON senco_students(year_group);
CREATE INDEX IF NOT EXISTS idx_senco_students_primary_need ON senco_students(primary_need);

CREATE INDEX IF NOT EXISTS idx_education_plans_student_id ON education_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_education_plans_plan_type ON education_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_education_plans_status ON education_plans(status);
CREATE INDEX IF NOT EXISTS idx_education_plans_review_date ON education_plans(review_date);

CREATE INDEX IF NOT EXISTS idx_school_staff_school_id ON school_staff(school_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_role_type ON school_staff(role_type);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_measurement_date ON student_progress(measurement_date);

CREATE INDEX IF NOT EXISTS idx_student_interventions_student_id ON student_interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_interventions_intervention_id ON student_interventions(intervention_id);

CREATE INDEX IF NOT EXISTS idx_parent_communications_student_id ON parent_communications(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_communications_date_time ON parent_communications(date_time);

CREATE INDEX IF NOT EXISTS idx_send_analytics_school_id ON send_analytics(school_id);
CREATE INDEX IF NOT EXISTS idx_send_analytics_metric_date ON send_analytics(metric_date);

-- Functions for analytics and reporting
CREATE OR REPLACE FUNCTION get_school_send_summary(p_school_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    total_students BIGINT,
    send_students BIGINT,
    send_percentage DECIMAL,
    ehcp_count BIGINT,
    send_support_count BIGINT,
    primary_needs JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_students,
        COUNT(*) FILTER (WHERE send_status != 'no_send') as send_students,
        ROUND((COUNT(*) FILTER (WHERE send_status != 'no_send')::decimal / COUNT(*)) * 100, 2) as send_percentage,
        COUNT(*) FILTER (WHERE send_status = 'ehc_plan') as ehcp_count,
        COUNT(*) FILTER (WHERE send_status = 'send_support') as send_support_count,
        jsonb_agg(
            jsonb_build_object(
                'need', primary_need,
                'count', need_count
            )
        ) as primary_needs
    FROM senco_students s
    LEFT JOIN (
        SELECT primary_need, COUNT(*) as need_count
        FROM senco_students
        WHERE school_id = p_school_id AND is_active = true
        GROUP BY primary_need
    ) needs ON true
    WHERE s.school_id = p_school_id AND s.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to check compliance deadlines
CREATE OR REPLACE FUNCTION get_compliance_deadlines(p_school_id UUID, p_days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    student_name TEXT,
    plan_type VARCHAR,
    deadline_type VARCHAR,
    deadline_date DATE,
    days_until_due INTEGER,
    urgency VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CONCAT(ss.first_name, ' ', ss.last_name) as student_name,
        ep.plan_type,
        'Annual Review' as deadline_type,
        ep.next_review_date as deadline_date,
        (ep.next_review_date - CURRENT_DATE) as days_until_due,
        CASE
            WHEN ep.next_review_date < CURRENT_DATE THEN 'OVERDUE'
            WHEN ep.next_review_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'URGENT'
            WHEN ep.next_review_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'DUE_SOON'
            ELSE 'FUTURE'
        END as urgency
    FROM education_plans ep
    JOIN senco_students ss ON ep.student_id = ss.id
    WHERE ss.school_id = p_school_id
    AND ep.status = 'active'
    AND ep.next_review_date IS NOT NULL
    AND ep.next_review_date <= CURRENT_DATE + INTERVAL '%s days' % p_days_ahead
    ORDER BY ep.next_review_date;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate intervention impact
CREATE OR REPLACE FUNCTION calculate_intervention_impact(p_intervention_id UUID)
RETURNS TABLE (
    students_completed BIGINT,
    average_duration_weeks DECIMAL,
    success_rate DECIMAL,
    impact_rating_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE exit_reason = 'completed') as students_completed,
        AVG(planned_duration_weeks) as average_duration_weeks,
        (COUNT(*) FILTER (WHERE outcome_achieved = true)::decimal / COUNT(*)) * 100 as success_rate,
        jsonb_object_agg(impact_rating, rating_count) as impact_rating_distribution
    FROM student_interventions si
    LEFT JOIN (
        SELECT impact_rating, COUNT(*) as rating_count
        FROM student_interventions
        WHERE intervention_id = p_intervention_id
        GROUP BY impact_rating
    ) ratings ON true
    WHERE si.intervention_id = p_intervention_id;
END;
$$ LANGUAGE plpgsql;
