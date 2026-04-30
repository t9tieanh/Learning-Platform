CREATE OR REPLACE FUNCTION public.match_system_profile (
    query_embedding vector,
    match_count integer,
    filter jsonb
)
RETURNS TABLE (
    id text,
    content text,
    metadata jsonb,
    similarity double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id::text,
        s.content,
        s.metadata,
        1 - (s.embedding <=> query_embedding) AS similarity
    FROM public.system_profile_embeddings s
    WHERE s.metadata @> filter
    ORDER BY s.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;