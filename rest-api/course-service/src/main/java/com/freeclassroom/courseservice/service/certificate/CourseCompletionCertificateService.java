package com.freeclassroom.courseservice.service.certificate;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CertificateVerifyResponse;
import com.freeclassroom.courseservice.dto.response.certificate.CourseCompletionCertificateResponse;
import com.freeclassroom.courseservice.dto.snapshot.CourseSnapshot;
import com.freeclassroom.courseservice.dto.snapshot.RecipientSnapshot;
import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import com.freeclassroom.courseservice.entity.course.CourseEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.enums.entity.EnumCertificateStatus;
import com.freeclassroom.courseservice.enums.entity.EnumCourseStatus;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.grpc.client.UserGrpcClient;
import com.freeclassroom.courseservice.mapper.CourseCompletionCertificateMapper;
import com.freeclassroom.courseservice.repository.entity.CourseCompletionCertificateRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CourseCompletionCertificateService implements ICourseCompletionCertificateService {

    CourseCompletionCertificateRepository certificateRepository;
    CourseCompletionCertificateMapper certificateMapper;
    UserGrpcClient userGrpcClient;

    @Override
    @Transactional
    public void issueIfEligible(EnrollmentsEntity enrollment) {
        Double progress = enrollment.getProgress();
        if (progress == null || progress < 1.0) {
            return;
        }

        if (certificateRepository.existsByEnrollmentId(enrollment.getId())) {
            return;
        }

        CourseEntity course = enrollment.getCourse();
        if (course == null || !EnumCourseStatus.PUBLISHED.equals(course.getStatus())) {
            return;
        }

        GetUserResponse student = userGrpcClient.getUser(enrollment.getUserId());
        GetUserResponse instructor = userGrpcClient.getUser(course.getInstructorId());

        LocalDateTime now = LocalDateTime.now();

        CourseCompletionCertificateEntity cert = CourseCompletionCertificateEntity.builder()
                .enrollmentId(enrollment.getId())
                .certificateCode(generateCertificateCode())
                .recipientSnapshot(RecipientSnapshot.builder()
                        .userId(enrollment.getUserId())
                        .name(student.getName())
                        .build())
                .courseSnapshot(CourseSnapshot.builder()
                        .courseId(course.getId())
                        .title(course.getTitle())
                        .thumbnailUrl(course.getThumbnailUrl())
                        .instructorId(course.getInstructorId())
                        .instructorName(instructor.getName())
                        .instructorAvatarUrl(instructor.getImage())
                        .build())
                .issuedAt(now)
                .completedAt(now)
                .status(EnumCertificateStatus.ISSUED)
                .build();

        certificateRepository.save(cert);
        log.info("Issued course completion certificate {} for enrollment {}", cert.getCertificateCode(), enrollment.getId());
    }

    @Override
    public ApiResponse<List<CourseCompletionCertificateResponse>> getMyCertificates(String userId) {
        List<CourseCompletionCertificateResponse> items = certificateRepository
                .findByUserIdOrderByIssuedAtDesc(userId)
                .stream()
                .map(certificateMapper::toDto)
                .toList();

        return ApiResponse.<List<CourseCompletionCertificateResponse>>builder()
                .code(200)
                .message("Lấy danh sách chứng chỉ thành công")
                .result(items)
                .build();
    }

    @Override
    public ApiResponse<CourseCompletionCertificateResponse> getById(String id, String userId) {
        CourseCompletionCertificateEntity cert = certificateRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.CERTIFICATE_NOT_FOUND));

        return ApiResponse.<CourseCompletionCertificateResponse>builder()
                .code(200)
                .message("Lấy thông tin chứng chỉ thành công")
                .result(certificateMapper.toDto(cert))
                .build();
    }

    @Override
    public ApiResponse<CertificateVerifyResponse> verifyByCode(String code) {
        CourseCompletionCertificateEntity cert = certificateRepository
                .findByCertificateCode(code)
                .filter(c -> EnumCertificateStatus.ISSUED.equals(c.getStatus()))
                .orElseThrow(() -> new CustomExeption(ErrorCode.CERTIFICATE_NOT_FOUND));

        CertificateVerifyResponse response = CertificateVerifyResponse.builder()
                .valid(true)
                .certificateCode(cert.getCertificateCode())
                .issuedAt(cert.getIssuedAt())
                .recipientSnapshot(cert.getRecipientSnapshot())
                .courseSnapshot(cert.getCourseSnapshot())
                .build();

        return ApiResponse.<CertificateVerifyResponse>builder()
                .code(200)
                .message("Chứng chỉ hợp lệ")
                .result(response)
                .build();
    }

    private String generateCertificateCode() {
        return "LNV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}
