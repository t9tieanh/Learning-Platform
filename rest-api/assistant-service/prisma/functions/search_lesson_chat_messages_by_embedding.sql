-- ============================================================================
-- SEARCH EMBEDDING FOR LESSON CHAT MESSAGES (pgvector)
--
-- Stored rows use passage-side vectors (same 768-dim convention as chunks).
-- Query at runtime uses query-side embedding in the application layer.
-- Sequential scan — OK for bounded session transcript sizes.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

DROP FUNCTION IF EXISTS search_lesson_chat_messages_by_embedding_v1(text, vector, integer) CASCADE;

CREATE FUNCTION search_lesson_chat_messages_by_embedding_v1(
    p_session_id TEXT,
    p_query_embedding vector(768),
    p_limit INT DEFAULT 5
)
RETURNS TABLE (
    message_id TEXT,
    session_id TEXT,
    role TEXT,
    content TEXT,
    similarity FLOAT8,
    distance FLOAT8,
    created_at TIMESTAMP(3)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lcm.id::text,
        lcm.session_id,
        lcm.role::text,
        lcm.content,
        (1 - ((lcm.embedding <=> p_query_embedding) / 2))::float8 AS similarity,
        (lcm.embedding <=> p_query_embedding)::float8 AS distance,
        lcm.created_at
    FROM lesson_chat_messages lcm
    WHERE
        lcm.session_id = p_session_id
        AND lcm.embedding IS NOT NULL
    ORDER BY lcm.embedding <=> p_query_embedding ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
