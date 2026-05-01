-- ============================================================================
-- lesson_chunks: drop HNSW on embedding (keep column type vector)
--
-- float32 vector(768) cannot fit PostgreSQL index tuple limits for HNSW.
-- Without the index, INSERT/UPDATE embeddings succeed; similarity search uses
-- sequential scans (acceptable when few chunks per lesson).
--
-- Apply: psql "$DATABASE_URL" -f prisma/sql/migrate_lesson_chunks_drop_embedding_hnsw.sql
--
-- If embedding column is halfvec(768) from an earlier experiment, uncomment
-- the ALTER TYPE block below before running this script.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

DROP INDEX IF EXISTS idx_lesson_chunks_embedding_hnsw;

-- Uncomment if embedding column is still halfvec(768) from an earlier migration:
-- ALTER TABLE lesson_chunks
--     ALTER COLUMN embedding TYPE vector(768)
--     USING (embedding::vector);

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
