DROP FUNCTION IF EXISTS public.course_embeddings_search(jsonb, integer, vector);

CREATE FUNCTION public.course_embeddings_search (
    filter jsonb,
    match_count integer,
    query_embedding vector
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
        COALESCE(c.id::text, ''),
        COALESCE(c.content::text, ''),
        COALESCE(
            c.metadata || jsonb_build_object(
                'link', COALESCE(c.link, '')
            ),
            jsonb_build_object('link', COALESCE(c.link, ''))
        ),
        COALESCE(1 - (c.embedding <=> query_embedding), 0)
    FROM public.course_embeddings c
    WHERE (filter IS NULL OR c.metadata @> filter)
    ORDER BY c.embedding <=> query_embedding
    LIMIT COALESCE(match_count, 10);
END;
$$;

NOTIFY pgrst, 'reload schema';