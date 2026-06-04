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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBusinessPerformanceServiceTest {

    @Mock private CourseRepository courseRepository;
    @Mock private EnrollmentRepository enrollmentRepository;
    @Mock private SaleGrpcClient saleGrpcClient;
    @Mock private RedisCacheService redisCacheService;

    private AdminBusinessPerformanceService service;

    @BeforeEach
    void setUp() {
        service = new AdminBusinessPerformanceService(
                courseRepository,
                enrollmentRepository,
                saleGrpcClient,
                redisCacheService
        );
    }

    @Test
    void getBusinessPerformance_with12Months_shouldMergeEnrollmentAndRevenueForCurrentYear() {
        int currentYear = Year.now().getValue();
        String januaryKey = currentYear + "-01";
        when(redisCacheService.get(anyString(), eq(AdminBusinessPerformanceResponse.class))).thenReturn(null);
        when(enrollmentRepository.countAdminEnrollmentsByMonth(any(), any()))
                .thenReturn(List.of(bucket(januaryKey, 3L)));
        when(courseRepository.findActiveCourseIdsForAdmin()).thenReturn(List.of("c1", "c2"));
        when(saleGrpcClient.getAdminBusinessRevenue(anyList(), any(), any(), eq("MONTH")))
                .thenReturn(GetAdminBusinessRevenueResponse.newBuilder()
                        .addItems(AdminBusinessRevenuePoint.newBuilder()
                                .setBucketKey(januaryKey)
                                .setRevenue(1250000.25)
                                .build())
                        .build());

        ApiResponse<AdminBusinessPerformanceResponse> response = service.getBusinessPerformance("12m");

        assertThat(response.getResult().getRange()).isEqualTo("12m");
        assertThat(response.getResult().getPoints()).hasSize(12);
        AdminBusinessPerformanceResponse.Point january = response.getResult().getPoints().get(0);
        assertThat(january.getLabel()).isEqualTo("T1");
        assertThat(january.getBucketKey()).isEqualTo(januaryKey);
        assertThat(january.getStudentCount()).isEqualTo(3);
        assertThat(january.getRevenue()).isEqualTo(1250000.25);
        verify(saleGrpcClient).getAdminBusinessRevenue(
                eq(List.of("c1", "c2")),
                eq(LocalDate.of(currentYear, 1, 1)),
                eq(LocalDate.of(currentYear + 1, 1, 1)),
                eq("MONTH")
        );
        verify(redisCacheService).set(startsWith("admin:business-performance:12m"), any(), any());
    }

    @Test
    void getBusinessPerformance_whenSaleServiceFails_shouldKeepEnrollmentAndFallbackRevenueToZero() {
        LocalDate today = LocalDate.now();
        when(redisCacheService.get(anyString(), eq(AdminBusinessPerformanceResponse.class))).thenReturn(null);
        when(enrollmentRepository.countAdminEnrollmentsByDay(any(), any()))
                .thenReturn(List.of(bucket(today.toString(), 5L)));
        when(courseRepository.findActiveCourseIdsForAdmin()).thenReturn(List.of("c1"));
        when(saleGrpcClient.getAdminBusinessRevenue(anyList(), any(), any(), eq("DAY")))
                .thenThrow(new RuntimeException("sale unavailable"));

        ApiResponse<AdminBusinessPerformanceResponse> response = service.getBusinessPerformance("7d");

        assertThat(response.getResult().getRange()).isEqualTo("7d");
        assertThat(response.getResult().getPoints()).hasSize(7);
        AdminBusinessPerformanceResponse.Point todayPoint = response.getResult().getPoints().get(6);
        assertThat(todayPoint.getBucketKey()).isEqualTo(today.toString());
        assertThat(todayPoint.getStudentCount()).isEqualTo(5);
        assertThat(todayPoint.getRevenue()).isZero();
    }

    @Test
    void getBusinessPerformance_with30Days_shouldGroupIntoSixFiveDayBuckets() {
        LocalDate today = LocalDate.now();
        LocalDate rangeStart = today.minusDays(29);
        LocalDate firstBucketSecondDay = rangeStart.plusDays(1);
        LocalDate secondBucketFirstDay = rangeStart.plusDays(5);
        when(redisCacheService.get(anyString(), eq(AdminBusinessPerformanceResponse.class))).thenReturn(null);
        when(enrollmentRepository.countAdminEnrollmentsByDay(any(), any()))
                .thenReturn(List.of(
                        bucket(rangeStart.toString(), 2L),
                        bucket(firstBucketSecondDay.toString(), 3L),
                        bucket(secondBucketFirstDay.toString(), 7L)
                ));
        when(courseRepository.findActiveCourseIdsForAdmin()).thenReturn(List.of("c1"));
        when(saleGrpcClient.getAdminBusinessRevenue(anyList(), any(), any(), eq("DAY")))
                .thenReturn(GetAdminBusinessRevenueResponse.newBuilder()
                        .addItems(AdminBusinessRevenuePoint.newBuilder()
                                .setBucketKey(rangeStart.toString())
                                .setRevenue(100000.0)
                                .build())
                        .addItems(AdminBusinessRevenuePoint.newBuilder()
                                .setBucketKey(firstBucketSecondDay.toString())
                                .setRevenue(250000.5)
                                .build())
                        .addItems(AdminBusinessRevenuePoint.newBuilder()
                                .setBucketKey(secondBucketFirstDay.toString())
                                .setRevenue(900000.0)
                                .build())
                        .build());

        ApiResponse<AdminBusinessPerformanceResponse> response = service.getBusinessPerformance("30d");

        assertThat(response.getResult().getRange()).isEqualTo("30d");
        assertThat(response.getResult().getPoints()).hasSize(6);
        AdminBusinessPerformanceResponse.Point firstBucket = response.getResult().getPoints().get(0);
        AdminBusinessPerformanceResponse.Point secondBucket = response.getResult().getPoints().get(1);
        assertThat(firstBucket.getStartDate()).isEqualTo(rangeStart);
        assertThat(firstBucket.getEndDate()).isEqualTo(rangeStart.plusDays(4));
        assertThat(firstBucket.getBucketKey()).isEqualTo(rangeStart + "_" + rangeStart.plusDays(4));
        assertThat(firstBucket.getStudentCount()).isEqualTo(5);
        assertThat(firstBucket.getRevenue()).isEqualTo(350000.5);
        assertThat(secondBucket.getStudentCount()).isEqualTo(7);
        assertThat(secondBucket.getRevenue()).isEqualTo(900000.0);
        verify(saleGrpcClient).getAdminBusinessRevenue(
                eq(List.of("c1")),
                eq(rangeStart),
                eq(today.plusDays(1)),
                eq("DAY")
        );
    }

    @Test
    void getBusinessPerformance_withInvalidRange_shouldFallbackTo12Months() {
        when(redisCacheService.get(anyString(), eq(AdminBusinessPerformanceResponse.class))).thenReturn(null);
        when(enrollmentRepository.countAdminEnrollmentsByMonth(any(), any())).thenReturn(List.of());
        when(courseRepository.findActiveCourseIdsForAdmin()).thenReturn(List.of());

        ApiResponse<AdminBusinessPerformanceResponse> response = service.getBusinessPerformance("unknown");

        assertThat(response.getResult().getRange()).isEqualTo("12m");
        assertThat(response.getResult().getPoints()).hasSize(12);
        verify(saleGrpcClient, never()).getAdminBusinessRevenue(anyList(), any(), any(), anyString());
    }

    @Test
    void getBusinessPerformance_withCacheHit_shouldNotQueryRepositories() {
        AdminBusinessPerformanceResponse cached = AdminBusinessPerformanceResponse.builder()
                .range("12m")
                .points(List.of())
                .build();
        when(redisCacheService.get(anyString(), eq(AdminBusinessPerformanceResponse.class))).thenReturn(cached);

        ApiResponse<AdminBusinessPerformanceResponse> response = service.getBusinessPerformance("12m");

        assertThat(response.getResult()).isSameAs(cached);
        verifyNoInteractions(enrollmentRepository, courseRepository, saleGrpcClient);
    }

    private AdminEnrollmentBucketProjection bucket(String bucketKey, Long studentCount) {
        return new AdminEnrollmentBucketProjection() {
            @Override public String getBucketKey() { return bucketKey; }
            @Override public Long getStudentCount() { return studentCount; }
        };
    }
}
