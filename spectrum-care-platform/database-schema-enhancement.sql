-- SpectrumCare Platform - Comprehensive Database Schema Enhancement
-- This file contains all the database schema changes for the enhanced platform

-- 1. ADULT SUPPORT EXTENSION
-- Add age_group and support_type to existing users table
ALTER TABLE users ADD COLUMN age_group VARCHAR(20) DEFAULT 'child';
ALTER TABLE users ADD COLUMN support_type VARCHAR(50);

-- Create adult_profiles table
CREATE TABLE adult_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date_of_birth DATE,
    employment_status VARCHAR(50), -- 'employed', 'unemployed', 'student', 'retired', 'supported_employment'
    living_situation VARCHAR(50), -- 'independent', 'supported', 'family', 'care_home', 'transitional'
    support_level VARCHAR(30), -- 'minimal', 'moderate', 'substantial', 'critical'
    autism_diagnosis_date DATE,
    diagnostic_report_url TEXT,
    current_support_providers TEXT[],
    transition_plan_id INTEGER,
    employment_goals JSONB,
    independent_living_skills JSONB,
    transport_needs JSONB,
    financial_support JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create adult_assessments table
CREATE TABLE adult_assessments (
    id SERIAL PRIMARY KEY,
    adult_profile_id INTEGER REFERENCES adult_profiles(id),
    assessment_type VARCHAR(50), -- 'employment_readiness', 'independent_living', 'social_skills', 'mental_health'
    assessment_date DATE,
    assessor_id INTEGER REFERENCES professionals(id),
    report_url TEXT,
    findings JSONB,
    recommendations JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    next_review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transition_plans table
CREATE TABLE transition_plans (
    id SERIAL PRIMARY KEY,
    child_id INTEGER REFERENCES children(id),
    adult_profile_id INTEGER REFERENCES adult_profiles(id),
    transition_coordinator_id INTEGER REFERENCES users(id),
    start_date DATE,
    target_completion_date DATE,
    current_stage VARCHAR(30), -- 'preparation', 'active', 'review', 'completed'
    goals JSONB,
    milestones JSONB,
    support_services JSONB,
    progress_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. EXISTING PLAN IMPORT SYSTEM
-- Create imported_plans table
CREATE TABLE imported_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plan_type VARCHAR(30), -- 'ehc', 'support_plan', 'care_plan', 'transition_plan'
    original_la VARCHAR(100),
    plan_date DATE,
    review_date DATE,
    imported_documents TEXT[], -- Array of document URLs/paths
    plan_content JSONB, -- Structured plan content
    import_status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed', 'manual_review'
    ai_analysis JSONB, -- AI analysis results
    quality_score INTEGER, -- 1-100 quality score
    gaps_identified TEXT[],
    recommendations TEXT[],
    migration_status VARCHAR(20), -- 'pending', 'in_progress', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create plan_sections table for structured content
CREATE TABLE plan_sections (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES ehc_plans(id),
    imported_plan_id INTEGER REFERENCES imported_plans(id),
    section_type VARCHAR(50), -- 'needs', 'outcomes', 'provision', 'placement', 'transport'
    section_content TEXT,
    quality_score INTEGER, -- 1-100 score for this section
    gaps_identified TEXT[],
    ai_suggestions TEXT[],
    improvement_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create plan_analysis_history table
CREATE TABLE plan_analysis_history (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER,
    analysis_type VARCHAR(30), -- 'import', 'review', 'update', 'migration'
    analysis_data JSONB,
    quality_improvements JSONB,
    analyst_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. REVIEW MANAGEMENT SYSTEM
-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES ehc_plans(id),
    imported_plan_id INTEGER REFERENCES imported_plans(id),
    review_type VARCHAR(30), -- 'annual', 'interim', 'emergency', 'transition'
    scheduled_date DATE,
    actual_date DATE,
    review_status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'
    participants JSONB, -- List of participants with roles
    agenda JSONB, -- Review agenda items
    outcomes JSONB, -- Review outcomes and decisions
    action_items JSONB, -- Action items with assignees and deadlines
    next_review_date DATE,
    review_preparation JSONB, -- Preparation checklist and status
    meeting_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create review_documents table
CREATE TABLE review_documents (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(id),
    document_type VARCHAR(50), -- 'preparation', 'outcome', 'evidence', 'report'
    document_title VARCHAR(200),
    document_url TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    document_status VARCHAR(20) DEFAULT 'active' -- 'active', 'superseded', 'archived'
);

-- Create review_notifications table
CREATE TABLE review_notifications (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(id),
    notification_type VARCHAR(30), -- 'reminder', 'overdue', 'completed', 'preparation_due'
    sent_to INTEGER REFERENCES users(id),
    notification_content TEXT,
    scheduled_date TIMESTAMP,
    sent_date TIMESTAMP,
    notification_method VARCHAR(20), -- 'email', 'sms', 'whatsapp', 'platform'
    status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'sent', 'delivered', 'failed'
);

-- 4. PROFESSIONAL WHITE LABELING & GUEST ACCESS
-- Add white labeling fields to professionals table
ALTER TABLE professionals ADD COLUMN white_label_enabled BOOLEAN DEFAULT false;
ALTER TABLE professionals ADD COLUMN brand_name VARCHAR(100);
ALTER TABLE professionals ADD COLUMN brand_logo_url TEXT;
ALTER TABLE professionals ADD COLUMN brand_colors JSONB; -- Primary, secondary, accent colors
ALTER TABLE professionals ADD COLUMN custom_domain VARCHAR(100);
ALTER TABLE professionals ADD COLUMN brand_settings JSONB; -- Fonts, layouts, etc.
ALTER TABLE professionals ADD COLUMN marketing_materials JSONB; -- Brochures, templates, etc.

-- Create guest_access table
CREATE TABLE guest_access (
    id SERIAL PRIMARY KEY,
    invited_by INTEGER REFERENCES users(id), -- LA user who invited
    professional_email VARCHAR(255),
    professional_name VARCHAR(100),
    organization VARCHAR(100),
    access_token VARCHAR(255) UNIQUE,
    case_id INTEGER REFERENCES children(id),
    adult_case_id INTEGER REFERENCES adult_profiles(id),
    permissions JSONB, -- What they can access and do
    access_purpose TEXT, -- Reason for access
    expires_at TIMESTAMP,
    used_at TIMESTAMP,
    last_activity TIMESTAMP,
    activity_log JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create assessment_toolkits table
CREATE TABLE assessment_toolkits (
    id SERIAL PRIMARY KEY,
    professional_type VARCHAR(50), -- 'educational_psychologist', 'speech_therapist', etc.
    toolkit_name VARCHAR(100),
    toolkit_description TEXT,
    age_group VARCHAR(20), -- 'child', 'adult', 'all'
    assessment_forms JSONB, -- Form definitions and questions
    scoring_rules JSONB, -- How to score and interpret
    report_templates JSONB, -- Report generation templates
    customization_options JSONB, -- What can be customized
    is_public BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES professionals(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. LA INTEGRATION & COST MANAGEMENT
-- Create la_caseloads table
CREATE TABLE la_caseloads (
    id SERIAL PRIMARY KEY,
    la_user_id INTEGER REFERENCES users(id),
    case_id INTEGER, -- Can reference children or adult_profiles
    case_type VARCHAR(20), -- 'child', 'adult'
    assigned_date DATE,
    case_priority VARCHAR(20), -- 'low', 'medium', 'high', 'urgent'
    workload_score INTEGER, -- Complexity scoring
    status VARCHAR(30), -- 'active', 'review', 'closed', 'transferred'
    budget_allocated DECIMAL(10,2),
    budget_spent DECIMAL(10,2),
    next_action_due DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create financial_tracking table
CREATE TABLE financial_tracking (
    id SERIAL PRIMARY KEY,
    case_id INTEGER,
    case_type VARCHAR(20), -- 'child', 'adult'
    cost_category VARCHAR(50), -- 'assessment', 'provision', 'transport', 'placement'
    cost_item VARCHAR(100),
    budgeted_amount DECIMAL(10,2),
    actual_amount DECIMAL(10,2),
    payment_date DATE,
    provider_id INTEGER REFERENCES professionals(id),
    funding_source VARCHAR(50), -- 'la_budget', 'health', 'education', 'social_care'
    approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected', 'paid'
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create approval_workflows table
CREATE TABLE approval_workflows (
    id SERIAL PRIMARY KEY,
    case_id INTEGER,
    case_type VARCHAR(20),
    workflow_type VARCHAR(30), -- 'ehc_assessment', 'provision_change', 'placement_change'
    current_stage VARCHAR(30),
    workflow_data JSONB, -- Stage definitions and progress
    initiated_by INTEGER REFERENCES users(id),
    current_approver INTEGER REFERENCES users(id),
    approval_deadline DATE,
    status VARCHAR(20), -- 'in_progress', 'approved', 'rejected', 'escalated'
    decision_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. CONTENT MANAGEMENT & RESOURCES
-- Create content_library table
CREATE TABLE content_library (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    content_type VARCHAR(30), -- 'article', 'video', 'pdf', 'template', 'guide'
    category VARCHAR(50), -- 'tribunal_support', 'ehc_guidance', 'assessment_help'
    target_audience VARCHAR(30), -- 'parents', 'adults', 'professionals', 'la_staff'
    content_url TEXT,
    content_text TEXT, -- For searchable text content
    tags TEXT[],
    difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    estimated_read_time INTEGER, -- In minutes
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tribunal_support table
CREATE TABLE tribunal_support (
    id SERIAL PRIMARY KEY,
    case_id INTEGER,
    case_type VARCHAR(20),
    tribunal_type VARCHAR(30), -- 'ehc_assessment', 'ehc_content', 'placement', 'transport'
    preparation_status VARCHAR(20), -- 'started', 'in_progress', 'ready', 'submitted'
    evidence_documents TEXT[],
    legal_arguments JSONB,
    timeline JSONB,
    case_preparation JSONB,
    tribunal_date DATE,
    outcome VARCHAR(30), -- 'pending', 'won', 'lost', 'settled'
    outcome_details TEXT,
    support_provided_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create personalization_preferences table
CREATE TABLE personalization_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content_preferences JSONB, -- Preferred topics, formats
    notification_preferences JSONB, -- How and when to notify
    dashboard_layout JSONB, -- Customized dashboard
    accessibility_settings JSONB, -- Font size, contrast, etc.
    language_preference VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Europe/London',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ANALYTICS & REPORTING TABLES
-- Create system_analytics table
CREATE TABLE system_analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(50),
    metric_value DECIMAL(15,2),
    metric_data JSONB,
    measurement_date DATE,
    measurement_period VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_activity_log table
CREATE TABLE user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(30),
    activity_description TEXT,
    resource_type VARCHAR(30), -- 'child', 'adult', 'document', 'assessment'
    resource_id INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. INDEXES FOR PERFORMANCE
-- Adult support indexes
CREATE INDEX idx_adult_profiles_user_id ON adult_profiles(user_id);
CREATE INDEX idx_adult_assessments_profile_id ON adult_assessments(adult_profile_id);
CREATE INDEX idx_transition_plans_child_id ON transition_plans(child_id);

-- Plan import indexes
CREATE INDEX idx_imported_plans_user_id ON imported_plans(user_id);
CREATE INDEX idx_plan_sections_plan_id ON plan_sections(plan_id);
CREATE INDEX idx_plan_sections_imported_plan_id ON plan_sections(imported_plan_id);

-- Review management indexes
CREATE INDEX idx_reviews_plan_id ON reviews(plan_id);
CREATE INDEX idx_reviews_scheduled_date ON reviews(scheduled_date);
CREATE INDEX idx_reviews_status ON reviews(review_status);
CREATE INDEX idx_review_notifications_review_id ON review_notifications(review_id);

-- LA integration indexes
CREATE INDEX idx_la_caseloads_user_id ON la_caseloads(la_user_id);
CREATE INDEX idx_financial_tracking_case_id ON financial_tracking(case_id);
CREATE INDEX idx_approval_workflows_case_id ON approval_workflows(case_id);

-- Content and analytics indexes
CREATE INDEX idx_content_library_category ON content_library(category);
CREATE INDEX idx_content_library_audience ON content_library(target_audience);
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_system_analytics_date ON system_analytics(measurement_date);

-- Full-text search indexes
CREATE INDEX idx_content_library_search ON content_library USING gin(to_tsvector('english', title || ' ' || content_text));
CREATE INDEX idx_plan_sections_search ON plan_sections USING gin(to_tsvector('english', section_content));

-- 9. TRIGGERS FOR AUTOMATIC UPDATES
-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_adult_profiles_updated_at BEFORE UPDATE ON adult_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transition_plans_updated_at BEFORE UPDATE ON transition_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_imported_plans_updated_at BEFORE UPDATE ON imported_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_toolkits_updated_at BEFORE UPDATE ON assessment_toolkits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_la_caseloads_updated_at BEFORE UPDATE ON la_caseloads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_library_updated_at BEFORE UPDATE ON content_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tribunal_support_updated_at BEFORE UPDATE ON tribunal_support FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personalization_preferences_updated_at BEFORE UPDATE ON personalization_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
