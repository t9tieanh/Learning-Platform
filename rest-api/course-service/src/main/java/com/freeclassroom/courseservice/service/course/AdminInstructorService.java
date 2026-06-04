package com.freeclassroom.courseservice.service.course;

import com.example.grpc.user.AdminInstructorSummaryProfile;
import com.example.grpc.user.Expertise;
import com.example.grpc.user.Teacher;
import com.example.grpc.user.TopCourseRevenueItem;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.admin.*;
import com.freeclassroom.courseservice.dto.response.course.instructor.LearnerAnalyticsResponse;
import com.freeclassroom.courseservice.grpc.client.SaleGrpcClient;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminInstructorService implements IAdminInstructorService {
    private static final long LIST_CACHE_TTL_MILLIS = 30_000L;
    private static final int SEARCH_BATCH_LIMIT = 100;

    CourseRepository courseRepository;
    UserGrpcClient userGrpcClient;
    SaleGrpcClient saleGrpcClient;
    ICourseInstructorAnalyticsService instructorAnalyticsService;

    private final Map<String, CacheEntry<AdminInstructorListResponse>> listCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry<List<String>>> instructorIdsCache = new ConcurrentHashMap<>();

    private record CacheEntry<T>(T value, long expiresAt) {}

    @Override
    public ApiResponse<AdminInstructorListResponse> getAdminInstructors(
            int page,
            int limit,
            String search,
            String sort,
            String courseRange
    ) {
        long startedAt = System.currentTimeMillis();
        int normalizedPage = Math.max(page, 1);
        int normalizedLimit = Math.min(Math.max(limit, 1), 20);
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase();

        if ("courses_desc".equalsIgnoreCase(sort) || "courses_asc".equalsIgnoreCase(sort)) {
            var fastResult = getAdminInstructorsFastPath(normalizedPage, normalizedLimit, sort, courseRange);
            log.info("Admin instructor list fast-path page={} limit={} sort={} took={}ms",
                    normalizedPage, normalizedLimit, sort, System.currentTimeMillis() - startedAt);
            return fastResult;
        }

        var searchResult = getAdminInstructorsSearchPath(normalizedPage, normalizedLimit, normalizedSearch, sort, courseRange);
        log.info("Admin instructor list search-path page={} limit={} sort={} courseRange={} took={}ms",
                normalizedPage, normalizedLimit, sort, courseRange, System.currentTimeMillis() - startedAt);
        return searchResult;
    }

    private ApiResponse<AdminInstructorListResponse> getAdminInstructorsFastPath(int page, int limit, String sort, String courseRangeValue) {
        String cacheKey = buildListCacheKey(page, limit, sort, courseRangeValue);
        AdminInstructorListResponse cached = getValidListCache(cacheKey);
        if (cached != null) {
            return ApiResponse.<AdminInstructorListResponse>builder()
                    .code(HttpStatus.OK.value())
                    .message("Get admin instructors success")
                    .result(cached)
                    .build();
        }

        long queryStartedAt = System.currentTimeMillis();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page - 1, limit + 1);
        CourseRange courseRange = resolveCourseRange(courseRangeValue);
        List<AdminInstructorListProjection> rows = "courses_asc".equalsIgnoreCase(sort)
                ? courseRepository.findAdminInstructorRowsOrderByCourseCountAsc(courseRange.min(), courseRange.max(), pageable)
                : courseRepository.findAdminInstructorRowsOrderByCourseCountDesc(courseRange.min(), courseRange.max(), pageable);
        long queryDuration = System.currentTimeMillis() - queryStartedAt;

        boolean hasNext = rows.size() > limit;
        List<AdminInstructorListProjection> pageRows = hasNext
                ? rows.subList(0, limit)
                : rows;

        List<String> pageInstructorIds = pageRows.stream()
                .map(AdminInstructorListProjection::getInstructorId)
                .filter(Objects::nonNull)
                .toList();

        long enrichStartedAt = System.currentTimeMillis();
        Map<String, Teacher> teachersById = pageInstructorIds.isEmpty()
                ? Collections.emptyMap()
                : userGrpcClient.getBulkTeachers(pageInstructorIds).getTeachersList().stream()
                        .collect(Collectors.toMap(Teacher::getId, Function.identity(), (left, right) -> left));
        long enrichDuration = System.currentTimeMillis() - enrichStartedAt;

        List<AdminInstructorListItem> items = pageRows.stream()
                .map(row -> toListItem(row, teachersById.get(row.getInstructorId())))
                .toList();

        AdminInstructorListResponse result = AdminInstructorListResponse.builder()
                .items(items)
                .page(page)
                .limit(limit)
                .totalItems(0)
                .totalPages(0)
                .hasNext(hasNext)
                .build();

        putListCache(cacheKey, result);
        log.info("Admin instructor list fast-path page={} limit={} sort={} queryMs={} enrichMs={} instructorCount={}",
                page, limit, sort, queryDuration, enrichDuration, pageInstructorIds.size());

        return ApiResponse.<AdminInstructorListResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get admin instructors success")
                .result(result)
                .build();
    }

    private ApiResponse<AdminInstructorListResponse> getAdminInstructorsSearchPath(
            int page,
            int limit,
            String normalizedSearch,
            String sort,
            String courseRange
    ) {
        long startedAt = System.currentTimeMillis();
        List<String> instructorIds = getCachedInstructorIds();
        if (instructorIds.isEmpty()) {
            return buildListResponse(Collections.emptyList(), page, limit, false);
        }

        boolean nameDesc = "name_desc".equalsIgnoreCase(sort);
        boolean sortByCourseCount = "courses_desc".equalsIgnoreCase(sort) || "courses_asc".equalsIgnoreCase(sort);
        int offset = (page - 1) * limit;
        int requiredSize = offset + limit + 1;
        int grpcPage = 1;
        boolean hasNextUserPage = true;
        CourseRange range = resolveCourseRange(courseRange);
        List<AdminInstructorListItem> matchedItems = new ArrayList<>();

        while (hasNextUserPage && (sortByCourseCount || matchedItems.size() < requiredSize)) {
            var teachersResponse = userGrpcClient.searchTeachersByIds(
                    instructorIds,
                    normalizedSearch,
                    grpcPage,
                    SEARCH_BATCH_LIMIT,
                    nameDesc ? "name_desc" : "name_asc"
            );

            List<Teacher> teachers = teachersResponse.getTeachersList();
            if (teachers.isEmpty()) {
                break;
            }

            Map<String, Long> courseCountByInstructorId = loadCourseCountMap(teachers.stream()
                    .map(Teacher::getId)
                    .filter(id -> id != null && !id.isBlank())
                    .toList());

            teachers.stream()
                    .map(teacher -> toListItem(courseCountByInstructorId.get(teacher.getId()), teacher))
                    .filter(item -> matchesCourseRange(item.getCourseCount(), range))
                    .forEach(matchedItems::add);

            hasNextUserPage = teachersResponse.getHasNext();
            grpcPage++;

            if (sortByCourseCount && !hasNextUserPage) {
                matchedItems.sort(buildComparator(sort));
            }
        }

        int fromIndex = Math.min(offset, matchedItems.size());
        int toIndex = Math.min(fromIndex + limit, matchedItems.size());
        boolean hasNext = matchedItems.size() > offset + limit || hasNextUserPage;

        log.info("Admin instructor search-path search='{}' page={} limit={} sort={} courseRange={} sourceIds={} matched={} took={}ms",
                normalizedSearch, page, limit, sort, courseRange, instructorIds.size(), matchedItems.size(),
                System.currentTimeMillis() - startedAt);

        return buildListResponse(matchedItems.subList(fromIndex, toIndex), page, limit, hasNext);
    }

    private String buildListCacheKey(int page, int limit, String sort, String courseRange) {
        return page + ":" + limit + ":" + defaultString(sort).toLowerCase() + ":" + defaultString(courseRange).toLowerCase();
    }

    private AdminInstructorListResponse getValidListCache(String cacheKey) {
        CacheEntry<AdminInstructorListResponse> cacheEntry = listCache.get(cacheKey);
        if (cacheEntry == null || cacheEntry.expiresAt() < System.currentTimeMillis()) {
            listCache.remove(cacheKey);
            return null;
        }
        return cacheEntry.value();
    }

    private void putListCache(String cacheKey, AdminInstructorListResponse value) {
        listCache.put(cacheKey, new CacheEntry<>(value, System.currentTimeMillis() + LIST_CACHE_TTL_MILLIS));
    }

    private List<String> getCachedInstructorIds() {
        CacheEntry<List<String>> cacheEntry = instructorIdsCache.get("all");
        if (cacheEntry != null && cacheEntry.expiresAt() >= System.currentTimeMillis()) {
            return cacheEntry.value();
        }

        List<String> instructorIds = courseRepository.findDistinctInstructorIds();
        instructorIdsCache.put("all", new CacheEntry<>(instructorIds, System.currentTimeMillis() + LIST_CACHE_TTL_MILLIS));
        return instructorIds;
    }

    private Map<String, Long> loadCourseCountMap(List<String> instructorIds) {
        if (instructorIds == null || instructorIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return courseRepository.findInstructorCourseCountsByInstructorIds(instructorIds).stream()
                .collect(Collectors.toMap(
                        AdminInstructorListProjection::getInstructorId,
                        item -> defaultLong(item.getCourseCount()),
                        (left, right) -> left
                ));
    }

    private ApiResponse<AdminInstructorListResponse> buildListResponse(
            List<AdminInstructorListItem> items,
            int page,
            int limit,
            boolean hasNext
    ) {
        AdminInstructorListResponse result = AdminInstructorListResponse.builder()
                .items(items)
                .page(page)
                .limit(limit)
                .totalItems(0)
                .totalPages(0)
                .hasNext(hasNext)
                .build();

        return ApiResponse.<AdminInstructorListResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get admin instructors success")
                .result(result)
                .build();
    }

    private CourseRange resolveCourseRange(String courseRange) {
        if (courseRange == null || courseRange.isBlank() || "all".equalsIgnoreCase(courseRange)) {
            return new CourseRange(null, null);
        }
        return switch (courseRange.toLowerCase()) {
            case "low" -> new CourseRange(0L, 2L);
            case "mid" -> new CourseRange(3L, 4L);
            case "high" -> new CourseRange(5L, null);
            default -> new CourseRange(null, null);
        };
    }

    private record CourseRange(Long min, Long max) {}

    @Override
    public ApiResponse<AdminInstructorSummaryResponse> getAdminInstructorSummary(String instructorId, int year) {
        int normalizedYear = year > 2000 && year < 2100 ? year : LocalDate.now().getYear();

        AdminInstructorSummaryProfile profile = userGrpcClient.getAdminInstructorSummaryProfile(instructorId);
        AdminInstructorMetricsProjection metricsProjection = courseRepository.getAdminInstructorMetrics(instructorId);
        List<String> courseIds = courseRepository.findAllIdsByInstructorId(instructorId);

        LearnerAnalyticsResponse learners = instructorAnalyticsService.getLearnerAnalytics(instructorId, normalizedYear).getResult();

        AdminInstructorRevenueSnapshot revenueSnapshot = buildRevenueSnapshot(courseIds, normalizedYear);
        AdminInstructorSummaryResponse response = AdminInstructorSummaryResponse.builder()
                .profile(toProfileResponse(profile))
                .metrics(toMetricsResponse(metricsProjection, revenueSnapshot.getTotalRevenueInYear()))
                .learnersSnapshot(toLearnerSnapshot(learners))
                .revenueSnapshot(revenueSnapshot)
                .personalCertificates(toCertificatesResponse(profile))
                .build();

        return ApiResponse.<AdminInstructorSummaryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get admin instructor summary success")
                .result(response)
                .build();
    }

    @Override
    public ApiResponse<AdminInstructorCoursesPageResponse> getAdminInstructorCourses(String instructorId, int page, int limit) {
        int normalizedPage = Math.max(page, 1);
        int normalizedLimit = Math.min(Math.max(limit, 1), 10);

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                normalizedPage - 1,
                normalizedLimit,
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );

        org.springframework.data.domain.Page<AdminInstructorCourseProjection> coursePage =
                courseRepository.findAdminInstructorCourses(instructorId, pageable);

        List<String> courseIds = coursePage.getContent().stream()
                .map(AdminInstructorCourseProjection::getId)
                .filter(Objects::nonNull)
                .toList();

        Map<String, Double> revenueByCourseId = courseIds.isEmpty()
                ? Collections.emptyMap()
                : saleGrpcClient.getCoursesRevenue(courseIds).getItemsList().stream()
                        .collect(Collectors.toMap(TopCourseRevenueItem::getCourseId, TopCourseRevenueItem::getRevenue, (left, right) -> left));

        List<AdminInstructorCourseItem> items = coursePage.getContent().stream()
                .map(course -> AdminInstructorCourseItem.builder()
                        .id(course.getId())
                        .title(defaultString(course.getTitle()))
                        .category(defaultString(course.getCategory()))
                        .studentsCount(defaultLong(course.getStudentsCount()))
                        .revenue(round2(revenueByCourseId.getOrDefault(course.getId(), 0D)))
                        .rating(round2(defaultDouble(course.getRating())))
                        .status(defaultString(course.getStatus()))
                        .build())
                .toList();

        AdminInstructorCoursesPageResponse result = AdminInstructorCoursesPageResponse.builder()
                .items(items)
                .page(normalizedPage)
                .limit(normalizedLimit)
                .totalItems(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .hasNext(coursePage.hasNext())
                .build();

        return ApiResponse.<AdminInstructorCoursesPageResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Get admin instructor courses success")
                .result(result)
                .build();
    }

    private AdminInstructorListItem toListItem(AdminInstructorListProjection row, Teacher teacher) {
        long courseCount = defaultLong(row.getCourseCount());
        return AdminInstructorListItem.builder()
                .id(teacher == null ? defaultString(row.getInstructorId()) : defaultString(teacher.getId()))
                .name(teacher == null ? "Giảng viên" : defaultString(teacher.getName()))
                .email(teacher == null ? "" : defaultString(teacher.getEmail()))
                .avatar(teacher == null ? "" : defaultString(teacher.getImage()))
                .courseCount(courseCount)
                .build();
    }

    private AdminInstructorListItem toListItem(Long courseCountValue, Teacher teacher) {
        long courseCount = defaultLong(courseCountValue);
        return AdminInstructorListItem.builder()
                .id(teacher == null ? "" : defaultString(teacher.getId()))
                .name(teacher == null ? "Giảng viên" : defaultString(teacher.getName()))
                .email(teacher == null ? "" : defaultString(teacher.getEmail()))
                .avatar(teacher == null ? "" : defaultString(teacher.getImage()))
                .courseCount(courseCount)
                .build();
    }

    private boolean matchesSearch(AdminInstructorListItem item, String normalizedSearch) {
        if (normalizedSearch == null || normalizedSearch.isBlank()) {
            return true;
        }
        return item.getName().toLowerCase().contains(normalizedSearch)
                || item.getEmail().toLowerCase().contains(normalizedSearch);
    }

    private boolean matchesCourseRange(Long courseCount, String courseRange) {
        return matchesCourseRange(courseCount, resolveCourseRange(courseRange));
    }

    private boolean matchesCourseRange(Long courseCount, CourseRange courseRange) {
        long count = defaultLong(courseCount);
        if (courseRange == null) {
            return true;
        }
        if (courseRange.min() != null && count < courseRange.min()) {
            return false;
        }
        if (courseRange.max() != null && count > courseRange.max()) {
            return false;
        }
        return true;
    }

    private Comparator<AdminInstructorListItem> buildComparator(String sort) {
        if ("name_desc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(AdminInstructorListItem::getName, String.CASE_INSENSITIVE_ORDER).reversed();
        }
        if ("courses_desc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(AdminInstructorListItem::getCourseCount, Comparator.nullsLast(Long::compareTo))
                    .reversed()
                    .thenComparing(AdminInstructorListItem::getName, String.CASE_INSENSITIVE_ORDER);
        }
        if ("courses_asc".equalsIgnoreCase(sort)) {
            return Comparator.comparing(AdminInstructorListItem::getCourseCount, Comparator.nullsLast(Long::compareTo))
                    .thenComparing(AdminInstructorListItem::getName, String.CASE_INSENSITIVE_ORDER);
        }
        return Comparator.comparing(AdminInstructorListItem::getName, String.CASE_INSENSITIVE_ORDER);
    }

    private AdminInstructorProfileResponse toProfileResponse(AdminInstructorSummaryProfile profile) {
        List<String> expertise = profile.getExpertisesList().stream()
                .map(Expertise::getName)
                .filter(name -> name != null && !name.isBlank())
                .toList();

        return AdminInstructorProfileResponse.builder()
                .id(defaultString(profile.getId()))
                .name(defaultString(profile.getName()))
                .email(defaultString(profile.getEmail()))
                .avatar(defaultString(profile.getImage()))
                .description(defaultString(profile.getDescription()))
                .headline(expertise.isEmpty() ? "Instructor" : expertise.get(0) + " Instructor")
                .expertise(expertise)
                .build();
    }

    private AdminInstructorMetricsResponse toMetricsResponse(AdminInstructorMetricsProjection projection, Double totalRevenue) {
        return AdminInstructorMetricsResponse.builder()
                .courseCount(projection == null ? 0L : defaultLong(projection.getCourseCount()))
                .studentsCount(projection == null ? 0L : defaultLong(projection.getStudentsCount()))
                .totalRevenue(round2(totalRevenue))
                .completionRate(projection == null ? 0D : round2(defaultDouble(projection.getCompletionRate())))
                .averageRating(projection == null ? 0D : round2(defaultDouble(projection.getAverageRating())))
                .build();
    }

    private AdminInstructorLearnerSnapshot toLearnerSnapshot(LearnerAnalyticsResponse response) {
        if (response == null) {
            return AdminInstructorLearnerSnapshot.builder()
                    .year(LocalDate.now().getYear())
                    .totalStudentsInYear(0L)
                    .newStudentsCurrentMonth(0L)
                    .newStudentsTrendPercent(0D)
                    .build();
        }
        return AdminInstructorLearnerSnapshot.builder()
                .year(response.getYear())
                .totalStudentsInYear(response.getTotalStudentsInYear())
                .newStudentsCurrentMonth(response.getNewStudentsCurrentMonth())
                .newStudentsTrendPercent(round2(response.getNewStudentsTrendPercent()))
                .build();
    }

    private AdminInstructorCertificatesResponse toCertificatesResponse(AdminInstructorSummaryProfile profile) {
        List<AdminInstructorCertificatesResponse.CertificateItem> items = profile.getCertificatesList().stream()
                .map(item -> AdminInstructorCertificatesResponse.CertificateItem.builder()
                        .id(defaultString(item.getId()))
                        .title(defaultString(item.getTitle()))
                        .organization(defaultString(item.getOrganization()))
                        .issueDate(defaultString(item.getIssueDate()))
                        .imageUrl(defaultString(item.getImageUrl()))
                        .build())
                .toList();

        return AdminInstructorCertificatesResponse.builder()
                .totalCertificates(profile.getTotalCertificates())
                .items(items)
                .build();
    }

    private AdminInstructorRevenueSnapshot buildRevenueSnapshot(List<String> courseIds, int year) {
        if (courseIds == null || courseIds.isEmpty()) {
            return AdminInstructorRevenueSnapshot.builder()
                    .year(year)
                    .totalRevenueInYear(0D)
                    .totalProfitInYear(0D)
                    .highestRevenueMonth(1)
                    .highestRevenueAmount(0D)
                    .monthlyRevenue(buildEmptyMonthlyRevenue())
                    .build();
        }

        var revenueResponse = saleGrpcClient.getRevenueAndProfit(courseIds, year);
        double totalRevenue = 0D;
        double totalProfit = 0D;
        int highestMonth = 1;
        double highestRevenue = 0D;

        Map<Integer, com.example.grpc.user.GetRevenueAndProfitList> revenueByMonth = revenueResponse.getDataListList().stream()
                .collect(Collectors.toMap(item -> (int) item.getMonth(), Function.identity(), (left, right) -> left));

        List<AdminInstructorRevenueSnapshot.MonthlyRevenuePoint> monthlyPoints = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            var source = revenueByMonth.get(month);
            double revenue = source == null ? 0D : source.getRevenue();
            double profit = source == null ? 0D : source.getProfit();
            totalRevenue += revenue;
            totalProfit += profit;
            if (revenue > highestRevenue) {
                highestRevenue = revenue;
                highestMonth = month;
            }
            monthlyPoints.add(AdminInstructorRevenueSnapshot.MonthlyRevenuePoint.builder()
                    .month(month)
                    .revenue(round2(revenue))
                    .profit(round2(profit))
                    .build());
        }

        return AdminInstructorRevenueSnapshot.builder()
                .year(year)
                .totalRevenueInYear(round2(totalRevenue))
                .totalProfitInYear(round2(totalProfit))
                .highestRevenueMonth(highestMonth)
                .highestRevenueAmount(round2(highestRevenue))
                .monthlyRevenue(monthlyPoints)
                .build();
    }

    private List<AdminInstructorRevenueSnapshot.MonthlyRevenuePoint> buildEmptyMonthlyRevenue() {
        List<AdminInstructorRevenueSnapshot.MonthlyRevenuePoint> items = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            items.add(AdminInstructorRevenueSnapshot.MonthlyRevenuePoint.builder()
                    .month(month)
                    .revenue(0D)
                    .profit(0D)
                    .build());
        }
        return items;
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private long defaultLong(Long value) {
        return value == null ? 0L : value;
    }

    private double defaultDouble(Double value) {
        return value == null ? 0D : value;
    }

    private double round2(Double value) {
        double safe = value == null ? 0D : value;
        return Math.round(safe * 100D) / 100D;
    }
}
