-- ============================================================================
-- SEARCH EMBEDDING FUNCTION FOR LESSON CHUNKS (pgvector Native)
-- 
-- Purpose: Search for most similar LessonChunks based on embedding similarity
-- Uses native pgvector extension with vector(768) type for high performance
-- Input: lessonId (TEXT), queryEmbedding (vector768), limit (default 2)
-- Output: Top K chunks sorted by cosine distance with similarity scores
-- ============================================================================

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Drop old versions (clear any stale plans)
DROP FUNCTION IF EXISTS search_lesson_chunks_by_embedding(text, vector, integer) CASCADE;
DROP FUNCTION IF EXISTS search_lesson_chunks_by_embedding_v2(text, vector, integer) CASCADE;

-- Step 3: Create search function using native pgvector cosine distance operator
-- Returns chunks ranked by cosine similarity (higher = more similar)
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
    similarity FLOAT8 
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
        -- Normalize cosine distance [0, 2] to similarity [0, 1]
        -- Formula: 1 - (distance / 2)
        -- Result: 1.0 = identical, 0.5 = orthogonal, 0.0 = opposite
        (1 - (lc.embedding <=> p_query_embedding) / 2) AS similarity
    FROM lesson_chunks lc
    WHERE
        lc."lessonId" = p_lesson_id
        AND lc.embedding IS NOT NULL
    ORDER BY lc.embedding <=> p_query_embedding ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Step 4: Create HNSW index for fast similarity search (requires pgvector 0.5.0+)
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_embedding_hnsw
ON lesson_chunks USING hnsw (embedding vector_cosine_ops);