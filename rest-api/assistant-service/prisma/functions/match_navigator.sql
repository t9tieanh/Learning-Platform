DROP FUNCTION IF EXISTS public.match_navigator(vector, integer, jsonb);

CREATE FUNCTION public.match_navigator (
    query_embedding vector,
    match_count integer,
    filter jsonb
)
RETURNS TABLE (
    id text,
    category text,
    subcategory text,
    title text,
    content text,
    metadata jsonb,
    similarity double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(n.id::text, ''),
        COALESCE(n.category, ''),
        COALESCE(n.subcategory, ''),
        COALESCE(n.title, ''),
        COALESCE(n.content, ''),
        COALESCE(n.metadata, '{}'::jsonb),
        COALESCE(1 - (n.embedding <=> query_embedding), 0)
    FROM public.navigator_embeddings n
    WHERE (filter IS NULL OR n.metadata @> filter)
    ORDER BY n.embedding <=> query_embedding
    LIMIT COALESCE(match_count, 10);
END;
$$;

NOTIFY pgrst, 'reload schema';