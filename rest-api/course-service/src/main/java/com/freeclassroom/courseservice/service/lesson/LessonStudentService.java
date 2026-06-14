package com.freeclassroom.courseservice.service.lesson;

import com.freeclassroom.courseservice.configuration.CustomJwtDecoder;
import com.freeclassroom.courseservice.configuration.LessonMediaProperties;
import com.freeclassroom.courseservice.dto.request.lesson.MakeNoteForLessonRequest;
import com.freeclassroom.courseservice.dto.response.ApiResponse;
import com.freeclassroom.courseservice.dto.response.common.CreationResponse;
import com.freeclassroom.courseservice.dto.response.lesson.MarkDoneLessonResponse;
import com.freeclassroom.courseservice.dto.response.course.CloudFrontCookieResponse;
import com.freeclassroom.courseservice.dto.response.course.LessonInfoResponse;
import com.freeclassroom.courseservice.entity.certificate.CourseCompletionCertificateEntity;
import com.freeclassroom.courseservice.entity.course.LessonEntity;
import com.freeclassroom.courseservice.entity.member.EnrollmentsEntity;
import com.freeclassroom.courseservice.entity.member.LessonProgressEntity;
import com.freeclassroom.courseservice.enums.entity.EnumLessonProgress;
import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.exception.LessonMediaAccessException;
import com.freeclassroom.courseservice.mapper.LessonStudentMapper;
import com.freeclassroom.courseservice.repository.entity.EnrollmentRepository;
import com.freeclassroom.courseservice.repository.entity.LessonProgressRepository;
import com.freeclassroom.courseservice.repository.entity.LessonRepository;
import com.freeclassroom.courseservice.service.utils.cloudfront.ICloudFrontService;
import com.freeclassroom.courseservice.service.certificate.CertificateEligibilityService;
import com.freeclassroom.courseservice.dto.certificate.CertificateEligibilityTryResult;
import com.freeclassroom.courseservice.service.utils.jwt.JwtLessonAccessTokenProvider;
import com.freeclassroom.courseservice.service.utils.other.FileUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Service
@Slf4j
public class LessonStudentService implements ILessonStudentService {

    private static final Pattern MEDIA_LESSON_URI_PATTERN =
            Pattern.compile("^/media/lesson/([^/?#]+)");

    EnrollmentRepository enrollmentRepo;
    LessonRepository lessonRepo;
    LessonProgressRepository lessonProgressRepo;
    ICloudFrontService cloudFrontService;
    CustomJwtDecoder customJwtDecoder;
    LessonStudentMapper lessonMapper;
    FileUtils fileUtils;
    CertificateEligibilityService certificateEligibilityService;
    JwtLessonAccessTokenProvider jwtLessonAccessTokenProvider;
    LessonMediaProperties lessonMediaProperties;

    @Value("${server.backendUri}")
    @NonFinal
    String backendUri;

    @Override
    public boolean canViewLessonByAccessToken(String lessonId, String accessToken) {
        Jwt jwtDecoded = customJwtDecoder.decode(accessToken);
        String userId = (String) jwtDecoded.getClaims().get("sub");

        boolean isEnrolled = enrollmentRepo.existsByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId);
        if (!isEnrolled) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }

        return true;
    }

    @Override
    public boolean canViewLesson(String lessonId, String userId) {
        boolean isEnrolled = enrollmentRepo.existsByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId);
        if (!isEnrolled) {
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }

        return true;
    }

    @Override
    public ResponseEntity<Resource> getLesson(String lessonId, String rangeHeader) throws Exception {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        String lessonUri  = lesson.getUrl().replaceFirst(backendUri + "/", ""); lesson.getUrl();

        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            return cloudFrontService.streamFile(lessonUri, rangeHeader);
        }

        byte[] fileBytes = cloudFrontService.getFile(lessonUri);
        String fileName = lessonUri.substring(lessonUri.lastIndexOf('/') + 1);

        MediaType mediaType = MediaTypeFactory
                .getMediaType(fileName)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);

        ByteArrayResource resource = new ByteArrayResource(fileBytes);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, fileUtils.buildInlineContentDisposition(fileName))
                .contentType(mediaType)
                .contentLength(fileBytes.length)
                .body(resource);
    }

    @Override
    public ApiResponse<LessonInfoResponse> getLessonInfo(String lessonId, String userId) {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        LessonInfoResponse response = lessonMapper.toLessonInfoResponse(lesson);

        // get note of student
        EnrollmentsEntity enrollment = enrollmentRepo.findByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));
        LessonProgressEntity lessonProgress = lessonProgressRepo
                .findFirstByLesson_IdAndEnrollment_IdOrderByUpdatedAtDesc(lessonId, enrollment.getId())
                .orElse(null);

        if (lessonProgress != null) {
            response.setNote(lessonProgress.getNote());
        }

        return ApiResponse.<LessonInfoResponse>builder()
                .message("Lấy thông tin lesson thành công !")
                .code(200)
                .result(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<MarkDoneLessonResponse> markDone(String lessonId, String userId) {
        EnrollmentsEntity enrollment = enrollmentRepo.findByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));

        LessonProgressEntity lessonProgress = lessonProgressRepo
                .findFirstByLesson_IdAndEnrollment_IdOrderByUpdatedAtDesc(lessonId, enrollment.getId())
                .orElse(null);

        if (lessonProgress == null) {
            lessonProgress = LessonProgressEntity.builder()
                    .lesson(lessonRepo.findById(lessonId).orElseThrow(
                            () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
                    ))
                    .enrollment(enrollment)
                    .progress(EnumLessonProgress.COMPLETED)
                    .build();
        } else {
            lessonProgress.setProgress(EnumLessonProgress.COMPLETED);
            final String keepProgressId = lessonProgress.getId();
            lessonProgressRepo.findAllByLesson_IdAndEnrollment_Id(lessonId, enrollment.getId()).stream()
                    .filter(lp -> !lp.getId().equals(keepProgressId))
                    .forEach(lessonProgressRepo::delete);
        }

        lessonProgressRepo.save(lessonProgress);

        // recalculate progress for enrollment
        int totalLessons = enrollment.getCourse().getChapters().stream()
                .flatMap(chapter -> chapter.getLessons().stream())
                .map(lesson -> lesson.getId())
                .toList().size();

        long completedLessons = lessonProgressRepo.findByEnrollment_Id(enrollment.getId()).stream()
                .filter(lp -> lp.getProgress() == EnumLessonProgress.COMPLETED)
                .map(lp -> lp.getLesson().getId())
                .distinct()
                .count();

        double progress = totalLessons > 0 ? (double) completedLessons / totalLessons : 0.0;
        enrollment.setProgress(progress);
        enrollmentRepo.save(enrollment);

        CertificateEligibilityTryResult tryResult = certificateEligibilityService.tryIssue(enrollment);
        boolean isCompletedCourse = tryResult.isNewlyIssued();
        Optional<CourseCompletionCertificateEntity> issuedCertificate = tryResult.getCertificate();
        Integer courseScore = issuedCertificate
                .map(CourseCompletionCertificateEntity::getCourseScore)
                .orElse(tryResult.getEligibility().getCourseScore());
        Integer courseScoreTotal = issuedCertificate
                .map(CourseCompletionCertificateEntity::getCourseScoreTotal)
                .orElse(tryResult.getEligibility().getCourseScoreTotal());

        return ApiResponse.<MarkDoneLessonResponse>builder()
                .result(
                        MarkDoneLessonResponse.builder()
                                .id(lessonId)
                                .completedCourse(isCompletedCourse)
                                .certificateId(isCompletedCourse ? issuedCertificate.map(CourseCompletionCertificateEntity::getId).orElse(null) : null)
                                .certificateCode(isCompletedCourse ? issuedCertificate.map(CourseCompletionCertificateEntity::getCertificateCode).orElse(null) : null)
                                .courseScore(isCompletedCourse ? courseScore : null)
                                .courseScoreTotal(isCompletedCourse ? courseScoreTotal : null)
                                .build()
                )
                .code(200)
                .message("Đã ghi nhận học xong bài học này !")
                .build();
    }

    @Override
    public ApiResponse<CreationResponse> makeNote(String lessonId, String userId, MakeNoteForLessonRequest request) {
        EnrollmentsEntity enrollment = enrollmentRepo.findByUserIdAndCourse_Chapters_Lessons_Id(userId, lessonId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.UNAUTHORIZED));

        LessonProgressEntity lessonProgress = lessonProgressRepo
                .findFirstByLesson_IdAndEnrollment_IdOrderByUpdatedAtDesc(lessonId, enrollment.getId())
                .orElse(null);

        if (lessonProgress == null) {
            lessonProgress = LessonProgressEntity.builder()
                    .lesson(lessonRepo.findById(lessonId).orElseThrow(
                            () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
                    ))
                    .enrollment(enrollment)
                    .progress(EnumLessonProgress.NOT_STARTED)
                    .note(request.getContent())
                    .build();
        } else
            lessonProgress.setNote(request.getContent());

        lessonProgressRepo.save(lessonProgress);

        return ApiResponse.<CreationResponse>builder()
                .result(
                        CreationResponse.builder()
                                .id(lessonId)
                                .build()
                )
                .code(200)
                .message("Lưu ghi chú thành công !")
                .build();
    }
    @Override
    public ApiResponse<String> getPresignedUrl(String lessonId, String ipAddress) {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        String objectKey = fileUtils.extractObjectKey(lesson.getUrl());
        if (objectKey == null) {
            throw new CustomExeption(ErrorCode.LESSON_NOT_FOUND);
        }

        try {
            String signedUrl = cloudFrontService.getSignedUrlWithIp(objectKey, ipAddress);
            return ApiResponse.<String>builder()
                    .code(200)
                    .message("Lấy URL thành công !")
                    .result(signedUrl)
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi tạo signed URL cho lesson {}: {}", lessonId, e.getMessage());
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public ApiResponse<String> getPresignedUrlNoIp(String lessonId) {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        String objectKey = fileUtils.extractObjectKey(lesson.getUrl());
        if (objectKey == null) {
            throw new CustomExeption(ErrorCode.LESSON_NOT_FOUND);
        }

        try {
            // Use standard signed URL (Canned Policy) without IP restriction
            String signedUrl = cloudFrontService.getSignedUrl(objectKey);
            return ApiResponse.<String>builder()
                    .code(200)
                    .message("Lấy URL thành công (No IP) !")
                    .result(signedUrl)
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi tạo signed URL (No IP) cho lesson {}: {}", lessonId, e.getMessage());
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public ApiResponse<CloudFrontCookieResponse> getPresignedCookies(String lessonId, String ipAddress) {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        String objectKey = fileUtils.extractObjectKey(lesson.getUrl());
        if (objectKey == null) {
            throw new CustomExeption(ErrorCode.LESSON_NOT_FOUND);
        }

        try {
            CloudFrontCookieResponse cookies;
            // Senior Logic: If IP is internal or not provided, use Canned Policy (No IP)
            if (ipAddress == null || ipAddress.startsWith("127.") || ipAddress.startsWith("172.") || ipAddress.startsWith("192.168.")) {
                cookies = cloudFrontService.getSignedCookies(objectKey);
            } else {
                cookies = cloudFrontService.getSignedCookiesWithIp(objectKey, ipAddress);
            }

            return ApiResponse.<CloudFrontCookieResponse>builder()
                    .code(200)
                    .message("Lấy Cookie thành công !")
                    .result(cookies)
                    .build();
        } catch (Exception e) {
            log.error("Lỗi khi tạo signed cookies cho lesson {}: {}", lessonId, e.getMessage());
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public ApiResponse<String> getMediaUrl(String lessonId) {
        LessonEntity lesson = lessonRepo.findById(lessonId).orElseThrow(
                () -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND)
        );

        String objectKey = fileUtils.extractObjectKey(lesson.getUrl());
        if (objectKey == null) {
            throw new CustomExeption(ErrorCode.LESSON_NOT_FOUND);
        }

        try {
            String signedUrl = cloudFrontService.getSignedUrl(objectKey);
            String mediaUrl = rewriteSignedUrlToMediaGateway(signedUrl, lessonId);
            return ApiResponse.<String>builder()
                    .code(200)
                    .message("Lấy URL media thành công !")
                    .result(mediaUrl)
                    .build();
        } catch (Exception exception) {
            log.error("Lỗi khi tạo media URL cho lesson {}: {}", lessonId, exception.getMessage());
            throw new CustomExeption(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public String createLessonAccessCookie(String lessonId, String userId) {
        canViewLesson(lessonId, userId);

        LessonEntity lesson = lessonRepo.findById(lessonId)
                .orElseThrow(() -> new CustomExeption(ErrorCode.LESSON_NOT_FOUND));
        String objectKey = fileUtils.extractObjectKey(lesson.getUrl());
        if (objectKey == null) {
            throw new CustomExeption(ErrorCode.LESSON_NOT_FOUND);
        }

        return jwtLessonAccessTokenProvider.generate(userId, lessonId, objectKey);
    }

    @Override
    public String verifyLessonMediaAccess(String cookieToken, String originalUri) {
        if (originalUri == null || originalUri.isBlank()) {
            throw new LessonMediaAccessException(HttpStatus.UNAUTHORIZED);
        }

        Matcher matcher = MEDIA_LESSON_URI_PATTERN.matcher(originalUri);
        if (!matcher.find()) {
            throw new LessonMediaAccessException(HttpStatus.UNAUTHORIZED);
        }

        String lessonIdFromUri = matcher.group(1);
        if (cookieToken == null || cookieToken.isBlank()) {
            throw new LessonMediaAccessException(HttpStatus.UNAUTHORIZED);
        }

        try {
            return jwtLessonAccessTokenProvider.verifyMediaAccess(cookieToken, lessonIdFromUri);
        } catch (CustomExeption exception) {
            throw new LessonMediaAccessException(HttpStatus.UNAUTHORIZED);
        }
    }

    private String rewriteSignedUrlToMediaGateway(String signedUrl, String lessonId) throws Exception {
        URI uri = URI.create(signedUrl);
        String query = uri.getRawQuery();

        String base = trimTrailingSlash(lessonMediaProperties.getPublicBaseUrl());
        String pathPrefix = trimTrailingSlash(lessonMediaProperties.getMediaPathPrefix());
        StringBuilder rewritten = new StringBuilder(base)
                .append(pathPrefix)
                .append('/')
                .append(lessonId);

        if (query != null && !query.isBlank()) {
            rewritten.append('?').append(query);
        }

        return rewritten.toString();
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
