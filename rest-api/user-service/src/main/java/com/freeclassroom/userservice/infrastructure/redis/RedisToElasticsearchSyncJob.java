package com.freeclassroom.userservice.infrastructure.redis;

import com.freeclassroom.userservice.infrastructure.elasticsearch.TrackingEventIndexService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.*;

import static com.freeclassroom.userservice.enums.RedisStreamEnum.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisToElasticsearchSyncJob {

    private final StringRedisTemplate redis;
    private final TrackingEventIndexService indexService;

    private final String consumerName = "es-sync-" + java.util.UUID.randomUUID();

    @PostConstruct
    public void init() {
        ensureStreamAndGroup(EVENT_USER.getValue(), GROUP_USER.getValue());
        ensureStreamAndGroup(EVENT_GUEST.getValue(), GROUP_GUEST.getValue());
    }

    /**
     * Creates the Redis stream (if absent) and registers the consumer group (if absent).
     * Redis throws BUSYGROUP if the group already exists – that is safe to ignore.
     * NOGROUP is thrown when the stream does not exist yet; we create it with MKSTREAM.
     */
    private void ensureStreamAndGroup(String stream, String group) {
        try {
            redis.opsForStream().createGroup(stream, ReadOffset.from("0"), group);
        } catch (RedisSystemException ex) {
            String msg = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
            if (msg != null && msg.startsWith("BUSYGROUP")) {
                // group already exists – fine
            } else {
                log.debug("ensureStreamAndGroup stream={} group={} error: {}", stream, group, msg);
            }
        } catch (Exception ex) {
            log.debug("ensureStreamAndGroup stream={} group={} error: {}", stream, group, ex.getMessage());
        }
    }

    @Scheduled(fixedDelayString = "${rcm.v2.es-sync.fixed-delay-ms:1000}")
    public void sync() {
        try {
            indexService.ensureIndexExists();

            int processedUser = readAndUpsertSignals(EVENT_USER.getValue(), GROUP_USER.getValue(), "USER", "user:");
            int processedGuest = readAndUpsertSignals(EVENT_GUEST.getValue(), GROUP_GUEST.getValue(), "GUEST", "guest:");

            int total = processedUser + processedGuest;
            if (total > 0) {
                log.info("ES sync processed {} record(s) (user={}, guest={})", total, processedUser, processedGuest);
            }
        } catch (Exception e) {
            // don't crash scheduler
            log.warn("ES sync error", e);
        }
    }

    private int readAndUpsertSignals(String stream, String group, String subjectType, String prefix) {
        ensureStreamAndGroup(stream, group);

        List<MapRecord<String, Object, Object>> records;
        try {
            records = redis.opsForStream().read(
                    Consumer.from(group, consumerName),
                    StreamReadOptions.empty().count(50).block(Duration.ofMillis(500)),
                    StreamOffset.create(stream, ReadOffset.lastConsumed())
            );
        } catch (RedisSystemException ex) {
            // If group/stream disappeared between ensureStreamAndGroup and the read, recreate and skip this tick
            String msg = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
            if (msg != null && msg.contains("NOGROUP")) {
                ensureStreamAndGroup(stream, group);
            } else {
                log.warn("XREADGROUP failed for stream={}: {}", stream, msg);
            }
            return 0;
        }

        if (records == null || records.isEmpty()) return 0;

        int ok = 0;
        for (var record : records) {
            try {
                Map<Object, Object> values = record.getValue();
                String subjectId = toString(values.get("userId"));
                if (subjectId.isBlank()) {
                    ack(stream, group, record);
                    continue;
                }

                Map<String, Object> doc = buildSignalsDocument(subjectType, subjectId, prefix);
                indexService.upsertSignals(subjectType, subjectId, doc);

                ack(stream, group, record);
                ok++;
            } catch (Exception e) {
                log.warn("Upsert signals failed for recordId={}", record.getId(), e);
            }
        }
        return ok;
    }

    private void ack(String stream, String group, MapRecord<String, Object, Object> record) {
        try {
            redis.opsForStream().acknowledge(stream, group, record.getId());
        } catch (Exception ignored) {
        }
    }

    private Map<String, Object> buildSignalsDocument(String subjectType, String subjectId, String prefix) {
        long nowMs = System.currentTimeMillis();

        // courseScore
        Set<ZSetOperations.TypedTuple<String>> courseTuples = redis.opsForZSet().reverseRangeWithScores(courseScoreKey(prefix, subjectId), 0, 49);
        List<Map<String, Object>> courseScore = new ArrayList<>();
        if (courseTuples != null) {
            for (var t : courseTuples) {
                if (t == null || t.getValue() == null || t.getScore() == null) continue;
                courseScore.add(Map.of(
                        "courseId", t.getValue(),
                        "score", t.getScore()
                ));
            }
        }

        // tagScore
        Set<ZSetOperations.TypedTuple<String>> tagTuples = redis.opsForZSet().reverseRangeWithScores(tagScoreKey(prefix, subjectId), 0, 49);
        List<Map<String, Object>> tagScore = new ArrayList<>();
        if (tagTuples != null) {
            for (var t : tagTuples) {
                if (t == null || t.getValue() == null || t.getScore() == null) continue;
                tagScore.add(Map.of(
                        "tag", t.getValue(),
                        "score", t.getScore()
                ));
            }
        }

        // categoryScore
        Set<ZSetOperations.TypedTuple<String>> categoryTuples = redis.opsForZSet().reverseRangeWithScores(categoryScoreKey(prefix, subjectId), 0, 29);
        List<Map<String, Object>> categoryScore = new ArrayList<>();
        if (categoryTuples != null) {
            for (var t : categoryTuples) {
                if (t == null || t.getValue() == null || t.getScore() == null) continue;
                categoryScore.add(Map.of(
                        "category", t.getValue(),
                        "score", t.getScore()
                ));
            }
        }

        // keywordScore
        Set<ZSetOperations.TypedTuple<String>> keywordTuples = redis.opsForZSet().reverseRangeWithScores(keywordScoreKey(prefix, subjectId), 0, 39);
        List<Map<String, Object>> keywordScore = new ArrayList<>();
        if (keywordTuples != null) {
            for (var t : keywordTuples) {
                if (t == null || t.getValue() == null || t.getScore() == null) continue;
                keywordScore.add(Map.of(
                        "keyword", t.getValue(),
                        "score", t.getScore()
                ));
            }
        }

        // lastAction
        Map<Object, Object> last = redis.opsForHash().entries(lastActionKey(prefix, subjectId));
        Map<String, Object> lastAction = new HashMap<>();
        if (!last.isEmpty()) {
            putIfNotBlank(lastAction, "lastSeenAtMs", toLong(last.get("last_seen_at_ms")));
            putIfNotBlank(lastAction, "lastEventName", toString(last.get("last_event_name")));
            putIfNotBlank(lastAction, "lastCourseId", toString(last.get("last_course_id")));
            putIfNotBlank(lastAction, "lastTag", toString(last.get("last_tag")));
            putIfNotBlank(lastAction, "lastCategory", toString(last.get("last_category")));
            putIfNotBlank(lastAction, "lastLongDes", toString(last.get("last_long_des")));
        }

        Map<String, Object> doc = new HashMap<>();
        doc.put("subjectType", subjectType);
        doc.put("subjectId", subjectId);
        doc.put("updatedAt", nowMs);
        doc.put("courseScore", courseScore);
        doc.put("tagScore", tagScore);
        doc.put("categoryScore", categoryScore);
        doc.put("keywordScore", keywordScore);
        doc.put("lastAction", lastAction);
        return doc;
    }

    private static void putIfNotBlank(Map<String, Object> m, String key, Object value) {
        if (value == null) return;
        if (value instanceof String s) {
            if (s.isBlank()) return;
        }
        m.put(key, value);
    }

    private static String toString(Object v) {
        return v == null ? "" : v.toString();
    }

    private static Long toLong(Object v) {
        if (v == null) return null;
        try {
            return Long.parseLong(v.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private String courseScoreKey(String prefix, String subjectId) {
        return prefix + subjectId + ":course_score";
    }

    private String tagScoreKey(String prefix, String subjectId) {
        return prefix + subjectId + ":tag_score";
    }

    private String categoryScoreKey(String prefix, String subjectId) {
        return prefix + subjectId + ":category_score";
    }

    private String keywordScoreKey(String prefix, String subjectId) {
        return prefix + subjectId + ":keyword_score";
    }

    private String lastActionKey(String prefix, String subjectId) {
        return prefix + subjectId + ":last_action";
    }
}
