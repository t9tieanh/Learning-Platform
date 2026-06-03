package com.freeclassroom.courseservice.service.course;

import com.example.grpc.user.AdminBusinessRevenuePoint;
import com.example.grpc.user.GetAdminBusinessRevenueResponse;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminBusinessPerformanceResponse;
import com.freeclassroom.courseservice.dto.response.admin.AdminEnrollmentBucketProjection;
import com.freeclassroom.courseservice.grpc.client.SaleGrpcClient;
import com.freeclassroom.courseservice.repository.entity.CourseRepository;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.service.cache.RedisCacheService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminBusinessPerformanceService implements IAdminBusinessPerformanceService {
    private static final Duration CACHE_TTL = Duration.ofSeconds(45);
    private static final String CACHE_PREFIX = "admin:business-performance:";

    CourseRepository courseRepository;
    EnrollmentRepository enrollmentRepository;
    SaleGrpcClient saleGrpcClient;
    RedisCacheService redisCacheService;

    @Override
    public ApiResponse<AdminBusinessPerformanceResponse> getBusinessPerformance(String range) {
        RangeConfig config = RangeConfig.from(range);
        String cacheKey = CACHE_PREFIX + config.key();

        AdminBusinessPerformanceResponse cached = redisCacheService.get(cacheKey, AdminBusinessPerformanceResponse.class);
        if (cached != null) {
            return success(cached);
        }

        List<AdminEnrollmentBucketProjection> enrollmentRows = config.bucketType() == BucketType.DAY
                ? enrollmentRepository.countAdminEnrollmentsByDay(config.startDate().atStartOfDay(), config.endExclusive().atStartOfDay())
                : enrollmentRepository.countAdminEnrollmentsByMonth(config.startDate().atStartOfDay(), config.endExclusive().atStartOfDay());

        Map<String, Long> enrollmentMap = enrollmentRows.stream()
                .collect(Collectors.toMap(
                        AdminEnrollmentBucketProjection::getBucketKey,
                        row -> row.getStudentCount() == null ? 0L : row.getStudentCount(),
                        Long::sum,
                        LinkedHashMap::new
                ));

        Map<String, Double> revenueMap = fetchRevenue(config);
        List<AdminBusinessPerformanceResponse.Point> points = config.buckets().stream()
                .map(bucket -> AdminBusinessPerformanceResponse.Point.builder()
                        .label(bucket.label())
                        .bucketKey(bucket.bucketKey())
                        .startDate(bucket.startDate())
                        .endDate(bucket.endDate())
                        .studentCount(sumLong(enrollmentMap, bucket.sourceKeys()))
                        .revenue(roundMoney(sumDouble(revenueMap, bucket.sourceKeys())))
                        .build())
                .toList();

        AdminBusinessPerformanceResponse response = AdminBusinessPerformanceResponse.builder()
                .range(config.key())
                .points(points)
                .build();

        redisCacheService.set(cacheKey, response, CACHE_TTL);
        return success(response);
    }

    private Map<String, Double> fetchRevenue(RangeConfig config) {
        try {
            List<String> activeCourseIds = courseRepository.findActiveCourseIdsForAdmin();
            if (activeCourseIds == null || activeCourseIds.isEmpty()) {
                return Map.of();
            }

            GetAdminBusinessRevenueResponse response = saleGrpcClient.getAdminBusinessRevenue(
                    activeCourseIds,
                    config.startDate(),
                    config.endExclusive(),
                    config.bucketType().name()
            );

            return response.getItemsList().stream()
                    .collect(Collectors.toMap(
                            AdminBusinessRevenuePoint::getBucketKey,
                            AdminBusinessRevenuePoint::getRevenue,
                            Double::sum,
                            LinkedHashMap::new
                    ));
        } catch (Exception e) {
            log.warn("Cannot fetch admin business revenue from sale-service, revenue will fallback to 0: {}", e.getMessage());
            return Map.of();
        }
    }

    private ApiResponse<AdminBusinessPerformanceResponse> success(AdminBusinessPerformanceResponse result) {
        return ApiResponse.<AdminBusinessPerformanceResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy dữ liệu hiệu suất kinh doanh thành công")
                .result(result)
                .build();
    }

    private double roundMoney(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private long sumLong(Map<String, Long> values, List<String> keys) {
        return keys.stream()
                .mapToLong(key -> values.getOrDefault(key, 0L))
                .sum();
    }

    private double sumDouble(Map<String, Double> values, List<String> keys) {
        return keys.stream()
                .mapToDouble(key -> values.getOrDefault(key, 0.0))
                .sum();
    }

    private enum BucketType {
        DAY,
        MONTH
    }

    private record Bucket(String label, String bucketKey, LocalDate startDate, LocalDate endDate, List<String> sourceKeys) {
    }

    private record RangeConfig(
            String key,
            BucketType bucketType,
            LocalDate startDate,
            LocalDate endExclusive,
            List<Bucket> buckets
    ) {
        private static RangeConfig from(String rawRange) {
            String normalized = rawRange == null ? "12m" : rawRange.trim().toLowerCase();
            LocalDate today = LocalDate.now();

            return switch (normalized) {
                case "7d" -> rollingDays("7d", today, 7);
                case "30d" -> rollingDayGroups("30d", today, 30, 5);
                case "90d" -> rollingMonths("90d", today, 3);
                default -> fullCurrentYear(today);
            };
        }

        private static RangeConfig rollingDays(String key, LocalDate today, int days) {
            LocalDate start = today.minusDays(days - 1L);
            LocalDate endExclusive = today.plusDays(1);
            List<Bucket> buckets = new ArrayList<>();

            for (int i = 0; i < days; i++) {
                LocalDate day = start.plusDays(i);
                buckets.add(new Bucket(dayLabel(day), day.toString(), day, day, List.of(day.toString())));
            }

            return new RangeConfig(key, BucketType.DAY, start, endExclusive, buckets);
        }

        private static RangeConfig rollingDayGroups(String key, LocalDate today, int days, int groupSize) {
            LocalDate start = today.minusDays(days - 1L);
            LocalDate endExclusive = today.plusDays(1);
            List<Bucket> buckets = new ArrayList<>();

            for (int offset = 0; offset < days; offset += groupSize) {
                LocalDate groupStart = start.plusDays(offset);
                LocalDate groupEnd = groupStart.plusDays(groupSize - 1L);
                List<String> sourceKeys = new ArrayList<>();

                for (LocalDate day = groupStart; !day.isAfter(groupEnd); day = day.plusDays(1)) {
                    sourceKeys.add(day.toString());
                }

                buckets.add(new Bucket(dayRangeLabel(groupStart, groupEnd), groupStart + "_" + groupEnd, groupStart, groupEnd, sourceKeys));
            }

            return new RangeConfig(key, BucketType.DAY, start, endExclusive, buckets);
        }

        private static RangeConfig rollingMonths(String key, LocalDate today, int months) {
            LocalDate start = today.withDayOfMonth(1).minusMonths(months - 1L);
            LocalDate endExclusive = today.withDayOfMonth(1).plusMonths(1);
            List<Bucket> buckets = new ArrayList<>();

            for (int i = 0; i < months; i++) {
                LocalDate monthStart = start.plusMonths(i);
                buckets.add(monthBucket(monthStart));
            }

            return new RangeConfig(key, BucketType.MONTH, start, endExclusive, buckets);
        }

        private static RangeConfig fullCurrentYear(LocalDate today) {
            LocalDate start = Year.from(today).atDay(1);
            LocalDate endExclusive = start.plusYears(1);
            List<Bucket> buckets = new ArrayList<>();

            for (int month = 1; month <= 12; month++) {
                buckets.add(monthBucket(start.withMonth(month)));
            }

            return new RangeConfig("12m", BucketType.MONTH, start, endExclusive, buckets);
        }

        private static Bucket monthBucket(LocalDate monthStart) {
            LocalDate start = monthStart.withDayOfMonth(1);
            LocalDate end = start.plusMonths(1).minusDays(1);
            String bucketKey = "%d-%02d".formatted(start.getYear(), start.getMonthValue());
            return new Bucket("T" + start.getMonthValue(), bucketKey, start, end, List.of(bucketKey));
        }

        private static String dayRangeLabel(LocalDate start, LocalDate end) {
            return "%02d/%02d-%02d/%02d".formatted(
                    start.getDayOfMonth(),
                    start.getMonthValue(),
                    end.getDayOfMonth(),
                    end.getMonthValue()
            );
        }

        private static String dayLabel(LocalDate day) {
            return switch (day.getDayOfWeek()) {
                case MONDAY -> "T2";
                case TUESDAY -> "T3";
                case WEDNESDAY -> "T4";
                case THURSDAY -> "T5";
                case FRIDAY -> "T6";
                case SATURDAY -> "T7";
                case SUNDAY -> "CN";
            };
        }
    }
}
