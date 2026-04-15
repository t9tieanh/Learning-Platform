package com.freeclassroom.userservice.infrastructure.elasticsearch;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CourseIndexService {

    private final RestClient es;
    private final ElasticsearchProperties props;

    public String indexName() {
        return props.getIndex().getCourses();
    }

    /**
     * Search candidate courses from the course index using a bool query + boosts.
     *
     * The course migration in course-service creates mapping:
     * - id: keyword
     * - tags: keyword
     *
     * But real documents may still present these fields as arrays due to upstream serialization.
     * This method only relies on ES query-time behavior and only reads back: id/tags.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> searchCandidateCourses(
            Collection<String> courseScoreIds,
            Collection<String> tagScoreTags,
            Collection<String> lastCourseTags,
            Collection<String> categorySignals,
            Collection<String> keywordSignals,
            int size,
            Collection<String> excludeCourseIds,
            boolean includePopularFallback
    ) {
        if (size <= 0) return List.of();

        List<Object> should = new ArrayList<>();

        if (courseScoreIds != null && !courseScoreIds.isEmpty()) {
            // IMPORTANT: docs store id as array sometimes, but terms query works with keyword mapping.
            should.add(Map.of("terms", Map.of("id", courseScoreIds, "boost", 5)));
        }

        addTagsShouldClauses(should, tagScoreTags, 3);
        addTagsShouldClauses(should, lastCourseTags, 2);
        addCategoryShouldClauses(should, categorySignals, 3);
        addKeywordShouldClauses(should, keywordSignals, 2);

        if (includePopularFallback) {
            // If you later add a popularity field, replace this with a function_score.
            // For now, match_all acts as the last-resort candidate source.
            should.add(Map.of("match_all", Map.of("boost", 0.1)));
        }

        List<Object> mustNot = new ArrayList<>();
        if (excludeCourseIds != null && !excludeCourseIds.isEmpty()) {
            mustNot.add(Map.of("terms", Map.of("id", excludeCourseIds)));
        }

        Map<String, Object> body = Map.of(
                "size", size,
                "track_total_hits", false,
            "_source", List.of("id", "tags", "category", "title", "longDescription", "shortDescription"),
                "query", Map.of(
                        "bool", Map.of(
                                "should", should,
                                "minimum_should_match", should.isEmpty() ? 0 : 1,
                                "must_not", mustNot
                        )
                )
        );

        try {
            Map<String, Object> res = es.post()
                    .uri("/{index}/_search", indexName())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (res == null) return List.of();
            Object hitsObj = res.get("hits");
            if (!(hitsObj instanceof Map<?, ?> hits)) return List.of();
            Object hitsListObj = hits.get("hits");
            if (!(hitsListObj instanceof List<?> hitList)) return List.of();

            List<Map<String, Object>> out = new ArrayList<>();
            for (Object h : hitList) {
                if (!(h instanceof Map<?, ?> hm)) continue;
                Object srcObj = hm.get("_source");
                if (srcObj instanceof Map<?, ?> src) {
                    Map<String, Object> row = new HashMap<>((Map<String, Object>) src);
                    Object esScore = hm.get("_score");
                    if (esScore instanceof Number n) {
                        row.put("_esScore", n.doubleValue());
                    }
                    out.add(row);
                }
            }
            return out;
        } catch (Exception e) {
            return List.of();
        }
    }

    private static void addTagsShouldClauses(List<Object> should, Collection<String> tags, int boost) {
        if (tags == null || tags.isEmpty()) return;

        // Use 'terms' for keyword arrays; more efficient and correct for the mapping created by migration.
        should.add(Map.of("terms", Map.of("tags", tags, "boost", boost)));

        // Fallback for case differences (signals are normalized to lowercase in event ingestion).
        for (String t : tags) {
            if (t == null || t.isBlank()) continue;
            should.add(Map.of("term", Map.of(
                    "tags", Map.of(
                            "value", t,
                            "boost", boost,
                            "case_insensitive", true
                    )
            )));
        }

        // Backup for deployments where tags might be text. Keep it low-risk.
        for (String t : tags) {
            if (t == null || t.isBlank()) continue;
            should.add(Map.of("match_phrase", Map.of("tags", Map.of("query", t, "boost", boost))));
        }
    }

    private static void addCategoryShouldClauses(List<Object> should, Collection<String> categories, int boost) {
        if (categories == null || categories.isEmpty()) return;

        should.add(Map.of("terms", Map.of("category.keyword", categories, "boost", boost + 1)));

        for (String c : categories) {
            if (c == null || c.isBlank()) continue;
            should.add(Map.of("match_phrase", Map.of("category", Map.of("query", c, "boost", boost))));
        }
    }

    private static void addKeywordShouldClauses(List<Object> should, Collection<String> keywords, int boost) {
        if (keywords == null || keywords.isEmpty()) return;

        for (String kw : keywords) {
            if (kw == null || kw.isBlank()) continue;
            should.add(Map.of("multi_match", Map.of(
                    "query", kw,
                    "fields", List.of("title^2", "shortDescription", "longDescription"),
                    "boost", boost
            )));
        }
    }
}
