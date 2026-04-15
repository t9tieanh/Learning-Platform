package com.freeclassroom.userservice.service.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.request.personal.TrackingEventRequest;
import com.freeclassroom.userservice.grpc.client.CourseGrpcClient;
import com.freeclassroom.userservice.infrastructure.elasticsearch.CourseIndexService;
import com.freeclassroom.userservice.infrastructure.elasticsearch.TrackingEventIndexService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EventService implements IEventService {
    StringRedisTemplate redis;
    CourseGrpcClient courseGrpcClient;
    CourseIndexService courseIndexService;
    TrackingEventIndexService trackingEventIndexService;
    UserSignalsSnapshotService snapshotService;

    // RCM v2 tuning
    private static final int TOP_COURSE_KEEP = 50;
    private static final int TOP_TAG_KEEP = 50;
    private static final int TOP_CATEGORY_KEEP = 30;
    private static final int TOP_KEYWORD_KEEP = 40;

    private static final double EXPLORE_PREF_WEIGHT = 2d;
    private static final double VIEW_TAG_WEIGHT = 0.35d;
    private static final double VIEW_CATEGORY_WEIGHT = 0.35d;
    private static final double VIEW_KEYWORD_WEIGHT = 0.2d;
    private static final double VIEW_COURSE_WEIGHT = 0.6d;

    // VIEW_COURSE can learn, but its contribution must stay <= EXPLORE_PREFERENCES baseline.
    private static final double VIEW_TO_PREF_CONTRIBUTION_RATIO = 1.0d;
    private static final double VIEW_NO_PREF_CAP = 2.0d;
    private static final double VIEW_COURSE_CAP = 6.0d;

    private static final String EVENT_VIEW_COURSE = "VIEW_COURSE";
    private static final String EVENT_EXPLORE_PREFERENCES = "EXPLORE_PREFERENCES";

    private static final long GUEST_TTL_SECONDS = 60L * 60 * 24 * 30; // 30 days

    private void trimZsetToTopN(String key, int keepTopN) {
        if (keepTopN <= 0) {
            redis.delete(key);
            return;
        }
        Long size = redis.opsForZSet().zCard(key);
        if (size == null) return;
        long excess = size - keepTopN;
        if (excess <= 0) return;
        redis.opsForZSet().removeRange(key, 0, excess - 1);
    }

    private boolean isUser(Identity identity) {
        return identity != null && "USER".equals(identity.getType()) && identity.getId() != null && !identity.getId().isBlank();
    }

    private boolean isGuest(Identity identity) {
        return identity != null && "GUEST".equals(identity.getType()) && identity.getId() != null && !identity.getId().isBlank();
    }

    private static String safeString(Object v) {
        return v == null ? "" : v.toString();
    }

    private static String normalizeTag(String raw) {
        if (raw == null) return "";
        return raw.trim().toLowerCase();
    }

    private String subjectPrefix(boolean isUser) {
        return isUser ? "user:" : "guest:";
    }

    private void applyGuestTtl(String key) {
        try {
            redis.expire(key, java.time.Duration.ofSeconds(GUEST_TTL_SECONDS));
        } catch (Exception ignored) {
        }
    }

    private String baseTagScoreKey(String prefix, String subjectId) {
        return prefix + subjectId + ":base_pref_tag_score";
    }

    private String baseCategoryScoreKey(String prefix, String subjectId) {
        return prefix + subjectId + ":base_pref_category_score";
    }

    private String baseKeywordScoreKey(String prefix, String subjectId) {
        return prefix + subjectId + ":base_pref_keyword_score";
    }

    @Override
    public void persistEventToDatabase() {
        // Not implemented
    }

    @Override
    public RecordId saveEventToRedis(Identity identity, TrackingEventRequest trackingEvent) {
        if (identity == null || trackingEvent == null) return null;

        boolean isUser = isUser(identity);
        boolean isGuest = isGuest(identity);
        if (!isUser && !isGuest) return null;

        String subjectId = identity.getId();
        String prefix = subjectPrefix(isUser);

        String eventName = trackingEvent.getEventName();
        Map<String, Object> payload = trackingEvent.getPayload();
        String courseId = firstString(payload, "courseId");

        List<String> tagsFromClient = mergeSignals(
            parseSignalValues(payload == null ? null : payload.get("tag")),
            parseSignalValues(payload == null ? null : payload.get("tags"))
        );
        List<String> categoriesFromClient = mergeSignals(
            parseSignalValues(payload == null ? null : payload.get("category")),
            parseSignalValues(payload == null ? null : payload.get("categories"))
        );
        List<String> keywordsFromClient = mergeSignals(
            parseSignalValues(payload == null ? null : payload.get("longDes")),
            parseSignalValues(payload == null ? null : payload.get("longDescription")),
            parseSignalValues(payload == null ? null : payload.get("title")),
            parseSignalValues(payload == null ? null : payload.get("keywords"))
        );

        // For VIEW_COURSE payloads that only send courseId, enrich category signal.
        if (EVENT_VIEW_COURSE.equals(eventName) && courseId != null && !courseId.isBlank()) {
            Map<String, Object> courseMeta = getCourseMetadata(courseId);
            if (!courseMeta.isEmpty()) {
                if (categoriesFromClient.isEmpty()) {
                    categoriesFromClient = mergeSignals(categoriesFromClient,
                            parseSignalValues(courseMeta.get("category")));
                }
            }
        }

        long nowMs = System.currentTimeMillis();

        boolean shouldUpsertSignals = false;
        if (EVENT_VIEW_COURSE.equals(eventName) && courseId != null && !courseId.isBlank()) {
            // course score
            String courseKey = snapshotService.courseScoreKey(prefix, subjectId);
            incrementWithSoftCap(courseKey, courseId, VIEW_COURSE_WEIGHT, VIEW_COURSE_CAP);
            trimZsetToTopN(courseKey, TOP_COURSE_KEEP);

            // tag score: from course-service
            if (courseGrpcClient != null) {
                try {
                    var res = courseGrpcClient.getCourseTags(courseId);
                    if (res != null) {
                        String grpcCategory = normalizeTag(res.getCategory());
                        if (!grpcCategory.isBlank()) {
                            categoriesFromClient = mergeSignals(categoriesFromClient, List.of(grpcCategory));
                        }
                    }
                    if (res != null && res.getTagsCount() > 0) {
                        String tagKey = snapshotService.tagScoreKey(prefix, subjectId);
                        String baseTagKey = baseTagScoreKey(prefix, subjectId);
                        for (String t : res.getTagsList()) {
                            String normalized = normalizeTag(t);
                            if (normalized.isBlank()) continue;
                            incrementBoundedByPreference(tagKey, baseTagKey, normalized, VIEW_TAG_WEIGHT);
                        }
                        trimZsetToTopN(tagKey, TOP_TAG_KEEP);
                    }
                } catch (Exception ignored) {
                }
            }

            if (!tagsFromClient.isEmpty()) {
                String tagKey = snapshotService.tagScoreKey(prefix, subjectId);
                String baseTagKey = baseTagScoreKey(prefix, subjectId);
                for (String tag : tagsFromClient) {
                    incrementBoundedByPreference(tagKey, baseTagKey, tag, VIEW_TAG_WEIGHT);
                }
                trimZsetToTopN(tagKey, TOP_TAG_KEEP);
            }

            if (!categoriesFromClient.isEmpty()) {
                String categoryKey = snapshotService.categoryScoreKey(prefix, subjectId);
                String baseCategoryKey = baseCategoryScoreKey(prefix, subjectId);
                for (String category : categoriesFromClient) {
                    incrementBoundedByPreference(categoryKey, baseCategoryKey, category, VIEW_CATEGORY_WEIGHT);
                }
                trimZsetToTopN(categoryKey, TOP_CATEGORY_KEEP);
            }

            // last action
            String lastKey = snapshotService.lastActionKey(prefix, subjectId);
            Map<String, String> lastActionUpdate = new HashMap<>();
            lastActionUpdate.put("last_seen_at_ms", String.valueOf(nowMs));
            lastActionUpdate.put("last_event_name", safeString(eventName));
            lastActionUpdate.put("last_course_id", courseId);
            if (!tagsFromClient.isEmpty()) {
                // Keep comma-separated values for downstream extraction in recommendation service.
                lastActionUpdate.put("last_tag", String.join(",", tagsFromClient));
            }
            if (!categoriesFromClient.isEmpty()) {
                lastActionUpdate.put("last_category", String.join(",", categoriesFromClient));
            }
            redis.opsForHash().putAll(lastKey, lastActionUpdate);

            // guest TTL
            if (isGuest) {
                applyGuestTtl(courseKey);
                applyGuestTtl(snapshotService.tagScoreKey(prefix, subjectId));
                applyGuestTtl(snapshotService.categoryScoreKey(prefix, subjectId));
                applyGuestTtl(baseTagScoreKey(prefix, subjectId));
                applyGuestTtl(baseCategoryScoreKey(prefix, subjectId));
                applyGuestTtl(lastKey);
            }
            shouldUpsertSignals = true;
        } else if (EVENT_EXPLORE_PREFERENCES.equals(eventName)) {
            if (!tagsFromClient.isEmpty()) {
                String tagKey = snapshotService.tagScoreKey(prefix, subjectId);
                String baseTagKey = baseTagScoreKey(prefix, subjectId);
                for (String tag : tagsFromClient) {
                    redis.opsForZSet().incrementScore(tagKey, tag, EXPLORE_PREF_WEIGHT);
                    redis.opsForZSet().incrementScore(baseTagKey, tag, EXPLORE_PREF_WEIGHT);
                }
                trimZsetToTopN(tagKey, TOP_TAG_KEEP);
                trimZsetToTopN(baseTagKey, TOP_TAG_KEEP);
            }
            if (!categoriesFromClient.isEmpty()) {
                String categoryKey = snapshotService.categoryScoreKey(prefix, subjectId);
                String baseCategoryKey = baseCategoryScoreKey(prefix, subjectId);
                for (String category : categoriesFromClient) {
                    redis.opsForZSet().incrementScore(categoryKey, category, EXPLORE_PREF_WEIGHT);
                    redis.opsForZSet().incrementScore(baseCategoryKey, category, EXPLORE_PREF_WEIGHT);
                }
                trimZsetToTopN(categoryKey, TOP_CATEGORY_KEEP);
                trimZsetToTopN(baseCategoryKey, TOP_CATEGORY_KEEP);
            }
            if (!keywordsFromClient.isEmpty()) {
                String keywordKey = snapshotService.keywordScoreKey(prefix, subjectId);
                String baseKeywordKey = baseKeywordScoreKey(prefix, subjectId);
                for (String keyword : keywordsFromClient) {
                    redis.opsForZSet().incrementScore(keywordKey, keyword, EXPLORE_PREF_WEIGHT);
                    redis.opsForZSet().incrementScore(baseKeywordKey, keyword, EXPLORE_PREF_WEIGHT);
                }
                trimZsetToTopN(keywordKey, TOP_KEYWORD_KEEP);
                trimZsetToTopN(baseKeywordKey, TOP_KEYWORD_KEEP);
            }

            String lastKey = snapshotService.lastActionKey(prefix, subjectId);
            Map<String, String> lastActionUpdate = new HashMap<>();
            lastActionUpdate.put("last_seen_at_ms", String.valueOf(nowMs));
            lastActionUpdate.put("last_event_name", safeString(eventName));
            if (!tagsFromClient.isEmpty()) lastActionUpdate.put("last_tag", String.join(",", tagsFromClient));
            if (!categoriesFromClient.isEmpty()) lastActionUpdate.put("last_category", String.join(",", categoriesFromClient));
            if (!keywordsFromClient.isEmpty()) lastActionUpdate.put("last_long_des", String.join(",", keywordsFromClient));
            if (!lastActionUpdate.isEmpty()) {
                redis.opsForHash().putAll(lastKey, lastActionUpdate);
            }

            if (isGuest) {
                applyGuestTtl(snapshotService.tagScoreKey(prefix, subjectId));
                applyGuestTtl(snapshotService.categoryScoreKey(prefix, subjectId));
                applyGuestTtl(snapshotService.keywordScoreKey(prefix, subjectId));
                applyGuestTtl(baseTagScoreKey(prefix, subjectId));
                applyGuestTtl(baseCategoryScoreKey(prefix, subjectId));
                applyGuestTtl(baseKeywordScoreKey(prefix, subjectId));
                applyGuestTtl(lastKey);
            }
            shouldUpsertSignals = true;
        }

        if (shouldUpsertSignals) {
            try {
                trackingEventIndexService.ensureIndexExists();
                Map<String, Object> doc = snapshotService.buildSignalsDocument(isUser ? "USER" : "GUEST", subjectId, prefix);
                trackingEventIndexService.upsertSignals(isUser ? "USER" : "GUEST", subjectId, doc);
            } catch (Exception e) {
                log.debug("Upsert signals to ES failed", e);
            }
        }

        // raw event stream: keep both USER and GUEST
        String payloadJson = "";
        if (payload != null && !payload.isEmpty()) {
            try {
                payloadJson = new ObjectMapper().writeValueAsString(payload);
            } catch (JsonProcessingException ignored) {
                payloadJson = "";
            }
        }

        Map<String, String> fields = new HashMap<>();
        fields.put("userId", subjectId);
        fields.put("eventName", safeString(eventName));
        fields.put("payload", payloadJson);
        fields.put("createdAt", String.valueOf(nowMs));
        if (courseId != null) fields.put("courseId", courseId);
        if (!tagsFromClient.isEmpty()) fields.put("tag", String.join(",", tagsFromClient));
        if (!categoriesFromClient.isEmpty()) fields.put("category", String.join(",", categoriesFromClient));

        // stream name
        String stream = isUser ? "event:user" : "event:guest";
        RecordId recordId = redis.opsForStream().add(stream, fields);
        redis.opsForStream().trim(stream, 10_000);
        if (isGuest) {
            // also TTL the stream key itself
            applyGuestTtl(stream);
        }
        return recordId;
    }

    @Override
    public void mergeGuestEventsToUser(String guestId, String userId) {
        if (guestId == null || guestId.isBlank() || userId == null || userId.isBlank()) return;

        String guestPrefix = "guest:";
        String userPrefix = "user:";

        // Merge course_score
        String guestCourseKey = snapshotService.courseScoreKey(guestPrefix, guestId);
        String userCourseKey = snapshotService.courseScoreKey(userPrefix, userId);
        var guestCourses = redis.opsForZSet().rangeWithScores(guestCourseKey, 0, -1);
        if (guestCourses != null) {
            for (var t : guestCourses) {
                if (t == null || t.getValue() == null || t.getScore() == null) continue;
                redis.opsForZSet().incrementScore(userCourseKey, t.getValue(), t.getScore());
            }
            trimZsetToTopN(userCourseKey, TOP_COURSE_KEEP);
        }

        // Merge tag_score
        String guestTagKey = snapshotService.tagScoreKey(guestPrefix, guestId);
        String userTagKey = snapshotService.tagScoreKey(userPrefix, userId);
        var guestTags = redis.opsForZSet().rangeWithScores(guestTagKey, 0, -1);
        if (guestTags != null) {
            for (var t : guestTags) {
                if (t == null || t.getValue() == null || t.getScore() == null) continue;
                redis.opsForZSet().incrementScore(userTagKey, t.getValue(), t.getScore());
            }
            trimZsetToTopN(userTagKey, TOP_TAG_KEEP);
        }

        // Merge category_score
        String guestCategoryKey = snapshotService.categoryScoreKey(guestPrefix, guestId);
        String userCategoryKey = snapshotService.categoryScoreKey(userPrefix, userId);
        var guestCategories = redis.opsForZSet().rangeWithScores(guestCategoryKey, 0, -1);
        if (guestCategories != null) {
            for (var t : guestCategories) {
                if (t == null || t.getValue() == null || t.getScore() == null) continue;
                redis.opsForZSet().incrementScore(userCategoryKey, t.getValue(), t.getScore());
            }
            trimZsetToTopN(userCategoryKey, TOP_CATEGORY_KEEP);
        }

        // Merge keyword_score
        String guestKeywordKey = snapshotService.keywordScoreKey(guestPrefix, guestId);
        String userKeywordKey = snapshotService.keywordScoreKey(userPrefix, userId);
        var guestKeywords = redis.opsForZSet().rangeWithScores(guestKeywordKey, 0, -1);
        if (guestKeywords != null) {
            for (var t : guestKeywords) {
                if (t == null || t.getValue() == null || t.getScore() == null) continue;
                redis.opsForZSet().incrementScore(userKeywordKey, t.getValue(), t.getScore());
            }
            trimZsetToTopN(userKeywordKey, TOP_KEYWORD_KEEP);
        }

        // Merge base preference tag/category/keyword scores
        String guestBaseTagKey = baseTagScoreKey(guestPrefix, guestId);
        String userBaseTagKey = baseTagScoreKey(userPrefix, userId);
        mergeZsetScores(guestBaseTagKey, userBaseTagKey, TOP_TAG_KEEP);

        String guestBaseCategoryKey = baseCategoryScoreKey(guestPrefix, guestId);
        String userBaseCategoryKey = baseCategoryScoreKey(userPrefix, userId);
        mergeZsetScores(guestBaseCategoryKey, userBaseCategoryKey, TOP_CATEGORY_KEEP);

        String guestBaseKeywordKey = baseKeywordScoreKey(guestPrefix, guestId);
        String userBaseKeywordKey = baseKeywordScoreKey(userPrefix, userId);
        mergeZsetScores(guestBaseKeywordKey, userBaseKeywordKey, TOP_KEYWORD_KEEP);

        // Merge last_action (prefer most recent)
        String guestLastKey = snapshotService.lastActionKey(guestPrefix, guestId);
        String userLastKey = snapshotService.lastActionKey(userPrefix, userId);
        Map<Object, Object> guestLast = redis.opsForHash().entries(guestLastKey);
        Map<Object, Object> userLast = redis.opsForHash().entries(userLastKey);

        Long guestSeen = toLong(guestLast.get("last_seen_at_ms"));
        Long userSeen = toLong(userLast.get("last_seen_at_ms"));
        boolean takeGuest = guestSeen != null && (userSeen == null || guestSeen > userSeen);
        if (takeGuest && !guestLast.isEmpty()) {
            Map<String, String> merged = new HashMap<>();
            for (var e : guestLast.entrySet()) {
                if (e.getKey() == null || e.getValue() == null) continue;
                merged.put(e.getKey().toString(), e.getValue().toString());
            }
            if (!merged.isEmpty()) {
                redis.opsForHash().putAll(userLastKey, merged);
            }
        }

        // Delete guest keys (history is merged)
        redis.delete(guestCourseKey);
        redis.delete(guestTagKey);
        redis.delete(guestCategoryKey);
        redis.delete(guestKeywordKey);
        redis.delete(guestBaseTagKey);
        redis.delete(guestBaseCategoryKey);
        redis.delete(guestBaseKeywordKey);
        redis.delete(guestLastKey);

        // Upsert merged USER signals to ES
        try {
            trackingEventIndexService.ensureIndexExists();
            Map<String, Object> userDoc = snapshotService.buildSignalsDocument("USER", userId, userPrefix);
            trackingEventIndexService.upsertSignals("USER", userId, userDoc);
        } catch (Exception e) {
            log.debug("Upsert merged user signals to ES failed", e);
        }

        // Delete guest doc in ES after merge (best-effort)
        try {
            trackingEventIndexService.deleteSignals("GUEST", guestId);
        } catch (Exception e) {
            // ignore 404s or ES downtime
            log.debug("Delete guest signals doc failed", e);
        }
    }

    private static Long toLong(Object v) {
        if (v == null) return null;
        try {
            return Long.parseLong(v.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private void incrementWithSoftCap(String scoreKey, String member, double baseIncrement, double cap) {
        if (member == null || member.isBlank() || baseIncrement <= 0d || cap <= 0d) return;
        double current = getScore(scoreKey, member);
        if (current >= cap) return;

        double ratio = Math.max(0d, 1d - (current / cap));
        double effectiveIncrement = baseIncrement * ratio;
        if (effectiveIncrement <= 0d) return;

        redis.opsForZSet().incrementScore(scoreKey, member, effectiveIncrement);
    }

    private void incrementBoundedByPreference(String scoreKey,
                                              String basePrefKey,
                                              String member,
                                              double increment) {
        if (member == null || member.isBlank() || increment <= 0d) return;

        double current = getScore(scoreKey, member);
        double basePref = getScore(basePrefKey, member);

        // VIEW_COURSE contribution <= EXPLORE_PREFERENCES baseline (or small cap when no baseline).
        double maxTotal = basePref > 0d
                ? basePref * (1d + VIEW_TO_PREF_CONTRIBUTION_RATIO)
                : VIEW_NO_PREF_CAP;

        if (current >= maxTotal) return;
        double allowed = Math.min(increment, maxTotal - current);
        if (allowed <= 0d) return;

        redis.opsForZSet().incrementScore(scoreKey, member, allowed);
    }

    private void mergeZsetScores(String srcKey, String destKey, int keepTopN) {
        var tuples = redis.opsForZSet().rangeWithScores(srcKey, 0, -1);
        if (tuples == null || tuples.isEmpty()) return;

        for (var t : tuples) {
            if (t == null || t.getValue() == null || t.getScore() == null) continue;
            redis.opsForZSet().incrementScore(destKey, t.getValue(), t.getScore());
        }
        trimZsetToTopN(destKey, keepTopN);
    }

    private double getScore(String key, String member) {
        try {
            Double score = redis.opsForZSet().score(key, member);
            return score == null ? 0d : score;
        } catch (Exception e) {
            return 0d;
        }
    }

    private Map<String, Object> getCourseMetadata(String courseId) {
        if (courseId == null || courseId.isBlank()) return Map.of();

        if (courseGrpcClient != null) {
            try {
                var tagsRes = courseGrpcClient.getCourseTags(courseId);
                if (tagsRes != null) {
                    String category = normalizeTag(tagsRes.getCategory());
                    if (!category.isBlank()) {
                        return Map.of("category", category);
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (courseIndexService == null) return Map.of();

        try {
            List<Map<String, Object>> hits = courseIndexService.searchCandidateCourses(
                    List.of(courseId),
                    List.of(),
                    List.of(),
                    List.of(),
                    List.of(),
                    1,
                    List.of(),
                    false
            );

            if (hits == null || hits.isEmpty()) return Map.of();
            Map<String, Object> first = hits.getFirst();
            if (first == null) return Map.of();

            Map<String, Object> out = new HashMap<>();
            Object category = first.get("category");
            if (category != null) out.put("category", category);
            return out;
        } catch (Exception e) {
            return Map.of();
        }
    }

    private static String firstString(Map<String, Object> payload, String key) {
        if (payload == null || payload.isEmpty() || key == null || key.isBlank()) return null;
        Object v = payload.get(key);
        if (v == null) return null;
        String out = v.toString().trim();
        return out.isBlank() ? null : out;
    }

    private static List<String> parseSignalValues(Object raw) {
        if (raw == null) return List.of();

        LinkedHashSet<String> out = new LinkedHashSet<>();
        if (raw instanceof List<?> list) {
            for (Object item : list) {
                addSignalItem(out, item);
            }
        } else {
            addSignalItem(out, raw);
        }
        return new ArrayList<>(out);
    }

    @SafeVarargs
    private static List<String> mergeSignals(List<String>... parts) {
        LinkedHashSet<String> merged = new LinkedHashSet<>();
        if (parts != null) {
            for (List<String> p : parts) {
                if (p == null || p.isEmpty()) continue;
                merged.addAll(p);
            }
        }
        return new ArrayList<>(merged);
    }

    private static void addSignalItem(LinkedHashSet<String> out, Object item) {
        if (item == null) return;
        String text = item.toString();
        if (text == null || text.isBlank()) return;

        String[] parts = text.split(",");
        for (String p : parts) {
            if (p == null) continue;
            String normalized = p.trim().toLowerCase(Locale.ROOT);
            if (!normalized.isBlank()) out.add(normalized);
        }
    }
}
