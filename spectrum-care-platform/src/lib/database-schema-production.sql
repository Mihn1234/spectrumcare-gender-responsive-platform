-- SpectrumCare Enterprise LA System - Production Database Schema
-- Comprehensive multi-tenant SEND management system
-- PostgreSQL 15+ with advanced features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- CORE TENANT MANAGEMENT
-- ============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('LOCAL_AUTHORITY', 'HEALTHCARE', 'EDUCATION', 'ENTERPRISE')),
    domain VARCHAR(255) UNIQUE,
    subdomain VARCHAR(100) UNIQUE,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'PROFESSIONAL' CHECK (subscription_tier IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
    max_cases INTEGER DEFAULT 1000,
    max_users INTEGER DEFAULT 50,
    features_enabled JSONB DEFAULT '[]',
    billing_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    contact_info JSONB DEFAULT '{}',
    compliance_data JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    api_keys JSONB DEFAULT '{}',
    integration_settings JSONB DEFAULT '{}'
);

-- Create indexes for tenants
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_type ON tenants(type);
CREATE INDEX idx_tenants_active ON tenants(is_active);

-- ============================================================================
-- USER MANAGEMENT & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('PARENT', 'PROFESSIONAL', 'LA_OFFICER', 'LA_CASEWORKER', 'LA_MANAGER', 'LA_EXECUTIVE', 'ADMIN', 'ENTERPRISE_ADMIN')),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    profile_data JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '[]',
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}'
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- CHILDREN & FAMILIES
-- ============================================================================

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    nhs_number VARCHAR(20) UNIQUE,
    upn VARCHAR(20), -- Unique Pupil Number
    address JSONB DEFAULT '{}',
    emergency_contacts JSONB DEFAULT '[]',
    medical_information JSONB DEFAULT '{}',
    educational_information JSONB DEFAULT '{}',
    social_care_information JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    data_sharing_consent JSONB DEFAULT '{}',
    safeguarding_alerts JSONB DEFAULT '[]',
    additional_needs JSONB DEFAULT '[]'
);

-- Create indexes for children
CREATE INDEX idx_children_tenant ON children(tenant_id);
CREATE INDEX idx_children_nhs_number ON children(nhs_number);
CREATE INDEX idx_children_upn ON children(upn);
CREATE INDEX idx_children_dob ON children(date_of_birth);
CREATE INDEX idx_children_name ON children(first_name, last_name);

-- Parent-child relationships
CREATE TABLE family_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    parent_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('MOTHER', 'FATHER', 'GUARDIAN', 'CARER', 'OTHER')),
    is_primary_contact BOOLEAN DEFAULT false,
    has_parental_responsibility BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, parent_user_id)
);

-- ============================================================================
-- EHC CASE MANAGEMENT
-- ============================================================================

CREATE TABLE ehc_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSESSMENT', 'DRAFT', 'FINAL', 'REVIEW', 'APPEAL', 'CLOSED')),
    case_type VARCHAR(50) NOT NULL DEFAULT 'INITIAL' CHECK (case_type IN ('INITIAL', 'REVIEW', 'AMENDMENT', 'TRANSFER', 'APPEAL')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    assigned_officer_id UUID REFERENCES users(id),
    assigned_caseworker_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    statutory_deadline DATE,
    actual_completion_date DATE,
    request_received_date DATE,
    assessment_start_date DATE,
    draft_plan_date DATE,
    final_plan_date DATE,
    case_data JSONB DEFAULT '{}',
    workflow_state JSONB DEFAULT '{}',
    notes TEXT,
    tags VARCHAR(255)[],
    estimated_budget DECIMAL(12,2),
    actual_cost DECIMAL(12,2) DEFAULT 0,
    cost_center VARCHAR(100),
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    parent_satisfaction_score INTEGER CHECK (parent_satisfaction_score >= 0 AND parent_satisfaction_score <= 100)
);

-- Create indexes for EHC cases
CREATE INDEX idx_ehc_cases_tenant ON ehc_cases(tenant_id);
CREATE INDEX idx_ehc_cases_child ON ehc_cases(child_id);
CREATE INDEX idx_ehc_cases_number ON ehc_cases(case_number);
CREATE INDEX idx_ehc_cases_status ON ehc_cases(status);
CREATE INDEX idx_ehc_cases_priority ON ehc_cases(priority);
CREATE INDEX idx_ehc_cases_officer ON ehc_cases(assigned_officer_id);
CREATE INDEX idx_ehc_cases_deadline ON ehc_cases(statutory_deadline);
CREATE INDEX idx_ehc_cases_created ON ehc_cases(created_at);

-- Case workflow tracking
CREATE TABLE case_workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES ehc_cases(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'SKIPPED')),
    assigned_to_id UUID REFERENCES users(id),
    estimated_duration_days INTEGER,
    actual_duration_days INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    step_data JSONB DEFAULT '{}',
    dependencies JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- FINANCIAL MANAGEMENT
-- ============================================================================

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    vendor_type VARCHAR(50) NOT NULL,
    contact_information JSONB DEFAULT '{}',
    payment_terms JSONB DEFAULT '{}',
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES ehc_cases(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('EDUCATION', 'HEALTH', 'TRANSPORT', 'LEGAL', 'ADMIN', 'PROFESSIONAL_SERVICE', 'PLACEMENT', 'EQUIPMENT')),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    vendor_id UUID REFERENCES vendors(id),
    description TEXT,
    transaction_date DATE NOT NULL,
    approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    approved_by_id UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    budget_category VARCHAR(100),
    cost_center VARCHAR(50),
    invoice_number VARCHAR(100),
    purchase_order_number VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fiscal_year INTEGER,
    quarter INTEGER,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20),
    vat_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(12,2)
);

-- Create indexes for financial transactions
CREATE INDEX idx_financial_tenant ON financial_transactions(tenant_id);
CREATE INDEX idx_financial_case ON financial_transactions(case_id);
CREATE INDEX idx_financial_type ON financial_transactions(transaction_type);
CREATE INDEX idx_financial_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_status ON financial_transactions(approval_status);

-- Budget management
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    budget_type VARCHAR(50) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    allocated_amount DECIMAL(15,2) DEFAULT 0,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    fiscal_year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cost_centers JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROFESSIONAL SERVICES
-- ============================================================================

CREATE TABLE professional_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES ehc_cases(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    service_category VARCHAR(50) NOT NULL,
    hourly_rate DECIMAL(8,2),
    hours_worked DECIMAL(6,2),
    total_cost DECIMAL(10,2),
    service_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    outcome TEXT,
    recommendations TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location JSONB DEFAULT '{}',
    attendees JSONB DEFAULT '[]',
    service_data JSONB DEFAULT '{}'
);

-- Professional profiles
CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registration_number VARCHAR(100),
    professional_body VARCHAR(100),
    qualifications JSONB DEFAULT '[]',
    specializations JSONB DEFAULT '[]',
    experience_years INTEGER,
    hourly_rate DECIMAL(8,2),
    availability JSONB DEFAULT '{}',
    service_areas JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DOCUMENT MANAGEMENT
-- ============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES ehc_cases(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    uploaded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    document_type VARCHAR(100),
    document_category VARCHAR(50),
    version INTEGER DEFAULT 1,
    is_confidential BOOLEAN DEFAULT false,
    access_permissions JSONB DEFAULT '{}',
    ai_extracted_data JSONB DEFAULT '{}',
    ocr_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    checksum VARCHAR(64),
    encryption_key_id VARCHAR(100),
    tags VARCHAR(255)[],
    metadata JSONB DEFAULT '{}',
    virus_scan_status VARCHAR(20) DEFAULT 'PENDING',
    virus_scan_result VARCHAR(20)
);

-- Create indexes for documents
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by_id);
CREATE INDEX idx_documents_created ON documents(created_at);

-- Document versions
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    checksum VARCHAR(64),
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    change_description TEXT
);

-- ============================================================================
-- COMMUNICATION SYSTEM
-- ============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES ehc_cases(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('EMAIL', 'SMS', 'IN_APP', 'SYSTEM', 'REMINDER', 'ALERT')),
    subject VARCHAR(500),
    content TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    template_id UUID,
    attachments JSONB DEFAULT '[]'
);

-- Message recipients
CREATE TABLE message_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_type VARCHAR(20) DEFAULT 'TO' CHECK (recipient_type IN ('TO', 'CC', 'BCC')),
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'PENDING'
);

-- ============================================================================
-- AUDIT & COMPLIANCE
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255),
    request_id VARCHAR(255),
    additional_data JSONB DEFAULT '{}'
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Data retention policies
CREATE TABLE data_retention_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    data_type VARCHAR(100) NOT NULL,
    retention_period_days INTEGER NOT NULL,
    archive_after_days INTEGER,
    delete_after_days INTEGER,
    policy_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE & ANALYTICS
-- ============================================================================

-- Materialized views for performance
CREATE MATERIALIZED VIEW case_summary_mv AS
SELECT
    tenant_id,
    status,
    priority,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as case_count,
    AVG(actual_cost) as avg_cost,
    SUM(actual_cost) as total_cost,
    AVG(EXTRACT(DAYS FROM (actual_completion_date - request_received_date))) as avg_processing_days,
    COUNT(*) FILTER (WHERE actual_completion_date <= statutory_deadline) as on_time_count,
    COUNT(*) FILTER (WHERE quality_score >= 80) as quality_count
FROM ehc_cases
WHERE status != 'PENDING'
GROUP BY tenant_id, status, priority, DATE_TRUNC('month', created_at);

-- Financial summary view
CREATE MATERIALIZED VIEW financial_summary_mv AS
SELECT
    tenant_id,
    transaction_type,
    DATE_TRUNC('month', transaction_date) as month,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    SUM(amount) FILTER (WHERE approval_status = 'APPROVED') as approved_amount
FROM financial_transactions
GROUP BY tenant_id, transaction_type, DATE_TRUNC('month', transaction_date);

-- Create indexes on materialized views
CREATE INDEX idx_case_summary_tenant ON case_summary_mv(tenant_id);
CREATE INDEX idx_case_summary_month ON case_summary_mv(month);
CREATE INDEX idx_financial_summary_tenant ON financial_summary_mv(tenant_id);
CREATE INDEX idx_financial_summary_month ON financial_summary_mv(month);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ehc_cases_updated_at BEFORE UPDATE ON ehc_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number(tenant_abbr VARCHAR(10))
RETURNS VARCHAR(50) AS $$
DECLARE
    year_part VARCHAR(4);
    sequence_part VARCHAR(6);
    case_number VARCHAR(50);
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;

    SELECT LPAD((COUNT(*) + 1)::VARCHAR, 4, '0')
    INTO sequence_part
    FROM ehc_cases
    WHERE case_number LIKE 'EHC-' || year_part || '-%';

    case_number := 'EHC-' || year_part || '-' || sequence_part;

    RETURN case_number;
END;
$$ LANGUAGE plpgsql;

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (tenant_id, action, resource_type, resource_id, new_values)
        VALUES (NEW.tenant_id, 'CREATE', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (tenant_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (NEW.tenant_id, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (tenant_id, action, resource_type, resource_id, old_values)
        VALUES (OLD.tenant_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_ehc_cases AFTER INSERT OR UPDATE OR DELETE ON ehc_cases FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_financial_transactions AFTER INSERT OR UPDATE OR DELETE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- SAMPLE DATA & CONFIGURATION
-- ============================================================================

-- Insert default tenant (for development)
INSERT INTO tenants (name, type, domain, subdomain, subscription_tier, max_cases, max_users)
VALUES
    ('Hertfordshire County Council', 'LOCAL_AUTHORITY', 'hertfordshire.gov.uk', 'herts', 'ENTERPRISE', 10000, 500),
    ('Surrey County Council', 'LOCAL_AUTHORITY', 'surrey.gov.uk', 'surrey', 'ENTERPRISE', 8000, 400),
    ('Kent County Council', 'LOCAL_AUTHORITY', 'kent.gov.uk', 'kent', 'ENTERPRISE', 12000, 600);

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Additional performance indexes
CREATE INDEX CONCURRENTLY idx_ehc_cases_composite ON ehc_cases(tenant_id, status, priority, created_at);
CREATE INDEX CONCURRENTLY idx_financial_composite ON financial_transactions(tenant_id, case_id, transaction_date DESC);
CREATE INDEX CONCURRENTLY idx_documents_composite ON documents(tenant_id, case_id, document_type, created_at);

-- Partial indexes for active data
CREATE INDEX CONCURRENTLY idx_active_cases ON ehc_cases(tenant_id, assigned_officer_id) WHERE status IN ('PENDING', 'ASSESSMENT', 'DRAFT');
CREATE INDEX CONCURRENTLY idx_pending_approvals ON financial_transactions(tenant_id, approval_status) WHERE approval_status = 'PENDING';

-- ============================================================================
-- SECURITY POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE ehc_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for ehc_cases)
CREATE POLICY ehc_cases_tenant_isolation ON ehc_cases
    FOR ALL
    TO authenticated_users
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS SCHEDULE
-- ============================================================================

-- Schedule materialized view refreshes (requires pg_cron extension)
-- SELECT cron.schedule('refresh-case-summary', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW case_summary_mv;');
-- SELECT cron.schedule('refresh-financial-summary', '*/30 * * * *', 'REFRESH MATERIALIZED VIEW financial_summary_mv;');

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tenants IS 'Multi-tenant configuration for local authorities and organizations';
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE children IS 'Child profiles with SEND needs';
COMMENT ON TABLE ehc_cases IS 'EHC assessment and plan management';
COMMENT ON TABLE financial_transactions IS 'Financial tracking for SEND services';
COMMENT ON TABLE professional_services IS 'Professional service delivery tracking';
COMMENT ON TABLE documents IS 'Document management with AI processing';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for compliance';

-- Vacuum and analyze for optimal performance
VACUUM ANALYZE;
