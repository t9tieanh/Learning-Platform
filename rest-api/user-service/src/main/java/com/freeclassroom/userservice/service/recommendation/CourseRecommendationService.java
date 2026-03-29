package com.freeclassroom.userservice.service.recommendation;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.recommendation.RecommendedCourseItem;
import com.freeclassroom.userservice.dto.response.recommendation.RecommendedCoursePageResponse;
import com.freeclassroom.userservice.infrastructure.elasticsearch.CourseIndexService;
import com.freeclassroom.userservice.infrastructure.elasticsearch.TrackingEventIndexService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseRecommendationService {

    TrackingEventIndexService trackingEventIndexService;
    CourseIndexService courseIndexService;
    StringRedisTemplate redis;

    private static final int MAX_SIZE = 50;
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    // candidate pool multiplier so we have room to rank after mixing sources
    private static final int CANDIDATE_MULTIPLIER = 8;

    // scoring weights (normalized 0..1 components)
    // NOTE: weights should sum to ~1.0 for predictability.
    private static final double W_COURSE_SCORE = 0.32;
    private static final double W_CATEGORY_MATCH = 0.24;
    private static final double W_TAG_MATCH = 0.18;
    private static final double W_SIMILARITY = 0.18;
    private static final double W_ES_RELEVANCE = 0.04;
    private static final double W_RECENCY = 0.01;
    private static final double W_POPULARITY = 0.03;

    // We want a stable ranking across different `size` values.
    // Always rank from a sufficiently large pool.
    private static final int MIN_CANDIDATES = 300;

    // Ensure a minimum portion of candidates come from tagScore-driven retrieval.
    private static final int MIN_TAG_CANDIDATES = 120;

    private static final long RECENT_WINDOW_MS = 3L * 60 * 1000; // last 3 minutes
    private static final int RECENT_EVENT_SCAN_LIMIT = 300;
    private static final int RECENT_EVENT_KEEP = 25;

    // recent-topic scoring (before normalization)
    private static final double RECENT_CATEGORY_MATCH_SCORE = 5d;
    private static final double RECENT_TAG_MATCH_SCORE = 3d;
    private static final double RECENT_KEYWORD_MATCH_SCORE = 4d;

    // latest events get stronger weights
    private static final double LATEST_EVENT_WEIGHT = 1.5d;
    private static final double MID_EVENT_WEIGHT = 1.0d;
    private static final double OLDER_EVENT_WEIGHT = 0.5d;

    // If recent intent exists, dominate ranking with recent-topic score.
    private static final double W_RECENT_TOPIC_PRIORITY = 0.85d;
    private static final double W_HISTORY_FALLBACK = 0.15d;

    private boolean isUser(Identity identity) {
        return identity != null && "USER".equals(identity.getType()) && identity.getId() != null && !identity.getId().isBlank();
    }

    private boolean isGuest(Identity identity) {
        return identity != null && "GUEST".equals(identity.getType()) && identity.getId() != null && !identity.getId().isBlank();
    }

    public ApiResponse<RecommendedCoursePageResponse> getTopCoursesForUser(Identity identity,
                                                                           String courseId,
                                                                           String tag,
                                                                           Integer page,
                                                                           Integer size) {
        int pageSize = normalizeSize(size);
        int pageNumber = normalizePage(page);
        int offset = Math.multiplyExact(pageNumber, pageSize);

        String userId = identity.getId();
        boolean isUser = isUser(identity);
        boolean isGuest = isGuest(identity);
        String subjectType = isUser ? "USER" : (isGuest ? "GUEST" : null);

        Map<String, Object> source = trackingEventIndexService.getSignalsSource(subjectType, userId);

        // IMPORTANT:
        // Build a stable ranked list independent from requested page size.
        // We rank from a candidate pool sized on the requested pageSize, then do limit-based pagination.
        int desiredTotal = pageSize * (pageNumber + 1);
        List<RecommendedCourseItem> all = buildRankedRecommendations(source, subjectType, userId, courseId, tag, desiredTotal, pageSize);

        int from = Math.min(offset, all.size());
        int to = Math.min(from + pageSize, all.size());
        List<RecommendedCourseItem> items = all.subList(from, to);

        return ApiResponse.<RecommendedCoursePageResponse>builder()
                .code(200)
                .result(RecommendedCoursePageResponse.builder()
                        .items(items)
                        .nextCursor(null)
                        .build())
                .build();
    }

    private int normalizeSize(Integer size) {
        int s = (size == null) ? 20 : size;
        if (s < 1) s = 1;
        if (s > MAX_SIZE) s = MAX_SIZE;
        return s;
    }

    private int normalizePage(Integer page) {
        int p = (page == null) ? 0 : page;
        return Math.max(0, p);
    }

    private static String normalizeTag(String raw) {
        if (raw == null) return null;
        String t = raw.trim().toLowerCase();
        return t.isBlank() ? null : t;
    }

    private static String trimTag(String raw) {
        if (raw == null) return null;
        String t = raw.trim();
        return t.isBlank() ? null : t;
    }

    private List<RecommendedCourseItem> buildRankedRecommendations(Map<String, Object> source,
                                                                   String subjectType,
                                                                   String subjectId,
                                                                   String preferredCourseId,
                                                                   String preferredTag,
                                                                   int desiredTotal,
                                                                   int requestSize) {
        desiredTotal = Math.min(Math.max(desiredTotal, 0), 500);
        if (desiredTotal == 0) return List.of();

        Map<String, Double> courseScore = extractCourseScore(source);
        Map<String, Double> tagScoreNormalizedKeys = extractTagScore(source);
        Map<String, Double> tagScoreRawKeys = extractTagScoreRaw(source);
        Map<String, Double> categoryScoreNormalizedKeys = extractCategoryScore(source);
        Map<String, Double> categoryScoreRawKeys = extractCategoryScoreRaw(source);
        Map<String, Double> keywordScoreRawKeys = extractKeywordScoreRaw(source);

        String lastCourseId = extractLastCourseId(source);
        Instant lastSeenAt = extractLastSeenAt(source);
        List<String> lastCategories = extractLastCategories(source);

        List<String> courseScoreIds = courseScore.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(200)
                .map(Map.Entry::getKey)
                .filter(Objects::nonNull)
                .toList();

        List<String> tagScoreTagsRaw = buildTopTagsForSearch(tagScoreRawKeys, trimTag(preferredTag));
        List<String> categorySignals = buildTopSignalsForSearch(categoryScoreRawKeys, null);
        List<String> keywordSignals = buildTopSignalsForSearch(keywordScoreRawKeys, null);

        RecentIntent recentIntent = loadRecentIntent(subjectType, subjectId);
        if (recentIntent.hasRecentActivity()) {
            tagScoreTagsRaw = mergeTopSignals(recentIntent.topTags(), tagScoreTagsRaw, 30);
            categorySignals = mergeTopSignals(recentIntent.topCategories(), categorySignals, 30);
            keywordSignals = mergeTopSignals(recentIntent.topKeywords(), keywordSignals, 30);
        }

        if (!lastCategories.isEmpty()) {
            categorySignals = mergeTopSignals(categorySignals, lastCategories, 20);
        }

        List<String> lastCourseTags = fetchTagsForCourseId(lastCourseId);
        List<String> lastCourseTagsNormalized = lastCourseTags.stream()
                .map(CourseRecommendationService::normalizeTag)
                .filter(Objects::nonNull)
                .toList();

        // Key fix:
        // Candidate pool size must be largely independent from requestSize to avoid missing high-score items
        // when `size` is small.
        int base = Math.max(requestSize, 10);
        int candidateSize = Math.min(500, Math.max(MIN_CANDIDATES, base * CANDIDATE_MULTIPLIER));

        // Exclude the currently-viewed course (if client passes courseId) so we don't recommend it back.
        List<String> excludeIds = new ArrayList<>();
        if (preferredCourseId != null && !preferredCourseId.isBlank()) excludeIds.add(preferredCourseId);

        List<Map<String, Object>> candidateHits = courseIndexService.searchCandidateCourses(
                // Ensure we always include courseScore candidates in the ES pool so they get proper scoring
                // (otherwise they might be missing tags and end up with a weak computed score).
                courseScoreIds,
                tagScoreTagsRaw,
                lastCourseTags,
                categorySignals,
            keywordSignals,
                candidateSize,
                excludeIds,
                true
        );

        // Guarantee enough tag-driven candidates even if match_all fills the pool.
        if (!tagScoreTagsRaw.isEmpty()) {
            int tagMatchesInPool = countTagMatches(candidateHits, tagScoreNormalizedKeys);
            int minRequired = Math.min(MIN_TAG_CANDIDATES, candidateSize / 2);
            if (tagMatchesInPool < minRequired) {
                int extraSize = Math.min(400, candidateSize);
                List<Map<String, Object>> extraTag = courseIndexService.searchCandidateCourses(
                        List.of(),
                        tagScoreTagsRaw,
                        List.of(),
                    categorySignals,
                    keywordSignals,
                        extraSize,
                        excludeIds,
                        false
                );
                if (!extraTag.isEmpty()) {
                    candidateHits = mergeCandidateHits(candidateHits, extraTag, candidateSize);
                }
            }
        }

        double maxPossibleTagMatch = computeMaxPossibleTagMatch(tagScoreNormalizedKeys);
        double maxPossibleCategoryMatch = computeMaxPossibleCategoryMatch(categoryScoreNormalizedKeys);
        double recencyBase = computeRecencyScore(lastSeenAt, Instant.now());

        double maxEsScore = computeMaxEsScore(candidateHits);

        Map<String, Double> recentRawByCourseId = new HashMap<>();
        double maxRecentRaw = 0d;
        if (recentIntent.hasRecentActivity()) {
            for (Map<String, Object> h : candidateHits) {
                String cId = extractCourseIdFromCourseDoc(h);
                if (cId == null || cId.isBlank()) continue;

                List<String> tags = toStringList(h.get("tags"));
                String category = firstString(h.get("category"));
                double recentRaw = computeRecentIntentMatchScore(tags, category, h, recentIntent);
                recentRawByCourseId.put(cId, recentRaw);
                if (recentRaw > maxRecentRaw) maxRecentRaw = recentRaw;
            }
        }

        Map<String, RecommendedCourseItem> byCourseId = new HashMap<>();

        // Seed with explicit courseScore ids (in case ES returns none).
        for (String csId : courseScoreIds) {
            if (csId == null || csId.isBlank()) continue;
            double popularityScore = 0.5;
                double historicalScore = computeFinalScore(
                    List.of(),
                    null,
                    csId,
                    courseScore,
                    tagScoreNormalizedKeys,
                    categoryScoreNormalizedKeys,
                    maxPossibleTagMatch,
                    maxPossibleCategoryMatch,
                    lastCourseTagsNormalized,
                    recencyBase,
                    popularityScore,
                    0d,
                    maxEsScore
            );
                    double recentRaw = recentRawByCourseId.getOrDefault(csId, 0d);
                    double score = blendWithRecentIntent(historicalScore, recentRaw, maxRecentRaw, recentIntent.hasRecentActivity());
            byCourseId.putIfAbsent(csId, RecommendedCourseItem.builder()
                    .courseId(csId)
                    .score(score)
                        .reason(recentRaw > 0d ? "recentTopic" : "courseScore")
                    .build());
        }

        for (Map<String, Object> h : candidateHits) {
            String cId = extractCourseIdFromCourseDoc(h);
            if (cId == null || cId.isBlank()) continue;

            List<String> tags = toStringList(h.get("tags"));
            String category = firstString(h.get("category"));
            double esScore = firstDoubleOrDefault(h.get("_esScore"), 0d);
            String reason = deriveReason(cId, tags, category,
                    courseScore, tagScoreNormalizedKeys, categoryScoreNormalizedKeys, keywordSignals, h, lastCourseTags,
                    recentIntent, recentRawByCourseId.getOrDefault(cId, 0d));

            double popularityScore = 0.5;
                double historicalScore = computeFinalScore(
                    tags,
                    category,
                    cId,
                    courseScore,
                    tagScoreNormalizedKeys,
                    categoryScoreNormalizedKeys,
                    maxPossibleTagMatch,
                    maxPossibleCategoryMatch,
                    lastCourseTagsNormalized,
                    recencyBase,
                    popularityScore,
                    esScore,
                    maxEsScore
            );
                    double recentRaw = recentRawByCourseId.getOrDefault(cId, 0d);
                    double score = blendWithRecentIntent(historicalScore, recentRaw, maxRecentRaw, recentIntent.hasRecentActivity());

            RecommendedCourseItem existing = byCourseId.get(cId);
            if (existing == null || score > existing.getScore()) {
                byCourseId.put(cId, RecommendedCourseItem.builder()
                        .courseId(cId)
                        .score(score)
                        .reason(reason)
                        .build());
            }
        }

        List<RecommendedCourseItem> ranked = new ArrayList<>(byCourseId.values());
        ranked.sort((a, b) -> {
            int cmp = Double.compare(b.getScore(), a.getScore());
            if (cmp != 0) return cmp;
            int reasonCmp = Integer.compare(reasonRank(a.getReason()), reasonRank(b.getReason()));
            if (reasonCmp != 0) return reasonCmp;
            return a.getCourseId().compareTo(b.getCourseId());
        });

        if (ranked.size() > desiredTotal) {
            ranked = ranked.subList(0, desiredTotal);
        }

        return ranked;
    }

    private static double blendWithRecentIntent(double historicalScore,
                                                double recentRawScore,
                                                double maxRecentRaw,
                                                boolean hasRecentIntent) {
        if (!hasRecentIntent) return historicalScore;

        double recentNormalized = normalize01(recentRawScore, maxRecentRaw <= 0d ? 1d : maxRecentRaw);
        return (W_RECENT_TOPIC_PRIORITY * recentNormalized) + (W_HISTORY_FALLBACK * historicalScore);
    }

    private RecentIntent loadRecentIntent(String subjectType, String subjectId) {
        if (subjectType == null || subjectType.isBlank() || subjectId == null || subjectId.isBlank()) {
            return RecentIntent.empty();
        }

        String stream = "USER".equals(subjectType) ? "event:user" : "event:guest";
        List<MapRecord<String, Object, Object>> records;

        try {
            records = redis.opsForStream().range(stream, Range.unbounded());
        } catch (Exception ignored) {
            return RecentIntent.empty();
        }

        if (records == null || records.isEmpty()) return RecentIntent.empty();

        long nowMs = System.currentTimeMillis();
        long minTs = nowMs - RECENT_WINDOW_MS;
        int scanned = 0;

        List<RecentEventSignal> recentEvents = new ArrayList<>();
        for (int i = records.size() - 1; i >= 0; i--) {
            if (scanned >= RECENT_EVENT_SCAN_LIMIT) break;
            scanned++;

            MapRecord<String, Object, Object> record = records.get(i);
            if (record == null || record.getValue() == null) continue;

            Map<Object, Object> value = record.getValue();
            String uid = firstString(value.get("userId"));
            if (uid == null || !uid.equals(subjectId)) continue;

            long ts = toLongOrDefault(value.get("createdAt"), 0L);
            if (ts <= 0L || ts < minTs) {
                if (!recentEvents.isEmpty()) break;
                continue;
            }

            List<String> categories = splitCsvNormalized(firstString(value.get("category")));
            List<String> tags = splitCsvNormalized(firstString(value.get("tag")));
            List<String> keywords = extractKeywordsFromPayload(value.get("payload"));

            // Fallback to tag/category tokens in payload if explicit fields are missing.
            if (categories.isEmpty() || tags.isEmpty() || keywords.isEmpty()) {
                Map<String, Object> payloadMap = parsePayloadMap(firstString(value.get("payload")));
                if (categories.isEmpty()) {
                    categories = mergeTopSignals(categories,
                            splitCsvNormalized(firstString(payloadMap.get("category"))), 10);
                }
                if (tags.isEmpty()) {
                    tags = mergeTopSignals(tags,
                            splitCsvNormalized(firstString(payloadMap.get("tag"))), 10);
                }
                if (keywords.isEmpty()) {
                    keywords = mergeTopSignals(keywords,
                            splitCsvNormalized(firstString(payloadMap.get("longDes"))), 10);
                }
            }

            if (categories.isEmpty() && tags.isEmpty() && keywords.isEmpty()) continue;

            recentEvents.add(new RecentEventSignal(ts, categories, tags, keywords));
            if (recentEvents.size() >= RECENT_EVENT_KEEP) break;
        }

        if (recentEvents.isEmpty()) return RecentIntent.empty();

        Map<String, Double> categoryWeights = new HashMap<>();
        Map<String, Double> tagWeights = new HashMap<>();
        Map<String, Double> keywordWeights = new HashMap<>();

        for (int i = 0; i < recentEvents.size(); i++) {
            RecentEventSignal event = recentEvents.get(i);
            double weight = eventWeightByRecencyIndex(i);

            for (String c : event.categories()) {
                String normalized = normalizeTag(c);
                if (normalized != null) categoryWeights.merge(normalized, weight, Double::sum);
            }

            for (String t : event.tags()) {
                String normalized = normalizeTag(t);
                if (normalized != null) tagWeights.merge(normalized, weight, Double::sum);
            }

            for (String k : event.keywords()) {
                String normalized = normalizeTag(k);
                if (normalized != null) keywordWeights.merge(normalized, weight, Double::sum);
            }
        }

        return new RecentIntent(recentEvents, categoryWeights, tagWeights, keywordWeights);
    }

    private static double eventWeightByRecencyIndex(int index) {
        if (index <= 0) return LATEST_EVENT_WEIGHT;
        if (index <= 2) return MID_EVENT_WEIGHT;
        return OLDER_EVENT_WEIGHT;
    }

    private static double computeRecentIntentMatchScore(List<String> courseTags,
                                                        String category,
                                                        Map<String, Object> courseDoc,
                                                        RecentIntent recentIntent) {
        if (recentIntent == null || !recentIntent.hasRecentActivity()) return 0d;

        double score = 0d;

        String normalizedCategory = normalizeTag(category);
        if (normalizedCategory != null) {
            double categoryWeight = recentIntent.categoryWeights().getOrDefault(normalizedCategory, 0d);
            score += (categoryWeight * RECENT_CATEGORY_MATCH_SCORE);
        }

        if (courseTags != null && !courseTags.isEmpty()) {
            LinkedHashSet<String> uniqueTags = new LinkedHashSet<>();
            for (String t : courseTags) {
                String normalizedTag = normalizeTag(t);
                if (normalizedTag != null) uniqueTags.add(normalizedTag);
            }
            for (String tag : uniqueTags) {
                double tagWeight = recentIntent.tagWeights().getOrDefault(tag, 0d);
                score += (tagWeight * RECENT_TAG_MATCH_SCORE);
            }
        }

        String title = normalizeTextForMatch(firstString(courseDoc.get("title")));
        String shortDescription = normalizeTextForMatch(firstString(courseDoc.get("shortDescription")));
        String longDescription = normalizeTextForMatch(firstString(courseDoc.get("longDescription")));

        for (Map.Entry<String, Double> e : recentIntent.keywordWeights().entrySet()) {
            String kw = e.getKey();
            if (kw == null || kw.isBlank()) continue;
            boolean matched = (title != null && title.contains(kw))
                    || (shortDescription != null && shortDescription.contains(kw))
                    || (longDescription != null && longDescription.contains(kw));
            if (matched) {
                score += (e.getValue() * RECENT_KEYWORD_MATCH_SCORE);
            }
        }

        return score;
    }

    private static long toLongOrDefault(Object raw, long fallback) {
        if (raw == null) return fallback;
        try {
            return Long.parseLong(raw.toString());
        } catch (Exception ignored) {
            return fallback;
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> parsePayloadMap(String payloadRaw) {
        if (payloadRaw == null || payloadRaw.isBlank()) return Map.of();
        try {
            Map<String, Object> parsed = OBJECT_MAPPER.readValue(payloadRaw, new TypeReference<>() {
            });
            return parsed == null ? Map.of() : parsed;
        } catch (Exception ignored) {
            return Map.of();
        }
    }

    private static List<String> extractKeywordsFromPayload(Object payloadRaw) {
        Map<String, Object> payload = parsePayloadMap(firstString(payloadRaw));
        if (payload.isEmpty()) return List.of();

        return mergeTopSignals(
                splitCsvNormalized(firstString(payload.get("longDes"))),
                splitCsvNormalized(firstString(payload.get("longDescription"))),
                20
        );
    }

    private static int countTagMatches(List<Map<String, Object>> candidates, Map<String, Double> tagScore) {
        if (candidates == null || candidates.isEmpty()) return 0;
        if (tagScore == null || tagScore.isEmpty()) return 0;

        int count = 0;
        for (Map<String, Object> h : candidates) {
            List<String> tags = toStringList(h.get("tags"));
            if (computeTagMatchSum(tags, tagScore) > 0) count++;
        }
        return count;
    }

    /**
     * finalScore combines normalized behavior signals and retrieval relevance.
     */
    private static double computeFinalScore(List<String> courseTags,
                                            String category,
                                            String courseId,
                                            Map<String, Double> courseScore,
                                            Map<String, Double> tagScore,
                                            Map<String, Double> categoryScore,
                                            double maxPossibleTagMatch,
                                            double maxPossibleCategoryMatch,
                                            List<String> lastCourseTagsNormalized,
                                            double recencyScore,
                                            double popularityScore,
                                            double esScore,
                                            double maxEsScore) {
        double rawCourseScore = (courseScore == null || courseId == null) ? 0d : courseScore.getOrDefault(courseId, 0d);
        double courseScoreNormalized = dampenCourseAffinity(rawCourseScore);

        double tagMatchSum = computeTagMatchSum(courseTags, tagScore);
        double tagMatchNormalized = normalize01(tagMatchSum, maxPossibleTagMatch);

        double categoryMatchSum = computeCategoryMatch(category, categoryScore);
        double categoryMatchNormalized = normalize01(categoryMatchSum, maxPossibleCategoryMatch);

        double similarity = computeJaccardSimilarity(courseTags, lastCourseTagsNormalized);
        double esRelevance = normalize01(esScore, maxEsScore);

        double recency = clamp01(recencyScore);
        double popularity = clamp01(popularityScore);

        double base = (W_COURSE_SCORE * courseScoreNormalized)
                + (W_TAG_MATCH * tagMatchNormalized)
                + (W_CATEGORY_MATCH * categoryMatchNormalized)
                + (W_SIMILARITY * similarity)
                + (W_ES_RELEVANCE * esRelevance)
                + (W_RECENCY * recency)
                + (W_POPULARITY * popularity);

        return base;
    }

    private static double dampenCourseAffinity(double rawCourseScore) {
        if (rawCourseScore <= 0d) return 0d;
        return clamp01(rawCourseScore / (rawCourseScore + 4d));
    }

    /** Sum tagScore for tags present in the course. */
    private static double computeTagMatchSum(List<String> courseTags, Map<String, Double> tagScore) {
        if (tagScore == null || tagScore.isEmpty()) return 0d;
        if (courseTags == null || courseTags.isEmpty()) return 0d;

        double sum = 0d;
        for (String tRaw : courseTags) {
            String t = normalizeTag(tRaw);
            if (t == null) continue;
            sum += tagScore.getOrDefault(t, 0d);
        }
        return sum;
    }

    /**
     * Normalize tagMatchScore. A pragmatic max bound is sum of top N tag scores.
     * Keeps tagMatch in 0..1 and avoids domination.
     */
    private static double computeMaxPossibleTagMatch(Map<String, Double> tagScore) {
        if (tagScore == null || tagScore.isEmpty()) return 1d;

        return tagScore.values().stream()
                .sorted(Comparator.reverseOrder())
                .limit(10)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    private static double computeMaxPossibleCategoryMatch(Map<String, Double> categoryScore) {
        if (categoryScore == null || categoryScore.isEmpty()) return 1d;

        return categoryScore.values().stream()
                .sorted(Comparator.reverseOrder())
                .limit(5)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    private static double computeCategoryMatch(String category, Map<String, Double> categoryScore) {
        if (categoryScore == null || categoryScore.isEmpty()) return 0d;
        String normalized = normalizeTag(category);
        if (normalized == null) return 0d;
        return categoryScore.getOrDefault(normalized, 0d);
    }

    private static double computeMaxEsScore(List<Map<String, Object>> candidateHits) {
        if (candidateHits == null || candidateHits.isEmpty()) return 1d;
        double max = 0d;
        for (Map<String, Object> h : candidateHits) {
            double score = firstDoubleOrDefault(h.get("_esScore"), 0d);
            if (score > max) max = score;
        }
        return max <= 0d ? 1d : max;
    }

    /** Similarity between candidate tags and last course tags (0..1). */
    private static double computeJaccardSimilarity(List<String> courseTags, List<String> lastCourseTagsNormalized) {
        if (courseTags == null || courseTags.isEmpty()) return 0d;
        if (lastCourseTagsNormalized == null || lastCourseTagsNormalized.isEmpty()) return 0d;

        Set<String> a = new HashSet<>();
        for (String t : courseTags) {
            String n = normalizeTag(t);
            if (n != null) a.add(n);
        }
        if (a.isEmpty()) return 0d;

        Set<String> b = new HashSet<>(lastCourseTagsNormalized);

        int intersection = 0;
        for (String x : a) {
            if (b.contains(x)) intersection++;
        }

        int union = a.size() + b.size() - intersection;
        if (union <= 0) return 0d;

        return clamp01((double) intersection / (double) union);
    }

    /**
     * Convert lastSeenAt to recency score.
     * <1 day: 1.0
     * <7 days: 0.8
     * <30 days: 0.5
     * >=30 days: 0.2
     */
    private static double computeRecencyScore(Instant lastSeenAt, Instant now) {
        if (lastSeenAt == null || now == null) return 0.3; // neutral-ish default

        long days = Math.max(0, Duration.between(lastSeenAt, now).toDays());

        if (days < 1) return 1.0;
        if (days < 7) return 0.8;
        if (days < 30) return 0.5;
        return 0.2;
    }

    private static double normalize01(double value, double max) {
        if (max <= 0) return 0d;
        return clamp01(value / max);
    }

    private static double clamp01(double v) {
        if (Double.isNaN(v) || Double.isInfinite(v)) return 0d;
        if (v < 0d) return 0d;
        if (v > 1d) return 1d;
        return v;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> extractCourseScore(Map<String, Object> source) {
        if (source == null) return Map.of();

        Map<String, Double> courseScore = new HashMap<>();
        Object csObj = source.get("courseScore");
        if (csObj instanceof List<?> list) {
            for (Object o : list) {
                if (!(o instanceof Map<?, ?> m)) continue;

                String id = firstString(m.get("courseId"));
                Double sc = firstDouble(m.get("score"));
                if (id == null || sc == null) continue;
                courseScore.put(id, sc);
            }
        }
        return courseScore;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> extractTagScore(Map<String, Object> source) {
        if (source == null) return Map.of();

        Map<String, Double> tagScore = new HashMap<>();
        Object tsObj = source.get("tagScore");
        if (tsObj instanceof List<?> list) {
            for (Object o : list) {
                if (!(o instanceof Map<?, ?> m)) continue;

                String tag = normalizeTag(firstString(m.get("tag")));
                Double sc = firstDouble(m.get("score"));
                if (tag == null || sc == null) continue;
                tagScore.put(tag, sc);
            }
        }
        return tagScore;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> extractTagScoreRaw(Map<String, Object> source) {
        if (source == null) return Map.of();

        Map<String, Double> tagScore = new HashMap<>();
        Object tsObj = source.get("tagScore");
        if (tsObj instanceof List<?> list) {
            for (Object o : list) {
                if (!(o instanceof Map<?, ?> m)) continue;

                String tag = trimTag(firstString(m.get("tag")));
                Double sc = firstDouble(m.get("score"));
                if (tag == null || sc == null) continue;
                tagScore.put(tag, sc);
            }
        }
        return tagScore;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> extractCategoryScore(Map<String, Object> source) {
        if (source == null) return Map.of();

        Map<String, Double> categoryScore = new HashMap<>();
        Object catObj = source.get("categoryScore");
        if (catObj instanceof List<?> list) {
            for (Object o : list) {
                if (!(o instanceof Map<?, ?> m)) continue;

                String category = normalizeTag(firstString(m.get("category")));
                Double sc = firstDouble(m.get("score"));
                if (category == null || sc == null) continue;
                categoryScore.put(category, sc);
            }
        }
        return categoryScore;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> extractCategoryScoreRaw(Map<String, Object> source) {
        if (source == null) return Map.of();

        Map<String, Double> categoryScore = new HashMap<>();
        Object catObj = source.get("categoryScore");
        if (catObj instanceof List<?> list) {
            for (Object o : list) {
                if (!(o instanceof Map<?, ?> m)) continue;

                String category = trimTag(firstString(m.get("category")));
                Double sc = firstDouble(m.get("score"));
                if (category == null || sc == null) continue;
                categoryScore.put(category, sc);
            }
        }
        return categoryScore;
    }

    private static List<String> extractLastCategories(Map<String, Object> source) {
        return extractLastActionSignal(source, "lastCategory");
    }

    @SuppressWarnings("unchecked")
    private static List<String> extractLastActionSignal(Map<String, Object> source, String key) {
        if (source == null || key == null || key.isBlank()) return List.of();

        Object v = source.get("lastAction." + key);
        if (v != null) {
            return splitCsvNormalized(firstString(v));
        }

        Object lastAction = source.get("lastAction");
        if (lastAction instanceof Map<?, ?> m) {
            return splitCsvNormalized(firstString(m.get(key)));
        }

        return List.of();
    }

    @SuppressWarnings("unchecked")
    private static String extractLastCourseId(Map<String, Object> source) {
        if (source == null) return null;

        Object v = source.get("lastAction.lastCourseId");
        if (v != null) {
            String s = firstString(v);
            if (s != null && !s.isBlank()) return s;
        }

        Object lastAction = source.get("lastAction");
        if (lastAction instanceof Map<?, ?> m) {
            String s = firstString(m.get("lastCourseId"));
            if (s != null && !s.isBlank()) return s;
        }

        return null;
    }

    @SuppressWarnings("unchecked")
    private static Instant extractLastSeenAt(Map<String, Object> source) {
        if (source == null) return null;

        Object v = source.get("lastAction.lastSeenAtMs");
        if (v == null) {
            Object lastAction = source.get("lastAction");
            if (lastAction instanceof Map<?, ?> m) {
                v = m.get("lastSeenAtMs");
            }
        }

        if (v == null) return null;

        String raw = firstString(v);
        if (raw == null || raw.isBlank()) return null;

        try {
            return Instant.parse(raw);
        } catch (Exception ignored) {
        }

        try {
            long epochMs = Long.parseLong(raw);
            return Instant.ofEpochMilli(epochMs);
        } catch (Exception ignored) {
            return null;
        }
    }

    private List<String> fetchTagsForCourseId(String courseId) {
        if (courseId == null || courseId.isBlank()) return List.of();

        // Query ES by id to retrieve tags of the last course.
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

        if (hits.isEmpty()) return List.of();
        return toStringList(hits.getFirst().get("tags"));
    }

    private static List<String> buildTopTagsForSearch(Map<String, Double> tagScore, String preferredTag) {
        LinkedHashSet<String> out = new LinkedHashSet<>();
        if (preferredTag != null) out.add(preferredTag);

        tagScore.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(20)
                .forEach(e -> {
                    if (e.getKey() != null && !e.getKey().isBlank()) out.add(e.getKey());
                });

        return new ArrayList<>(out);
    }

    private static List<String> buildTopSignalsForSearch(Map<String, Double> scoreMap, String preferred) {
        LinkedHashSet<String> out = new LinkedHashSet<>();
        if (preferred != null && !preferred.isBlank()) out.add(preferred);
        if (scoreMap == null || scoreMap.isEmpty()) return new ArrayList<>(out);

        scoreMap.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(20)
                .forEach(e -> {
                    if (e.getKey() != null && !e.getKey().isBlank()) out.add(e.getKey());
                });

        return new ArrayList<>(out);
    }

    private static List<String> mergeTopSignals(List<String> primary, List<String> secondary, int limit) {
        LinkedHashSet<String> out = new LinkedHashSet<>();
        if (primary != null) out.addAll(primary);
        if (secondary != null) {
            for (String s : secondary) {
                if (s == null || s.isBlank()) continue;
                out.add(s);
                if (out.size() >= limit) break;
            }
        }

        if (out.size() <= limit) return new ArrayList<>(out);
        return new ArrayList<>(out).subList(0, limit);
    }

    private static String extractCourseIdFromCourseDoc(Map<String, Object> courseSource) {
        if (courseSource == null) return null;
        String courseId = firstString(courseSource.get("courseId"));
        if (courseId != null && !courseId.isBlank()) return courseId;

        return firstString(courseSource.get("id"));
    }

    private static String firstString(Object v) {
        if (v == null) return null;
        if (v instanceof String s) return s;

        if (v instanceof List<?> list && !list.isEmpty() && list.getFirst() != null) {
            return list.getFirst().toString();
        }
        return v.toString();
    }

    private static Double firstDouble(Object v) {
        if (v == null) return null;
        if (v instanceof Number n) return n.doubleValue();
        if (v instanceof List<?> list && !list.isEmpty() && list.getFirst() != null) {
            try {
                return Double.parseDouble(list.getFirst().toString());
            } catch (Exception ignored) {
                return null;
            }
        }
        try {
            return Double.parseDouble(v.toString());
        } catch (Exception ignored) {
            return null;
        }
    }

    private static double firstDoubleOrDefault(Object v, double defaultValue) {
        Double d = firstDouble(v);
        return d == null ? defaultValue : d;
    }

    private static List<String> splitCsvNormalized(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        String[] parts = raw.split(",");
        LinkedHashSet<String> out = new LinkedHashSet<>();
        for (String p : parts) {
            if (p == null) continue;
            String normalized = normalizeTag(p);
            if (normalized != null) out.add(normalized);
        }
        return new ArrayList<>(out);
    }

    private static List<String> toStringList(Object v) {
        if (v == null) return List.of();
        if (v instanceof List<?> list) {
            List<String> out = new ArrayList<>();
            for (Object o : list) {
                if (o == null) continue;
                out.add(o.toString());
            }
            return out;
        }
        if (v instanceof String s) return List.of(s);
        return List.of();
    }

    private static List<Map<String, Object>> mergeCandidateHits(List<Map<String, Object>> a,
                                                               List<Map<String, Object>> b,
                                                               int limit) {
        if (limit <= 0) return List.of();

        LinkedHashMap<String, Map<String, Object>> dedup = new LinkedHashMap<>();
        if (a != null) {
            for (Map<String, Object> h : a) {
                String id = extractCourseIdFromCourseDoc(h);
                if (id != null) dedup.putIfAbsent(id, h);
                if (dedup.size() >= limit) return new ArrayList<>(dedup.values());
            }
        }

        if (b != null) {
            for (Map<String, Object> h : b) {
                String id = extractCourseIdFromCourseDoc(h);
                if (id != null) dedup.putIfAbsent(id, h);
                if (dedup.size() >= limit) break;
            }
        }

        return new ArrayList<>(dedup.values());
    }

    private static String deriveReason(String courseId,
                                       List<String> tags,
                                       String category,
                                       Map<String, Double> courseScore,
                                       Map<String, Double> tagScore,
                                       Map<String, Double> categoryScore,
                                       List<String> keywordSignals,
                                       Map<String, Object> courseDoc,
                                       List<String> lastCourseTags,
                                       RecentIntent recentIntent,
                                       double recentRawScore) {
        if (recentIntent != null && recentIntent.hasRecentActivity() && recentRawScore > 0d) return "recentTopic";

        if (courseScore != null && courseScore.containsKey(courseId)) return "courseScore";

        if (computeCategoryMatch(category, categoryScore) > 0) return "categoryScore";

        double tagRel = computeTagMatchSum(tags, tagScore);
        if (tagRel > 0) return "tagScore";

        if (hasKeywordMatch(courseDoc, keywordSignals)) return "keywordScore";

        if (lastCourseTags != null && !lastCourseTags.isEmpty() && tags != null) {
            for (String t : tags) {
                if (t == null) continue;
                if (lastCourseTags.contains(t)) return "lastCourseTags";
            }
        }

        return "popular";
    }

    @SuppressWarnings("unchecked")
    private Map<String, Double> extractKeywordScoreRaw(Map<String, Object> source) {
        if (source == null) return Map.of();

        Map<String, Double> keywordScore = new HashMap<>();
        Object kwObj = source.get("keywordScore");
        if (kwObj instanceof List<?> list) {
            for (Object o : list) {
                if (!(o instanceof Map<?, ?> m)) continue;

                String keyword = trimTag(firstString(m.get("keyword")));
                Double sc = firstDouble(m.get("score"));
                if (keyword == null || sc == null) continue;
                keywordScore.put(keyword, sc);
            }
        }
        return keywordScore;
    }

    private static boolean hasKeywordMatch(Map<String, Object> courseDoc, List<String> keywordSignals) {
        if (courseDoc == null || keywordSignals == null || keywordSignals.isEmpty()) return false;

        String title = normalizeTextForMatch(firstString(courseDoc.get("title")));
        String shortDescription = normalizeTextForMatch(firstString(courseDoc.get("shortDescription")));
        String longDescription = normalizeTextForMatch(firstString(courseDoc.get("longDescription")));

        for (String kw : keywordSignals) {
            String normalizedKw = normalizeTextForMatch(kw);
            if (normalizedKw == null || normalizedKw.isBlank()) continue;
            if ((title != null && title.contains(normalizedKw))
                    || (shortDescription != null && shortDescription.contains(normalizedKw))
                    || (longDescription != null && longDescription.contains(normalizedKw))) {
                return true;
            }
        }

        return false;
    }

    private static String normalizeTextForMatch(String raw) {
        if (raw == null) return null;
        String out = raw.trim().toLowerCase(Locale.ROOT);
        return out.isBlank() ? null : out;
    }

    private static int reasonRank(String reason) {
        if (reason == null) return 99;
        return switch (reason) {
            case "recentTopic" -> 1;
            case "courseScore" -> 2;
            case "categoryScore" -> 3;
            case "tagScore" -> 4;
            case "keywordScore" -> 5;
            case "lastCourseTags" -> 6;
            default -> 99;
        };
    }

    private record RecentEventSignal(long timestampMs,
                                     List<String> categories,
                                     List<String> tags,
                                     List<String> keywords) {
    }

    private record RecentIntent(List<RecentEventSignal> events,
                                Map<String, Double> categoryWeights,
                                Map<String, Double> tagWeights,
                                Map<String, Double> keywordWeights) {
        static RecentIntent empty() {
            return new RecentIntent(List.of(), Map.of(), Map.of(), Map.of());
        }

        boolean hasRecentActivity() {
            return events != null && !events.isEmpty();
        }

        List<String> topCategories() {
            return topSignals(categoryWeights, 20);
        }

        List<String> topTags() {
            return topSignals(tagWeights, 20);
        }

        List<String> topKeywords() {
            return topSignals(keywordWeights, 20);
        }

        private static List<String> topSignals(Map<String, Double> weightMap, int limit) {
            if (weightMap == null || weightMap.isEmpty()) return List.of();
            return weightMap.entrySet().stream()
                    .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                    .limit(Math.max(1, limit))
                    .map(Map.Entry::getKey)
                    .filter(Objects::nonNull)
                    .filter(s -> !s.isBlank())
                    .toList();
        }
    }
}
