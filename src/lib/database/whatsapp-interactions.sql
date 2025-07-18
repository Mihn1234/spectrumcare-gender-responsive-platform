-- WhatsApp Voice Command Interactions
CREATE TABLE IF NOT EXISTS whatsapp_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    phone_number VARCHAR(20) NOT NULL,

    -- Message Details
    message_type VARCHAR(20) CHECK (message_type IN ('voice', 'text', 'image', 'interactive')),
    message_content TEXT,
    transcription TEXT,

    -- AI Processing
    detected_intent VARCHAR(100),
    intent_confidence DECIMAL(3,2),
    processing_time_ms INTEGER,

    -- Response Details
    response_type VARCHAR(20) CHECK (response_type IN ('text', 'audio', 'interactive')),
    response_content TEXT,
    audio_response_url VARCHAR(500),

    -- Interaction Metadata
    session_id VARCHAR(100),
    conversation_turn INTEGER DEFAULT 1,
    was_successful BOOLEAN DEFAULT TRUE,
    error_message TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_interactions_user_id ON whatsapp_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_interactions_phone ON whatsapp_interactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_interactions_date ON whatsapp_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_interactions_intent ON whatsapp_interactions(detected_intent);
