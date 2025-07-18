-- Medical Practice Integration Database Schema
-- Comprehensive autism assessment and functional medicine practice management

-- Medical Practices table
CREATE TABLE IF NOT EXISTS medical_practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Practice Information
    practice_name VARCHAR(255) NOT NULL,
    practice_type VARCHAR(100) CHECK (practice_type IN (
        'autism_assessment', 'functional_medicine', 'general_practice',
        'specialist_clinic', 'private_practice', 'nhs_service'
    )),

    -- Registration and Compliance
    cqc_registration VARCHAR(50),
    gmc_registration VARCHAR(50),
    insurance_details JSONB,
    accreditations TEXT[],

    -- Contact Information
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    county VARCHAR(100),
    postcode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United Kingdom',
    phone VARCHAR(50),
    email VARCHAR(255),
    website_url VARCHAR(500),

    -- Operating Information
    opening_hours JSONB, -- Weekly schedule
    appointment_duration_minutes INTEGER DEFAULT 60,
    cancellation_policy TEXT,
    payment_terms TEXT,

    -- Platform Integration
    platform_commission_rate DECIMAL(5,2) DEFAULT 15.00, -- Percentage
    auto_scheduling_enabled BOOLEAN DEFAULT TRUE,
    ai_report_generation BOOLEAN DEFAULT TRUE,

    -- Financial
    consultation_fee DECIMAL(10,2),
    assessment_fee DECIMAL(10,2),
    report_fee DECIMAL(10,2),
    follow_up_fee DECIMAL(10,2),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Medical Practitioners
CREATE TABLE IF NOT EXISTS medical_practitioners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES medical_practices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),

    -- Personal Information
    title VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    professional_name VARCHAR(255),

    -- Professional Qualifications
    primary_qualification VARCHAR(255),
    additional_qualifications TEXT[],
    specializations TEXT[],
    gmc_number VARCHAR(50),
    professional_bodies TEXT[],

    -- Experience and Expertise
    years_experience INTEGER,
    autism_assessment_experience INTEGER,
    functional_medicine_experience INTEGER,
    research_interests TEXT[],
    publications TEXT[],

    -- Availability
    working_days TEXT[], -- ['monday', 'tuesday', etc.]
    availability_hours JSONB,
    max_patients_per_day INTEGER DEFAULT 8,

    -- Platform Integration
    bio TEXT,
    profile_image_url VARCHAR(500),
    consultation_types TEXT[],
    languages_spoken TEXT[],

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Autism Assessment Templates and Protocols
CREATE TABLE IF NOT EXISTS assessment_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES medical_practices(id) ON DELETE CASCADE,

    -- Protocol Information
    protocol_name VARCHAR(255) NOT NULL,
    protocol_type VARCHAR(100) CHECK (protocol_type IN (
        'initial_screening', 'diagnostic_assessment', 'post_diagnostic',
        'annual_review', 'functional_assessment', 'cognitive_assessment'
    )),
    age_range_min INTEGER,
    age_range_max INTEGER,

    -- Assessment Components
    screening_tools TEXT[],
    diagnostic_tools TEXT[],
    questionnaires TEXT[],
    observations_required TEXT[],

    -- Timing and Duration
    total_duration_minutes INTEGER,
    number_of_sessions INTEGER DEFAULT 1,
    preparation_time_minutes INTEGER DEFAULT 30,

    -- Requirements
    parent_attendance_required BOOLEAN DEFAULT TRUE,
    child_attendance_required BOOLEAN DEFAULT TRUE,
    previous_reports_required BOOLEAN DEFAULT TRUE,
    school_input_required BOOLEAN DEFAULT TRUE,

    -- Outcomes and Reporting
    report_sections JSONB,
    recommendation_templates JSONB,
    follow_up_protocols JSONB,

    -- Costing
    base_cost DECIMAL(10,2),
    additional_session_cost DECIMAL(10,2),
    report_cost DECIMAL(10,2),

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Medical Appointments
CREATE TABLE IF NOT EXISTS medical_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES medical_practices(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES medical_practitioners(id),
    child_id UUID NOT NULL REFERENCES children(id),
    parent_id UUID NOT NULL REFERENCES users(id),
    protocol_id UUID REFERENCES assessment_protocols(id),

    -- Appointment Details
    appointment_type VARCHAR(100) CHECK (appointment_type IN (
        'initial_consultation', 'diagnostic_assessment', 'follow_up',
        'review', 'report_discussion', 'functional_medicine_consultation'
    )),
    appointment_status VARCHAR(50) DEFAULT 'scheduled' CHECK (appointment_status IN (
        'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled',
        'no_show', 'rescheduled'
    )),

    -- Scheduling
    scheduled_date_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    location VARCHAR(255),
    appointment_method VARCHAR(50) DEFAULT 'in_person' CHECK (appointment_method IN (
        'in_person', 'video_call', 'phone', 'home_visit'
    )),

    -- Preparation and Requirements
    preparation_notes TEXT,
    documents_required TEXT[],
    forms_to_complete TEXT[],

    -- Session Information
    session_notes TEXT,
    observations TEXT,
    recommendations TEXT,
    next_steps TEXT,

    -- Follow-up
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    follow_up_type VARCHAR(100),

    -- Financial
    appointment_fee DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'partial', 'refunded', 'cancelled'
    )),
    payment_method VARCHAR(50),
    invoice_id VARCHAR(100),

    -- Integration
    calendar_event_id VARCHAR(255),
    video_call_link VARCHAR(500),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Medical Assessment Results
CREATE TABLE IF NOT EXISTS medical_assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES medical_appointments(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id),
    practitioner_id UUID NOT NULL REFERENCES medical_practitioners(id),

    -- Assessment Information
    assessment_date DATE NOT NULL,
    assessment_type VARCHAR(100),
    assessment_tools_used TEXT[],

    -- Scores and Results
    raw_scores JSONB,
    standardized_scores JSONB,
    percentile_ranks JSONB,
    age_equivalents JSONB,

    -- Clinical Observations
    behavioral_observations TEXT,
    communication_observations TEXT,
    social_interaction_observations TEXT,
    sensory_observations TEXT,
    cognitive_observations TEXT,

    -- Diagnostic Conclusions
    meets_autism_criteria BOOLEAN,
    autism_severity_level VARCHAR(50), -- requiring support, substantial support, very substantial support
    additional_diagnoses TEXT[],
    differential_diagnoses TEXT[],

    -- Functional Medicine Results (if applicable)
    biomarker_results JSONB,
    nutritional_assessments JSONB,
    microbiome_analysis JSONB,
    metabolic_profile JSONB,

    -- Recommendations
    intervention_recommendations TEXT[],
    educational_recommendations TEXT[],
    therapeutic_recommendations TEXT[],
    medical_recommendations TEXT[],
    lifestyle_recommendations TEXT[],

    -- Report Generation
    report_generated BOOLEAN DEFAULT FALSE,
    report_url VARCHAR(500),
    report_sent_date DATE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Functional Medicine Plans
CREATE TABLE IF NOT EXISTS functional_medicine_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(id),
    practitioner_id UUID NOT NULL REFERENCES medical_practitioners(id),

    -- Plan Information
    plan_name VARCHAR(255),
    plan_start_date DATE NOT NULL,
    plan_duration_months INTEGER,
    plan_status VARCHAR(50) DEFAULT 'active' CHECK (plan_status IN (
        'active', 'paused', 'completed', 'discontinued'
    )),

    -- Health Goals
    primary_goals TEXT[],
    secondary_goals TEXT[],
    target_biomarkers JSONB,

    -- Interventions
    dietary_protocol JSONB,
    supplement_protocol JSONB,
    lifestyle_interventions JSONB,
    detoxification_protocol JSONB,

    -- Monitoring
    monitoring_schedule JSONB,
    biomarker_tracking JSONB,
    symptom_tracking JSONB,
    progress_metrics JSONB,

    -- Progress and Outcomes
    baseline_measurements JSONB,
    current_measurements JSONB,
    improvement_scores JSONB,

    -- Review Schedule
    last_review_date DATE,
    next_review_date DATE,
    review_frequency_weeks INTEGER DEFAULT 4,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Medical Reports
CREATE TABLE IF NOT EXISTS medical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES medical_appointments(id),
    child_id UUID NOT NULL REFERENCES children(id),
    practitioner_id UUID NOT NULL REFERENCES medical_practitioners(id),

    -- Report Information
    report_type VARCHAR(100) CHECK (report_type IN (
        'diagnostic_report', 'assessment_summary', 'progress_report',
        'functional_medicine_report', 'consultation_summary'
    )),
    report_title VARCHAR(255),
    report_date DATE NOT NULL,

    -- Content Structure
    executive_summary TEXT,
    background_history TEXT,
    assessment_process TEXT,
    findings_observations TEXT,
    diagnostic_conclusions TEXT,
    recommendations TEXT,

    -- Report Sections (JSON structure for flexibility)
    report_sections JSONB,

    -- Clinical Details
    diagnosis_codes TEXT[], -- ICD-10 codes
    autism_diagnostic_criteria JSONB,
    comorbid_conditions TEXT[],
    risk_factors JSONB,
    protective_factors JSONB,

    -- Recommendations by Category
    immediate_actions TEXT[],
    short_term_goals TEXT[],
    long_term_goals TEXT[],
    educational_recommendations TEXT[],
    therapeutic_recommendations TEXT[],
    medical_recommendations TEXT[],
    family_support_recommendations TEXT[],

    -- Follow-up and Monitoring
    follow_up_timeline JSONB,
    monitoring_plan TEXT,
    review_schedule TEXT,

    -- Report Status and Distribution
    report_status VARCHAR(50) DEFAULT 'draft' CHECK (report_status IN (
        'draft', 'under_review', 'approved', 'sent', 'archived'
    )),
    approved_by UUID REFERENCES medical_practitioners(id),
    approved_date DATE,

    -- Distribution
    sent_to_parent BOOLEAN DEFAULT FALSE,
    sent_to_school BOOLEAN DEFAULT FALSE,
    sent_to_gp BOOLEAN DEFAULT FALSE,
    sent_to_la BOOLEAN DEFAULT FALSE,

    -- File Management
    report_file_url VARCHAR(500),
    file_size_bytes INTEGER,
    file_format VARCHAR(20) DEFAULT 'pdf',

    -- AI Integration
    ai_generated_sections TEXT[],
    ai_confidence_score DECIMAL(3,2),
    human_review_required BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Appointment Availability Slots
CREATE TABLE IF NOT EXISTS practitioner_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES medical_practitioners(id) ON DELETE CASCADE,

    -- Availability Information
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Slot Configuration
    slot_duration_minutes INTEGER DEFAULT 60,
    break_between_slots_minutes INTEGER DEFAULT 15,
    max_advance_booking_days INTEGER DEFAULT 60,
    min_advance_booking_hours INTEGER DEFAULT 24,

    -- Restrictions
    appointment_types_allowed TEXT[],
    new_patient_slots BOOLEAN DEFAULT TRUE,
    follow_up_slots BOOLEAN DEFAULT TRUE,

    -- Pricing
    standard_rate DECIMAL(10,2),
    rush_rate DECIMAL(10,2), -- for urgent appointments

    -- Recurring Availability
    effective_from DATE NOT NULL,
    effective_until DATE,
    is_recurring BOOLEAN DEFAULT TRUE,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Blocked Availability (holidays, sick days, etc.)
CREATE TABLE IF NOT EXISTS practitioner_blocked_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES medical_practitioners(id) ON DELETE CASCADE,

    -- Block Information
    block_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    all_day BOOLEAN DEFAULT FALSE,

    -- Block Details
    reason VARCHAR(255),
    block_type VARCHAR(50) CHECK (block_type IN (
        'holiday', 'sick_leave', 'training', 'conference', 'personal', 'maintenance'
    )),

    -- Recurring Blocks
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- weekly, monthly, yearly
    recurrence_end_date DATE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Practice Analytics and Performance
CREATE TABLE IF NOT EXISTS practice_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL REFERENCES medical_practices(id) ON DELETE CASCADE,

    -- Analytics Period
    analytics_date DATE NOT NULL,
    period_type VARCHAR(20) CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),

    -- Appointment Metrics
    total_appointments INTEGER DEFAULT 0,
    completed_appointments INTEGER DEFAULT 0,
    cancelled_appointments INTEGER DEFAULT 0,
    no_show_appointments INTEGER DEFAULT 0,

    -- Financial Metrics
    total_revenue DECIMAL(12,2) DEFAULT 0,
    platform_commission DECIMAL(12,2) DEFAULT 0,
    net_revenue DECIMAL(12,2) DEFAULT 0,
    average_appointment_value DECIMAL(10,2) DEFAULT 0,

    -- Patient Metrics
    new_patients INTEGER DEFAULT 0,
    returning_patients INTEGER DEFAULT 0,
    patient_satisfaction_avg DECIMAL(3,2),

    -- Diagnostic Metrics
    autism_diagnoses_confirmed INTEGER DEFAULT 0,
    autism_diagnoses_not_confirmed INTEGER DEFAULT 0,
    comorbid_conditions_identified INTEGER DEFAULT 0,

    -- Platform Integration Metrics
    ehc_plans_generated INTEGER DEFAULT 0,
    reports_generated INTEGER DEFAULT 0,
    ai_report_quality_score DECIMAL(3,2),

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_medical_practices_tenant_id ON medical_practices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medical_practices_type ON medical_practices(practice_type);

CREATE INDEX IF NOT EXISTS idx_medical_practitioners_practice_id ON medical_practitioners(practice_id);
CREATE INDEX IF NOT EXISTS idx_medical_practitioners_user_id ON medical_practitioners(user_id);

CREATE INDEX IF NOT EXISTS idx_medical_appointments_practice_id ON medical_appointments(practice_id);
CREATE INDEX IF NOT EXISTS idx_medical_appointments_child_id ON medical_appointments(child_id);
CREATE INDEX IF NOT EXISTS idx_medical_appointments_date ON medical_appointments(scheduled_date_time);
CREATE INDEX IF NOT EXISTS idx_medical_appointments_status ON medical_appointments(appointment_status);

CREATE INDEX IF NOT EXISTS idx_medical_reports_child_id ON medical_reports(child_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_practitioner_id ON medical_reports(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_date ON medical_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_practitioner_availability_practitioner_id ON practitioner_availability(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_availability_day ON practitioner_availability(day_of_week);

-- Functions for Medical Practice Management

-- Function to get available appointment slots
CREATE OR REPLACE FUNCTION get_available_slots(
    p_practitioner_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_appointment_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    slot_date DATE,
    slot_time TIME,
    duration_minutes INTEGER,
    appointment_type VARCHAR,
    rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH available_times AS (
        SELECT
            d.date_val as slot_date,
            generate_series(
                pa.start_time,
                pa.end_time - (pa.slot_duration_minutes || ' minutes')::INTERVAL,
                (pa.slot_duration_minutes + pa.break_between_slots_minutes || ' minutes')::INTERVAL
            )::TIME as slot_time,
            pa.slot_duration_minutes as duration_minutes,
            'standard' as appointment_type,
            pa.standard_rate as rate
        FROM generate_series(p_start_date, p_end_date, '1 day'::interval) d(date_val)
        CROSS JOIN practitioner_availability pa
        WHERE pa.practitioner_id = p_practitioner_id
        AND pa.is_active = true
        AND pa.day_of_week = EXTRACT(DOW FROM d.date_val)
        AND d.date_val >= pa.effective_from
        AND (pa.effective_until IS NULL OR d.date_val <= pa.effective_until)
        AND (p_appointment_type IS NULL OR p_appointment_type = ANY(pa.appointment_types_allowed))
    )
    SELECT
        at.slot_date,
        at.slot_time,
        at.duration_minutes,
        at.appointment_type,
        at.rate
    FROM available_times at
    WHERE NOT EXISTS (
        -- Check for existing appointments
        SELECT 1 FROM medical_appointments ma
        WHERE ma.practitioner_id = p_practitioner_id
        AND ma.scheduled_date_time::DATE = at.slot_date
        AND ma.scheduled_date_time::TIME = at.slot_time
        AND ma.appointment_status NOT IN ('cancelled', 'no_show')
    )
    AND NOT EXISTS (
        -- Check for blocked times
        SELECT 1 FROM practitioner_blocked_times pbt
        WHERE pbt.practitioner_id = p_practitioner_id
        AND pbt.block_date = at.slot_date
        AND (
            pbt.all_day = true OR
            (at.slot_time >= pbt.start_time AND at.slot_time < pbt.end_time)
        )
    )
    ORDER BY at.slot_date, at.slot_time;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate practice revenue
CREATE OR REPLACE FUNCTION calculate_practice_revenue(
    p_practice_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    total_revenue DECIMAL,
    platform_commission DECIMAL,
    net_revenue DECIMAL,
    appointment_count INTEGER
) AS $$
DECLARE
    commission_rate DECIMAL;
BEGIN
    -- Get commission rate for the practice
    SELECT platform_commission_rate INTO commission_rate
    FROM medical_practices
    WHERE id = p_practice_id;

    RETURN QUERY
    SELECT
        SUM(ma.appointment_fee) as total_revenue,
        SUM(ma.appointment_fee * commission_rate / 100) as platform_commission,
        SUM(ma.appointment_fee * (100 - commission_rate) / 100) as net_revenue,
        COUNT(*)::INTEGER as appointment_count
    FROM medical_appointments ma
    WHERE ma.practice_id = p_practice_id
    AND ma.scheduled_date_time::DATE BETWEEN p_start_date AND p_end_date
    AND ma.appointment_status = 'completed'
    AND ma.payment_status = 'paid';
END;
$$ LANGUAGE plpgsql;

-- Function to check autism diagnostic criteria
CREATE OR REPLACE FUNCTION check_autism_criteria(
    p_assessment_results JSONB
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    social_communication_score INTEGER;
    restricted_behaviors_score INTEGER;
    early_development_concerns BOOLEAN;
BEGIN
    -- Extract scores from assessment results
    social_communication_score := (p_assessment_results->>'social_communication_score')::INTEGER;
    restricted_behaviors_score := (p_assessment_results->>'restricted_behaviors_score')::INTEGER;
    early_development_concerns := (p_assessment_results->>'early_development_concerns')::BOOLEAN;

    -- Check DSM-5 criteria
    result := jsonb_build_object(
        'meets_criterion_a', social_communication_score >= 3,
        'meets_criterion_b', restricted_behaviors_score >= 2,
        'meets_criterion_c', early_development_concerns,
        'overall_criteria_met',
            social_communication_score >= 3 AND
            restricted_behaviors_score >= 2 AND
            early_development_concerns,
        'severity_level',
            CASE
                WHEN social_communication_score >= 6 AND restricted_behaviors_score >= 4 THEN 'requiring very substantial support'
                WHEN social_communication_score >= 4 AND restricted_behaviors_score >= 3 THEN 'requiring substantial support'
                ELSE 'requiring support'
            END
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;
