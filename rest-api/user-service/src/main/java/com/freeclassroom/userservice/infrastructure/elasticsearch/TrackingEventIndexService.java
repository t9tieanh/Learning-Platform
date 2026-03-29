package com.freeclassroom.userservice.infrastructure.elasticsearch;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TrackingEventIndexService {

    private final RestClient es;
    private final ElasticsearchProperties props;

    public String indexName() {
        return props.getIndex().getTrackingEvents();
    }

    public void ensureIndexExists() {
        String index = indexName();

        RuntimeException last = null;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                boolean exists = es.head()
                        .uri("/{index}", index)
                        .retrieve()
                        .toBodilessEntity()
                        .getStatusCode()
                        .is2xxSuccessful();

                if (exists) return;

                Map<String, Object> body = Map.of(
                        "mappings", Map.of(
                                "dynamic", "false",
                                "properties", Map.of(
                                        "subjectType", Map.of("type", "keyword"),
                                        "subjectId", Map.of("type", "keyword"),
                                        "updatedAt", Map.of("type", "date", "format", "epoch_millis"),
                                        "courseScore", Map.of(
                                                "type", "nested",
                                                "properties", Map.of(
                                                        "courseId", Map.of("type", "keyword"),
                                                        "score", Map.of("type", "double")
                                                )
                                        ),
                                        "tagScore", Map.of(
                                                "type", "nested",
                                                "properties", Map.of(
                                                        "tag", Map.of("type", "keyword"),
                                                        "score", Map.of("type", "double")
                                                )
                                        ),
                                        "categoryScore", Map.of(
                                            "type", "nested",
                                            "properties", Map.of(
                                                "category", Map.of("type", "keyword"),
                                                "score", Map.of("type", "double")
                                            )
                                        ),
                                        "keywordScore", Map.of(
                                            "type", "nested",
                                            "properties", Map.of(
                                                "keyword", Map.of("type", "keyword"),
                                                "score", Map.of("type", "double")
                                            )
                                        ),
                                        "lastAction", Map.of(
                                                "properties", Map.of(
                                                        "lastSeenAtMs", Map.of("type", "date", "format", "epoch_millis"),
                                                        "lastEventName", Map.of("type", "keyword"),
                                                        "lastCourseId", Map.of("type", "keyword"),
                                                "lastTag", Map.of("type", "keyword"),
                                                "lastCategory", Map.of("type", "keyword"),
                                                "lastLongDes", Map.of("type", "keyword")
                                                )
                                        )
                                )
                        )
                );

                es.put()
                        .uri("/{index}", index)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();

                return; // created successfully
            } catch (RuntimeException e) {
                last = e;
                // backoff: 200ms, 400ms, 800ms
                sleepSilently(200L * (1L << (attempt - 1)));
            } catch (Exception e) {
                last = new RuntimeException(e);
                sleepSilently(200L * (1L << (attempt - 1)));
            }
        }

        // stop after 3 attempts
        throw last != null ? last : new RuntimeException("Failed to ensure Elasticsearch index exists");
    }

    private static void sleepSilently(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    public String documentId(String subjectType, String subjectId) {
        return subjectType + ":" + subjectId;
    }

    /** Upsert full signals snapshot (one doc per subject). */
    public void upsertSignals(String subjectType, String subjectId, Map<String, Object> doc) {
        es.put()
                .uri("/{index}/_doc/{id}", indexName(), documentId(subjectType, subjectId))
                .contentType(MediaType.APPLICATION_JSON)
                .body(doc)
                .retrieve()
                .toBodilessEntity();
    }

    /** Backward compatibility for user-only callers. */
    public void upsertUserSignals(String userId, Map<String, Object> doc) {
        upsertSignals("USER", userId, doc);
    }

    public void deleteSignals(String subjectType, String subjectId) {
        es.delete()
                .uri("/{index}/_doc/{id}", indexName(), documentId(subjectType, subjectId))
                .retrieve()
                .toBodilessEntity();
    }

    /**
     * Fetch raw signals document by subject.
     * @return Elasticsearch _source map or null if not found.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getSignalsSource(String subjectType, String subjectId) {
        try {
            Map<String, Object> res = es.get()
                    .uri("/{index}/_doc/{id}", indexName(), documentId(subjectType, subjectId))
                    .retrieve()
                    .body(Map.class);
            if (res == null) return null;
            Object found = res.get("found");
            if (found instanceof Boolean b && !b) return null;
            Object src = res.get("_source");
            if (src instanceof Map<?, ?> m) {
                return (Map<String, Object>) m;
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
