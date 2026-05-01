-- ============================================================================
-- SEARCH EMBEDDING FUNCTION FOR LESSON CHUNKS (pgvector Native)
--
-- lesson_chunks.embedding: vector (no HNSW — row size limit with 768-dim float32).
-- Similarity search uses sequential scan; fine for moderate chunk counts per lesson.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

DROP FUNCTION IF EXISTS search_lesson_chunks_by_embedding(text, vector, integer) CASCADE;
DROP FUNCTION IF EXISTS search_lesson_chunks_by_embedding_v2(text, vector, integer) CASCADE;

CREATE FUNCTION search_lesson_chunks_by_embedding_v2(
    p_lesson_id TEXT,
    p_query_embedding vector(768),
    p_limit INT DEFAULT 2
)
RETURNS TABLE (
    chunk_id TEXT,
    lesson_id TEXT,
    content TEXT,
    title TEXT,
    summary TEXT,
    chunk_index INT,
    start_time TEXT,
    end_time TEXT,
    similarity FLOAT8,
    distance FLOAT8
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        lc.id::text,
        lc."lessonId",
        lc.content,
        lc.title,
        lc.summary,
        lc."chunkIndex",
        lc."startTime",
        lc."endTime",
        (1 - ((lc.embedding <=> p_query_embedding) / 2))::float8 AS similarity,
        (lc.embedding <=> p_query_embedding)::float8 AS distance
    FROM lesson_chunks lc
    WHERE
        lc."lessonId" = p_lesson_id
        AND lc.embedding IS NOT NULL
    ORDER BY lc.embedding <=> p_query_embedding ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

DROP INDEX IF EXISTS idx_lesson_chunks_embedding_hnsw;
