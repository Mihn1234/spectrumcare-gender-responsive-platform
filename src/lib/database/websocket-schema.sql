-- Real-time WebSocket System Database Schema

-- User presence tracking
CREATE TABLE IF NOT EXISTS user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
    current_page VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('case_update', 'appointment', 'message', 'assessment', 'system', 'payment_reminder', 'document_uploaded', 'deadline_approaching')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    related_id UUID, -- Can reference cases, appointments, assessments, etc.
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Conversations for messaging
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    conversation_type VARCHAR(50) NOT NULL DEFAULT 'direct' CHECK (conversation_type IN ('direct', 'group', 'case', 'appointment')),
    related_id UUID, -- Can reference cases, appointments, etc.
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'participant' CHECK (role IN ('admin', 'moderator', 'participant')),
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    left_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_read_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system', 'status_update')),
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Activity feeds
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT NOT NULL,
    target_type VARCHAR(50), -- 'case', 'appointment', 'assessment', 'user', etc.
    target_id UUID,
    target_name VARCHAR(255),
    context JSONB, -- Additional context data
    visibility VARCHAR(50) NOT NULL DEFAULT 'tenant' CHECK (visibility IN ('public', 'tenant', 'case', 'private')),
    related_users UUID[], -- Array of user IDs who should see this activity
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Real-time event log
CREATE TABLE IF NOT EXISTS realtime_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    target_users UUID[],
    target_rooms VARCHAR(255)[],
    broadcast_count INTEGER DEFAULT 0,
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Typing indicators (temporary storage)
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '30 seconds'),
    UNIQUE(conversation_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_related_id ON conversations(related_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

CREATE INDEX IF NOT EXISTS idx_activity_feed_tenant_id ON activity_feed(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_target_type ON activity_feed(target_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_target_id ON activity_feed(target_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor_id ON activity_feed(actor_id);

CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen);

CREATE INDEX IF NOT EXISTS idx_realtime_events_created_at ON realtime_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_realtime_events_event_type ON realtime_events(event_type);

-- Cleanup function for old data
CREATE OR REPLACE FUNCTION cleanup_realtime_data()
RETURNS void AS $$
BEGIN
    -- Clean up old typing indicators (older than 1 minute)
    DELETE FROM typing_indicators WHERE expires_at < NOW();

    -- Clean up old realtime events (older than 7 days)
    DELETE FROM realtime_events WHERE created_at < NOW() - INTERVAL '7 days';

    -- Clean up old activity feed entries (older than 90 days for most activities)
    DELETE FROM activity_feed
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND activity_type NOT IN ('case_created', 'case_completed', 'assessment_completed');

    -- Clean up read notifications (older than 30 days)
    DELETE FROM notifications
    WHERE is_read = TRUE
    AND read_at < NOW() - INTERVAL '30 days';

    -- Clean up expired notifications
    DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update conversation updated_at
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

-- Create trigger to automatically create activity feed entries
CREATE OR REPLACE FUNCTION create_activity_feed_entry()
RETURNS TRIGGER AS $$
DECLARE
    user_data RECORD;
BEGIN
    -- Get user information
    SELECT u.profile_data->>'firstName' as first_name,
           u.profile_data->>'lastName' as last_name,
           u.email, u.role, u.tenant_id
    INTO user_data
    FROM users u
    WHERE u.id = NEW.sender_id;

    -- Create activity entry for new messages
    INSERT INTO activity_feed (
        tenant_id, actor_id, actor_name, actor_role,
        activity_type, activity_description,
        target_type, target_id,
        visibility, metadata
    ) VALUES (
        user_data.tenant_id,
        NEW.sender_id,
        COALESCE(user_data.first_name || ' ' || user_data.last_name, user_data.email),
        user_data.role,
        'message_sent',
        'Sent a message in conversation',
        'conversation',
        NEW.conversation_id,
        'case',
        jsonb_build_object(
            'message_id', NEW.id,
            'message_type', NEW.message_type,
            'conversation_id', NEW.conversation_id
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_message_activity
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION create_activity_feed_entry();

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = p_user_id AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's conversations
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
    conversation_id UUID,
    conversation_name VARCHAR(255),
    conversation_type VARCHAR(50),
    last_message_content TEXT,
    last_message_at TIMESTAMP,
    unread_count BIGINT,
    participant_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.conversation_type,
        m.content,
        m.created_at,
        COUNT(m2.id) FILTER (WHERE m2.created_at > cp.last_read_at),
        COUNT(cp2.id)
    FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    LEFT JOIN messages m ON c.id = m.conversation_id
    LEFT JOIN messages m2 ON c.id = m2.conversation_id
    LEFT JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.is_active = TRUE
    WHERE cp.user_id = p_user_id AND cp.is_active = TRUE
    AND (m.id IS NULL OR m.created_at = (
        SELECT MAX(created_at) FROM messages WHERE conversation_id = c.id
    ))
    GROUP BY c.id, c.name, c.conversation_type, m.content, m.created_at, cp.last_read_at
    ORDER BY COALESCE(m.created_at, c.created_at) DESC;
END;
$$ LANGUAGE plpgsql;
