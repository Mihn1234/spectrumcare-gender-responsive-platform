-- Specialist Marketplace Database Schema
-- Commission-based platform for OT, EP, AIT, ABA, and other SEND specialists

-- Specialist Categories and Service Types
CREATE TABLE IF NOT EXISTS specialist_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    category_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    color_hex VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert specialist categories
INSERT INTO specialist_categories (category_name, category_code, description, icon_name, color_hex, sort_order) VALUES
('Occupational Therapy', 'OT', 'Sensory integration, fine motor skills, daily living skills', 'activity', '#3B82F6', 1),
('Educational Psychology', 'EP', 'Learning assessments, cognitive evaluation, educational planning', 'brain', '#8B5CF6', 2),
('Auditory Integration Training', 'AIT', 'Sound sensitivity therapy, auditory processing', 'volume-2', '#10B981', 3),
('Applied Behavior Analysis', 'ABA', 'Behavioral interventions, social skills training', 'users', '#F59E0B', 4),
('Speech & Language Therapy', 'SALT', 'Communication skills, language development', 'message-circle', '#EF4444', 5),
('Physiotherapy', 'PHYSIO', 'Physical development, motor skills, coordination', 'zap', '#06B6D4', 6),
('Art & Music Therapy', 'CREATIVE', 'Creative expression therapy, emotional regulation', 'palette', '#EC4899', 7),
('Nutritional Therapy', 'NUTRITION', 'Dietary interventions, supplement guidance', 'heart', '#84CC16', 8),
('Sensory Integration', 'SI', 'Sensory processing therapy, integration techniques', 'eye', '#F97316', 9),
('Social Skills Training', 'SOCIAL', 'Peer interaction, communication, relationship skills', 'smile', '#6366F1', 10);

-- Service Delivery Methods
CREATE TABLE IF NOT EXISTS service_delivery_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method_name VARCHAR(100) NOT NULL,
    method_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO service_delivery_methods (method_name, method_code, description) VALUES
('In-Person Individual', 'IN_PERSON_1TO1', 'One-on-one therapy sessions at clinic or home'),
('In-Person Group', 'IN_PERSON_GROUP', 'Small group sessions at clinic'),
('Online Individual', 'ONLINE_1TO1', 'Virtual one-on-one sessions via video call'),
('Online Group', 'ONLINE_GROUP', 'Virtual group sessions'),
('Home Visit', 'HOME_VISIT', 'Therapy delivered at family home'),
('School Visit', 'SCHOOL_VISIT', 'Support provided at school setting'),
('Intensive Program', 'INTENSIVE', 'Multi-day or camp-style programs'),
('Assessment Only', 'ASSESSMENT', 'Evaluation and report without ongoing therapy');

-- Specialist Professionals
CREATE TABLE IF NOT EXISTS specialists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),

    -- Professional Information
    title VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    professional_name VARCHAR(255),

    -- Registration and Qualifications
    professional_registration_number VARCHAR(100),
    regulatory_body VARCHAR(255), -- HCPC, BPS, etc.
    registration_expiry DATE,
    insurance_number VARCHAR(100),
    dbs_check_date DATE,

    -- Professional Details
    primary_category_id UUID NOT NULL REFERENCES specialist_categories(id),
    secondary_categories UUID[],
    qualifications TEXT[],
    years_experience INTEGER,
    specializations TEXT[],

    -- Practice Information
    practice_name VARCHAR(255),
    practice_type VARCHAR(100) CHECK (practice_type IN (
        'private_practice', 'clinic', 'freelance', 'agency', 'nhs', 'charity'
    )),

    -- Contact and Location
    email VARCHAR(255),
    phone VARCHAR(50),
    website_url VARCHAR(500),

    -- Address
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    county VARCHAR(100),
    postcode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United Kingdom',

    -- Service Area
    service_radius_miles INTEGER DEFAULT 25,
    travel_available BOOLEAN DEFAULT TRUE,
    online_sessions_available BOOLEAN DEFAULT TRUE,
    home_visits_available BOOLEAN DEFAULT TRUE,

    -- Availability
    working_days TEXT[], -- ['monday', 'tuesday', etc.]
    typical_hours JSONB, -- Start/end times per day
    max_clients_per_day INTEGER DEFAULT 6,
    advance_booking_days INTEGER DEFAULT 60,

    -- Platform Integration
    bio TEXT,
    profile_image_url VARCHAR(500),
    languages_spoken TEXT[],
    age_groups_served TEXT[], -- ['early_years', 'primary', 'secondary', 'adult']

    -- Pricing and Commission
    hourly_rate DECIMAL(8,2),
    assessment_rate DECIMAL(8,2),
    group_session_rate DECIMAL(8,2),
    home_visit_supplement DECIMAL(8,2) DEFAULT 0,
    platform_commission_rate DECIMAL(5,2) DEFAULT 15.00,

    -- Performance and Quality
    overall_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_sessions_completed INTEGER DEFAULT 0,
    response_time_hours DECIMAL(5,2) DEFAULT 24,
    cancellation_rate DECIMAL(5,2) DEFAULT 0,

    -- Platform Status
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN (
        'pending', 'verified', 'suspended', 'rejected'
    )),
    verification_date DATE,
    verified_by UUID REFERENCES users(id),

    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    is_accepting_clients BOOLEAN DEFAULT TRUE,
    joined_platform_date DATE DEFAULT CURRENT_DATE,
    last_active_date DATE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Specialist Services Offered
CREATE TABLE IF NOT EXISTS specialist_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES specialist_categories(id),

    -- Service Details
    service_name VARCHAR(255) NOT NULL,
    service_description TEXT,
    service_type VARCHAR(100), -- therapy, assessment, consultation, training

    -- Target Demographics
    age_group_min INTEGER,
    age_group_max INTEGER,
    suitable_conditions TEXT[], -- autism, adhd, learning_difficulties, etc.
    severity_levels TEXT[], -- mild, moderate, severe

    -- Delivery Options
    delivery_methods UUID[], -- References to service_delivery_methods
    session_duration_minutes INTEGER[],
    min_sessions INTEGER,
    max_sessions INTEGER,

    -- Pricing
    base_price DECIMAL(8,2),
    assessment_price DECIMAL(8,2),
    package_discount_percent DECIMAL(5,2) DEFAULT 0,

    -- Service Requirements
    parent_involvement_required BOOLEAN DEFAULT FALSE,
    school_liaison_included BOOLEAN DEFAULT FALSE,
    report_included BOOLEAN DEFAULT TRUE,

    -- Outcomes and Goals
    typical_outcomes TEXT[],
    success_metrics TEXT[],
    evidence_base TEXT,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Service Bookings and Appointments
CREATE TABLE IF NOT EXISTS service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES specialists(id),
    service_id UUID NOT NULL REFERENCES specialist_services(id),
    child_id UUID NOT NULL REFERENCES children(id),
    parent_id UUID NOT NULL REFERENCES users(id),

    -- Booking Details
    booking_reference VARCHAR(50) UNIQUE,
    booking_type VARCHAR(50) CHECK (booking_type IN (
        'single_session', 'package', 'assessment', 'consultation', 'intensive'
    )),

    -- Service Configuration
    delivery_method_id UUID REFERENCES service_delivery_methods(id),
    session_duration_minutes INTEGER,
    total_sessions INTEGER,
    sessions_completed INTEGER DEFAULT 0,

    -- Scheduling
    first_session_date TIMESTAMP,
    last_session_date TIMESTAMP,
    session_frequency VARCHAR(50), -- weekly, fortnightly, monthly
    preferred_time_slots JSONB,

    -- Location
    service_location VARCHAR(255),
    address_details JSONB,

    -- Financial
    total_cost DECIMAL(10,2),
    session_cost DECIMAL(8,2),
    platform_commission DECIMAL(10,2),
    specialist_earnings DECIMAL(10,2),

    -- Payment
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'partial', 'paid', 'refunded', 'disputed'
    )),
    payment_method VARCHAR(50),
    payment_schedule VARCHAR(50), -- upfront, per_session, monthly

    -- Booking Status
    booking_status VARCHAR(50) DEFAULT 'pending' CHECK (booking_status IN (
        'pending', 'confirmed', 'active', 'completed', 'cancelled', 'suspended'
    )),

    -- Special Requirements
    child_needs_summary TEXT,
    special_requirements TEXT,
    accessibility_needs TEXT,
    emergency_contact_details JSONB,

    -- Communication
    initial_consultation_completed BOOLEAN DEFAULT FALSE,
    goals_agreed BOOLEAN DEFAULT FALSE,
    progress_sharing_consent BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Individual Session Records
CREATE TABLE IF NOT EXISTS therapy_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES specialists(id),
    child_id UUID NOT NULL REFERENCES children(id),

    -- Session Details
    session_number INTEGER NOT NULL,
    scheduled_date_time TIMESTAMP NOT NULL,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    duration_minutes INTEGER,

    -- Session Type and Content
    session_type VARCHAR(100), -- therapy, assessment, review, consultation
    session_focus TEXT[],
    activities_planned TEXT[],
    activities_completed TEXT[],

    -- Attendance and Participation
    child_attendance VARCHAR(50) CHECK (child_attendance IN (
        'present', 'absent', 'late', 'early_departure'
    )),
    parent_attendance BOOLEAN DEFAULT FALSE,
    engagement_level VARCHAR(50), -- excellent, good, moderate, poor

    -- Session Notes and Observations
    session_notes TEXT,
    child_mood_behavior TEXT,
    progress_observations TEXT,
    challenges_encountered TEXT,
    breakthrough_moments TEXT,

    -- Goals and Targets
    goals_worked_on TEXT[],
    goals_achieved TEXT[],
    new_goals_identified TEXT[],

    -- Homework and Follow-up
    homework_assigned TEXT,
    parent_feedback TEXT,
    specialist_recommendations TEXT,
    next_session_focus TEXT,

    -- Assessments and Measurements
    skill_assessments JSONB,
    progress_measurements JSONB,
    behavioral_observations JSONB,

    -- Session Status
    session_status VARCHAR(50) DEFAULT 'scheduled' CHECK (session_status IN (
        'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
    )),
    cancellation_reason TEXT,
    rescheduled_from_session_id UUID REFERENCES therapy_sessions(id),

    -- Financial
    session_fee DECIMAL(8,2),
    fee_status VARCHAR(50) DEFAULT 'pending',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Progress Tracking and Outcomes
CREATE TABLE IF NOT EXISTS therapy_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES service_bookings(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id),
    specialist_id UUID NOT NULL REFERENCES specialists(id),

    -- Progress Period
    assessment_date DATE NOT NULL,
    assessment_type VARCHAR(100), -- baseline, interim, final, milestone

    -- Goal Progress
    goal_id VARCHAR(100),
    goal_description TEXT,
    baseline_score DECIMAL(5,2),
    current_score DECIMAL(5,2),
    target_score DECIMAL(5,2),
    progress_percentage DECIMAL(5,2),

    -- Skill Areas
    skill_area VARCHAR(100),
    skill_specific TEXT,
    measurement_method VARCHAR(100),
    measurement_tool VARCHAR(100),

    -- Qualitative Assessment
    strengths_observed TEXT,
    areas_for_development TEXT,
    intervention_effectiveness TEXT,
    parent_observations TEXT,

    -- Recommendations
    continue_current_approach BOOLEAN DEFAULT TRUE,
    modify_intervention TEXT,
    additional_support_needed TEXT,
    discharge_considerations TEXT,

    -- Data and Evidence
    assessment_data JSONB,
    supporting_evidence TEXT[],
    video_examples VARCHAR(500)[],

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS specialist_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES service_bookings(id),
    parent_id UUID NOT NULL REFERENCES users(id),
    child_id UUID NOT NULL REFERENCES children(id),

    -- Rating Categories
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    expertise_rating INTEGER CHECK (expertise_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    rapport_rating INTEGER CHECK (rapport_rating BETWEEN 1 AND 5),
    progress_rating INTEGER CHECK (progress_rating BETWEEN 1 AND 5),

    -- Written Review
    review_title VARCHAR(255),
    review_text TEXT,

    -- Specific Feedback
    what_worked_well TEXT,
    areas_for_improvement TEXT,
    would_recommend BOOLEAN,
    would_book_again BOOLEAN,

    -- Review Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    moderated_by UUID REFERENCES users(id),
    moderation_notes TEXT,

    -- Specialist Response
    specialist_response TEXT,
    specialist_response_date TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Specialist Availability
CREATE TABLE IF NOT EXISTS specialist_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,

    -- Availability Pattern
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Service Options
    delivery_methods UUID[], -- Available delivery methods for this slot
    max_bookings_per_slot INTEGER DEFAULT 1,

    -- Pricing for Time Slot
    slot_rate DECIMAL(8,2),
    is_premium_time BOOLEAN DEFAULT FALSE,

    -- Recurring Pattern
    effective_from DATE NOT NULL,
    effective_until DATE,
    is_recurring BOOLEAN DEFAULT TRUE,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Blocked Availability
CREATE TABLE IF NOT EXISTS specialist_blocked_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,

    -- Block Details
    block_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    all_day BOOLEAN DEFAULT FALSE,

    -- Block Information
    reason VARCHAR(255),
    block_type VARCHAR(50) CHECK (block_type IN (
        'holiday', 'sick_leave', 'training', 'conference', 'personal', 'fully_booked'
    )),
    is_recurring BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Platform Financial Transactions
CREATE TABLE IF NOT EXISTS marketplace_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES service_bookings(id),
    specialist_id UUID NOT NULL REFERENCES specialists(id),
    parent_id UUID NOT NULL REFERENCES users(id),

    -- Transaction Details
    transaction_type VARCHAR(50) CHECK (transaction_type IN (
        'session_payment', 'package_payment', 'assessment_payment', 'refund', 'commission'
    )),
    transaction_reference VARCHAR(100) UNIQUE,

    -- Amounts
    gross_amount DECIMAL(10,2),
    platform_commission DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    commission_rate DECIMAL(5,2),

    -- Payment Processing
    payment_processor VARCHAR(50), -- stripe, paypal, etc.
    processor_transaction_id VARCHAR(255),
    payment_method VARCHAR(50),

    -- Status and Timing
    transaction_status VARCHAR(50) DEFAULT 'pending' CHECK (transaction_status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'
    )),
    processed_at TIMESTAMP,
    settled_at TIMESTAMP,

    -- Payout to Specialist
    specialist_payout_amount DECIMAL(10,2),
    payout_status VARCHAR(50) DEFAULT 'pending' CHECK (payout_status IN (
        'pending', 'processing', 'paid', 'failed', 'held'
    )),
    payout_date DATE,
    payout_reference VARCHAR(100),

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Platform Analytics
CREATE TABLE IF NOT EXISTS marketplace_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analytics_date DATE NOT NULL,
    specialist_id UUID REFERENCES specialists(id),
    category_id UUID REFERENCES specialist_categories(id),

    -- Booking Metrics
    total_bookings INTEGER DEFAULT 0,
    new_bookings INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    cancelled_sessions INTEGER DEFAULT 0,

    -- Financial Metrics
    total_revenue DECIMAL(12,2) DEFAULT 0,
    platform_commission_earned DECIMAL(12,2) DEFAULT 0,
    specialist_earnings DECIMAL(12,2) DEFAULT 0,
    average_session_value DECIMAL(8,2) DEFAULT 0,

    -- Quality Metrics
    average_rating DECIMAL(3,2),
    new_reviews INTEGER DEFAULT 0,
    response_time_avg_hours DECIMAL(5,2),
    completion_rate DECIMAL(5,2),

    -- Client Metrics
    new_clients INTEGER DEFAULT 0,
    returning_clients INTEGER DEFAULT 0,
    client_retention_rate DECIMAL(5,2),

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_specialists_category ON specialists(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_specialists_location ON specialists(postcode, city);
CREATE INDEX IF NOT EXISTS idx_specialists_rating ON specialists(overall_rating);
CREATE INDEX IF NOT EXISTS idx_specialists_active ON specialists(is_active, is_accepting_clients);

CREATE INDEX IF NOT EXISTS idx_service_bookings_specialist ON service_bookings(specialist_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_parent ON service_bookings(parent_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON service_bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_service_bookings_dates ON service_bookings(first_session_date, last_session_date);

CREATE INDEX IF NOT EXISTS idx_therapy_sessions_booking ON therapy_sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_date ON therapy_sessions(scheduled_date_time);
CREATE INDEX IF NOT EXISTS idx_therapy_sessions_specialist ON therapy_sessions(specialist_id);

CREATE INDEX IF NOT EXISTS idx_specialist_reviews_specialist ON specialist_reviews(specialist_id);
CREATE INDEX IF NOT EXISTS idx_specialist_reviews_rating ON specialist_reviews(overall_rating);

-- Functions for Marketplace Operations

-- Function to search specialists by criteria
CREATE OR REPLACE FUNCTION search_specialists(
    p_category_id UUID DEFAULT NULL,
    p_postcode VARCHAR DEFAULT NULL,
    p_radius_miles INTEGER DEFAULT 25,
    p_delivery_method VARCHAR DEFAULT NULL,
    p_age_group VARCHAR DEFAULT NULL,
    p_min_rating DECIMAL DEFAULT 0,
    p_max_rate DECIMAL DEFAULT 999999,
    p_available_date DATE DEFAULT NULL
)
RETURNS TABLE (
    specialist_id UUID,
    specialist_name TEXT,
    category_name VARCHAR,
    distance_miles DECIMAL,
    hourly_rate DECIMAL,
    overall_rating DECIMAL,
    review_count INTEGER,
    next_available DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id as specialist_id,
        CONCAT(s.title, ' ', s.first_name, ' ', s.last_name) as specialist_name,
        sc.category_name,
        0::DECIMAL as distance_miles, -- Simplified - would use actual distance calculation
        s.hourly_rate,
        s.overall_rating,
        s.review_count,
        CURRENT_DATE + INTERVAL '7 days' as next_available -- Simplified
    FROM specialists s
    JOIN specialist_categories sc ON s.primary_category_id = sc.id
    WHERE s.is_active = true
    AND s.is_accepting_clients = true
    AND s.verification_status = 'verified'
    AND (p_category_id IS NULL OR s.primary_category_id = p_category_id)
    AND (p_min_rating IS NULL OR s.overall_rating >= p_min_rating)
    AND (p_max_rate IS NULL OR s.hourly_rate <= p_max_rate)
    ORDER BY s.overall_rating DESC, s.review_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate platform revenue
CREATE OR REPLACE FUNCTION calculate_platform_revenue(
    p_start_date DATE,
    p_end_date DATE,
    p_specialist_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_bookings INTEGER,
    total_revenue DECIMAL,
    platform_commission DECIMAL,
    specialist_earnings DECIMAL,
    average_commission_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_bookings,
        SUM(mt.gross_amount) as total_revenue,
        SUM(mt.platform_commission) as platform_commission,
        SUM(mt.net_amount) as specialist_earnings,
        AVG(mt.commission_rate) as average_commission_rate
    FROM marketplace_transactions mt
    WHERE mt.created_at::DATE BETWEEN p_start_date AND p_end_date
    AND mt.transaction_status = 'completed'
    AND (p_specialist_id IS NULL OR mt.specialist_id = p_specialist_id);
END;
$$ LANGUAGE plpgsql;

-- Function to update specialist ratings
CREATE OR REPLACE FUNCTION update_specialist_rating(p_specialist_id UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL;
    review_count INTEGER;
BEGIN
    SELECT
        AVG(overall_rating),
        COUNT(*)
    INTO avg_rating, review_count
    FROM specialist_reviews
    WHERE specialist_id = p_specialist_id
    AND is_published = true;

    UPDATE specialists
    SET
        overall_rating = COALESCE(avg_rating, 0),
        review_count = review_count,
        updated_at = NOW()
    WHERE id = p_specialist_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update specialist rating when review is added
CREATE OR REPLACE FUNCTION trigger_update_specialist_rating()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_specialist_rating(NEW.specialist_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_specialist_rating
    AFTER INSERT OR UPDATE ON specialist_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_specialist_rating();
