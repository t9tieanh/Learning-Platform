package com.freeclassroom.userservice.infrastructure.elasticsearch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingEventIndexService {

    /** Mapping for the user personalization signals index. Kept in sync with RedisToElasticsearchSyncJob#buildSignalsDocument. */
    private static final Map<String, Object> INDEX_DEFINITION = Map.of(
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
                if (indexExists(index)) return;

                log.info("Elasticsearch index '{}' not found. Creating...", index);
                createIndex(index);
                log.info("Elasticsearch index '{}' created.", index);
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

    /**
     * HEAD /{index} returns 404 when the index is absent. Use exchange() so the default
     * status handlers don't turn that 404 into an exception - a missing index is the
     * normal path here, not an error.
     */
    private boolean indexExists(String index) {
        return Boolean.TRUE.equals(es.head()
                .uri("/{index}", index)
                .exchange((request, response) -> response.getStatusCode().is2xxSuccessful()));
    }

    /** Idempotent: a concurrent creator winning the race is treated as success. */
    private void createIndex(String index) {
        try {
            es.put()
                    .uri("/{index}", index)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(INDEX_DEFINITION)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            if (body != null && body.contains("resource_already_exists_exception")) {
                log.debug("Elasticsearch index '{}' created concurrently by another instance.", index);
                return;
            }
            throw e;
        }
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
