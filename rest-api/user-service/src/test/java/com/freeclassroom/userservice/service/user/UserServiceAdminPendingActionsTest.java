package com.freeclassroom.userservice.service.user;

import com.example.grpc.course.GetAdminCourseModerationCountsResponse;
import com.freeclassroom.userservice.dto.response.ApiResponse;
import com.freeclassroom.userservice.dto.response.admin.AdminPendingActionsResponse;
import com.freeclassroom.userservice.enums.CertificateStatus;
import com.freeclassroom.userservice.grpc.client.CourseGrpcClient;
import com.freeclassroom.userservice.repository.entity.CertificateRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceAdminPendingActionsTest {

    @Mock private CertificateRepository certificateRepository;
    @Mock private CourseGrpcClient courseGrpcClient;

    @InjectMocks private UserService userService;

    @Test
    void getAdminPendingActions_shouldAggregateCertificateAndCourseCounts() {
        when(certificateRepository.countByStatus(CertificateStatus.PENDING)).thenReturn(14L);
        when(courseGrpcClient.getAdminCourseModerationCounts())
                .thenReturn(GetAdminCourseModerationCountsResponse.newBuilder()
                        .setPendingReviewCount(8L)
                        .setRejectedCount(3L)
                        .build());

        ApiResponse<AdminPendingActionsResponse> response = userService.getAdminPendingActions();

        assertThat(response.getResult().getCoursePendingReviewCount()).isEqualTo(8L);
        assertThat(response.getResult().getCertificatePendingCount()).isEqualTo(14L);
        assertThat(response.getResult().getRejectedCourseCount()).isEqualTo(3L);
    }

    @Test
    void getAdminPendingActions_whenCourseGrpcFails_shouldKeepCertificateCountAndFallbackCourseCounts() {
        when(certificateRepository.countByStatus(CertificateStatus.PENDING)).thenReturn(9L);
        when(courseGrpcClient.getAdminCourseModerationCounts()).thenThrow(new RuntimeException("course unavailable"));

        ApiResponse<AdminPendingActionsResponse> response = userService.getAdminPendingActions();

        assertThat(response.getResult().getCoursePendingReviewCount()).isZero();
        assertThat(response.getResult().getCertificatePendingCount()).isEqualTo(9L);
        assertThat(response.getResult().getRejectedCourseCount()).isZero();
    }

    @Test
    void getAdminPendingActions_whenCertificateRepositoryFails_shouldKeepCourseCountsAndFallbackCertificateCount() {
        when(certificateRepository.countByStatus(CertificateStatus.PENDING)).thenThrow(new RuntimeException("db unavailable"));
        when(courseGrpcClient.getAdminCourseModerationCounts())
                .thenReturn(GetAdminCourseModerationCountsResponse.newBuilder()
                        .setPendingReviewCount(2L)
                        .setRejectedCount(5L)
                        .build());

        ApiResponse<AdminPendingActionsResponse> response = userService.getAdminPendingActions();

        assertThat(response.getResult().getCoursePendingReviewCount()).isEqualTo(2L);
        assertThat(response.getResult().getCertificatePendingCount()).isZero();
        assertThat(response.getResult().getRejectedCourseCount()).isEqualTo(5L);
    }
}
