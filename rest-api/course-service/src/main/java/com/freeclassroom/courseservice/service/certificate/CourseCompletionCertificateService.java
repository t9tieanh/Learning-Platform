package com.freeclassroom.courseservice.service.certificate;

import com.example.grpc.user.GetUserResponse;
import com.freeclassroom.courseservice.dto.certificate.CourseScoreSummary;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class CourseCompletionCertificateService implements ICourseCompletionCertificateService {

    CourseCompletionCertificateRepository certificateRepository;
    CourseCompletionCertificateMapper certificateMapper;
    UserGrpcClient userGrpcClient;
    CertificatePdfService certificatePdfService;

    @Override
    @Transactional
    public Optional<CourseCompletionCertificateEntity> issueIfEligible(EnrollmentsEntity enrollment) {
        Double progress = enrollment.getProgress();
        if (progress == null || progress < 1.0) {
            return Optional.empty();
        }

        if (certificateRepository.existsByEnrollmentId(enrollment.getId())) {
            return certificateRepository.findByEnrollmentId(enrollment.getId());
        }

        CourseEntity course = enrollment.getCourse();
        if (course == null || !EnumCourseStatus.PUBLISHED.equals(course.getStatus())) {
            return Optional.empty();
        }

        return Optional.of(createAndSaveCertificate(enrollment, course, CourseScoreSummary.noTestsDefault()));
    }

    /**
     * Creates a certificate without re-checking lesson/test eligibility.
     * Callers must validate eligibility via {@link CertificateEligibilityService} first.
     */
    @Transactional
    public Optional<CourseCompletionCertificateEntity> issueCertificate(
            EnrollmentsEntity enrollment,
            CourseScoreSummary scoreSummary
    ) {
        if (certificateRepository.existsByEnrollmentId(enrollment.getId())) {
            return certificateRepository.findByEnrollmentId(enrollment.getId());
        }

        CourseEntity course = enrollment.getCourse();
        if (course == null || !EnumCourseStatus.PUBLISHED.equals(course.getStatus())) {
            return Optional.empty();
        }

        return Optional.of(createAndSaveCertificate(enrollment, course, scoreSummary));
    }

    private CourseCompletionCertificateEntity createAndSaveCertificate(
            EnrollmentsEntity enrollment,
            CourseEntity course,
            CourseScoreSummary scoreSummary
    ) {
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
                .courseScore(scoreSummary.getEarned())
                .courseScoreTotal(scoreSummary.getTotal())
                .status(EnumCertificateStatus.ISSUED)
                .build();

        certificateRepository.save(cert);
        log.info("Issued course completion certificate {} for enrollment {}", cert.getCertificateCode(), enrollment.getId());
        return cert;
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

    @Override
    public ResponseEntity<byte[]> downloadPdfById(String id, String userId) {
        CourseCompletionCertificateEntity cert = certificateRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.CERTIFICATE_NOT_FOUND));

        return buildPdfResponse(cert);
    }

    @Override
    public ResponseEntity<byte[]> downloadPdfByCode(String code) {
        CourseCompletionCertificateEntity cert = certificateRepository
                .findByCertificateCode(code)
                .filter(c -> EnumCertificateStatus.ISSUED.equals(c.getStatus()))
                .orElseThrow(() -> new CustomExeption(ErrorCode.CERTIFICATE_NOT_FOUND));

        return buildPdfResponse(cert);
    }

    private ResponseEntity<byte[]> buildPdfResponse(CourseCompletionCertificateEntity cert) {
        byte[] pdfBytes = certificatePdfService.generatePdf(cert);
        String filename = certificatePdfService.buildDownloadFilename(cert.getCertificateCode());

        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + encodedFilename
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
    }

    private String generateCertificateCode() {
        return "LNV-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
    }
}
